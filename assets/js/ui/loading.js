/**
 * Loading / error state toggles for the top-level dashboard.
 */

export function showLoading() {
  const loading = document.getElementById('loading-state');
  const dashboard = document.getElementById('dashboard');
  const error = document.getElementById('error-state');
  if (loading) loading.classList.remove('hidden');
  if (dashboard) dashboard.classList.add('hidden');
  if (error) error.classList.add('hidden');
}

export function showDashboard() {
  const loading = document.getElementById('loading-state');
  const dashboard = document.getElementById('dashboard');
  const error = document.getElementById('error-state');
  if (loading) loading.classList.add('hidden');
  if (dashboard) dashboard.classList.remove('hidden');
  if (error) error.classList.add('hidden');
}

export function showError(message) {
  const loading = document.getElementById('loading-state');
  const dashboard = document.getElementById('dashboard');
  const error = document.getElementById('error-state');
  const msgEl = document.getElementById('error-message');
  if (loading) loading.classList.add('hidden');
  if (dashboard) dashboard.classList.add('hidden');
  if (error) error.classList.remove('hidden');
  if (msgEl) msgEl.textContent = message || '';
}

export default { showLoading, showDashboard, showError };