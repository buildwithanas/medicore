/**
 * middleware/roles.js
 * Role-based access guard.
 * Usage: router.delete('/x', protect, roles('admin'), handler)
 */

const roles = (...allowed) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. This action requires: ${allowed.join(' or ')}.`,
    });
  }
  next();
};

module.exports = roles;