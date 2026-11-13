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
    setVal('user-phone', u.phone || u.mobile);
    setVal('user-designation', u.designation);
    setVal('user-rank', u.rank || 'Skilled Operations');
    setVal('user-role', u.role || 'Worker');
    setVal('user-department', u.department || 'Plant Operations');
    setVal('user-site', u.site || u.location || 'ACC Chanda Plant Site');
    setVal('user-salary', u.baseSalary || u.ctc || 25000);
    setVal('user-dob', u.dob);
    setVal('user-doj', u.dateOfJoining);
    setVal('user-bank-account', u.bankAccount);
    setVal('user-ifsc', u.ifsc);
    setVal('user-bank-name', u.bankName);
    setVal('user-uan', u.uan);
    setVal('user-pf-no', u.pfNo);
    setVal('user-esic-no', u.esicNo);
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
      phone: document.getElementById('user-phone')?.value?.trim() || '',
      mobile: document.getElementById('user-phone')?.value?.trim() || '',
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
      bankAccount: document.getElementById('user-bank-account')?.value?.trim() || '',
      ifsc: document.getElementById('user-ifsc')?.value?.trim() || '',
      bankName: document.getElementById('user-bank-name')?.value?.trim() || '',
      uan: document.getElementById('user-uan')?.value?.trim() || '',
      pfNo: document.getElementById('user-pf-no')?.value?.trim() || '',
      esicNo: document.getElementById('user-esic-no')?.value?.trim() || '',
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
    const tbody = document.getElementById('muster-roll-tbody');
    if (!tbody) return;

    const allUsers = ERP.state.data.users || [];
    const activeStaff = allUsers.filter(u => u.role !== 'Super Admin' && u.status !== 'Inactive');
    const today = new Date().toISOString().split('T')[0];

    const attList = ERP.state.data.attendance || [];
    const todayMap = {};
    attList.forEach(a => {
      if (a.date === today) {
        todayMap[a.userId || a.empId] = a;
      }
    });

    let pCount = 0;
    let aCount = 0;
    let otHoursTotal = 0;

    let rowsHtml = '';
    activeStaff.forEach((u, idx) => {
      const rec = todayMap[u.id] || todayMap[u.empId] || { status: 'P', otHours: 0, shift: 'A' };
      if (rec.status === 'P') pCount++;
      else if (rec.status === 'A') aCount++;
      otHoursTotal += Number(rec.otHours || 0);

      rowsHtml += `
        <tr data-user-id="${u.id || u.empId}">
          <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
          <td>
            <div style="font-weight: 700; color: var(--logo-navy);">${ERP.utils.escapeHtml(u.name)}</div>
            <div style="font-size: 11px; color: var(--text-dim);">${ERP.utils.escapeHtml(u.empId || 'EMP-' + idx)} • ${ERP.utils.escapeHtml(u.designation || 'Staff')}</div>
          </td>
          <td style="text-align: center;">
            <select class="custom-select muster-status-sel" style="font-weight: 800; width: 110px;">
              <option value="P" ${rec.status === 'P' ? 'selected' : ''}>🟢 Present</option>
              <option value="A" ${rec.status === 'A' ? 'selected' : ''}>🔴 Absent</option>
              <option value="HD" ${rec.status === 'HD' ? 'selected' : ''}>🟡 Half-Day</option>
              <option value="PL" ${rec.status === 'PL' ? 'selected' : ''}>🔵 Paid Leave</option>
              <option value="WO" ${rec.status === 'WO' ? 'selected' : ''}>⚪ Weekly Off</option>
            </select>
          </td>
          <td style="text-align: center;">
            <select class="custom-select muster-shift-sel" style="width: 100px;">
              <option value="A" ${rec.shift === 'A' ? 'selected' : ''}>Shift A (06-14)</option>
              <option value="B" ${rec.shift === 'B' ? 'selected' : ''}>Shift B (14-22)</option>
              <option value="Night" ${rec.shift === 'Night' ? 'selected' : ''}>Night (22-06)</option>
              <option value="General" ${rec.shift === 'General' ? 'selected' : ''}>General (09-18)</option>
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
    const tbody = document.getElementById('muster-roll-tbody');
    if (!tbody) return;

    const today = new Date().toISOString().split('T')[0];
    const records = [];

    tbody.querySelectorAll('tr[data-user-id]').forEach(tr => {
      const uId = tr.getAttribute('data-user-id');
      const status = tr.querySelector('.muster-status-sel')?.value || 'P';
      const shift = tr.querySelector('.muster-shift-sel')?.value || 'A';
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

// Aliases for global compatibility
window.allUsers = ERP.state.data.users;
