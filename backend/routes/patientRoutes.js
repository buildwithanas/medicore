/**
 * routes/patientRoutes.js
 * GET    /api/patients          — list (search, filter, paginate)
 * GET    /api/patients/stats    — counts by status
 * GET    /api/patients/:id      — single patient + recent records
 * POST   /api/patients          — create
 * PUT    /api/patients/:id      — update
 * DELETE /api/patients/:id      — delete (admin only)
 */

const router   = require('express').Router();
const { body } = require('express-validator');
const ctrl     = require('../controllers/patientController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All patient routes require login
router.use(protect);

const patientValidation = [
  body('first_name').notEmpty().trim().withMessage('First name required.'),
  body('last_name').notEmpty().trim().withMessage('Last name required.'),
  body('date_of_birth').isDate().withMessage('Valid date of birth required.'),
  body('sex').isIn(['Male','Female','Other']).withMessage('Sex must be Male, Female, or Other.'),
  body('phone').notEmpty().trim().withMessage('Phone number required.'),
  body('nok_name').notEmpty().trim().withMessage('Next of kin name required.'),
  body('nok_phone').notEmpty().trim().withMessage('Next of kin phone required.'),
];

router.get('/stats', ctrl.getStats);
router.get('/',      ctrl.getAll);
router.get('/:id',   ctrl.getOne);

router.post('/',  patientValidation, validate, ctrl.create);
router.put('/:id', [
  body('first_name').notEmpty().trim(),
  body('last_name').notEmpty().trim(),
], validate, ctrl.update);

router.delete('/:id', restrictTo('admin'), ctrl.remove);

module.exports = router;