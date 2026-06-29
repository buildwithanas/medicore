/**
 * models/Doctor.js
 */

const db = require('../config/db');

class Doctor {
  static async findById(id) {
    const [rows] = await db.query(
      `SELECT id, name, email, role, department, qualification, phone, bio, last_login, is_active, created_at
       FROM users WHERE id = ? AND role IN ('doctor','nurse','lab_tech','pharmacist')`,
      [id]
    );
    return rows[0] || null;
  }

  static async getTodaySchedule(doctorId) {
    const today = new Date().toISOString().split('T')[0];
    const [rows] = await db.query(
      `SELECT a.id, a.appt_time, a.type, a.status,
         CONCAT(p.first_name,' ',p.last_name) AS patient_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       WHERE a.doctor_id = ? AND a.appt_date = ?
       ORDER BY a.appt_time`,
      [doctorId, today]
    );
    return rows;
  }

  static async getPatientCount(doctorId) {
    const [[{ n }]] = await db.query(
      'SELECT COUNT(*) AS n FROM patients WHERE assigned_doctor = ?',
      [doctorId]
    );
    return n;
  }
}

module.exports = Doctor;