/**
 * models/Record.js
 */

const db = require('../config/db');

class Record {
  static async findById(id) {
    const [rows] = await db.query(
      `SELECT r.*,
         CONCAT(p.first_name,' ',p.last_name) AS patient_name, p.patient_number,
         u.name AS doctor_name
       FROM medical_records r
       JOIN patients p ON r.patient_id = p.id
       JOIN users    u ON r.doctor_id  = u.id
       WHERE r.id = ? OR r.record_number = ?`,
      [id, id]
    );
    return rows[0] || null;
  }

  static async getByPatient(patientId) {
    const [rows] = await db.query(
      `SELECT id, record_number, type, title, status, record_date, u.name AS doctor_name
       FROM medical_records r
       JOIN users u ON r.doctor_id = u.id
       WHERE patient_id = ?
       ORDER BY record_date DESC`,
      [patientId]
    );
    return rows;
  }

  static async countByType() {
    const [rows] = await db.query(
      'SELECT type, COUNT(*) AS n FROM medical_records GROUP BY type'
    );
    const counts = {};
    rows.forEach(r => { counts[r.type] = r.n; });
    return counts;
  }
}

module.exports = Record;