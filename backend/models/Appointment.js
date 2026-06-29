/**
 * models/Appointment.js
 */

const db = require('../config/db');

class Appointment {
  static async findById(id) {
    const [rows] = await db.query(
      `SELECT a.*,
         CONCAT(p.first_name,' ',p.last_name) AS patient_name, p.patient_number,
         u.name AS doctor_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN users    u ON a.doctor_id  = u.id
       WHERE a.id = ? OR a.appt_number = ?`,
      [id, id]
    );
    return rows[0] || null;
  }

  static async getByDate(date) {
    const [rows] = await db.query(
      `SELECT a.id, a.appt_time, a.type, a.status, a.department,
         CONCAT(p.first_name,' ',p.last_name) AS patient_name,
         u.name AS doctor_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN users    u ON a.doctor_id  = u.id
       WHERE a.appt_date = ?
       ORDER BY a.appt_time ASC`,
      [date]
    );
    return rows;
  }

  static async updateStatus(id, status) {
    await db.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
  }

  static async hasClash(doctorId, date, time, excludeId = null) {
    let sql = "SELECT id FROM appointments WHERE doctor_id=? AND appt_date=? AND appt_time=? AND status!='cancelled'";
    const params = [doctorId, date, time];
    if (excludeId) { sql += ' AND id != ?'; params.push(excludeId); }
    const [rows] = await db.query(sql, params);
    return rows.length > 0;
  }
}

module.exports = Appointment;