(function () {
  function badgeClass(classType) {
    const t = (classType || '').toUpperCase();
    if (t.includes('HIIT')) return 'hiit';
    if (t.includes('YOGA')) return 'yoga';
    if (t.includes('SPIN')) return 'spinning';
    return 'strength';
  }

  function formatTime(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return iso;
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const tb = document.getElementById('scheduleDbTbody');
    if (!tb || typeof apiFetchPublic !== 'function') return;

    const list = await apiFetchPublic('/api/trainers/classes/upcoming');
    tb.innerHTML = '';

    if (!Array.isArray(list) || list.length === 0) {
      tb.innerHTML =
        '<tr><td colspan="6" class="text-secondary text-center py-4">No upcoming classes in the database yet.</td></tr>';
      return;
    }

    const sorted = [...list].sort(
      (a, b) => new Date(a.classDateTime || 0) - new Date(b.classDateTime || 0)
    );

    sorted.forEach((c) => {
      const tr = document.createElement('tr');
      tr.className = 'schedule-row';
      tr.dataset.apiClassId = String(c.id);
      const badge = badgeClass(c.classType);
      const name = String(c.name || 'Class').replace(/</g, '');
      const trainer = String(c.trainerName || '—').replace(/</g, '');
      const type = String(c.classType || '').replace(/</g, '');
      const dur = c.durationMinutes != null ? `${c.durationMinutes} min` : '—';
      tr.innerHTML = `
        <td><span class="time-badge">${formatTime(c.classDateTime)}</span></td>
        <td><span class="class-badge ${badge}">${name}</span></td>
        <td>${type || '—'}</td>
        <td><span class="trainer-badge">${trainer}</span></td>
        <td>${dur}</td>
        <td><button type="button" class="view-details-btn">Details</button></td>`;
      tb.appendChild(tr);
    });

    tb.addEventListener('click', (e) => {
      const btn = e.target.closest('.view-details-btn');
      if (!btn || !tb.contains(btn)) return;
      const row = btn.closest('tr');
      const id = row && row.dataset.apiClassId;
      if (id) window.location.href = 'class-details.html?id=' + encodeURIComponent(id);
    });
  });
})();
