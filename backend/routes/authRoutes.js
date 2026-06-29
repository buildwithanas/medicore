/**
 * routes/authRoutes.js
 * POST /api/auth/login
 * POST /api/auth/logout
 * POST /api/auth/refresh
 * GET  /api/auth/me
 * PUT  /api/auth/me
 * PUT  /api/auth/change-password
 */

const router   = require('express').Router();
const { body } = require('express-validator');
const ctrl     = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate    = require('../middleware/validate');

// ── Login ──
router.post('/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
    body('password').notEmpty().withMessage('Password required.'),
  ],
  validate,
  ctrl.login
);

// ── Refresh token ──
router.post('/refresh',
  body('refreshToken').notEmpty().withMessage('Refresh token required.'),
  validate,
  ctrl.refreshToken
);

// ── Logout (protected) ──
router.post('/logout', protect, ctrl.logout);

// ── Get my profile ──
router.get('/me', protect, ctrl.getMe);

// ── Update my profile ──
router.put('/me', protect,
  [
    body('name').notEmpty().trim().withMessage('Name is required.'),
    body('phone').optional().trim(),
  ],
  validate,
  ctrl.updateMe
);

// ── Change password ──
router.put('/change-password', protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password required.'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters.'),
  ],
  validate,
  ctrl.changePassword
);

module.exports = router;