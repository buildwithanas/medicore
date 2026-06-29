/**
 * config/db.setup.js
 * Run once to create all database tables:
 *   node config/db.setup.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function setup() {
  let conn;
  try {
    // Connect without specifying a database so we can create it
    conn = await mysql.createConnection({
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT) || 3306,
      user:     process.env.DB_USER     || 'root',
      password: process.env.DB_PASSWORD || '',
      charset:  'utf8mb4',
    });

    const DB = process.env.DB_NAME || 'medicore_hms';
    console.log(`\n🔧  Setting up database: ${DB}\n`);

    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conn.query(`USE \`${DB}\``);

    // ── USERS (staff accounts) ────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
        name          VARCHAR(100) NOT NULL,
        email         VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role          ENUM('doctor','nurse','admin','pharmacist','lab_tech') NOT NULL DEFAULT 'doctor',
        department    VARCHAR(100),
        qualification VARCHAR(200),
        phone         VARCHAR(30),
        bio           TEXT,
        avatar_url    VARCHAR(500),
        is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
        last_login    DATETIME,
        created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email  (email),
        INDEX idx_role   (role),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  ✔  users');

    // ── REFRESH TOKENS ────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id         VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
        user_id    VARCHAR(36)  NOT NULL,
        token_hash VARCHAR(255) NOT NULL UNIQUE,
        expires_at DATETIME     NOT NULL,
        created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user   (user_id),
        INDEX idx_expiry (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('  ✔  refresh_tokens');

    // ── PATIENTS ──────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id              VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
        patient_number  VARCHAR(20)  NOT NULL UNIQUE,
        first_name      VARCHAR(80)  NOT NULL,
        last_name       VARCHAR(80)  NOT NULL,
        date_of_birth   DATE         NOT NULL,
        sex             ENUM('Male','Female','Other') NOT NULL,
        blood_group     ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-'),
        genotype        ENUM('AA','AS','SS','AC'),
        marital_status  ENUM('Single','Married','Divorced','Widowed'),
        nationality     VARCHAR(60),
        religion        VARCHAR(60),
        occupation      VARCHAR(100),
        phone           VARCHAR(30),
        email           VARCHAR(150),
        address         TEXT,
        ward            VARCHAR(100),
        department      VARCHAR(100),
        assigned_doctor VARCHAR(36),
        admission_date  DATE,
        status          ENUM('admitted','outpatient','discharged','emergency') NOT NULL DEFAULT 'outpatient',
        allergies       TEXT,
        conditions      TEXT,
        complaint       TEXT,
        nok_name        VARCHAR(150),
        nok_relationship VARCHAR(60),
        nok_phone       VARCHAR(30),
        nok_email       VARCHAR(150),
        notes           TEXT,
        created_by      VARCHAR(36),
        created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_number   (patient_number),
        INDEX idx_status   (status),
        INDEX idx_ward     (ward),
        INDEX idx_dept     (department),
        INDEX idx_name     (last_name, first_name),
        FOREIGN KEY (assigned_doctor) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by)      REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  ✔  patients');

    // ── APPOINTMENTS ──────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id           VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
        appt_number  VARCHAR(20)  NOT NULL UNIQUE,
        patient_id   VARCHAR(36)  NOT NULL,
        doctor_id    VARCHAR(36)  NOT NULL,
        department   VARCHAR(100),
        appt_date    DATE         NOT NULL,
        appt_time    TIME         NOT NULL,
        duration_min INT          NOT NULL DEFAULT 30,
        type         ENUM('Consultation','Follow-up','Procedure','Lab Test','Emergency','Other') NOT NULL DEFAULT 'Consultation',
        status       ENUM('pending','confirmed','inprogress','completed','cancelled') NOT NULL DEFAULT 'pending',
        notes        TEXT,
        created_by   VARCHAR(36),
        created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id)  REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id)   REFERENCES users(id)    ON DELETE CASCADE,
        FOREIGN KEY (created_by)  REFERENCES users(id)    ON DELETE SET NULL,
        INDEX idx_date    (appt_date),
        INDEX idx_patient (patient_id),
        INDEX idx_doctor  (doctor_id),
        INDEX idx_status  (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  ✔  appointments');

    // ── MEDICAL RECORDS ───────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS medical_records (
        id            VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
        record_number VARCHAR(20)  NOT NULL UNIQUE,
        patient_id    VARCHAR(36)  NOT NULL,
        doctor_id     VARCHAR(36)  NOT NULL,
        type          ENUM('Prescription','Lab Result','Diagnosis','Imaging','Note','Discharge Summary') NOT NULL,
        title         VARCHAR(255) NOT NULL,
        description   TEXT         NOT NULL,
        status        ENUM('Active','Completed','Pending','Cancelled') NOT NULL DEFAULT 'Active',
        file_url      VARCHAR(500),
        record_date   DATE         NOT NULL DEFAULT (CURRENT_DATE),
        created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id)  REFERENCES users(id)    ON DELETE CASCADE,
        INDEX idx_patient (patient_id),
        INDEX idx_type    (type),
        INDEX idx_status  (status),
        INDEX idx_date    (record_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  ✔  medical_records');

    // ── WARD BEDS ─────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS wards (
        id         VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
        name       VARCHAR(100) NOT NULL UNIQUE,
        capacity   INT          NOT NULL DEFAULT 20,
        department VARCHAR(100),
        floor      VARCHAR(20),
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('  ✔  wards');

    // ── AUDIT LOG ─────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id         VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
        user_id    VARCHAR(36),
        action     VARCHAR(100) NOT NULL,
        table_name VARCHAR(60),
        record_id  VARCHAR(36),
        details    JSON,
        ip_address VARCHAR(45),
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user   (user_id),
        INDEX idx_action (action),
        INDEX idx_date   (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('  ✔  audit_log');

    console.log('\n✅  All tables created successfully!\n');
    console.log('👉  Next: run  node config/db.seed.js  to insert sample data\n');

  } catch (err) {
    console.error('\n❌  Setup failed:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

setup();