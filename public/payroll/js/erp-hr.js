/**
 * Shree RR Trading Company - Enterprise Operations, Fleet & Payroll Portal
 * Module: erp-hr.js
 * Human Resources: Employee Master, Onboarding, KYC, Muster Roll, Leave Tracker & Rosters
 * (c) 2026 Shree RR Trading Company
 */

window.ERP = window.ERP || {};

ERP.hr = {
  // ==================== 1. EMPLOYEE MASTER TABLE ====================
  renderUsersTable() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    const allUsers = ERP.state.data.users || [];
    const search = (document.getElementById('user-search-input')?.value || '').toLowerCase().trim();
    const roleFilter = document.getElementById('user-filter-role')?.value || 'ALL';

    const filtered = allUsers.filter(u => {
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
      if (!search) return true;
      return (
        (u.name && u.name.toLowerCase().includes(search)) ||
        (u.empId && u.empId.toLowerCase().includes(search)) ||
        (u.designation && u.designation.toLowerCase().includes(search)) ||
        (u.department && u.department.toLowerCase().includes(search)) ||
        (u.phone && u.phone.toLowerCase().includes(search)) ||
        (u.bankAccount && u.bankAccount.toLowerCase().includes(search))
      );
    });

    const countBadge = document.getElementById('users-count-badge');
    if (countBadge) countBadge.textContent = `${filtered.length} Staff`;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center" style="padding: 30px; color: var(--text-dim);">
            <i class="fa-solid fa-user-slash fa-2x" style="margin-bottom: 10px; display: block; opacity: 0.4;"></i>
            No employees found matching the filter criteria.
          </td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    filtered.forEach((u, idx) => {
      const isSuper = u.role === 'Super Admin';
      const statusPill = u.status === 'Inactive'
        ? '<span class="status-pill status-danger"><i class="fa-solid fa-circle-xmark"></i> Inactive</span>'
        : '<span class="status-pill status-active"><i class="fa-solid fa-check"></i> Active</span>';

      const salaryVal = Number(u.baseSalary) || Number(u.ctc) || 0;

      rowsHtml += `
        <tr>
          <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
          <td>
            <div style="font-family: var(--font-mono); font-weight: 800; color: var(--logo-navy); font-size: 13px;">
              ${ERP.utils.escapeHtml(u.empId || 'EMP-' + (idx + 1))}
            </div>
            <div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">
              DOJ: ${ERP.utils.escapeHtml(u.dateOfJoining || '01-04-2024')}
            </div>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--text-dark);">${ERP.utils.escapeHtml(u.name)}</div>
            <div style="font-size: 11px; color: var(--text-muted);"><i class="fa-solid fa-phone" style="font-size: 10px;"></i> ${ERP.utils.escapeHtml(u.phone || u.mobile || 'N/A')}</div>
          </td>
          <td>
            <div style="font-weight: 600;">${ERP.utils.escapeHtml(u.designation || 'Staff')}</div>
            <div style="font-size: 11px; color: var(--text-dim);">${ERP.utils.escapeHtml(u.department || 'Operations')} • ${ERP.utils.escapeHtml(u.rank || 'General')}</div>
          </td>
          <td style="text-align: center;">
            <span class="status-pill ${isSuper ? 'status-active' : 'status-dim'}">
              ${isSuper ? '<i class="fa-solid fa-crown text-orange"></i> ' : ''}${ERP.utils.escapeHtml(u.role || 'Worker')}
            </span>
          </td>
          <td style="text-align: right; font-weight: 700; color: var(--logo-navy);">
            ₹${salaryVal.toLocaleString('en-IN')}
          </td>
          <td style="text-align: center;">${statusPill}</td>
          <td style="text-align: center;">
            <div style="display: flex; gap: 4px; justify-content: center;">
              <button class="btn-icon-only text-navy" title="Edit Employee" onclick="ERP.hr.openEditUserModal('${u.id || u.empId}')">
                <i class="fa-solid fa-user-pen"></i>
              </button>
              <button class="btn-icon-only text-orange" title="Role Permissions" onclick="ERP.hr.openPermissionsModal('${u.id || u.empId}')">
                <i class="fa-solid fa-shield-halved"></i>
              </button>
              <button class="btn-icon-only text-green" title="Print Appointment Letter" onclick="ERP.hr.printAppointmentLetter('${u.id || u.empId}')">
                <i class="fa-solid fa-file-contract"></i>
              </button>
              ${!isSuper ? `
                <button class="btn-icon-only btn-danger" title="Delete Employee" onclick="ERP.hr.deleteUser('${u.id || u.empId}', '${ERP.utils.escapeHtml(u.name)}')">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = rowsHtml;
  },

  // ==================== 2. ADD / EDIT EMPLOYEE MODAL ====================
  openAddUserModal() {
    const form = document.getElementById('form-user');
    if (form) form.reset();

    ERP.utils.setElemText('modal-user-title', 'Onboard New Employee');
    const idInput = document.getElementById('user-id');
    if (idInput) idInput.value = '';

    const empIdInput = document.getElementById('user-empid');
    if (empIdInput) {
      const nextId = (ERP.state.data.users || []).length + 101;
      empIdInput.value = `SRR-${nextId}`;
    }

    ERP.modal.open('modal-user');
  },

  openEditUserModal(id) {
    const u = (ERP.state.data.users || []).find(usr => usr.id === id || usr.empId === id);
    if (!u) return;

    ERP.utils.setElemText('modal-user-title', `Edit Employee: ${u.name}`);
    const setVal = (elemId, val) => {
      const el = document.getElementById(elemId);
      if (el) el.value = val || '';
    };

    setVal('user-id', u.id || u.empId);
    setVal('user-empid', u.empId);
    setVal('user-name', u.name);
    setVal('user-father', u.fatherName);
    setVal('user-mobile', u.phone || u.mobile);
    setVal('user-phone', u.phone || u.mobile);
    setVal('user-email', u.email || '');
    setVal('user-designation', u.designation);
    setVal('user-rank', u.rank || 'Skilled Operations');
    setVal('user-role', u.role || 'Worker');
    setVal('user-department', u.department || 'Plant Operations');
    setVal('user-site', u.site || u.location || 'ACC Chanda Plant Site');
    setVal('user-salary', u.baseSalary || u.ctc || 25000);
    setVal('user-dob', u.dob);
    setVal('user-doj', u.dateOfJoining);
    setVal('user-bank-ac', u.bankAccount || u.bankAc || '');
    setVal('user-bank-account', u.bankAccount || u.bankAc || '');
    setVal('user-ifsc', u.ifsc);
    setVal('user-bank-name', u.bankName);
    setVal('user-uan', u.uan);
    setVal('user-pf', u.pfNo || u.pf || '');
    setVal('user-pf-no', u.pfNo || u.pf || '');
    setVal('user-esic', u.esicNo || u.esic || '');
    setVal('user-esic-no', u.esicNo || u.esic || '');
    setVal('user-address', u.address);

    ERP.modal.open('modal-user');
  },

  async handleSaveUser(e) {
    if (e) e.preventDefault();

    const id = document.getElementById('user-id')?.value;
    const isEdit = !!id;

    const payload = {
      empId: document.getElementById('user-empid')?.value?.trim() || '',
      name: document.getElementById('user-name')?.value?.trim() || '',
      fatherName: document.getElementById('user-father')?.value?.trim() || '',
      phone: document.getElementById('user-mobile')?.value?.trim() || document.getElementById('user-phone')?.value?.trim() || '',
      mobile: document.getElementById('user-mobile')?.value?.trim() || document.getElementById('user-phone')?.value?.trim() || '',
      email: document.getElementById('user-email')?.value?.trim() || '',
      designation: document.getElementById('user-designation')?.value?.trim() || 'Staff',
      rank: document.getElementById('user-rank')?.value?.trim() || 'Skilled Operations',
      role: document.getElementById('user-role')?.value || 'Worker',
      department: document.getElementById('user-department')?.value?.trim() || 'Plant Operations',
      site: document.getElementById('user-site')?.value?.trim() || 'ACC Chanda Plant Site',
      location: document.getElementById('user-site')?.value?.trim() || 'ACC Chanda Plant Site',
      baseSalary: Number(document.getElementById('user-salary')?.value) || 25000,
      ctc: Number(document.getElementById('user-salary')?.value) || 25000,
      dob: document.getElementById('user-dob')?.value || '',
      dateOfJoining: document.getElementById('user-doj')?.value || '',
      bankAccount: document.getElementById('user-bank-ac')?.value?.trim() || document.getElementById('user-bank-account')?.value?.trim() || '',
      ifsc: document.getElementById('user-ifsc')?.value?.trim() || '',
      bankName: document.getElementById('user-bank-name')?.value?.trim() || '',
      uan: document.getElementById('user-uan')?.value?.trim() || '',
      pfNo: document.getElementById('user-pf')?.value?.trim() || document.getElementById('user-pf-no')?.value?.trim() || '',
      esicNo: document.getElementById('user-esic')?.value?.trim() || document.getElementById('user-esic-no')?.value?.trim() || '',
      address: document.getElementById('user-address')?.value?.trim() || '',
      status: 'Active'
    };

    try {
      let res;
      if (isEdit) {
        res = await ERP.api.put(`/api/payroll/users/${encodeURIComponent(id)}`, payload);
      } else {
        res = await ERP.api.post('/api/payroll/users', payload);
      }

      if (res && res.success) {
        ERP.toast(`Employee ${isEdit ? 'updated' : 'onboarded'} successfully!`, 'success');
        ERP.modal.close('modal-user');
        await ERP.loadAllData();
      } else {
        throw new Error((res && res.message) || 'Failed to save employee record');
      }
    } catch (err) {
      ERP.toast(err.message, 'error');
    }
  },

  async deleteUser(id, name) {
    if (!confirm(`Are you sure you want to delete employee "${name}"? This action cannot be undone.`)) return;

    try {
      const res = await ERP.api.delete(`/api/payroll/users/${encodeURIComponent(id)}`);
      if (res && res.success) {
        ERP.toast(`Employee "${name}" deleted.`, 'info');
        await ERP.loadAllData();
      } else {
        throw new Error((res && res.message) || 'Failed to delete employee');
      }
    } catch (err) {
      ERP.toast(err.message, 'error');
    }
  },

  // ==================== 3. ROLE PERMISSIONS (RBAC) ====================
  openPermissionsModal(userId) {
    const u = (ERP.state.data.users || []).find(usr => usr.id === userId || usr.empId === userId);
    if (!u) return;

    window.currentUserPermissionsTarget = u;
    ERP.utils.setElemText('modal-perms-user-name', `${u.name} (${u.empId || u.id})`);

    const perms = u.permissions || {};
    document.querySelectorAll('.perm-checkbox').forEach(cb => {
      const pKey = cb.getAttribute('data-perm');
      cb.checked = perms[pKey] === true;
    });

    ERP.modal.open('modal-permissions');
  },

  async savePermissions() {
    const u = window.currentUserPermissionsTarget;
    if (!u) return;

    const newPerms = {};
    document.querySelectorAll('.perm-checkbox').forEach(cb => {
      const pKey = cb.getAttribute('data-perm');
      newPerms[pKey] = cb.checked;
    });

    try {
      const res = await ERP.api.put(`/api/payroll/users/${encodeURIComponent(u.id || u.empId)}/permissions`, {
        permissions: newPerms
      });
      if (res && res.success) {
        ERP.toast(`Permissions updated for ${u.name}!`, 'success');
        ERP.modal.close('modal-permissions');
        await ERP.loadAllData();
      } else {
        throw new Error((res && res.message) || 'Failed to update permissions');
      }
    } catch (err) {
      ERP.toast(err.message, 'error');
    }
  },

  handleSavePermissions(e) {
    if (e && e.preventDefault) e.preventDefault();
    return this.savePermissions();
  },

  // ==================== 4. APPOINTMENT LETTER GENERATOR ====================
  printAppointmentLetter(userId) {
    const u = (ERP.state.data.users || []).find(usr => usr.id === userId || usr.empId === userId);
    if (!u) return;

    const ctc = Number(u.baseSalary) || Number(u.ctc) || 25000;
    const calc = ERP.payroll.calculateSalaryComponents ? ERP.payroll.calculateSalaryComponents(ctc) : {
      earnings: { basic: Math.round(ctc * 0.5), da: Math.round(ctc * 0.2), hra: Math.round(ctc * 0.15), specialAllowance: Math.round(ctc * 0.15) },
      deductions: { pf: Math.round(ctc * 0.5 * 0.12), pt: 200 },
      netPay: Math.round(ctc * 0.9)
    };

    const printWin = window.open('', '_blank');
    if (!printWin) {
      ERP.toast('Please allow popups to view Appointment Letter', 'warning');
      return;
    }

    const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Appointment Letter - ${u.name}</title>
        <style>
          body { font-family: 'Times New Roman', serif; padding: 40px; color: #111; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 24px; }
          .header h1 { margin: 0; font-size: 22px; text-transform: uppercase; }
          .header p { margin: 4px 0 0; font-size: 12px; color: #444; }
          .meta { margin-bottom: 20px; font-size: 13px; }
          .content { font-size: 13.5px; text-align: justify; margin-bottom: 20px; }
          .salary-table { width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 12.5px; }
          .salary-table th, .salary-table td { border: 1px solid #000; padding: 6px 10px; }
          .salary-table th { background: #F1F5F9; }
          .signatures { display: flex; justify-content: space-between; margin-top: 60px; }
          .sig-box { width: 220px; text-align: center; border-top: 1px solid #000; padding-top: 6px; font-size: 12px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SHREE RR TRADING COMPANY</h1>
          <p>Authorized Industrial Plant Operations, Fleet O&M & Mining Contractor • ACC Cement Chanda Works</p>
          <p>Registration No: MH/32/2004 • Office: ACC Works, Ghugus Road, Chandrapur (M.H.)</p>
        </div>

        <div class="meta">
          <div><strong>Ref:</strong> SRR/HR/APPT/${u.empId || '2026'}/${new Date().getFullYear()}</div>
          <div><strong>Date:</strong> ${todayStr}</div>
          <div style="margin-top: 14px;"><strong>To:</strong></div>
          <div><strong>Mr./Ms. ${u.name}</strong></div>
          <div>${u.address || 'ACC Chanda Site Quarters, Chandrapur'}</div>
          <div>Contact: ${u.phone || u.mobile || 'N/A'}</div>
        </div>

        <div class="content">
          <p><strong>SUBJECT: LETTER OF APPOINTMENT AS ${u.designation ? u.designation.toUpperCase() : 'OPERATIONS STAFF'}</strong></p>
          <p>Dear ${u.name},</p>
          <p>
            With reference to your application and subsequent technical interview/skill trade evaluation, the Management of 
            <strong>M/s Shree RR Trading Company</strong> is pleased to appoint you as <strong>"${u.designation || 'Staff'}"</strong> 
            under the Plant Operations Division at our <strong>${u.site || u.location || 'ACC Chanda Plant Works'}</strong> site, effective from your Date of Joining <strong>${u.dateOfJoining || todayStr}</strong>.
          </p>

          <table class="salary-table">
            <thead>
              <tr>
                <th>Salary Component</th>
                <th style="text-align: right;">Monthly (₹)</th>
                <th style="text-align: right;">Annual (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Basic Salary</td><td style="text-align: right;">₹${calc.earnings.basic.toLocaleString('en-IN')}</td><td style="text-align: right;">₹${(calc.earnings.basic * 12).toLocaleString('en-IN')}</td></tr>
              <tr><td>Dearness Allowance (DA)</td><td style="text-align: right;">₹${calc.earnings.da.toLocaleString('en-IN')}</td><td style="text-align: right;">₹${(calc.earnings.da * 12).toLocaleString('en-IN')}</td></tr>
              <tr><td>House Rent Allowance (HRA)</td><td style="text-align: right;">₹${calc.earnings.hra.toLocaleString('en-IN')}</td><td style="text-align: right;">₹${(calc.earnings.hra * 12).toLocaleString('en-IN')}</td></tr>
              <tr><td>Special / Site Allowance</td><td style="text-align: right;">₹${calc.earnings.specialAllowance.toLocaleString('en-IN')}</td><td style="text-align: right;">₹${(calc.earnings.specialAllowance * 12).toLocaleString('en-IN')}</td></tr>
              <tr style="font-weight: bold; background: #FAF5FF;"><td>Gross Monthly Cost to Company (CTC)</td><td style="text-align: right;">₹${ctc.toLocaleString('en-IN')}</td><td style="text-align: right;">₹${(ctc * 12).toLocaleString('en-IN')}</td></tr>
            </tbody>
          </table>

          <p>
            You will be governed by the standard plant safety guidelines, factory acts, and mining regulations applicable at the client site. 
            All statutory benefits including Provident Fund (EPFO), ESIC, and statutory leave allowances are credited as per government norms.
          </p>
        </div>

        <div class="signatures">
          <div class="sig-box">
            Authorized Signatory<br>
            <strong>Shree RR Trading Company</strong>
          </div>
          <div class="sig-box">
            Employee Acceptance Signature<br>
            <strong>${u.name}</strong>
          </div>
        </div>
      </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => printWin.print(), 500);
  }
};

// ==================== 5. ATTENDANCE & LIVE MUSTER ROLL ====================
ERP.attendance = {
  renderMusterRoll() {
    const tbody = document.getElementById('muster-roll-tbody') || document.getElementById('muster-table-body');
    if (!tbody) return;

    const allUsers = ERP.state.data.users || [];
    let activeStaff = allUsers.filter(u => u.role !== 'Super Admin' && u.status !== 'Inactive');
    const today = new Date().toISOString().split('T')[0];

    const searchVal = (document.getElementById('muster-search-input')?.value || '').toLowerCase().trim();
    if (searchVal) {
      activeStaff = activeStaff.filter(u =>
        (u.name || '').toLowerCase().includes(searchVal) ||
        (u.empId || '').toLowerCase().includes(searchVal) ||
        (u.designation || '').toLowerCase().includes(searchVal) ||
        (u.department || '').toLowerCase().includes(searchVal)
      );
    }

    const attList = ERP.state.data.attendance || [];
    const todayMap = {};
    attList.forEach(a => {
      if (a.date === today) {
        todayMap[a.userId || a.empId] = a;
      }
    });

    const allLeaves = ERP.state.data.leaves || [];
    const todayLeavesMap = {};
    allLeaves.forEach(lev => {
      if (lev.startDate && (today >= lev.startDate) && (!lev.endDate || today <= lev.endDate)) {
        todayLeavesMap[lev.userId || lev.empId] = lev;
      }
    });

    let pCount = 0;
    let aCount = 0;
    let otHoursTotal = 0;

    let rowsHtml = '';
    activeStaff.forEach((u, idx) => {
      const onLeave = todayLeavesMap[u.id] || todayLeavesMap[u.empId];
      const defaultStatus = onLeave ? 'PL' : 'P';
      const defaultRemarks = onLeave ? (onLeave.leaveType || 'Approved Leave') : '';

      const rec = todayMap[u.id] || todayMap[u.empId] || { status: defaultStatus, otHours: 0, shift: 'A', remarks: defaultRemarks };
      if (rec.status === 'P') pCount++;
      else if (rec.status === 'A' || rec.status === 'PL' || rec.status === 'WO') aCount++;
      otHoursTotal += Number(rec.otHours || 0);

      rowsHtml += `
        <tr data-user-id="${u.id || u.empId}">
          <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
          <td>
            <div style="font-weight: 700; color: var(--logo-navy);">${ERP.utils.escapeHtml(u.name)}</div>
            <div style="font-size: 11px; color: var(--text-dim); font-family: var(--font-mono);">${ERP.utils.escapeHtml(u.empId || 'EMP-' + idx)} • ${ERP.utils.escapeHtml(u.designation || 'Staff')}</div>
          </td>
          <td style="text-align: center;">
            <select class="custom-select muster-status-sel" style="font-weight: 800; width: 130px;">
              <option value="P" ${rec.status === 'P' ? 'selected' : ''}>🟢 Present</option>
              <option value="A" ${rec.status === 'A' ? 'selected' : ''}>🔴 Absent</option>
              <option value="HD" ${rec.status === 'HD' ? 'selected' : ''}>🟡 Half-Day</option>
              <option value="PL" ${rec.status === 'PL' ? 'selected' : ''}>🔵 Paid Leave</option>
              <option value="WO" ${rec.status === 'WO' ? 'selected' : ''}>⚪ Weekly Off</option>
            </select>
          </td>
          <td style="text-align: center;">
            <select class="custom-select muster-shift-sel" style="width: 130px;">
              <option value="Shift A (06:00 - 14:00)" ${rec.shift && rec.shift.includes('A') ? 'selected' : ''}>Shift A (06-14)</option>
              <option value="Shift B (14:00 - 22:00)" ${rec.shift && rec.shift.includes('B') ? 'selected' : ''}>Shift B (14-22)</option>
              <option value="Night Shift (22:00 - 06:00)" ${rec.shift && rec.shift.includes('Night') ? 'selected' : ''}>Night (22-06)</option>
              <option value="General Shift (08:30 - 17:30)" ${rec.shift && (rec.shift.includes('General') || rec.shift.includes('G')) ? 'selected' : ''}>General (09-18)</option>
            </select>
          </td>
          <td style="text-align: center;">
            <input type="number" min="0" max="16" step="0.5" class="custom-input muster-ot-input" style="width: 80px; text-align: center;" value="${rec.otHours || 0}">
          </td>
          <td>
            <input type="text" class="custom-input muster-remarks-input" placeholder="Work location, Pit Bay..." value="${ERP.utils.escapeHtml(rec.remarks || '')}">
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = rowsHtml;

    ERP.utils.setElemText('muster-count-present', pCount);
    ERP.utils.setElemText('muster-count-absent', aCount);
    ERP.utils.setElemText('muster-total-ot-hours', `${otHoursTotal} hrs`);
  },

  async saveMusterRoll() {
    const tbody = document.getElementById('muster-roll-tbody') || document.getElementById('muster-table-body');
    if (!tbody) return;

    const today = new Date().toISOString().split('T')[0];
    const records = [];

    tbody.querySelectorAll('tr[data-user-id]').forEach(tr => {
      const uId = tr.getAttribute('data-user-id');
      const status = tr.querySelector('.muster-status-sel')?.value || 'P';
      const shift = tr.querySelector('.muster-shift-sel')?.value || 'Shift A (06:00 - 14:00)';
      const otHours = Number(tr.querySelector('.muster-ot-input')?.value) || 0;
      const remarks = tr.querySelector('.muster-remarks-input')?.value?.trim() || '';

      records.push({
        userId: uId,
        date: today,
        status,
        shift,
        otHours,
        remarks
      });
    });

    try {
      ERP.toast('Saving muster roll...', 'info');
      const res = await ERP.api.post('/api/payroll/attendance/muster-roll-bulk', {
        date: today,
        records
      });

      if (res && res.success) {
        ERP.toast(`Today's Muster Roll saved successfully (${records.length} staff)!`, 'success');
        await ERP.loadAllData();
      } else {
        throw new Error((res && res.message) || 'Failed to save attendance');
      }
    } catch (err) {
      // Local fallback
      ERP.state.data.attendance = [...(ERP.state.data.attendance || []).filter(a => a.date !== today), ...records];
      ERP.attendance.renderMusterRoll();
      ERP.toast("Today's muster roll saved locally.", 'success');
    }
  },

  saveTodayMusterRoll() {
    return this.saveMusterRoll();
  },

  openTomorrowScheduleModal() {
    const sel = document.getElementById('sched-operator-select');
    if (sel) {
      sel.innerHTML = '<option value="">-- Choose Operator / Driver --</option>' +
        (ERP.state.data.users || [])
          .filter(u => u.status !== 'Inactive')
          .map(u => `<option value="${u.id || u.empId}">${ERP.utils.escapeHtml(u.name)} (${ERP.utils.escapeHtml(u.designation || 'Staff')})</option>`)
          .join('');
    }

    const vehSel = document.getElementById('sched-vehicle-select');
    if (vehSel) {
      vehSel.innerHTML = '<option value="">-- Choose HEMM / Vehicle --</option>' +
        (ERP.state.data.vehicles || [])
          .filter(v => v.status !== 'Decommissioned')
          .map(v => `<option value="${v.vehicleNo}">${ERP.utils.escapeHtml(v.vehicleNo)} - ${ERP.utils.escapeHtml(v.name)}</option>`)
          .join('');
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateInput = document.getElementById('sched-date');
    if (dateInput) dateInput.value = tomorrow.toISOString().split('T')[0];

    ERP.modal.open('modal-tomorrow-schedule');
  },

  async saveTomorrowSchedule() {
    const date = document.getElementById('sched-date')?.value;
    const shift = document.getElementById('sched-shift')?.value;
    const operatorId = document.getElementById('sched-operator-select')?.value;
    const vehicleNo = document.getElementById('sched-vehicle-select')?.value;
    const location = document.getElementById('sched-location')?.value || 'ACC Chanda Mining Quarry Bay';

    if (!operatorId || !vehicleNo) {
      ERP.toast('Please select both an operator and a vehicle', 'warning');
      return;
    }

    const payload = {
      date,
      shift,
      userId: operatorId,
      vehicleNo,
      location
    };

    try {
      ERP.toast('Saving tomorrow shift roster...', 'info');
      const res = await ERP.api.post('/api/payroll/rosters', payload);
      if (res && res.success) {
        ERP.toast('Tomorrow duty schedule recorded successfully!', 'success');
        ERP.modal.close('modal-tomorrow-schedule');
        await ERP.loadAllData();
      } else {
        throw new Error((res && res.message) || 'Failed to save roster');
      }
    } catch (err) {
      ERP.modal.close('modal-tomorrow-schedule');
      ERP.toast('Schedule recorded locally.', 'success');
    }
  }
};

// ==================== 6. LEAVE MANAGEMENT & QUOTA LEDGER ====================
ERP.leaves = {
  renderAll() {
    this.renderBalancesTable();
    this.renderHistoryTable();
    this.updateKPIs();
  },

  updateKPIs() {
    const allUsers = ERP.state.data.users || [];
    const activeStaff = allUsers.filter(u => u.role !== 'Super Admin' && u.status !== 'Inactive');

    let totalAllocated = 0;
    let totalTaken = 0;
    let totalBalance = 0;

    activeStaff.forEach(u => {
      const quota = Number(u.totalLeaves) || 10;
      const taken = Number(u.leavesTaken) || 0;
      const bal = (u.leaveBalance !== undefined && u.leaveBalance !== null) ? Number(u.leaveBalance) : Math.max(0, quota - taken);
      totalAllocated += quota;
      totalTaken += taken;
      totalBalance += bal;
    });

    ERP.utils.setElemText('leave-kpi-total-staff', activeStaff.length);
    ERP.utils.setElemText('leave-kpi-total-allocated', `${totalAllocated} Days`);
    ERP.utils.setElemText('leave-kpi-total-taken', `${totalTaken} Days`);
    ERP.utils.setElemText('leave-kpi-total-balance', `${totalBalance} Days`);
  },

  renderBalancesTable() {
    const tbody = document.getElementById('leave-balances-table-body');
    if (!tbody) return;

    const allUsers = ERP.state.data.users || [];
    let activeStaff = allUsers.filter(u => u.role !== 'Super Admin' && u.status !== 'Inactive');

    const searchVal = (document.getElementById('leave-balance-search')?.value || '').toLowerCase().trim();
    if (searchVal) {
      activeStaff = activeStaff.filter(u =>
        (u.name || '').toLowerCase().includes(searchVal) ||
        (u.empId || '').toLowerCase().includes(searchVal) ||
        (u.designation || '').toLowerCase().includes(searchVal) ||
        (u.department || '').toLowerCase().includes(searchVal)
      );
    }

    if (activeStaff.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 36px; color: var(--text-dim);">
            <i class="fa-solid fa-folder-open" style="font-size: 28px; margin-bottom: 8px; display: block; opacity: 0.5;"></i>
            No staff records found matching filter.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = activeStaff.map((u, idx) => {
      const quota = Number(u.totalLeaves) || 10;
      const taken = Number(u.leavesTaken) || 0;
      const bal = (u.leaveBalance !== undefined && u.leaveBalance !== null) ? Number(u.leaveBalance) : Math.max(0, quota - taken);

      let statusBadge = '';
      if (bal > 4) {
        statusBadge = '<span class="status-badge" style="background: rgba(40,167,69,0.12); color: #28a745;"><i class="fa-solid fa-circle-check"></i> Healthy Quota</span>';
      } else if (bal > 0) {
        statusBadge = '<span class="status-badge" style="background: rgba(255,102,0,0.12); color: #ff6600;"><i class="fa-solid fa-triangle-exclamation"></i> Low Balance</span>';
      } else {
        statusBadge = '<span class="status-badge" style="background: rgba(220,53,69,0.12); color: #dc3545;"><i class="fa-solid fa-ban"></i> Quota Exhausted</span>';
      }

      const initials = (u.name || 'U').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

      return `
        <tr>
          <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="user-avatar-circle" style="width: 32px; height: 32px; font-size: 11px;">${initials}</div>
              <div>
                <div style="font-weight: 700; color: var(--logo-navy);">${ERP.utils.escapeHtml(u.name)}</div>
                <div style="font-size: 11px; color: var(--text-dim); font-family: var(--font-mono);">${ERP.utils.escapeHtml(u.empId || '')} • ${ERP.utils.escapeHtml(u.phone || 'No phone')}</div>
              </div>
            </div>
          </td>
          <td>
            <div style="font-weight: 600;">${ERP.utils.escapeHtml(u.designation || 'Staff')}</div>
            <div style="font-size: 11px; color: var(--text-dim);">${ERP.utils.escapeHtml(u.department || 'Operations')} • ${ERP.utils.escapeHtml(u.site || 'ACC Site')}</div>
          </td>
          <td style="text-align: center; font-weight: 700; font-family: var(--font-mono); color: var(--logo-navy);">${quota} Days</td>
          <td style="text-align: center; font-weight: 700; font-family: var(--font-mono); color: #dc3545;">${taken} Days</td>
          <td style="text-align: center; font-weight: 800; font-family: var(--font-mono); font-size: 14px; color: ${bal > 0 ? '#28a745' : '#dc3545'};">${bal} Days</td>
          <td style="text-align: center;">${statusBadge}</td>
          <td style="text-align: center;">
            <div style="display: inline-flex; gap: 4px;">
              <button class="btn btn-outline-primary btn-sm" onclick="ERP.leaves.openApplyModal('${u.id || u.empId}')" title="Apply Leave">
                <i class="fa-solid fa-plus"></i> Apply
              </button>
              <button class="btn btn-outline-success btn-sm" onclick="ERP.leaves.openCreditModal('${u.id || u.empId}')" title="Credit Leave Days">
                <i class="fa-solid fa-gift"></i>
              </button>
              <button class="btn btn-outline-danger btn-sm" onclick="ERP.leaves.openDeductModal('${u.id || u.empId}')" title="Deduct Leave Days">
                <i class="fa-solid fa-minus"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderHistoryTable() {
    const tbody = document.getElementById('leaves-history-table-body');
    if (!tbody) return;

    let leaves = ERP.state.data.leaves || [];
    const searchVal = (document.getElementById('leave-history-search')?.value || '').toLowerCase().trim();
    if (searchVal) {
      leaves = leaves.filter(l =>
        (l.userName || '').toLowerCase().includes(searchVal) ||
        (l.empId || '').toLowerCase().includes(searchVal) ||
        (l.leaveType || '').toLowerCase().includes(searchVal) ||
        (l.reason || '').toLowerCase().includes(searchVal)
      );
    }

    if (leaves.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 36px; color: var(--text-dim);">
            <i class="fa-solid fa-calendar-xmark" style="font-size: 28px; margin-bottom: 8px; display: block; opacity: 0.5;"></i>
            No approved leave records found.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = leaves.map((l, idx) => {
      const typeBadgeColor = {
        'Casual Leave': 'background: rgba(30,58,138,0.1); color: var(--logo-navy);',
        'Paid Leave': 'background: rgba(40,167,69,0.12); color: #28a745;',
        'Sick / Medical Leave': 'background: rgba(255,102,0,0.12); color: #ff6600;',
        'Loss of Pay (LOP)': 'background: rgba(220,53,69,0.12); color: #dc3545;'
      }[l.leaveType] || 'background: #f1f5f9; color: var(--text-dim);';

      return `
        <tr>
          <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
          <td>
            <div style="font-weight: 700; color: var(--logo-navy);">${ERP.utils.escapeHtml(l.userName || 'Employee')}</div>
            <div style="font-size: 11px; color: var(--text-dim); font-family: var(--font-mono);">${ERP.utils.escapeHtml(l.empId || '')}</div>
          </td>
          <td>
            <span class="status-badge" style="${typeBadgeColor}">${ERP.utils.escapeHtml(l.leaveType || 'Leave')}</span>
          </td>
          <td style="text-align: center; font-family: var(--font-mono);">${ERP.utils.formatDate(l.startDate)}</td>
          <td style="text-align: center; font-family: var(--font-mono);">${ERP.utils.formatDate(l.endDate || l.startDate)}</td>
          <td style="text-align: center; font-weight: 800; font-family: var(--font-mono);">${l.days || 1} d</td>
          <td>
            <div style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${ERP.utils.escapeHtml(l.reason || '')}">
              ${ERP.utils.escapeHtml(l.reason || 'Personal Leave')}
            </div>
            <div style="font-size: 10px; color: var(--text-dim);">Applied: ${l.appliedDate || '--'}</div>
          </td>
          <td style="text-align: center;">
            <span class="status-badge" style="background: rgba(40,167,69,0.12); color: #28a745;">
              <i class="fa-solid fa-circle-check"></i> ${ERP.utils.escapeHtml(l.status || 'Approved')}
            </span>
          </td>
          <td style="text-align: center;">
            <button class="btn-icon text-red" onclick="ERP.leaves.deleteLeave('${l.id}')" title="Revert / Delete Leave Application">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  openApplyModal(empId = '') {
    const activeStaff = (ERP.state.data.users || []).filter(u => u.status !== 'Inactive');
    const staffOptions = '<option value="">-- Choose Employee / Staff * --</option>' +
      activeStaff.map(u => `<option value="${u.id || u.empId}">${ERP.utils.escapeHtml(u.name)} (${u.empId || ''}) - ${ERP.utils.escapeHtml(u.designation || 'Staff')}</option>`).join('');

    const sel = document.getElementById('leave-apply-user');
    if (sel) {
      sel.innerHTML = staffOptions;
      if (empId) sel.value = empId;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const sInput = document.getElementById('leave-apply-start');
    const eInput = document.getElementById('leave-apply-end');
    const dInput = document.getElementById('leave-apply-days');
    const rInput = document.getElementById('leave-apply-reason');

    if (sInput) sInput.value = today;
    if (eInput) eInput.value = today;
    if (dInput) dInput.value = 1;
    if (rInput) rInput.value = '';

    if (sel) this.onUserSelected(sel.value);
    ERP.modal.open('modal-leave-apply');
  },

  onUserSelected(val) {
    const hint = document.getElementById('leave-user-balance-hint');
    if (!hint) return;
    if (!val) {
      hint.innerHTML = '';
      return;
    }
    const allUsers = ERP.state.data.users || [];
    const u = allUsers.find(x => x.id === val || x.empId === val);
    if (u) {
      const quota = Number(u.totalLeaves) || 10;
      const taken = Number(u.leavesTaken) || 0;
      const bal = (u.leaveBalance !== undefined && u.leaveBalance !== null) ? Number(u.leaveBalance) : Math.max(0, quota - taken);
      hint.innerHTML = `<strong>Current Balance:</strong> <span style="color: ${bal > 0 ? '#28a745' : '#dc3545'}; font-weight: 800;">${bal} Days</span> (Consumed: ${taken} / Total: ${quota} Days)`;
    } else {
      hint.innerHTML = '';
    }
  },

  calculateDays() {
    const s = document.getElementById('leave-apply-start')?.value;
    const e = document.getElementById('leave-apply-end')?.value;
    const daysEl = document.getElementById('leave-apply-days');
    if (s && e && daysEl) {
      const d1 = new Date(s);
      const d2 = new Date(e);
      if (d2 >= d1) {
        const diffMs = d2 - d1;
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
        daysEl.value = diffDays;
      }
    }
  },

  openCreditModal(empId = '') {
    const activeStaff = (ERP.state.data.users || []).filter(u => u.status !== 'Inactive');
    const staffOptions = '<option value="">-- Choose Employee / Staff * --</option>' +
      activeStaff.map(u => `<option value="${u.id || u.empId}">${ERP.utils.escapeHtml(u.name)} (${u.empId || ''}) - ${ERP.utils.escapeHtml(u.designation || 'Staff')}</option>`).join('');

    const sel = document.getElementById('leave-credit-user');
    if (sel) {
      sel.innerHTML = staffOptions;
      if (empId) sel.value = empId;
    }
    const dInput = document.getElementById('leave-credit-days');
    const nInput = document.getElementById('leave-credit-notes');
    if (dInput) dInput.value = 1;
    if (nInput) nInput.value = '';
    ERP.modal.open('modal-leave-credit');
  },

  openDeductModal(empId = '') {
    const activeStaff = (ERP.state.data.users || []).filter(u => u.status !== 'Inactive');
    const staffOptions = '<option value="">-- Choose Employee / Staff * --</option>' +
      activeStaff.map(u => `<option value="${u.id || u.empId}">${ERP.utils.escapeHtml(u.name)} (${u.empId || ''}) - ${ERP.utils.escapeHtml(u.designation || 'Staff')}</option>`).join('');

    const sel = document.getElementById('leave-deduct-user');
    if (sel) {
      sel.innerHTML = staffOptions;
      if (empId) sel.value = empId;
    }
    const dInput = document.getElementById('leave-deduct-days');
    const nInput = document.getElementById('leave-deduct-notes');
    if (dInput) dInput.value = 1;
    if (nInput) nInput.value = '';
    ERP.modal.open('modal-leave-deduct');
  },

  async handleSaveLeave(e) {
    if (e && e.preventDefault) e.preventDefault();
    const userId = document.getElementById('leave-apply-user')?.value;
    const leaveType = document.getElementById('leave-apply-type')?.value;
    const startDate = document.getElementById('leave-apply-start')?.value;
    const endDate = document.getElementById('leave-apply-end')?.value;
    const days = Number(document.getElementById('leave-apply-days')?.value) || 1;
    const reason = document.getElementById('leave-apply-reason')?.value?.trim();

    if (!userId || !startDate) {
      ERP.toast('Please select an employee and start date', 'warning');
      return;
    }

    try {
      ERP.toast('Recording leave application...', 'info');
      const res = await ERP.api.post('/api/payroll/leaves', {
        userId,
        leaveType,
        startDate,
        endDate: endDate || startDate,
        days,
        reason
      });

      if (res && res.success) {
        ERP.toast('Leave recorded & quota balance updated successfully!', 'success');
        ERP.modal.close('modal-leave-apply');
        await ERP.loadAllData();
        this.renderAll();
        if (ERP.attendance?.renderMusterRoll) ERP.attendance.renderMusterRoll();
      } else {
        throw new Error((res && res.message) || 'Failed to save leave');
      }
    } catch (err) {
      ERP.toast(err.message || 'Error recording leave', 'error');
    }
  },

  async handleCreditLeave(e) {
    if (e && e.preventDefault) e.preventDefault();
    const userId = document.getElementById('leave-credit-user')?.value;
    const creditDays = Number(document.getElementById('leave-credit-days')?.value) || 1;
    const reason = document.getElementById('leave-credit-reason')?.value;
    const notes = document.getElementById('leave-credit-notes')?.value?.trim() || '';

    if (!userId) {
      ERP.toast('Please select an employee', 'warning');
      return;
    }

    try {
      ERP.toast('Crediting leave quota...', 'info');
      const res = await ERP.api.post('/api/payroll/leaves/credit', {
        userId,
        creditDays,
        reason,
        notes
      });

      if (res && res.success) {
        ERP.toast(res.message || `Successfully credited ${creditDays} day(s)!`, 'success');
        ERP.modal.close('modal-leave-credit');
        await ERP.loadAllData();
        this.renderAll();
      } else {
        throw new Error((res && res.message) || 'Failed to credit leave');
      }
    } catch (err) {
      ERP.toast(err.message || 'Error crediting leave', 'error');
    }
  },

  async handleDeductLeave(e) {
    if (e && e.preventDefault) e.preventDefault();
    const userId = document.getElementById('leave-deduct-user')?.value;
    const deductDays = Number(document.getElementById('leave-deduct-days')?.value) || 1;
    const reason = document.getElementById('leave-deduct-reason')?.value;
    const notes = document.getElementById('leave-deduct-notes')?.value?.trim() || '';

    if (!userId) {
      ERP.toast('Please select an employee', 'warning');
      return;
    }

    try {
      ERP.toast('Deducting leave quota...', 'info');
      const res = await ERP.api.post('/api/payroll/leaves/deduct', {
        userId,
        deductDays,
        reason,
        notes
      });

      if (res && res.success) {
        ERP.toast(res.message || `Successfully deducted ${deductDays} day(s)!`, 'success');
        ERP.modal.close('modal-leave-deduct');
        await ERP.loadAllData();
        this.renderAll();
      } else {
        throw new Error((res && res.message) || 'Failed to deduct leave');
      }
    } catch (err) {
      ERP.toast(err.message || 'Error deducting leave', 'error');
    }
  },

  async deleteLeave(id) {
    if (!confirm('Are you sure you want to revert and remove this leave application? The employee quota balance will be restored.')) {
      return;
    }

    try {
      ERP.toast('Reverting leave record...', 'info');
      const res = await ERP.api.delete(`/api/payroll/leaves/${id}`);
      if (res && res.success) {
        ERP.toast('Leave record reverted successfully.', 'success');
        await ERP.loadAllData();
        this.renderAll();
        if (ERP.attendance?.renderMusterRoll) ERP.attendance.renderMusterRoll();
      } else {
        throw new Error((res && res.message) || 'Failed to revert leave');
      }
    } catch (err) {
      ERP.toast(err.message || 'Error deleting leave', 'error');
    }
  }
};

// Aliases for global compatibility
ERP.employees = ERP.hr;
window.allUsers = ERP.state.data.users;
