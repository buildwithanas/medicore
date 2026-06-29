/**
 * config/db.seed.js
 * Seeds the database with realistic sample data.
 * Run after db.setup.js:
 *   node config/db.seed.js
 */

const mysql    = require('mysql2/promise');
const bcrypt   = require('bcryptjs');
require('dotenv').config();

async function seed() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT) || 3306,
      database: process.env.DB_NAME     || 'medicore_hms',
      user:     process.env.DB_USER     || 'root',
      password: process.env.DB_PASSWORD || '',
      charset:  'utf8mb4',
    });

    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    console.log('\n🌱  Seeding database…\n');

    // ── USERS ─────────────────────────────────────────────────
    const users = [
      { id: 'u001', name: 'Dr. Anas Okonkwo',    email: 'anas@medicore.ng',      role: 'doctor',    department: 'Oncology',      qualification: 'MBBS, FMCP',  phone: '+234801234567' },
      { id: 'u002', name: 'Dr. Kweku Osei',       email: 'osei@medicore.ng',      role: 'doctor',    department: 'Cardiology',    qualification: 'MBBS, FACC',  phone: '+234802345678' },
      { id: 'u003', name: 'Dr. Emeka Balogun',    email: 'balogun@medicore.ng',   role: 'doctor',    department: 'Neurology',     qualification: 'MBBS, FWACP', phone: '+234803456789' },
      { id: 'u004', name: 'Dr. Kofi Mensah',      email: 'mensah@medicore.ng',    role: 'doctor',    department: 'Orthopaedics',  qualification: 'MBBS, FWACS', phone: '+234804567890' },
      { id: 'u005', name: 'Admin User',           email: 'admin@medicore.ng',     role: 'admin',     department: 'Administration',qualification: 'MBA Health',  phone: '+234805678901' },
      { id: 'u006', name: 'Nurse Amara Diallo',   email: 'amara@medicore.ng',     role: 'nurse',     department: 'General',       qualification: 'BNSc',        phone: '+234806789012' },
    ];

    const defaultPwd = await bcrypt.hash('Admin@12345', rounds);
    for (const u of users) {
      await conn.query(`
        INSERT IGNORE INTO users (id, name, email, password_hash, role, department, qualification, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [u.id, u.name, u.email, defaultPwd, u.role, u.department, u.qualification, u.phone]
      );
    }
    console.log(`  ✔  ${users.length} users seeded`);
    console.log('     Default password for ALL accounts: Admin@12345');

    // ── WARDS ─────────────────────────────────────────────────
    const wards = [
      ['w001','General Ward A',60,'General','Ground Floor'],
      ['w002','ICU / Critical Care',20,'ICU','1st Floor'],
      ['w003','Maternity Ward',30,'Maternity','2nd Floor'],
      ['w004','Paediatrics',25,'Paediatrics','2nd Floor'],
      ['w005','Orthopaedics',20,'Orthopaedics','3rd Floor'],
      ['w006','Cardiology',18,'Cardiology','3rd Floor'],
      ['w007','Neurology',15,'Neurology','4th Floor'],
    ];
    for (const [id, name, capacity, department, floor] of wards) {
      await conn.query(`INSERT IGNORE INTO wards (id, name, capacity, department, floor) VALUES (?,?,?,?,?)`,
        [id, name, capacity, department, floor]);
    }
    console.log(`  ✔  ${wards.length} wards seeded`);

    // ── PATIENTS ──────────────────────────────────────────────
    const today = new Date().toISOString().split('T')[0];
    const patients = [
      ['p001','P-1001','Fatima','Al-Hassan','1990-03-14','Female','A+','AA','Married','Nigerian','Islam','Teacher','+234801234001','fatima@email.com','12 Adeola St, Lagos','General Ward A','Cardiology','u002',today,'admitted','Penicillin','Hypertension','Chest pain and breathlessness','Ibrahim Al-Hassan','Spouse','+234801234099'],
      ['p002','P-1002','Chidi','Nwachukwu','1972-07-22','Male','O+','AS','Married','Nigerian','Christianity','Engineer','+234802345002','chidi@email.com','5 Broad St, Lagos','Neurology','Neurology','u003',today,'admitted','None','Type 2 Diabetes','Post-stroke follow-up','Adaeze Nwachukwu','Spouse','+234802345099'],
      ['p003','P-1003','Amara','Diallo','1996-11-05','Female','B-','AA','Single','Ghanaian','Christianity','Nurse','+234803456003','amara@email.com','3 Marina Rd, Lagos','Oncology','Oncology','u001',today,'outpatient','None','Stage II Breast Cancer','Chemotherapy session 3','Kwame Diallo','Father','+234803456099'],
      ['p004','P-1004','Samuel','Taiwo','1983-01-30','Male','AB+','AS','Married','Nigerian','Christianity','Businessman','+234804567004','samuel@email.com','22 Bode Thomas, Lagos','Orthopaedics','Orthopaedics','u004',today,'admitted','Ibuprofen','Osteoarthritis','Severe knee pain','Ngozi Taiwo','Spouse','+234804567099'],
      ['p005','P-1005','Grace','Adeyemi','1964-09-18','Female','A-','AA','Widowed','Nigerian','Christianity','Teacher (Retired)','+234805678005','grace@email.com','7 Allen Ave, Ikeja','General Ward A','General','u001','2026-05-10','discharged','None','Type 2 Diabetes, Hypertension','Routine diabetes check','Femi Adeyemi','Son','+234805678099'],
      ['p006','P-1006','Kwame','Asante','2007-04-12','Male','O-','AS','Single','Ghanaian','Christianity','Student','+234806789006','','10 Victoria Island Rd, Lagos','Emergency','Emergency','u002',today,'emergency','None','None','High fever and convulsions','Kofi Asante','Father','+234806789099'],
      ['p007','P-1007','Ngozi','Okafor','1997-06-25','Female','B+','AA','Married','Nigerian','Christianity','Accountant','+234807890007','ngozi@email.com','34 Ozumba Mbadiwe, VI','Maternity Ward','Maternity','u001',today,'admitted','None','Gestational Hypertension','Antenatal visit — 32 weeks','Chukwuemeka Okafor','Spouse','+234807890099'],
      ['p008','P-1008','Tunde','Fashola','1968-12-03','Male','A+','AA','Married','Nigerian','Islam','Civil Servant','+234808901008','tunde@email.com','15 Herbert Macaulay Way, Yaba','Orthopaedics','Orthopaedics','u004',today,'outpatient','Aspirin','Rotator Cuff Tear','Post-MRI review','Kemi Fashola','Spouse','+234808901099'],
      ['p009','P-1009','Akosua','Mensah','1993-08-17','Female','O+','AS','Single','Ghanaian','Christianity','Pharmacist','+234809012009','akosua@email.com','6 Apapa Rd, Lagos','Paediatrics','Paediatrics','u001',today,'admitted','Sulfonamides','None','High fever in child (proxy)','Kweku Mensah','Brother','+234809012099'],
      ['p010','P-1010','Musa','Garba','1962-02-28','Male','AB-','SS','Married','Nigerian','Islam','Retired Military','+234810123010','musa@email.com','2 Lugard Ave, Ikoyi','ICU / Critical Care','Neurology','u003',today,'emergency','Warfarin','Sickle Cell, Hypertension','Cerebral ischaemia','Halima Garba','Spouse','+234810123099'],
    ];

    for (const p of patients) {
      await conn.query(`
        INSERT IGNORE INTO patients
          (id,patient_number,first_name,last_name,date_of_birth,sex,blood_group,genotype,marital_status,nationality,religion,occupation,phone,email,address,ward,department,assigned_doctor,admission_date,status,allergies,conditions,complaint,nok_name,nok_relationship,nok_phone,created_by)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [...p, 'u001']
      );
    }
    console.log(`  ✔  ${patients.length} patients seeded`);

    // ── APPOINTMENTS ──────────────────────────────────────────
    const appointments = [
      ['a001','APT-001','p001','u002','Cardiology',today,'08:00:00','Consultation','confirmed','Regular cardiac check'],
      ['a002','APT-002','p002','u003','Neurology',today,'09:15:00','Follow-up','inprogress','Post-stroke review'],
      ['a003','APT-003','p003','u001','Oncology',today,'10:30:00','Procedure','confirmed','Chemo session 3'],
      ['a004','APT-004','p004','u004','Orthopaedics',today,'11:00:00','Consultation','pending','Knee evaluation'],
      ['a005','APT-005','p005','u001','General',today,'11:45:00','Follow-up','confirmed','Diabetes management'],
      ['a006','APT-006','p006','u002','Cardiology',today,'13:00:00','Emergency','cancelled','Patient rescheduled'],
      ['a007','APT-007','p007','u001','Maternity',today,'14:00:00','Consultation','confirmed','Antenatal visit'],
      ['a008','APT-008','p008','u004','Orthopaedics',today,'14:45:00','Follow-up','pending','Post-MRI review'],
      ['a009','APT-009','p009','u001','Paediatrics',today,'15:30:00','Consultation','completed','Fever assessment'],
      ['a010','APT-010','p010','u003','Neurology',today,'16:00:00','Follow-up','confirmed','Neuro assessment'],
    ];

    for (const a of appointments) {
      await conn.query(`
        INSERT IGNORE INTO appointments
          (id,appt_number,patient_id,doctor_id,department,appt_date,appt_time,type,status,notes,created_by)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [...a, 'u001']
      );
    }
    console.log(`  ✔  ${appointments.length} appointments seeded`);

    // ── MEDICAL RECORDS ───────────────────────────────────────
    const records = [
      ['r001','REC-001','p001','u002','Prescription','Amlodipine 5mg','Amlodipine 5mg — once daily for hypertension. Review in 4 weeks.','Active'],
      ['r002','REC-002','p002','u003','Lab Result','Full Blood Count','Haemoglobin 11.2 g/dL (Low). WBC 7.2 x10⁹/L (Normal). Platelets 210 (Normal).','Completed'],
      ['r003','REC-003','p003','u001','Diagnosis','Stage II Breast Cancer','Commenced chemotherapy protocol — AC-T regimen. Session 3 of 8.','Active'],
      ['r004','REC-004','p004','u004','Imaging','X-Ray Left Knee','Grade 3 osteoarthritis confirmed. Joint space narrowing evident. Recommend physiotherapy.','Completed'],
      ['r005','REC-005','p005','u001','Prescription','Metformin 500mg','Metformin 500mg twice daily with meals. Dietary review recommended.','Active'],
      ['r006','REC-006','p006','u002','Lab Result','Malaria RDT','Plasmodium falciparum Positive. Commenced Artemether-Lumefantrine treatment.','Active'],
      ['r007','REC-007','p007','u001','Diagnosis','Gestational Hypertension','BP monitoring protocol started. Labetalol 100mg BD prescribed. Weekly review.','Active'],
      ['r008','REC-008','p008','u004','Imaging','MRI Right Shoulder','Rotator cuff partial tear confirmed. Conservative management — physiotherapy 3x/week.','Completed'],
      ['r009','REC-009','p009','u001','Prescription','Amoxicillin Suspension','Amoxicillin 250mg/5ml — 5ml three times daily for 5 days.','Active'],
      ['r010','REC-010','p010','u003','Lab Result','CT Angiography','Cerebral ischaemia confirmed — left MCA territory. Anticoagulation commenced.','Completed'],
    ];

    for (const r of records) {
      await conn.query(`
        INSERT IGNORE INTO medical_records
          (id,record_number,patient_id,doctor_id,type,title,description,status)
        VALUES (?,?,?,?,?,?,?,?)`,
        r
      );
    }
    console.log(`  ✔  ${records.length} medical records seeded`);

    console.log('\n✅  Database seeded successfully!\n');
    console.log('🔑  Login credentials (all accounts):');
    console.log('    Email:    anas@medicore.ng  (doctor)');
    console.log('    Email:    admin@medicore.ng  (admin)');
    console.log('    Password: Admin@12345\n');

  } catch (err) {
    console.error('\n❌  Seeding failed:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

seed();