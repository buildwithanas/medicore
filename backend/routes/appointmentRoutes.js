/**
 * routes/appointmentRoutes.js
 * GET  /api/appointments          — list
 * GET  /api/appointments/today    — today's appointments (dashboard)
 * GET  /api/appointments/calendar — grouped by date for calendar
 * GET  /api/appointments/:id      — single
 * POST /api/appointments          — create
 * PUT  /api/appointments/:id      — update / change status
 * DELETE /api/appointments/:id    — delete
 */

const router   = require('express').Router();
const { body } = require('express-validator');
const ctrl     = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');
const validate    = require('../middleware/validate');

router.use(protect);

const apptValidation = [
  body('patient_id').notEmpty().withMessage('Patient ID required.'),
  body('doctor_id').notEmpty().withMessage('Doctor ID required.'),
  body('appt_date').isDate().withMessage('Valid appointment date required.'),
  body('appt_time').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Valid time required (HH:MM).'),
];

router.get('/today',    ctrl.getToday);
router.get('/calendar', ctrl.getCalendar);
router.get('/',         ctrl.getAll);
router.get('/:id',      ctrl.getOne);

router.post('/',   apptValidation, validate, ctrl.create);
router.put('/:id', [
  body('status').optional().isIn(['pending','confirmed','inprogress','completed','cancelled']),
], validate, ctrl.update);

router.delete('/:id', ctrl.remove);

module.exports = router;