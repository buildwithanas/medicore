/**
 * auth.js — MediCore HMS Authentication
 * Handles login, session storage, logout, and route guarding.
 */

const AUTH_KEY = 'medicore_user';

const Auth = {
  /**
   * Save user session after successful login.
   * @param {Object} user - { name, email, role, token }
   */
  setSession(user) {
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
  },

  /** Get current session user or null */
  getSession() {
    try {
      return JSON.parse(sessionStorage.getItem(AUTH_KEY));
    } catch {
      return null;
    }
  },

  /** Check if a user is currently logged in */
  isLoggedIn() {
    return !!this.getSession();
  },

  /** Clear session and redirect to login */
  logout() {
    sessionStorage.removeItem(AUTH_KEY);
    window.location.href = '/frontend/index.html';
  },

  /**
   * Guard a page — if not logged in, send to login.
   * Call this at the top of every protected page.
   */
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = '/frontend/index.html';
    }
  },

  /**
   * If already logged in and visiting login page, go to dashboard.
   */
  redirectIfLoggedIn() {
    if (this.isLoggedIn()) {
      window.location.href = '/frontend/pages/dashboard.html';
    }
  },
};