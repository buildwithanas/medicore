/**
 * utils/helpers.js
 * Shared utility functions used across controllers.
 */

const jwt = require('jsonwebtoken');
const db  = require('../config/db');

/**
 * Sign an access JWT (short-lived)
 */
const signAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });

/**
 * Sign a refresh JWT (long-lived)
 */
const signRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

/**
 * Generate a sequential-style ID like P-1001, APT-001, REC-001
 * @param {string} prefix   - e.g. 'P', 'APT', 'REC'
 * @param {string} table    - DB table to count from
 * @param {string} col      - column holding the number, e.g. 'patient_number'
 */
const generateNumber = async (prefix, table, col) => {
  const [rows] = await db.query(`SELECT COUNT(*) AS cnt FROM \`${table}\``);
  const next = rows[0].cnt + 1;
  return `${prefix}-${String(next).padStart(4, '0')}`;
};

/**
 * Write to audit log
 */
const audit = async (userId, action, tableName, recordId, details, ip) => {
  try {
    await db.query(
      `INSERT INTO audit_log (user_id, action, table_name, record_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId || null, action, tableName || null, recordId || null,
       details ? JSON.stringify(details) : null, ip || null]
    );
  } catch (_) { /* non-critical — don't crash main request */ }
};

/**
 * Pagination helper
 * @returns {{ limit, offset, page }}
 */
const getPagination = (query) => {
  const page   = Math.max(1, parseInt(query.page)  || 1);
  const limit  = Math.min(100, parseInt(query.limit) || 20);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

/**
 * Build a paginated response envelope
 */
const paginate = (data, total, page, limit) => ({
  data,
  pagination: {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  },
});

module.exports = { signAccessToken, signRefreshToken, generateNumber, audit, getPagination, paginate };