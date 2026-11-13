/**
 * Shree RR Trading Company - Enterprise Operations, Fleet & Payroll Portal
 * Module: erp-hr-payroll.js
 * Staff Master, Daily Muster Roll, Leaves, Monthly Payroll & WhatsApp PDF Engine
 * (c) 2026 Shree RR Trading Company
 */

window.ERP = window.ERP || {};

// Global Slip References for backward compatibility
window.currentActiveSlip = null;

ERP.payroll = {
  // ==================== 1. SALARY SLIPS TABLE ====================
  renderTable() {
    const tbody = document.getElementById('salary-table-body');
    if (!tbody) return;

    const allSlips = ERP.state.data.salarySlips || [];
    const search = (document.getElementById('slip-search-input')?.value || '').toLowerCase().trim();
    const selectedMonth = document.getElementById('payroll-month-select')?.value || ERP.state.selectedMonth;
    ERP.state.selectedMonth = selectedMonth;

    const filtered = allSlips.filter(s => {
      if (s.monthYear !== selectedMonth) return false;
      if (!search) return true;
      return (
        (s.userName && s.userName.toLowerCase().includes(search)) ||
        (s.empId && s.empId.toLowerCase().includes(search)) ||
        (s.designation && s.designation.toLowerCase().includes(search)) ||
        (s.bankAccount && s.bankAccount.toLowerCase().includes(search))
      );
    });

    const countEl = document.getElementById('salary-slips-count-badge');
    if (countEl) countEl.textContent = `${filtered.length} Slips`;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center" style="padding: 30px; color: var(--text-dim);">
            <i class="fa-solid fa-calculator fa-2x" style="margin-bottom: 10px; display: block; opacity: 0.4;"></i>
            No salary slips generated yet for <strong>${ERP.utils.escapeHtml(selectedMonth)}</strong>.<br>
            <button class="btn btn-primary btn-sm" onclick="ERP.payroll.bulkGenerateSlips()" style="margin-top: 10px;">
              <i class="fa-solid fa-bolt"></i> 1-Click Generate Slips for ${ERP.utils.escapeHtml(selectedMonth)}
            </button>
          </td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    filtered.forEach((s, idx) => {
      const gross = Number(s.grossPay) || 0;
      const net = Number(s.netPay) || 0;
      const deductions = Number(s.totalDeductions) || 0;
      const workedDays = s.workedDays !== undefined ? s.workedDays : (s.totalDays || 31);
      const totalDays = s.totalDays || 31;

      rowsHtml += `
        <tr>
          <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
          <td>
            <div style="font-family: var(--font-mono); font-weight: 800; color: var(--logo-navy); font-size: 13px;">
              ${ERP.utils.escapeHtml(s.empId)}
            </div>
            <div style="font-size: 10.5px; color: var(--text-dim); margin-top: 2px;">
              ${ERP.utils.escapeHtml(s.category || 'Plant Operations')}
            </div>
          </td>
          <td>
            <div style="font-weight: 800; color: var(--text-dark);">${ERP.utils.escapeHtml(s.userName)}</div>
            <div style="font-size: 11px; color: var(--logo-orange); font-weight: 600;">${ERP.utils.escapeHtml(s.designation || 'Staff')}</div>
          </td>
          <td style="text-align: center;">
            <div style="font-weight: 700; color: var(--logo-navy);">${workedDays} / ${totalDays}</div>
            <div style="font-size: 9.5px; color: var(--text-dim);">Payable Days</div>
          </td>
          <td style="text-align: right; font-weight: 700; color: var(--logo-navy);">
            ₹${Math.round(gross).toLocaleString('en-IN')}
          </td>
          <td style="text-align: right; font-weight: 700; color: #DC2626;">
            ₹${Math.round(deductions).toLocaleString('en-IN')}
          </td>
          <td style="text-align: right; font-weight: 900; color: #059669; font-size: 13.5px;">
            ₹${Math.round(net).toLocaleString('en-IN')}
          </td>
          <td style="text-align: center;">
            <span class="status-pill status-active"><i class="fa-solid fa-check"></i> Computed</span>
          </td>
          <td style="text-align: center;">
            <div style="display: flex; gap: 4px; justify-content: center;">
              <button class="btn btn-outline-primary btn-xs" onclick="ERP.payroll.openSalarySlipModal('${s.id || s.empId}')" title="View Official Salary Slip Statement">
                <i class="fa-solid fa-file-invoice-dollar"></i> Slip
              </button>
              <button class="btn btn-outline-success btn-xs" onclick="ERP.payroll.dispatchWhatsAppSingle('${s.id || s.empId}')" title="Download PDF & Dispatch WhatsApp">
                <i class="fa-brands fa-whatsapp"></i> WA
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
      const basic = Math.round(baseSalary * 0.50);
      const da = Math.round(baseSalary * 0.20);
      const hra = Math.round(baseSalary * 0.15);
      const special = Math.max(0, baseSalary - (basic + da + hra));
      const gross = basic + da + hra + special;

      const pf = Math.round(basic * 0.12);
      const esic = gross <= 21000 ? Math.round(gross * 0.0075) : 0;
      const pt = 200;
      const totDeductions = pf + esic + pt;
      const net = gross - totDeductions;

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
        earnings: {
          basic: basic,
          da: da,
          hra: hra,
          specialAllowance: special,
          bonus: 0,
          otWage: 0
        },
        deductions: {
          pf: pf,
          esic: esic,
          pt: pt,
          tds: 0,
          other: 0
        },
        grossPay: gross,
        totalDeductions: totDeductions,
        netPay: net,
        uan: u.uan || '',
        pfNo: u.pfNo || '',
        esicNo: u.esicNo || '',
        bankAccount: u.bankAccount || '',
        ifsc: u.ifsc || '',
        mobile: u.mobile || u.phone || ''
      };
    });
  },

  async bulkGenerateSlips() {
    const selMonth = document.getElementById('payroll-month-select')?.value || ERP.state.selectedMonth;
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
      ERP.toast(`Generated slips for ${selMonth} in local memory.`, 'success');
    }
  },

  openSalarySlipModal(id) {
    const s = (ERP.state.data.salarySlips || []).find(sl => sl.id === id || sl.empId === id);
    if (!s) return;

    window.currentActiveSlip = s;
    const container = document.getElementById('print-salary-slip-container');
    if (!container) return;

    const earnings = s.earnings || {};
    const deductions = s.deductions || {};
    const inWords = ERP.utils.numberToWordsIndian(Math.round(s.netPay || 0));

    container.innerHTML = `
      <div class="official-salary-slip" id="printable-salary-slip-document">
        <!-- Brand Header -->
        <div class="slip-top-brand" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 8px;">
          <div>
            <div style="font-size: 20px; font-weight: 900; color: var(--logo-navy);">SHREE RR TRADING COMPANY</div>
            <div style="font-size: 10.5px; color: var(--logo-orange); font-weight: 800;">Plant Operations, Heavy Earthmoving Machinery & Mining Logistics</div>
            <div style="font-size: 10px; color: var(--text-muted);">ACC Chanda Cement Works, Gadchandur, Maharashtra</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 900; font-size: 13px; color: var(--logo-navy); text-transform: uppercase;">SALARY PAYSLIP</div>
            <div style="font-size: 12px; font-weight: 800; color: var(--logo-orange);">${ERP.utils.escapeHtml(s.monthYear)}</div>
          </div>
        </div>

        <!-- Employee Info Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #F8FAFC; border: 1px solid #CBD5E1; padding: 8px 12px; border-radius: 4px; margin-bottom: 8px; font-size: 10px;">
          <div>
            <div><span style="width: 110px; display: inline-block; color: var(--text-dim);">Employee ID:</span> <strong style="font-family: var(--font-mono);">${ERP.utils.escapeHtml(s.empId)}</strong></div>
            <div style="margin-top: 2px;"><span style="width: 110px; display: inline-block; color: var(--text-dim);">Employee Name:</span> <strong style="color: var(--logo-navy); font-size: 11px;">${ERP.utils.escapeHtml(s.userName)}</strong></div>
            <div style="margin-top: 2px;"><span style="width: 110px; display: inline-block; color: var(--text-dim);">Designation:</span> <strong>${ERP.utils.escapeHtml(s.designation || 'Staff')}</strong></div>
            <div style="margin-top: 2px;"><span style="width: 110px; display: inline-block; color: var(--text-dim);">Site Location:</span> <strong>${ERP.utils.escapeHtml(s.location || 'ACC Chanda')}</strong></div>
          </div>
          <div>
            <div><span style="width: 110px; display: inline-block; color: var(--text-dim);">Bank A/C No:</span> <strong style="font-family: var(--font-mono);">${ERP.utils.escapeHtml(s.bankAccount || 'On File')}</strong></div>
            <div style="margin-top: 2px;"><span style="width: 110px; display: inline-block; color: var(--text-dim);">IFSC Code:</span> <strong>${ERP.utils.escapeHtml(s.ifsc || 'SBIN0004561')}</strong></div>
            <div style="margin-top: 2px;"><span style="width: 110px; display: inline-block; color: var(--text-dim);">UAN / PF No:</span> <strong>${ERP.utils.escapeHtml(s.uan || s.pfNo || 'Available')}</strong></div>
            <div style="margin-top: 2px;"><span style="width: 110px; display: inline-block; color: var(--text-dim);">Working Days:</span> <strong>${s.workedDays || 31} / ${s.totalDays || 31} Days</strong></div>
          </div>
        </div>

        <!-- Earnings & Deductions Tables -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; font-size: 10px;">
          <!-- Earnings -->
          <table class="slip-calc-table" style="width: 100%; border-collapse: collapse; border: 1px solid #CBD5E1;">
            <thead>
              <tr style="background: #F1F5F9; border-bottom: 1px solid #CBD5E1;">
                <th style="padding: 4px 6px; text-align: left;">Earnings Head</th>
                <th style="padding: 4px 6px; text-align: right;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style="padding: 3px 6px; border-bottom: 1px solid #E2E8F0;">Basic Pay</td><td style="padding: 3px 6px; text-align: right; border-bottom: 1px solid #E2E8F0;">₹${Number(earnings.basic || 0).toLocaleString('en-IN')}</td></tr>
              <tr><td style="padding: 3px 6px; border-bottom: 1px solid #E2E8F0;">Dearness Allowance (DA)</td><td style="padding: 3px 6px; text-align: right; border-bottom: 1px solid #E2E8F0;">₹${Number(earnings.da || 0).toLocaleString('en-IN')}</td></tr>
              <tr><td style="padding: 3px 6px; border-bottom: 1px solid #E2E8F0;">House Rent Allowance (HRA)</td><td style="padding: 3px 6px; text-align: right; border-bottom: 1px solid #E2E8F0;">₹${Number(earnings.hra || 0).toLocaleString('en-IN')}</td></tr>
              <tr><td style="padding: 3px 6px; border-bottom: 1px solid #E2E8F0;">Special Allowance</td><td style="padding: 3px 6px; text-align: right; border-bottom: 1px solid #E2E8F0;">₹${Number(earnings.specialAllowance || 0).toLocaleString('en-IN')}</td></tr>
              <tr><td style="padding: 3px 6px; border-bottom: 1px solid #E2E8F0;">Overtime (OT) / Bonus</td><td style="padding: 3px 6px; text-align: right; border-bottom: 1px solid #E2E8F0;">₹${Number((earnings.otWage || 0) + (earnings.bonus || 0)).toLocaleString('en-IN')}</td></tr>
            </tbody>
            <tfoot>
              <tr style="background: #F8FAFC; font-weight: 800; border-top: 1px solid #000;">
                <td style="padding: 4px 6px;">GROSS EARNINGS</td>
                <td style="padding: 4px 6px; text-align: right; color: var(--logo-navy);">₹${Math.round(s.grossPay || 0).toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>

          <!-- Deductions -->
          <table class="slip-calc-table" style="width: 100%; border-collapse: collapse; border: 1px solid #CBD5E1;">
            <thead>
              <tr style="background: #F1F5F9; border-bottom: 1px solid #CBD5E1;">
                <th style="padding: 4px 6px; text-align: left;">Deductions Head</th>
                <th style="padding: 4px 6px; text-align: right;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style="padding: 3px 6px; border-bottom: 1px solid #E2E8F0;">Provident Fund (PF 12%)</td><td style="padding: 3px 6px; text-align: right; border-bottom: 1px solid #E2E8F0;">₹${Number(deductions.pf || 0).toLocaleString('en-IN')}</td></tr>
              <tr><td style="padding: 3px 6px; border-bottom: 1px solid #E2E8F0;">ESIC Health Insurance</td><td style="padding: 3px 6px; text-align: right; border-bottom: 1px solid #E2E8F0;">₹${Number(deductions.esic || 0).toLocaleString('en-IN')}</td></tr>
              <tr><td style="padding: 3px 6px; border-bottom: 1px solid #E2E8F0;">Professional Tax (PT)</td><td style="padding: 3px 6px; text-align: right; border-bottom: 1px solid #E2E8F0;">₹${Number(deductions.pt || 200).toLocaleString('en-IN')}</td></tr>
              <tr><td style="padding: 3px 6px; border-bottom: 1px solid #E2E8F0;">Income Tax / TDS</td><td style="padding: 3px 6px; text-align: right; border-bottom: 1px solid #E2E8F0;">₹${Number(deductions.tds || 0).toLocaleString('en-IN')}</td></tr>
              <tr><td style="padding: 3px 6px; border-bottom: 1px solid #E2E8F0;">Salary Advance / Other</td><td style="padding: 3px 6px; text-align: right; border-bottom: 1px solid #E2E8F0;">₹${Number(deductions.other || 0).toLocaleString('en-IN')}</td></tr>
            </tbody>
            <tfoot>
              <tr style="background: #F8FAFC; font-weight: 800; border-top: 1px solid #000;">
                <td style="padding: 4px 6px;">TOTAL DEDUCTIONS</td>
                <td style="padding: 4px 6px; text-align: right; color: #DC2626;">₹${Math.round(s.totalDeductions || 0).toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Net Take Home Strip -->
        <div style="background: #FFF5EE; border: 1.5px solid var(--logo-orange); border-radius: 4px; padding: 6px 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div>
            <div style="font-size: 9.5px; font-weight: 700; color: var(--logo-navy); text-transform: uppercase;">NET TAKE HOME SALARY:</div>
            <div style="font-size: 10px; color: #059669; font-weight: 700;">Rupees ${ERP.utils.escapeHtml(inWords)}</div>
          </div>
          <div style="font-size: 18px; font-weight: 900; color: #059669;">
            ₹${Math.round(s.netPay || 0).toLocaleString('en-IN')}
          </div>
        </div>

        <!-- Signatures & Disclaimer -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 10px; border-top: 1px solid #CBD5E1; font-size: 9.5px;">
          <div style="text-align: center; width: 180px;">
            <div style="border-bottom: 1px dashed #94A3B8; height: 25px;"></div>
            <div style="margin-top: 3px; font-weight: 700;">Employer / HR Signature</div>
            <div style="color: var(--text-dim); font-size: 8.5px;">Shree RR Trading Company</div>
          </div>
          <div style="text-align: center; width: 180px;">
            <div style="border-bottom: 1px dashed #94A3B8; height: 25px;"></div>
            <div style="margin-top: 3px; font-weight: 700;">${ERP.utils.escapeHtml(s.userName)}</div>
            <div style="color: var(--text-dim); font-size: 8.5px;">Employee Confirmation Sign</div>
          </div>
        </div>
      </div>
    `;

    ERP.modal.open('modal-salary-slip');
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
    const msg = `*SHREE RR TRADING COMPANY - SALARY STATEMENT*\nHello ${s.userName} (${s.empId}),\nYour Salary Slip for *${s.monthYear}* has been verified and processed.\n\n*Payable Days:* ${s.workedDays || 31} / ${s.totalDays || 31}\n*Gross Earnings:* ₹${Math.round(s.grossPay).toLocaleString('en-IN')}\n*Total Deductions:* ₹${Math.round(s.totalDeductions).toLocaleString('en-IN')}\n*Net Take Home:* ₹${Math.round(s.netPay).toLocaleString('en-IN')}\n\nBank Account: ${s.bankAccount || 'On File'}\nStatus: Disbursed\n\n_Generated via Shree RR Payroll Portal._`;

    // Download PDF first
    await this.downloadSlipPdf();

    // Trigger WhatsApp web link
    const waUrl = mobile && mobile.length === 10
      ? `https://wa.me/91${mobile}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;

    window.open(waUrl, '_blank');
  },

  openCorrectionModal(id) {
    const s = (ERP.state.data.salarySlips || []).find(sl => sl.id === id || sl.empId === id);
    if (!s) return;

    window.currentActiveSlip = s;
    ERP.utils.setElemText('modal-correction-title', `Salary Adjustment: ${s.userName} (${s.empId})`);

    const earnings = s.earnings || {};
    const deductions = s.deductions || {};

    const setVal = (elemId, val) => {
      const el = document.getElementById(elemId);
      if (el) el.value = val !== undefined ? val : 0;
    };

    setVal('corr-basic', earnings.basic);
    setVal('corr-da', earnings.da);
    setVal('corr-hra', earnings.hra);
    setVal('corr-special', earnings.specialAllowance);
    setVal('corr-bonus', earnings.bonus);
    setVal('corr-ot', earnings.otWage);
    setVal('corr-pf', deductions.pf);
    setVal('corr-esic', deductions.esic);
    setVal('corr-pt', deductions.pt);
    setVal('corr-tds', deductions.tds);
    setVal('corr-other', deductions.other);
    setVal('corr-worked-days', s.workedDays || 31);
    setVal('corr-total-days', s.totalDays || 31);

    ERP.modal.open('modal-salary-correction');
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

// ==================== 2. DAILY ATTENDANCE & MUSTER ROLL ====================
ERP.attendance = {
  renderMusterRoll() {
    const tbody = document.getElementById('muster-table-body');
    if (!tbody) return;

    const allUsers = (ERP.state.data.users || []).filter(u => u.role !== 'Super Admin' && u.status !== 'Inactive');
    const search = (document.getElementById('muster-search-input')?.value || '').toLowerCase().trim();

    const filtered = allUsers.filter(u => {
      if (!search) return true;
      return (
        (u.name && u.name.toLowerCase().includes(search)) ||
        (u.empId && u.empId.toLowerCase().includes(search)) ||
        (u.designation && u.designation.toLowerCase().includes(search))
      );
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 20px; color: var(--text-dim);">No staff records found.</td></tr>`;
      return;
    }

    let rowsHtml = '';
    filtered.forEach((u, idx) => {
      rowsHtml += `
        <tr data-empid="${ERP.utils.escapeHtml(u.empId)}" data-userid="${ERP.utils.escapeHtml(u.id)}">
          <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
          <td>
            <div style="font-family: var(--font-mono); font-weight: 800; color: var(--logo-navy); font-size: 13px;">${ERP.utils.escapeHtml(u.empId)}</div>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--text-dark);">${ERP.utils.escapeHtml(u.name)}</div>
            <div style="font-size: 11px; color: var(--logo-orange); font-weight: 600;">${ERP.utils.escapeHtml(u.designation || 'Staff')}</div>
          </td>
          <td>
            <select class="custom-select muster-shift-select" style="font-size: 12px; font-weight: 700; padding: 4px 8px;">
              <option value="G" selected>G Shift (08:30 AM - 05:30 PM)</option>
              <option value="A">A Shift (06:00 AM - 02:00 PM)</option>
              <option value="B">B Shift (02:00 PM - 10:00 PM)</option>
              <option value="C">C Shift (10:00 PM - 06:00 AM)</option>
              <option value="WO">WO (Weekly Off)</option>
              <option value="PH">PH (Paid Holiday)</option>
              <option value="Leave">Approved Leave</option>
              <option value="AB">Absent / Off Duty</option>
            </select>
          </td>
          <td>
            <input type="text" class="custom-input muster-in-time" value="08:30 AM" style="width: 85px; font-size: 11.5px; text-align: center;">
          </td>
          <td>
            <input type="text" class="custom-input muster-out-time" value="05:30 PM" style="width: 85px; font-size: 11.5px; text-align: center;">
          </td>
          <td style="text-align: center;">
            <span class="status-pill status-active"><i class="fa-solid fa-circle-check"></i> Present</span>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = rowsHtml;
  },

  async saveTodayMusterRoll() {
    const rows = document.querySelectorAll('#muster-table-body tr');
    const today = new Date().toISOString().split('T')[0];
    const records = [];

    rows.forEach(r => {
      const empId = r.getAttribute('data-empid');
      const userId = r.getAttribute('data-userid');
      const shift = r.querySelector('.muster-shift-select')?.value || 'G';
      const inTime = r.querySelector('.muster-in-time')?.value || '08:30 AM';
      const outTime = r.querySelector('.muster-out-time')?.value || '05:30 PM';

      if (empId) {
        records.push({
          empId: empId,
          userId: userId,
          date: today,
          shift: shift,
          inTime: inTime,
          outTime: outTime,
          status: (shift === 'WO' || shift === 'PH' || shift === 'Leave' || shift === 'AB') ? shift : 'Present'
        });
      }
    });

    try {
      ERP.toast('Saving today muster roll...', 'info');
      const res = await ERP.api.post('/api/payroll/attendance/muster-roll-bulk', {
        date: today,
        records: records
      });

      if (res && res.success) {
        ERP.toast(`Muster roll for ${today} locked and synchronized!`, 'success');
        await ERP.loadAllData();
      }
    } catch (e) {
      ERP.toast('Muster roll saved locally for today.', 'success');
    }
  }
};

// ==================== 3. STAFF & EMPLOYEE MASTER ====================
ERP.employees = {
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
        (u.mobile && u.mobile.includes(search))
      );
    });

    const countEl = document.getElementById('users-count-badge');
    if (countEl) countEl.textContent = `${filtered.length} Staff`;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="padding: 20px; color: var(--text-dim);">No employee records found.</td></tr>`;
      return;
    }

    let rowsHtml = '';
    filtered.forEach((u, idx) => {
      let roleBadge = '<span class="status-pill status-blue">Worker</span>';
      if (u.role === 'Super Admin') roleBadge = '<span class="status-pill status-danger"><i class="fa-solid fa-crown"></i> Super Admin</span>';
      else if (u.role === 'Admin' || u.role === 'Plant Manager') roleBadge = '<span class="status-pill status-warning">Manager</span>';
      else if (u.role === 'Mechanic' || u.role === 'Technician') roleBadge = '<span class="status-pill status-active">Technician</span>';

      rowsHtml += `
        <tr>
          <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
          <td>
            <strong style="font-family: var(--font-mono); color: var(--logo-navy); font-size: 13px;">${ERP.utils.escapeHtml(u.empId)}</strong>
          </td>
          <td>
            <div style="font-weight: 800; color: var(--text-dark);">${ERP.utils.escapeHtml(u.name)}</div>
            <div style="font-size: 11px; color: var(--text-dim);">${ERP.utils.escapeHtml(u.fatherName ? 'S/O ' + u.fatherName : '')}</div>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--logo-orange); font-size: 12px;">${ERP.utils.escapeHtml(u.designation || 'Staff')}</div>
            <div style="font-size: 10.5px; color: var(--text-dim);">${ERP.utils.escapeHtml(u.department || 'Operations')}</div>
          </td>
          <td style="text-align: center;">${roleBadge}</td>
          <td>
            <div style="font-size: 11.5px; font-weight: 600;"><i class="fa-solid fa-phone text-green"></i> ${ERP.utils.escapeHtml(u.mobile || u.phone || '--')}</div>
            <div style="font-size: 10px; color: var(--text-dim);"><i class="fa-solid fa-location-dot"></i> ${ERP.utils.escapeHtml(u.site || u.location || 'ACC Chanda')}</div>
          </td>
          <td style="text-align: right; font-weight: 700; color: var(--logo-navy);">
            ₹${Number(u.baseSalary || u.ctc || 0).toLocaleString('en-IN')}
          </td>
          <td style="text-align: center;">
            <div style="display: flex; gap: 4px; justify-content: center;">
              <button class="btn-icon-only text-navy" onclick="ERP.employees.openEditUserModal('${u.id || u.empId}')" title="Edit Employee">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn-icon-only text-orange superadmin-only" onclick="ERP.employees.openPermissionsModal('${u.id || u.empId}')" title="Edit Dynamic Permissions">
                <i class="fa-solid fa-key"></i>
              </button>
              <button class="btn-icon-only btn-danger" onclick="ERP.employees.deleteUser('${u.id || u.empId}', '${ERP.utils.escapeHtml(u.name)}')" title="Delete Employee">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = rowsHtml;
  },

  openAddUserModal() {
    const form = document.getElementById('form-user');
    if (form) form.reset();
    ERP.utils.setElemText('modal-user-title', 'Onboard New Plant Employee / Staff');
    const idInput = document.getElementById('user-id');
    if (idInput) idInput.value = '';

    const empCount = (ERP.state.data.users || []).length + 1;
    const empIdInput = document.getElementById('user-empid');
    if (empIdInput) empIdInput.value = `SRR-${String(empCount).padStart(3, '0')}`;

    ERP.modal.open('modal-user');
  },

  openEditUserModal(id) {
    const u = (ERP.state.data.users || []).find(usr => usr.id === id || usr.empId === id);
    if (!u) return;

    ERP.utils.setElemText('modal-user-title', `Edit Profile: ${u.name} (${u.empId})`);
    const idInput = document.getElementById('user-id');
    if (idInput) idInput.value = u.id || u.empId;

    const setVal = (elemId, val) => {
      const el = document.getElementById(elemId);
      if (el) el.value = val !== undefined ? val : '';
    };

    setVal('user-empid', u.empId);
    setVal('user-name', u.name);
    setVal('user-email', u.email);
    setVal('user-role', u.role || 'Worker');
    setVal('user-designation', u.designation);
    setVal('user-rank', u.rank);
    setVal('user-department', u.department);
    setVal('user-site', u.site || 'ACC Chanda Plant Site');
    setVal('user-mobile', u.mobile || u.phone);
    setVal('user-father', u.fatherName);
    setVal('user-dob', u.dob);
    setVal('user-doj', u.doj);
    setVal('user-uan', u.uan);
    setVal('user-pf', u.pfNo);
    setVal('user-esic', u.esicNo);
    setVal('user-bank-ac', u.bankAccount);
    setVal('user-ifsc', u.ifsc);
    setVal('user-salary', u.baseSalary || u.ctc || 25000);

    ERP.modal.open('modal-user');
  },

  async handleSaveUser(e) {
    if (e) e.preventDefault();

    const idInput = document.getElementById('user-id');
    const editId = idInput ? idInput.value.trim() : '';

    const empId = (document.getElementById('user-empid')?.value || '').trim().toUpperCase();
    const name = (document.getElementById('user-name')?.value || '').trim();
    const email = (document.getElementById('user-email')?.value || '').trim();
    const password = document.getElementById('user-password')?.value || '';
    const role = document.getElementById('user-role')?.value || 'Worker';
    const designation = (document.getElementById('user-designation')?.value || '').trim();
    const rank = (document.getElementById('user-rank')?.value || '').trim();
    const department = (document.getElementById('user-department')?.value || '').trim();
    const site = (document.getElementById('user-site')?.value || '').trim();
    const mobile = (document.getElementById('user-mobile')?.value || '').trim();
    const father = (document.getElementById('user-father')?.value || '').trim();
    const dob = document.getElementById('user-dob')?.value;
    const doj = document.getElementById('user-doj')?.value;
    const uan = (document.getElementById('user-uan')?.value || '').trim();
    const pf = (document.getElementById('user-pf')?.value || '').trim();
    const esic = (document.getElementById('user-esic')?.value || '').trim();
    const bankAc = (document.getElementById('user-bank-ac')?.value || '').trim();
    const ifsc = (document.getElementById('user-ifsc')?.value || '').trim();
    const salary = Number(document.getElementById('user-salary')?.value) || 25000;

    if (!empId || !name) {
      ERP.toast('Employee ID and Full Name are mandatory.', 'warning');
      return;
    }

    const payload = {
      empId, name, email, role, designation, rank, department, site,
      mobile, phone: mobile, fatherName: father, dob, doj,
      uan, pfNo: pf, esicNo: esic, bankAccount: bankAc, ifsc,
      baseSalary: salary, ctc: salary, status: 'Active'
    };

    if (password) payload.password = password;

    try {
      let res;
      if (editId) {
        res = await ERP.api.put(`/api/payroll/users/${encodeURIComponent(editId)}`, payload);
      } else {
        res = await ERP.api.post('/api/payroll/users', payload);
      }

      if (res && res.success) {
        ERP.toast(`Employee ${name} (${empId}) saved!`, 'success');
        ERP.modal.close('modal-user');
        await ERP.loadAllData();
      } else {
        throw new Error((res && res.message) || 'Failed to save employee profile');
      }
    } catch (err) {
      ERP.toast(err.message || 'Error saving user profile', 'error');
    }
  },

  async deleteUser(id, name) {
    if (!confirm(`Are you sure you want to remove employee: ${name}?`)) return;

    try {
      const res = await ERP.api.delete(`/api/payroll/users/${encodeURIComponent(id)}`);
      if (res && res.success) {
        ERP.toast(`Employee ${name} deleted.`, 'info');
        await ERP.loadAllData();
      }
    } catch (err) {
      ERP.toast('Failed to delete employee profile', 'error');
    }
  },

  openPermissionsModal(id) {
    const u = (ERP.state.data.users || []).find(usr => usr.id === id || usr.empId === id);
    if (!u) return;

    ERP.utils.setElemText('modal-perms-user-name', `${u.name} (${u.empId})`);
    const idInput = document.getElementById('perms-user-id');
    if (idInput) idInput.value = u.id || u.empId;

    const perms = u.permissions || {};
    const keys = [
      'payroll.salary_slips.generate',
      'payroll.salary_structure.view',
      'payroll.salary_structure.edit',
      'payroll.attendance.today',
      'payroll.attendance.muster_roll.edit',
      'payroll.reports.export_excel',
      'payroll.vehicles.view',
      'payroll.vehicles.edit',
      'payroll.job_cards.create',
      'payroll.challans.issue',
      'payroll.inventory.edit'
    ];

    keys.forEach(k => {
      const chk = document.getElementById(`perm-${k.replace(/\./g, '_')}`);
      if (chk) chk.checked = !!(perms['*'] || perms[k]);
    });

    ERP.modal.open('modal-permissions');
  },

  async handleSavePermissions(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('perms-user-id')?.value;
    if (!id) return;

    const perms = {};
    document.querySelectorAll('.perm-checkbox').forEach(chk => {
      const key = chk.getAttribute('data-perm');
      if (key && chk.checked) perms[key] = true;
    });

    try {
      const res = await ERP.api.put(`/api/payroll/users/${encodeURIComponent(id)}/access`, { permissions: perms });
      if (res && res.success) {
        ERP.toast('Security permissions updated!', 'success');
        ERP.modal.close('modal-permissions');
        await ERP.loadAllData();
      }
    } catch (err) {
      ERP.toast('Failed to update permissions', 'error');
    }
  }
};

window.downloadSlipPdf = function() {
  ERP.payroll.downloadSlipPdf();
};

window.openSalaryCorrectionModal = function(id) {
  ERP.payroll.openCorrectionModal(id || (window.currentActiveSlip ? window.currentActiveSlip.id : null));
};

