const API = 'http://localhost:8080';

function getToken() { return localStorage.getItem('apex_token'); }
function getRole() { return localStorage.getItem('apex_role'); }
function getUsername() { return localStorage.getItem('apex_username'); }
function isLoggedIn() { return Boolean(getToken()); }

// FIX 5 — Common API helper (exact functions requested)
// Public fetch - no token
async function publicFetch(url) {
  try {
    const res = await fetch('http://localhost:8080' + url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch(e) {
    console.error('Public fetch failed:', url, e.message);
    return null;
  }
}

// Authenticated fetch - with token
async function authFetch(url, options = {}) {
  const token = localStorage.getItem('apex_token');
  try {
    const res = await fetch('http://localhost:8080' + url, {
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
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'HTTP ' + res.status);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch(e) {
    console.error('Auth fetch failed:', url, e.message);
    throw e;
  }
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
    return localStorage.getItem('apex_token')
      ? await authFetch('/api/trainers/' + encodeURIComponent(trainerId) + '/classes')
      : await publicFetch('/api/trainers/' + encodeURIComponent(trainerId) + '/classes');
  } catch (e) {
    return null;
  }
}

// Admin APIs
async function apiGetAllUsers() {
  try {
    const result = await authFetch('/api/users');
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
    return await authFetch('/api/users/' + encodeURIComponent(userId) + '/deactivate', {
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
      window.location.href = 'profile.html';
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
      window.location.href = 'profile.html';
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

function methodFromRadio(val) {
  const v = String(val || '').toLowerCase();
  if (v === 'card') return 'CARD';
  if (v === 'ewallet') return 'WALLET';
  if (v === 'instapay') return 'INSTAPAY';
  if (v === 'cash') return 'CASH';
  return null;
}

async function resolveMemberIdFallback() {
  try {
    const m = await authFetch('/api/members/user/1');
    if (m && m.id != null) return m.id;
  } catch (e) {}
  return 1;
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
    selectedPlan = { id: plan.id, name: plan.name, price: Number(plan.price || 0) };

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
  });
}

function wirePaymentMethods() {
  const paymentRoot = document.querySelector('.payment-methods-section');
  if (!paymentRoot) return;

  // STEP B/C are handled mostly by existing CSS: checked radio shows its form container.
  paymentRoot.querySelectorAll('input[name="paymentMethod"]').forEach((input) => {
    input.addEventListener('change', () => {
      selectedMethod = methodFromRadio(input.value);
    });
  });

  // default method
  const checked = paymentRoot.querySelector('input[name="paymentMethod"]:checked');
  selectedMethod = methodFromRadio(checked?.value);

  const confirmBtn = document.getElementById('completeBtn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      // STEP D-1 — login required
      const token = localStorage.getItem('apex_token');
      if (!token) {
        window.location.href = 'login.html';
        return;
      }

      if (!selectedPlan) {
        alert('Please select a plan first.');
        return;
      }

      if (!selectedMethod) {
        alert('Please select a payment method.');
        return;
      }

      let memberId = await resolveMemberIdFallback();

      try {
        const res = await authFetch('/api/payments', {
          method: 'POST',
          body: JSON.stringify({
            memberId,
            memberName: localStorage.getItem('apex_username'),
            amount: selectedPlan.price,
            currency: 'USD',
            paymentType: 'MEMBERSHIP',
            description: selectedPlan.name + ' - ' + selectedMethod
          })
        });

        if (res && res.transactionReference) {
          const main = document.querySelector('main.payment-main') || document.body;
          const msg = document.createElement('div');
          msg.className = 'payment-modal active';
          msg.innerHTML = `
            <div class="modal-content">
              <div class="modal-icon success">
                <i class="bi bi-check-circle"></i>
              </div>
              <h2 class="modal-title">Payment Successful!</h2>
              <p class="modal-message">
                Plan: ${escapeHtml(selectedPlan.name)}<br>
                Method: ${escapeHtml(selectedMethod)}<br>
                Reference: ${escapeHtml(res.transactionReference)}<br>
                Amount: ${escapeHtml(nicePrice(selectedPlan.price))}
              </p>
              <button class="btn-primary" id="closeSuccessBtn">OK</button>
            </div>
          `;
          main.appendChild(msg);
          const ok = msg.querySelector('#closeSuccessBtn');
          if (ok) ok.onclick = () => msg.remove();
        } else {
          alert('Payment failed. Please try again.');
        }
      } catch (err) {
        alert('Payment failed. Please try again.');
      }
    });
  }
}

// FIX 4 — Class details Join Now booking flow
async function loadClassDetailsAndWireBooking() {
  const joinBtn = document.getElementById('heroJoinNowBtn') || document.getElementById('ctaJoinNowBtn');
  const classId = new URLSearchParams(window.location.search).get('id');
  if (!classId) return;

  // Load class data
  let gymClass = null;
  try {
    // can be authenticated in your API reference; try authed first, fallback to public
    gymClass = localStorage.getItem('apex_token')
      ? await authFetch('/api/trainers/classes/' + encodeURIComponent(classId))
      : await publicFetch('/api/trainers/classes/' + encodeURIComponent(classId));
  } catch (e) {
    gymClass = null;
  }

  if (gymClass) {
    const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v ?? ''; };
    const setImg = (id, src) => { const el = document.getElementById(id); if (el && src) el.src = src; };
    const setHref = (id, href) => { const el = document.getElementById(id); if (el && href) el.href = href; };
    setText('className', gymClass.name || 'Class');
    setText('classDescription', gymClass.description || '');
    setText('classDuration', gymClass.durationMinutes != null ? gymClass.durationMinutes + ' min' : '—');
    setText('classCategory', gymClass.location || '');
    setText('classStatus', gymClass.status || '—');
    setText('classSessionMeta', niceDate(gymClass.classDateTime));
    // "Enrollment" display: emphasize spots available
    setText('classCapacity', gymClass.spotsAvailable != null ? `${gymClass.spotsAvailable} spots left` : '—');
    setText('classLevel', gymClass.classType || 'OTHER');
    setImg('classImage', classImage(gymClass.classType).replace('w=400', 'w=800'));

    const full = gymClass.spotsAvailable != null && Number(gymClass.spotsAvailable) <= 0;
    if (full && joinBtn) {
      joinBtn.disabled = true;
      joinBtn.textContent = 'Class is Full';
    }

    // Trainer area
    const trainerName = gymClass.trainerName || 'Trainer';
    setText('trainerName', trainerName);
    setImg('trainerImage', trainerAvatar(trainerName));
    setHref('trainerLink', gymClass.trainerId ? `trainer-profile.html?id=${encodeURIComponent(gymClass.trainerId)}` : '#');
    setHref('trainerProfileLink', gymClass.trainerId ? `trainer-profile.html?id=${encodeURIComponent(gymClass.trainerId)}` : '#');

    // If we have trainerId, enrich with trainer record
    if (gymClass.trainerId != null) {
      const t = await apiGetTrainer(gymClass.trainerId);
      if (t) {
        setText('trainerName', t.fullName || trainerName);
        setText('trainerSpecialty', t.specialization || '');
        setText('trainerBio', t.bio || '');
        setText('trainerHighlightExp', t.experienceYears != null ? String(t.experienceYears) : '—');
        setText('trainerHighlightPhone', t.phoneNumber || '—');
        setText('trainerHighlightEmail', t.email || '—');
        setText('trainerContactLine', [t.phoneNumber, t.email].filter(Boolean).join(' • '));
        setImg('trainerImage', trainerAvatar(t.fullName || trainerName));
        if (t.id != null) {
          setHref('trainerLink', `trainer-profile.html?id=${encodeURIComponent(t.id)}`);
          setHref('trainerProfileLink', `trainer-profile.html?id=${encodeURIComponent(t.id)}`);
        }
      }
    }
  }

  if (!joinBtn) return;

  joinBtn.addEventListener('click', async () => {
    // STEP A — login
    const token = localStorage.getItem('apex_token');
    if (!token) {
      window.location.href = 'login.html';
      return;
    }

    // STEP B — role
    if (localStorage.getItem('apex_role') === 'TRAINER') {
      alert('Trainers cannot book classes');
      return;
    }

    // STEP C — member id
    let memberId = await resolveMemberIdFallback();

    // STEP D — book
    try {
      const res = await authFetch('/api/members/bookings', {
        method: 'POST',
        body: JSON.stringify({
          memberId,
          classId: Number(classId),
          className: gymClass?.name,
          trainerName: gymClass?.trainerName,
          classDateTime: gymClass?.classDateTime,
          notes: 'Booked from website'
        })
      });

      if (res && !res.error) {
        alert('Class booked successfully! See your bookings in your profile.');
        joinBtn.textContent = 'Booked ✓';
        joinBtn.disabled = true;
      } else {
        const msg = res?.error || res?.message || 'Payment failed. Please try again.';
        alert(msg);
      }
    } catch (e) {
      const msg = String(e?.message || '');
      if (msg.toLowerCase().includes('already')) {
        alert('You have already booked this class');
      } else {
        alert('Payment failed. Please try again.');
      }
    }
  });
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

  const completeBtn = document.getElementById('completeBtn');
  if (completeBtn) {
    completeBtn.onclick = async () => {
      if (!selected) return;
      if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
      }
      try {
        const me = await apiFetch('/api/auth/me');
        let memberId = 1;
        if (me && !me.error && me.id != null) {
          const member = await apiGetMemberByUserId(me.id);
          if (member && !member.error && member.id != null) memberId = member.id;
        }

        const res = await apiProcessPayment({
          memberId,
          amount: selected.price || 0,
          currency: 'USD',
          paymentType: 'MEMBERSHIP',
          description: `${selected.name || 'Plan'} membership`
        });
        if (res && !res.error && res.transactionReference) {
          alert(`Payment successful! Reference: ${res.transactionReference}`);
        } else {
          alert('Payment failed. Please try again.');
        }
      } catch (e) {
        alert('Payment failed. Please try again.');
      }
    };
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
      const [users, members, trainers, revenue, payments, classes] = await Promise.all([
        apiGetAllUsers(),
        apiGetMembers(),
        apiGetTrainers(),
        apiGetRevenue(),
        apiGetPayments(),
        apiGetClasses()
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
              <td>${c.status !== 'CANCELLED' ? `<button class="action-link" data-cancel-class="${c.id}">Cancel</button>` : ''}</td>
            </tr>`
          )
          .join('');
        const card = mkCard(
          'Class Management',
          `<table class="table-dashboard"><thead><tr><th>ID</th><th>Name</th><th>Date</th><th>Location</th><th>Enroll</th><th>Status</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table>`
        );
        card.addEventListener('click', async (e) => {
          const btn = e.target.closest('[data-cancel-class]');
          if (!btn) return;
          const id = btn.getAttribute('data-cancel-class');
          await apiCancelClass(id);
          window.location.reload();
        });
        dashboardSections.appendChild(card);
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
                  <td>${c.status !== 'CANCELLED' ? `<button class="action-link" data-cancel-class="${c.id}">Cancel</button>` : ''}</td>
                </tr>`
              )
              .join('')
          : '';

        const card = mkCard(
          'My Classes',
          `<table class="table-dashboard"><thead><tr><th>Name</th><th>Date</th><th>Location</th><th>Enroll</th><th>Status</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table>`
        );
        card.addEventListener('click', async (e) => {
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
      const member = me.id != null ? await apiGetMemberByUserId(me.id) : null;
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
async function initClassDetailsPage() {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) return;
  const c = await apiGetClass(id);
  if (!c || c.error) return;
  const set = (k, v) => { const el = document.getElementById(k); if (el) el.textContent = v ?? ''; };
  const setImg = (k, src, alt) => { const el = document.getElementById(k); if (el && src) { el.src = src; if (alt) el.alt = alt; } };
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
  set('className', c.name || 'Class');
  set('classCategory', c.location || '');
  set('classDuration', c.durationMinutes ? `${c.durationMinutes} min` : '-');
  set('classStatus', c.status || '-');
  set('classCapacity', `${c.currentEnrollment ?? 0} / ${c.maxCapacity ?? '-'}`);
  set('classDescription', c.description || '');
  set('classSessionMeta', formatDateTime(c.classDateTime));
  setImg('classImage', imgForType(c.classType), c.name || 'Class');
  if (c.trainerId) {
    const t = await apiGetTrainer(c.trainerId);
    if (t && !t.error) {
      set('trainerName', t.fullName || 'Trainer');
      set('trainerSpecialty', t.specialization || '');
      set('trainerBio', t.bio || '');
      setImg('trainerImage', `https://ui-avatars.com/api/?name=${encodeURIComponent(t.fullName || 'Trainer')}&background=1a1a1a&color=ffffff&size=300&bold=true`, t.fullName || 'Trainer');
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

document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();
  wireProfileHeaderDropdown();
  // FIX 1
  loadTrainers().catch(() => {});
  // FIX 2 + FIX 3
  loadPlans().catch(() => {});
  wirePaymentMethods();
  // FIX 4
  loadClassDetailsAndWireBooking().catch(() => {});

  const page = window.location.pathname.split('/').pop();
  if (page === 'login.html') initLoginPage();
  if (page === 'signup.html') initSignupPage();
  if (page === 'trainer-profile.html') initTrainerProfilePage();
  if (page === 'admin-dashboard.html') initAdminDashboardPage();
  if (page === 'trainer-dashboard.html') initTrainerDashboardPage();
  if (page === 'member-dashboard.html') initMemberDashboardPage();
  if (page === 'profile.html') initProfilePage();
});

