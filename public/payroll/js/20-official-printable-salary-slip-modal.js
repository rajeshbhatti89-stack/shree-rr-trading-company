// 20. Official Printable Salary Slip Modal
function viewSalarySlip(slipId) {
  const slip = allSalarySlips.find((s) => s.id === slipId);
  if (!slip) return;

  currentActiveSlip = slip;

  document.getElementById('slip-display-month').textContent = `PAY SLIP FOR ${slip.monthYear.toUpperCase()}`;
  document.getElementById('slip-val-empId').textContent = slip.empId || 'SRR';
  document.getElementById('slip-val-name').textContent = slip.userName || '-';
  document.getElementById('slip-val-father').textContent = slip.fatherName || '-';
  document.getElementById('slip-val-designation').textContent = slip.designation || '-';
  document.getElementById('slip-val-category').textContent = slip.category || 'Skilled';
  document.getElementById('slip-val-location').textContent = slip.location || 'ACC Chanda';

  document.getElementById('slip-val-dob').textContent = slip.dob || 'N/A';
  document.getElementById('slip-val-doj').textContent = slip.doj || 'N/A';
  document.getElementById('slip-val-uan').textContent = slip.uan || 'N/A';
  document.getElementById('slip-val-pf').textContent = slip.pfNo || 'N/A';
  document.getElementById('slip-val-esic').textContent = slip.esicNo || 'N/A';
  document.getElementById('slip-val-bank').textContent = `${slip.bankAccount || 'N/A'} (IFSC: ${slip.ifsc || 'N/A'})`;

  document.getElementById('slip-val-totalDays').textContent = slip.totalDays || 31;
  document.getElementById('slip-val-workedDays').textContent = slip.workedDays || 31;
  const phEl = document.getElementById('slip-val-publicHolidays');
  if (phEl) phEl.textContent = slip.publicHolidays !== undefined ? slip.publicHolidays : 0;
  document.getElementById('slip-val-mobile').textContent = slip.mobile ? `+91 ${slip.mobile}` : 'N/A';

  const basic = Number(slip.earnings?.basic || 0);
  const da = Number(slip.earnings?.da || 0);
  const hra = Number(slip.earnings?.hra || 0);
  const special = Number(slip.earnings?.specialAllowance || 0);
  const ot = Number(slip.earnings?.otWage !== undefined ? slip.earnings.otWage : (slip.otWage || 0));
  const gross = Number(slip.grossPay || 0);

  const fmt = (val) => `?${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  document.getElementById('slip-earn-basic').textContent = fmt(basic);
  document.getElementById('slip-earn-da').textContent = fmt(da);
  document.getElementById('slip-earn-hra').textContent = fmt(hra);
  document.getElementById('slip-earn-special').textContent = fmt(special);
  document.getElementById('slip-earn-ot').textContent = fmt(ot);
  document.getElementById('slip-calc-gross').textContent = fmt(gross);

  const pf = Number(slip.deductions?.pf || 0);
  const esic = Number(slip.deductions?.esic || 0);
  const pt = Number(slip.deductions?.pt !== undefined ? slip.deductions.pt : 200);
  const lic = Number(slip.deductions?.lic || 0);
  const adv = Number(slip.deductions?.advance || 0);
  const deductions = Number(slip.totalDeductions || 0);
  const net = Number(slip.netPay || 0);

  document.getElementById('slip-ded-pf').textContent = fmt(pf);
  document.getElementById('slip-ded-esic').textContent = fmt(esic);
  document.getElementById('slip-ded-pt').textContent = fmt(pt);
  document.getElementById('slip-ded-lic').textContent = fmt(lic);
  document.getElementById('slip-ded-advance').textContent = fmt(adv);
  document.getElementById('slip-calc-deductions').textContent = fmt(deductions);

  document.getElementById('slip-calc-net').textContent = fmt(net);
  document.getElementById('slip-val-networds').textContent = numberToWordsIndian(Math.round(net)) + ' Rupees Only';

  const modalWaBtn = document.getElementById('slip-whatsapp-btn');
  if (modalWaBtn) {
    modalWaBtn.onclick = () => sendSlipWhatsApp(slip.id);
  }

  openModal('modal-salary-slip');
}


