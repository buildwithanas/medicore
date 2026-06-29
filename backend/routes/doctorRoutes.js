/**
 * routes/doctorRoutes.js
 * GET    /api/doctors         — list all staff
 * GET    /api/doctors/:id     — single doctor + today's schedule
 * POST   /api/doctors         — create (admin only)
 * PUT    /api/doctors/:id     — update
 * DELETE /api/doctors/:id     — deactivate (admin only)
 */

const router   = require('express').Router();
const { body } = require('express-validator');
const ctrl     = require('../controllers/doctorController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

router.get('/',    ctrl.getAll);
router.get('/:id', ctrl.getOne);

router.post('/', restrictTo('admin'),
  [
    body('name').notEmpty().trim().withMessage('Name required.'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
    body('role').isIn(['doctor','nurse','lab_tech','pharmacist']).withMessage('Invalid role.'),
    body('department').notEmpty().withMessage('Department required.'),
  ],
  validate,
  ctrl.create
);

router.put('/:id',
  [body('name').notEmpty().trim().withMessage('Name required.')],
  validate,
  ctrl.update
);

router.delete('/:id', restrictTo('admin'), ctrl.deactivate);

module.exports = router;