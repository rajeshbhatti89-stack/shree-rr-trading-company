// 16. 1-Click Excel Reports Exporters
function exportTomorrowScheduleExcel() {
  const tomorrowStr = getTomorrowDateString();
  const rows = document.querySelectorAll('#tomorrow-table-body tr');
  const excelData = [
    ['SHREE RR TRADING COMPANY - PLANT OPERATIONS & FLEET MANAGEMENT'],
    [`TOMORROW'S DUTY SHIFT & MACHINERY SCHEDULE (${tomorrowStr.toUpperCase()})`],
    ['Generated from Operations Portal: https://payroll.shreerrtradingcompany.com'],
    [],
    ['Sr. No', 'Employee ID', 'Operator / Worker Name', 'Role / Designation', 'Duty Shift (G/A/B/C)', 'Shift Timings', 'Assigned Machinery / Vehicle', 'Plant Site / Location', 'Shift In-Charge / Supervisor']
  ];

  rows.forEach((r, idx) => {
    const empId = r.getAttribute('data-empid') || '';
    const userName = r.getAttribute('data-username') || '';
    const designation = r.getAttribute('data-designation') || 'Operator';
    const shift = r.querySelector('.tom-shift-select')?.value || 'G Shift (08:30 AM - 05:30 PM)';
    const equipment = r.querySelector('.tom-vehicle-select')?.value || 'General Plant Duty';
    const site = r.querySelector('.tom-site-input')?.value || 'ACC Chanda Plant Site';
    const supervisor = r.querySelector('.tom-supervisor-input')?.value || 'Shift In-Charge (Plant Operations)';

    let shiftCode = 'G Shift';
    let timings = '08:30 AM - 05:30 PM';

    if (shift.includes('A Shift')) {
      shiftCode = 'A Shift';
      timings = '06:00 AM - 02:00 PM';
    } else if (shift.includes('B Shift')) {
      shiftCode = 'B Shift';
      timings = '02:00 PM - 10:00 PM';
    } else if (shift.includes('C Shift')) {
      shiftCode = 'C Shift';
      timings = '10:00 PM - 06:00 AM';
    } else if (shift.includes('WO') || shift.toLowerCase().includes('week')) {
      shiftCode = 'WO (Weekly Off)';
      timings = 'Weekly Off';
    } else if (shift.includes('PH') || shift.toLowerCase().includes('holiday')) {
      shiftCode = 'PH (Public Holiday)';
      timings = 'Public Holiday (Paid)';
    } else if (shift.toLowerCase().includes('leave')) {
      shiftCode = 'Leave (Approved)';
      timings = 'Approved Leave';
    } else if (shift.toLowerCase().includes('absent') || shift === 'AB') {
      shiftCode = 'Absent';
      timings = 'Absent / Off Duty';
    } else {
      shiftCode = 'G Shift';
      timings = '08:30 AM - 05:30 PM';
    }

    excelData.push([idx + 1, empId, userName, designation, shiftCode, timings, equipment, site, supervisor]);
  });

  const ws = XLSX.utils.aoa_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tomorrow Schedule');
  XLSX.writeFile(wb, `Shree_RR_Tomorrow_Shift_Schedule_${tomorrowStr}.xlsx`);
  showToast(`Downloaded 1-Click Excel: Tomorrow's Shift & Machine Schedule!`);
}

function exportMonthlyPayrollExcel() {
  const selectedMonth = document.getElementById('report-month-select')?.value || document.getElementById('payroll-month-select')?.value || 'August 2026';
  const monthSlips = allSalarySlips.filter((s) => s.monthYear === selectedMonth);

  if (monthSlips.length === 0) {
    showToast(`Please click "1-Click Generate All Slips" first before exporting payroll.`, 'error');
    return;
  }

  const excelData = [
    ['SHREE RR TRADING COMPANY - PLANT O&M & HEAVY FLEETS CONTRACTS'],
    [`COMPREHENSIVE MONTHLY SALARY STATEMENT FOR ${selectedMonth.toUpperCase()}`],
    ['Site: ACC Chanda Plant Site & Operations | Portal: https://payroll.shreerrtradingcompany.com'],
    [],
    [
      'Sr. No',
      'Emp ID',
      'Employee Name',
      'Father Name',
      'Designation / Rank',
      'Category',
      'Site Location',
      'Days in Month',
      'Payable Working Days',
      'Public Holidays (PH)',
      'Basic Salary (?)',
      'DA (?)',
      'HRA (?)',
      'Special Allowance (?)',
      'Bonus / Arrears (?)',
      'Overtime (OT) Wages (?)',
      'GROSS EARNINGS (?)',
      'PF (12%) (?)',
      'ESIC (?)',
      'PT (?)',
      'TOTAL DEDUCTIONS (?)',
      'NET TAKE HOME PAY (?)',
      'Bank Account No',
      'Bank IFSC',
      'UAN NO',
      'PF NO',
      'ESIC NO',
      'Mobile / WhatsApp'
    ]
  ];

  monthSlips.forEach((s, idx) => {
    excelData.push([
      idx + 1,
      s.empId,
      s.userName,
      s.fatherName || '',
      s.designation || 'Staff',
      s.category || 'Skilled',
      s.location || 'ACC Chanda',
      s.totalDays || 31,
      s.workedDays || 31,
      s.publicHolidays !== undefined ? s.publicHolidays : 0,
      Number(s.earnings?.basic || 0).toFixed(2),
      Number(s.earnings?.da || 0).toFixed(2),
      Number(s.earnings?.hra || 0).toFixed(2),
      Number(s.earnings?.specialAllowance || 0).toFixed(2),
      Number(s.earnings?.bonus || 0).toFixed(2),
      Number(s.earnings?.otWage !== undefined ? s.earnings.otWage : (s.otWage || 0)).toFixed(2),
      Number(s.grossPay || 0).toFixed(2),
      Number(s.deductions?.pf || 0).toFixed(2),
      Number(s.deductions?.esic || 0).toFixed(2),
      Number(s.deductions?.pt || 0).toFixed(2),
      Number(s.totalDeductions || 0).toFixed(2),
      Number(s.netPay || 0).toFixed(2),
      s.bankAccount || '',
      s.ifsc || '',
      s.uan || '',
      s.pfNo || '',
      s.esicNo || '',
      s.mobile || ''
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Payroll Master');
  XLSX.writeFile(wb, `Shree_RR_Monthly_Payroll_Master_${selectedMonth.replace(/\s+/g, '_')}.xlsx`);
  showToast(`Downloaded 1-Click Excel: Monthly Payroll Master (${monthSlips.length} employees)!`);
}

function exportBankDisbursalExcel() {
  const selectedMonth = document.getElementById('report-month-select')?.value || document.getElementById('payroll-month-select')?.value || 'August 2026';
  const monthSlips = allSalarySlips.filter((s) => s.monthYear === selectedMonth);

  if (monthSlips.length === 0) {
    showToast(`Please generate salary slips first before downloading bank disbursal file.`, 'error');
    return;
  }

  const excelData = [
    ['SHREE RR TRADING COMPANY - CORPORATE BANK SALARY DISBURSAL / NEFT UPLOAD FILE'],
    [`SALARY DISBURSAL FOR ${selectedMonth.toUpperCase()}`],
    ['Debit Account: SHREE RR TRADING COMPANY (Corporate Current A/C)'],
    [],
    [
      'Sr. No',
      'Beneficiary Name (As per Bank)',
      'Employee ID',
      'Bank Account Number',
      'IFSC Code',
      'Net Salary Amount (?)',
      'Payment Narration / Remarks',
      'Registered Mobile Number'
    ]
  ];

  let totalAmount = 0;

  monthSlips.forEach((s, idx) => {
    const netAmount = Number(s.netPay || 0);
    totalAmount += netAmount;
    excelData.push([
      idx + 1,
      s.userName,
      s.empId,
      s.bankAccount || 'On Record',
      s.ifsc || 'SBIN0006872',
      netAmount.toFixed(2),
      `Salary ${s.monthYear} Shree RR Trading`,
      s.mobile ? `+91 ${s.mobile}` : ''
    ]);
  });

  excelData.push([]);
  excelData.push(['', 'TOTAL DISBURSAL BATCH AMOUNT:', '', '', '', totalAmount.toFixed(2), `${monthSlips.length} Records Verified`, '']);

  const ws = XLSX.utils.aoa_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'NEFT Bank Deposit');
  XLSX.writeFile(wb, `Shree_RR_Bank_NEFT_Deposit_${selectedMonth.replace(/\s+/g, '_')}.xlsx`);
  showToast(`Downloaded 1-Click Bank NEFT Deposit File (Total: ?${totalAmount.toLocaleString('en-IN')})!`);
}

function populateReportsDefaults() {
  const repTomBtn = document.getElementById('btn-rep-tomorrow-excel');
  const repPayBtn = document.getElementById('btn-rep-payroll-excel');
  const repBankBtn = document.getElementById('btn-rep-bank-excel');
  const repMttrBtn = document.getElementById('btn-rep-mttr-excel');

  if (repTomBtn) repTomBtn.onclick = exportTomorrowScheduleExcel;
  if (repPayBtn) repPayBtn.onclick = exportMonthlyPayrollExcel;
  if (repBankBtn) repBankBtn.onclick = exportBankDisbursalExcel;
  if (repMttrBtn) repMttrBtn.onclick = exportFleetMTTRExcel;
}


