import { seedReports } from '../data/mockReports.js';

const REPORTS_KEY = 'anticorruption_reports_v1';
const ADMIN_SESSION_KEY = 'anticorruption_admin_session_v1';
const LANGUAGE_KEY = 'anticorruption_language_v1';

const clone = (value) => JSON.parse(JSON.stringify(value));

export function getStoredReports() {
  const rawValue = localStorage.getItem(REPORTS_KEY);

  if (!rawValue) {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(seedReports));
    return clone(seedReports);
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(seedReports));
    return clone(seedReports);
  }
}

export function setStoredReports(reports) {
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}

export function getStoredAdminSession() {
  const rawValue = localStorage.getItem(ADMIN_SESSION_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    return null;
  }
}

export function setStoredAdminSession(session) {
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

export function clearStoredAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

export function getStoredLanguage() {
  return localStorage.getItem(LANGUAGE_KEY) || 'uz';
}

export function setStoredLanguage(language) {
  localStorage.setItem(LANGUAGE_KEY, language);
}
