/**
 * routes/recordRoutes.js
 * GET    /api/records              — list all
 * GET    /api/records/type/:type   — by type (Prescription, Lab Result, etc.)
 * GET    /api/records/:id          — single
 * POST   /api/records              — create
 * PUT    /api/records/:id          — update
 * DELETE /api/records/:id          — delete
 */

const router   = require('express').Router();
const { body } = require('express-validator');
const ctrl     = require('../controllers/recordController');
const { protect } = require('../middleware/auth');
const validate    = require('../middleware/validate');

router.use(protect);

const recordValidation = [
  body('patient_id').notEmpty().withMessage('Patient ID required.'),
  body('type').isIn(['Prescription','Lab Result','Diagnosis','Imaging','Note','Discharge Summary']).withMessage('Invalid record type.'),
  body('title').notEmpty().trim().withMessage('Title required.'),
  body('description').notEmpty().trim().withMessage('Description required.'),
];

router.get('/type/:type', ctrl.getByType);
router.get('/',           ctrl.getAll);
router.get('/:id',        ctrl.getOne);

router.post('/',   recordValidation, validate, ctrl.create);
router.put('/:id', [
  body('title').notEmpty().trim(),
  body('description').notEmpty().trim(),
], validate, ctrl.update);

router.delete('/:id', ctrl.remove);

module.exports = router;