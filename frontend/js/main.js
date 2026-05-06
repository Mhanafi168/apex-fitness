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
  if (data?.accessToken) {
    saveAuth(data);
    window.location.href = 'profile.html';
  } else {
    showError(data?.error || 'Invalid credentials');
  }
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

const loadPublicPlans = () => publicFetch('/api/payments/plans/active');

const apiGetTrainers = () => apiFetch('/api/trainers');
const apiGetActiveTrainers = () => apiFetch('/api/trainers/active');
const apiGetTrainer = (id) => apiFetch(`/api/trainers/${id}`);
const apiCreateTrainer = (data) => apiFetch('/api/trainers', { method: 'POST', body: JSON.stringify(data) });
const apiUpdateTrainer = (id, data) => apiFetch(`/api/trainers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
const apiGetTrainerClasses = (trainerId) => apiFetch(`/api/trainers/${trainerId}/classes`);

const apiGetClasses = () => apiFetch('/api/trainers/classes');
async function apiGetUpcomingClassesMaybeAuthed() {
  // Requirement: with Authorization if logged in, without if not
  return isLoggedIn()
    ? apiFetch('/api/trainers/classes/upcoming')
    : publicFetch('/api/trainers/classes/upcoming');
}
const apiGetClass = (id) => apiFetch(`/api/trainers/classes/${id}`);
const apiGetClassesByType = (type) =>
  isLoggedIn()
    ? apiFetch(`/api/trainers/classes/type/${encodeURIComponent(type)}`)
    : publicFetch(`/api/trainers/classes/type/${encodeURIComponent(type)}`);
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
  if (page === 'profile.html') initProfilePage();
});

