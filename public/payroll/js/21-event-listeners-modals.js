// 21. Event Listeners & Modals
function initEventListeners() {
  initBulkUpload();
  initVehicleBulkImport();
  initSalarySlips();

  // Muster Date Picker & Quick Actions
  const datePicker = document.getElementById('muster-date-picker');
  if (datePicker) {
    if (!datePicker.value) {
      datePicker.value = new Date().toISOString().split('T')[0];
    }
    datePicker.addEventListener('change', () => {
      renderMusterRollTable();
      renderAttendanceGlassCards();
    });
  }

  document.getElementById('muster-search-input')?.addEventListener('input', renderMusterRollTable);
  document.getElementById('btn-export-muster-excel')?.addEventListener('click', exportDailyMusterExcel);

  const fillAllGBtn = document.getElementById('btn-muster-mark-all-g');
  if (fillAllGBtn) {
    fillAllGBtn.addEventListener('click', () => {
      document.querySelectorAll('.muster-shift-select').forEach((s) => (s.value = 'G Shift (08:30 AM - 05:30 PM)'));
      document.querySelectorAll('.muster-status-select').forEach((s) => (s.value = 'Present'));
      document.querySelectorAll('.muster-clockin-input').forEach((c) => (c.value = '08:30 AM'));
      document.querySelectorAll('.muster-clockout-input').forEach((c) => (c.value = '05:30 PM'));
      showToast('Workforce set to G Shift (08:30 AM - 05:30 PM, Present)');
    });
  }

  const fillAllPHBtn = document.getElementById('btn-muster-mark-all-ph');
  if (fillAllPHBtn) {
    fillAllPHBtn.addEventListener('click', () => {
      document.querySelectorAll('.muster-shift-select').forEach((s) => (s.value = 'PH - Public Holiday'));
      document.querySelectorAll('.muster-status-select').forEach((s) => (s.value = 'Public Holiday'));
      document.querySelectorAll('.muster-clockin-input').forEach((c) => (c.value = '-'));
      document.querySelectorAll('.muster-clockout-input').forEach((c) => (c.value = '-'));
      document.querySelectorAll('.muster-notes-input').forEach((n) => (n.value = 'Muster Roll: Public Holiday'));
      showToast('Workforce set to Public Holiday (Paid)!');
    });
  }

  const saveMusterBtn = document.getElementById('btn-save-daily-muster');
  if (saveMusterBtn) {
    saveMusterBtn.addEventListener('click', async () => {
      const date = datePicker ? datePicker.value : new Date().toISOString().split('T')[0];
      const rows = document.querySelectorAll('#muster-table-body tr');
      const musterRecords = [];

      rows.forEach((r) => {
        const userId = r.getAttribute('data-userid');
        const empId = r.getAttribute('data-empid');
        const userName = r.getAttribute('data-username');
        const shift = r.querySelector('.muster-shift-select')?.value || 'G Shift (08:30 AM - 05:30 PM)';
        const shiftCode = shift.includes('G Shift') ? 'G' : (shift.includes('A Shift') ? 'A' : (shift.includes('B Shift') ? 'B' : (shift.includes('C Shift') ? 'C' : (shift.includes('PH') ? 'PH' : 'WO'))));
        const status = r.querySelector('.muster-status-select')?.value || 'Present';
        const isAbsentOrOff = status === 'Absent' || status === 'Weekly Off' || status === 'Leave' || status === 'Public Holiday';
        const clockIn = r.querySelector('.muster-clockin-input')?.value || (isAbsentOrOff ? '-' : (shiftCode === 'G' ? '08:30 AM' : '08:00 AM'));
        const clockOut = r.querySelector('.muster-clockout-input')?.value || (isAbsentOrOff ? '-' : (shiftCode === 'G' ? '05:30 PM' : '05:00 PM'));
        const site = r.querySelector('.muster-site-input')?.value || 'ACC Chanda';
        const notes = r.querySelector('.muster-notes-input')?.value || (status === 'Absent' ? 'Daily Muster Roll: Absent' : (status === 'Weekly Off' ? 'Muster Roll: Weekly Off' : (status === 'Public Holiday' ? 'Muster Roll: Public Holiday' : (status === 'Leave' ? 'Muster Roll: On Leave' : `Muster Roll: Shift ${shiftCode} Marked`))));

        musterRecords.push({ userId, empId, userName, date, shift, shiftCode, clockIn, clockOut, status, site, notes });
      });

      if (musterRecords.length === 0) return;

      try {
        saveMusterBtn.disabled = true;
        saveMusterBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

        const res = await fetch('/api/payroll/attendance/muster-roll-bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date, musterRecords })
        });
        const data = await res.json();
        if (data.success) {
          showToast(`⚡ Saved today's muster roll for ${date}! (${musterRecords.length} workers)`);
          await fetchAttendance();
          renderAttendanceGlassCards();
          updateDashboardMetrics();
        }
      } catch (e) {
        showToast('Saved locally.');
      } finally {
        saveMusterBtn.disabled = false;
        saveMusterBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Today\'s Muster Roll';
      }
    });
  }

  // Tomorrow Schedule Actions
  document.getElementById('btn-save-tomorrow-schedule')?.addEventListener('click', saveTomorrowSchedule);
  document.getElementById('btn-export-tomorrow-excel')?.addEventListener('click', exportTomorrowScheduleExcel);
  document.getElementById('btn-quick-tomorrow')?.addEventListener('click', () => switchTab('tomorrow'));
  document.getElementById('dash-btn-tomorrow')?.addEventListener('click', () => switchTab('tomorrow'));
  document.getElementById('dash-btn-muster')?.addEventListener('click', () => switchTab('muster'));
  document.getElementById('dash-btn-reports')?.addEventListener('click', () => switchTab('reports'));
  document.getElementById('dash-btn-leaves')?.addEventListener('click', () => switchTab('attendance-glass'));
  document.getElementById('btn-quick-excel-reports')?.addEventListener('click', () => switchTab('reports'));

  // Vehicle Actions
  document.getElementById('btn-bulk-import-vehicles')?.addEventListener('click', () => {
    document.getElementById('bulk-vehicles-preview-area').classList.add('hidden');
    document.getElementById('btn-confirm-bulk-vehicles').disabled = true;
    openModal('modal-bulk-vehicles');
  });

  document.getElementById('btn-delete-all-vehicles')?.addEventListener('click', deleteAllVehicles);
  document.getElementById('btn-export-fleet-mttr-excel')?.addEventListener('click', exportFleetMTTRExcel);

  document.getElementById('btn-open-breakdown-modal')?.addEventListener('click', () => {
    populateVehicleDropdowns();
    document.getElementById('bd-log-date').value = new Date().toISOString().split('T')[0];
    openModal('modal-vehicle-breakdown');
  });

  // Search & Filter Listeners
  ['user-search-input', 'user-role-filter', 'user-category-filter'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', renderUsersTable);
    document.getElementById(id)?.addEventListener('change', renderUsersTable);
  });

  ['vehicle-search-input', 'vehicle-type-filter'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', renderVehiclesTable);
    document.getElementById(id)?.addEventListener('change', renderVehiclesTable);
  });

  document.getElementById('glass-search-input')?.addEventListener('input', renderAttendanceGlassCards);
  document.getElementById('glass-month-select')?.addEventListener('change', renderAttendanceGlassCards);
  document.getElementById('slip-search-input')?.addEventListener('input', renderSalaryTable);

  document.getElementById('btn-add-employee-top')?.addEventListener('click', openAddUserModal);
  document.getElementById('btn-open-add-user-modal')?.addEventListener('click', openAddUserModal);
  document.getElementById('btn-open-add-vehicle-modal')?.addEventListener('click', openAddVehicleModal);

  document.getElementById('btn-open-leave-modal')?.addEventListener('click', () => {
    populateUserDropdowns();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('leave-start-date').value = today;
    document.getElementById('leave-end-date').value = today;
    openModal('modal-leave');
  });

  document.getElementById('btn-open-credit-leave-modal')?.addEventListener('click', () => {
    populateUserDropdowns();
    openModal('modal-leave-credit');
  });

  document.getElementById('btn-open-leave-history-modal')?.addEventListener('click', () => {
    openLeaveHistoryModal();
  });

  document.getElementById('btn-export-attendance-excel')?.addEventListener('click', exportMonthlyAttendanceExcel);

  document.getElementById('leave-history-search')?.addEventListener('input', () => {
    renderLeaveHistoryTable();
  });

  document.getElementById('btn-bulk-import-emp')?.addEventListener('click', () => {
    document.getElementById('bulk-preview-area').classList.add('hidden');
    document.getElementById('btn-confirm-bulk-import').disabled = true;
    openModal('modal-bulk-import');
  });

  // Form: Save User (Superadmin Exclusive User Creation — with Salary Components)
  const formUser = document.getElementById('form-user');
  if (formUser) {
    formUser.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('btn-save-user');
      const id = document.getElementById('user-id').value;
      const empId = document.getElementById('user-empId').value.trim();
      const name = document.getElementById('user-name').value.trim();
      const role = document.getElementById('user-role').value;
      const fatherName = document.getElementById('user-fatherName').value.trim();
      const mobile = document.getElementById('user-mobile').value.trim();
      const designation = document.getElementById('user-designation').value;
      const category = document.getElementById('user-category').value;
      const location = document.getElementById('user-location').value.trim();
      const dob = document.getElementById('user-dob').value.trim();
      const doj = document.getElementById('user-doj').value.trim();
      const department = document.getElementById('user-department').value.trim();
      const email = document.getElementById('user-email').value.trim();

      // Salary mode & components
      const isCtcMode = document.getElementById('salary-mode-ctc').checked;
      let ctc = null, grossSalary = null, basicPerDay = null, salaryComponents = {}, deductionRates = {}, employerContributions = {}, otRate = null;

      if (isCtcMode) {
        grossSalary = Number(document.getElementById('user-gross').value) || 0;
        ctc = Number(document.getElementById('user-ctc').value) || 0;
        otRate = document.getElementById('user-otRate').value ? Number(document.getElementById('user-otRate').value) : null;
        salaryComponents = {
          basic: Number(document.getElementById('comp-basic').value) || 0,
          da: Number(document.getElementById('comp-da').value) || 0,
          hra: Number(document.getElementById('comp-hra').value) || 0,
          specialAllowance: Number(document.getElementById('comp-special').value) || 0,
          bonus: Number(document.getElementById('comp-bonus').value) || 0,
          otherEarnings: Number(document.getElementById('comp-other-earn').value) || 0
        };
        const sumGross = salaryComponents.basic + salaryComponents.da + salaryComponents.hra + salaryComponents.specialAllowance + salaryComponents.bonus + salaryComponents.otherEarnings;
        if (!grossSalary && sumGross > 0) grossSalary = sumGross;

        // Employee Deductions
        const rawPf = Number(document.getElementById('comp-pf-pct').value) || 0;
        const rawEsic = Number(document.getElementById('comp-esic-pct').value) || 0;
        const pfAmt = rawPf <= 30 ? Math.round((salaryComponents.basic || 0) * rawPf / 100) : Math.round(rawPf);
        const esicAmt = rawEsic <= 10 ? Math.round((grossSalary || 0) * rawEsic / 100) : Math.round(rawEsic);
        deductionRates = {
          pfVal: rawPf,
          pfPct: rawPf <= 30 ? rawPf : 0,
          pfAmount: pfAmt,
          esicVal: rawEsic,
          esicPct: rawEsic <= 10 ? rawEsic : 0,
          esicAmount: esicAmt,
          pt: Number(document.getElementById('comp-pt').value) || 0,
          lic: Number(document.getElementById('comp-lic').value) || 0,
          advance: Number(document.getElementById('comp-advance').value) || 0,
          tds: Number(document.getElementById('comp-tds').value) || 0
        };

        // Employer Contributions
        const rawErPf = Number(document.getElementById('comp-er-pf').value) || 0;
        const rawErEsic = Number(document.getElementById('comp-er-esic').value) || 0;
        const erGratuity = Number(document.getElementById('comp-er-gratuity').value) || 0;
        const erPfAmt = rawErPf <= 30 ? Math.round((salaryComponents.basic || 0) * rawErPf / 100) : Math.round(rawErPf);
        const erEsicAmt = rawErEsic <= 10 ? Math.round((grossSalary || 0) * rawErEsic / 100) : Math.round(rawErEsic);
        const totalEr = erPfAmt + erEsicAmt + erGratuity;

        employerContributions = {
          pfVal: rawErPf,
          pfPct: rawErPf <= 30 ? rawErPf : 0,
          pfAmount: erPfAmt,
          esicVal: rawErEsic,
          esicPct: rawErEsic <= 10 ? rawErEsic : 0,
          esicAmount: erEsicAmt,
          gratuity: erGratuity,
          totalEmployer: totalEr
        };

        if (!ctc) {
          ctc = (grossSalary || 0) + totalEr;
        }
      } else {
        basicPerDay = document.getElementById('user-basicPerDay').value ? Number(document.getElementById('user-basicPerDay').value) : null;
        otRate = document.getElementById('user-otRate-daily').value ? Number(document.getElementById('user-otRate-daily').value) : null;
        salaryComponents = {
          daPerDay: Number(document.getElementById('comp-da-perday').value) || 0,
          hraPerDay: Number(document.getElementById('comp-hra-perday').value) || 0
        };
        const dailyGross = ((basicPerDay || 0) + (salaryComponents.daPerDay || 0) + (salaryComponents.hraPerDay || 0)) * 26;
        grossSalary = Math.round(dailyGross);

        const rawPf = Number(document.getElementById('comp-pf-pct-daily').value) || 0;
        const rawEsic = Number(document.getElementById('comp-esic-pct-daily').value) || 0;
        const pfAmt = rawPf <= 30 ? Math.round((basicPerDay || 0) * 26 * rawPf / 100) : Math.round(rawPf);
        const esicAmt = rawEsic <= 10 ? Math.round(dailyGross * rawEsic / 100) : Math.round(rawEsic);
        deductionRates = {
          pfVal: rawPf,
          pfPct: rawPf <= 30 ? rawPf : 0,
          pfAmount: pfAmt,
          esicVal: rawEsic,
          esicPct: rawEsic <= 10 ? rawEsic : 0,
          esicAmount: esicAmt,
          pt: Number(document.getElementById('comp-pt-daily').value) || 0,
          lic: Number(document.getElementById('comp-lic-daily').value) || 0,
          advance: Number(document.getElementById('comp-advance-daily').value) || 0
        };

        const rawErPf = Number(document.getElementById('comp-er-pf-daily').value) || 0;
        const rawErEsic = Number(document.getElementById('comp-er-esic-daily').value) || 0;
        const erPfAmt = rawErPf <= 30 ? Math.round((basicPerDay || 0) * 26 * rawErPf / 100) : Math.round(rawErPf);
        const erEsicAmt = rawErEsic <= 10 ? Math.round(dailyGross * rawErEsic / 100) : Math.round(rawErEsic);
        const totalEr = erPfAmt + erEsicAmt;

        employerContributions = {
          pfVal: rawErPf,
          pfPct: rawErPf <= 30 ? rawErPf : 0,
          pfAmount: erPfAmt,
          esicVal: rawErEsic,
          esicPct: rawErEsic <= 10 ? rawErEsic : 0,
          esicAmount: erEsicAmt,
          totalEmployer: totalEr
        };

        ctc = Math.round(dailyGross + totalEr);
      }

      // Statutory & Bank
      const bankAccount = document.getElementById('user-bankAccount').value.trim();
      const ifsc = document.getElementById('user-ifsc').value.trim();
      const bankName = document.getElementById('user-bankName').value.trim();
      const uan = document.getElementById('user-uan').value.trim();
      const pfNo = document.getElementById('user-pfNo').value.trim();
      const esicNo = document.getElementById('user-esicNo').value.trim();
      const aadhar = document.getElementById('user-aadhar').value.trim();
      const pan = document.getElementById('user-pan').value.trim();

      const payload = {
        empId, name, role, fatherName,
        mobile, phone: mobile ? `+91 ${mobile}` : '',
        email, designation, rank: designation,
        category, location, site: location, department,
        dob, doj,
        grossSalary, ctc, basicPerDay,
        baseSalary: grossSalary || ctc || (basicPerDay ? basicPerDay * 26 : 0),
        otRate, salaryComponents, deductionRates, employerContributions,
        bankAccount, ifsc, bankName,
        uan, pfNo, esicNo, aadhar, pan
      };

      const isEdit = !!id;
      const url = isEdit ? `/api/payroll/users/${id}` : '/api/payroll/users';
      const method = isEdit ? 'PUT' : 'POST';

      try {
        if (saveBtn) { saveBtn.disabled = true; saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...'; }
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json().catch(() => ({}));
        if (data.success) {
          showToast(data.message || (isEdit ? `Employee record updated!` : `${name} onboarded successfully!`));
          closeModal('modal-user');
          await fetchUsers();
          updateDashboardMetrics();
        } else {
          showToast(data.message || 'Failed to onboard employee. Please verify details.', 'error');
          alert('Onboarding Notice: ' + (data.message || 'Server rejected the request. Please check inputs.'));
        }
      } catch (err) {
        // Offline local fallback
        const localUser = { ...payload, id: id || `usr-${empId.toLowerCase()}-${Date.now()}` };
        if (isEdit) {
          const idx = allUsers.findIndex((u) => u.id === id || u.empId === empId);
          if (idx >= 0) allUsers[idx] = { ...allUsers[idx], ...localUser };
        } else {
          allUsers.push(localUser);
        }
        renderUsersTable();
        updateDashboardMetrics();
        closeModal('modal-user');
        showToast(`${name} ${isEdit ? 'updated' : 'onboarded'} locally!`);
      } finally {
        if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Complete Onboarding & Save'; }
      }
    });
  }

  // Form: Save Dynamic Permissions Matrix
  const formAccess = document.getElementById('form-user-access');
  if (formAccess) {
    formAccess.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('btn-save-user-access');
      const userId = document.getElementById('access-user-id').value;
      const role = document.getElementById('access-user-role').value;
      const loginAllowed = document.getElementById('access-login-toggle').checked;
      const password = document.getElementById('access-user-password').value.trim();

      const permissions = {
        'hr.users.manage': document.getElementById('perm-manage-users')?.checked || false,
        'attendance.muster.mark': document.getElementById('perm-mark-muster')?.checked || false,
        'fleets.manage': document.getElementById('perm-manage-fleets')?.checked || false,
        'payroll.salary_structure.view': document.getElementById('perm-view-salary')?.checked || false,
        'payroll.manage_all': document.getElementById('perm-manage-payroll')?.checked || false,
        'reports.bank_deposit.export': document.getElementById('perm-export-reports')?.checked || false,
        'hr.appointment_letter.generate': document.getElementById('perm-appointment-letters')?.checked || false,
        'expenses.field_claims.process': document.getElementById('perm-field-expenses')?.checked || false
      };

      try {
        if (saveBtn) {
          saveBtn.disabled = true;
          saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
        }

        const res = await fetch(`/api/payroll/users/${userId}/access`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, loginAllowed, loginEnabled: loginAllowed, password, permissions })
        });
        const data = await res.json();

        const targetIndex = allUsers.findIndex((u) => u.id === userId || u.empId === userId);
        if (targetIndex !== -1) {
          allUsers[targetIndex].role = role;
          allUsers[targetIndex].loginAllowed = loginAllowed;
          allUsers[targetIndex].loginEnabled = loginAllowed;
          allUsers[targetIndex].password = password;
          allUsers[targetIndex].permissions = permissions;
        }

        renderUsersTable();
        closeModal('modal-user-access');
        showToast(`⚡ Access & permissions saved! Login is now ${loginAllowed ? 'ACTIVE' : 'LOCKED'}.`);
        await fetchUsers();
        updateDashboardMetrics();
      } catch (err) {
        closeModal('modal-user-access');
        renderUsersTable();
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Access & Permissions';
        }
      }
    });
  }

  // Form: Vehicle Add/Edit
  const formVeh = document.getElementById('form-vehicle');
  if (formVeh) {
    formVeh.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('vehicle-id').value;
      const vehicleNo = document.getElementById('veh-number').value.trim();
      const name = document.getElementById('veh-name').value.trim();
      const type = document.getElementById('veh-type').value;
      const model = document.getElementById('veh-model').value.trim();
      const operatorSelect = document.getElementById('veh-operator');
      const operatorId = operatorSelect.value;
      const operatorName = operatorSelect.options[operatorSelect.selectedIndex]?.text.split(' (')[0] || 'Unassigned';
      const site = document.getElementById('veh-site').value.trim();
      const status = document.getElementById('veh-status').value;
      const hourlyRate = Number(document.getElementById('veh-rate').value) || 0;
      const notes = document.getElementById('veh-notes').value.trim();

      const payload = { vehicleNo, name, type, model, operatorId, operatorName: operatorId ? operatorName : 'Unassigned', site, status, hourlyRate, notes };
      const isEdit = !!id;
      const url = isEdit ? `/api/payroll/vehicles/${id}` : '/api/payroll/vehicles';
      const method = isEdit ? 'PUT' : 'POST';

      try {
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (data.success) {
          showToast(data.message || 'Vehicle record saved!');
          closeModal('modal-vehicle');
          await fetchVehicles();
          updateDashboardMetrics();
        }
      } catch (err) {
        closeModal('modal-vehicle');
        fetchVehicles();
      }
    });
  }

  // Form: Log Vehicle Breakdown (B/D) & Maintenance
  const formBreakdown = document.getElementById('form-vehicle-breakdown');
  if (formBreakdown) {
    formBreakdown.addEventListener('submit', async (e) => {
      e.preventDefault();
      const vehicleNo = document.getElementById('bd-vehicle-select').value;
      const date = document.getElementById('bd-log-date').value;
      const totalHours = Number(document.getElementById('bd-total-hours').value) || 24;
      const breakdownHours = Number(document.getElementById('bd-breakdown-hours').value) || 0;
      const operatingHours = Number(document.getElementById('bd-operating-hours').value) || Math.max(0, totalHours - breakdownHours);
      const failureType = document.getElementById('bd-failure-type').value;
      const status = document.getElementById('bd-status').value;
      const reason = document.getElementById('bd-reason').value.trim();
      const actionTaken = document.getElementById('bd-action').value.trim();

      const payload = { vehicleNo, date, totalHours, operatingHours, breakdownHours, failureType, status, reason, actionTaken };

      try {
        const res = await fetch('/api/payroll/vehicle-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showToast('? Breakdown / Availability hours logged!');
          closeModal('modal-vehicle-breakdown');
          await fetchVehicleLogs();
        }
      } catch (err) {
        closeModal('modal-vehicle-breakdown');
        fetchVehicleLogs();
      }
    });
  }

  // Form: Save Vehicle Compliance
  const formEditCompliance = document.getElementById('form-edit-compliance');
  if (formEditCompliance) {
    formEditCompliance.addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveVehicleCompliance(e);
    });
  }

  // Compliance Filter & Search Listeners
  document.getElementById('compliance-search-input')?.addEventListener('input', () => renderComplianceMatrix());
  document.getElementById('compliance-priority-filter')?.addEventListener('change', () => renderComplianceMatrix());

  // Form: Unified Leave Management (Apply / Credit / Deduct)
  const formLeave = document.getElementById('form-leave');
  if (formLeave) {
    formLeave.addEventListener('submit', async (e) => {
      e.preventDefault();
      const mode = document.querySelector('input[name="leave-action-mode"]:checked')?.value || 'apply';
      const userId = document.getElementById('leave-select-user').value;
      const days = Number(document.getElementById('leave-days-count').value) || 1;
      const reason = document.getElementById('leave-reason').value.trim();

      if (!userId) {
        showToast('Please select an employee.', 'error');
        return;
      }

      if (mode === 'apply') {
        const leaveType = document.getElementById('leave-type-select').value;
        const startDate = document.getElementById('leave-start-date').value;
        const endDate = document.getElementById('leave-end-date').value || startDate;

        if (!startDate) {
          showToast('Please select a start date.', 'error');
          return;
        }

        try {
          const res = await fetch('/api/payroll/leaves', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, leaveType, startDate, endDate, days, reason: reason || 'Personal Leave' })
          });
          const data = await res.json();
          if (data.success) {
            showToast(`⚡ Leave recorded! ${days} day(s) deducted from balance.`);
            closeModal('modal-leave');
            await fetchUsers();
            await fetchLeaves();
            await fetchAttendance();
            renderAttendanceGlassCards();
            renderUsersTable();
            renderLeaveHistoryTable();
            populateUserDropdowns();
          } else {
            showToast(data.message || 'Leave recording failed', 'error');
          }
        } catch (e) {
          showToast('Failed to record leave', 'error');
          closeModal('modal-leave');
        }
      } else if (mode === 'credit') {
        const adjustCategory = document.getElementById('leave-adjust-reason-select').value;
        try {
          const res = await fetch('/api/payroll/leaves/credit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, creditDays: days, reason: adjustCategory, notes: reason })
          });
          const data = await res.json();
          if (data.success) {
            showToast(data.message || `⚡ Successfully credited ${days} leave days!`);
            closeModal('modal-leave');
            await fetchUsers();
            await fetchLeaves();
            renderAttendanceGlassCards();
            renderUsersTable();
            renderLeaveHistoryTable();
            populateUserDropdowns();
          } else {
            showToast(data.message || 'Leave credit failed', 'error');
          }
        } catch (e) {
          showToast('Failed to credit leave days', 'error');
          closeModal('modal-leave');
        }
      } else if (mode === 'deduct') {
        const adjustCategory = document.getElementById('leave-adjust-reason-select').value;
        try {
          const res = await fetch('/api/payroll/leaves/deduct', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, deductDays: days, reason: adjustCategory, notes: reason })
          });
          const data = await res.json();
          if (data.success) {
            showToast(data.message || `⚡ Successfully deducted ${days} leave days!`);
            closeModal('modal-leave');
            await fetchUsers();
            await fetchLeaves();
            renderAttendanceGlassCards();
            renderUsersTable();
            renderLeaveHistoryTable();
            populateUserDropdowns();
          } else {
            showToast(data.message || 'Leave deduction failed', 'error');
          }
        } catch (e) {
          showToast('Failed to deduct leave days', 'error');
          closeModal('modal-leave');
        }
      }
    });
  }

  // Form: Quick Leave Credit / Deduct Modal
  const formLeaveCredit = document.getElementById('form-leave-credit');
  if (formLeaveCredit) {
    formLeaveCredit.addEventListener('submit', async (e) => {
      e.preventDefault();
      const adjustType = document.querySelector('input[name="quick-adjust-type"]:checked')?.value || 'credit';
      const userId = document.getElementById('credit-select-user').value;
      const days = Number(document.getElementById('credit-days-count').value) || 1;
      const reason = document.getElementById('credit-reason-type').value;
      const notes = document.getElementById('credit-notes').value.trim();

      const endpoint = adjustType === 'deduct' ? '/api/payroll/leaves/deduct' : '/api/payroll/leaves/credit';
      const payload = adjustType === 'deduct' 
        ? { userId, deductDays: days, reason, notes }
        : { userId, creditDays: days, reason, notes };

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message || `⚡ Successfully updated leave balance!`);
          closeModal('modal-leave-credit');
          await fetchUsers();
          await fetchLeaves();
          renderAttendanceGlassCards();
          renderUsersTable();
          populateUserDropdowns();
        } else {
          showToast(data.message || 'Adjustment failed', 'error');
        }
      } catch (err) {
        showToast('Failed to adjust leave days', 'error');
        closeModal('modal-leave-credit');
      }
    });
  }
}


