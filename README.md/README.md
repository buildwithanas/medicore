# 🏥 MediCore HMS — Hospital Management System

A full-stack Hospital Management System built with vanilla HTML/CSS/JS (frontend) and Node.js/Express/MySQL (backend).

---

## 📁 Project Structure

```
Medicore/
├── frontend/
│   ├── index.html              ← Login page
│   ├── pages/
│   │   ├── dashboard.html
│   │   ├── patients.html
│   │   ├── add-patient.html
│   │   ├── records.html
│   │   ├── appointments.html
│   │   ├── doctors.html
│   │   └── settings.html
│   ├── css/
│   │   └── main.css
│   ├── js/
│   │   ├── api.js              ← All API calls
│   │   ├── auth.js             ← Session management
│   │   └── app.js              ← Shared utilities
│   └── assets/
│       ├── images/
│       └── icons/
│
├── backend/
│   ├── server.js               ← Express app entry point
│   ├── config/
│   │   ├── db.js               ← MySQL connection pool
│   │   ├── db.setup.js         ← Creates all tables
│   │   └── db.seed.js          ← Inserts sample data
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── recordRoutes.js
│   │   └── dashboardRoutes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── patientController.js
│   │   ├── appointmentController.js
│   │   ├── doctorController.js
│   │   ├── recordController.js
│   │   └── dashboardController.js
│   ├── models/
│   │   ├── Patient.js
│   │   ├── Doctor.js
│   │   ├── Appointment.js
│   │   ├── Record.js
│   │   └── User.js
│   ├── middleware/
│   │   ├── auth.js             ← JWT verify + protect
│   │   └── roles.js            ← Role-based access
│   ├── uploads/
│   │   ├── patient-photos/
│   │   └── lab-docs/
│   └── package.json
│
├── database/
│   └── hospital.sql            ← Full schema + seed SQL
│
└── README.md
```

---

## ⚙️ Requirements

| Tool    | Version  |
|---------|----------|
| Node.js | ≥ 18.0   |
| MySQL   | ≥ 8.0    |
| XAMPP   | Any (for local MySQL) |
| VS Code | Any      |

---

## 🚀 Setup — Step by Step

### 1. Install Node.js
Download from https://nodejs.org and install.
Verify: `node -v` and `npm -v`

### 2. Start MySQL (XAMPP)
Open XAMPP Control Panel → Start **Apache** and **MySQL**.

### 3. Clone / Open the project in VS Code
```
File → Open Folder → select the Medicore folder
```

### 4. Install backend dependencies
```bash
cd backend
npm install
```

### 5. Create your environment file
```bash
# In the backend folder:
cp .env.example .env
```
Open `.env` and set your values:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=medicore_hms
DB_USER=root
DB_PASSWORD=          ← leave empty if XAMPP default
JWT_SECRET=your_long_random_secret_here
CORS_ORIGIN=http://localhost:5500
```

### 6. Create database tables
```bash
node config/db.setup.js
```
Expected output:
```
✅  All tables created successfully!
```

### 7. Seed sample data
```bash
node config/db.seed.js
```
Expected output:
```
✅  Database seeded successfully!
🔑  Login: anas@medicore.ng / Admin@12345
```

### 8. Start the backend server
```bash
# Production:
npm start

# Development (auto-restart on file changes):
npm run dev
```
Server runs at: **http://localhost:3000**
Health check: **http://localhost:3000/api/health**

### 9. Open the frontend
Install the **Live Server** extension in VS Code, then:
- Right-click `frontend/index.html` → **Open with Live Server**
- Or navigate to: `http://localhost:5500/frontend/index.html`

---

## 🔑 Default Login Accounts

| Name              | Email               | Password     | Role   |
|-------------------|---------------------|--------------|--------|
| Dr. Anas Okonkwo  | anas@medicore.ng    | Admin@12345  | Doctor |
| Dr. Kweku Osei    | osei@medicore.ng    | Admin@12345  | Doctor |
| Admin User        | admin@medicore.ng   | Admin@12345  | Admin  |
| Nurse Amara Diallo| amara@medicore.ng   | Admin@12345  | Nurse  |

> ⚠️ Change all passwords immediately in production.

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint                    | Description          |
|--------|-----------------------------|----------------------|
| POST   | /api/auth/login             | Login                |
| POST   | /api/auth/logout            | Logout               |
| POST   | /api/auth/refresh           | Refresh token        |
| GET    | /api/auth/me                | Get my profile       |
| PUT    | /api/auth/me                | Update profile       |
| PUT    | /api/auth/change-password   | Change password      |

### Patients
| Method | Endpoint                    | Description          |
|--------|-----------------------------|----------------------|
| GET    | /api/patients               | List + search        |
| GET    | /api/patients/stats         | Status counts        |
| GET    | /api/patients/:id           | Single patient       |
| POST   | /api/patients               | Create patient       |
| PUT    | /api/patients/:id           | Update patient       |
| DELETE | /api/patients/:id           | Delete (admin)       |

### Appointments
| Method | Endpoint                        | Description         |
|--------|---------------------------------|---------------------|
| GET    | /api/appointments               | List                |
| GET    | /api/appointments/today         | Today's list        |
| GET    | /api/appointments/calendar      | Calendar view data  |
| GET    | /api/appointments/:id           | Single              |
| POST   | /api/appointments               | Book                |
| PUT    | /api/appointments/:id           | Update / status     |
| DELETE | /api/appointments/:id           | Delete              |

### Medical Records
| Method | Endpoint                        | Description         |
|--------|---------------------------------|---------------------|
| GET    | /api/records                    | List                |
| GET    | /api/records/type/:type         | By type             |
| GET    | /api/records/:id                | Single              |
| POST   | /api/records                    | Create              |
| PUT    | /api/records/:id                | Update              |
| DELETE | /api/records/:id                | Delete              |

### Doctors
| Method | Endpoint                    | Description          |
|--------|-----------------------------|----------------------|
| GET    | /api/doctors                | List                 |
| GET    | /api/doctors/:id            | Single + schedule    |
| POST   | /api/doctors                | Create (admin)       |
| PUT    | /api/doctors/:id            | Update               |
| DELETE | /api/doctors/:id            | Deactivate (admin)   |

### Dashboard
| Method | Endpoint                    | Description          |
|--------|-----------------------------|----------------------|
| GET    | /api/dashboard/stats        | Headline numbers     |
| GET    | /api/dashboard/chart        | Admissions chart     |
| GET    | /api/dashboard/wards        | Ward occupancy       |
| GET    | /api/dashboard/alerts       | Recent alerts        |

---

## 🔧 Common Issues

**MySQL won't connect**
- Make sure XAMPP MySQL is running
- Check DB_USER and DB_PASSWORD in `.env`
- Try connecting via phpMyAdmin first

**CORS error in browser**
- Make sure `CORS_ORIGIN` in `.env` matches your frontend URL exactly
- Example: `CORS_ORIGIN=http://localhost:5500`

**Port 3000 already in use**
- Change `PORT=3001` in `.env`
- Update `BASE_URL` in `frontend/js/api.js` to match

**Login not redirecting**
- Open browser DevTools → Console → check for errors
- Make sure backend is running before testing login

---

## 📦 Tech Stack

**Frontend:** HTML5, CSS3, Vanilla JavaScript (no framework)

**Backend:** Node.js, Express.js, MySQL2, bcryptjs, jsonwebtoken, helmet, cors, express-validator, morgan

**Database:** MySQL 8+ (via XAMPP for local development)

---

## 👨‍💻 Developer Notes

- All API responses follow `{ success: true/false, data/message, pagination? }`
- JWT access tokens expire in 8 hours; refresh tokens last 7 days
- Role hierarchy: `admin > doctor > nurse > lab_tech > pharmacist`
- Audit log records every create, update, delete, and login event
- The `uploads/` folder stores patient photos and lab documents

---

*MediCore HMS v1.0.0 — Built with ❤️*