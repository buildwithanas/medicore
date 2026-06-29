at > /mnt/user-data/outputs/Medicore/frontend/js/api.js << 'EOF'
/**
 * api.js — MediCore HMS API Layer
 * All backend calls go through here.
 * Set BASE_URL to match your backend server.
 */

const API = (() => {
  const BASE_URL = 'http://localhost:3000/api';

  function getToken() {
    try {
      const user = JSON.parse(sessionStorage.getItem('medicore_user'));
      return user?.token || null;
    } catch { return null; }
  }

  async function request(method, endpoint, body = null) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res  = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await res.json();

    // Token expired — logout and redirect
    if (res.status === 401) {
      sessionStorage.removeItem('medicore_user');
      window.location.href = '/frontend/index.html';
      return;
    }

    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  }

  return {
    // ── AUTH ──────────────────────────────────────────────
    login(email, password, role) {
      return request('POST', '/auth/login', { email, password, role });
    },
    logout(refreshToken) {
      return request('POST', '/auth/logout', { refreshToken });
    },
    refreshToken(refreshToken) {
      return request('POST', '/auth/refresh', { refreshToken });
    },
    getMe() {
      return request('GET', '/auth/me');
    },
    updateMe(data) {
      return request('PUT', '/auth/me', data);
    },
    changePassword(currentPassword, newPassword) {
      return request('PUT', '/auth/change-password', { currentPassword, newPassword });
    },

    // ── DASHBOARD ─────────────────────────────────────────
    getDashboardStats() {
      return request('GET', '/dashboard/stats');
    },
    getDashboardChart(range = 'week') {
      return request('GET', `/dashboard/chart?range=${range}`);
    },
    getWards() {
      return request('GET', '/dashboard/wards');
    },
    getAlerts() {
      return request('GET', '/dashboard/alerts');
    },

    // ── PATIENTS ──────────────────────────────────────────
    getPatients(params = {}) {
      const q = new URLSearchParams(params).toString();
      return request('GET', `/patients?${q}`);
    },
    getPatientStats() {
      return request('GET', '/patients/stats');
    },
    getPatient(id) {
      return request('GET', `/patients/${id}`);
    },
    addPatient(data) {
      return request('POST', '/patients', data);
    },
    updatePatient(id, data) {
      return request('PUT', `/patients/${id}`, data);
    },
    deletePatient(id) {
      return request('DELETE', `/patients/${id}`);
    },

    // ── APPOINTMENTS ──────────────────────────────────────
    getAppointments(params = {}) {
      const q = new URLSearchParams(params).toString();
      return request('GET', `/appointments?${q}`);
    },
    getTodayAppointments() {
      return request('GET', '/appointments/today');
    },
    getCalendar(year, month) {
      return request('GET', `/appointments/calendar?year=${year}&month=${month}`);
    },
    getAppointment(id) {
      return request('GET', `/appointments/${id}`);
    },
    addAppointment(data) {
      return request('POST', '/appointments', data);
    },
    updateAppointment(id, data) {
      return request('PUT', `/appointments/${id}`, data);
    },
    deleteAppointment(id) {
      return request('DELETE', `/appointments/${id}`);
    },

    // ── MEDICAL RECORDS ───────────────────────────────────
    getRecords(params = {}) {
      const q = new URLSearchParams(params).toString();
      return request('GET', `/records?${q}`);
    },
    getRecordsByType(type, params = {}) {
      const q = new URLSearchParams(params).toString();
      return request('GET', `/records/type/${encodeURIComponent(type)}?${q}`);
    },
    getRecord(id) {
      return request('GET', `/records/${id}`);
    },
    addRecord(data) {
      return request('POST', '/records', data);
    },
    updateRecord(id, data) {
      return request('PUT', `/records/${id}`, data);
    },
    deleteRecord(id) {
      return request('DELETE', `/records/${id}`);
    },

    // ── DOCTORS ───────────────────────────────────────────
    getDoctors(params = {}) {
      const q = new URLSearchParams(params).toString();
      return request('GET', `/doctors?${q}`);
    },
    getDoctor(id) {
      return request('GET', `/doctors/${id}`);
    },
    addDoctor(data) {
      return request('POST', '/doctors', data);
    },
    updateDoctor(id, data) {
      return request('PUT', `/doctors/${id}`, data);
    },
    deactivateDoctor(id) {
      return request('DELETE', `/doctors/${id}`);
    },
  };
})();
EOF
echo "✅ api.js written"
Output

✅ api.js written

