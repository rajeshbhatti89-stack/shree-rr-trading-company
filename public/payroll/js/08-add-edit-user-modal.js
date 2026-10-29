// 8. Add/Edit User Modal
function editUser(userId) {
  const user = allUsers.find((u) => u.id === userId || u.empId === userId);
  if (!user) return;

  document.getElementById('modal-user-title').innerHTML = `<i class="fa-solid fa-user-pen text-orange"></i> Edit Record (${user.empId})`;
  document.getElementById('user-id').value = user.id || user.empId;
  document.getElementById('user-empId').value = user.empId || '';
  document.getElementById('user-empId').readOnly = true;
  document.getElementById('user-name').value = user.name || '';
  document.getElementById('user-role').value = user.role || 'Worker';
  document.getElementById('user-fatherName').value = user.fatherName || '';
  document.getElementById('user-mobile').value = (user.mobile || user.phone || '').replace(/[^0-9]/g, '').slice(-10);
  document.getElementById('user-designation').value = user.designation || user.rank || 'Operator';
  document.getElementById('user-category').value = user.category || 'Skilled';
  document.getElementById('user-location').value = user.location || user.site || 'ACC Chanda';
  document.getElementById('user-dob').value = user.dob || '';
  document.getElementById('user-doj').value = user.doj || '';
  document.getElementById('user-department').value = user.department || 'Plant Fleet & Garage O&M';
  document.getElementById('user-email').value = user.email || '';

  // Salary mode & components
  const isDaily = !user.ctc && !!user.basicPerDay;
  document.getElementById('salary-mode-ctc').checked = !isDaily;
  document.getElementById('salary-mode-daily').checked = isDaily;
  onSalaryModeChange();

  if (!isDaily) {
    const sc = user.salaryComponents || {};
    const scGross = sc.basic ? (Number(sc.basic || 0) + Number(sc.da || 0) + Number(sc.hra || 0) + Number(sc.specialAllowance || 0) + Number(sc.bonus || 0) + Number(sc.otherEarnings || 0)) : 0;
    const grossVal = user.grossSalary || scGross || user.baseSalary || user.ctc || '';
    document.getElementById('user-gross').value = grossVal || '';
    document.getElementById('user-ctc').value = user.ctc || '';

    document.getElementById('comp-basic').value = sc.basic || '';
    document.getElementById('comp-da').value = sc.da || '0';
    document.getElementById('comp-hra').value = sc.hra || '';
    document.getElementById('comp-special').value = sc.specialAllowance || '';
    document.getElementById('comp-bonus').value = sc.bonus || '0';
    document.getElementById('comp-other-earn').value = sc.otherEarnings || '0';

    const dr = user.deductionRates || {};
    document.getElementById('comp-pf-pct').value = dr.pfVal !== undefined ? dr.pfVal : (dr.pfPct !== undefined ? dr.pfPct : 12);
    document.getElementById('comp-esic-pct').value = dr.esicVal !== undefined ? dr.esicVal : (dr.esicPct !== undefined ? dr.esicPct : 0);
    document.getElementById('comp-pt').value = dr.pt !== undefined ? dr.pt : 200;
    document.getElementById('comp-lic').value = dr.lic || 0;
    document.getElementById('comp-advance').value = dr.advance || 0;
    document.getElementById('comp-tds').value = dr.tds || 0;

    const ec = user.employerContributions || {};
    document.getElementById('comp-er-pf').value = ec.pfVal !== undefined ? ec.pfVal : 12;
    document.getElementById('comp-er-esic').value = ec.esicVal !== undefined ? ec.esicVal : 0;
    document.getElementById('comp-er-gratuity').value = ec.gratuity || 0;

    document.getElementById('user-otRate').value = user.otRate || '';
  } else {
    document.getElementById('user-basicPerDay').value = user.basicPerDay || '';
    const sc = user.salaryComponents || {};
    document.getElementById('comp-da-perday').value = sc.daPerDay || '';
    document.getElementById('comp-hra-perday').value = sc.hraPerDay || '';

    const dr = user.deductionRates || {};
    document.getElementById('comp-pf-pct-daily').value = dr.pfVal !== undefined ? dr.pfVal : (dr.pfPct !== undefined ? dr.pfPct : 12);
    document.getElementById('comp-esic-pct-daily').value = dr.esicVal !== undefined ? dr.esicVal : (dr.esicPct !== undefined ? dr.esicPct : 0.75);
    document.getElementById('comp-pt-daily').value = dr.pt !== undefined ? dr.pt : 200;
    document.getElementById('comp-lic-daily').value = dr.lic || 0;
    document.getElementById('comp-advance-daily').value = dr.advance || 0;

    const ec = user.employerContributions || {};
    document.getElementById('comp-er-pf-daily').value = ec.pfVal !== undefined ? ec.pfVal : 12;
    document.getElementById('comp-er-esic-daily').value = ec.esicVal !== undefined ? ec.esicVal : 3.25;

    document.getElementById('user-otRate-daily').value = user.otRate || '';
  }

  // Statutory & bank
  document.getElementById('user-bankAccount').value = user.bankAccount || '';
  document.getElementById('user-ifsc').value = user.ifsc || '';
  document.getElementById('user-bankName').value = user.bankName || '';
  document.getElementById('user-uan').value = user.uan || '';
  document.getElementById('user-pfNo').value = user.pfNo || '';
  document.getElementById('user-esicNo').value = user.esicNo || '';
  document.getElementById('user-aadhar').value = user.aadhar || '';
  document.getElementById('user-pan').value = user.pan || '';

  updateSalaryPreview();
  openModal('modal-user');
}

function openAddUserModal() {
  document.getElementById('modal-user-title').innerHTML = `<i class="fa-solid fa-user-plus text-orange"></i> Add New Employee / Worker`;
  document.getElementById('form-user').reset();
  document.getElementById('user-id').value = '';
  document.getElementById('user-empId').readOnly = false;
  let maxEmpNum = 0;
  (allUsers || []).forEach(u => {
    const m = String(u.empId || '').match(/SRR(\d+)/i);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > maxEmpNum) maxEmpNum = n;
    }
  });
  const nextNum = Math.max(maxEmpNum + 1, (allUsers ? allUsers.length + 1 : 1));
  const nextId = `SRR${String(nextNum).padStart(3, '0')}`;
  document.getElementById('user-empId').value = nextId;

  // Reset salary mode to CTC
  document.getElementById('salary-mode-ctc').checked = true;
  onSalaryModeChange();

  // Reset all salary fields
  document.getElementById('user-gross').value = '';
  document.getElementById('user-ctc').value = '';
  document.getElementById('comp-basic').value = '';
  document.getElementById('comp-da').value = '0';
  document.getElementById('comp-hra').value = '';
  document.getElementById('comp-special').value = '';
  document.getElementById('comp-bonus').value = 0;
  document.getElementById('comp-other-earn').value = 0;

  // Employee Deduction Defaults
  document.getElementById('comp-pf-pct').value = 12;
  document.getElementById('comp-esic-pct').value = 0;
  document.getElementById('comp-pt').value = 200;
  document.getElementById('comp-lic').value = 0;
  document.getElementById('comp-advance').value = 0;
  document.getElementById('comp-tds').value = 0;

  // Employer Contribution Defaults
  document.getElementById('comp-er-pf').value = 12;
  document.getElementById('comp-er-esic').value = 0;
  document.getElementById('comp-er-gratuity').value = 0;

  // Daily Wage Defaults
  document.getElementById('comp-pf-pct-daily').value = 12;
  document.getElementById('comp-esic-pct-daily').value = 0.75;
  document.getElementById('comp-pt-daily').value = 200;
  document.getElementById('comp-er-pf-daily').value = 12;
  document.getElementById('comp-er-esic-daily').value = 3.25;

  document.getElementById('user-location').value = 'ACC Chanda';
  document.getElementById('user-department').value = 'Plant Fleet & Garage O&M';
  updateSalaryPreview();
  openModal('modal-user');
}

// ── Salary Mode Toggle ──
function onSalaryModeChange() {
  const isCtc = document.getElementById('salary-mode-ctc').checked;
  const ctcSection = document.getElementById('salary-section-ctc');
  const dailySection = document.getElementById('salary-section-daily');
  const ctcLabel = document.getElementById('mode-label-ctc');
  const dailyLabel = document.getElementById('mode-label-daily');

  if (isCtc) {
    if (ctcSection) ctcSection.style.display = 'block';
    if (dailySection) dailySection.style.display = 'none';
    if (ctcLabel) { ctcLabel.style.borderColor = 'var(--border-orange)'; ctcLabel.style.background = 'rgba(255,107,0,0.05)'; }
    if (dailyLabel) { dailyLabel.style.borderColor = '#CBD5E1'; dailyLabel.style.background = '#F8FAFC'; }
  } else {
    if (ctcSection) ctcSection.style.display = 'none';
    if (dailySection) dailySection.style.display = 'block';
    if (ctcLabel) { ctcLabel.style.borderColor = '#CBD5E1'; ctcLabel.style.background = '#F8FAFC'; }
    if (dailyLabel) { dailyLabel.style.borderColor = 'var(--border-orange)'; dailyLabel.style.background = 'rgba(255,107,0,0.05)'; }
  }
  updateSalaryPreview();
}

// ── Gross Salary Input Handler ──
function onGrossSalaryInput() {
  const gross = Number(document.getElementById('user-gross')?.value) || 0;
  if (!gross) {
    document.getElementById('user-ctc').value = '';
    ['comp-basic', 'comp-da', 'comp-hra', 'comp-special', 'comp-bonus', 'comp-other-earn'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = (id === 'comp-bonus' || id === 'comp-other-earn' || id === 'comp-da') ? '0' : '';
    });
    updateSalaryPreview();
    return;
  }

  // Standard Indian payroll breakdown:
  // Basic = 50%, DA = 0, HRA = 20%, Special Allowance = 30%
  const basic = Math.round(gross * 0.50);
  const da = 0;
  const hra = Math.round(gross * 0.20);
  const special = Math.max(0, gross - basic - da - hra);

  const basicEl = document.getElementById('comp-basic');
  const daEl = document.getElementById('comp-da');
  const hraEl = document.getElementById('comp-hra');
  const specialEl = document.getElementById('comp-special');

  if (basicEl) basicEl.value = basic;
  if (daEl) daEl.value = da;
  if (hraEl) hraEl.value = hra;
  if (specialEl) specialEl.value = special;

  // Auto-set ESIC defaults if gross <= 21,000
  const esicEl = document.getElementById('comp-esic-pct');
  const erEsicEl = document.getElementById('comp-er-esic');
  if (gross <= 21000) {
    if (esicEl && (!esicEl.value || Number(esicEl.value) === 0)) esicEl.value = '0.75';
    if (erEsicEl && (!erEsicEl.value || Number(erEsicEl.value) === 0)) erEsicEl.value = '3.25';
  } else {
    if (esicEl && Number(esicEl.value) === 0.75) esicEl.value = '0';
    if (erEsicEl && Number(erEsicEl.value) === 3.25) erEsicEl.value = '0';
  }

  // Compute Employer Contribution and Total CTC
  const erPfVal = Number(document.getElementById('comp-er-pf')?.value) || 0;
  const erEsicVal = Number(document.getElementById('comp-er-esic')?.value) || 0;
  const erGratuity = Number(document.getElementById('comp-er-gratuity')?.value) || 0;

  const erPfAmt = erPfVal <= 30 ? Math.round(basic * erPfVal / 100) : Math.round(erPfVal);
  const erEsicAmt = erEsicVal <= 10 ? Math.round(gross * erEsicVal / 100) : Math.round(erEsicVal);
  const ctc = gross + erPfAmt + erEsicAmt + erGratuity;

  const ctcEl = document.getElementById('user-ctc');
  if (ctcEl) ctcEl.value = ctc;

  updateSalaryPreview();
}

// ── CTC Salary Input Handler ──
function onCtcSalaryInput() {
  const ctc = Number(document.getElementById('user-ctc')?.value) || 0;
  if (!ctc) {
    document.getElementById('user-gross').value = '';
    ['comp-basic', 'comp-da', 'comp-hra', 'comp-special', 'comp-bonus', 'comp-other-earn'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = (id === 'comp-bonus' || id === 'comp-other-earn' || id === 'comp-da') ? '0' : '';
    });
    updateSalaryPreview();
    return;
  }

  // Reverse calculate Gross from CTC:
  // Employer PF is 12% on Basic (Basic = 50% of Gross => 6% of Gross)
  const isEsicEligible = (ctc / 1.0925) <= 21000;
  const divisor = isEsicEligible ? 1.0925 : 1.06;
  const gross = Math.round(ctc / divisor);

  const basic = Math.round(gross * 0.50);
  const da = 0;
  const hra = Math.round(gross * 0.20);
  const special = Math.max(0, gross - basic - da - hra);

  const grossEl = document.getElementById('user-gross');
  if (grossEl) grossEl.value = gross;

  const basicEl = document.getElementById('comp-basic');
  const daEl = document.getElementById('comp-da');
  const hraEl = document.getElementById('comp-hra');
  const specialEl = document.getElementById('comp-special');

  if (basicEl) basicEl.value = basic;
  if (daEl) daEl.value = da;
  if (hraEl) hraEl.value = hra;
  if (specialEl) specialEl.value = special;

  const esicEl = document.getElementById('comp-esic-pct');
  const erEsicEl = document.getElementById('comp-er-esic');
  if (isEsicEligible) {
    if (esicEl && (!esicEl.value || Number(esicEl.value) === 0)) esicEl.value = '0.75';
    if (erEsicEl && (!erEsicEl.value || Number(erEsicEl.value) === 0)) erEsicEl.value = '3.25';
  } else {
    if (esicEl && Number(esicEl.value) === 0.75) esicEl.value = '0';
    if (erEsicEl && Number(erEsicEl.value) === 3.25) erEsicEl.value = '0';
  }

  updateSalaryPreview();
}

// ── Component Input Handler ──
function onComponentInput() {
  const basic = Number(document.getElementById('comp-basic')?.value) || 0;
  const da = Number(document.getElementById('comp-da')?.value) || 0;
  const hra = Number(document.getElementById('comp-hra')?.value) || 0;
  const special = Number(document.getElementById('comp-special')?.value) || 0;
  const bonus = Number(document.getElementById('comp-bonus')?.value) || 0;
  const otherEarn = Number(document.getElementById('comp-other-earn')?.value) || 0;

  const gross = basic + da + hra + special + bonus + otherEarn;
  const grossEl = document.getElementById('user-gross');
  if (grossEl) grossEl.value = gross > 0 ? gross : '';

  const erPfVal = Number(document.getElementById('comp-er-pf')?.value) || 0;
  const erEsicVal = Number(document.getElementById('comp-er-esic')?.value) || 0;
  const erGratuity = Number(document.getElementById('comp-er-gratuity')?.value) || 0;

  const erPfAmt = erPfVal <= 30 ? Math.round(basic * erPfVal / 100) : Math.round(erPfVal);
  const erEsicAmt = erEsicVal <= 10 ? Math.round(gross * erEsicVal / 100) : Math.round(erEsicVal);
  const ctc = gross + erPfAmt + erEsicAmt + erGratuity;

  const ctcEl = document.getElementById('user-ctc');
  if (ctcEl) ctcEl.value = ctc > 0 ? ctc : '';

  updateSalaryPreview();
}

// ── Backward-compatible alias ──
function autoCalculateSalaryComponents() {
  onGrossSalaryInput();
}

// ── Live Salary Architecture Preview ──
function updateSalaryPreview() {
  const isCtc = document.getElementById('salary-mode-ctc')?.checked;
  let gross = 0, employeeDeductions = 0, employerContributions = 0, ctc = 0;
  let breakdownParts = [];

  if (isCtc) {
    const basic = Number(document.getElementById('comp-basic')?.value) || 0;
    const da = Number(document.getElementById('comp-da')?.value) || 0;
    const hra = Number(document.getElementById('comp-hra')?.value) || 0;
    const special = Number(document.getElementById('comp-special')?.value) || 0;
    const bonus = Number(document.getElementById('comp-bonus')?.value) || 0;
    const otherEarn = Number(document.getElementById('comp-other-earn')?.value) || 0;
    gross = basic + da + hra + special + bonus + otherEarn;
    if (!gross && document.getElementById('user-gross')?.value) {
      gross = Number(document.getElementById('user-gross').value) || 0;
    }

    // Employee Deductions
    const pfInput = Number(document.getElementById('comp-pf-pct')?.value) || 0;
    const esicInput = Number(document.getElementById('comp-esic-pct')?.value) || 0;
    const pt = Number(document.getElementById('comp-pt')?.value) || 0;
    const lic = Number(document.getElementById('comp-lic')?.value) || 0;
    const advance = Number(document.getElementById('comp-advance')?.value) || 0;
    const tds = Number(document.getElementById('comp-tds')?.value) || 0;

    const pf = pfInput <= 30 ? Math.round(basic * pfInput / 100) : Math.round(pfInput);
    const esic = esicInput <= 10 ? Math.round(gross * esicInput / 100) : Math.round(esicInput);
    employeeDeductions = pf + esic + pt + lic + advance + tds;

    // Employer Contributions
    const erPfInput = Number(document.getElementById('comp-er-pf')?.value) || 0;
    const erEsicInput = Number(document.getElementById('comp-er-esic')?.value) || 0;
    const erGratuity = Number(document.getElementById('comp-er-gratuity')?.value) || 0;

    const erPf = erPfInput <= 30 ? Math.round(basic * erPfInput / 100) : Math.round(erPfInput);
    const erEsic = erEsicInput <= 10 ? Math.round(gross * erEsicInput / 100) : Math.round(erEsicInput);
    employerContributions = erPf + erEsic + erGratuity;

    ctc = gross + employerContributions;

    breakdownParts = [
      basic ? `Basic: ₹${basic.toLocaleString('en-IN')}` : '',
      hra ? `HRA: ₹${hra.toLocaleString('en-IN')}` : '',
      special ? `Special: ₹${special.toLocaleString('en-IN')}` : '',
      pf ? `EE PF: ₹${pf.toLocaleString('en-IN')}` : '',
      pt ? `PT: ₹${pt.toLocaleString('en-IN')}` : '',
      erPf ? `ER PF: ₹${erPf.toLocaleString('en-IN')}` : '',
      erEsic ? `ER ESIC: ₹${erEsic.toLocaleString('en-IN')}` : ''
    ].filter(Boolean);
  } else {
    const basicPD = Number(document.getElementById('user-basicPerDay')?.value) || 0;
    const daPD = Number(document.getElementById('comp-da-perday')?.value) || 0;
    const hraPD = Number(document.getElementById('comp-hra-perday')?.value) || 0;
    const days = 26; // Standard payable days
    gross = (basicPD + daPD + hraPD) * days;

    const pfInput = Number(document.getElementById('comp-pf-pct-daily')?.value) || 0;
    const esicInput = Number(document.getElementById('comp-esic-pct-daily')?.value) || 0;
    const pt = Number(document.getElementById('comp-pt-daily')?.value) || 0;
    const lic = Number(document.getElementById('comp-lic-daily')?.value) || 0;
    const advance = Number(document.getElementById('comp-advance-daily')?.value) || 0;

    const pf = pfInput <= 30 ? Math.round(basicPD * days * pfInput / 100) : Math.round(pfInput);
    const esic = esicInput <= 10 ? Math.round(gross * esicInput / 100) : Math.round(esicInput);
    employeeDeductions = pf + esic + pt + lic + advance;

    const erPfInput = Number(document.getElementById('comp-er-pf-daily')?.value) || 0;
    const erEsicInput = Number(document.getElementById('comp-er-esic-daily')?.value) || 0;
    const erPf = erPfInput <= 30 ? Math.round(basicPD * days * erPfInput / 100) : Math.round(erPfInput);
    const erEsic = erEsicInput <= 10 ? Math.round(gross * erEsicInput / 100) : Math.round(erEsicInput);
    employerContributions = erPf + erEsic;

    ctc = gross + employerContributions;

    breakdownParts = [
      basicPD ? `Basic/day: ₹${basicPD.toFixed(2)} × ${days}d` : '',
      pf ? `EE PF: ₹${pf.toLocaleString('en-IN')}` : '',
      esic ? `EE ESIC: ₹${esic.toLocaleString('en-IN')}` : '',
      pt ? `PT: ₹${pt.toLocaleString('en-IN')}` : '',
      erPf ? `ER PF: ₹${erPf.toLocaleString('en-IN')}` : ''
    ].filter(Boolean);
  }

  const net = Math.max(0, gross - employeeDeductions);
  const annualCtc = ctc * 12;
  const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  const grossEl = document.getElementById('preview-gross');
  const dedEl = document.getElementById('preview-deductions');
  const netEl = document.getElementById('preview-net');
  const ctcEl = document.getElementById('preview-ctc');
  const annualCtcEl = document.getElementById('preview-annual-ctc');
  const grossBadgeEl = document.getElementById('components-gross-badge');
  const breakEl = document.getElementById('preview-breakdown-text');

  if (grossEl) grossEl.textContent = fmt(gross);
  if (dedEl) dedEl.textContent = fmt(employeeDeductions);
  if (netEl) netEl.textContent = fmt(net);
  if (ctcEl) ctcEl.textContent = fmt(ctc);
  if (annualCtcEl) annualCtcEl.textContent = `Annual CTC: ₹${Math.round(annualCtc).toLocaleString('en-IN')} / Year`;
  if (grossBadgeEl) grossBadgeEl.textContent = `Gross: ${fmt(gross)}`;
  if (breakEl) breakEl.textContent = gross > 0
    ? `Gross: ${fmt(gross)}  |  EE Deductions: ${fmt(employeeDeductions)}  |  Net Pay: ${fmt(net)}  |  ER Contrib: ${fmt(employerContributions)}  |  Total CTC: ${fmt(ctc)}`
    : 'Enter Gross Salary or CTC above to see the live salary breakdown.';
}



