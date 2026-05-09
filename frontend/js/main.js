const API = 'http://localhost:8080';

/** Backend-aligned enums (payment / trainer / member services) */
const APEX_PAYMENT_TYPE = {
  MEMBERSHIP: 'MEMBERSHIP',
  CLASS_BOOKING: 'CLASS_BOOKING',
  PERSONAL_TRAINING: 'PERSONAL_TRAINING',
  OTHER: 'OTHER'
};
/** Minimum amount for CLASS_BOOKING prerequisite (payment-service PaymentRequest) */
const APEX_CLASS_BOOKING_FEE = 1.0;

function getToken() { return localStorage.getItem('apex_token'); }
function getRole() { return localStorage.getItem('apex_role'); }
function getUsername() { return localStorage.getItem('apex_username'); }
function isLoggedIn() { return Boolean(getToken()); }

// FIX 5 — Common API helper (exact functions requested)
// Public fetch - no token
async function publicFetch(url) {
  try {
    const res = await fetch(API + url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch(e) {
    console.error('Public fetch failed:', url, e.message);
    return null;
  }
}

// Authenticated fetch - with token (single transport for protected APIs)
async function authFetch(url, options = {}) {
  const token = localStorage.getItem('apex_token');
  try {
    const res = await fetch(API + url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? 'Bearer ' + token : '',
        ...(options.headers || {})
      }
    });
    if (res.status === 401) {
      localStorage.clear();
      window.location.href = 'login.html';
      return null;
    }
    const text = await res.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        data = { message: text };
      }
    }
    if (!res.ok) {
      const msg = (data && (data.message || data.error)) || text || ('HTTP ' + res.status);
      const err = new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      err.status = res.status;
      throw err;
    }
    return data;
  } catch (e) {
    if (e.status) throw e;
    console.error('Auth fetch failed:', url, e.message);
    throw e;
  }
}

async function checkHasClassBookingPayment(memberId) {
  try {
    const result = await publicFetch('/api/payments/member/' + encodeURIComponent(memberId) + '/has-class-payment');
    return result && result.hasPayment === true;
  } catch (e) {
    console.error('Error checking class booking payment:', e.message);
    return false;
  }
}

async function ensureClassBookingPayment(memberId, relatedClassId) {
  const hasPayment = await checkHasClassBookingPayment(memberId);
  if (hasPayment) {
    return true;
  }

  showBookingMessage('A class booking payment is required. Processing payment now...', 'info');
  const payment = await apiProcessPayment({
    memberId,
    memberName: localStorage.getItem('apex_username') || 'Member',
    memberEmail: '',
    relatedClassId: Number.isFinite(Number(relatedClassId)) ? parseInt(relatedClassId, 10) : undefined,
    amount: APEX_CLASS_BOOKING_FEE,
    currency: 'USD',
    paymentType: APEX_PAYMENT_TYPE.CLASS_BOOKING,
    description: `Class booking fee for class ${relatedClassId}`
  });

  if (!payment || !payment.id) {
    throw new Error('Could not process class booking payment. Please try again.');
  }

  const verified = await checkHasClassBookingPayment(memberId);
  if (!verified) {
    throw new Error('Class booking payment could not be verified. Please contact support.');
  }
  return true;
}

// Format date nicely
function niceDate(str) {
  if (!str) return 'TBA';
  return new Date(str).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// Format price
function nicePrice(amount) {
  return '$' + Number(amount).toFixed(2);
}

// Get class image by type
function classImage(type) {
  const map = {
    HIIT: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    YOGA: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    PILATES: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
    STRENGTH: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
    CARDIO: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400',
    SPINNING: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400',
    BOXING: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400',
    ZUMBA: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=400',
    OTHER: 'https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?w=400'
  };
  const key = String(type || 'OTHER').toUpperCase();
  return map[key] || map.OTHER;
}

// Get trainer avatar
function trainerAvatar(name) {
  return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=1a1a1a&color=e8ff00&size=300&bold=true';
}

// Small API helpers (used by existing page initializers)
async function apiGetTrainer(id) {
  try {
    return localStorage.getItem('apex_token')
      ? await authFetch('/api/trainers/' + encodeURIComponent(id))
      : await publicFetch('/api/trainers/' + encodeURIComponent(id));
  } catch (e) {
    return null;
  }
}

async function apiGetTrainerClasses(trainerId) {
  try {
    const token = localStorage.getItem('apex_token');
    if (token) {
      const result = await authFetch('/api/trainers/' + encodeURIComponent(trainerId) + '/classes');
      return Array.isArray(result) ? result : [];
    }
    const all = await publicFetch('/api/trainers/classes');
    if (!Array.isArray(all)) return [];
    return all.filter((c) => String(c.trainerId) === String(trainerId));
  } catch (e) {
    return [];
  }
}

// Admin APIs
async function apiGetAllUsers() {
  try {
    const result = await authFetch('/api/auth/admin/users');
    return Array.isArray(result) ? result : [];
  } catch (e) {
    console.error('Error fetching users:', e.message);
    return [];
  }
}

async function apiGetMembers() {
  try {
    const result = await authFetch('/api/members');
    return Array.isArray(result) ? result : [];
  } catch (e) {
    console.error('Error fetching members:', e.message);
    return [];
  }
}

async function apiGetTrainers() {
  try {
    const result = await authFetch('/api/trainers');
    return Array.isArray(result) ? result : [];
  } catch (e) {
    console.error('Error fetching trainers:', e.message);
    return [];
  }
}

async function apiGetRevenue() {
  try {
    const result = await authFetch('/api/payments/revenue');
    return result && typeof result === 'object' ? result : { totalRevenue: 0 };
  } catch (e) {
    console.error('Error fetching revenue:', e.message);
    return { totalRevenue: 0 };
  }
}

async function apiGetPayments() {
  try {
    const result = await authFetch('/api/payments');
    return Array.isArray(result) ? result : [];
  } catch (e) {
    console.error('Error fetching payments:', e.message);
    return [];
  }
}

async function apiGetAllMembershipPlans() {
  try {
    const result = await authFetch('/api/payments/plans');
    return Array.isArray(result) ? result : [];
  } catch (e) {
    console.error('Error fetching membership plans:', e.message);
    return [];
  }
}

async function apiDeactivateMembershipPlan(planId) {
  return authFetch('/api/payments/plans/' + encodeURIComponent(planId), { method: 'DELETE' });
}

async function apiGetClasses() {
  try {
    const result = await authFetch('/api/trainers/classes');
    return Array.isArray(result) ? result : [];
  } catch (e) {
    console.error('Error fetching classes:', e.message);
    return [];
  }
}

async function apiGetActiveTrainers() {
  try {
    const token = localStorage.getItem('apex_token');
    const result = token
      ? await authFetch('/api/trainers/active')
      : await publicFetch('/api/trainers/active');
    return Array.isArray(result) ? result : [];
  } catch (e) {
    console.error('Error fetching active trainers:', e.message);
    return [];
  }
}

async function apiGetMemberByUserId(userId) {
  try {
    const result = await authFetch('/api/members/user/' + encodeURIComponent(userId));
    return result && typeof result === 'object' ? result : null;
  } catch (e) {
    console.error('Error fetching member by user ID:', e.message);
    return null;
  }
}

async function apiGetBookings(memberId) {
  try {
    const result = await authFetch('/api/members/' + encodeURIComponent(memberId) + '/bookings');
    return Array.isArray(result) ? result : [];
  } catch (e) {
    console.error('Error fetching bookings:', e.message);
    return [];
  }
}

async function apiGetMemberPayments(memberId) {
  try {
    const result = await authFetch('/api/payments/member/' + encodeURIComponent(memberId));
    return Array.isArray(result) ? result : [];
  } catch (e) {
    console.error('Error fetching member payments:', e.message);
    return [];
  }
}

async function apiCancelClass(classId) {
  try {
    return await authFetch('/api/trainers/classes/' + encodeURIComponent(classId) + '/cancel', {
      method: 'PUT'
    });
  } catch (e) {
    console.error('Error cancelling class:', e.message);
    return null;
  }
}

async function apiCancelBooking(bookingId) {
  try {
    return await authFetch('/api/members/bookings/' + encodeURIComponent(bookingId) + '/cancel', {
      method: 'PUT'
    });
  } catch (e) {
    console.error('Error cancelling booking:', e.message);
    return null;
  }
}

async function apiDeactivateUser(userId) {
  try {
    return await authFetch('/api/auth/admin/users/' + encodeURIComponent(userId) + '/deactivate', {
      method: 'PUT'
    });
  } catch (e) {
    console.error('Error deactivating user:', e.message);
    return null;
  }
}

async function apiRefundPayment(paymentId) {
  try {
    return await authFetch('/api/payments/' + encodeURIComponent(paymentId) + '/refund', {
      method: 'PUT'
    });
  } catch (e) {
    console.error('Error refunding payment:', e.message);
    return null;
  }
}

async function apiGetClass(classId) {
  try {
    const result = await authFetch('/api/trainers/classes/' + encodeURIComponent(classId));
    return result && typeof result === 'object' ? result : null;
  } catch (e) {
    console.error('Error fetching class:', e.message);
    return null;
  }
}

async function apiCreateTrainer(data) {
  try {
    return await authFetch('/api/trainers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (e) {
    return null;
  }
}

async function apiCreateClass(data) {
  try {
    return await authFetch('/api/trainers/classes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (e) {
    return null;
  }
}

async function apiGetBookingsForClass(classId) {
  try {
    const result = await authFetch('/api/members/bookings/class/' + encodeURIComponent(classId));
    return Array.isArray(result) ? result : [];
  } catch (e) {
    return [];
  }
}

async function apiGetMemberById(memberId) {
  try {
    const result = await authFetch('/api/members/' + encodeURIComponent(memberId));
    return result && typeof result === 'object' && !result.error ? result : null;
  } catch (e) {
    return null;
  }
}

/** ADMIN-only fallback: scan all members (expensive). Prefer apiGetBookingsForClass + apiGetMemberById */
async function apiGetMembersByClassId(classId) {
  const allMembers = await apiGetMembers();
  if (!Array.isArray(allMembers) || allMembers.length === 0) return [];
  const rows = [];
  for (const m of allMembers) {
    const bookings = await apiGetBookings(m.id);
    if (!Array.isArray(bookings)) continue;
    bookings
      .filter((b) => String(b.classId) === String(classId) && b.status !== 'CANCELLED')
      .forEach((b) => {
        rows.push({
          memberId: m.id,
          memberName: m.fullName || m.username || m.email || `Member #${m.id}`,
          email: m.email || '-',
          bookingStatus: b.status || '-',
          bookedAt: b.bookedAt || b.createdAt || null
        });
      });
  }
  return rows;
}

function ensureMembersModal() {
  let modal = document.getElementById('classMembersModal');
  if (modal) return modal;
  modal = document.createElement('div');
  modal.id = 'classMembersModal';
  modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:5000;align-items:center;justify-content:center;padding:20px;';
  modal.innerHTML = `
    <div style="width:min(900px,95vw);max-height:80vh;overflow:auto;background:#0f0f0f;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h3 style="margin:0;color:#fff;">Class Members</h3>
        <button id="closeClassMembersModal" class="action-link">Close</button>
      </div>
      <div id="classMembersBody" style="color:#ddd;">Loading...</div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });
  const closeBtn = modal.querySelector('#closeClassMembersModal');
  if (closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; };
  return modal;
}

async function showClassMembers(classId) {
  const modal = ensureMembersModal();
  const body = modal.querySelector('#classMembersBody');
  modal.style.display = 'flex';
  body.innerHTML = 'Loading...';
  let rows = [];
  const roster = await apiGetBookingsForClass(classId);
  if (Array.isArray(roster) && roster.length > 0) {
    for (const b of roster) {
      if (b.status === 'CANCELLED') continue;
      const m = await apiGetMemberById(b.memberId);
      rows.push({
        memberId: b.memberId,
        memberName: m?.fullName || `Member #${b.memberId}`,
        email: m?.email || '-',
        bookingStatus: b.status || '-',
        bookedAt: b.bookedAt || null
      });
    }
  }
  if (!rows.length) {
    rows = await apiGetMembersByClassId(classId);
  }
  if (!rows.length) {
    body.innerHTML = '<p>No data found</p>';
    return;
  }
  body.innerHTML = `
    <table class="table-dashboard">
      <thead><tr><th>Member</th><th>Email</th><th>Status</th><th>Booked At</th></tr></thead>
      <tbody>
        ${rows.map((r) => `<tr><td>${escapeHtml(r.memberName)}</td><td>${escapeHtml(r.email)}</td><td>${escapeHtml(r.bookingStatus)}</td><td>${escapeHtml(formatDateTime(r.bookedAt))}</td></tr>`).join('')}
      </tbody>
    </table>
  `;
}

async function apiGetUpcomingClassesMaybeAuthed() {
  try {
    const token = localStorage.getItem('apex_token');
    const result = token
      ? await authFetch('/api/trainers/classes/upcoming')
      : await publicFetch('/api/trainers/classes/upcoming');
    return Array.isArray(result) ? result : [];
  } catch (e) {
    console.error('Error fetching upcoming classes:', e.message);
    return [];
  }
}

async function apiGetPlans() {
  try {
    const result = await publicFetch('/api/payments/plans/active');
    return Array.isArray(result) ? result : [];
  } catch (e) {
    console.error('Error fetching plans:', e.message);
    return [];
  }
}

async function apiProcessPayment(paymentData) {
  try {
    const result = await authFetch('/api/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
    return result && typeof result === 'object' ? result : null;
  } catch (e) {
    console.error('Error processing payment:', e.message);
    return null;
  }
}

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

async function doLogin() {
  const username = document.getElementById('username')?.value?.trim();
  const password = document.getElementById('password')?.value || '';
  try {
    const res = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json().catch(() => null);
    if (data?.accessToken) {
      saveAuth(data);
      // Return to class page if the user came from a "Login to Book" redirect
      const classRedirect = localStorage.getItem('apex_class_redirect');
      if (classRedirect) {
        localStorage.removeItem('apex_class_redirect');
        window.location.href = classRedirect;
      } else {
        window.location.href = 'profile.html';
      }
    } else {
      showError((data && (data.error || data.message)) || 'Invalid credentials');
    }
  } catch (e) {
    showError('Login failed. Please try again.');
  }
}
async function doSignup() {
  const fullName = document.getElementById('fullName')?.value?.trim();
  const username = document.getElementById('username')?.value?.trim() || document.getElementById('email')?.value?.trim();
  const email = document.getElementById('email')?.value?.trim();
  const password = document.getElementById('password')?.value || '';
  try {
    const res = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, username, email, password, role: 'MEMBER' })
    });
    const data = await res.json().catch(() => null);
    if (data?.accessToken) {
      saveAuth(data);
      // Return to class page if the user came from a "Login to Book" redirect
      const classRedirect = localStorage.getItem('apex_class_redirect');
      if (classRedirect) {
        localStorage.removeItem('apex_class_redirect');
        window.location.href = classRedirect;
      } else {
        window.location.href = 'profile.html';
      }
    } else {
      showError((data && (data.error || data.message)) || 'Signup failed');
    }
  } catch (e) {
    showError('Signup failed. Please try again.');
  }
}
function doLogout() { clearAuth(); window.location.href = 'index.html'; }

// Minimal escape helper for HTML injection safety
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

function updateNavbar() {
  const token = getToken();
  const loginLink = document.getElementById('loginLink');
  const profileIconBtn = document.getElementById('profileIconBtn');
  const profileDropdown = document.getElementById('profileDropdown');
  const logoutHeaderBtn = document.getElementById('logoutHeaderBtn');
  const navUsername = document.getElementById('navUsername');

  if (navUsername) {
    navUsername.textContent = token ? (getUsername() || '') : '';
  }

  if (!token) {
    if (loginLink) loginLink.style.display = '';
    if (profileIconBtn) profileIconBtn.style.display = 'none';
    if (profileDropdown) profileDropdown.style.display = 'none';
    if (logoutHeaderBtn) logoutHeaderBtn.onclick = null;
    return;
  }

  if (loginLink) loginLink.style.display = 'none';
  if (profileIconBtn) profileIconBtn.style.display = '';

  if (profileIconBtn && profileDropdown) {
    profileIconBtn.onclick = (e) => {
      e.preventDefault();
      profileDropdown.style.display = profileDropdown.style.display === 'block' ? 'none' : 'block';
    };
    document.addEventListener('click', (event) => {
      if (!profileDropdown.contains(event.target) && !profileIconBtn.contains(event.target)) {
        profileDropdown.style.display = 'none';
      }
    });
  }

  if (logoutHeaderBtn) {
    logoutHeaderBtn.onclick = (e) => {
      e.preventDefault();
      doLogout();
    };
  }
}

// Profile page header dropdown (different DOM than other pages)
function wireProfileHeaderDropdown() {
  const header = document.getElementById('profileDropdownHeader');
  if (!header) return;
  const btn = header.querySelector('.profile-icon-btn');
  const menu = header.querySelector('.profile-dropdown-menu');
  if (!btn || !menu) return;
  btn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  };
  document.addEventListener('click', () => { menu.style.display = 'none'; });
}
function showError(message) { const el = document.getElementById('error-msg'); if (el) el.textContent = message || 'Error'; }
function showSuccess(message) { const el = document.getElementById('success-msg'); if (el) { el.textContent = message || 'Success'; setTimeout(() => { el.textContent = ''; }, 3000); } }
function showLoading(containerId) { const el = document.getElementById(containerId); if (el) el.innerHTML = '<p>Loading...</p>'; }
function formatDate(dateStr) { if (!dateStr) return '-'; const d = new Date(dateStr); return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString(); }
function formatDateTime(dateStr) { if (!dateStr) return '-'; const d = new Date(dateStr); return Number.isNaN(d.getTime()) ? '-' : d.toLocaleString(); }
function formatCurrency(amount) { return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(amount || 0)); }

// FIX 1 — Trainers not appearing (container: #trainersGrid)
async function loadTrainers() {
  const container = document.getElementById('trainersGrid');
  if (!container) return;

  container.innerHTML = '<p class="text-secondary text-center w-100 py-4">Loading...</p>';

  try {
    const token = localStorage.getItem('apex_token');
    const data = token
      ? await authFetch('/api/trainers/active')
      : await publicFetch('/api/trainers/active');

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = '<p class="text-secondary text-center w-100 py-4">No trainers found</p>';
      return;
    }

    container.innerHTML = '';
    data.forEach((t, i) => {
      const fullName = t.fullName || 'Trainer';
      const specialization = t.specialization || '';
      const id = t.id;
      const card = document.createElement('div');
      card.className = 'trainer-card visible-on-scroll';
      card.style.animationDelay = `${i * 0.06}s`;

      // Match existing homepage trainer card structure/classes
      card.innerHTML = `
        <a href="trainer-profile.html?id=${encodeURIComponent(id)}" class="text-decoration-none">
          <div class="card-image-wrapper">
            <img src="${trainerAvatar(fullName)}" alt="${escapeHtml(fullName)}" class="card-image" loading="lazy">
            <div class="card-gradient"></div>
            <div class="card-info">
              <p class="card-role">${escapeHtml(specialization)}</p>
              <h3 class="card-name">${escapeHtml(fullName)}</h3>
            </div>
          </div>
        </a>
        <a href="trainer-profile.html?id=${encodeURIComponent(id)}" class="card-link">
          <span>View Profile</span>
          <span style="font-size: 1.125rem;">→</span>
        </a>
      `;
      card.classList.add('is-visible');
      container.appendChild(card);
    });
  } catch (e) {
    container.innerHTML = '<p class="text-secondary text-center w-100 py-4">No trainers found</p>';
  }
}

// FIX 2 + FIX 3 — Plans + payment methods flow (container: #plansGrid)
let selectedPlan = null;
let selectedMethod = null; // CARD | WALLET | INSTAPAY | CASH

function paymentValidationError(method) {
  if (method === 'CARD') {
    const holder = document.getElementById('card-holder')?.value?.trim();
    const number = document.getElementById('card-number')?.value?.trim();
    const expiry = document.getElementById('card-expiry')?.value?.trim();
    const cvv    = document.getElementById('card-cvv')?.value?.trim();
    if (!holder) return 'Cardholder name is required';
    if (!number) return 'Card number is required';
    if (!expiry) return 'Expiry date is required';
    if (!cvv)    return 'CVV is required';
  }
  if (method === 'WALLET') {
    const phone = document.getElementById('wallet-phone')?.value?.trim();
    if (!phone) return 'Mobile wallet phone number is required';
  }
  if (method === 'INSTAPAY') {
    const account = document.getElementById('instapay-account')?.value?.trim();
    if (!account) return 'InstaPay account number is required';
  }
  // CASH needs no validation
  return null;
}

// Extract userId from JWT token (gateway injects userId claim)
function getUserIdFromToken() {
  try {
    const token = localStorage.getItem('apex_token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || null;
  } catch (e) {
    return null;
  }
}

async function resolveCurrentMember() {
  try {
    // Get userId directly from JWT token - no extra API call needed
    const userId = getUserIdFromToken();
    if (userId) {
      try {
        const m = await apiGetMemberByUserId(userId);
        if (m && m.id != null) return m;
      } catch (e) {
        // Member profile may not exist yet — will be created by ensureMemberForCurrentUser
        console.log('Member profile not found for userId:', userId);
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function ensureMemberForCurrentUser() {
  // Step 1: try to get existing member using JWT userId directly
  const userId = getUserIdFromToken();
  if (userId) {
    try {
      const existing = await apiGetMemberByUserId(userId);
      if (existing && existing.id != null) return existing;
    } catch (e) { /* not found — will create */ }
  }

  if (!userId) {
    console.error('No userId found in token — cannot create member profile');
    return null;
  }

  // Step 2: create member profile automatically using stored data
  const username = localStorage.getItem('apex_username') || 'user';
  const email = username + '@apex.com';
  const fullName = username;

  try {
    const created = await authFetch('/api/members', {
      method: 'POST',
      body: JSON.stringify({
        userId: Number(userId),
        fullName: fullName,
        email: email,
        phoneNumber: '',
        membershipType: 'BASIC',
        membershipStartDate: new Date().toISOString().split('T')[0],
        membershipEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
    });
    return created && created.id != null ? created : null;
  } catch (e) {
    console.error('Could not create member profile:', e.message);
    return null;
  }
}

async function extendMembershipAfterPayment(planName, planDurationDays) {
  const token = localStorage.getItem('apex_token');
  if (!token) return null;
  const member = await resolveCurrentMember();
  if (!member || member.id == null) return null;

  const today = new Date();
  const currentEndDate = member.membershipEndDate ? new Date(member.membershipEndDate) : null;
  const startFrom = currentEndDate && currentEndDate > today ? currentEndDate : today;
  const newEndDate = new Date(startFrom);
  newEndDate.setDate(newEndDate.getDate() + Number(planDurationDays || 30));
  const newEndDateStr = newEndDate.toISOString().split('T')[0];

  const membershipType = String(planName || '').toUpperCase().includes('PREMIUM')
    ? 'PREMIUM'
    : String(planName || '').toUpperCase().includes('STANDARD')
      ? 'STANDARD'
      : 'BASIC';

  try {
    await authFetch('/api/members/' + encodeURIComponent(member.id), {
      method: 'PUT',
      body: JSON.stringify({
        userId: member.userId,
        fullName: member.fullName,
        email: member.email,
        phoneNumber: member.phoneNumber || '',
        address: member.address || '',
        membershipType,
        membershipStartDate: member.membershipStartDate || new Date().toISOString().split('T')[0],
        membershipEndDate: newEndDateStr
      })
    });
    return newEndDateStr;
  } catch (e) {
    return null;
  }
}

function methodFromRadio(val) {
  const v = String(val || '').toLowerCase();
  if (v === 'card') return 'CARD';
  if (v === 'ewallet') return 'WALLET';
  if (v === 'instapay') return 'INSTAPAY';
  if (v === 'cash') return 'CASH';
  return null;
}

function showPaymentError(msg) {
  let errEl = document.getElementById('payment-error-msg');
  if (!errEl) {
    errEl = document.createElement('div');
    errEl.id = 'payment-error-msg';
    errEl.style.cssText = 'color:#ff3c3c;padding:12px;margin:12px 0;border:1px solid #ff3c3c;background:rgba(255,60,60,0.1)';
    const form = document.querySelector('.payment-form, .payment-section, #payment-form');
    if (form) form.appendChild(errEl);
    else document.body.appendChild(errEl);
  }
  errEl.textContent = msg;
  errEl.style.display = 'block';
  setTimeout(() => { errEl.style.display = 'none'; }, 5000);
}

function showPaymentSuccess(payment, planName, method, amount) {
  const successDiv = document.createElement('div');
  successDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#111;border:2px solid #00e676;padding:40px;text-align:center;z-index:9999;max-width:400px;width:90%;color:#fff;';
  const validUntil = localStorage.getItem('membership_end_date') || '-';
  successDiv.innerHTML = `
    <p style="font-size:42px;color:#00e676;margin:0 0 10px;">✓</p>
    <h3 style="margin:0 0 14px;">Payment Successful!</h3>
    <p style="margin:6px 0;">Plan: ${escapeHtml(planName)}</p>
    <p style="margin:6px 0;">Amount: $${Number(amount).toFixed(2)}</p>
    <p style="margin:6px 0;">Method: ${escapeHtml(method)}</p>
    <p style="margin:6px 0;">Reference: ${escapeHtml(payment.transactionReference || '-')}</p>
    <p style="margin:6px 0;">Valid until: ${escapeHtml(validUntil)}</p>
    <div style="display:flex;gap:10px;justify-content:center;margin-top:14px;">
      <button id="paymentGoProfileBtn" class="action-link">View Profile</button>
      <button id="paymentCloseSuccessBtn" class="action-link">Close</button>
    </div>
  `;
  document.body.appendChild(successDiv);
  const profileBtn = successDiv.querySelector('#paymentGoProfileBtn');
  const closeBtn = successDiv.querySelector('#paymentCloseSuccessBtn');
  if (profileBtn) profileBtn.onclick = () => { window.location.href = 'profile.html'; };
  if (closeBtn) closeBtn.onclick = () => { successDiv.remove(); };
  localStorage.removeItem('selected_plan_id');
  localStorage.removeItem('selected_plan_price');
  localStorage.removeItem('selected_plan_name');
  localStorage.removeItem('selected_plan_days');
}

async function submitPayment() {
  const token = localStorage.getItem('apex_token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  const planId = localStorage.getItem('selected_plan_id');
  const planPrice = parseFloat(localStorage.getItem('selected_plan_price') || '0');
  const planName = localStorage.getItem('selected_plan_name') || 'Membership';
  const planDays = parseInt(localStorage.getItem('selected_plan_days') || '30', 10);
  if (!planId || planPrice <= 0) {
    showPaymentError('Please select a plan first.');
    return;
  }

  const method = localStorage.getItem('selected_payment_method') || selectedMethod || 'CASH';
  const methodErr = paymentValidationError(method);
  if (methodErr) {
    showPaymentError(methodErr);
    return;
  }

  const confirmBtn = document.getElementById('confirm-payment-btn')
    || document.getElementById('completeBtn')
    || document.querySelector('.confirm-payment, .pay-btn, [onclick*="pay"], [onclick*="Payment"]');
  if (confirmBtn) {
    confirmBtn.textContent = 'Processing...';
    confirmBtn.disabled = true;
  }

  try {
    let member = await resolveCurrentMember();
    if (!member || member.id == null) {
      member = await ensureMemberForCurrentUser();
    }
    if (!member || member.id == null) {
      throw new Error('Could not resolve member profile. Ensure you are logged in as a MEMBER.');
    }

    const payment = await authFetch('/api/payments', {
      method: 'POST',
      body: JSON.stringify({
        memberId: member.id,
        memberName: localStorage.getItem('apex_username') || member.fullName || 'Member',
        memberEmail: member.email || undefined,
        amount: planPrice,
        currency: 'USD',
        paymentType: APEX_PAYMENT_TYPE.MEMBERSHIP,
        description: `${planName} - ${method}`
      })
    });

    const validUntil = await extendMembershipAfterPayment(planName, planDays);
    if (validUntil) localStorage.setItem('membership_end_date', validUntil);

    showPaymentSuccess(payment, planName, method, planPrice);
    if (confirmBtn) {
      confirmBtn.textContent = 'COMPLETE PAYMENT';
      confirmBtn.disabled = false;
    }
  } catch (e) {
    let msg = e.message || 'Payment failed. Please try again.';
    if (e.status === 403) msg = 'Access denied. MEMBERS role required for payments.';
    showPaymentError(msg);
    if (confirmBtn) {
      confirmBtn.textContent = 'COMPLETE PAYMENT';
      confirmBtn.disabled = false;
    }
  }
}

async function loadPlans() {
  const container = document.getElementById('plansGrid');
  if (!container) return;

  container.innerHTML = '<p class="text-secondary text-center w-100 py-4">Loading...</p>';

  // IMPORTANT: public endpoint, no Authorization. Use plain fetch via required publicFetch().
  const plans = await publicFetch('/api/payments/plans/active');
  if (plans === null) {
    container.innerHTML = '<p class="text-secondary text-center w-100 py-4">Could not load data. Please try again.</p>';
    return;
  }
  if (!Array.isArray(plans) || plans.length === 0) {
    container.innerHTML = '<p class="text-secondary text-center w-100 py-4">No plans available at the moment</p>';
    return;
  }

  container.innerHTML = '';
  plans.forEach((p) => {
    const card = document.createElement('div');
    card.className = 'pricing-card visible-on-scroll';
    card.dataset.planId = String(p.id);
    card.innerHTML = `
      <h3 class="pricing-name">${escapeHtml(p.name || 'Plan')}</h3>
      <div class="pricing-price">
        <span class="price-amount">${nicePrice(p.price || 0)}</span>
        <span class="price-period">${escapeHtml(p.durationDays ? `${p.durationDays} days` : 'membership')}</span>
      </div>
      <ul class="pricing-features">
        <li class="pricing-feature">
          <i class="bi bi-check-lg feature-icon text-accent"></i>
          <span class="feature-text">${escapeHtml(p.description || '')}</span>
        </li>
        <li class="pricing-feature">
          <i class="bi bi-check-lg feature-icon text-accent"></i>
          <span class="feature-text">${escapeHtml(p.classesIncluded != null ? `${p.classesIncluded} classes included` : '')}</span>
        </li>
      </ul>
      <a href="#" class="pricing-link select-plan-btn">Select Plan</a>
    `;
    container.appendChild(card);
  });

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.select-plan-btn');
    if (!btn) return;
    e.preventDefault();
    const card = btn.closest('.pricing-card');
    const planId = card?.dataset.planId;
    const plan = plans.find((x) => String(x.id) === String(planId));
    if (!plan) return;

    // STEP A — Plan selection
    selectedPlan = { id: plan.id, name: plan.name, price: Number(plan.price || 0), durationDays: Number(plan.durationDays || 30) };
    localStorage.setItem('selected_plan_id', String(plan.id));
    localStorage.setItem('selected_plan_price', String(plan.price || 0));
    localStorage.setItem('selected_plan_name', String(plan.name || 'Plan'));
    localStorage.setItem('selected_plan_days', String(plan.durationDays || 30));

    // highlight selected using existing "featured" style
    container.querySelectorAll('.pricing-card').forEach((el) => el.classList.remove('featured'));
    card.classList.add('featured');

    // update summary fields if present
    const nameEl = document.getElementById('summaryPlanName');
    const durEl = document.getElementById('summaryDuration');
    const priceEl = document.getElementById('summaryPrice');
    if (nameEl) nameEl.textContent = selectedPlan.name || 'Plan';
    if (durEl) durEl.textContent = plan.durationDays ? `${plan.durationDays} days` : 'membership';
    if (priceEl) priceEl.textContent = nicePrice(selectedPlan.price);

    const paymentMethodsSection = document.querySelector('.payment-methods-section');
    if (paymentMethodsSection) {
      paymentMethodsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // Restore preselected plan from localStorage if available
  const selectedPlanId = localStorage.getItem('selected_plan_id');
  if (selectedPlanId) {
    const pre = plans.find((x) => String(x.id) === String(selectedPlanId));
    const preCard = container.querySelector(`.pricing-card[data-plan-id="${selectedPlanId}"]`);
    if (pre && preCard) {
      preCard.classList.add('featured');
      selectedPlan = { id: pre.id, name: pre.name, price: Number(pre.price || 0), durationDays: Number(pre.durationDays || 30) };
      const nameEl = document.getElementById('summaryPlanName');
      const durEl = document.getElementById('summaryDuration');
      const priceEl = document.getElementById('summaryPrice');
      if (nameEl) nameEl.textContent = selectedPlan.name || 'Plan';
      if (durEl) durEl.textContent = pre.durationDays ? `${pre.durationDays} days` : 'membership';
      if (priceEl) priceEl.textContent = nicePrice(selectedPlan.price);
    }
  }
}

function wirePaymentMethods() {
  const paymentRoot = document.querySelector('.payment-methods-section');
  if (!paymentRoot) return;

  function updateFormVisibility() {
    // Hide all form containers
    paymentRoot.querySelectorAll('.card-form-container, .ewallet-form-container, .instapay-form-container, .cash-form-container').forEach((container) => {
      container.style.display = 'none';
    });

    // Show the form container for the selected method
    const checked = paymentRoot.querySelector('input[name="paymentMethod"]:checked');
    if (checked) {
      const method = checked.value;
      const group = checked.closest('.payment-method-group');
      if (group) {
        let formContainer = null;
        if (method === 'card') {
          formContainer = group.querySelector('.card-form-container');
        } else if (method === 'ewallet') {
          formContainer = group.querySelector('.ewallet-form-container');
        } else if (method === 'instapay') {
          formContainer = group.querySelector('.instapay-form-container');
        } else if (method === 'cash') {
          formContainer = group.querySelector('.cash-form-container');
        }
        if (formContainer) {
          formContainer.style.display = 'block';
        }
      }
    }
  }

  paymentRoot.querySelectorAll('input[name="paymentMethod"]').forEach((input) => {
    input.addEventListener('change', () => {
      selectedMethod = methodFromRadio(input.value);
      localStorage.setItem('selected_payment_method', selectedMethod || 'CASH');
      paymentRoot.querySelectorAll('.payment-method-group').forEach((g) => {
        g.style.borderColor = 'rgba(255,255,255,0.08)';
      });
      const group = input.closest('.payment-method-group');
      if (group) group.style.borderColor = 'rgba(255,255,255,0.35)';
      updateFormVisibility();
    });
  });

  // Initialize visibility on page load
  updateFormVisibility();

  // default method
  const checked = paymentRoot.querySelector('input[name="paymentMethod"]:checked');
  selectedMethod = methodFromRadio(checked?.value);
  localStorage.setItem('selected_payment_method', selectedMethod || 'CASH');

  const confirmBtn = document.getElementById('confirm-payment-btn') || document.getElementById('completeBtn');
  if (confirmBtn) {
    confirmBtn.onclick = async (e) => {
      e.preventDefault();
      await submitPayment();
    };
  }
}

function showBookingMessage(msg, type) {
  let el = document.getElementById('booking-msg');
  if (!el) {
    el = document.createElement('div');
    el.id = 'booking-msg';
    const btn = document.getElementById('join-btn')
      || document.getElementById('heroJoinNowBtn')
      || document.querySelector('.join-btn, .book-btn');
    if (btn) btn.parentNode.insertBefore(el, btn.nextSibling);
    else document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.cssText = `margin-top:12px;padding:12px 16px;font-size:14px;color:${type === 'success' ? '#00e676' : type === 'error' ? '#ff3c3c' : '#fff'};background:${type === 'success' ? 'rgba(0,230,118,0.1)' : type === 'error' ? 'rgba(255,60,60,0.1)' : 'rgba(255,255,255,0.1)'};border:1px solid ${type === 'success' ? '#00e676' : type === 'error' ? '#ff3c3c' : '#666'};`;
  el.style.display = 'block';
}

let __currentClassDetails = null;

async function joinClass() {
  const token = localStorage.getItem('apex_token');
  if (!token) {
    // Save the current class URL so we can return after login
    localStorage.setItem('apex_class_redirect', window.location.href);
    window.location.href = 'login.html';
    return;
  }

  // Only MEMBER role is allowed to book classes
  const role = (localStorage.getItem('apex_role') || '').toUpperCase();
  if (role && role !== 'MEMBER') {
    showBookingMessage('Class booking is only available for members. Please log in with a member account.', 'error');
    return;
  }
  const classId = new URLSearchParams(window.location.search).get('id');
  if (!classId) {
    showBookingMessage('Class not found.', 'error');
    return;
  }

  let classData = __currentClassDetails || {};
  try {
    const c = await publicFetch('/api/trainers/classes/' + encodeURIComponent(classId));
    if (c && typeof c === 'object') classData = c;
  } catch (e) {}

  let member = await resolveCurrentMember();
  if (!member || member.id == null) {
    member = await ensureMemberForCurrentUser();
  }
  if (!member || member.id == null) {
    showBookingMessage('Could not load member profile. Try logging in again.', 'error');
    return;
  }
  const memberId = member.id;

  const btn = document.getElementById('join-btn')
    || document.getElementById('heroJoinNowBtn')
    || document.querySelector('.join-btn, .book-btn, [onclick*="join"], [onclick*="book"]');
  if (btn) { btn.textContent = 'Booking...'; btn.disabled = true; }
  try {
    await ensureClassBookingPayment(memberId, parseInt(classId, 10));

    const booking = await authFetch('/api/members/bookings', {
      method: 'POST',
      body: JSON.stringify({
        memberId,
        classId: parseInt(classId, 10),
        className: classData.name || 'Class',
        trainerName: classData.trainerName || '',
        classDateTime: classData.classDateTime || new Date().toISOString(),
        notes: 'Booked from website'
      })
    });

    const enrolled = JSON.parse(localStorage.getItem('apex_enrolled') || '[]');
    if (!enrolled.includes(parseInt(classId, 10))) enrolled.push(parseInt(classId, 10));
    localStorage.setItem('apex_enrolled', JSON.stringify(enrolled));
    if (btn) {
      btn.textContent = '✓ Enrolled!';
      btn.disabled = true;
      btn.style.background = '#00e676';
      btn.style.color = '#000';
      btn.style.cursor = 'default';
    }
    showBookingMessage('Successfully enrolled! Booking #' + (booking && booking.id ? booking.id : ''), 'success');
  } catch (e) {
    let msg = e.message || 'Booking failed';
    if (e.status === 403) {
      msg = 'Booking is restricted to authenticated users. Please log in and try again.';
    } else if (e.status === 402 || String(msg).toLowerCase().includes('payment')) {
      msg = 'Class booking payment could not be verified. Please try again or contact support.';
    }
    if (String(msg).toLowerCase().includes('already')) {
      if (btn) {
        btn.textContent = '✓ Already Enrolled';
        btn.style.background = '#00e676';
        btn.style.color = '#000';
      }
      showBookingMessage('You are already enrolled in this class!', 'success');
      return;
    }
    if (btn) { btn.textContent = 'Join Now'; btn.disabled = false; }
    showBookingMessage(msg, 'error');
  }
}

// FIX 4 — Class details Join Now booking flow
async function loadClassDetailsAndWireBooking() {
  const joinBtn = document.getElementById('heroJoinNowBtn') || document.getElementById('ctaJoinNowBtn');
  const classId = new URLSearchParams(window.location.search).get('id');
  if (!classId) return;

  let gymClass = null;
  try {
    gymClass = localStorage.getItem('apex_token')
      ? await authFetch('/api/trainers/classes/' + encodeURIComponent(classId))
      : await publicFetch('/api/trainers/classes/' + encodeURIComponent(classId));
  } catch (e) {
    gymClass = null;
  }

  if (gymClass) {
    __currentClassDetails = gymClass;
    const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v ?? ''; };
    const setImg = (id, src) => { const el = document.getElementById(id); if (el && src) el.src = src; };
    const setHref = (id, href) => { const el = document.getElementById(id); if (el && href) el.href = href; };
    setText('className', gymClass.name || 'Class');
    setText('classDescription', gymClass.description || '');
    setText('classDuration', gymClass.durationMinutes != null ? gymClass.durationMinutes + ' min' : '—');
    setText('classCategory', gymClass.location || '');
    setText('classStatus', gymClass.status || '—');
    setText('classSessionMeta', niceDate(gymClass.classDateTime));
    setText('classCapacity', gymClass.spotsAvailable != null ? `${gymClass.spotsAvailable} spots left` : '—');
    setText('classLevel', gymClass.classType || 'OTHER');
    setImg('classImage', classImage(gymClass.classType).replace('w=400', 'w=800'));

    const trainerName = gymClass.trainerName || 'Trainer';
    setText('trainerName', trainerName);
    setImg('trainerImage', trainerAvatar(trainerName));
    setHref('trainerLink', gymClass.trainerId ? `trainer-profile.html?id=${encodeURIComponent(gymClass.trainerId)}` : '#');
    setHref('trainerProfileLink', gymClass.trainerId ? `trainer-profile.html?id=${encodeURIComponent(gymClass.trainerId)}` : '#');
  }

  if (!joinBtn) return;
  joinBtn.id = 'join-btn';

  const enrolledLocal = JSON.parse(localStorage.getItem('apex_enrolled') || '[]');
  if (enrolledLocal.includes(parseInt(classId, 10))) {
    joinBtn.textContent = '✓ Enrolled';
    joinBtn.disabled = true;
    joinBtn.style.background = '#00e676';
    joinBtn.style.color = '#000';
    return;
  }

  const token = localStorage.getItem('apex_token');
  const role = (localStorage.getItem('apex_role') || '').toUpperCase();

  if (gymClass && gymClass.spotsAvailable != null && Number(gymClass.spotsAvailable) <= 0) {
    // Class is full
    joinBtn.textContent = 'Class Full';
    joinBtn.disabled = true;
    joinBtn.style.opacity = '0.5';
  } else if (!token) {
    // Guest user — prompt to log in (saves return URL so they land back here after login)
    joinBtn.textContent = 'Login to Book';
    joinBtn.disabled = false;
    joinBtn.onclick = () => {
      localStorage.setItem('apex_class_redirect', window.location.href);
      window.location.href = 'login.html';
    };
  } else if (role && role !== 'MEMBER') {
    // Logged in but not a MEMBER (e.g. ADMIN / TRAINER)
    joinBtn.textContent = 'Members Only';
    joinBtn.disabled = true;
    joinBtn.title = 'Class booking is only available for members';
    joinBtn.style.opacity = '0.6';
  } else {
    // Authenticated MEMBER — wire the booking action
    joinBtn.textContent = 'Join Now';
    joinBtn.disabled = false;
    joinBtn.onclick = () => joinClass();
  }

  // Check server-side enrollment status (only for authenticated MEMBERs)
  if (token && role === 'MEMBER' && classId) {
    try {
      const member = await resolveCurrentMember();
      if (member && member.id != null) {
        const bookings = await apiGetBookings(member.id);
        const alreadyBooked = Array.isArray(bookings) && bookings.some((b) =>
          String(b.classId) === String(classId) && b.status !== 'CANCELLED'
        );
        if (alreadyBooked) {
          joinBtn.textContent = '✓ Enrolled';
          joinBtn.disabled = true;
          joinBtn.style.background = '#00e676';
          joinBtn.style.color = '#000';
        }
      }
    } catch (e) {
      console.log('Enrollment check failed:', e.message);
    }
  }
}

function initLoginPage() { if (isLoggedIn()) return redirectByRole(getRole()); const form = document.querySelector('form'); if (form) form.addEventListener('submit', (e) => { e.preventDefault(); doLogin(); }); }
function initSignupPage() { if (isLoggedIn()) return redirectByRole(getRole()); const form = document.querySelector('form'); if (form) form.addEventListener('submit', (e) => { e.preventDefault(); doSignup(); }); }

async function initPublicClassesPage() {
  const grid = document.getElementById('classes-grid') || document.getElementById('classesGrid');
  if (!grid) return;
  grid.innerHTML = '<p class="text-secondary text-center w-100 py-4">Loading classes…</p>';
  const list = await apiGetUpcomingClassesMaybeAuthed();
  if (!Array.isArray(list)) {
    grid.innerHTML = '<p class="text-secondary text-center w-100 py-4">Could not load classes</p>';
    return;
  }
  if (list.length === 0) {
    grid.innerHTML = '<p class="text-secondary text-center w-100 py-4">No upcoming classes</p>';
    return;
  }

  const imgForType = (type) => {
    const t = String(type || 'OTHER').toUpperCase();
    if (t === 'HIIT') return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400';
    if (t === 'YOGA') return 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400';
    if (t === 'PILATES') return 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400';
    if (t === 'STRENGTH') return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400';
    if (t === 'CARDIO') return 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400';
    if (t === 'SPINNING') return 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400';
    if (t === 'BOXING') return 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400';
    if (t === 'ZUMBA') return 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=400';
    return 'https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?w=400';
  };

  const esc = (s) => String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');

  grid.innerHTML = '';
  list
    .slice()
    .sort((a, b) => new Date(a.classDateTime || 0) - new Date(b.classDateTime || 0))
    .forEach((c, i) => {
      const card = document.createElement('div');
      card.className = 'class-card visible-on-scroll';
      card.style.animationDelay = `${i * 0.06}s`;
      const title = esc(c.name || 'Class');
      const when = esc(formatDateTime(c.classDateTime));
      const level = esc(c.classType || 'OTHER');
      const id = encodeURIComponent(c.id);
      card.innerHTML = `
        <a href="class-details.html?id=${id}" class="text-decoration-none">
          <div class="card-image-wrapper">
            <img src="${imgForType(c.classType)}" alt="${title}" class="card-image" loading="lazy">
            <div class="card-gradient"></div>
            <div class="card-info">
              <p class="card-role">${when}</p>
              <h3 class="card-name">${title}</h3>
              <p class="small text-white-50 mb-0">${level}</p>
            </div>
          </div>
        </a>
        <a href="class-details.html?id=${id}" class="card-link">
          <span>View Class</span>
          <span style="font-size: 1.125rem;">→</span>
        </a>
      `;
      card.classList.add('is-visible');
      grid.appendChild(card);
    });
}
async function initPublicTrainersPage() {
  const grid = document.getElementById('trainers-grid') || document.getElementById('trainersGrid');
  if (!grid) return;
  grid.innerHTML = '<p class="text-secondary text-center w-100 py-4">Loading trainers…</p>';

  // Requirement: call /api/trainers/active with Authorization header
  const list = await apiGetActiveTrainers();
  if (!Array.isArray(list)) {
    grid.innerHTML = '<p class="text-secondary text-center w-100 py-4">Could not load trainers</p>';
    return;
  }
  if (list.length === 0) {
    grid.innerHTML = '<p class="text-secondary text-center w-100 py-4">No trainers available</p>';
    return;
  }

  const esc = (s) => String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');

  const avatar = (fullName) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'Trainer')}&background=1a1a1a&color=ffffff&size=200`;

  grid.innerHTML = '';
  list.forEach((t, i) => {
    const card = document.createElement('div');
    card.className = 'trainer-card visible-on-scroll';
    card.style.animationDelay = `${i * 0.06}s`;
    const name = esc(t.fullName || 'Trainer');
    const spec = esc(t.specialization || '');
    const id = encodeURIComponent(t.id);
    const bio = esc(t.bio || '');
    const years = t.experienceYears != null ? esc(String(t.experienceYears)) : '';

    // Keep existing card structure/classes (matches site cards)
    card.innerHTML = `
      <a href="trainer-profile.html?id=${id}" class="text-decoration-none">
        <div class="card-image-wrapper">
          <img src="${avatar(t.fullName)}" alt="${name}" class="card-image" loading="lazy">
          <div class="card-gradient"></div>
          <div class="card-info">
            <p class="card-role">${spec}</p>
            <h3 class="card-name">${name}</h3>
            ${years ? `<p class="small text-white-50 mb-0">${years} yrs</p>` : ''}
          </div>
        </div>
      </a>
      <a href="trainer-profile.html?id=${id}" class="card-link">
        <span>View Profile</span>
        <span style="font-size: 1.125rem;">→</span>
      </a>
      ${bio ? `<p class="text-secondary small mt-2 mb-0">${bio}</p>` : ''}
    `;
    card.classList.add('is-visible');
    grid.appendChild(card);
  });
}
async function initPublicPricingPage() {
  const pricingGrid = document.getElementById('pricingGrid');
  const plans = await apiGetPlans();
  if (pricingGrid && Array.isArray(plans)) {
    pricingGrid.innerHTML = plans.map((p) => `
      <div class="pricing-card visible-on-scroll">
        <h3 class="pricing-name">${p.name || 'Plan'}</h3>
        <div class="pricing-price">
          <span class="price-amount">$${Number(p.price || 0).toFixed(2)}</span>
          <span class="price-period">${p.durationDays ? `${p.durationDays} days` : 'membership'}</span>
        </div>
        <ul class="pricing-features">
          <li class="pricing-feature">
            <i class="bi bi-check-lg feature-icon text-accent"></i>
            <span class="feature-text">${(p.description || 'Membership plan')}</span>
          </li>
        </ul>
        <a href="payment.html?planId=${p.id}" class="pricing-link">SELECT PLAN</a>
      </div>
    `).join('');
  }

  // Payment page behavior (order summary + processing)
  const plansGrid = document.getElementById('plansGrid');
  if (plansGrid) {
    if (!Array.isArray(plans)) {
      plansGrid.innerHTML = '<p class="text-secondary text-center w-100 py-4">Could not load plans</p>';
    } else {
      plansGrid.innerHTML = plans.map((p) => `
        <div class="pricing-card">
          <h3 class="pricing-name">${p.name || 'Plan'}</h3>
          <div class="pricing-price">
            <span class="price-amount">$${Number(p.price || 0).toFixed(2)}</span>
            <span class="price-period">${p.durationDays ? `${p.durationDays} days` : 'membership'}</span>
          </div>
          <p class="text-secondary small mb-3">${p.description || ''}</p>
          <a href="payment.html?planId=${p.id}" class="pricing-link">Select Plan</a>
        </div>
      `).join('');
    }
  }

  const params = new URLSearchParams(window.location.search);
  const selectedPlanId = params.get('planId');
  const selected = Array.isArray(plans) ? (plans.find((x) => String(x.id) === String(selectedPlanId)) || plans[0]) : null;

  if (selected) {
    const planName = document.getElementById('summaryPlanName');
    const dur = document.getElementById('summaryDuration');
    const price = document.getElementById('summaryPrice');
    const features = document.getElementById('summaryFeatures');
    if (planName) planName.textContent = selected.name || 'Plan';
    if (dur) dur.textContent = selected.durationDays ? `${selected.durationDays} days` : 'membership';
    if (price) price.textContent = `$${Number(selected.price || 0).toFixed(2)}`;
    if (features) {
      features.innerHTML = '';
      const div = document.createElement('div');
      div.className = 'feature-item';
      div.innerHTML = `<i class="bi bi-check-circle"></i><span>${selected.description || 'Membership plan'}</span>`;
      features.appendChild(div);
    }
  }

  // submit is handled by wirePaymentMethods -> submitPayment()
}

async function adminCreateMembershipPlan() {
  const token = localStorage.getItem('apex_token');
  const role = localStorage.getItem('apex_role');
  if (!token || role !== 'ADMIN') {
    alert('Admin access required.');
    return;
  }
  const name = document.getElementById('adminPlanName')?.value?.trim();
  const description = document.getElementById('adminPlanDescription')?.value?.trim() || '';
  const priceRaw = document.getElementById('adminPlanPrice')?.value;
  const durationRaw = document.getElementById('adminPlanDurationDays')?.value;
  const classesRaw = document.getElementById('adminPlanClassesIncluded')?.value;
  const pt = document.getElementById('adminPlanPtIncluded')?.checked === true;
  const msgEl = document.getElementById('adminCreatePlanMsg');

  if (!name) {
    if (msgEl) msgEl.textContent = 'Plan name is required.';
    return;
  }
  const price = parseFloat(priceRaw);
  if (Number.isNaN(price) || price < 0) {
    if (msgEl) msgEl.textContent = 'Enter a valid price (0 or greater).';
    return;
  }

  const durationDays = durationRaw === '' || durationRaw == null ? null : parseInt(durationRaw, 10);
  const classesIncluded = classesRaw === '' || classesRaw == null ? null : parseInt(classesRaw, 10);
  const body = {
    name,
    description: description || null,
    price,
    durationDays: Number.isFinite(durationDays) ? durationDays : null,
    classesIncluded: Number.isFinite(classesIncluded) ? classesIncluded : null,
    personalTrainingIncluded: pt
  };

  const btn = document.getElementById('adminCreatePlanBtn');
  if (btn) {
    btn.textContent = 'Creating...';
    btn.disabled = true;
  }
  if (msgEl) msgEl.textContent = '';
  try {
    await authFetch('/api/payments/plans', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    window.location.reload();
  } catch (e) {
    if (msgEl) msgEl.textContent = e.message || 'Could not create plan.';
  } finally {
    if (btn) {
      btn.textContent = 'Create Plan';
      btn.disabled = false;
    }
  }
}

async function createTrainer() {
  const token = localStorage.getItem('apex_token');
  const role = localStorage.getItem('apex_role');
  if (!token || role !== 'ADMIN') {
    alert('Admin access required.');
    return;
  }
  const userSelect = document.getElementById('adminCreateTrainerUserSelect');
  const userIdInput = document.getElementById('adminCreateTrainerUserId');
  const userId = userSelect?.value || userIdInput?.value;
  const fullName = document.getElementById('trainer-fullname')?.value
    || document.getElementById('t-fullname')?.value
    || document.getElementById('trainer_name')?.value
    || document.getElementById('adminCreateTrainerFullName')?.value;
  const email = document.getElementById('trainer-email')?.value
    || document.getElementById('t-email')?.value
    || document.getElementById('adminCreateTrainerEmail')?.value;
  const phone = document.getElementById('trainer-phone')?.value
    || document.getElementById('t-phone')?.value
    || document.getElementById('adminCreateTrainerPhone')?.value || '';
  const spec = document.getElementById('trainer-spec')?.value
    || document.getElementById('t-spec')?.value
    || document.getElementById('adminCreateTrainerSpec')?.value || '';
  const bio = document.getElementById('trainer-bio')?.value
    || document.getElementById('t-bio')?.value
    || document.getElementById('adminCreateTrainerBio')?.value || '';
  const exp = document.getElementById('trainer-exp')?.value
    || document.getElementById('t-exp')?.value
    || document.getElementById('adminCreateTrainerExp')?.value || '0';
  const msgEl = document.getElementById('adminCreateTrainerMsg');

  if (msgEl) {
    msgEl.textContent = '';
    msgEl.classList.remove('success');
  }

  if (!userId || !fullName || !email) {
    const message = 'Please select a user and provide a name and email for the trainer.';
    if (msgEl) {
      msgEl.textContent = message;
      msgEl.classList.add('visible');
    } else {
      alert(message);
    }
    return;
  }

  const btn = document.getElementById('adminCreateTrainerBtn')
    || document.querySelector('[onclick*="createTrainer"], [onclick*="addTrainer"]');
  if (btn) { btn.textContent = 'Creating...'; btn.disabled = true; }
  try {
    const users = await apiGetAllUsers();
    const user = Array.isArray(users)
      ? users.find((u) => String(u.id) === String(userId) || String(u.username) === String(userId))
      : null;
    if (!user || !user.id) throw new Error('Selected user does not exist.');

    const trainer = await authFetch('/api/trainers', {
      method: 'POST',
      body: JSON.stringify({
        userId: parseInt(user.id, 10),
        fullName: String(fullName).trim(),
        email: String(email).trim(),
        phoneNumber: String(phone).trim(),
        specialization: String(spec).trim(),
        bio: String(bio).trim(),
        experienceYears: parseInt(exp, 10) || 0
      })
    });
    if (msgEl) {
      msgEl.textContent = 'Trainer created successfully! ID: ' + (trainer?.id ?? 'unknown');
      msgEl.classList.add('visible', 'success');
    } else {
      alert('Trainer created successfully! ID: ' + (trainer?.id ?? 'unknown'));
    }
    window.location.reload();
  } catch (e) {
    const message = 'Error: ' + (e.message || 'Could not create trainer.');
    if (msgEl) {
      msgEl.textContent = message;
      msgEl.classList.add('visible');
    } else {
      alert(message);
    }
  } finally {
    if (btn) { btn.textContent = 'Create Trainer'; btn.disabled = false; }
  }
}

async function createClass() {
  const token = localStorage.getItem('apex_token');
  const role = localStorage.getItem('apex_role');
  if (!token || (role !== 'ADMIN' && role !== 'TRAINER')) {
    alert('Admin or Trainer access required.');
    return;
  }
  const name = document.getElementById('class-name')?.value
    || document.getElementById('c-name')?.value
    || document.getElementById('adminCreateClassName')?.value;
  const desc = document.getElementById('class-desc')?.value
    || document.getElementById('c-desc')?.value
    || document.getElementById('adminCreateClassDesc')?.value || '';
  const location = document.getElementById('class-location')?.value
    || document.getElementById('c-location')?.value
    || document.getElementById('adminCreateClassLocation')?.value || '';
  const trainerId = document.getElementById('class-trainerid')?.value
    || document.getElementById('c-trainerid')?.value
    || document.getElementById('adminCreateClassTrainerId')?.value
    || document.getElementById('adminCreateClassTrainerSelect')?.value;
  const datetime = document.getElementById('class-datetime')?.value
    || document.getElementById('c-datetime')?.value
    || document.getElementById('adminCreateClassDateTime')?.value;
  const duration = document.getElementById('class-duration')?.value
    || document.getElementById('c-duration')?.value
    || document.getElementById('adminCreateClassDuration')?.value || '60';
  const capacity = document.getElementById('class-capacity')?.value
    || document.getElementById('c-capacity')?.value
    || document.getElementById('adminCreateClassCapacity')?.value || '20';
  const classType = document.getElementById('class-type')?.value
    || document.getElementById('c-type')?.value
    || document.getElementById('adminCreateClassType')?.value || 'OTHER';
  const msgEl = document.getElementById('adminCreateClassMsg');
  if (msgEl) {
    msgEl.textContent = '';
    msgEl.classList.remove('visible', 'success');
  }

  if (!name || !datetime) {
    const msg = 'Please fill in Class Name and Date/Time.';
    if (msgEl) {
      msgEl.textContent = msg;
      msgEl.classList.add('visible');
    } else {
      alert(msg);
    }
    return;
  }

  const btn = document.getElementById('adminCreateClassBtn')
    || document.querySelector('[onclick*="createClass"], [onclick*="addClass"]');
  if (btn) { btn.textContent = 'Creating...'; btn.disabled = true; }

  let formattedDatetime = datetime;
  if (datetime && !datetime.includes('T')) formattedDatetime = datetime.replace(' ', 'T');
  if (datetime && datetime.length === 16) formattedDatetime = datetime + ':00';

  try {
    let finalTrainerId = parseInt(trainerId, 10);
    if (role === 'TRAINER') {
      const me = await authFetch('/api/auth/me');
      if (me && me.id != null) {
        try {
          const tr = await authFetch('/api/trainers/user/' + encodeURIComponent(me.id));
          if (tr && tr.id != null) finalTrainerId = Number(tr.id);
        } catch (e) {}
      }
    }

    if (role === 'ADMIN' && (!finalTrainerId || Number.isNaN(finalTrainerId))) {
      const msg = 'Trainer is required. Please select a trainer before creating a class.';
      if (msgEl) {
        msgEl.textContent = msg;
        msgEl.classList.add('visible');
      } else {
        alert(msg);
      }
      return;
    }

    await authFetch('/api/trainers/' + encodeURIComponent(finalTrainerId));

    const gymClass = await authFetch('/api/trainers/classes', {
      method: 'POST',
      body: JSON.stringify({
        name: String(name).trim(),
        description: String(desc).trim(),
        location: String(location).trim(),
        trainerId: finalTrainerId,
        classDateTime: formattedDatetime,
        durationMinutes: parseInt(duration, 10) || 60,
        maxCapacity: parseInt(capacity, 10) || 20,
        classType: String(classType).trim().toUpperCase()
      })
    });
    alert('Class created successfully! ID: ' + gymClass.id);
    window.location.reload();
  } catch (e) {
    const msg = 'Error: ' + (e.message || 'Could not create class');
    if (msgEl) {
      msgEl.textContent = msg;
      msgEl.classList.add('visible');
    } else {
      alert(msg);
    }
  } finally {
    if (btn) { btn.textContent = 'Create Class'; btn.disabled = false; }
  }
}

async function initProfilePage() {
  if (!requireLogin()) return;

  const loadingSpinner = document.getElementById('loadingSpinner');
  const notLoggedIn = document.getElementById('notLoggedIn');
  const profileContent = document.getElementById('profileContent');
  const dashboardSections = document.getElementById('dashboardSections');
  const profileDropdownHeader = document.getElementById('profileDropdownHeader');
  const logoutBtn = document.getElementById('logoutBtn');

  if (loadingSpinner) loadingSpinner.style.display = 'block';
  if (notLoggedIn) notLoggedIn.style.display = 'none';
  if (profileContent) profileContent.style.display = 'none';
  if (profileDropdownHeader) profileDropdownHeader.style.display = 'block';
  if (logoutBtn) logoutBtn.onclick = doLogout;

  const me = await apiFetch('/api/auth/me');
  if (!me || me.error) {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (notLoggedIn) notLoggedIn.style.display = 'block';
    return;
  }

  const role = String(me.role || getRole() || '').toUpperCase();
  const username = me.username || getUsername() || 'User';
  const email = me.email || '-';
  const createdAt = me.createdAt || null;
  const avatarImg = document.getElementById('profileAvatarImg');
  if (avatarImg) {
    avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=e8ff00&color=000000&size=200&bold=true`;
    avatarImg.onerror = () => { avatarImg.src = `https://ui-avatars.com/api/?name=User&background=e8ff00&color=000000&size=200`; };
  }

  const userNameEl = document.getElementById('userName');
  const userRoleEl = document.getElementById('userRole');
  const userEmailEl = document.getElementById('userEmail');
  const joinDateEl = document.getElementById('joinDate');

  if (userNameEl) userNameEl.textContent = me.fullName || username;
  if (userRoleEl) userRoleEl.textContent = role || '-';
  if (userEmailEl) userEmailEl.textContent = email;
  if (joinDateEl) joinDateEl.textContent = createdAt ? formatDate(createdAt) : '-';

  const logoutBtnMain = document.getElementById('logoutBtnMain');
  if (logoutBtnMain) logoutBtnMain.onclick = doLogout;
  const primaryActionBtn = document.getElementById('primaryActionBtn');
  if (primaryActionBtn && (role === 'ADMIN' || role === 'TRAINER')) {
    primaryActionBtn.style.display = 'none';
  }
  if (role === 'ADMIN' || role === 'TRAINER') {
    const upgradeSection = document.querySelector('.upgrade-section, #upgrade-plan, .pricing-section, .plan-upgrade, [data-section="upgrade"]');
    if (upgradeSection) upgradeSection.style.display = 'none';
  }

  // SECTION B/C/D rendered into existing dashboardSections container
  if (dashboardSections) {
    dashboardSections.style.display = 'grid';
    dashboardSections.innerHTML = '';

    const mkCard = (title, innerHtml) => {
      const card = document.createElement('div');
      card.className = 'dashboard-card';
      card.innerHTML = `<div class="dashboard-card-header"><div class="dashboard-card-title"><span>${title}</span></div></div>${innerHtml}`;
      return card;
    };

    if (role === 'ADMIN') {
      const [users, members, trainers, revenue, payments, classes, membershipPlans] = await Promise.all([
        apiGetAllUsers(),
        apiGetMembers(),
        apiGetTrainers(),
        apiGetRevenue(),
        apiGetPayments(),
        apiGetClasses(),
        apiGetAllMembershipPlans()
      ]);

      dashboardSections.appendChild(
        mkCard(
          'Admin Stats',
          `<div class="profile-details">
            <div class="detail-item"><span class="detail-label">Total Users</span><span class="detail-value">${Array.isArray(users) ? users.length : '-'}</span></div>
            <div class="detail-item"><span class="detail-label">Total Members</span><span class="detail-value">${Array.isArray(members) ? members.length : '-'}</span></div>
            <div class="detail-item"><span class="detail-label">Total Trainers</span><span class="detail-value">${Array.isArray(trainers) ? trainers.length : '-'}</span></div>
            <div class="detail-item"><span class="detail-label">Total Revenue</span><span class="detail-value">${revenue?.totalRevenue ?? '-'}</span></div>
          </div>`
        )
      );

      // User management table
      if (Array.isArray(users)) {
        const rows = users
          .map(
            (u) => `<tr>
              <td>${u.id}</td>
              <td>${u.username || '-'}</td>
              <td>${u.email || '-'}</td>
              <td>${u.role || '-'}</td>
              <td>${u.active ? 'Active' : 'Inactive'}</td>
              <td>${u.active ? `<button class="action-link" data-deactivate-user="${u.id}">Deactivate</button>` : ''}</td>
            </tr>`
          )
          .join('');
        const card = mkCard(
          'User Management',
          `<table class="table-dashboard"><thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table>`
        );
        card.addEventListener('click', async (e) => {
          const btn = e.target.closest('[data-deactivate-user]');
          if (!btn) return;
          const id = btn.getAttribute('data-deactivate-user');
          await apiDeactivateUser(id);
          window.location.reload();
        });
        dashboardSections.appendChild(card);
      } else {
        dashboardSections.appendChild(mkCard('User Management', `<div class="empty-state">No data found</div>`));
      }

      // Trainer management table
      if (Array.isArray(trainers) && trainers.length) {
        const rows = trainers.map((t) => `<tr>
          <td>${t.id ?? '-'}</td>
          <td>${escapeHtml(t.fullName || '-')}</td>
          <td>${escapeHtml(t.email || '-')}</td>
          <td>${escapeHtml(t.specialization || '-')}</td>
          <td>${escapeHtml(String(t.experienceYears ?? '-'))}</td>
          <td>${escapeHtml(t.status || '-')}</td>
        </tr>`).join('');
        dashboardSections.appendChild(mkCard(
          'Trainer Management',
          `<table class="table-dashboard"><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Specialization</th><th>Years</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`
        ));
      } else {
        dashboardSections.appendChild(mkCard('Trainer Management', `<div class="empty-state">No data found</div>`));
      }

      // Create trainer form
      const userSelectOptions = Array.isArray(users) && users.length
        ? `
            <select id="adminCreateTrainerUserSelect" class="form-control">
              <option value="">Select a registered user</option>
              ${users.map((u) => `<option value="${u.id}">${escapeHtml(u.username || u.email || 'User')} — ${escapeHtml(u.email || '-')}</option>`).join('')}
            </select>
          `
        : `<input id="adminCreateTrainerUserId" class="form-control" type="number" min="1" placeholder="User ID">`;

      const createTrainerCard = mkCard('Create Trainer', `
        <div class="profile-details form-section">
          <div class="form-group"><label>User account</label>${userSelectOptions}</div>
          <div class="form-group"><label>Full Name</label><input id="adminCreateTrainerFullName" class="form-control" placeholder="Trainer name"></div>
          <div class="form-group"><label>Email</label><input id="adminCreateTrainerEmail" class="form-control" type="email" placeholder="Trainer email"></div>
          <div class="form-group"><label>Phone</label><input id="adminCreateTrainerPhone" class="form-control" placeholder="Trainer phone"></div>
          <div class="form-group"><label>Specialization</label><input id="adminCreateTrainerSpec" class="form-control" placeholder="e.g. HIIT, Yoga"></div>
          <div class="form-group"><label>Bio</label><textarea id="adminCreateTrainerBio" class="form-control" rows="2" placeholder="Short trainer bio"></textarea></div>
          <div class="form-group"><label>Experience Years</label><input id="adminCreateTrainerExp" class="form-control" type="number" min="0" placeholder="0"></div>
          <div class="form-group"><button id="adminCreateTrainerBtn" class="btn-admin-create">Create Trainer</button></div>
          <div id="adminCreateTrainerMsg" class="admin-msg"></div>
        </div>
      `);
      dashboardSections.appendChild(createTrainerCard);

      // Create class form
      const trainerSelect = Array.isArray(trainers) && trainers.length
        ? `<select id="adminCreateClassTrainerSelect" class="form-control">
            <option value="">Select trainer...</option>
            ${trainers.map((t) => `<option value="${t.id}">${escapeHtml(t.fullName || 'Trainer')} (ID: ${t.id})</option>`).join('')}
           </select>`
        : `<input id="adminCreateClassTrainerId" class="form-control" type="number" min="1" placeholder="Trainer ID">`;
      const createClassCard = mkCard('Create Class', `
        <div class="profile-details form-section">
          <div class="form-group"><label>Name</label><input id="adminCreateClassName" class="form-control" placeholder="e.g. Morning HIIT"></div>
          <div class="form-group"><label>Description</label><textarea id="adminCreateClassDesc" class="form-control" rows="2" placeholder="Brief description"></textarea></div>
          <div class="form-group"><label>Location</label><input id="adminCreateClassLocation" class="form-control" placeholder="Gym room or online"></div>
          <div class="form-group"><label>Trainer</label>${trainerSelect}</div>
          <div class="form-group"><label>Date & Time</label><input id="adminCreateClassDateTime" class="form-control" type="datetime-local"></div>
          <div class="form-group"><label>Duration Minutes</label><input id="adminCreateClassDuration" class="form-control" type="number" min="1" placeholder="60"></div>
          <div class="form-group"><label>Max Capacity</label><input id="adminCreateClassCapacity" class="form-control" type="number" min="1" placeholder="20"></div>
          <div class="form-group"><label>Class Type</label><input id="adminCreateClassType" class="form-control" placeholder="HIIT/YOGA/Strength"></div>
          <div class="form-group"><button id="adminCreateClassBtn" class="btn-admin-create">Create Class</button></div>
          <div id="adminCreateClassMsg" class="admin-msg"></div>
        </div>
      `);
      dashboardSections.appendChild(createClassCard);

      const createPlanCard = mkCard('Create Membership Plan', `
        <div class="profile-details">
          <div class="detail-item"><span class="detail-label">Plan name</span><input id="adminPlanName" class="form-control" placeholder="e.g. Premium 90-Day"></div>
          <div class="detail-item"><span class="detail-label">Description</span><input id="adminPlanDescription" class="form-control" placeholder="Shown on pricing"></div>
          <div class="detail-item"><span class="detail-label">Price (USD)</span><input id="adminPlanPrice" class="form-control" type="number" min="0" step="0.01" placeholder="49.99"></div>
          <div class="detail-item"><span class="detail-label">Duration (days)</span><input id="adminPlanDurationDays" class="form-control" type="number" min="1" placeholder="30"></div>
          <div class="detail-item"><span class="detail-label">Classes included</span><input id="adminPlanClassesIncluded" class="form-control" type="number" min="0" placeholder="optional"></div>
          <div class="detail-item d-flex align-items-center gap-2"><input id="adminPlanPtIncluded" type="checkbox" class="form-check-input"><span class="detail-label mb-0">Personal training included</span></div>
          <div class="detail-item"><button id="adminCreatePlanBtn" class="action-link">Create Plan</button></div>
          <div id="adminCreatePlanMsg" class="empty-state"></div>
        </div>
      `);
      dashboardSections.appendChild(createPlanCard);

      if (Array.isArray(membershipPlans)) {
        const planRows = membershipPlans
          .map(
            (p) => `<tr>
              <td>${p.id ?? '-'}</td>
              <td>${escapeHtml(p.name || '-')}</td>
              <td>${escapeHtml(p.description || '')}</td>
              <td>${p.price != null ? Number(p.price).toFixed(2) : '-'}</td>
              <td>${p.durationDays ?? '-'}</td>
              <td>${p.classesIncluded ?? '-'}</td>
              <td>${p.personalTrainingIncluded ? 'Yes' : 'No'}</td>
              <td>${p.active === false ? 'Inactive' : 'Active'}</td>
              <td>${p.active !== false ? `<button class="action-link" data-deactivate-plan="${p.id}">Deactivate</button>` : ''}</td>
            </tr>`
          )
          .join('');
        const planCard = mkCard(
          'Membership Plans',
          `<table class="table-dashboard"><thead><tr><th>ID</th><th>Name</th><th>Description</th><th>Price</th><th>Days</th><th>Classes</th><th>PT</th><th>Status</th><th>Action</th></tr></thead><tbody>${planRows || '<tr><td colspan="9">No plans yet</td></tr>'}</tbody></table>`
        );
        planCard.addEventListener('click', async (e) => {
          const btn = e.target.closest('[data-deactivate-plan]');
          if (!btn) return;
          const id = btn.getAttribute('data-deactivate-plan');
          if (!confirm('Deactivate this plan? It will no longer appear for new purchases.')) return;
          try {
            await apiDeactivateMembershipPlan(id);
            window.location.reload();
          } catch (err) {
            alert(err.message || 'Could not deactivate plan.');
          }
        });
        dashboardSections.appendChild(planCard);
      }

      // Payments table
      if (Array.isArray(payments)) {
        const rows = payments
          .map(
            (p) => `<tr>
              <td>${p.id}</td>
              <td>${p.memberId ?? '-'}</td>
              <td>${p.amount ?? '-'}</td>
              <td>${p.paymentType || '-'}</td>
              <td>${p.status || '-'}</td>
              <td>${p.transactionReference || '-'}</td>
              <td>${p.status === 'COMPLETED' ? `<button class="action-link" data-refund="${p.id}">Refund</button>` : ''}</td>
            </tr>`
          )
          .join('');
        const card = mkCard(
          'Payment Management',
          `<table class="table-dashboard"><thead><tr><th>ID</th><th>Member</th><th>Amount</th><th>Type</th><th>Status</th><th>Ref</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table>`
        );
        card.addEventListener('click', async (e) => {
          const btn = e.target.closest('[data-refund]');
          if (!btn) return;
          const id = btn.getAttribute('data-refund');
          await apiRefundPayment(id);
          window.location.reload();
        });
        dashboardSections.appendChild(card);
      }

      // Class list + cancel
      if (Array.isArray(classes)) {
        const rows = classes
          .map(
            (c) => `<tr>
              <td>${c.id}</td>
              <td>${c.name || '-'}</td>
              <td>${formatDateTime(c.classDateTime)}</td>
              <td>${c.location || '-'}</td>
              <td>${(c.currentEnrollment ?? 0)} / ${(c.maxCapacity ?? '-')}</td>
              <td>${c.status || '-'}</td>
              <td>
                <button class="action-link" data-view-members="${c.id}">View Members</button>
                ${c.status !== 'CANCELLED' ? `<button class="action-link" data-cancel-class="${c.id}">Cancel</button>` : ''}
              </td>
            </tr>`
          )
          .join('');
        const card = mkCard(
          'Class Management',
          `<table class="table-dashboard"><thead><tr><th>ID</th><th>Name</th><th>Date</th><th>Location</th><th>Enroll</th><th>Status</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table>`
        );
        card.addEventListener('click', async (e) => {
          const viewBtn = e.target.closest('[data-view-members]');
          if (viewBtn) {
            const classId = viewBtn.getAttribute('data-view-members');
            await showClassMembers(classId);
            return;
          }
          const btn = e.target.closest('[data-cancel-class]');
          if (!btn) return;
          const id = btn.getAttribute('data-cancel-class');
          await apiCancelClass(id);
          window.location.reload();
        });
        dashboardSections.appendChild(card);
      } else {
        dashboardSections.appendChild(mkCard('Class Management', `<div class="empty-state">No data found</div>`));
      }

      // Wire create trainer/class handlers
      const createTrainerBtn = document.getElementById('adminCreateTrainerBtn');
      if (createTrainerBtn) {
        createTrainerBtn.onclick = () => createTrainer();
      }

      const createClassBtn = document.getElementById('adminCreateClassBtn');
      if (createClassBtn) {
        createClassBtn.onclick = () => createClass();
      }

      const trainerUserSelect = document.getElementById('adminCreateTrainerUserSelect');
      if (trainerUserSelect) {
        trainerUserSelect.addEventListener('change', () => {
          const selectedUser = users.find((u) => String(u.id) === String(trainerUserSelect.value));
          const fullNameEl = document.getElementById('adminCreateTrainerFullName');
          const emailEl = document.getElementById('adminCreateTrainerEmail');
          if (selectedUser) {
            if (fullNameEl && !fullNameEl.value) {
              fullNameEl.value = selectedUser.fullName || selectedUser.username || '';
            }
            if (emailEl && !emailEl.value) {
              emailEl.value = selectedUser.email || '';
            }
          }
        });
      }

      const createPlanBtn = document.getElementById('adminCreatePlanBtn');
      if (createPlanBtn) {
        createPlanBtn.onclick = () => adminCreateMembershipPlan();
      }
    } else if (role === 'TRAINER') {
      // Resolve trainer by email match from /active
      const list = await apiGetActiveTrainers();
      const trainer = Array.isArray(list)
        ? list.find((t) => String(t.email || '').toLowerCase() === String(email).toLowerCase()) || list[0]
        : null;

      if (trainer && trainer.id) {
        const classes = await apiGetTrainerClasses(trainer.id);
        const rows = Array.isArray(classes)
          ? classes
              .map(
                (c) => `<tr>
                  <td>${c.name || '-'}</td>
                  <td>${formatDateTime(c.classDateTime)}</td>
                  <td>${c.location || '-'}</td>
                  <td>${(c.currentEnrollment ?? 0)} / ${(c.maxCapacity ?? '-')}</td>
                  <td>${c.status || '-'}</td>
                  <td>
                    <button class="action-link" data-view-members="${c.id}">View Members</button>
                    ${c.status !== 'CANCELLED' ? `<button class="action-link" data-cancel-class="${c.id}">Cancel</button>` : ''}
                  </td>
                </tr>`
              )
              .join('')
          : '';

        const card = mkCard(
          'My Classes',
          `<table class="table-dashboard"><thead><tr><th>Name</th><th>Date</th><th>Location</th><th>Enroll</th><th>Status</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table>`
        );
        card.addEventListener('click', async (e) => {
          const viewBtn = e.target.closest('[data-view-members]');
          if (viewBtn) {
            const classId = viewBtn.getAttribute('data-view-members');
            await showClassMembers(classId);
            return;
          }
          const btn = e.target.closest('[data-cancel-class]');
          if (!btn) return;
          const id = btn.getAttribute('data-cancel-class');
          await apiCancelClass(id);
          window.location.reload();
        });
        dashboardSections.appendChild(card);
      } else {
        dashboardSections.appendChild(mkCard('Trainer', `<div class="empty-state">No trainer profile found.</div>`));
      }
    } else {
      // MEMBER
      const userId = getUserIdFromToken();
      const member = userId != null ? await apiGetMemberByUserId(userId) : null;
      if (member && !member.error) {
        dashboardSections.appendChild(
          mkCard(
            'Membership Info',
            `<div class="profile-details">
              <div class="detail-item"><span class="detail-label">Membership Type</span><span class="detail-value">${member.membershipType || '-'}</span></div>
              <div class="detail-item"><span class="detail-label">Status</span><span class="detail-value">${member.status || '-'}</span></div>
              <div class="detail-item"><span class="detail-label">Start</span><span class="detail-value">${member.membershipStartDate || '-'}</span></div>
              <div class="detail-item"><span class="detail-label">End</span><span class="detail-value">${member.membershipEndDate || '-'}</span></div>
            </div>`
          )
        );

        const [bookings, payments] = await Promise.all([
          apiGetBookings(member.id),
          apiGetMemberPayments(member.id)
        ]);

        if (Array.isArray(bookings)) {
          const rows = bookings
            .map(
              (b) => `<tr>
                <td>${b.className || '-'}</td>
                <td>${b.trainerName || '-'}</td>
                <td>${formatDateTime(b.classDateTime)}</td>
                <td>${b.status || '-'}</td>
                <td>${b.status !== 'CANCELLED' ? `<button class="action-link" data-cancel-booking="${b.id}">Cancel</button>` : ''}</td>
              </tr>`
            )
            .join('');
          const card = mkCard(
            'My Bookings',
            `<table class="table-dashboard"><thead><tr><th>Class</th><th>Trainer</th><th>Date</th><th>Status</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table>`
          );
          card.addEventListener('click', async (e) => {
            const btn = e.target.closest('[data-cancel-booking]');
            if (!btn) return;
            const id = btn.getAttribute('data-cancel-booking');
            await apiCancelBooking(id);
            window.location.reload();
          });
          dashboardSections.appendChild(card);
        }

        if (Array.isArray(payments)) {
          const rows = payments
            .map(
              (p) => `<tr>
                <td>${p.amount ?? '-'}</td>
                <td>${p.paymentType || '-'}</td>
                <td>${p.status || '-'}</td>
                <td>${p.transactionReference || '-'}</td>
                <td>${formatDateTime(p.paidAt || p.createdAt)}</td>
              </tr>`
            )
            .join('');
          dashboardSections.appendChild(
            mkCard(
              'My Payments',
              `<table class="table-dashboard"><thead><tr><th>Amount</th><th>Type</th><th>Status</th><th>Ref</th><th>Date</th></tr></thead><tbody>${rows}</tbody></table>`
            )
          );
        }
      } else {
        dashboardSections.appendChild(mkCard('Member', `<div class="empty-state">Member profile not found.</div>`));
      }
    }
  }

  if (loadingSpinner) loadingSpinner.style.display = 'none';
  if (profileContent) profileContent.style.display = 'block';
}
async function initTrainerProfilePage() {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) return;
  const t = await apiGetTrainer(id);
  if (!t || t.error) return;
  const esc = (s) => String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
  const set = (k, v) => { const el = document.getElementById(k); if (el) el.textContent = v ?? ''; };
  const setImg = (k, src, alt) => { const el = document.getElementById(k); if (el && src) { el.src = src; if (alt) el.alt = alt; } };
  set('trainerName', t.fullName || 'Trainer');
  set('trainerSpecialty', t.specialization || '');
  set('trainerBio', t.bio || '');
  set('trainerFullBio', t.bio || '');
  set('trainerYears', t.experienceYears ?? '-');
  set('trainerEmail', t.email || '-');
  setImg('trainerImage', `https://ui-avatars.com/api/?name=${encodeURIComponent(t.fullName || 'Trainer')}&background=1a1a1a&color=ffffff&size=300&bold=true`, t.fullName || 'Trainer');
  const classes = await apiGetTrainerClasses(t.id);
  const cards = document.getElementById('trainerClassesCards');
  if (cards && Array.isArray(classes)) {
    cards.innerHTML = classes.map((c) => `<div class="col-md-6 col-lg-4"><div class="section-card"><h4>${c.name || 'Class'}</h4><p>${formatDateTime(c.classDateTime)}</p></div></div>`).join('');
  }
}
async function initAdminDashboardPage() { if (!requireRole('ADMIN')) return; }
async function initTrainerDashboardPage() { if (!requireRole('TRAINER')) return; }
async function initMemberDashboardPage() { if (!requireLogin()) return; }

async function loadIndexClasses() {
  const container = document.querySelector('#classesGrid');
  if (!container) return;
  container.innerHTML = '<p style="color:#666;text-align:center;padding:40px">Loading classes...</p>';
  try {
    const token = localStorage.getItem('apex_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = 'Bearer ' + token;
    const res = await fetch(API + '/api/trainers/classes/upcoming', { headers });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const classes = await res.json();
    if (!classes || classes.length === 0) {
      container.innerHTML = '<p style="color:#666;text-align:center;padding:40px">No upcoming classes</p>';
      return;
    }
    const imageMap = {
      HIIT: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      YOGA: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
      PILATES: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
      STRENGTH: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
      CARDIO: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400',
      SPINNING: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400',
      BOXING: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400',
      ZUMBA: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=400',
      OTHER: 'https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?w=400'
    };
    const display = classes.slice(0, 6);
    container.innerHTML = display.map((c) => {
      const typeKey = String(c.classType || 'OTHER').toUpperCase();
      const img = imageMap[typeKey] || imageMap.OTHER;
      const title = String(c.name || 'Class');
      const when = c.classDateTime ? new Date(c.classDateTime).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      }) : 'TBA';
      const id = encodeURIComponent(c.id);
      const safeTitle = title.replace(/</g, '&lt;').replace(/"/g, '&quot;');
      return `
        <div class="class-card visible-on-scroll is-visible" onclick="window.location.href='class-details.html?id=${id}'" style="cursor:pointer">
          <div class="card-image-wrapper">
            <img src="${img}" alt="${safeTitle}" class="card-image" loading="lazy" onerror="this.src='${imageMap.OTHER}'">
            <div class="card-gradient"></div>
            <div class="card-info">
              <p class="card-role">${when}</p>
              <h3 class="card-name">${safeTitle}</h3>
              <p class="small text-white-50 mb-0">${typeKey}</p>
            </div>
          </div>
          <a href="class-details.html?id=${id}" class="card-link" onclick="event.stopPropagation()">
            <span>View Class</span>
            <span style="font-size: 1.125rem;">→</span>
          </a>
        </div>
      `;
    }).join('');
  } catch (e) {
    container.innerHTML = '<p style="color:#666;text-align:center;padding:40px">Could not load classes right now</p>';
    console.error('Classes load error:', e);
  }
}

async function loadIndexPlans() {
  const container = document.querySelector('#pricingGrid');
  if (!container) return;
  container.innerHTML = '<p style="color:#666;text-align:center;padding:40px">Loading plans...</p>';
  try {
    const res = await fetch(API + '/api/payments/plans/active');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const plans = await res.json();
    if (!plans || plans.length === 0) {
      container.innerHTML = '<p style="color:#666;text-align:center;padding:40px">No plans available</p>';
      return;
    }
    container.innerHTML = plans.map((p, index) => {
      const price = Number(p.price || 0).toFixed(2);
      const period = p.durationDays ? `${p.durationDays} days` : 'membership';
      const featured = index === 1 ? ' featured' : '';
      const name = String(p.name || 'Plan').replace(/</g, '&lt;').replace(/"/g, '&quot;');
      const desc = String(p.description || '').replace(/</g, '&lt;').replace(/"/g, '&quot;');
      const safeNameJs = String(p.name || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      return `
        <div class="pricing-card visible-on-scroll is-visible${featured}">
          <h3 class="pricing-name">${name}</h3>
          <div class="pricing-price">
            <span class="price-amount">$${price}</span>
            <span class="price-period">${period}</span>
          </div>
          <ul class="pricing-features">
            ${desc ? `
              <li class="pricing-feature">
                <i class="bi bi-check-lg feature-icon text-accent"></i>
                <span class="feature-text">${desc}</span>
              </li>
            ` : ''}
            ${p.durationDays ? `
              <li class="pricing-feature">
                <i class="bi bi-check-lg feature-icon text-accent"></i>
                <span class="feature-text">${p.durationDays} days access</span>
              </li>
            ` : ''}
            ${p.classesIncluded ? `
              <li class="pricing-feature">
                <i class="bi bi-check-lg feature-icon text-accent"></i>
                <span class="feature-text">${p.classesIncluded} classes included</span>
              </li>
            ` : ''}
            ${p.personalTrainingIncluded ? `
              <li class="pricing-feature">
                <i class="bi bi-check-lg feature-icon text-accent"></i>
                <span class="feature-text">Personal training included</span>
              </li>
            ` : ''}
          </ul>
          <a href="#" class="pricing-link" onclick="handlePlanSelect(${Number(p.id)}, ${Number(p.price || 0)}, '${safeNameJs}', ${Number(p.durationDays || 30)}); return false;">SELECT PLAN</a>
        </div>
      `;
    }).join('');
  } catch (e) {
    container.innerHTML = '<p style="color:#666;text-align:center;padding:40px">Could not load plans right now</p>';
    console.error('Plans load error:', e);
  }
}

async function loadIndexStats() {
  try {
    const token = localStorage.getItem('apex_token');
    const headers = token ? { Authorization: 'Bearer ' + token } : {};

    // Find stat number by its label text
    function findStatByLabel(labelText) {
      const labels = document.querySelectorAll('.stat-label');
      for (const label of labels) {
        if (label.textContent.trim().toUpperCase().includes(labelText.toUpperCase())) {
          // stat-number is a sibling, not a child - check parent's children
          const parent = label.parentElement;
          if (parent) {
            const numEl = parent.querySelector('.stat-number');
            if (numEl) return numEl;
          }
        }
      }
      return null;
    }

    // Always load classes count
    try {
      const classRes = await fetch(API + '/api/trainers/classes/upcoming', { headers });
      if (classRes.ok) {
        const cls = await classRes.json();
        const classesEl = findStatByLabel('CLASS');
        if (classesEl) classesEl.setAttribute('data-count', Array.isArray(cls) ? cls.length : 0);
      }
    } catch (e) { console.log('Classes count failed'); }

    // Always load trainers count
    try {
      const trainerRes = await fetch(API + '/api/trainers/active', { headers });
      if (trainerRes.ok) {
        const trainers = await trainerRes.json();
        const trainersEl = findStatByLabel('TRAINER');
        if (trainersEl) trainersEl.setAttribute('data-count', Array.isArray(trainers) ? trainers.length : 0);
      }
    } catch (e) { console.log('Trainers count failed'); }

    // Members count — only works if admin
    if (token && localStorage.getItem('apex_role') === 'ADMIN') {
      try {
        const memberRes = await fetch(API + '/api/members', {
          headers: { Authorization: 'Bearer ' + token }
        });
        if (memberRes.ok) {
          const members = await memberRes.json();
          const membersEl = findStatByLabel('MEMBER');
          if (membersEl) membersEl.setAttribute('data-count', Array.isArray(members) ? members.length : 0);
        }
      } catch (e) { console.log('Members count failed'); }
    }

    // Re-run the counter animation for updated values
    document.querySelectorAll('.stat-number').forEach((el) => {
      const target = parseInt(el.getAttribute('data-count') || el.textContent, 10);
      if (!target || isNaN(target)) return;
      let current = 0;
      const step = Math.ceil(target / 40);
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current + '+';
        if (current >= target) clearInterval(timer);
      }, 30);
    });

  } catch (e) {
    console.error('Stats load error:', e);
  }
}

function handlePlanSelect(planId, price, planName, durationDays) {
  if (!localStorage.getItem('apex_token')) {
    window.location.href = 'login.html';
    return;
  }
  localStorage.setItem('selected_plan_id', String(planId));
  localStorage.setItem('selected_plan_price', String(price));
  localStorage.setItem('selected_plan_name', planName);
  localStorage.setItem('selected_plan_days', String(durationDays || 30));
  window.location.href = 'payment.html';
}

function initIndexPage() {
  loadIndexClasses();
  loadIndexPlans();
  loadIndexStats();
}

window.handlePlanSelect = handlePlanSelect;
window.makePayment = async function makePayment(memberId, amount) {
  return authFetch('/api/payments', {
    method: 'POST',
    body: JSON.stringify({
      memberId: Number(memberId || 0),
      amount: Number(amount || 0),
      currency: 'USD',
      paymentType: APEX_PAYMENT_TYPE.MEMBERSHIP,
      description: 'Monthly membership payment'
    })
  });
};

document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();
  wireProfileHeaderDropdown();
  const page = window.location.pathname.split('/').pop();
  loadTrainers().catch(() => {});
  loadPlans().catch(() => {});
  wirePaymentMethods();
  loadClassDetailsAndWireBooking().catch(() => {});
  if (page === 'index.html') initIndexPage();
  if (page === 'login.html') initLoginPage();
  if (page === 'signup.html') initSignupPage();
  if (page === 'trainer-profile.html') initTrainerProfilePage();
  if (page === 'admin-dashboard.html') initAdminDashboardPage();
  if (page === 'trainer-dashboard.html') initTrainerDashboardPage();
  if (page === 'member-dashboard.html') initMemberDashboardPage();
  if (page === 'profile.html') initProfilePage();
});