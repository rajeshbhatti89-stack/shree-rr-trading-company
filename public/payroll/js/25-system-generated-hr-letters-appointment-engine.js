// 25. SYSTEM-GENERATED HR LETTERS & APPOINTMENT ENGINE
function openAppointmentLetterModal(targetUserId) {
  if (!currentUser) return;
  const isSuper = currentUser.role === 'Super Admin';
  const isHO = currentUser.site && (currentUser.site === 'Headquarters / All Sites' || currentUser.site.toUpperCase() === 'HO');
  const perms = currentUser.permissions || {};
  if (!isSuper && !isHO && perms['hr.appointment_letter.generate'] !== true) {
    showToast('Unauthorized: You do not have permission to view or generate HR letters.', 'error');
    return;
  }

  const empSelect = document.getElementById('letter-select-emp');
  if (!empSelect) return;

  const validUsers = allUsers.filter((u) => u.role !== 'Super Admin');
  if (validUsers.length === 0) {
    showToast('No active employees found to generate letters.', 'error');
    return;
  }

  empSelect.innerHTML = validUsers
    .map((u) => `<option value="${u.id || u.empId}">${u.empId || 'SRR'} - ${escapeHtml(u.name)} (${escapeHtml(u.designation || u.rank || 'Staff')})</option>`)
    .join('');

  if (targetUserId) {
    const match = validUsers.find((u) => u.id === targetUserId || u.empId === targetUserId);
    if (match) empSelect.value = match.id || match.empId;
  }

  const issueDateEl = document.getElementById('letter-issue-date');
  if (issueDateEl && !issueDateEl.value) {
    issueDateEl.value = new Date().toISOString().split('T')[0];
  }

  handleLetterEmployeeChange();
  openModal('modal-appointment-letter');
}

function handleLetterEmployeeChange() {
  const empSelect = document.getElementById('letter-select-emp');
  const userId = empSelect ? empSelect.value : '';
  const user = allUsers.find((u) => u.id === userId || u.empId === userId) || allUsers.find((u) => u.role !== 'Super Admin') || allUsers[0];
  if (!user) return;

  const numPart = user.empId ? user.empId.replace(/[^0-9]/g, '') : '01';
  document.getElementById('letter-ref-no').value = `SRRTC/HR/ACC-PLANT/2026/${numPart.padStart(3, '0')}`;
  document.getElementById('letter-doj-input').value = user.doj || '01/01/2026';
  document.getElementById('letter-designation-input').value = user.designation || user.rank || 'Operator';
  
  const isDaily = (!user.ctc || Number(user.ctc) === 0) && !!user.basicPerDay;
  let ctcVal = 0;
  if (isDaily) {
    const bpd = Number(user.basicPerDay) || 0;
    const dapd = Number(user.salaryComponents?.daPerDay) || 0;
    const hrapd = Number(user.salaryComponents?.hraPerDay) || 0;
    ctcVal = Math.round((bpd + dapd + hrapd) * 26);
  } else {
    ctcVal = Number(user.ctc) || Number(user.baseSalary) || 35000;
  }
  document.getElementById('letter-ctc-input').value = ctcVal;
  document.getElementById('letter-site-input').value = user.site || user.location || 'ACC Chanda Plant Site & Operations, Chandrapur';

  // Update sidebar salary summary badge
  const badgeEl = document.getElementById('letter-wage-type-badge');
  const detailsEl = document.getElementById('letter-wage-details-text');
  if (badgeEl && detailsEl) {
    if (isDaily) {
      const bpd = Number(user.basicPerDay) || 0;
      const dapd = Number(user.salaryComponents?.daPerDay) || 0;
      const hrapd = Number(user.salaryComponents?.hraPerDay) || 0;
      const totalDaily = bpd + dapd + hrapd;
      badgeEl.textContent = 'Daily Wage Rate';
      badgeEl.style.background = '#2563EB';
      detailsEl.innerHTML = `Daily Rate: <strong>?${totalDaily.toFixed(2)}/day</strong> (Basic ?${bpd.toFixed(2)} + DA ?${dapd.toFixed(2)} + HRA ?${hrapd.toFixed(2)}) • ~?${ctcVal.toLocaleString('en-IN')}/mo (26d)`;
    } else {
      badgeEl.textContent = 'Fixed Monthly CTC';
      badgeEl.style.background = 'var(--logo-orange)';
      const sc = user.salaryComponents || {};
      if (sc.basic) {
        detailsEl.innerHTML = `Basic: ?${Number(sc.basic).toLocaleString('en-IN')} | HRA: ?${Number(sc.hra || 0).toLocaleString('en-IN')} | Special: ?${Number(sc.specialAllowance || 0).toLocaleString('en-IN')}`;
      } else {
        detailsEl.innerHTML = `Standard Split: Basic 50%, HRA 20%, Special 30%`;
      }
    }
  }

  updateLetterTemplate();
}

function updateLetterTemplate() {
  const empSelect = document.getElementById('letter-select-emp');
  const userId = empSelect ? empSelect.value : '';
  const user = allUsers.find((u) => u.id === userId || u.empId === userId) || allUsers.find((u) => u.role !== 'Super Admin') || allUsers[0];
  if (!user) return;

  const letterType = document.getElementById('letter-type-select')?.value || 'appointment';
  const refNo = document.getElementById('letter-ref-no')?.value || `SRRTC/HR/ACC-PLANT/2026/014`;
  const issueDateRaw = document.getElementById('letter-issue-date')?.value || new Date().toISOString().split('T')[0];
  const doj = document.getElementById('letter-doj-input')?.value || user.doj || '01/01/2026';
  const probation = document.getElementById('letter-probation-input')?.value || '3 Months';
  const designation = document.getElementById('letter-designation-input')?.value || user.designation || user.rank || 'Staff';
  const ctcInput = Number(document.getElementById('letter-ctc-input')?.value || user.ctc || user.baseSalary || 35000);
  const site = document.getElementById('letter-site-input')?.value || user.site || user.location || 'ACC Chanda Plant Site & Operations, Chandrapur';
  const notice = document.getElementById('letter-notice-input')?.value || '30 Days';
  const sigName = document.getElementById('letter-signatory-name')?.value || 'Managing Director / Authorized Signatory';
  const sigTitle = document.getElementById('letter-signatory-title')?.value || 'Shree RR Trading Company';
  const customNote = document.getElementById('letter-custom-note')?.value?.trim() || '';

  const isDaily = (!user.ctc || Number(user.ctc) === 0) && !!user.basicPerDay;

  // Format Date (e.g. 04 September 2026)
  const dateObj = new Date(issueDateRaw);
  const formattedDate = isNaN(dateObj.getTime())
    ? issueDateRaw
    : dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  // Update Headers & Recipient Particulars
  document.getElementById('view-letter-ref').textContent = refNo;
  document.getElementById('view-letter-date').textContent = formattedDate;
  document.getElementById('view-letter-emp-name').textContent = `MR. ${user.name.toUpperCase()}`;
  document.getElementById('view-letter-father').textContent = user.fatherName || 'On Record';
  document.getElementById('view-letter-empid').textContent = user.empId || 'SRR';
  document.getElementById('view-letter-desig').textContent = designation;
  document.getElementById('view-letter-site').textContent = site;
  document.getElementById('view-letter-mobile').textContent = user.mobile ? `+91 ${user.mobile}` : '+91 7416008100';
  document.getElementById('view-letter-category').textContent = user.category || 'Skilled Plant Operations Staff';

  document.getElementById('view-letter-acc-name').textContent = user.name.toUpperCase();
  document.getElementById('view-letter-acc-mobile').textContent = user.mobile ? `+91 ${user.mobile}` : 'On Record';
  document.getElementById('view-letter-sig-name').textContent = sigName;
  document.getElementById('view-letter-sig-title').textContent = sigTitle;

  const acceptanceBox = document.getElementById('view-letter-acceptance-slip');
  const subjectEl = document.getElementById('view-letter-subject');
  const bodyEl = document.getElementById('view-letter-body-content');

  let salaryTableHtml = '';
  let remunerationClauseText = '';
  let offerPackageText = '';
  let incrementClauseText = '';

  if (isDaily) {
    // ──────── DAILY WAGE REMUNERATION STRUCTURE ────────
    const bpd = Number(user.basicPerDay) || 0;
    const dapd = Number(user.salaryComponents?.daPerDay) || 0;
    const hrapd = Number(user.salaryComponents?.hraPerDay) || 0;
    const dailyTotal = bpd + dapd + hrapd;
    const days = 26; // Standard statutory working days benchmark in plant operations
    const grossMonth = Math.round(dailyTotal * days);
    const dr = user.deductionRates || {};

    const rawPf = dr.pfVal !== undefined ? dr.pfVal : (dr.pfPct !== undefined ? dr.pfPct : 12);
    const pf = dr.pfAmount || (rawPf > 30 ? rawPf : Math.round(bpd * days * rawPf / 100));
    const pfLabel = rawPf > 30 ? 'Fixed ?' : `${rawPf}% of Basic`;

    const rawEsic = dr.esicVal !== undefined ? dr.esicVal : (dr.esicPct !== undefined ? dr.esicPct : 0.75);
    const esic = dr.esicAmount || (rawEsic > 10 ? rawEsic : Math.round(grossMonth * rawEsic / 100));
    const esicLabel = rawEsic > 10 ? 'Fixed ?' : `${rawEsic}% of Gross`;

    const pt = dr.pt !== undefined ? Number(dr.pt) : 200;
    const lic = Number(dr.lic) || 0;
    const advance = Number(dr.advance) || 0;
    const totalDed = pf + esic + pt + lic + advance;
    const netTakeHome = Math.max(0, grossMonth - totalDed);

    remunerationClauseText = `You are appointed under the <strong>Daily Wage System</strong> at a wage rate of <strong>?${dailyTotal.toFixed(2)} per working day</strong> (representing an estimated 26-day monthly remuneration benchmark of <strong>?${grossMonth.toLocaleString('en-IN')}</strong>). Statutory EPF, ESIC, and PT shall be deducted as per applicable regulations. Detailed wage structure attached in <strong>Annexure-A</strong>.`;
    offerPackageText = `<strong>• Daily Wage Rate:</strong> ?${dailyTotal.toFixed(2)} / Day (Estimated 26-day monthly gross benchmark: ?${grossMonth.toLocaleString('en-IN')}) — Detailed Annexure-A attached below`;
    incrementClauseText = `Effective from <strong>${escapeHtml(doj)}</strong>, your revised Daily Wage Rate will be <strong>?${dailyTotal.toFixed(2)} per working day</strong> (Estimated 26-day monthly remuneration benchmark: <strong>?${grossMonth.toLocaleString('en-IN')}</strong>).`;

    salaryTableHtml = `
      <div style="margin: 6px 0;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 3px;">
          <div style="font-weight: 800; font-size: 10px; color: #0B1936; text-transform: uppercase; letter-spacing: 0.02em;">
            Annexure-A: Daily Wage Structure &amp; Compensation Breakup
          </div>
          <span style="font-size: 9px; font-weight: 700; color: #2563EB; background: #EFF6FF; border: 1px solid #BFDBFE; padding: 1px 6px; border-radius: 3px;">
            Daily Wage System (26 Days Benchmark)
          </span>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; margin-bottom: 4px; border: 1px solid #CBD5E1;">
          <thead>
            <tr style="background: #FFF5EE; border-bottom: 1.5px solid #FF6B00; text-align: left;">
              <th style="padding: 3.5px 6px; border-right: 1px solid #E2E8F0;">Component / Allowance</th>
              <th style="padding: 3.5px 6px; border-right: 1px solid #E2E8F0; text-align: right;">Rate (? / Day)</th>
              <th style="padding: 3.5px 6px; border-right: 1px solid #E2E8F0; text-align: right;">Monthly (26 Days)</th>
              <th style="padding: 3.5px 6px; border-right: 1px solid #E2E8F0;">Statutory Deductions</th>
              <th style="padding: 3.5px 6px; text-align: right;">Deduction (? / Mo)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0;">Basic Wage</td>
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0; text-align: right; font-weight: 600;">?${bpd.toFixed(2)}</td>
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0; text-align: right; font-weight: 600;">?${Math.round(bpd * days).toLocaleString('en-IN')}</td>
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0;">Provident Fund (PF @ ${pfLabel})</td>
              <td style="padding: 2.5px 6px; text-align: right; color: #DC2626;">?${pf.toLocaleString('en-IN')}</td>
            </tr>
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0;">Dearness Allowance (DA)</td>
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0; text-align: right; font-weight: 600;">?${dapd.toFixed(2)}</td>
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0; text-align: right; font-weight: 600;">?${Math.round(dapd * days).toLocaleString('en-IN')}</td>
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0;">ESIC Contribution (${esicLabel})</td>
              <td style="padding: 2.5px 6px; text-align: right; color: #DC2626;">?${esic.toLocaleString('en-IN')}</td>
            </tr>
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0;">House Rent Allowance (HRA)</td>
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0; text-align: right; font-weight: 600;">?${hrapd.toFixed(2)}</td>
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0; text-align: right; font-weight: 600;">?${Math.round(hrapd * days).toLocaleString('en-IN')}</td>
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0;">Professional Tax (PT)</td>
              <td style="padding: 2.5px 6px; text-align: right; color: #DC2626;">?${pt.toLocaleString('en-IN')}</td>
            </tr>
            <tr style="border-bottom: 1px solid #CBD5E1; background: #FAFAFA;">
              <td style="padding: 3px 6px; border-right: 1px solid #E2E8F0; font-weight: 700;">TOTAL DAILY WAGE RATE</td>
              <td style="padding: 3px 6px; border-right: 1px solid #E2E8F0; text-align: right; font-weight: 800; color: #FF6B00;">?${dailyTotal.toFixed(2)} / Day</td>
              <td style="padding: 3px 6px; border-right: 1px solid #E2E8F0; text-align: right; font-weight: 800; color: #0B1936;">?${grossMonth.toLocaleString('en-IN')}</td>
              <td style="padding: 3px 6px; border-right: 1px solid #E2E8F0; font-weight: 700;">Total Deductions</td>
              <td style="padding: 3px 6px; text-align: right; font-weight: 700; color: #DC2626;">?${totalDed.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr style="background: #F8FAFC; font-weight: 800; border-top: 1.5px solid #0B1936;">
              <td colspan="2" style="padding: 3.5px 6px; border-right: 1px solid #E2E8F0; color: #0B1936;">GROSS ESTIMATED (26 DAYS)</td>
              <td style="padding: 3.5px 6px; border-right: 1px solid #E2E8F0; text-align: right; color: #FF6B00; font-size: 10px;">?${grossMonth.toLocaleString('en-IN')}</td>
              <td style="padding: 3.5px 6px; border-right: 1px solid #E2E8F0; color: #0B1936;">NET ESTIMATED TAKE HOME PAY</td>
              <td style="padding: 3.5px 6px; text-align: right; color: #059669; font-size: 10px;">?${netTakeHome.toLocaleString('en-IN')} / Mo</td>
            </tr>
          </tfoot>
        </table>
        <div style="font-size: 8.5px; color: #64748B; margin-top: 2px;">
          * Daily wage payments are calculated on actual attendance muster roll. 26 payable days per month considered as standard industrial benchmark calculation.
        </div>
      </div>
    `;
  } else {
    // ──────── FIXED MONTHLY CTC SALARY STRUCTURE ────────
    const sc = user.salaryComponents || {};
    const dr = user.deductionRates || {};
    const ec = user.employerContributions || {};

    let basic = 0, da = 0, hra = 0, special = 0, bonus = 0, other = 0;
    let gross = 0;

    if (sc.basic && Number(sc.basic) > 0) {
      basic = Number(sc.basic);
      da = Number(sc.da || 0);
      hra = Number(sc.hra || 0);
      special = Number(sc.specialAllowance || 0);
      bonus = Number(sc.bonus || 0);
      other = Number(sc.otherEarnings || 0);
      gross = basic + da + hra + special + bonus + other;
    } else {
      const targetCtc = ctcInput || Number(user.ctc) || Number(user.baseSalary) || 35000;
      gross = Math.round(targetCtc / 1.06);
      basic = Math.round(gross * 0.50);
      da = 0;
      hra = Math.round(gross * 0.20);
      special = Math.max(0, gross - basic - da - hra);
    }
    if (user.grossSalary && !sc.basic) {
      gross = Number(user.grossSalary);
    }

    // Employee Deductions
    const rawPf = dr.pfVal !== undefined ? dr.pfVal : (dr.pfPct !== undefined ? dr.pfPct : 12);
    const pf = dr.pfAmount || (rawPf > 30 ? rawPf : Math.round(basic * rawPf / 100));
    const pfLabel = rawPf > 30 ? 'Fixed ?' : `${rawPf}%`;

    const rawEsic = dr.esicVal !== undefined ? dr.esicVal : (dr.esicPct !== undefined ? dr.esicPct : (gross <= 21000 ? 0.75 : 0));
    const esic = dr.esicAmount || (rawEsic > 10 ? rawEsic : Math.round(gross * rawEsic / 100));
    const esicLabel = rawEsic > 10 ? 'Fixed ?' : (rawEsic > 0 ? `${rawEsic}%` : 'Exempt');

    const pt = dr.pt !== undefined ? Number(dr.pt) : (gross >= 10000 ? 200 : 0);
    const lic = Number(dr.lic) || 0;
    const advance = Number(dr.advance) || 0;
    const tds = Number(dr.tds) || 0;
    const totalEmployeeDed = pf + esic + pt + lic + advance + tds;
    const netTakeHome = Math.max(0, gross - totalEmployeeDed);

    // Employer Contributions
    const rawErPf = ec.pfVal !== undefined ? ec.pfVal : 12;
    const erPf = ec.pfAmount || (rawErPf > 30 ? rawErPf : Math.round(basic * rawErPf / 100));
    const erPfLabel = rawErPf > 30 ? 'Fixed ?' : `${rawErPf}%`;

    const rawErEsic = ec.esicVal !== undefined ? ec.esicVal : (gross <= 21000 ? 3.25 : 0);
    const erEsic = ec.esicAmount || (rawErEsic > 10 ? rawErEsic : Math.round(gross * rawErEsic / 100));
    const erEsicLabel = rawErEsic > 10 ? 'Fixed ?' : (rawErEsic > 0 ? `${rawErEsic}%` : 'Exempt');

    const erGratuity = Number(ec.gratuity) || 0;
    const totalEmployerContrib = erPf + erEsic + erGratuity;

    const monthlyCtc = gross + totalEmployerContrib;
    const annualCtc = monthlyCtc * 12;
    const annualGross = gross * 12;
    const annualNet = netTakeHome * 12;

    remunerationClauseText = `Monthly Gross Salary will be <strong>?${gross.toLocaleString('en-IN')}</strong>, and Total Cost to Company (CTC) will be <strong>?${monthlyCtc.toLocaleString('en-IN')} per month</strong> (${numberToWordsIndian(monthlyCtc)} Rupees per month, Annual CTC ?${annualCtc.toLocaleString('en-IN')}). Detailed earnings, employee deductions, and employer statutory contributions are set out in <strong>Annexure-A</strong>.`;
    offerPackageText = `<strong>• Monthly Gross Salary:</strong> ?${gross.toLocaleString('en-IN')} / Mo | <strong>Total Monthly CTC:</strong> ?${monthlyCtc.toLocaleString('en-IN')} / Mo (Annual CTC: ?${annualCtc.toLocaleString('en-IN')}) — Detailed Annexure-A attached below`;
    incrementClauseText = `Effective from <strong>${escapeHtml(doj)}</strong>, your revised Monthly Gross Salary will be <strong>?${gross.toLocaleString('en-IN')}</strong> and Total Monthly CTC will be <strong>?${monthlyCtc.toLocaleString('en-IN')}</strong> (Annual CTC ?${annualCtc.toLocaleString('en-IN')}).`;

    salaryTableHtml = `
      <div style="margin: 6px 0;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 3px;">
          <div style="font-weight: 800; font-size: 10px; color: #0B1936; text-transform: uppercase; letter-spacing: 0.02em;">
            Annexure-A: Comprehensive Salary &amp; CTC Architecture
          </div>
          <span style="font-size: 9px; font-weight: 700; color: #C2410C; background: #FFF7ED; border: 1px solid #FFEDD5; padding: 1px 6px; border-radius: 3px;">
            Gross vs CTC Compliant Structure
          </span>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; margin-bottom: 4px; border: 1px solid #CBD5E1;">
          <thead>
            <tr style="background: #FFF5EE; border-bottom: 1.5px solid #FF6B00; text-align: left;">
              <th style="padding: 3.5px 6px; border-right: 1px solid #E2E8F0;">Salary Components &amp; Contributions</th>
              <th style="padding: 3.5px 6px; border-right: 1px solid #E2E8F0; text-align: right;">Monthly (?)</th>
              <th style="padding: 3.5px 6px; text-align: right;">Annual (?)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background: #F8FAFC; border-bottom: 1px solid #E2E8F0;">
              <td colspan="3" style="padding: 3px 6px; font-weight: 800; color: #1E3A8A; font-size: 9px; text-transform: uppercase;">
                (A) Monthly Earnings / Allowances (Gross Salary)
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0;">Basic Salary</td>
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0; text-align: right; font-weight: 600;">?${basic.toLocaleString('en-IN')}</td>
              <td style="padding: 2.5px 6px; text-align: right; color: #475569;">?${(basic * 12).toLocaleString('en-IN')}</td>
            </tr>
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0;">Dearness Allowance (DA)</td>
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0; text-align: right; font-weight: 600;">?${da.toLocaleString('en-IN')}</td>
              <td style="padding: 2.5px 6px; text-align: right; color: #475569;">?${(da * 12).toLocaleString('en-IN')}</td>
            </tr>
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0;">House Rent Allowance (HRA)</td>
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0; text-align: right; font-weight: 600;">?${hra.toLocaleString('en-IN')}</td>
              <td style="padding: 2.5px 6px; text-align: right; color: #475569;">?${(hra * 12).toLocaleString('en-IN')}</td>
            </tr>
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0;">Special / Plant Allowance</td>
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0; text-align: right; font-weight: 600;">?${special.toLocaleString('en-IN')}</td>
              <td style="padding: 2.5px 6px; text-align: right; color: #475569;">?${(special * 12).toLocaleString('en-IN')}</td>
            </tr>
            ${(bonus > 0 || other > 0) ? `
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0;">Bonus / Other Earnings</td>
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0; text-align: right; font-weight: 600;">?${(bonus + other).toLocaleString('en-IN')}</td>
              <td style="padding: 2.5px 6px; text-align: right; color: #475569;">?${((bonus + other) * 12).toLocaleString('en-IN')}</td>
            </tr>` : ''}
            <tr style="background: #ECFDF5; border-bottom: 1px solid #A7F3D0; font-weight: 800;">
              <td style="padding: 3px 6px; border-right: 1px solid #E2E8F0; color: #065F46;">TOTAL MONTHLY GROSS SALARY (A)</td>
              <td style="padding: 3px 6px; border-right: 1px solid #E2E8F0; text-align: right; color: #065F46;">?${gross.toLocaleString('en-IN')}</td>
              <td style="padding: 3px 6px; text-align: right; color: #065F46;">?${annualGross.toLocaleString('en-IN')}</td>
            </tr>

            <tr style="background: #F8FAFC; border-bottom: 1px solid #E2E8F0; border-top: 1px solid #CBD5E1;">
              <td colspan="3" style="padding: 3px 6px; font-weight: 800; color: #1E3A8A; font-size: 9px; text-transform: uppercase;">
                (B) Employer Statutory Contributions (Paid by Company over Gross to form CTC)
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0;">Employer Provident Fund (PF @ ${erPfLabel})</td>
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0; text-align: right; color: #1E40AF; font-weight: 600;">?${erPf.toLocaleString('en-IN')}</td>
              <td style="padding: 2.5px 6px; text-align: right; color: #475569;">?${(erPf * 12).toLocaleString('en-IN')}</td>
            </tr>
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0;">Employer ESIC Contribution (${erEsicLabel})</td>
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0; text-align: right; color: #1E40AF; font-weight: 600;">?${erEsic.toLocaleString('en-IN')}</td>
              <td style="padding: 2.5px 6px; text-align: right; color: #475569;">?${(erEsic * 12).toLocaleString('en-IN')}</td>
            </tr>
            ${erGratuity > 0 ? `
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0;">Employer Gratuity / Insurance</td>
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0; text-align: right; color: #1E40AF; font-weight: 600;">?${erGratuity.toLocaleString('en-IN')}</td>
              <td style="padding: 2.5px 6px; text-align: right; color: #475569;">?${(erGratuity * 12).toLocaleString('en-IN')}</td>
            </tr>` : ''}
            <tr style="background: #EFF6FF; border-bottom: 1.5px solid #BFDBFE; font-weight: 800;">
              <td style="padding: 3px 6px; border-right: 1px solid #E2E8F0; color: #1E40AF;">TOTAL EMPLOYER CONTRIBUTIONS (B)</td>
              <td style="padding: 3px 6px; border-right: 1px solid #E2E8F0; text-align: right; color: #1E40AF;">?${totalEmployerContrib.toLocaleString('en-IN')}</td>
              <td style="padding: 3px 6px; text-align: right; color: #1E40AF;">?${(totalEmployerContrib * 12).toLocaleString('en-IN')}</td>
            </tr>

            <tr style="background: #FFF7ED; border-top: 1.5px solid #FF6B00; border-bottom: 1.5px solid #FF6B00; font-weight: 900;">
              <td style="padding: 4px 6px; border-right: 1px solid #E2E8F0; color: #C2410C; font-size: 10px;">TOTAL COST TO COMPANY — CTC (A + B)</td>
              <td style="padding: 4px 6px; border-right: 1px solid #E2E8F0; text-align: right; color: #C2410C; font-size: 10.5px;">?${monthlyCtc.toLocaleString('en-IN')}</td>
              <td style="padding: 4px 6px; text-align: right; color: #C2410C; font-size: 10.5px;">?${annualCtc.toLocaleString('en-IN')}</td>
            </tr>

            <tr style="background: #F8FAFC; border-bottom: 1px solid #E2E8F0; border-top: 1px solid #CBD5E1;">
              <td colspan="3" style="padding: 3px 6px; font-weight: 800; color: #991B1B; font-size: 9px; text-transform: uppercase;">
                (C) Employee Deductions (Deducted from Monthly Gross to derive Take-Home)
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0;">Employee PF Contribution (@ ${pfLabel})</td>
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0; text-align: right; color: #DC2626;">?${pf.toLocaleString('en-IN')}</td>
              <td style="padding: 2.5px 6px; text-align: right; color: #475569;">?${(pf * 12).toLocaleString('en-IN')}</td>
            </tr>
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0;">Employee ESIC Contribution (${esicLabel})</td>
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0; text-align: right; color: #DC2626;">?${esic.toLocaleString('en-IN')}</td>
              <td style="padding: 2.5px 6px; text-align: right; color: #475569;">?${(esic * 12).toLocaleString('en-IN')}</td>
            </tr>
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0;">Professional Tax (PT)</td>
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0; text-align: right; color: #DC2626;">?${pt.toLocaleString('en-IN')}</td>
              <td style="padding: 2.5px 6px; text-align: right; color: #475569;">?${(pt * 12).toLocaleString('en-IN')}</td>
            </tr>
            ${(lic + advance + tds) > 0 ? `
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0;">Other Statutory / TDS / Advance</td>
              <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0; text-align: right; color: #DC2626;">?${(lic + advance + tds).toLocaleString('en-IN')}</td>
              <td style="padding: 2.5px 6px; text-align: right; color: #475569;">?${((lic + advance + tds) * 12).toLocaleString('en-IN')}</td>
            </tr>` : ''}
            <tr style="background: #FEF2F2; border-bottom: 1px solid #FCA5A5; font-weight: 700;">
              <td style="padding: 3px 6px; border-right: 1px solid #E2E8F0; color: #991B1B;">TOTAL EMPLOYEE DEDUCTIONS (C)</td>
              <td style="padding: 3px 6px; border-right: 1px solid #E2E8F0; text-align: right; color: #DC2626;">?${totalEmployeeDed.toLocaleString('en-IN')}</td>
              <td style="padding: 3px 6px; text-align: right; color: #DC2626;">?${(totalEmployeeDed * 12).toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr style="background: #F0FDF4; font-weight: 900; border-top: 2px solid #059669;">
              <td style="padding: 4px 6px; border-right: 1px solid #E2E8F0; color: #065F46; font-size: 10.5px;">ESTIMATED NET TAKE HOME PAY (Gross - Deductions)</td>
              <td style="padding: 4px 6px; border-right: 1px solid #E2E8F0; text-align: right; color: #059669; font-size: 11px;">?${netTakeHome.toLocaleString('en-IN')} / Mo</td>
              <td style="padding: 4px 6px; text-align: right; color: #059669; font-size: 10.5px;">?${annualNet.toLocaleString('en-IN')} / Yr</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
  }

  if (letterType === 'appointment') {
    if (acceptanceBox) acceptanceBox.style.display = 'block';
    subjectEl.textContent = `SUBJECT: FORMAL LETTER OF APPOINTMENT AS ${designation.toUpperCase()} - PLANT OPERATIONS`;
    bodyEl.innerHTML = `
      <p style="margin-bottom: 5px;">Dear <strong>${escapeHtml(user.name)}</strong>,</p>
      <p style="margin-bottom: 5px;">
        With reference to your application, technical interview, and subsequent discussions, the management of <strong>Shree RR Trading Company</strong> is pleased to appoint you as <strong>${escapeHtml(designation)}</strong> in our Plant Fleet &amp; Operations Division on the following terms:
      </p>

      <div style="margin-bottom: 3.5px;"><strong>1. Date of Joining &amp; Site:</strong> Effective from <strong>${escapeHtml(doj)}</strong>. Posted at <strong>${escapeHtml(site)}</strong>. Transferable across company plant sites &amp; crushing units as operational requirements dictate.</div>

      <div style="margin-bottom: 3.5px;"><strong>2. Probation Period:</strong> Initial probation of <strong>${escapeHtml(probation)}</strong> from joining date. Confirmed in writing upon satisfactory performance.</div>

      <div style="margin-bottom: 3.5px;"><strong>3. Remuneration:</strong> ${remunerationClauseText}</div>

      ${salaryTableHtml}

      <div style="margin-bottom: 3.5px;"><strong>4. Plant Shifts:</strong> Roster covers 24/7 plant operations (G Shift: 08:30 AM – 05:30 PM, A Shift: 06:00 AM – 02:00 PM, B Shift: 02:00 PM – 10:00 PM, C Shift: 10:00 PM – 06:00 AM) as scheduled by Shift In-Charge.</div>

      <div style="margin-bottom: 3.5px;"><strong>5. Safety &amp; PPE:</strong> Mandatory wearing of prescribed Personal Protective Equipment (Helmet, Steel-Toe Shoes, High-Vis Vest). Zero-tolerance policy applies to plant safety violations.</div>

      <div style="margin-bottom: 3.5px;"><strong>6. Notice Period:</strong> Either party may terminate employment by giving <strong>${escapeHtml(notice)}</strong> prior notice in writing or payment in lieu thereof.</div>

      <div style="margin-bottom: 3.5px;"><strong>7. Confidentiality:</strong> You shall strictly protect operational data, equipment logs, production statistics, and affairs of company and client entities (Ambuja / ACC).</div>

      ${customNote ? `<div style="background: #FFFBEB; border: 1px solid #FCD34D; border-radius: 4px; padding: 4px 8px; margin-top: 4px; color: #92400E; font-size: 10px;"><strong>Special Terms:</strong> ${escapeHtml(customNote)}</div>` : ''}

      <p style="margin-top: 6px; margin-bottom: 0;">
        Please sign and return the duplicate acknowledgment copy below as acceptance of these terms. We welcome you to Shree RR Trading Company.
      </p>
    `;
  } else if (letterType === 'offer') {
    if (acceptanceBox) acceptanceBox.style.display = 'block';
    subjectEl.textContent = `SUBJECT: OFFER OF EMPLOYMENT FOR THE POSITION OF ${designation.toUpperCase()}`;
    bodyEl.innerHTML = `
      <p style="margin-bottom: 6px;">Dear <strong>${escapeHtml(user.name)}</strong>,</p>
      <p style="margin-bottom: 6px;">
        We are pleased to offer you employment with <strong>Shree RR Trading Company</strong> as <strong>${escapeHtml(designation)}</strong> based at our <strong>${escapeHtml(site)}</strong>.
      </p>

      <div style="margin-bottom: 4px;"><strong>• Proposed Designation:</strong> ${escapeHtml(designation)}</div>
      <div style="margin-bottom: 4px;"><strong>• Plant Deployment Location:</strong> ${escapeHtml(site)}</div>
      <div style="margin-bottom: 4px;"><strong>• Expected Joining Date:</strong> ${escapeHtml(doj)}</div>
      <div style="margin-bottom: 4px;">${offerPackageText}</div>
      <div style="margin-bottom: 4px;"><strong>• Probationary Period:</strong> ${escapeHtml(probation)}</div>

      ${salaryTableHtml}

      <div style="margin-bottom: 6px;">
        <strong>Documents Required on Joining Day:</strong>
        <ol style="margin-left: 18px; margin-top: 2px; margin-bottom: 0; padding-left: 0;">
          <li>Original and self-attested copies of Aadhaar Card and PAN Card</li>
          <li>Bank Account Passbook / Cancelled Cheque (with IFSC)</li>
          <li>4 Passport Size Color Photographs &amp; Heavy Vehicle License (if applicable)</li>
        </ol>
      </div>

      ${customNote ? `<div style="background: #FFFBEB; border: 1px solid #FCD34D; border-radius: 4px; padding: 4px 8px; margin-top: 4px; color: #92400E; font-size: 10px;"><strong>Special Notes:</strong> ${escapeHtml(customNote)}</div>` : ''}

      <p style="margin-top: 6px; margin-bottom: 0;">
        Please confirm your acceptance of this offer by signing and returning the acknowledgment copy within 7 days.
      </p>
    `;
  } else if (letterType === 'experience') {
    if (acceptanceBox) acceptanceBox.style.display = 'none';
    subjectEl.textContent = `TO WHOMSOEVER IT MAY CONCERN`;
    bodyEl.innerHTML = `
      <p style="margin-bottom: 10px; font-size: 11.5px; line-height: 1.6;">
        This is to certify that <strong>Mr. ${escapeHtml(user.name)}</strong>, S/o <strong>${escapeHtml(user.fatherName || 'On Record')}</strong>, holding Employee ID <strong>${escapeHtml(user.empId)}</strong>, was employed with <strong>Shree RR Trading Company</strong> from <strong>${escapeHtml(doj)}</strong> to <strong>${formattedDate}</strong>.
      </p>

      <p style="margin-bottom: 8px; font-size: 11px; line-height: 1.6;">
        During his tenure with our organization, he served as <strong>${escapeHtml(designation)}</strong> deployed at <strong>${escapeHtml(site)}</strong>. His primary responsibilities included operation, maintenance, and precision upkeep of heavy earth moving machinery, tippers, excavators, and plant fleet equipment.
      </p>

      <p style="margin-bottom: 8px; font-size: 11px; line-height: 1.6;">
        He has consistently demonstrated strong technical proficiency, professional discipline, adherence to strict plant safety standards, and exemplary attendance records. His character and conduct during his employment were found to be excellent.
      </p>

      ${customNote ? `<p style="margin-bottom: 8px; font-size: 11px; line-height: 1.6;">${escapeHtml(customNote)}</p>` : ''}

      <p style="margin-top: 14px; font-size: 11px; line-height: 1.6;">
        We appreciate his valuable contributions to our plant operations and wish him all the very best in all his future career endeavors.
      </p>
    `;
  } else if (letterType === 'relieving') {
    if (acceptanceBox) acceptanceBox.style.display = 'none';
    subjectEl.textContent = `SUBJECT: RELIEVING ORDER & NO DUES CLEARANCE CERTIFICATE`;
    bodyEl.innerHTML = `
      <p style="margin-bottom: 8px;">Dear <strong>${escapeHtml(user.name)}</strong>,</p>
      <p style="margin-bottom: 8px; font-size: 11px; line-height: 1.6;">
        With reference to your resignation letter dated <strong>${formattedDate}</strong>, we hereby confirm that you are formally relieved from your duties and responsibilities as <strong>${escapeHtml(designation)}</strong> with <strong>Shree RR Trading Company</strong> at <strong>${escapeHtml(site)}</strong>, effective from the close of working hours on <strong>${formattedDate}</strong>.
      </p>

      <p style="margin-bottom: 8px; font-size: 11px; line-height: 1.6;">
        We confirm that all company assets, machine logsheets, tools, PPE, and identification badges in your custody have been satisfactorily handed over to site management. Your full and final salary settlement, accrued leave benefits, and statutory accounts have been processed as per company rules.
      </p>

      <p style="margin-bottom: 8px; font-size: 11px; line-height: 1.6;">
        We place on record our sincere appreciation for your valuable service and dedication during your tenure with us.
      </p>

      ${customNote ? `<p style="margin-bottom: 8px; font-size: 11px; line-height: 1.6;">${escapeHtml(customNote)}</p>` : ''}

      <p style="margin-top: 12px; font-size: 11px; line-height: 1.6;">
        We wish you the very best of success in all your future professional pursuits.
      </p>
    `;
  } else if (letterType === 'increment') {
    if (acceptanceBox) acceptanceBox.style.display = 'block';
    subjectEl.textContent = `SUBJECT: ANNUAL PERFORMANCE APPRAISAL & SALARY REVISION LETTER`;
    bodyEl.innerHTML = `
      <p style="margin-bottom: 8px;">Dear <strong>${escapeHtml(user.name)}</strong>,</p>
      <p style="margin-bottom: 8px; font-size: 11px; line-height: 1.5;">
        In recognition of your exceptional performance, machine uptime, dedication, and valuable contributions to the plant fleet operations at <strong>${escapeHtml(site)}</strong>, the management of <strong>Shree RR Trading Company</strong> is pleased to revise your monthly compensation package.
      </p>
      <p style="margin-bottom: 8px; font-size: 11px; line-height: 1.5;">
        ${incrementClauseText}
      </p>

      ${salaryTableHtml}

      <p style="margin-bottom: 8px; font-size: 11px; line-height: 1.5;">
        All other terms and conditions of your original appointment letter remain unchanged and in full effect. We look forward to your continued commitment, high standards of safety, and operational excellence in the coming year.
      </p>

      ${customNote ? `<div style="background: #FFFBEB; border: 1px solid #FCD34D; border-radius: 4px; padding: 4px 8px; margin-top: 6px; color: #92400E; font-size: 10px;"><strong>Special Commendation:</strong> ${escapeHtml(customNote)}</div>` : ''}

      <p style="margin-top: 8px; margin-bottom: 0;">
        Congratulations on your well-deserved salary revision!
      </p>
    `;
  }
}

async function downloadLetterPdf() {
  const empSelect = document.getElementById('letter-select-emp');
  const userId = empSelect ? empSelect.value : '';
  const user = allUsers.find((u) => u.id === userId || u.empId === userId) || allUsers[0];
  const letterType = document.getElementById('letter-type-select')?.value || 'appointment';

  const element = document.getElementById('printable-appointment-letter');
  if (!element) return;

  element.classList.add('pdf-strict-single-page');

  const opt = {
    margin: [4, 6, 4, 6],
    filename: `Shree_RR_${letterType.toUpperCase()}_Letter_${user ? user.empId : 'EMP'}_${user ? user.name.replace(/\s+/g, '_') : 'Letter'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false, scrollY: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  showToast(`Generating Strict 1-Page ${letterType} letter PDF for ${user ? user.name : 'Employee'}...`);

  try {
    if (typeof html2pdf !== 'undefined') {
      await html2pdf().set(opt).from(element).toPdf().get('pdf').then((pdf) => {
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = totalPages; i > 1; i--) {
          pdf.deletePage(i);
        }
      }).save();
      showToast(`Downloaded 1-Page Letter PDF: ${opt.filename}`);
    } else {
      window.print();
    }
  } finally {
    element.classList.remove('pdf-strict-single-page');
  }
}

function printAppointmentLetter() {
  const element = document.getElementById('printable-appointment-letter');
  if (element) {
    element.classList.add('pdf-strict-single-page');
  }
  window.print();
  setTimeout(() => {
    if (element) element.classList.remove('pdf-strict-single-page');
  }, 2000);
}

async function sendLetterWhatsApp() {
  const empSelect = document.getElementById('letter-select-emp');
  const userId = empSelect ? empSelect.value : '';
  const user = allUsers.find((u) => u.id === userId || u.empId === userId);
  if (!user) {
    showToast('Please select an employee first.', 'error');
    return;
  }

  const letterType = document.getElementById('letter-type-select')?.value || 'appointment';
  const letterTypeTitle = {
    appointment: 'Letter of Appointment',
    offer: 'Employment Offer Letter',
    experience: 'Work Experience Certificate',
    relieving: 'Relieving & Clearance Certificate',
    increment: 'Salary Revision & Appraisal Letter'
  }[letterType] || 'Official HR Letter';

  const refNo = document.getElementById('letter-ref-no')?.value || 'SRRTC/HR/2026/01';
  const designation = document.getElementById('letter-designation-input')?.value || user.designation || 'Staff';
  const site = document.getElementById('letter-site-input')?.value || user.site || 'ACC Chanda Plant Site';
  const ctc = Number(document.getElementById('letter-ctc-input')?.value || user.ctc || user.baseSalary || 35000);
  const doj = document.getElementById('letter-doj-input')?.value || user.doj || '01/01/2026';

  const element = document.getElementById('printable-appointment-letter');
  const filename = `Shree_RR_${letterType.toUpperCase()}_Letter_${user.empId}_${user.name.replace(/\s+/g, '_')}.pdf`;

  const msg = `*SHREE RR TRADING COMPANY*
*Official HR Letter - ${letterTypeTitle}*
━━━━━━━━━━━━━━━━━━━━
📄 *Ref. No:* ${refNo}
👤 *Employee:* ${user.name} (${user.empId})
🛠 *Designation:* ${designation}
📍 *Plant Site:* ${site}
📅 *Effective Date:* ${doj}
?? *Gross Monthly CTC:* ?${ctc.toLocaleString('en-IN')}

📎 _Official 1-Page HR Letter (${letterTypeTitle}) PDF document attached._
━━━━━━━━━━━━━━━━━━━━
_Verification Portal: https://payroll.shreerrtradingcompany.com_
_Developed & Powered by SrijanDev © 2026_`;

  await dispatchWhatsAppWithPdfAttachment({
    element,
    filename,
    mobile: user.mobile || user.phone,
    textMessage: msg,
    title: `HR Letter (${letterTypeTitle}) - ${user.name}`,
    recipientName: user.name
  });
}

// ==================== SALARY STRUCTURE CORRECTION ENGINE ====================
function openSalaryCorrectionModal(slipIdOrUserId) {
  const empSelect = document.getElementById('correction-select-emp');
  const monthSelect = document.getElementById('correction-select-month');

  // Populate employee dropdown
  if (empSelect) {
    const activeEmployees = allUsers.filter((u) => u.role !== 'Super Admin');
    empSelect.innerHTML = activeEmployees
      .map((u) => `<option value="${u.id || u.empId}">${escapeHtml(u.name)} (${u.empId}) - ${escapeHtml(u.designation || u.role || 'Staff')}</option>`)
      .join('');
  }

  let targetSlip = null;
  let targetUser = null;

  if (slipIdOrUserId) {
    targetSlip = allSalarySlips.find((s) => s.id === slipIdOrUserId);
    if (targetSlip) {
      targetUser = allUsers.find((u) => u.id === targetSlip.userId || u.empId === targetSlip.empId);
    } else {
      targetUser = allUsers.find((u) => u.id === slipIdOrUserId || u.empId === slipIdOrUserId);
      const selectedMonth = monthSelect ? monthSelect.value : (document.getElementById('payroll-month-select')?.value || 'August 2026');
      if (targetUser) {
        targetSlip = allSalarySlips.find((s) => (s.userId === targetUser.id || s.empId === targetUser.empId) && s.monthYear === selectedMonth);
      }
    }
  }

  if (!targetUser && allUsers.length > 0) {
    targetUser = allUsers.find((u) => u.role !== 'Super Admin') || allUsers[0];
  }

  if (targetUser && empSelect) {
    empSelect.value = targetUser.id || targetUser.empId;
  }

  if (targetSlip && monthSelect) {
    monthSelect.value = targetSlip.monthYear || 'August 2026';
  } else if (monthSelect) {
    const tableMonth = document.getElementById('payroll-month-select')?.value;
    monthSelect.value = tableMonth || 'August 2026';
  }

  loadCorrectionFormData(targetSlip, targetUser);
  openModal('modal-salary-correction');
}

function handleCorrectionEmployeeChange() {
  const empSelect = document.getElementById('correction-select-emp');
  const monthSelect = document.getElementById('correction-select-month');
  const selectedUserId = empSelect ? empSelect.value : '';
  const selectedMonth = monthSelect ? monthSelect.value : 'August 2026';

  const user = allUsers.find((u) => u.id === selectedUserId || u.empId === selectedUserId);
  const existingSlip = allSalarySlips.find((s) => (s.userId === selectedUserId || s.empId === (user ? user.empId : selectedUserId)) && s.monthYear === selectedMonth);

  loadCorrectionFormData(existingSlip, user);
}

function loadCorrectionFormData(slip, user) {
  const monthSelect = document.getElementById('correction-select-month');
  const selectedMonth = monthSelect ? monthSelect.value : 'August 2026';

  if (!user && slip) {
    user = allUsers.find((u) => u.id === slip.userId || u.empId === slip.empId);
  }

  // Update employee metadata quick card
  if (user) {
    const desigEl = document.getElementById('corr-meta-desig');
    const catEl = document.getElementById('corr-meta-cat');
    const siteEl = document.getElementById('corr-meta-site');
    const ctcEl = document.getElementById('corr-meta-ctc');
    const uanEl = document.getElementById('corr-meta-uan');
    const pfEl = document.getElementById('corr-meta-pf');
    const bankEl = document.getElementById('corr-meta-bank');

    if (desigEl) desigEl.textContent = user.designation || user.role || '-';
    if (catEl) catEl.textContent = user.category || 'Skilled';
    if (siteEl) siteEl.textContent = user.location || user.site || 'ACC Chanda';
    if (ctcEl) {
      if (user.ctc) ctcEl.textContent = `₹${Number(user.ctc).toLocaleString('en-IN')} / Mo`;
      else if (user.basicPerDay) ctcEl.textContent = `₹${Number(user.basicPerDay).toFixed(2)} / Day`;
      else ctcEl.textContent = `₹${Number(user.baseSalary || 25000).toLocaleString('en-IN')} / Mo`;
    }
    if (uanEl) uanEl.textContent = user.uan || 'N/A';
    if (pfEl) pfEl.textContent = user.pfNo || 'N/A';
    if (bankEl) bankEl.textContent = `${user.bankAccount || 'N/A'} (${user.ifsc || 'N/A'})`;
  }

  // Determine Days in Month
  const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  let dim = 31;
  if (selectedMonth) {
    const parts = selectedMonth.split(' ');
    const mIdx = monthNames.indexOf(parts[0].toLowerCase());
    const yr = parseInt(parts[1]) || 2026;
    if (mIdx !== -1) {
      dim = new Date(yr, mIdx + 1, 0).getDate();
    }
  }

  const slipIdEl = document.getElementById('correction-slip-id');
  if (slipIdEl) slipIdEl.value = slip ? slip.id : '';

  const totalDaysEl = document.getElementById('correction-total-days');
  if (totalDaysEl) totalDaysEl.value = slip ? (slip.totalDays || dim) : dim;

  const phEl = document.getElementById('correction-public-holidays');
  if (phEl) {
    phEl.value = slip ? (slip.publicHolidays !== undefined ? slip.publicHolidays : (user ? (user.publicHoliday || 0) : 0)) : (user ? (user.publicHoliday || 0) : 0);
  }

  const workedDaysEl = document.getElementById('correction-worked-days');
  if (workedDaysEl) {
    workedDaysEl.value = slip ? (slip.workedDays !== undefined ? slip.workedDays : (user ? (user.payableDays || dim) : dim)) : (user ? (user.payableDays || dim) : dim);
  }

  const resolvedOtWage = slip ? Number(slip.earnings?.otWage !== undefined ? slip.earnings.otWage : (slip.otWage || 0)) : 0;
  const resolvedOtHours = slip ? Number(slip.otHours || 0) : 0;

  const otHoursEl = document.getElementById('correction-ot-hours');
  if (otHoursEl) otHoursEl.value = resolvedOtHours;

  const otRateEl = document.getElementById('correction-ot-rate');
  if (otRateEl) {
    otRateEl.value = (resolvedOtHours > 0 && resolvedOtWage > 0) ? (resolvedOtWage / resolvedOtHours).toFixed(2) : 0;
  }

  if (slip) {
    document.getElementById('correction-earn-basic').value = Number(slip.earnings?.basic || 0).toFixed(2);
    document.getElementById('correction-earn-da').value = Number(slip.earnings?.da || 0).toFixed(2);
    document.getElementById('correction-earn-hra').value = Number(slip.earnings?.hra || 0).toFixed(2);
    document.getElementById('correction-earn-special').value = Number(slip.earnings?.specialAllowance || 0).toFixed(2);
    document.getElementById('correction-earn-bonus').value = Number(slip.earnings?.bonus || 0).toFixed(2);
    document.getElementById('correction-earn-ot').value = resolvedOtWage.toFixed(2);

    document.getElementById('correction-ded-pf').value = Number(slip.deductions?.pf || 0).toFixed(2);
    document.getElementById('correction-ded-esic').value = Number(slip.deductions?.esic || 0).toFixed(2);
    document.getElementById('correction-ded-pt').value = Number(slip.deductions?.pt !== undefined ? slip.deductions.pt : 200).toFixed(2);
    document.getElementById('correction-ded-advance').value = Number(slip.deductions?.advance || 0).toFixed(2);
    document.getElementById('correction-ded-lic').value = Number(slip.deductions?.lic || 0).toFixed(2);
    document.getElementById('correction-ded-tds').value = Number(slip.deductions?.tds || 0).toFixed(2);

    document.getElementById('correction-payment-status').value = slip.status || 'Paid';
    document.getElementById('correction-payment-date').value = slip.paymentDate || new Date().toISOString().split('T')[0];
    document.getElementById('correction-bank-account').value = slip.bankAccount || (user ? user.bankAccount : '');
    document.getElementById('correction-bank-ifsc').value = slip.ifsc || (user ? user.ifsc : '');
    document.getElementById('correction-remarks').value = slip.remarks || '';
  } else {
    // Fresh computation using standard formula
    recalculateCorrectionSlip(true);
    document.getElementById('correction-payment-status').value = 'Paid';
    document.getElementById('correction-payment-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('correction-bank-account').value = user ? (user.bankAccount || '') : '';
    document.getElementById('correction-bank-ifsc').value = user ? (user.ifsc || '') : '';
    document.getElementById('correction-remarks').value = `Generated default structure for ${selectedMonth}`;
  }

  recalculateCorrectionSlip(false);
}

function recalculateCorrectionSlip(useStandardFormula = false, isManualDaysInput = false) {
  const empSelect = document.getElementById('correction-select-emp');
  const userId = empSelect ? empSelect.value : '';
  const user = allUsers.find((u) => u.id === userId || u.empId === userId);

  const dim = Math.max(1, Number(document.getElementById('correction-total-days')?.value) || 31);
  const phDays = Math.max(0, Number(document.getElementById('correction-public-holidays')?.value) || 0);

  if (useStandardFormula && user && !isManualDaysInput) {
    const totalLeavesTaken = Number(user.leave || 0);
    const availableLeaveBalance = user.leaveBalance !== undefined ? Number(user.leaveBalance) : 10;
    const unpaidLeaves = Math.max(0, totalLeavesTaken - availableLeaveBalance);
    
    let computedPdays;
    if (user.presentDays !== undefined) {
      const paidLeaves = totalLeavesTaken - unpaidLeaves;
      computedPdays = Number(user.presentDays) + Number(user.weakOff || 0) + paidLeaves + phDays;
    } else {
      computedPdays = dim - unpaidLeaves;
    }
    computedPdays = Math.min(dim, computedPdays);
    const workedDaysInput = document.getElementById('correction-worked-days');
    if (workedDaysInput) workedDaysInput.value = computedPdays;
  }

  const workedDays = Math.max(0, Number(document.getElementById('correction-worked-days')?.value) || 0);
  const otHours = Math.max(0, Number(document.getElementById('correction-ot-hours')?.value) || 0);
  const otRate = Math.max(0, Number(document.getElementById('correction-ot-rate')?.value) || 0);

  // Preserve any currently typed/loaded OT wage
  let currentOt = Number(document.getElementById('correction-earn-ot')?.value) || 0;

  if ((useStandardFormula || isManualDaysInput) && user) {
    const ctc = Number(user.ctc);
    const bpd = Number(user.basicPerDay);

    let calcBasic = 0, calcDa = 0, calcHra = 0, calcSpecial = 0, calcGross = 0;
    let calcPf = 0, calcEsic = 0, calcPt = 200;

    let calcOtWage = currentOt;
    if (otHours > 0 && otRate > 0) {
      calcOtWage = Math.round(otHours * otRate * 100) / 100;
    }

    if (ctc && ctc > 0) {
      const basicPerDay = (ctc / 2) / dim;
      calcBasic = Math.round(basicPerDay * workedDays * 100) / 100;
      calcDa = 0;
      calcHra = Math.round(0.40 * calcBasic * 100) / 100;
      const pfEmployer = Math.round((calcBasic + calcDa) * 0.12 * 100) / 100;
      const ctcWorking = Math.round((ctc / dim) * workedDays * 100) / 100;
      calcGross = Math.round((ctcWorking - pfEmployer) * 100) / 100;
      calcSpecial = Math.round(Math.max(0, calcGross - (calcBasic + calcDa + calcHra)) * 100) / 100;
      calcPf = Math.round((calcBasic + calcDa) * 0.12 * 100) / 100;
      calcPt = calcGross > 0 ? 200 : 0;
      calcEsic = 0;
    } else {
      const bpdVal = bpd || 444.62;
      calcBasic = Math.round(bpdVal * workedDays * 100) / 100;
      calcDa = Math.round(289.38 * workedDays * 100) / 100;
      calcHra = Math.round(62.70 * workedDays * 100) / 100;
      calcSpecial = 0;
      calcGross = Math.round((calcBasic + calcDa + calcHra) * 100) / 100;
      calcPf = Math.round((calcBasic + calcDa) * 0.12 * 100) / 100;
      calcEsic = Math.round(calcGross * 0.0075 * 100) / 100;
      calcPt = calcGross > 0 ? 200 : 0;
    }

    document.getElementById('correction-earn-basic').value = calcBasic.toFixed(2);
    document.getElementById('correction-earn-da').value = calcDa.toFixed(2);
    document.getElementById('correction-earn-hra').value = calcHra.toFixed(2);
    document.getElementById('correction-earn-special').value = calcSpecial.toFixed(2);
    // STRICT RULE: Do not wipe out Overtime (OT) wage when recalculating statutory components
    document.getElementById('correction-earn-ot').value = calcOtWage.toFixed(2);

    document.getElementById('correction-ded-pf').value = calcPf.toFixed(2);
    document.getElementById('correction-ded-esic').value = calcEsic.toFixed(2);
    document.getElementById('correction-ded-pt').value = calcPt.toFixed(2);

    showToast(`⚡ Standard statutory formula calculated for ${user.name}! (Overtime & Components Preserved)`);
  } else if (otHours > 0 && otRate > 0) {
    const computedOt = Math.round(otHours * otRate * 100) / 100;
    const otInput = document.getElementById('correction-earn-ot');
    if (otInput && document.activeElement !== otInput) {
      otInput.value = computedOt.toFixed(2);
    }
  }

  const basic = Number(document.getElementById('correction-earn-basic')?.value) || 0;
  const da = Number(document.getElementById('correction-earn-da')?.value) || 0;
  const hra = Number(document.getElementById('correction-earn-hra')?.value) || 0;
  const special = Number(document.getElementById('correction-earn-special')?.value) || 0;
  const bonus = Number(document.getElementById('correction-earn-bonus')?.value) || 0;
  const ot = Number(document.getElementById('correction-earn-ot')?.value) || 0;

  const gross = Math.round((basic + da + hra + special + bonus + ot) * 100) / 100;

  const pf = Number(document.getElementById('correction-ded-pf')?.value) || 0;
  const esic = Number(document.getElementById('correction-ded-esic')?.value) || 0;
  const pt = Number(document.getElementById('correction-ded-pt')?.value) || 0;
  const adv = Number(document.getElementById('correction-ded-advance')?.value) || 0;
  const lic = Number(document.getElementById('correction-ded-lic')?.value) || 0;
  const tds = Number(document.getElementById('correction-ded-tds')?.value) || 0;

  const totalDeductions = Math.round((pf + esic + pt + adv + lic + tds) * 100) / 100;
  const netPay = Math.round((gross - totalDeductions) * 100) / 100;

  const grossDisp = document.getElementById('correction-gross-display');
  const dedDisp = document.getElementById('correction-deductions-display');
  const netDisp = document.getElementById('correction-net-display');
  const wordsDisp = document.getElementById('correction-net-words');

  if (grossDisp) grossDisp.textContent = `₹${gross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  if (dedDisp) dedDisp.textContent = `₹${totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  if (netDisp) netDisp.textContent = `₹${netPay.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  if (wordsDisp) wordsDisp.textContent = numberToWordsIndian(Math.max(0, Math.round(netPay))) + ' Rupees Only';
}

async function saveSalaryCorrection() {
  const saveBtn = document.getElementById('btn-save-salary-correction');
  const empSelect = document.getElementById('correction-select-emp');
  const monthSelect = document.getElementById('correction-select-month');

  const userId = empSelect ? empSelect.value : '';
  const monthYear = monthSelect ? monthSelect.value : 'August 2026';
  const user = allUsers.find((u) => u.id === userId || u.empId === userId);

  if (!user) {
    showToast('Please select a valid employee.', 'error');
    return;
  }

  const slipId = document.getElementById('correction-slip-id')?.value;
  const totalDays = Number(document.getElementById('correction-total-days')?.value) || 31;
  const publicHolidays = Number(document.getElementById('correction-public-holidays')?.value) || 0;
  const workedDays = Number(document.getElementById('correction-worked-days')?.value) || 31;
  const otHours = Number(document.getElementById('correction-ot-hours')?.value) || 0;
  const otWage = Number(document.getElementById('correction-earn-ot')?.value) || 0;

  const basic = Number(document.getElementById('correction-earn-basic')?.value) || 0;
  const da = Number(document.getElementById('correction-earn-da')?.value) || 0;
  const hra = Number(document.getElementById('correction-earn-hra')?.value) || 0;
  const specialAllowance = Number(document.getElementById('correction-earn-special')?.value) || 0;
  const bonus = Number(document.getElementById('correction-earn-bonus')?.value) || 0;

  const grossPay = Math.round((basic + da + hra + specialAllowance + bonus + otWage) * 100) / 100;

  const pf = Number(document.getElementById('correction-ded-pf')?.value) || 0;
  const esic = Number(document.getElementById('correction-ded-esic')?.value) || 0;
  const pt = Number(document.getElementById('correction-ded-pt')?.value) || 0;
  const advance = Number(document.getElementById('correction-ded-advance')?.value) || 0;
  const lic = Number(document.getElementById('correction-ded-lic')?.value) || 0;
  const tds = Number(document.getElementById('correction-ded-tds')?.value) || 0;

  const totalDeductions = Math.round((pf + esic + pt + advance + lic + tds) * 100) / 100;
  const netPay = Math.round((grossPay - totalDeductions) * 100) / 100;

  const status = document.getElementById('correction-payment-status')?.value || 'Paid';
  const paymentDate = document.getElementById('correction-payment-date')?.value || new Date().toISOString().split('T')[0];
  const bankAccount = document.getElementById('correction-bank-account')?.value.trim();
  const ifsc = document.getElementById('correction-bank-ifsc')?.value.trim();
  const remarks = document.getElementById('correction-remarks')?.value.trim();
  const updateMasterCtc = document.getElementById('correction-update-profile-ctc')?.checked || false;

  // STRICT RULE: Fixed Base Monthly CTC represents Basic + DA + HRA + Special Allowance only.
  // Overtime (otWage) and Bonus (bonus) are NEVER merged into fixed master CTC!
  const fixedBaseCtc = Math.round((basic + da + hra + specialAllowance) * 100) / 100;

  const payload = {
    id: slipId || undefined,
    userId: user.id,
    empId: user.empId,
    userName: user.name,
    monthYear,
    month: monthYear.split(' ')[0],
    year: monthYear.split(' ')[1] || '2026',
    designation: user.designation || user.rank || 'Staff',
    department: user.department || 'Plant Fleet & Garage O&M',
    fatherName: user.fatherName || '',
    dob: user.dob || '',
    doj: user.doj || '',
    uan: user.uan || '',
    esicNo: user.esicNo || '',
    pfNo: user.pfNo || '',
    bankAccount: bankAccount || user.bankAccount || '',
    ifsc: ifsc || user.ifsc || '',
    location: user.location || user.site || 'ACC Chanda',
    category: user.category || 'Skilled',
    mobile: user.mobile || user.phone || '',
    phone: user.phone || user.mobile || '',
    workedDays,
    totalDays,
    publicHolidays,
    otHours,
    otWage,
    earnings: { basic, da, hra, specialAllowance, bonus, otWage },
    deductions: { pf, esic, pt, advance, lic, tds },
    grossPay,
    totalDeductions,
    netPay,
    status,
    paymentDate,
    remarks: remarks || `Salary structure corrected for ${monthYear}`,
    isManuallyCorrected: true,
    manualLocked: true,
    updateUserBaseSalary: updateMasterCtc,
    newCtc: updateMasterCtc ? fixedBaseCtc : undefined
  };

  try {
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    }

    const res = await fetch('/api/payroll/salary-slips/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
      showToast(data.message || `Salary structure & payslip for ${user.name} saved successfully! (OT & Components Locked)`);

      // Update in-memory state
      if (Array.isArray(data.salarySlips) && data.salarySlips.length > 0) {
        allSalarySlips = data.salarySlips;
      } else if (data.slip) {
        const idx = allSalarySlips.findIndex((s) => s.id === data.slip.id || (s.empId === data.slip.empId && s.monthYear === data.slip.monthYear));
        if (idx >= 0) {
          allSalarySlips[idx] = data.slip;
        } else {
          allSalarySlips.unshift(data.slip);
        }
      }

      if (updateMasterCtc && user) {
        user.ctc = fixedBaseCtc;
        user.baseSalary = fixedBaseCtc;
      }
      if (bankAccount && user) user.bankAccount = bankAccount;
      if (ifsc && user) user.ifsc = ifsc;

      // Save to persistent LocalStorage
      saveSlipsToStorage(allSalarySlips);

      closeModal('modal-salary-correction');
      renderSalaryTable();
      updateDashboardMetrics();
    } else {
      showToast(data.message || 'Failed to save salary slip', 'error');
    }
  } catch (err) {
    console.error('Error saving salary correction:', err);
    // Offline local fallback with complete protection
    const localSlip = { ...payload, id: slipId || `slp-${user.empId.toLowerCase()}-${Date.now()}` };
    const idx = allSalarySlips.findIndex((s) => s.id === localSlip.id || (s.empId === localSlip.empId && s.monthYear === localSlip.monthYear));
    if (idx >= 0) allSalarySlips[idx] = localSlip;
    else allSalarySlips.unshift(localSlip);

    if (updateMasterCtc && user) {
      user.ctc = fixedBaseCtc;
      user.baseSalary = fixedBaseCtc;
    }
    if (bankAccount && user) user.bankAccount = bankAccount;
    if (ifsc && user) user.ifsc = ifsc;

    saveSlipsToStorage(allSalarySlips);

    closeModal('modal-salary-correction');
    renderSalaryTable();
    showToast(`⚡ Salary structure & OT locked locally for ${user.name}!`);
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save & Apply Corrections';
    }
  }
}

function previewCurrentCorrectionSlip() {
  const empSelect = document.getElementById('correction-select-emp');
  const monthSelect = document.getElementById('correction-select-month');
  const userId = empSelect ? empSelect.value : '';
  const monthYear = monthSelect ? monthSelect.value : 'August 2026';
  const user = allUsers.find((u) => u.id === userId || u.empId === userId);

  if (!user) {
    showToast('Please select an employee first.', 'error');
    return;
  }

  const totalDays = Number(document.getElementById('correction-total-days')?.value) || 31;
  const workedDays = Number(document.getElementById('correction-worked-days')?.value) || 31;
  const otHours = Number(document.getElementById('correction-ot-hours')?.value) || 0;
  const otWage = Number(document.getElementById('correction-earn-ot')?.value) || 0;

  const basic = Number(document.getElementById('correction-earn-basic')?.value) || 0;
  const da = Number(document.getElementById('correction-earn-da')?.value) || 0;
  const hra = Number(document.getElementById('correction-earn-hra')?.value) || 0;
  const specialAllowance = Number(document.getElementById('correction-earn-special')?.value) || 0;
  const bonus = Number(document.getElementById('correction-earn-bonus')?.value) || 0;

  const grossPay = Math.round((basic + da + hra + specialAllowance + bonus + otWage) * 100) / 100;

  const pf = Number(document.getElementById('correction-ded-pf')?.value) || 0;
  const esic = Number(document.getElementById('correction-ded-esic')?.value) || 0;
  const pt = Number(document.getElementById('correction-ded-pt')?.value) || 0;
  const advance = Number(document.getElementById('correction-ded-advance')?.value) || 0;
  const lic = Number(document.getElementById('correction-ded-lic')?.value) || 0;
  const tds = Number(document.getElementById('correction-ded-tds')?.value) || 0;

  const totalDeductions = Math.round((pf + esic + pt + advance + lic + tds) * 100) / 100;
  const netPay = Math.round((grossPay - totalDeductions) * 100) / 100;

  const tempSlip = {
    id: `temp-${Date.now()}`,
    userId: user.id,
    empId: user.empId,
    userName: user.name,
    monthYear,
    month: monthYear.split(' ')[0],
    year: monthYear.split(' ')[1] || '2026',
    designation: user.designation || user.rank || 'Staff',
    department: user.department || 'Plant Fleet & Garage O&M',
    fatherName: user.fatherName || '',
    dob: user.dob || '',
    doj: user.doj || '',
    uan: user.uan || '',
    esicNo: user.esicNo || '',
    pfNo: user.pfNo || '',
    bankAccount: document.getElementById('correction-bank-account')?.value || user.bankAccount || '',
    ifsc: document.getElementById('correction-bank-ifsc')?.value || user.ifsc || '',
    location: user.location || user.site || 'ACC Chanda',
    category: user.category || 'Skilled',
    mobile: user.mobile || user.phone || '',
    phone: user.phone || user.mobile || '',
    workedDays,
    totalDays,
    otHours,
    otWage,
    earnings: { basic, da, hra, specialAllowance, bonus, otWage },
    deductions: { pf, esic, pt, advance, lic, tds },
    grossPay,
    totalDeductions,
    netPay,
    status: document.getElementById('correction-payment-status')?.value || 'Paid',
    paymentDate: document.getElementById('correction-payment-date')?.value || new Date().toISOString().split('T')[0]
  };

  currentActiveSlip = tempSlip;
  viewSalarySlip(tempSlip.id);
}

// Global Window Bindings for Inline HTML Callbacks
window.openAppointmentLetterModal = openAppointmentLetterModal;
window.handleLetterEmployeeChange = handleLetterEmployeeChange;
window.updateLetterTemplate = updateLetterTemplate;
window.downloadLetterPdf = downloadLetterPdf;
window.printAppointmentLetter = printAppointmentLetter;
window.sendLetterWhatsApp = sendLetterWhatsApp;
window.downloadSlipPdf = downloadSlipPdf;
window.viewSalarySlip = viewSalarySlip;
window.sendSlipWhatsApp = sendSlipWhatsApp;
window.dispatchBulkWhatsApp = dispatchBulkWhatsApp;
window.openBulkWhatsAppModal = openBulkWhatsAppModal;
window.startAutomatedBulkWhatsAppDispatch = startAutomatedBulkWhatsAppDispatch;
window.togglePauseBulkWhatsApp = togglePauseBulkWhatsApp;
window.advanceNextBulkWhatsAppManual = advanceNextBulkWhatsAppManual;
window.stopBulkWhatsAppDispatch = stopBulkWhatsAppDispatch;
window.handleBulkDelayChange = handleBulkDelayChange;
window.sendSingleSlipFromBulkModal = sendSingleSlipFromBulkModal;
window.editBulkEmployeeMobile = editBulkEmployeeMobile;
window.saveInlineBulkMobile = saveInlineBulkMobile;

// Salary Structure Correction window bindings
window.openSalaryCorrectionModal = openSalaryCorrectionModal;
window.handleCorrectionEmployeeChange = handleCorrectionEmployeeChange;
window.recalculateCorrectionSlip = recalculateCorrectionSlip;
window.saveSalaryCorrection = saveSalaryCorrection;
window.previewCurrentCorrectionSlip = previewCurrentCorrectionSlip;

function exportMonthlyAttendanceExcel() {
  const selectedMonth = document.getElementById('glass-month-select')?.value || 'September 2026';
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [mName, yStr] = selectedMonth.split(' ');
  const year = parseInt(yStr) || 2026;
  let monthIndex = monthNames.findIndex((m) => m.toLowerCase() === (mName || '').toLowerCase());
  if (monthIndex === -1) monthIndex = 8;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const monthNumStr = String(monthIndex + 1).padStart(2, '0');

  const excludedLocations = ['ho', 'filter plant', 'shr letter', 'offer'];
  const workers = allUsers.filter((u) => {
    if (u.role === 'Super Admin') return false;
    const loc = (u.location || '').toLowerCase();
    const site = (u.site || '').toLowerCase();
    if (excludedLocations.some(ex => loc.includes(ex) || site.includes(ex))) return false;
    if (currentUser && currentUser.role !== 'Super Admin' && currentUser.site !== 'Headquarters / All Sites') {
      if (u.site !== currentUser.site && u.location !== currentUser.location) return false;
    }
    return true;
  });

  if (workers.length === 0) {
    showToast('No employees found to export.', 'error');
    return;
  }

  const excelData = [];
  excelData.push(['SHREE RR TRADING COMPANY - MONTHLY ATTENDANCE REPORT']);
  excelData.push([`Month: ${selectedMonth} | Generated On: ${new Date().toLocaleDateString()}`]);
  excelData.push([]);
  
  const header = ['Emp ID', 'Employee Name', 'Role', 'Designation', 'Total Days', 'Present (P)', 'Absent (A)', 'Leave (L)', 'Weekly Off (WO)', 'Holiday (PH)', 'Total Payable Days'];
  for (let d = 1; d <= daysInMonth; d++) {
    header.push(d.toString());
  }
  excelData.push(header);

  workers.forEach(u => {
    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;
    let woCount = 0;
    let phCount = 0;
    let hasAnyMusterRecords = false;

    const dayStatuses = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `${year}-${monthNumStr}-${dayStr}`;
      const dateObj = new Date(year, monthIndex, day);
      const isSunday = dateObj.getDay() === 0;

      const attRecord = (allAttendance || []).find(a => (a.userId === u.id || a.empId === u.empId) && a.date === dateStr);
      const leaveRecord = (allLeaves || []).find(lv => (lv.userId === u.id || lv.empId === u.empId) && lv.status === 'Approved' && lv.fromDate <= dateStr && lv.toDate >= dateStr);

      let statusStr = '';

      if (attRecord) {
        hasAnyMusterRecords = true;
        const status = attRecord.status;
        if (status === 'Half Day') { presentCount += 0.5; statusStr = 'HD'; }
        else if (status === 'Weekly Off') { woCount++; statusStr = 'WO'; }
        else if (status === 'Public Holiday' || status === 'Holiday') { phCount++; statusStr = 'PH'; }
        else if (status === 'Leave') { leaveCount++; statusStr = 'L'; }
        else if (status === 'Absent') { absentCount++; statusStr = 'A'; }
        else { presentCount++; statusStr = 'P'; }
      } else if (leaveRecord) {
        leaveCount++; statusStr = 'L';
      } else if (isSunday) {
        woCount++; statusStr = 'WO';
      } else {
        absentCount++; statusStr = 'A';
      }
      dayStatuses.push(statusStr);
    }
    
    let finalPresent = hasAnyMusterRecords ? presentCount : (Number(u.presentDays) || (daysInMonth - (Number(u.weakOff) || 4)));
    let finalWO = hasAnyMusterRecords ? woCount : (Number(u.weakOff) || 4);
    let finalPH = hasAnyMusterRecords ? phCount : (Number(u.publicHoliday) || 0);
    let finalLeave = leaveCount > 0 ? leaveCount : (Number(u.leave) || 0);
    let finalAbsent = hasAnyMusterRecords ? absentCount : 0;
    
    if (!hasAnyMusterRecords) {
      dayStatuses.fill('-');
    }

    const payableDays = finalPresent + finalWO + finalPH + finalLeave;

    const row = [
      u.empId,
      u.name,
      u.role || 'Worker',
      u.designation || u.rank || 'Staff',
      daysInMonth,
      finalPresent,
      finalAbsent,
      finalLeave,
      finalWO,
      finalPH,
      payableDays
    ];
    
    row.push(...dayStatuses);
    excelData.push(row);
  });

  const ws = XLSX.utils.aoa_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');
  XLSX.writeFile(wb, `Shree_RR_Attendance_Report_${selectedMonth.replace(/ /g, '_')}.xlsx`);
  showToast(`Downloaded Monthly Attendance Report for ${selectedMonth}!`);
}





