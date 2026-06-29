/**
 * app.js — MediCore HMS Shared App Utilities
 * Shared helpers used across all pages.
 */

const App = {
  /** Resolve correct relative path for assets from /pages/ */
  ROOT: '../',

  /** Inject the active nav state based on current page */
  setActiveNav() {
    const page = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-item[data-page]').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });
  },

  /** Render logged-in user info into sidebar */
  renderUser() {
    const user = Auth.getSession();
    if (!user) return;
    const nameEl  = document.getElementById('user-name');
    const roleEl  = document.getElementById('user-role');
    const initEl  = document.getElementById('user-initials');
    if (nameEl)  nameEl.textContent  = user.name  || 'Staff Member';
    if (roleEl)  roleEl.textContent  = user.role  || 'Staff';
    if (initEl)  initEl.textContent  = (user.name || 'U').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
  },

  /** Show a toast notification */
  toast(message, type = 'success') {
    const existing = document.getElementById('app-toast');
    if (existing) existing.remove();

    const t = document.createElement('div');
    t.id = 'app-toast';
    t.style.cssText = `
      position:fixed;bottom:28px;right:28px;z-index:9999;
      padding:14px 20px;border-radius:12px;font-size:.86rem;font-family:'DM Sans',sans-serif;
      display:flex;align-items:center;gap:10px;font-weight:500;
      box-shadow:0 8px 32px rgba(0,0,0,.4);
      animation:toastIn .3s cubic-bezier(.22,1,.36,1);
      background:${type==='success'?'#0d2e2a':type==='error'?'#2e0d13':'#1a1f2e'};
      border:1px solid ${type==='success'?'#00b4a2':type==='error'?'#f43f5e':'#3b82f6'};
      color:${type==='success'?'#00d4bf':type==='error'?'#fb7185':'#93c5fd'};
    `;
    const icon = type==='success'?'✓':type==='error'?'✕':'ℹ';
    t.innerHTML = `<span style="font-size:1rem">${icon}</span><span>${message}</span>`;
    document.body.appendChild(t);

    if (!document.getElementById('toast-style')) {
      const s = document.createElement('style');
      s.id = 'toast-style';
      s.textContent = `@keyframes toastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`;
      document.head.appendChild(s);
    }
    setTimeout(() => t.remove(), 3500);
  },

  /** Format date to readable string */
  formatDate(str) {
    if (!str) return '—';
    return new Date(str).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
  },

  /** Sidebar toggle for mobile */
  initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const hamburger = document.getElementById('hamburger');
    if (hamburger) hamburger.addEventListener('click', () => {
      sidebar?.classList.toggle('open');
      overlay?.classList.toggle('open');
    });
    overlay?.addEventListener('click', () => {
      sidebar?.classList.remove('open');
      overlay?.classList.remove('open');
    });
  },

  /** Logout button */
  initLogout() {
    document.querySelectorAll('[data-logout]').forEach(el => {
      el.addEventListener('click', () => Auth.logout());
    });
  },

  /** Run all init tasks on every page */
  init() {
    Auth.requireAuth();
    this.setActiveNav();
    this.renderUser();
    this.initSidebar();
    this.initLogout();

    // Set date in topbar
    const dc = document.getElementById('datechip');
    if (dc) dc.textContent = new Date().toLocaleDateString('en-GB', {weekday:'short',month:'short',day:'numeric',year:'numeric'});
  },
};