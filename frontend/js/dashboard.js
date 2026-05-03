function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
}

function formatCurrency(amount, currency = 'USD') {
  if (amount == null || amount === '') return '-';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(amount);
}

function createStatusBadge(status) {
  const value = String(status || 'UNKNOWN').toUpperCase();
  let className = 'status-inactive';
  if (value === 'ACTIVE' || value === 'CONFIRMED') className = 'status-active';
  else if (value === 'PENDING') className = 'status-pending';
  return `<span class="table-cell-status ${className}"><i class="bi bi-circle-fill"></i> ${value}</span>`;
}

async function loadAdminDashboard() {
  if (!requireRole('ADMIN')) return;
  initAuthNav();
  const container = document.getElementById('adminSections');
  const status = document.getElementById('adminStatus');
  status.textContent = 'Loading...';

  try {
    const [users, trainers, revenue] = await Promise.all([
      apiFetch('/api/auth/admin/users'),
      apiFetch('/api/trainers'),
      apiFetch('/api/payments/revenue')
    ]);

    let html = '';

    // Revenue Stats
    if (revenue && !revenue.error) {
      html += `
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-value">${formatCurrency(revenue.totalRevenue, revenue.currency || 'USD')}</div>
            <div class="stat-label">Total Revenue</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${formatCurrency(revenue.monthlyRevenue, revenue.currency || 'USD')}</div>
            <div class="stat-label">Monthly Revenue</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${escapeHtml(revenue.activePlans || '0')}</div>
            <div class="stat-label">Active Plans</div>
          </div>
        </div>
      `;
    }

    // Create Trainer Section
    html += `
      <div class="dashboard-card">
        <div class="card-header">
          <h3 class="card-title"><i class="bi bi-person-plus"></i> Create Trainer</h3>
        </div>
        <form id="createTrainerForm" class="dashboard-form">
          <div class="form-row">
            <div class="form-group">
              <label>Select User</label>
              <select id="trainerUserId" required>
                <option value="">-- Select User --</option>
                ${Array.isArray(users) ? users.map(u => `<option value="${u.id}" data-email="${escapeHtml(u.email || '')}">${escapeHtml(u.username)}</option>`).join('') : ''}
              </select>
            </div>
            <div class="form-group">
              <label>Full Name</label>
              <input id="trainerName" type="text" placeholder="Enter trainer's full name" required>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input id="trainerEmail" type="email" placeholder="trainer@example.com" required>
            </div>
            <div class="form-group">
              <label>Specialization</label>
              <input id="trainerSpecialty" type="text" placeholder="e.g., Strength, HIIT, Yoga" required>
            </div>
          </div>
          <button type="submit" class="btn-dashboard btn-primary-dashboard">
            <i class="bi bi-plus-circle"></i> Create Trainer
          </button>
        </form>
      </div>
    `;

    // Users Table
    html += `
      <div class="dashboard-card">
        <div class="card-header">
          <h3 class="card-title"><i class="bi bi-people"></i> User Accounts</h3>
          <span class="card-action">${Array.isArray(users) ? users.length : 0} users</span>
        </div>
        ${Array.isArray(users) && users.length ? `
          <div class="table-responsive">
            <table class="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${users.map(user => `
                  <tr>
                    <td>#${user.id}</td>
                    <td>${escapeHtml(user.username || 'N/A')}</td>
                    <td>${escapeHtml(user.email || '-')}</td>
                    <td><span style="color: #ff3b3b; font-weight: 600;">${escapeHtml(user.role || 'N/A')}</span></td>
                    <td>${createStatusBadge(user.active ? 'Active' : 'Inactive')}</td>
                    <td>
                      <button class="btn-dashboard btn-small ${user.active ? 'btn-danger-dashboard' : 'btn-success-dashboard'} admin-user-toggle" data-user-id="${user.id}" data-active="${user.active}">
                        ${user.active ? '<i class="bi bi-lock"></i> Deactivate' : '<i class="bi bi-unlock"></i> Activate'}
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : '<div class="empty-state"><i class="bi bi-inbox"></i><p>No users available</p></div>'}
      </div>
    `;

    // Trainers Table
    html += `
      <div class="dashboard-card">
        <div class="card-header">
          <h3 class="card-title"><i class="bi bi-person-badge"></i> Trainer Management</h3>
          <span class="card-action">${Array.isArray(trainers) ? trainers.length : 0} trainers</span>
        </div>
        ${Array.isArray(trainers) && trainers.length ? `
          <div class="table-responsive">
            <table class="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Specialization</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${trainers.map(trainer => `
                  <tr>
                    <td>#${trainer.id}</td>
                    <td>${escapeHtml(trainer.fullName || trainer.name || 'N/A')}</td>
                    <td>${escapeHtml(trainer.email || '-')}</td>
                    <td>${escapeHtml(trainer.specialization || 'General')}</td>
                    <td>${createStatusBadge(trainer.active ? 'Active' : 'Inactive')}</td>
                    <td>
                      <button class="btn-dashboard btn-small ${trainer.active ? 'btn-warning-dashboard' : 'btn-success-dashboard'} admin-trainer-toggle" data-trainer-id="${trainer.id}" data-active="${trainer.active}" style="margin-right: 0.25rem;">
                        ${trainer.active ? '<i class="bi bi-lock"></i> Deactivate' : '<i class="bi bi-unlock"></i> Activate'}
                      </button>
                      <button class="btn-dashboard btn-small btn-danger-dashboard admin-trainer-delete" data-trainer-id="${trainer.id}">
                        <i class="bi bi-trash"></i> Delete
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : '<div class="empty-state"><i class="bi bi-inbox"></i><p>No trainers available</p></div>'}
      </div>
    `;

    container.innerHTML = html;
    status.textContent = '';

    const userSelect = document.getElementById('trainerUserId');
    if (userSelect) {
      userSelect.addEventListener('change', (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const emailInput = document.getElementById('trainerEmail');
        if (emailInput && selectedOption) {
          emailInput.value = selectedOption.dataset.email || '';
        }
      });
    }

    // Form submission
    const form = document.getElementById('createTrainerForm');
    if (form) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Creating...';
        btn.disabled = true;

        const payload = {
          userId: Number(document.getElementById('trainerUserId').value),
          fullName: document.getElementById('trainerName').value,
          email: document.getElementById('trainerEmail').value,
          specialization: document.getElementById('trainerSpecialty').value
        };

        const result = await apiFetch('/api/trainers', {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        btn.innerHTML = originalText;
        btn.disabled = false;

        if (result && !result.error) {
          alert('✓ Trainer created successfully');
          loadAdminDashboard();
        } else {
          alert('✗ Failed: ' + (result?.error || 'Unknown error'));
        }
      });
    }

    // User toggle handlers
    container.querySelectorAll('.admin-user-toggle').forEach((button) => {
      button.addEventListener('click', async () => {
        const userId = button.dataset.userId;
        const isActive = button.dataset.active === 'true';
        button.disabled = true;
        button.classList.add('btn-loading');

        const endpoint = `/api/auth/admin/users/${userId}/${isActive ? 'deactivate' : 'activate'}`;
        const result = await apiFetch(endpoint, { method: 'PUT' });

        button.classList.remove('btn-loading');
        if (result && result.error) {
          alert('✗ Failed: ' + result.error);
          button.disabled = false;
        } else {
          loadAdminDashboard();
        }
      });
    });

    // Trainer toggle handlers
    container.querySelectorAll('.admin-trainer-toggle').forEach((button) => {
      button.addEventListener('click', async () => {
        const trainerId = button.dataset.trainerId;
        const isActive = button.dataset.active === 'true';
        button.disabled = true;
        button.classList.add('btn-loading');

        const endpoint = `/api/trainers/${trainerId}/${isActive ? 'deactivate' : 'activate'}`;
        const result = await apiFetch(endpoint, { method: 'PUT' });

        button.classList.remove('btn-loading');
        if (result && result.error) {
          alert('✗ Failed: ' + result.error);
          button.disabled = false;
        } else {
          loadAdminDashboard();
        }
      });
    });

    // Trainer delete handlers
    container.querySelectorAll('.admin-trainer-delete').forEach((button) => {
      button.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to delete this trainer? This will also delete all classes assigned to this trainer.')) {
          return;
        }
        
        const trainerId = button.dataset.trainerId;
        button.disabled = true;
        button.classList.add('btn-loading');

        const endpoint = `/api/trainers/${trainerId}`;
        const result = await apiFetch(endpoint, { method: 'DELETE' });

        button.classList.remove('btn-loading');
        if (result && result.error) {
          alert('✗ Failed: ' + result.error);
          button.disabled = false;
        } else {
          loadAdminDashboard();
        }
      });
    });
  } catch (error) {
    console.error(error);
    status.textContent = 'Error loading dashboard';
    container.innerHTML = '<div class="empty-state"><i class="bi bi-exclamation-triangle"></i><p>Unable to load dashboard data</p></div>';
  }
}

async function loadTrainerDashboard() {
  if (!requireRole('TRAINER')) return;
  initAuthNav();
  const status = document.getElementById('trainerStatus');
  const container = document.getElementById('trainerSections');
  status.textContent = 'Loading...';

  try {
    const user = await apiFetch('/api/auth/me');
    if (!user || user.error) {
      container.innerHTML = '<div class="empty-state"><i class="bi bi-exclamation-circle"></i><p>Unable to load your profile</p></div>';
      return;
    }

    const trainer = await apiFetch(`/api/trainers/user/${user.id}`);
    const classes = trainer && !trainer.error ? await apiFetch(`/api/trainers/${trainer.id}/classes`) : [];

    let html = '';

    // Profile Card
    html += `
      <div class="dashboard-card">
        <div class="card-header">
          <h3 class="card-title"><i class="bi bi-person"></i> Your Profile</h3>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
          <div>
            <div style="color: var(--dashboard-muted); font-size: 0.85rem; margin-bottom: 0.25rem;">Name</div>
            <div style="font-size: 1.1rem; font-weight: 600;">${escapeHtml(user.fullName || user.username || '-')}</div>
          </div>
          <div>
            <div style="color: var(--dashboard-muted); font-size: 0.85rem; margin-bottom: 0.25rem;">Email</div>
            <div style="font-size: 1.1rem; font-weight: 600;">${escapeHtml(user.email || '-')}</div>
          </div>
          <div>
            <div style="color: var(--dashboard-muted); font-size: 0.85rem; margin-bottom: 0.25rem;">Specialization</div>
            <div style="font-size: 1.1rem; font-weight: 600;">${escapeHtml(trainer?.specialization || 'General')}</div>
          </div>
        </div>
      </div>
    `;

    // Create Class Form
    html += `
      <div class="dashboard-card">
        <div class="card-header">
          <h3 class="card-title"><i class="bi bi-calendar-plus"></i> Create New Class</h3>
        </div>
        <form id="createClassForm" class="dashboard-form">
          <div class="form-row">
            <div class="form-group">
              <label>Class Name</label>
              <input id="className" type="text" placeholder="e.g., HIIT Training" required>
            </div>
            <div class="form-group">
              <label>Location</label>
              <input id="classLocation" type="text" placeholder="e.g., Room A" required>
            </div>
            <div class="form-group">
              <label>Schedule</label>
              <input id="classDate" type="datetime-local" required>
            </div>
            <div class="form-group">
              <label>Capacity</label>
              <input id="classCapacity" type="number" min="1" placeholder="Max participants" required>
            </div>
          </div>
          <button type="submit" class="btn-dashboard btn-primary-dashboard">
            <i class="bi bi-plus-circle"></i> Create Class
          </button>
        </form>
      </div>
    `;

    // Classes Table
    html += `
      <div class="dashboard-card">
        <div class="card-header">
          <h3 class="card-title"><i class="bi bi-calendar-event"></i> Your Classes</h3>
          <span class="card-action">${Array.isArray(classes) ? classes.length : 0} classes</span>
        </div>
        ${Array.isArray(classes) && classes.length ? `
          <div class="table-responsive">
            <table class="dashboard-table">
              <thead>
                <tr>
                  <th>Class Name</th>
                  <th>Location</th>
                  <th>Schedule</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${classes.map(cls => `
                  <tr>
                    <td>${escapeHtml(cls.name || '-')}</td>
                    <td>${escapeHtml(cls.location || '-')}</td>
                    <td>${formatDate(cls.classDateTime || cls.scheduledAt)}</td>
                    <td>${cls.capacity || '-'} people</td>
                    <td>${createStatusBadge(cls.status || 'UNKNOWN')}</td>
                    <td>
                      <button class="btn-dashboard btn-small btn-danger-dashboard trainer-cancel-class" data-class-id="${cls.id}">
                        <i class="bi bi-trash"></i> Cancel
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : '<div class="empty-state"><i class="bi bi-inbox"></i><p>You haven\'t created any classes yet</p></div>'}
      </div>
    `;

    container.innerHTML = html;
    status.textContent = '';

    // Form submission
    const form = document.getElementById('createClassForm');
    if (form) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Saving...';
        btn.disabled = true;

        const payload = {
          trainerId: trainer?.id,
          name: document.getElementById('className').value,
          location: document.getElementById('classLocation').value,
          classDateTime: document.getElementById('classDate').value,
          capacity: Number(document.getElementById('classCapacity').value)
        };

        const result = await apiFetch('/api/trainers/classes', {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        btn.innerHTML = originalText;
        btn.disabled = false;

        if (result && !result.error) {
          alert('✓ Class created successfully');
          loadTrainerDashboard();
        } else {
          alert('✗ Failed: ' + (result?.error || 'Unknown error'));
        }
      });
    }

    // Cancel class handlers
    container.querySelectorAll('.trainer-cancel-class').forEach((button) => {
      button.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to cancel this class?')) return;
        const classId = button.dataset.classId;
        button.disabled = true;
        button.classList.add('btn-loading');

        const result = await apiFetch(`/api/trainers/classes/${classId}`, { method: 'DELETE' });

        button.classList.remove('btn-loading');
        if (result && result.error) {
          alert('✗ Failed: ' + result.error);
          button.disabled = false;
        } else {
          alert('✓ Class cancelled');
          loadTrainerDashboard();
        }
      });
    });
  } catch (error) {
    console.error(error);
    status.textContent = 'Error loading dashboard';
    container.innerHTML = '<div class="empty-state"><i class="bi bi-exclamation-triangle"></i><p>Unable to load dashboard data</p></div>';
  }
}
// Note: Member role is redirected to index.html (home page), not to a separate member dashboard
// This function is deprecated and no longer used

