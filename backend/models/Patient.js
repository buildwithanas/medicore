/**
 * models/Patient.js
 * Static model class — clean query helpers for the patients table.
 * Used by patientController.js.
 */

const db = require('../config/db');

class Patient {
  /**
   * Find a patient by ID or patient_number
   */
  static async findById(id) {
    const [rows] = await db.query(
      `SELECT p.*, CONCAT(u.name) AS assigned_doctor_name
       FROM patients p
       LEFT JOIN users u ON p.assigned_doctor = u.id
       WHERE p.id = ? OR p.patient_number = ?`,
      [id, id]
    );
    return rows[0] || null;
  }

  /**
   * Count all patients matching optional filters
   */
  static async count(filters = {}) {
    let where = 'WHERE 1=1';
    const params = [];
    if (filters.status)     { where += ' AND status = ?';     params.push(filters.status); }
    if (filters.department) { where += ' AND department = ?'; params.push(filters.department); }
    const [[{ n }]] = await db.query(`SELECT COUNT(*) AS n FROM patients ${where}`, params);
    return n;
  }

  /**
   * Get counts per status — for dashboard badges
   */
  static async statusCounts() {
    const [rows] = await db.query(`
      SELECT status, COUNT(*) AS n
      FROM patients
      GROUP BY status`);
    const counts = { admitted: 0, outpatient: 0, discharged: 0, emergency: 0 };
    rows.forEach(r => { counts[r.status] = r.n; });
    counts.total = Object.values(counts).reduce((a, b) => a + b, 0);
    return counts;
  }

  /**
   * Search patients by name, number, or phone
   */
  static async search(query, limit = 10) {
    const q = `%${query}%`;
    const [rows] = await db.query(
      `SELECT id, patient_number, first_name, last_name, phone, status, department
       FROM patients
       WHERE first_name LIKE ? OR last_name LIKE ? OR patient_number LIKE ? OR phone LIKE ?
       LIMIT ?`,
      [q, q, q, q, limit]
    );
    return rows;
  }

  /**
   * Get today's new admissions
   */
  static async todayAdmissions() {
    const today = new Date().toISOString().split('T')[0];
    const [rows] = await db.query(
      `SELECT id, patient_number, first_name, last_name, ward, status, created_at
       FROM patients WHERE DATE(created_at) = ?
       ORDER BY created_at DESC`,
      [today]
    );
    return rows;
  }
}

module.exports = Patient;