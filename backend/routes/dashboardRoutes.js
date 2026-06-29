/**
 * routes/dashboardRoutes.js
 * GET /api/dashboard/stats      — headline numbers
 * GET /api/dashboard/chart      — weekly/monthly admissions
 * GET /api/dashboard/wards      — ward occupancy
 * GET /api/dashboard/alerts     — recent system alerts
 */

const router = require('express').Router();
const ctrl   = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats',  ctrl.getStats);
router.get('/chart',  ctrl.getChart);
router.get('/wards',  ctrl.getWards);
router.get('/alerts', ctrl.getAlerts);

module.exports = router;