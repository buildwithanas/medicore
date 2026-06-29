/**
 * models/User.js
 * Static model class for the users table (staff accounts).
 */

const db     = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async findByEmail(email) {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ? AND is_active = 1',
      [email.toLowerCase().trim()]
    );
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await db.query(
      'SELECT id, name, email, role, department, qualification, phone, bio, avatar_url, last_login, is_active, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async verifyPassword(plainPassword, hash) {
    return bcrypt.compare(plainPassword, hash);
  }

  static async hashPassword(plain) {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    return bcrypt.hash(plain, rounds);
  }

  static async updateLastLogin(id) {
    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [id]);
  }

  static async getAllDoctors() {
    const [rows] = await db.query(
      "SELECT id, name, email, department, qualification FROM users WHERE role IN ('doctor','nurse') AND is_active = 1 ORDER BY name"
    );
    return rows;
  }
}

module.exports = User;