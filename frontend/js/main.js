const API = 'http://localhost:8080';

function getToken() { return localStorage.getItem('apex_token'); }
function getRole() { return localStorage.getItem('apex_role'); }
function getUsername() { return localStorage.getItem('apex_username'); }
function isLoggedIn() { return Boolean(getToken()); }

function saveAuth(data) {
  if (!data || !data.accessToken) return;
  localStorage.setItem('apex_token', data.accessToken);
  localStorage.setItem('apex_role', String(data.role || '').toUpperCase());
  localStorage.setItem('apex_username', data.username || data.email || '');
}
function clearAuth() {
  localStorage.removeItem('apex_token');
  localStorage.removeItem('apex_role');
  localStorage.removeItem('apex_username');
}

function redirectByRole(role) {
  const r = String(role || '').toUpperCase();
  if (r === 'ADMIN') return (window.location.href = 'admin-dashboard.html');
  if (r === 'TRAINER' || r === 'EDITOR') return (window.location.href = 'trainer-dashboard.html');
  if (r === 'MEMBER' || r === 'VIEWER') return (window.location.href = 'member-dashboard.html');
  window.location.href = 'index.html';
}
function roleMatch(expected) {
  const current = String(getRole() || '').toUpperCase();
  const roles = Array.isArray(expected) ? expected : [expected];
  return roles.map((x) => String(x || '').toUpperCase()).includes(current);
}
function requireRole(role) {
  if (!isLoggedIn() || !roleMatch(role)) { clearAuth(); window.location.href = 'login.html'; return false; }
  return true;
}
function requireLogin() {
  if (!isLoggedIn()) { window.location.href = 'login.html'; return false; }
  return true;
}

async function apiFetch(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(API + url, { ...options, headers });
    if (res.status === 401) { clearAuth(); window.location.href = 'login.html'; return { error: 'Unauthorized', status: 401 }; }
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) return { ...(data || {}), error: data?.error || res.statusText, status: res.status };
    return data;
  } catch (e) {
    return { error: e.message || 'Network error', status: 0 };
  }
}
async function publicFetch(url, options = {}) {
  try {
    const res = await fetch(API + url, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) return { ...(data || {}), error: data?.error || res.statusText, status: res.status };
    return data;
  } catch (e) {
    return { error: e.message || 'Network error', status: 0 };
  }
}

async function doLogin() {
  const username = document.getElementById('username')?.value?.trim();
  const password = document.getElementById('password')?.value || '';
  const data = await publicFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
  if (data?.accessToken) { saveAuth(data); redirectByRole(data.role); } else showError(data?.error || 'Invalid credentials');
}
async function doSignup() {
  const fullName = document.getElementById('fullName')?.value?.trim();
  const username = document.getElementById('username')?.value?.trim() || document.getElementById('email')?.value?.trim();
  const email = document.getElementById('email')?.value?.trim();
  const password = document.getElementById('password')?.value || '';
  const data = await publicFetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ fullName, username, email, password, role: 'MEMBER' }) });
  if (data?.accessToken) { saveAuth(data); window.location.href = 'member-dashboard.html'; } else showError(data?.error || 'Signup failed');
}
function doLogout() { clearAuth(); window.location.href = 'index.html'; }

const loadPublicClasses = () => publicFetch('/api/trainers/classes/upcoming');
const loadPublicTrainers = () => publicFetch('/api/trainers/active');
const loadPublicPlans = () => publicFetch('/api/payments/plans/active');

const apiGetTrainers = () => apiFetch('/api/trainers');
const apiGetActiveTrainers = () => publicFetch('/api/trainers/active');
const apiGetTrainer = (id) => publicFetch(`/api/trainers/${id}`);
const apiCreateTrainer = (data) => apiFetch('/api/trainers', { method: 'POST', body: JSON.stringify(data) });
const apiUpdateTrainer = (id, data) => apiFetch(`/api/trainers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
const apiGetTrainerClasses = (trainerId) => apiFetch(`/api/trainers/${trainerId}/classes`);

const apiGetClasses = () => apiFetch('/api/trainers/classes');
const apiGetUpcomingClasses = () => publicFetch('/api/trainers/classes/upcoming');
const apiGetClass = (id) => publicFetch(`/api/trainers/classes/${id}`);
const apiGetClassesByType = (type) => publicFetch(`/api/trainers/classes/type/${encodeURIComponent(type)}`);
const apiCreateClass = (data) => apiFetch('/api/trainers/classes', { method: 'POST', body: JSON.stringify(data) });
const apiUpdateClass = (id, data) => apiFetch(`/api/trainers/classes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
const apiCancelClass = (id) => apiFetch(`/api/trainers/classes/${id}/cancel`, { method: 'PUT' });

const apiGetMembers = () => apiFetch('/api/members');
const apiGetMember = (id) => apiFetch(`/api/members/${id}`);
const apiGetMemberByUserId = (userId) => apiFetch(`/api/members/user/${userId}`);
const apiCreateMember = (data) => apiFetch('/api/members', { method: 'POST', body: JSON.stringify(data) });
const apiUpdateMember = (id, data) => apiFetch(`/api/members/${id}`, { method: 'PUT', body: JSON.stringify(data) });
const apiSuspendMember = (id) => apiFetch(`/api/members/${id}/suspend`, { method: 'PUT' });
const apiGetBookings = (memberId) => apiFetch(`/api/members/${memberId}/bookings`);
const apiBookClass = (data) => apiFetch('/api/members/bookings', { method: 'POST', body: JSON.stringify(data) });
const apiCancelBooking = (bookingId) => apiFetch(`/api/members/bookings/${bookingId}/cancel`, { method: 'PUT' });

const apiGetPlans = () => publicFetch('/api/payments/plans/active');
const apiGetAllPlans = () => apiFetch('/api/payments/plans');
const apiCreatePlan = (data) => apiFetch('/api/payments/plans', { method: 'POST', body: JSON.stringify(data) });
const apiGetPayments = () => apiFetch('/api/payments');
const apiGetMemberPayments = (memberId) => apiFetch(`/api/payments/member/${memberId}`);
const apiProcessPayment = (data) => apiFetch('/api/payments', { method: 'POST', body: JSON.stringify(data) });
const apiRefundPayment = (id) => apiFetch(`/api/payments/${id}/refund`, { method: 'PUT' });
const apiGetRevenue = () => apiFetch('/api/payments/revenue');

const apiGetAllUsers = () => apiFetch('/api/auth/admin/users');
const apiGetUser = (id) => apiFetch(`/api/auth/admin/users/${id}`);
const apiDeactivateUser = (id) => apiFetch(`/api/auth/admin/users/${id}/deactivate`, { method: 'PUT' });

function updateNavbar() {
  const loginLink = document.getElementById('nav-login') || document.getElementById('loginLink');
  const logoutBtn = document.getElementById('nav-logout') || document.getElementById('logoutHeaderBtn');
  if (loginLink) loginLink.style.display = isLoggedIn() ? 'none' : '';
  if (logoutBtn) { logoutBtn.style.display = isLoggedIn() ? '' : 'none'; logoutBtn.onclick = doLogout; }
}
function showError(message) { const el = document.getElementById('error-msg'); if (el) el.textContent = message || 'Error'; }
function showSuccess(message) { const el = document.getElementById('success-msg'); if (el) { el.textContent = message || 'Success'; setTimeout(() => { el.textContent = ''; }, 3000); } }
function showLoading(containerId) { const el = document.getElementById(containerId); if (el) el.innerHTML = '<p>Loading...</p>'; }
function formatDate(dateStr) { if (!dateStr) return '-'; const d = new Date(dateStr); return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString(); }
function formatDateTime(dateStr) { if (!dateStr) return '-'; const d = new Date(dateStr); return Number.isNaN(d.getTime()) ? '-' : d.toLocaleString(); }
function formatCurrency(amount) { return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(amount || 0)); }

function initLoginPage() { if (isLoggedIn()) return redirectByRole(getRole()); const form = document.querySelector('form'); if (form) form.addEventListener('submit', (e) => { e.preventDefault(); doLogin(); }); }
function initSignupPage() { if (isLoggedIn()) return redirectByRole(getRole()); const form = document.querySelector('form'); if (form) form.addEventListener('submit', (e) => { e.preventDefault(); doSignup(); }); }

async function initPublicClassesPage() {
  const grid = document.getElementById('classes-grid') || document.getElementById('classesGrid');
  if (!grid) return;
  showLoading(grid.id);
  const list = await apiGetUpcomingClasses();
  if (!Array.isArray(list)) return;
  grid.innerHTML = list.map((c) => `<div class="class-card"><h3>${c.name || 'Class'}</h3><p>${formatDateTime(c.classDateTime)}</p><a href="class-details.html?id=${c.id}">View</a></div>`).join('');
}
async function initPublicTrainersPage() {
  const grid = document.getElementById('trainers-grid') || document.getElementById('trainersGrid');
  if (!grid) return;
  showLoading(grid.id);
  const list = await apiGetActiveTrainers();
  if (!Array.isArray(list)) return;
  grid.innerHTML = list.map((t) => `<div class="trainer-card"><h3>${t.fullName || 'Trainer'}</h3><p>${t.specialization || ''}</p><a href="trainer-profile.html?id=${t.id}">View Profile</a></div>`).join('');
}
async function initPublicPricingPage() {
  const pricingGrid = document.getElementById('pricingGrid');
  const plans = await apiGetPlans();
  if (pricingGrid && Array.isArray(plans)) {
    pricingGrid.innerHTML = plans.map((p) => `<div class="pricing-card"><h3>${p.name}</h3><p>${formatCurrency(p.price)}</p><a href="payment.html?planId=${p.id}">Select</a></div>`).join('');
  }
}
async function initClassDetailsPage() {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) return;
  const c = await apiGetClass(id);
  if (!c || c.error) return;
  const set = (k, v) => { const el = document.getElementById(k); if (el) el.textContent = v ?? ''; };
  set('className', c.name || 'Class');
  set('classCategory', c.location || '');
  set('classDuration', c.durationMinutes ? `${c.durationMinutes} min` : '-');
  set('classStatus', c.status || '-');
  set('classCapacity', `${c.currentEnrollment ?? 0} / ${c.maxCapacity ?? '-'}`);
  set('classDescription', c.description || '');
  set('classSessionMeta', formatDateTime(c.classDateTime));
  if (c.trainerId) {
    const t = await apiGetTrainer(c.trainerId);
    if (t && !t.error) {
      set('trainerName', t.fullName || 'Trainer');
      set('trainerSpecialty', t.specialization || '');
      set('trainerBio', t.bio || '');
      const link = document.getElementById('trainerProfileLink');
      if (link) link.href = `trainer-profile.html?id=${t.id}`;
    }
  }
}
async function initTrainerProfilePage() {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) return;
  const t = await apiGetTrainer(id);
  if (!t || t.error) return;
  const set = (k, v) => { const el = document.getElementById(k); if (el) el.textContent = v ?? ''; };
  set('trainerName', t.fullName || 'Trainer');
  set('trainerSpecialty', t.specialization || '');
  set('trainerBio', t.bio || '');
  set('trainerFullBio', t.bio || '');
  set('trainerYears', t.experienceYears ?? '-');
  set('trainerEmail', t.email || '-');
  const classes = await apiGetTrainerClasses(t.id);
  const cards = document.getElementById('trainerClassesCards');
  if (cards && Array.isArray(classes)) {
    cards.innerHTML = classes.map((c) => `<div class="col-md-6 col-lg-4"><div class="section-card"><h4>${c.name || 'Class'}</h4><p>${formatDateTime(c.classDateTime)}</p></div></div>`).join('');
  }
}
async function initAdminDashboardPage() { if (!requireRole('ADMIN')) return; }
async function initTrainerDashboardPage() { if (!requireRole('TRAINER')) return; }
async function initMemberDashboardPage() { if (!requireLogin()) return; }

document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();
  const page = window.location.pathname.split('/').pop();
  if (page === 'login.html') initLoginPage();
  if (page === 'signup.html') initSignupPage();
  if (page === 'schedule.html' || page === 'classes.html' || page === 'index.html' || page === 'class-details.html') initPublicClassesPage();
  if (page === 'trainer-profile.html') { initPublicTrainersPage(); initTrainerProfilePage(); }
  if (page === 'class-details.html') initClassDetailsPage();
  if (page === 'payment.html') initPublicPricingPage();
  if (page === 'admin-dashboard.html') initAdminDashboardPage();
  if (page === 'trainer-dashboard.html') initTrainerDashboardPage();
  if (page === 'member-dashboard.html') initMemberDashboardPage();
});

