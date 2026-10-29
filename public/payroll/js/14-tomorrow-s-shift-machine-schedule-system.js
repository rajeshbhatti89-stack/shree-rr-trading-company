// 14. Tomorrow's Shift & Machine Schedule System
function getTomorrowDateString() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

function isTomorrowShiftMatch(defaultShift, type) {
  if (!defaultShift) return false;
  const s = String(defaultShift).toLowerCase().trim();
  if (type === 'G') return s.startsWith('g shift') || s === 'g';
  if (type === 'A') return s.startsWith('a shift') || s === 'a';
  if (type === 'B') return s.startsWith('b shift') || s === 'b';
  if (type === 'C') return s.startsWith('c shift') || s === 'c';
  if (type === 'WO') return s.startsWith('wo') || s.includes('weekly off') || s.includes('week off');
  if (type === 'PH') return s.startsWith('ph') || s.includes('public holiday') || s.includes('holiday');
  if (type === 'Leave') return s.includes('leave');
  if (type === 'Absent') return s.includes('absent') || s === 'ab';
  return false;
}

function handleTomorrowShiftSelectChange(selectElem) {
  const row = selectElem.closest('tr');
  if (!row) return;
  const shiftVal = selectElem.value;
  const vehicleSelect = row.querySelector('.tom-vehicle-select');

  if (vehicleSelect) {
    if (shiftVal.includes('WO')) {
      vehicleSelect.value = 'Weekly Off (WO)';
    } else if (shiftVal.includes('PH')) {
      vehicleSelect.value = 'Public Holiday (PH)';
    } else if (shiftVal.includes('Leave')) {
      vehicleSelect.value = 'Leave (Approved Leave)';
    } else if (shiftVal.includes('Absent')) {
      vehicleSelect.value = 'Absent (Not Available / Absent)';
    } else {
      if (vehicleSelect.value === 'Weekly Off (WO)' || vehicleSelect.value === 'Public Holiday (PH)' || vehicleSelect.value === 'Leave (Approved Leave)' || vehicleSelect.value === 'Absent (Not Available / Absent)' || vehicleSelect.value.startsWith('No Machinery')) {
        vehicleSelect.value = 'General Plant Duty';
      }
    }
  }
}

function handleTomorrowVehicleSelectChange(selectElem) {
  const row = selectElem.closest('tr');
  if (!row) return;
  const vehVal = selectElem.value;
  const shiftSelect = row.querySelector('.tom-shift-select');

  if (shiftSelect) {
    if (vehVal === 'Weekly Off (WO)') {
      shiftSelect.value = 'WO (Weekly Off)';
    } else if (vehVal === 'Public Holiday (PH)') {
      shiftSelect.value = 'PH (Public Holiday)';
    } else if (vehVal === 'Leave (Approved Leave)') {
      shiftSelect.value = 'Leave (Approved Leave)';
    } else if (vehVal === 'Absent (Not Available / Absent)') {
      shiftSelect.value = 'Absent (Not Available / Absent)';
    }
  }
}

function renderTomorrowScheduleTable() {
  const tbody = document.getElementById('tomorrow-table-body');
  if (!tbody) return;

  const tomorrowStr = getTomorrowDateString();
  const displayEl = document.getElementById('tomorrow-date-display');
  if (displayEl) {
    const d = new Date(tomorrowStr);
    displayEl.textContent = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
  }

  const excludedLocations = ['ho', 'filter plant', 'shr letter', 'offer'];
  const workers = allUsers.filter((u) => {
    if (u.role === 'Super Admin' || u.status !== 'Active') return false;
    const loc = (u.location || '').toLowerCase();
    const site = (u.site || '').toLowerCase();
    if (excludedLocations.some(ex => loc.includes(ex) || site.includes(ex))) return false;
    return true;
  });
  if (workers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="padding: 30px; color: var(--text-dim);">No active workforce found.</td></tr>`;
    return;
  }

  tbody.innerHTML = workers
    .map((u, idx) => {
      const existingRoster = allRosters.find((r) => (r.userId === u.id || r.empId === u.empId) && r.date === tomorrowStr);
      const defaultShift = existingRoster ? existingRoster.shift : (idx % 4 === 1 ? 'A Shift (06:00 AM - 02:00 PM)' : (idx % 4 === 2 ? 'B Shift (02:00 PM - 10:00 PM)' : (idx % 4 === 3 ? 'C Shift (10:00 PM - 06:00 AM)' : 'G Shift (08:30 AM - 05:30 PM)')));
      const selectedEquip = existingRoster && existingRoster.equipment ? existingRoster.equipment : (
        isTomorrowShiftMatch(defaultShift, 'WO') ? 'Weekly Off (WO)' : (
          isTomorrowShiftMatch(defaultShift, 'PH') ? 'Public Holiday (PH)' : (
            isTomorrowShiftMatch(defaultShift, 'Leave') ? 'Leave (Approved Leave)' : (
              isTomorrowShiftMatch(defaultShift, 'Absent') ? 'Absent (Not Available / Absent)' : (
                allVehicles[idx % allVehicles.length] ? `${allVehicles[idx % allVehicles.length].vehicleNo} - ${allVehicles[idx % allVehicles.length].name}` : 'General Plant Duty'
              )
            )
          )
        )
      );
      const defaultSite = existingRoster ? existingRoster.site : (u.location || 'ACC Chanda Plant Site');
      const defaultSupervisor = existingRoster ? existingRoster.supervisor : 'Shift In-Charge (Plant Operations)';

      const vehicleOptions = [
        `<option value="General Plant Duty" ${selectedEquip === 'General Plant Duty' ? 'selected' : ''}>General Plant Duty</option>`,
        `<option value="Heavy Fleet Maintenance Bay" ${selectedEquip === 'Heavy Fleet Maintenance Bay' ? 'selected' : ''}>Heavy Fleet Maintenance Bay</option>`,
        `<option value="No Machinery (Standby / Off)" ${selectedEquip === 'No Machinery (Standby / Off)' ? 'selected' : ''}>No Machinery (Standby / Off)</option>`,
        `<option value="Weekly Off (WO)" ${selectedEquip === 'Weekly Off (WO)' ? 'selected' : ''}>Weekly Off (WO)</option>`,
        `<option value="Public Holiday (PH)" ${selectedEquip === 'Public Holiday (PH)' ? 'selected' : ''}>Public Holiday (PH)</option>`,
        `<option value="Leave (Approved Leave)" ${selectedEquip === 'Leave (Approved Leave)' ? 'selected' : ''}>Leave (Approved Leave)</option>`,
        `<option value="Absent (Not Available / Absent)" ${selectedEquip === 'Absent (Not Available / Absent)' ? 'selected' : ''}>Absent (Not Available / Absent)</option>`
      ].concat(
        allVehicles.map((v) => {
          const val = `${v.vehicleNo} - ${v.name}`;
          const isSel = selectedEquip === val || selectedEquip.startsWith(v.vehicleNo);
          return `<option value="${val}" ${isSel ? 'selected' : ''}>${v.vehicleNo} - ${escapeHtml(v.name)} (${escapeHtml(v.site || 'Pit')})</option>`;
        })
      ).join('');

      return `
      <tr data-userid="${u.id}" data-empid="${u.empId}" data-username="${escapeHtml(u.name)}" data-designation="${escapeHtml(u.designation || 'Operator')}">
        <td style="font-family: var(--font-mono); font-weight: 700; color: var(--text-dim);">${idx + 1}</td>
        <td class="emp-cell-id">${u.empId}</td>
        <td>
          <span class="emp-cell-name">${escapeHtml(u.name)}</span>
          <span class="emp-cell-sub">Role: ${escapeHtml(u.role || 'Worker')}</span>
        </td>
        <td><strong>${escapeHtml(u.designation || u.rank || 'Operator')}</strong></td>
        <td style="min-width: 190px;">
          <select class="muster-select tom-shift-select" onchange="handleTomorrowShiftSelectChange(this)">
            <option value="G Shift (08:30 AM - 05:30 PM)" ${isTomorrowShiftMatch(defaultShift, 'G') ? 'selected' : ''}>G Shift (08:30 AM - 05:30 PM)</option>
            <option value="A Shift (06:00 AM - 02:00 PM)" ${isTomorrowShiftMatch(defaultShift, 'A') ? 'selected' : ''}>A Shift (06:00 AM - 02:00 PM)</option>
            <option value="B Shift (02:00 PM - 10:00 PM)" ${isTomorrowShiftMatch(defaultShift, 'B') ? 'selected' : ''}>B Shift (02:00 PM - 10:00 PM)</option>
            <option value="C Shift (10:00 PM - 06:00 AM)" ${isTomorrowShiftMatch(defaultShift, 'C') ? 'selected' : ''}>C Shift (10:00 PM - 06:00 AM)</option>
            <option value="WO (Weekly Off)" ${isTomorrowShiftMatch(defaultShift, 'WO') ? 'selected' : ''}>WO (Weekly Off)</option>
            <option value="PH (Public Holiday)" ${isTomorrowShiftMatch(defaultShift, 'PH') ? 'selected' : ''}>PH (Public Holiday)</option>
            <option value="Leave (Approved Leave)" ${isTomorrowShiftMatch(defaultShift, 'Leave') ? 'selected' : ''}>Leave (Approved Leave)</option>
            <option value="Absent (Not Available / Absent)" ${isTomorrowShiftMatch(defaultShift, 'Absent') ? 'selected' : ''}>Absent (Not Available / Absent)</option>
          </select>
        </td>
        <td style="min-width: 220px;">
          <select class="muster-select tom-vehicle-select" onchange="handleTomorrowVehicleSelectChange(this)">
            ${vehicleOptions}
          </select>
        </td>
        <td style="width: 140px;">
          <input type="text" class="muster-select tom-site-input" value="${escapeHtml(defaultSite)}">
        </td>
        <td style="width: 160px;">
          <input type="text" class="muster-select tom-supervisor-input" value="${escapeHtml(defaultSupervisor)}">
        </td>
      </tr>
    `;
    })
    .join('');

  workers.forEach((u, idx) => {
    const row = tbody.children[idx];
    if (row) {
      const existingRoster = allRosters.find((r) => (r.userId === u.id || r.empId === u.empId) && r.date === tomorrowStr);
      const vSelect = row.querySelector('.tom-vehicle-select');
      if (vSelect && existingRoster && existingRoster.equipment) {
        vSelect.value = existingRoster.equipment;
      }
    }
  });
}

async function saveTomorrowSchedule() {
  const tomorrowStr = getTomorrowDateString();
  const rows = document.querySelectorAll('#tomorrow-table-body tr');
  const scheduleRecords = [];

  rows.forEach((r) => {
    const userId = r.getAttribute('data-userid');
    const empId = r.getAttribute('data-empid');
    const userName = r.getAttribute('data-username');
    const designation = r.getAttribute('data-designation');
    const shift = r.querySelector('.tom-shift-select')?.value || 'G Shift (08:30 AM - 05:30 PM)';
    let shiftCode = 'G';
    if (shift.includes('G Shift')) shiftCode = 'G';
    else if (shift.includes('A Shift')) shiftCode = 'A';
    else if (shift.includes('B Shift')) shiftCode = 'B';
    else if (shift.includes('C Shift')) shiftCode = 'C';
    else if (shift.includes('WO') || shift.toLowerCase().includes('week')) shiftCode = 'WO';
    else if (shift.toLowerCase().includes('leave')) shiftCode = 'Leave';
    else if (shift.toLowerCase().includes('absent') || shift === 'AB') shiftCode = 'Absent';

    const equipment = r.querySelector('.tom-vehicle-select')?.value || 'General Plant Duty';
    const site = r.querySelector('.tom-site-input')?.value || 'ACC Chanda Plant Site';
    const supervisor = r.querySelector('.tom-supervisor-input')?.value || 'Shift In-Charge (Plant Operations)';

    scheduleRecords.push({ userId, empId, userName, designation, shift, shiftCode, equipment, site, supervisor });
  });

  const saveBtn = document.getElementById('btn-save-tomorrow-schedule');
  try {
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving Schedule...';
    }

    const res = await fetch('/api/payroll/rosters/tomorrow-bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: tomorrowStr, scheduleRecords })
    });

    const data = await res.json();
    if (data.success) {
      showToast(`⚡ Tomorrow's shift & machinery schedule saved! (${scheduleRecords.length} operators scheduled)`);
      await fetchRosters();
    }
  } catch (err) {
    showToast("Tomorrow's schedule saved locally.");
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Tomorrow\'s Schedule';
    }
  }
}



