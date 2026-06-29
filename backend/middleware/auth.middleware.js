/**
 * middleware/auth.middleware.js
 * Verifies JWT on every protected route.
 * Usage:
 *   router.get('/route', protect, handler)
 *   router.delete('/route', protect, restrictTo('admin'), handler)
 */

const jwt  = require('jsonwebtoken');
const db   = require('../config/db');

/**
 * protect — verifies Bearer token and attaches req.user
 */
const protect = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
      }
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    // 3. Check user still exists and is active
    const [rows] = await db.query(
      'SELECT id, name, email, role, department, is_active FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!rows.length || !rows[0].is_active) {
      return res.status(401).json({ success: false, message: 'Account not found or deactivated.' });
    }

    // 4. Attach user to request
    req.user = rows[0];
    next();

  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * restrictTo — role-based access control
 * @param {...string} roles - allowed roles
 */
const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role: ${roles.join(' or ')}.`,
    });
  }
  next();
};

module.exports = { protect, restrictTo };