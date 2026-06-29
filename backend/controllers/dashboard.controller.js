/**
 * controllers/dashboardController.js
 * Aggregates data for the dashboard page.
 */

const db = require('../config/db');

/* ── HEADLINE STATS ──────────────────────────────────── */
exports.getStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [[patients]]     = await db.query('SELECT COUNT(*) AS n FROM patients');
    const [[todayPatients]] = await db.query("SELECT COUNT(*) AS n FROM patients WHERE DATE(created_at) = ?", [today]);
    const [[admitted]]     = await db.query("SELECT COUNT(*) AS n FROM patients WHERE status = 'admitted'");
    const [[emergency]]    = await db.query("SELECT COUNT(*) AS n FROM patients WHERE status = 'emergency'");
    const [[todayAppts]]   = await db.query('SELECT COUNT(*) AS n FROM appointments WHERE appt_date = ?', [today]);
    const [[pendingAppts]] = await db.query("SELECT COUNT(*) AS n FROM appointments WHERE appt_date = ? AND status = 'pending'", [today]);
    const [[doctors]]      = await db.query("SELECT COUNT(*) AS n FROM users WHERE role = 'doctor' AND is_active = 1");

    // Available beds = total capacity - admitted patients
    const [[capacity]]  = await db.query('SELECT COALESCE(SUM(capacity), 280) AS total FROM wards');
    const bedsAvailable = Math.max(0, capacity.total - admitted.n - emergency.n);

    // Yesterday patient count for delta
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const [[yesterdayPatients]] = await db.query("SELECT COUNT(*) AS n FROM patients WHERE DATE(created_at) = ?", [yesterday]);
    const patientDelta = yesterdayPatients.n > 0
      ? (((todayPatients.n - yesterdayPatients.n) / yesterdayPatients.n) * 100).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalPatients:   patients.n,
        todayPatients:   todayPatients.n,
        patientDelta:    parseFloat(patientDelta),
        admitted:        admitted.n,
        emergency:       emergency.n,
        todayAppts:      todayAppts.n,
        pendingAppts:    pendingAppts.n,
        activeDoctors:   doctors.n,
        totalBeds:       capacity.total,
        bedsAvailable,
        bedsOccupied:    capacity.total - bedsAvailable,
      },
    });
  } catch (err) {
    console.error('dashboard stats:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/* ── WEEKLY / MONTHLY CHART ──────────────────────────── */
exports.getChart = async (req, res) => {
  try {
    const { range = 'week' } = req.query;

    let sql, labels;

    if (range === 'week') {
      // Last 7 days
      sql = `
        SELECT DATE(created_at) AS day, COUNT(*) AS admissions
        FROM patients
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY DATE(created_at)
        ORDER BY day ASC`;

      const [rows] = await db.query(sql);

      // Build a full 7-day array including zeros
      const result = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
        const found = rows.find(r => r.day.toISOString().split('T')[0] === d);
        const dayName = new Date(d).toLocaleDateString('en-GB', { weekday: 'short' });
        result.push({ label: dayName, date: d, admissions: found ? found.admissions : 0 });
      }
      return res.status(200).json({ success: true, data: result });
    }

    if (range === 'month') {
      // Last 4 weeks
      const [rows] = await db.query(`
        SELECT
          WEEK(created_at) AS wk,
          MIN(DATE(created_at)) AS week_start,
          COUNT(*) AS admissions
        FROM patients
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 28 DAY)
        GROUP BY WEEK(created_at)
        ORDER BY wk ASC
        LIMIT 4`);

      const result = rows.map((r, i) => ({
        label: `W${i + 1}`,
        date:  r.week_start,
        admissions: r.admissions,
      }));
      return res.status(200).json({ success: true, data: result });
    }

    res.status(400).json({ success: false, message: 'range must be "week" or "month".' });
  } catch (err) {
    console.error('dashboard chart:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/* ── WARD OCCUPANCY ──────────────────────────────────── */
exports.getWards = async (req, res) => {
  try {
    const [wards] = await db.query(`
      SELECT
        w.id,
        w.name,
        w.capacity,
        w.department,
        w.floor,
        (SELECT COUNT(*) FROM patients p
         WHERE p.ward = w.name AND p.status IN ('admitted','emergency')) AS occupied
      FROM wards w
      ORDER BY w.name`);

    const result = wards.map(w => ({
      ...w,
      available:   Math.max(0, w.capacity - w.occupied),
      occupancy_pct: Math.round((w.occupied / w.capacity) * 100),
    }));

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error('dashboard wards:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/* ── RECENT ALERTS (from audit log) ─────────────────── */
exports.getAlerts = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        al.id, al.action, al.table_name, al.record_id, al.created_at,
        u.name AS performed_by
      FROM audit_log al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 20`);

    // Map action codes to human-readable alerts
    const actionLabels = {
      LOGIN_FAILED:         { title: 'Failed Login Attempt',       type: 'warning' },
      PATIENT_CREATED:      { title: 'New Patient Admitted',        type: 'info'    },
      PATIENT_DELETED:      { title: 'Patient Record Deleted',      type: 'danger'  },
      APPOINTMENT_CREATED:  { title: 'New Appointment Booked',      type: 'info'    },
      RECORD_CREATED:       { title: 'New Medical Record Added',    type: 'info'    },
      DOCTOR_CREATED:       { title: 'New Staff Account Created',   type: 'info'    },
      DOCTOR_DEACTIVATED:   { title: 'Staff Account Deactivated',   type: 'warning' },
      PASSWORD_CHANGED:     { title: 'Password Changed',            type: 'info'    },
    };

    const alerts = rows.map(r => ({
      id:           r.id,
      title:        actionLabels[r.action]?.title || r.action,
      type:         actionLabels[r.action]?.type  || 'info',
      performed_by: r.performed_by || 'System',
      time:         r.created_at,
    }));

    res.status(200).json({ success: true, data: alerts });
  } catch (err) {
    console.error('dashboard alerts:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};