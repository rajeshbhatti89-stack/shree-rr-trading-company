// 22. Leave Management Functions & Modal Helpers
function initLeaveManagement() {
  document.querySelectorAll('input[name="leave-action-mode"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      const mode = e.target.value;
      const applySec = document.getElementById('leave-section-apply');
      const reasonSec = document.getElementById('leave-section-adjust-reason');
      const countLabel = document.getElementById('leave-days-count-label');
      const submitBtn = document.getElementById('btn-submit-leave-form');

      if (mode === 'apply') {
        if (applySec) applySec.classList.remove('hidden');
        if (reasonSec) reasonSec.classList.add('hidden');
        if (countLabel) countLabel.textContent = 'Total Number of Days *';
        if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save Leave Record';
      } else if (mode === 'credit') {
        if (applySec) applySec.classList.add('hidden');
        if (reasonSec) reasonSec.classList.remove('hidden');
        if (countLabel) countLabel.textContent = 'Days to Credit (+) *';
        if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-plus-circle text-success"></i> + Credit Extra Leave Days';
      } else if (mode === 'deduct') {
        if (applySec) applySec.classList.add('hidden');
        if (reasonSec) reasonSec.classList.remove('hidden');
        if (countLabel) countLabel.textContent = 'Days to Deduct (-) *';
        if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-minus-circle text-danger"></i> - Deduct Leave Days';
      }
    });
  });
}

function updateSelectedEmployeeLeaveInfo() {
  const select = document.getElementById('leave-select-user');
  if (!select) return;
  const val = select.value;
  const user = allUsers.find((u) => u.id === val || u.empId === val);
  const nameBadge = document.getElementById('leave-emp-name-badge');
  const balDisplay = document.getElementById('leave-emp-balance-display');
  const takenDisplay = document.getElementById('leave-emp-taken-display');

  if (user) {
    const bal = user.leaveBalance !== undefined ? user.leaveBalance : 10;
    const tot = user.totalLeaves || 10;
    const taken = user.leavesTaken !== undefined ? user.leavesTaken : 0;
    if (nameBadge) nameBadge.textContent = `${user.name} (${user.empId}) - ${user.designation || user.role}`;
    if (balDisplay) balDisplay.textContent = `${bal} / ${tot} Days`;
    if (takenDisplay) takenDisplay.textContent = `${taken} Day(s) Taken`;
  } else {
    if (nameBadge) nameBadge.textContent = 'Select an employee';
    if (balDisplay) balDisplay.textContent = '- / - Days';
    if (takenDisplay) takenDisplay.textContent = '';
  }
}

function autoCalculateLeaveDays() {
  const startEl = document.getElementById('leave-start-date');
  const endEl = document.getElementById('leave-end-date');
  const daysEl = document.getElementById('leave-days-count');

  if (startEl && endEl && daysEl && startEl.value && endEl.value) {
    const s = new Date(startEl.value);
    const e = new Date(endEl.value);
    if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
      const diffMs = e.getTime() - s.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
      daysEl.value = Math.max(1, diffDays);
    }
  }
}

function openCreditLeaveModalForEmp(empIdentifier) {
  if (!currentUser) return;
  const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'Super Admin';
  const isHO = currentUser.site && (currentUser.site === 'Headquarters / All Sites' || currentUser.site.toUpperCase() === 'HO');
  if (!isAdmin && !isHO) {
    showToast('Unauthorized: Only HO and Admin can manage leaves.', 'error');
    return;
  }
  populateUserDropdowns();
  const select = document.getElementById('credit-select-user');
  if (select && empIdentifier) {
    const opt = Array.from(select.options).find(
      (o) => o.value === empIdentifier || o.textContent.includes(`(${empIdentifier})`)
    );
    if (opt) select.value = opt.value;
  }
  openModal('modal-leave-credit');
}

function openLeaveModalForEmp(empIdentifier, initialMode = 'apply') {
  if (!currentUser) return;
  const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'Super Admin';
  const isHO = currentUser.site && (currentUser.site === 'Headquarters / All Sites' || currentUser.site.toUpperCase() === 'HO');
  if (!isAdmin && !isHO) {
    showToast('Unauthorized: Only HO and Admin can manage leaves.', 'error');
    return;
  }
  populateUserDropdowns();
  const select = document.getElementById('leave-select-user');
  if (select && empIdentifier) {
    const opt = Array.from(select.options).find(
      (o) => o.value === empIdentifier || o.textContent.includes(`(${empIdentifier})`)
    );
    if (opt) select.value = opt.value;
  }
  const today = new Date().toISOString().split('T')[0];
  if (document.getElementById('leave-start-date')) document.getElementById('leave-start-date').value = today;
  if (document.getElementById('leave-end-date')) document.getElementById('leave-end-date').value = today;
  if (document.getElementById('leave-days-count')) document.getElementById('leave-days-count').value = 1;

  const modeRadio = document.querySelector(`input[name="leave-action-mode"][value="${initialMode}"]`);
  if (modeRadio) {
    modeRadio.checked = true;
    modeRadio.dispatchEvent(new Event('change'));
  }

  updateSelectedEmployeeLeaveInfo();
  openModal('modal-leave');
}

function openLeaveHistoryModal(filterEmp) {
  if (!currentUser) return;
  const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'Super Admin';
  const isHO = currentUser.site && (currentUser.site === 'Headquarters / All Sites' || currentUser.site.toUpperCase() === 'HO');
  if (!isAdmin && !isHO) {
    showToast('Unauthorized: Only HO and Admin can view/manage leave history.', 'error');
    return;
  }
  const searchInput = document.getElementById('leave-history-search');
  if (searchInput) {
    searchInput.value = filterEmp || '';
  }
  renderLeaveHistoryTable(filterEmp);
  openModal('modal-leave-history');
}

function renderLeaveHistoryTable(presetFilter) {
  const tbody = document.getElementById('leave-history-table-body');
  if (!tbody) return;

  const search = (
    presetFilter !== undefined
      ? presetFilter
      : (document.getElementById('leave-history-search')?.value || '')
  ).toLowerCase().trim();

  const leaves = (allLeaves || []).filter((l) => {
    if (!search) return true;
    return (
      (l.userName && l.userName.toLowerCase().includes(search)) ||
      (l.empId && l.empId.toLowerCase().includes(search)) ||
      (l.userId && l.userId.toLowerCase().includes(search)) ||
      (l.leaveType && l.leaveType.toLowerCase().includes(search)) ||
      (l.reason && l.reason.toLowerCase().includes(search)) ||
      (l.startDate && l.startDate.includes(search)) ||
      (l.endDate && l.endDate.includes(search))
    );
  });

  if (leaves.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 28px; color: var(--text-dim);">No leave records found${search ? ' matching search query' : ''}.</td></tr>`;
    return;
  }

  tbody.innerHTML = leaves
    .map((l) => {
      const typeBadge = (l.leaveType || '').includes('Sick')
        ? '<span class="badge badge-danger">Sick Leave</span>'
        : ((l.leaveType || '').includes('Casual')
          ? '<span class="badge badge-warning">Casual Leave</span>'
          : '<span class="badge badge-primary">' + escapeHtml(l.leaveType || 'Leave') + '</span>');

      return `
        <tr>
          <td>
            <strong>${escapeHtml(l.userName || 'Employee')}</strong>
            <span class="emp-cell-sub">ID: ${escapeHtml(l.empId || l.userId || 'N/A')}</span>
          </td>
          <td>${typeBadge}</td>
          <td>
            <strong>${escapeHtml(l.startDate || '-')}</strong> ${l.endDate && l.endDate !== l.startDate ? ' → ' + escapeHtml(l.endDate) : ''}
          </td>
          <td><span class="badge badge-neutral">${l.days || 1} Day(s)</span></td>
          <td><small style="color: var(--text-muted);">${escapeHtml(l.reason || 'Personal Leave')}</small></td>
          <td><span class="badge badge-success"><i class="fa-solid fa-check"></i> Approved</span></td>
          <td class="text-right">
            <button class="btn btn-outline-danger btn-xs" onclick="deleteLeaveRecord('${l.id}')" title="Revoke & Delete Leave Record">
              <i class="fa-solid fa-trash-can"></i> Delete
            </button>
          </td>
        </tr>
      `;
    })
    .join('');
}

async function deleteLeaveRecord(leaveId) {
  if (!currentUser) return;
  const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'Super Admin';
  const isHO = currentUser.site && (currentUser.site === 'Headquarters / All Sites' || currentUser.site.toUpperCase() === 'HO');
  if (!isAdmin && !isHO) {
    showToast('Unauthorized: Only HO and Admin can delete leaves.', 'error');
    return;
  }
  if (!confirm('Are you sure you want to delete / revoke this leave record? The employee\'s leave quota will be automatically restored.')) {
    return;
  }

  try {
    const res = await fetch(`/api/payroll/leaves/${leaveId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Leave deleted & balance restored!');
      await fetchUsers();
      await fetchLeaves();
      await fetchAttendance();
      renderLeaveHistoryTable();
      renderAttendanceGlassCards();
      renderUsersTable();
      populateUserDropdowns();
    } else {
      showToast(data.message || 'Failed to delete leave', 'error');
    }
  } catch (err) {
    showToast('Error deleting leave record', 'error');
  }
}


