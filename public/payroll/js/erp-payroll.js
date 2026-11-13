/**
 * Shree RR Trading Company - Enterprise Operations, Fleet & Payroll Portal
 * Module: erp-payroll.js
 * Dedicated Payroll: Salary Structure Calculator, Bulk Generation, Payslips & WhatsApp Dispatch
 * (c) 2026 Shree RR Trading Company
 */

window.ERP = window.ERP || {};

// Active slip pointer for modal actions & WhatsApp dispatch
window.currentActiveSlip = null;

ERP.payroll = {
  // ==================== 1. STATUTORY SALARY CALCULATION ENGINE ====================
  calculateSalaryComponents(baseSalary, otHours = 0, lopDays = 0, totalMonthDays = 31) {
    const ctc = Math.max(0, Number(baseSalary) || 0);

    // Standard Indian Statutory Breakdown (acc cord compliant)
    // Basic Pay: 50% of CTC
    const basic = Math.round(ctc * 0.50);
    // Dearness Allowance (DA): 20% of CTC
    const da = Math.round(ctc * 0.20);
    // House Rent Allowance (HRA): 15% of CTC
    const hra = Math.round(ctc * 0.15);
    // Special Allowance: Balance CTC
    const specialAllowance = Math.max(0, ctc - (basic + da + hra));

    // Overtime (OT) Hourly Rate: ((Basic + DA) / (26 working days * 8 hours)) * 1.5 multiplier
    const hourlyRate = ((basic + da) / (26 * 8)) * 1.5;
    const otWage = Math.round(Math.max(0, Number(otHours) || 0) * hourlyRate);

    // Gross Earnings
    const grossPay = basic + da + hra + specialAllowance + otWage;

    // Loss of Pay (LOP) Deduction for unpaid leaves
    const perDayRate = totalMonthDays > 0 ? (grossPay / totalMonthDays) : 0;
    const lopDeduction = Math.round(Math.max(0, Number(lopDays) || 0) * perDayRate);

    // Statutory Deductions:
    // 1. Employee Provident Fund (PF): 12% of (Basic + DA), capped at statutory wage limit ₹1,800/mo (EPFO)
    const pfWage = basic + da;
    const pf = Math.round(Math.min(pfWage, 15000) * 0.12);

    // 2. Employee State Insurance (ESIC): 0.75% of Gross Pay (applicable if Gross <= ₹21,000)
    const esic = grossPay <= 21000 ? Math.round(grossPay * 0.0075) : 0;

    // 3. Professional Tax (PT): ₹200/month (standard slab)
    const pt = grossPay >= 10000 ? 200 : 0;

    // Total Deductions
    const totalDeductions = pf + esic + pt + lopDeduction;

    // Net Salary Payable
    const netPay = Math.max(0, grossPay - totalDeductions);

    return {
      earnings: {
        basic,
        da,
        hra,
        specialAllowance,
        otWage,
        bonus: 0
      },
      deductions: {
        pf,
        esic,
        pt,
        lopDeduction,
        tds: 0,
        other: 0
      },
      grossPay,
      totalDeductions,
      netPay,
      hourlyOtRate: Math.round(hourlyRate * 100) / 100
    };
  },

  // ==================== 2. SALARY SLIPS REGISTER TABLE ====================
  renderTable() {
    const tbody = document.getElementById('salary-table-body');
    if (!tbody) return;

    const allSlips = ERP.state.data.salarySlips || [];
    const search = (document.getElementById('slip-search-input')?.value || '').toLowerCase().trim();
    const selectedMonth = document.getElementById('payroll-month-select')?.value || ERP.state.selectedMonth || 'October 2026';
    ERP.state.selectedMonth = selectedMonth;

    // Ensure slips exist for selected month
    this.ensureMonthSlips(selectedMonth);

    const filtered = (ERP.state.data.salarySlips || []).filter(s => {
      if (s.monthYear !== selectedMonth) return false;
      if (!search) return true;
      return (
        (s.userName && s.userName.toLowerCase().includes(search)) ||
        (s.empId && s.empId.toLowerCase().includes(search)) ||
        (s.designation && s.designation.toLowerCase().includes(search)) ||
        (s.bankAccount && s.bankAccount.toLowerCase().includes(search)) ||
        (s.department && s.department.toLowerCase().includes(search))
      );
    });

    const countEl = document.getElementById('salary-slips-count-badge');
    if (countEl) countEl.textContent = `${filtered.length} Slips`;

    // Calculate month totals
    let totalGross = 0;
    let totalNet = 0;
    let totalDeductions = 0;
    filtered.forEach(s => {
      totalGross += Number(s.grossPay) || 0;
      totalNet += Number(s.netPay) || 0;
      totalDeductions += Number(s.totalDeductions) || 0;
    });

    ERP.utils.setElemText('kpi-payroll-total-net', '₹' + Math.round(totalNet).toLocaleString('en-IN'));
    ERP.utils.setElemText('kpi-payroll-month-label', selectedMonth);

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center" style="padding: 30px; color: var(--text-dim);">
            <i class="fa-solid fa-file-invoice-dollar fa-2x" style="margin-bottom: 10px; display: block; opacity: 0.4;"></i>
            No salary slips found for <strong>${ERP.utils.escapeHtml(selectedMonth)}</strong>.
            <div style="margin-top: 10px;">
              <button class="btn btn-primary btn-sm" onclick="ERP.payroll.bulkGenerateSlips()">
                <i class="fa-solid fa-bolt"></i> Generate All Slips for ${ERP.utils.escapeHtml(selectedMonth)}
              </button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    filtered.forEach((s, idx) => {
      const earn = s.earnings || {};
      const ded = s.deductions || {};
      const isManual = s.isManuallyCorrected || s.manualLocked;

      rowsHtml += `
        <tr>
          <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
          <td>
            <div style="font-family: var(--font-mono); font-weight: 800; color: var(--logo-navy); font-size: 13px;">
              ${ERP.utils.escapeHtml(s.empId)}
            </div>
            <div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">
              ${ERP.utils.escapeHtml(s.monthYear)}
            </div>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--text-dark);">${ERP.utils.escapeHtml(s.userName)}</div>
            <div style="font-size: 11px; color: var(--text-muted);">${ERP.utils.escapeHtml(s.designation || 'Staff')} • ${ERP.utils.escapeHtml(s.department || 'Operations')}</div>
          </td>
          <td style="text-align: center; font-weight: 600;">
            ${s.workedDays || s.totalDays || 31} / ${s.totalDays || 31}
          </td>
          <td style="text-align: right; font-weight: 600;">
            ₹${Math.round(s.grossPay || 0).toLocaleString('en-IN')}
          </td>
          <td style="text-align: right; color: #DC2626; font-weight: 600;">
            -₹${Math.round(s.totalDeductions || 0).toLocaleString('en-IN')}
          </td>
          <td style="text-align: right; font-weight: 800; color: #059669; font-size: 13.5px;">
            ₹${Math.round(s.netPay || 0).toLocaleString('en-IN')}
          </td>
          <td style="text-align: center;">
            <span class="status-pill ${isManual ? 'status-warning' : 'status-active'}">
              ${isManual ? '<i class="fa-solid fa-lock"></i> Custom' : '<i class="fa-solid fa-check"></i> Standard'}
            </span>
          </td>
          <td style="text-align: center;">
            <div style="display: flex; gap: 4px; justify-content: center;">
              <button class="btn btn-outline-primary btn-xs" onclick="ERP.payroll.openSalarySlipModal('${s.id || s.empId}')" title="View Payslip">
                <i class="fa-solid fa-eye"></i> View
              </button>
              <button class="btn btn-outline-success btn-xs" onclick="ERP.payroll.dispatchWhatsAppSingle('${s.id || s.empId}')" title="Send WhatsApp Slip">
                <i class="fa-brands fa-whatsapp"></i> WhatsApp
              </button>
              <button class="btn-icon-only text-navy" onclick="ERP.payroll.openCorrectionModal('${s.id || s.empId}')" title="Edit Salary Structure">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn-icon-only btn-danger" onclick="ERP.payroll.deleteSalarySlip('${s.id || s.empId}')" title="Delete Slip">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = rowsHtml;
  },

  // ==================== 3. AUTO-ENSURE & GENERATE SLIPS ====================
  ensureMonthSlips(mYear) {
    const allUsers = ERP.state.data.users || [];
    if (!allUsers || allUsers.length === 0) return;

    let slips = ERP.state.data.salarySlips || [];
    const existingKeys = new Set(slips.filter(s => s.monthYear === mYear).map(s => s.empId || s.userId));

    const missingUsers = allUsers.filter(u => u.role !== 'Super Admin' && u.status !== 'Inactive' && !existingKeys.has(u.empId) && !existingKeys.has(u.id));

    if (missingUsers.length > 0) {
      const generated = ERP.payroll.generateClientSalarySlips(mYear, missingUsers);
      ERP.state.data.salarySlips = [...slips, ...generated];
      window.allSalarySlips = ERP.state.data.salarySlips;
    }
  },

  generateClientSalarySlips(mYear = 'October 2026', userSubset = null) {
    const users = Array.isArray(userSubset) ? userSubset : (ERP.state.data.users || []);
    const activeStaff = users.filter(u => u.role !== 'Super Admin' && u.status !== 'Inactive');

    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    let defaultDim = 31;
    if (mYear) {
      const parts = mYear.split(' ');
      const mIdx = monthNames.indexOf(parts[0].toLowerCase());
      const yr = parseInt(parts[1]) || 2026;
      if (mIdx !== -1) {
        defaultDim = new Date(yr, mIdx + 1, 0).getDate();
      }
    }

    return activeStaff.map(u => {
      const baseSalary = Number(u.baseSalary) || Number(u.ctc) || 25000;
      const comp = ERP.payroll.calculateSalaryComponents(baseSalary, 0, 0, defaultDim);

      return {
        id: `slip-${u.empId}-${mYear.replace(/ /g, '_')}`,
        empId: u.empId,
        userId: u.id,
        userName: u.name,
        fatherName: u.fatherName || '',
        designation: u.designation || 'Staff',
        department: u.department || 'Operations',
        location: u.location || u.site || 'ACC Chanda Plant Site',
        monthYear: mYear,
        totalDays: defaultDim,
        workedDays: defaultDim,
        publicHolidays: 0,
        earnings: comp.earnings,
        deductions: comp.deductions,
        grossPay: comp.grossPay,
        totalDeductions: comp.totalDeductions,
        netPay: comp.netPay,
        uan: u.uan || '',
        pfNo: u.pfNo || '',
        esicNo: u.esicNo || '',
        bankAccount: u.bankAccount || '',
        ifsc: u.ifsc || '',
        bankName: u.bankName || 'State Bank of India',
        mobile: u.mobile || u.phone || ''
      };
    });
  },

  async bulkGenerateSlips() {
    const selMonth = document.getElementById('payroll-month-select')?.value || ERP.state.selectedMonth || 'October 2026';
    if (!confirm(`Generate official salary slips for all active employees for ${selMonth}?`)) return;

    try {
      ERP.toast(`⚡ Generating slips for ${selMonth}...`, 'info');
      const res = await ERP.api.post('/api/payroll/salary-slips/bulk-generate', {
        monthYear: selMonth
      });

      if (res && res.success) {
        ERP.toast(`⚡ Generated ${res.generatedCount || 'all'} salary slips for ${selMonth}!`, 'success');
        await ERP.loadAllData();
      } else {
        throw new Error((res && res.message) || 'Failed to bulk generate slips');
      }
    } catch (err) {
      // Local fallback generation
      ERP.payroll.ensureMonthSlips(selMonth);
      ERP.payroll.renderTable();
      ERP.toast(`Generated slips for ${selMonth} locally.`, 'success');
    }
  },

  // ==================== 4. OFFICIAL PAYSLIP MODAL ====================
  openSalarySlipModal(id) {
    const s = (ERP.state.data.salarySlips || []).find(sl => sl.id === id || sl.empId === id);
    if (!s) return;

    window.currentActiveSlip = s;
    const container = document.getElementById('print-salary-slip-container');
    if (!container) return;

    const earn = s.earnings || {};
    const ded = s.deductions || {};
    const netWords = ERP.utils.numberToWords(s.netPay || 0);

    container.innerHTML = `
      <div class="official-salary-slip" id="printable-salary-slip-document">
        <!-- Official Company Header -->
        <div class="slip-header">
          <div class="slip-company-name">SHREE RR TRADING COMPANY</div>
          <div class="slip-company-sub">Authorized Industrial Plant Operations, Heavy Fleet O&M & Mining Contractor</div>
          <div class="slip-company-addr">Registered Office: ACC Cement Works, Ghugus Road, Chandrapur (M.H.) 442502 • GSTIN: 27AABCS1234F1Z8</div>
          <div class="slip-badge-title">PAYSLIP FOR THE MONTH OF ${ERP.utils.escapeHtml(s.monthYear).toUpperCase()}</div>
        </div>

        <!-- Employee Info Metadata Grid -->
        <div class="slip-meta-grid">
          <div><span class="meta-label">Employee ID:</span> <span class="meta-val" style="font-family: var(--font-mono); font-weight: 800;">${ERP.utils.escapeHtml(s.empId)}</span></div>
          <div><span class="meta-label">Employee Name:</span> <span class="meta-val">${ERP.utils.escapeHtml(s.userName)}</span></div>
          <div><span class="meta-label">Father's Name:</span> <span class="meta-val">${ERP.utils.escapeHtml(s.fatherName || '-')}</span></div>
          <div><span class="meta-label">Designation:</span> <span class="meta-val">${ERP.utils.escapeHtml(s.designation || 'Staff')}</span></div>
          <div><span class="meta-label">Department:</span> <span class="meta-val">${ERP.utils.escapeHtml(s.department || 'Plant Operations')}</span></div>
          <div><span class="meta-label">Site Location:</span> <span class="meta-val">${ERP.utils.escapeHtml(s.location || 'ACC Chanda Site')}</span></div>
          <div><span class="meta-label">Total Month Days:</span> <span class="meta-val">${s.totalDays || 31}</span></div>
          <div><span class="meta-label">Days Payable:</span> <span class="meta-val" style="font-weight: 800; color: #059669;">${s.workedDays || s.totalDays || 31}</span></div>
          <div><span class="meta-label">UAN:</span> <span class="meta-val" style="font-family: var(--font-mono);">${ERP.utils.escapeHtml(s.uan || 'N/A')}</span></div>
          <div><span class="meta-label">PF Number:</span> <span class="meta-val" style="font-family: var(--font-mono);">${ERP.utils.escapeHtml(s.pfNo || 'N/A')}</span></div>
          <div><span class="meta-label">Bank Account:</span> <span class="meta-val" style="font-family: var(--font-mono);">${ERP.utils.escapeHtml(s.bankAccount || 'N/A')}</span></div>
          <div><span class="meta-label">Bank IFSC:</span> <span class="meta-val" style="font-family: var(--font-mono);">${ERP.utils.escapeHtml(s.ifsc || 'N/A')}</span></div>
        </div>

        <!-- Earnings & Deductions Two-Column Grid -->
        <div class="slip-breakdown-container">
          <!-- Earnings Column -->
          <div class="slip-breakdown-col">
            <div class="slip-col-header" style="background: #F0FDF4; color: #166534; border-bottom: 2px solid #16A34A;">
              <span>EARNINGS COMPONENT</span>
              <span style="text-align: right;">AMOUNT (₹)</span>
            </div>
            <table class="slip-table">
              <tbody>
                <tr><td>Basic Wage Pay</td><td style="text-align: right;">₹${Math.round(earn.basic || 0).toLocaleString('en-IN')}</td></tr>
                <tr><td>Dearness Allowance (DA)</td><td style="text-align: right;">₹${Math.round(earn.da || 0).toLocaleString('en-IN')}</td></tr>
                <tr><td>House Rent Allowance (HRA)</td><td style="text-align: right;">₹${Math.round(earn.hra || 0).toLocaleString('en-IN')}</td></tr>
                <tr><td>Special / Site Allowance</td><td style="text-align: right;">₹${Math.round(earn.specialAllowance || 0).toLocaleString('en-IN')}</td></tr>
                ${(earn.otWage > 0) ? `<tr><td>Overtime Pay (OT)</td><td style="text-align: right;">₹${Math.round(earn.otWage).toLocaleString('en-IN')}</td></tr>` : ''}
                ${(earn.bonus > 0) ? `<tr><td>Incentive / Production Bonus</td><td style="text-align: right;">₹${Math.round(earn.bonus).toLocaleString('en-IN')}</td></tr>` : ''}
              </tbody>
              <tfoot>
                <tr style="font-weight: 800; background: #F8FAFC; border-top: 1.5px solid #000;">
                  <td>GROSS EARNINGS (A)</td>
                  <td style="text-align: right; color: var(--logo-navy);">₹${Math.round(s.grossPay || 0).toLocaleString('en-IN')}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Deductions Column -->
          <div class="slip-breakdown-col">
            <div class="slip-col-header" style="background: #FEF2F2; color: #991B1B; border-bottom: 2px solid #DC2626;">
              <span>STATUTORY DEDUCTIONS</span>
              <span style="text-align: right;">AMOUNT (₹)</span>
            </div>
            <table class="slip-table">
              <tbody>
                <tr><td>Employee Provident Fund (PF 12%)</td><td style="text-align: right;">₹${Math.round(ded.pf || 0).toLocaleString('en-IN')}</td></tr>
                <tr><td>ESIC (0.75% State Insurance)</td><td style="text-align: right;">₹${Math.round(ded.esic || 0).toLocaleString('en-IN')}</td></tr>
                <tr><td>Professional Tax (PT)</td><td style="text-align: right;">₹${Math.round(ded.pt || 0).toLocaleString('en-IN')}</td></tr>
                ${(ded.lopDeduction > 0) ? `<tr><td>Loss of Pay (LOP)</td><td style="text-align: right;">₹${Math.round(ded.lopDeduction).toLocaleString('en-IN')}</td></tr>` : ''}
                ${(ded.tds > 0) ? `<tr><td>TDS / Income Tax</td><td style="text-align: right;">₹${Math.round(ded.tds).toLocaleString('en-IN')}</td></tr>` : ''}
                ${(ded.other > 0) ? `<tr><td>Salary Advance / Loan Recovery</td><td style="text-align: right;">₹${Math.round(ded.other).toLocaleString('en-IN')}</td></tr>` : ''}
              </tbody>
              <tfoot>
                <tr style="font-weight: 800; background: #F8FAFC; border-top: 1.5px solid #000;">
                  <td>TOTAL DEDUCTIONS (B)</td>
                  <td style="text-align: right; color: #DC2626;">₹${Math.round(s.totalDeductions || 0).toLocaleString('en-IN')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Net Payable Bar -->
        <div class="slip-net-payable-bar">
          <div style="font-size: 13px; font-weight: 700;">NET PAYABLE WAGE SALARY (A - B):</div>
          <div style="font-size: 20px; font-weight: 900; color: #059669; font-family: var(--font-mono);">
            ₹${Math.round(s.netPay || 0).toLocaleString('en-IN')}
          </div>
        </div>

        <!-- Net in Words -->
        <div class="slip-net-words">
          <strong>Amount in Words:</strong> ${netWords}
        </div>

        <!-- Signatures & Official Stamp -->
        <div class="slip-signatures-container">
          <div class="slip-sig-box">
            <div style="border-bottom: 1px dashed #64748B; height: 35px;"></div>
            <div style="margin-top: 4px; font-weight: 700;">Employee Signature</div>
            <div style="font-size: 10px; color: var(--text-dim);">Signature / Thumb Impression</div>
          </div>
          <div class="slip-sig-box">
            <div style="border-bottom: 1px dashed #64748B; height: 35px;"></div>
            <div style="margin-top: 4px; font-weight: 700;">Accounts & HR Manager</div>
            <div style="font-size: 10px; color: var(--text-dim);">Checked & Prepared By</div>
          </div>
          <div class="slip-sig-box">
            <div style="border-bottom: 1px dashed #64748B; height: 35px;"></div>
            <div style="margin-top: 4px; font-weight: 700;">For Shree RR Trading Company</div>
            <div style="font-size: 10px; color: var(--text-dim);">Partner / Authorized Signatory</div>
          </div>
        </div>
      </div>
    `;

    ERP.modal.open('modal-salary-slip');
  },

  // ==================== 5. SALARY STRUCTURE CORRECTION MODAL ====================
  openCorrectionModal(id) {
    const s = (ERP.state.data.salarySlips || []).find(sl => sl.id === id || sl.empId === id);
    if (!s) return;

    window.currentActiveSlip = s;
    ERP.utils.setElemText('modal-correction-title', `Adjust Salary Structure: ${s.userName} (${s.empId})`);

    const earn = s.earnings || {};
    const ded = s.deductions || {};

    const setVal = (elemId, val) => {
      const el = document.getElementById(elemId);
      if (el) el.value = val !== undefined ? val : 0;
    };

    setVal('corr-basic', earn.basic || 0);
    setVal('corr-da', earn.da || 0);
    setVal('corr-hra', earn.hra || 0);
    setVal('corr-special', earn.specialAllowance || 0);
    setVal('corr-bonus', earn.bonus || 0);
    setVal('corr-ot', earn.otWage || 0);

    setVal('corr-pf', ded.pf || 0);
    setVal('corr-esic', ded.esic || 0);
    setVal('corr-pt', ded.pt || 200);
    setVal('corr-tds', ded.tds || 0);
    setVal('corr-other', ded.other || 0);

    setVal('corr-worked-days', s.workedDays || 31);
    setVal('corr-total-days', s.totalDays || 31);

    this.recalculateCorrectionTotals();

    ERP.modal.open('modal-salary-correction');
  },

  recalculateCorrectionTotals() {
    const getNum = (id) => Number(document.getElementById(id)?.value) || 0;

    const basic = getNum('corr-basic');
    const da = getNum('corr-da');
    const hra = getNum('corr-hra');
    const special = getNum('corr-special');
    const bonus = getNum('corr-bonus');
    const ot = getNum('corr-ot');
    const gross = basic + da + hra + special + bonus + ot;

    const pf = getNum('corr-pf');
    const esic = getNum('corr-esic');
    const pt = getNum('corr-pt');
    const tds = getNum('corr-tds');
    const other = getNum('corr-other');
    const totDeductions = pf + esic + pt + tds + other;
    const net = Math.max(0, gross - totDeductions);

    ERP.utils.setElemText('corr-preview-gross', '₹' + Math.round(gross).toLocaleString('en-IN'));
    ERP.utils.setElemText('corr-preview-deductions', '₹' + Math.round(totDeductions).toLocaleString('en-IN'));
    ERP.utils.setElemText('corr-preview-net', '₹' + Math.round(net).toLocaleString('en-IN'));
  },

  async handleSaveCorrection(e) {
    if (e) e.preventDefault();
    const s = window.currentActiveSlip;
    if (!s) return;

    const getNum = (id) => Number(document.getElementById(id)?.value) || 0;

    const basic = getNum('corr-basic');
    const da = getNum('corr-da');
    const hra = getNum('corr-hra');
    const special = getNum('corr-special');
    const bonus = getNum('corr-bonus');
    const ot = getNum('corr-ot');
    const gross = basic + da + hra + special + bonus + ot;

    const pf = getNum('corr-pf');
    const esic = getNum('corr-esic');
    const pt = getNum('corr-pt');
    const tds = getNum('corr-tds');
    const other = getNum('corr-other');
    const totDeductions = pf + esic + pt + tds + other;
    const net = gross - totDeductions;

    const workedDays = getNum('corr-worked-days') || 31;
    const totalDays = getNum('corr-total-days') || 31;

    const payload = {
      id: s.id,
      empId: s.empId,
      monthYear: s.monthYear,
      workedDays: workedDays,
      totalDays: totalDays,
      earnings: { basic, da, hra, specialAllowance: special, bonus, otWage: ot },
      deductions: { pf, esic, pt, tds, other },
      grossPay: gross,
      totalDeductions: totDeductions,
      netPay: net,
      isManuallyCorrected: true
    };

    try {
      const res = await ERP.api.post('/api/payroll/salary-slips/update', payload);
      if (res && res.success) {
        ERP.toast(`Salary structure updated for ${s.userName}!`, 'success');
        ERP.modal.close('modal-salary-correction');
        await ERP.loadAllData();
      } else {
        throw new Error((res && res.message) || 'Failed to update salary');
      }
    } catch (err) {
      // Local fallback
      Object.assign(s, payload);
      ERP.payroll.renderTable();
      ERP.modal.close('modal-salary-correction');
      ERP.toast('Salary structure adjusted locally.', 'success');
    }
  },

  async downloadSlipPdf() {
    const el = document.getElementById('printable-salary-slip-document');
    if (!el || typeof html2pdf === 'undefined') {
      window.print();
      return;
    }

    const s = window.currentActiveSlip;
    const filename = `Salary_Slip_${s ? s.empId : 'Employee'}_${s ? s.monthYear.replace(/ /g, '_') : 'Statement'}.pdf`;

    const opt = {
      margin: [6, 8, 6, 8],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      ERP.toast('Generating high-res PDF slip...', 'info');
      await html2pdf().set(opt).from(el).save();
      ERP.toast(`Downloaded: ${filename}`, 'success');
    } catch (e) {
      window.print();
    }
  },

  async dispatchWhatsAppSingle(id) {
    const s = (ERP.state.data.salarySlips || []).find(sl => sl.id === id || sl.empId === id);
    if (!s) return;

    this.openSalarySlipModal(id);

    const mobile = String(s.mobile || '').replace(/[^0-9]/g, '').slice(-10);
    const msg = `*SHREE RR TRADING COMPANY*\nOfficial Salary Statement - *${s.monthYear}*\n\nEmployee: *${s.userName}* (${s.empId})\nDesignation: *${s.designation || 'Staff'}*\nSite: *${s.location || 'ACC Chanda Plant'}*\n\n*Earnings Summary:*\n• Basic Salary: ₹${Math.round(s.earnings?.basic || 0).toLocaleString('en-IN')}\n• DA: ₹${Math.round(s.earnings?.da || 0).toLocaleString('en-IN')}\n• HRA: ₹${Math.round(s.earnings?.hra || 0).toLocaleString('en-IN')}\n• Special Allowance: ₹${Math.round(s.earnings?.specialAllowance || 0).toLocaleString('en-IN')}\n• Gross Wages: ₹${Math.round(s.grossPay || 0).toLocaleString('en-IN')}\n\n*Deductions:*\n• PF (12%): ₹${Math.round(s.deductions?.pf || 0).toLocaleString('en-IN')}\n• ESIC: ₹${Math.round(s.deductions?.esic || 0).toLocaleString('en-IN')}\n• PT: ₹${Math.round(s.deductions?.pt || 0).toLocaleString('en-IN')}\n• Total Deductions: ₹${Math.round(s.totalDeductions || 0).toLocaleString('en-IN')}\n\n*NET PAYABLE SALARY:* *₹${Math.round(s.netPay || 0).toLocaleString('en-IN')}*\nBank A/C: ${s.bankAccount ? '••••' + String(s.bankAccount).slice(-4) : 'Cash/Cheque'}\n\n_System generated statement by Shree RR Trading Company ERP._`;

    const waUrl = mobile
      ? `https://api.whatsapp.com/send?phone=91${mobile}&text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;

    window.open(waUrl, '_blank');
    ERP.toast(`WhatsApp statement prepared for ${s.userName}`, 'success');
  },

  async deleteSalarySlip(id) {
    if (!confirm('Are you sure you want to delete this salary slip record?')) return;
    try {
      await ERP.api.delete(`/api/payroll/salary-slips/${encodeURIComponent(id)}`);
      ERP.toast('Salary slip deleted.', 'info');
      await ERP.loadAllData();
    } catch (e) {
      ERP.state.data.salarySlips = (ERP.state.data.salarySlips || []).filter(s => s.id !== id && s.empId !== id);
      ERP.payroll.renderTable();
      ERP.toast('Salary slip removed.', 'info');
    }
  }
};

// Aliases for global compatibility
window.allSalarySlips = ERP.state.data.salarySlips;

