// 13. Daily Muster Roll (Today's Live Attendance)
function renderMusterRollTable() {
  const tbody = document.getElementById('muster-table-body');
  if (!tbody) return;

  const datePicker = document.getElementById('muster-date-picker');
  const selectedDate = datePicker ? datePicker.value : new Date().toISOString().split('T')[0];
  const search = (document.getElementById('muster-search-input')?.value || '').toLowerCase().trim();

  const excludedLocations = ['ho', 'filter plant', 'shr letter', 'offer'];
  let workers = allUsers.filter((u) => {
    if (u.role === 'Super Admin' || u.status !== 'Active') return false;
    const loc = (u.location || '').toLowerCase();
    const site = (u.site || '').toLowerCase();
    if (excludedLocations.some(ex => loc.includes(ex) || site.includes(ex))) return false;
    return true;
  });
  if (search) {
    workers = workers.filter((u) => 
      (u.name && u.name.toLowerCase().includes(search)) || 
      (u.empId && u.empId.toLowerCase().includes(search)) ||
      (u.designation && u.designation.toLowerCase().includes(search)) ||
      (u.rank && u.rank.toLowerCase().includes(search)) ||
      (u.role && u.role.toLowerCase().includes(search))
    );
  }

  if (workers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center" style="padding: 30px; color: var(--text-dim);">No active employees matching criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = workers
    .map((u, idx) => {
      const existing = allAttendance.find((a) => (a.userId === u.id || a.empId === u.empId) && a.date === selectedDate);
      const defaultShift = existing ? existing.shift : (idx % 4 === 1 ? 'A Shift (06:00 AM - 02:00 PM)' : (idx % 4 === 2 ? 'B Shift (02:00 PM - 10:00 PM)' : (idx % 4 === 3 ? 'C Shift (10:00 PM - 06:00 AM)' : 'G Shift (08:30 AM - 05:30 PM)')));
      const defaultStatus = existing ? existing.status : 'Present';
      const isAbsentOrOff = defaultStatus === 'Absent' || defaultStatus === 'Weekly Off' || defaultStatus === 'Leave' || defaultStatus === 'Public Holiday';
      const clockIn = existing ? existing.clockIn : (isAbsentOrOff ? '-' : (defaultShift.includes('A Shift') ? '06:00 AM' : (defaultShift.includes('B Shift') ? '02:00 PM' : (defaultShift.includes('C Shift') ? '10:00 PM' : '08:30 AM'))));
      const clockOut = existing ? existing.clockOut : (isAbsentOrOff ? '-' : (defaultShift.includes('A Shift') ? '02:00 PM' : (defaultShift.includes('B Shift') ? '10:00 PM' : (defaultShift.includes('C Shift') ? '06:00 AM' : '05:30 PM'))));

      return `
      <tr data-userid="${u.id}" data-empid="${u.empId}" data-username="${escapeHtml(u.name)}">
        <td style="font-family: var(--font-mono); font-weight: 700; color: var(--text-dim);">${idx + 1}</td>
        <td class="emp-cell-id">${u.empId}</td>
        <td>
          <span class="emp-cell-name">${escapeHtml(u.name)}</span>
          <span class="emp-cell-sub">Father: ${escapeHtml(u.fatherName || 'N/A')}</span>
        </td>
        <td>
          <span class="role-badge ${u.role === 'Worker' ? 'role-worker' : (u.role === 'Supervisor' ? 'role-supervisor' : 'role-employee')}">${escapeHtml(u.role || 'Worker')}</span>
          <span class="emp-cell-sub">${escapeHtml(u.designation || 'Staff')}</span>
        </td>
        <td style="min-width: 170px;">
          <select class="muster-select muster-shift-select" onchange="handleMusterShiftChange(this)">
            <option value="G Shift (08:30 AM - 05:30 PM)" ${defaultShift.includes('G Shift') ? 'selected' : ''}>G Shift - General (8:30a-5:30p)</option>
            <option value="A Shift (06:00 AM - 02:00 PM)" ${defaultShift.includes('A Shift') ? 'selected' : ''}>A Shift - Morning (6a-2p)</option>
            <option value="B Shift (02:00 PM - 10:00 PM)" ${defaultShift.includes('B Shift') ? 'selected' : ''}>B Shift - Evening (2p-10p)</option>
            <option value="C Shift (10:00 PM - 06:00 AM)" ${defaultShift.includes('C Shift') ? 'selected' : ''}>C Shift - Night (10p-6a)</option>
            <option value="WO - Weekly Off" ${defaultShift.includes('WO') ? 'selected' : ''}>WO - Weekly Off</option>
            <option value="PH - Public Holiday" ${defaultShift.includes('PH') ? 'selected' : ''}>PH - Public Holiday</option>
          </select>
        </td>
        <td style="min-width: 140px;">
          <select class="muster-select muster-status-select" onchange="handleMusterStatusChange(this)">
            <option value="Present" ${defaultStatus === 'Present' ? 'selected' : ''}>✅ Present</option>
            <option value="Absent" ${defaultStatus === 'Absent' ? 'selected' : ''}>❌ Absent</option>
            <option value="Weekly Off" ${defaultStatus === 'Weekly Off' ? 'selected' : ''}>☕ Weekly Off</option>
            <option value="Public Holiday" ${defaultStatus === 'Public Holiday' ? 'selected' : ''}>🎉 Public Holiday</option>
            <option value="Leave" ${defaultStatus === 'Leave' ? 'selected' : ''}>🏖 Leave</option>
            <option value="Half Day" ${defaultStatus === 'Half Day' ? 'selected' : ''}>⏱ Half Day</option>
            <option value="Overtime" ${defaultStatus === 'Overtime' ? 'selected' : ''}>? Overtime</option>
          </select>
        </td>
        <td style="width: 100px;">
          <input type="text" class="muster-select muster-clockin-input" value="${clockIn}">
        </td>
        <td style="width: 100px;">
          <input type="text" class="muster-select muster-clockout-input" value="${clockOut}">
        </td>
        <td style="width: 130px;">
          <input type="text" class="muster-select muster-site-input" value="${escapeHtml(u.location || 'ACC Chanda')}">
        </td>
        <td style="width: 150px;">
          <input type="text" class="muster-select muster-notes-input" placeholder="Notes" value="${escapeHtml(existing?.notes || (defaultStatus === 'Absent' ? 'Muster Roll: Absent' : (defaultStatus === 'Weekly Off' ? 'Muster Roll: Weekly Off' : (defaultStatus === 'Public Holiday' ? 'Muster Roll: Public Holiday' : (defaultStatus === 'Leave' ? 'Muster Roll: On Leave' : 'Biometric Punch')))))}">
        </td>
      </tr>
    `;
    })
    .join('');
}

function handleMusterStatusChange(selectEl) {
  const row = selectEl.closest('tr');
  if (!row) return;
  const statusVal = selectEl.value;
  const shiftSelect = row.querySelector('.muster-shift-select');
  const clockIn = row.querySelector('.muster-clockin-input');
  const clockOut = row.querySelector('.muster-clockout-input');
  const notes = row.querySelector('.muster-notes-input');

  if (statusVal === 'Absent') {
    if (clockIn) clockIn.value = '-';
    if (clockOut) clockOut.value = '-';
    if (notes && (!notes.value || notes.value === 'Biometric Punch' || notes.value.startsWith('Muster Roll:'))) {
      notes.value = 'Muster Roll: Absent';
    }
  } else if (statusVal === 'Weekly Off') {
    if (clockIn) clockIn.value = '-';
    if (clockOut) clockOut.value = '-';
    if (shiftSelect && !shiftSelect.value.includes('WO')) {
      shiftSelect.value = 'WO - Weekly Off';
    }
    if (notes && (!notes.value || notes.value === 'Biometric Punch' || notes.value.startsWith('Muster Roll:'))) {
      notes.value = 'Muster Roll: Weekly Off';
    }
  } else if (statusVal === 'Public Holiday') {
    if (clockIn) clockIn.value = '-';
    if (clockOut) clockOut.value = '-';
    if (shiftSelect && !shiftSelect.value.includes('PH')) {
      shiftSelect.value = 'PH - Public Holiday';
    }
    if (notes && (!notes.value || notes.value === 'Biometric Punch' || notes.value.startsWith('Muster Roll:'))) {
      notes.value = 'Muster Roll: Public Holiday';
    }
  } else if (statusVal === 'Leave') {
    if (clockIn) clockIn.value = '-';
    if (clockOut) clockOut.value = '-';
    if (notes && (!notes.value || notes.value === 'Biometric Punch' || notes.value.startsWith('Muster Roll:'))) {
      notes.value = 'Muster Roll: On Leave';
    }
  } else if (statusVal === 'Half Day') {
    const shiftVal = shiftSelect ? shiftSelect.value : 'G Shift';
    if (shiftVal.includes('A Shift')) {
      if (clockIn) clockIn.value = '06:00 AM';
      if (clockOut) clockOut.value = '10:00 AM';
    } else if (shiftVal.includes('B Shift')) {
      if (clockIn) clockIn.value = '02:00 PM';
      if (clockOut) clockOut.value = '06:00 PM';
    } else if (shiftVal.includes('C Shift')) {
      if (clockIn) clockIn.value = '10:00 PM';
      if (clockOut) clockOut.value = '02:00 AM';
    } else {
      if (clockIn) clockIn.value = '08:30 AM';
      if (clockOut) clockOut.value = '01:30 PM';
    }
    if (notes && (!notes.value || notes.value === 'Biometric Punch' || notes.value.startsWith('Muster Roll:'))) {
      notes.value = 'Muster Roll: Half Day';
    }
  } else {
    // Present or Overtime
    const shiftVal = shiftSelect ? shiftSelect.value : 'G Shift';
    if (shiftSelect && (shiftSelect.value.includes('WO') || shiftSelect.value.includes('PH'))) {
      shiftSelect.value = 'G Shift (08:30 AM - 05:30 PM)';
    }
    if (shiftVal.includes('A Shift')) {
      if (clockIn) clockIn.value = '06:00 AM';
      if (clockOut) clockOut.value = '02:00 PM';
    } else if (shiftVal.includes('B Shift')) {
      if (clockIn) clockIn.value = '02:00 PM';
      if (clockOut) clockOut.value = '10:00 PM';
    } else if (shiftVal.includes('C Shift')) {
      if (clockIn) clockIn.value = '10:00 PM';
      if (clockOut) clockOut.value = '06:00 AM';
    } else {
      if (clockIn) clockIn.value = '08:30 AM';
      if (clockOut) clockOut.value = '05:30 PM';
    }
    if (notes && (!notes.value || notes.value.startsWith('Muster Roll:'))) {
      notes.value = statusVal === 'Overtime' ? 'Muster Roll: Overtime Shift' : 'Biometric Punch';
    }
  }
}

function handleMusterShiftChange(selectEl) {
  const row = selectEl.closest('tr');
  if (!row) return;
  const shiftVal = selectEl.value;
  const statusSelect = row.querySelector('.muster-status-select');
  const clockIn = row.querySelector('.muster-clockin-input');
  const clockOut = row.querySelector('.muster-clockout-input');
  const notes = row.querySelector('.muster-notes-input');

  if (shiftVal.includes('WO')) {
    if (statusSelect) statusSelect.value = 'Weekly Off';
    if (clockIn) clockIn.value = '-';
    if (clockOut) clockOut.value = '-';
    if (notes && (!notes.value || notes.value === 'Biometric Punch' || notes.value.startsWith('Muster Roll:'))) {
      notes.value = 'Muster Roll: Weekly Off';
    }
    return;
  }

  if (shiftVal.includes('PH')) {
    if (statusSelect) statusSelect.value = 'Public Holiday';
    if (clockIn) clockIn.value = '-';
    if (clockOut) clockOut.value = '-';
    if (notes && (!notes.value || notes.value === 'Biometric Punch' || notes.value.startsWith('Muster Roll:'))) {
      notes.value = 'Muster Roll: Public Holiday';
    }
    return;
  }

  // If status is currently Absent, keep Absent and '-' times
  if (statusSelect && statusSelect.value === 'Absent') {
    return;
  }

  // If status was Weekly Off or Public Holiday, reset status to Present
  if (statusSelect && (statusSelect.value === 'Weekly Off' || statusSelect.value === 'Public Holiday')) {
    statusSelect.value = 'Present';
  }

  if (shiftVal.includes('A Shift')) {
    if (clockIn) clockIn.value = '06:00 AM';
    if (clockOut) clockOut.value = '02:00 PM';
  } else if (shiftVal.includes('B Shift')) {
    if (clockIn) clockIn.value = '02:00 PM';
    if (clockOut) clockOut.value = '10:00 PM';
  } else if (shiftVal.includes('C Shift')) {
    if (clockIn) clockIn.value = '10:00 PM';
    if (clockOut) clockOut.value = '06:00 AM';
  } else {
    if (clockIn) clockIn.value = '08:30 AM';
    if (clockOut) clockOut.value = '05:30 PM';
  }
}

function exportDailyMusterExcel() {
  const datePicker = document.getElementById('muster-date-picker');
  const selectedDate = datePicker ? datePicker.value : new Date().toISOString().split('T')[0];
  const rows = document.querySelectorAll('#muster-table-body tr');

  const excelData = [
    ['SHREE RR TRADING COMPANY - PLANT OPERATIONS & LIVE WORKFORCE MUSTER ROLL'],
    [`DAILY LIVE MUSTER ROLL ATTENDANCE STATEMENT (${selectedDate})`],
    ['Site: ACC Chanda Plant Site & Operations | Portal: https://payroll.shreerrtradingcompany.com'],
    [],
    ['Sr. No', 'Employee ID', 'Employee / Worker Name', 'Role', 'Designation', 'Duty Shift', 'Attendance Status', 'Clock In', 'Clock Out', 'Site Location', 'Verification Notes']
  ];

  rows.forEach((r, idx) => {
    const empId = r.getAttribute('data-empid') || '';
    const userName = r.getAttribute('data-username') || '';
    const role = r.querySelector('.role-badge')?.textContent.trim() || '';
    const designation = r.querySelector('.emp-cell-sub')?.textContent.trim() || '';
    const shift = r.querySelector('.muster-shift-select')?.value || 'G Shift';
    const status = r.querySelector('.muster-status-select')?.value || 'Present';
    const clockIn = r.querySelector('.muster-clockin-input')?.value || '-';
    const clockOut = r.querySelector('.muster-clockout-input')?.value || '-';
    const site = r.querySelector('.muster-site-input')?.value || 'ACC Chanda';
    const notes = r.querySelector('.muster-notes-input')?.value || '';

    excelData.push([idx + 1, empId, userName, role, designation, shift, status, clockIn, clockOut, site, notes]);
  });

  const ws = XLSX.utils.aoa_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Daily Muster Roll');
  XLSX.writeFile(wb, `Shree_RR_Daily_Muster_Roll_${selectedDate}.xlsx`);
  showToast(`Downloaded 1-Click Excel: Daily Muster Roll for ${selectedDate}!`);
}



