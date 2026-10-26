// 15. Attendance Glass View & Leave Balance Tracker (Live Dynamic Sync with Muster Roll & Approved Leaves)
function renderAttendanceGlassCards() {
  const container = document.getElementById('glass-employee-cards');
  if (!container) return;

  const search = (document.getElementById('glass-search-input')?.value || '').toLowerCase().trim();
  const selectedMonth = document.getElementById('glass-month-select')?.value || 'September 2026';

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [mName, yStr] = selectedMonth.split(' ');
  const year = parseInt(yStr) || 2026;
  let monthIndex = monthNames.findIndex((m) => m.toLowerCase() === (mName || '').toLowerCase());
  if (monthIndex === -1) monthIndex = 8; // September default (0-indexed)
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate(); // 30 for September
  const monthNumStr = String(monthIndex + 1).padStart(2, '0');

  const excludedLocations = ['ho', 'filter plant', 'shr letter', 'offer'];
  const workers = allUsers.filter((u) => {
    if (u.role === 'Super Admin') return false;
    const loc = (u.location || '').toLowerCase();
    const site = (u.site || '').toLowerCase();
    if (excludedLocations.some(ex => loc.includes(ex) || site.includes(ex))) return false;
    return (
      !search ||
      (u.name && u.name.toLowerCase().includes(search)) ||
      (u.empId && u.empId.toLowerCase().includes(search)) ||
      (u.designation && u.designation.toLowerCase().includes(search)) ||
      (u.role && u.role.toLowerCase().includes(search))
    );
  });

  if (workers.length === 0) {
    container.innerHTML = `<div class="peach-glass" style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-dim);">No employee records found.</div>`;
    return;
  }

  container.innerHTML = workers
    .map((u) => {
      // Find all approved leaves for this employee
      const userApprovedLeaves = (allLeaves || []).filter(
        (lv) => (lv.userId === u.id || lv.empId === u.empId) && lv.status === 'Approved'
      );

      let markedPresentCount = 0;
      let markedWOCount = 0;
      let markedPHCount = 0;
      let markedLeaveCount = 0;
      let markedAbsentCount = 0;
      let markedHalfDayCount = 0;
      let hasAnyMusterRecords = false;

      let dayPills = '';
      for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = String(day).padStart(2, '0');
        const dateStr = `${year}-${monthNumStr}-${dayStr}`;
        const dateObj = new Date(year, monthIndex, day);
        const isSunday = dateObj.getDay() === 0;

        // Query live attendance record from Daily Muster Roll
        const attRecord = (allAttendance || []).find(
          (a) => (a.userId === u.id || a.empId === u.empId) && a.date === dateStr
        );

        // Query approved leave spanning this date
        const leaveRecord = userApprovedLeaves.find(
          (lv) => lv.startDate <= dateStr && lv.endDate >= dateStr
        );

        let pClass = 'pill-wo';
        let pText = 'WO';
        let tooltip = `Day ${day} (${dateStr})`;

        if (attRecord) {
          hasAnyMusterRecords = true;
          const status = attRecord.status || 'Present';
          const shift = attRecord.shift || 'G Shift';
          const shiftCode = attRecord.shiftCode || (shift.includes('A') ? 'A' : (shift.includes('B') ? 'B' : (shift.includes('C') ? 'C' : (shift.includes('PH') ? 'PH' : 'G'))));

          if (status === 'Present' || status === 'Overtime') {
            markedPresentCount++;
            pClass = 'pill-p';
            pText = shiftCode === 'WO' ? 'P' : (shiftCode === 'PH' ? 'P' : shiftCode);
            tooltip += `: Present [Shift ${shiftCode}] - ${shift}${attRecord.notes ? ' | ' + attRecord.notes : ''}`;
          } else if (status === 'Half Day') {
            markedHalfDayCount++;
            markedPresentCount += 0.5;
            pClass = 'pill-hd';
            pText = 'HD';
            tooltip += `: Half Day [Shift ${shiftCode}]`;
          } else if (status === 'Weekly Off') {
            markedWOCount++;
            pClass = 'pill-wo';
            pText = 'WO';
            tooltip += `: Weekly Off (Muster Marked)`;
          } else if (status === 'Public Holiday' || status === 'Holiday') {
            markedPHCount++;
            pClass = 'pill-ph';
            pText = 'PH';
            tooltip += `: Public Holiday [${attRecord.notes || 'Gazetted Holiday'}]`;
          } else if (status === 'Leave') {
            markedLeaveCount++;
            pClass = 'pill-l';
            pText = 'L';
            tooltip += `: On Leave [${attRecord.notes || 'Approved Leave'}]`;
          } else if (status === 'Absent') {
            markedAbsentCount++;
            pClass = 'pill-a';
            pText = 'A';
            tooltip += `: Absent (${attRecord.notes || 'Not Available'})`;
          } else {
            markedPresentCount++;
            pClass = 'pill-p';
            pText = 'P';
            tooltip += `: ${status}`;
          }
        } else if (leaveRecord) {
          markedLeaveCount++;
          pClass = 'pill-l';
          pText = 'L';
          tooltip += `: Approved Leave (${leaveRecord.leaveType || 'Leave'})`;
        } else if (isSunday) {
          markedWOCount++;
          pClass = 'pill-wo';
          pText = 'WO';
          tooltip += `: Sunday Weekly Off`;
        } else {
          pClass = 'pill-p';
          pText = 'P';
          tooltip += `: Scheduled Working Day (G Shift)`;
        }

        dayPills += `<div class="day-pill ${pClass}" title="${escapeHtml(tooltip)}">${pText}</div>`;
      }

      // Live metrics calculation
      const totalLeaves = Number(u.totalLeaves) || 10;
      const totalApprovedLeaveDays = userApprovedLeaves.reduce((acc, cur) => acc + (Number(cur.days) || 1), 0);
      const leavesTakenTotal = Math.max(Number(u.leavesTaken) || 0, totalApprovedLeaveDays, markedLeaveCount);
      const leaveBal = Number(u.leaveBalance) !== undefined ? Number(u.leaveBalance) : Math.max(0, totalLeaves - leavesTakenTotal);

      // Gauge stats: Use marked live muster counts if available, otherwise display monthly scheduled defaults
      const pDisplay = hasAnyMusterRecords
        ? markedPresentCount
        : (Number(u.presentDays) || (daysInMonth - (Number(u.weakOff) || 4)));
      const woDisplay = hasAnyMusterRecords
        ? markedWOCount
        : (Number(u.weakOff) || 4);
      const phDisplay = hasAnyMusterRecords
        ? markedPHCount
        : (Number(u.publicHoliday) || 0);
      const lDisplay = markedLeaveCount > 0 ? markedLeaveCount : (Number(u.leave) || 0);

      return `
      <div class="emp-glass-card peach-glass">
        <div class="card-head">
          <div class="card-emp-info">
            <h4>${escapeHtml(u.name)}</h4>
            <span>ID: <strong>${u.empId}</strong> | ${escapeHtml(u.designation || u.rank || 'Staff')} | ${escapeHtml(u.location || u.site || 'ACC Chanda')}</span>
          </div>
          <span class="role-badge ${u.role === 'Worker' ? 'role-worker' : (u.role === 'Supervisor' ? 'role-supervisor' : 'role-employee')}">${escapeHtml(u.role || 'Worker')}</span>
        </div>

        <div class="leave-gauge-box" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
          <div class="gauge-item">
            <span class="g-val text-success">${pDisplay}</span>
            <span class="g-lbl">Present (P)</span>
          </div>
          <div class="gauge-item">
            <span class="g-val text-navy">${woDisplay}</span>
            <span class="g-lbl">Weekly Off (WO)</span>
          </div>
          <div class="gauge-item">
            <span class="g-val text-purple">${phDisplay}</span>
            <span class="g-lbl">Holiday (PH)</span>
          </div>
          <div class="gauge-item">
            <span class="g-val text-orange"><strong>${leaveBal}</strong> / ${totalLeaves}</span>
            <span class="g-lbl">Leave Balance</span>
          </div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; margin-bottom: 6px; color: var(--text-muted);">
            <span>${selectedMonth} Live Muster Matrix (Day 1 - ${daysInMonth})</span>
            <span><span class="text-success">● P: ${pDisplay}</span> | <span class="text-navy">● WO: ${woDisplay}</span> | <span class="text-purple">● PH: ${phDisplay}</span> | <span class="text-warning">● L: ${lDisplay}</span>${markedAbsentCount > 0 ? ` | <span class="text-danger">● A: ${markedAbsentCount}</span>` : ''}</span>
          </div>
          <div class="day-pill-trail">
            ${dayPills}
          </div>
        </div>

        <div style="margin-top: 10px; display: flex; gap: 6px; justify-content: flex-end; border-top: 1px solid rgba(0,0,0,0.06); padding-top: 8px;">
          <button class="btn btn-outline-success btn-xs" onclick="openCreditLeaveModalForEmp('${u.id || u.empId}')" title="Credit Extra Leave Days">
            <i class="fa-solid fa-gift"></i> + Credit
          </button>
          <button class="btn btn-outline-primary btn-xs" onclick="openLeaveModalForEmp('${u.id || u.empId}')" title="Log / Request Leave">
            <i class="fa-solid fa-calendar-plus"></i> + Leave
          </button>
          <button class="btn btn-outline-secondary btn-xs" onclick="openLeaveHistoryModal('${u.id || u.empId}')" title="View & Delete Leaves">
            <i class="fa-solid fa-list-check"></i> Records
          </button>
        </div>
      </div>
    `;
    })
    .join('');
}

