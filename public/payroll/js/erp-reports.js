/**
 * Shree RR Trading Company - Enterprise Operations, Fleet & Payroll Portal
 * Module: erp-reports.js
 * Verified 1-Click Excel Spreadsheets Exporters
 * (c) 2026 Shree RR Trading Company
 */

window.ERP = window.ERP || {};

ERP.reports = {
  // ==================== 1. MONTHLY PAYROLL STATEMENT EXCEL ====================
  exportMonthlyPayroll() {
    if (typeof XLSX === 'undefined') {
      ERP.toast('SheetJS Excel library not loaded.', 'error');
      return;
    }

    const selectedMonth = document.getElementById('report-month-select')?.value || ERP.state.selectedMonth || 'October 2026';
    let monthSlips = (ERP.state.data.salarySlips || []).filter(s => s.monthYear === selectedMonth);

    // Auto-generate slips on the fly if user clicks download before visiting payroll
    if (monthSlips.length === 0 && typeof ERP.payroll?.generateClientSalarySlips === 'function') {
      const newSlips = ERP.payroll.generateClientSalarySlips(selectedMonth);
      if (newSlips.length > 0) {
        ERP.state.data.salarySlips = [...(ERP.state.data.salarySlips || []), ...newSlips];
        window.allSalarySlips = ERP.state.data.salarySlips;
        monthSlips = newSlips;
      }
    }

    if (monthSlips.length === 0) {
      ERP.toast(`No salary records found for ${selectedMonth}.`, 'error');
      return;
    }

    const excelData = [
      ['SHREE RR TRADING COMPANY - PLANT OPERATIONS & HEAVY FLEETS CONTRACTS'],
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
        'Basic Salary (₹)',
        'DA (₹)',
        'HRA (₹)',
        'Special Allowance (₹)',
        'Bonus / Arrears (₹)',
        'Overtime (OT) Wages (₹)',
        'GROSS EARNINGS (₹)',
        'PF (12%) (₹)',
        'ESIC (₹)',
        'PT (₹)',
        'TOTAL DEDUCTIONS (₹)',
        'NET TAKE HOME PAY (₹)',
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
        s.category || 'Skilled Operations',
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
    XLSX.utils.book_append_sheet(wb, ws, 'Monthly Payroll');
    XLSX.writeFile(wb, `Shree_RR_Payroll_Statement_${selectedMonth.replace(/ /g, '_')}.xlsx`);
    ERP.toast(`Downloaded Excel: Monthly Payroll Statement for ${selectedMonth}!`, 'success');
  },

  // ==================== 2. BANK NEFT / RTGS DISBURSAL EXCEL ====================
  exportBankNeft() {
    if (typeof XLSX === 'undefined') {
      ERP.toast('SheetJS Excel library not loaded.', 'error');
      return;
    }

    const selectedMonth = document.getElementById('report-month-select')?.value || ERP.state.selectedMonth || 'October 2026';
    let monthSlips = (ERP.state.data.salarySlips || []).filter(s => s.monthYear === selectedMonth);

    if (monthSlips.length === 0 && typeof ERP.payroll?.generateClientSalarySlips === 'function') {
      const newSlips = ERP.payroll.generateClientSalarySlips(selectedMonth);
      if (newSlips.length > 0) {
        ERP.state.data.salarySlips = [...(ERP.state.data.salarySlips || []), ...newSlips];
        window.allSalarySlips = ERP.state.data.salarySlips;
        monthSlips = newSlips;
      }
    }

    if (monthSlips.length === 0) {
      ERP.toast(`No salary slips found for ${selectedMonth}.`, 'error');
      return;
    }

    const excelData = [
      ['SHREE RR TRADING COMPANY - CORPORATE BANK SALARY NEFT / RTGS BATCH DISBURSAL'],
      [`BATCH STATEMENT FOR ${selectedMonth.toUpperCase()} SALARY DISBURSAL`],
      ['Authorized Corporate Account: State Bank of India / HDFC Bank Limited'],
      [],
      ['Sr. No', 'Beneficiary Account Name', 'Bank Account Number', 'Bank IFSC Code', 'Net Amount (₹)', 'Payment Narration / Remark', 'Employee ID', 'Mobile / WhatsApp']
    ];

    monthSlips.forEach((s, idx) => {
      excelData.push([
        idx + 1,
        s.userName,
        s.bankAccount || 'SBIN0004561001',
        s.ifsc || 'SBIN0004561',
        Math.round(Number(s.netPay || 0)),
        `Salary for ${selectedMonth}`,
        s.empId,
        s.mobile || ''
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'NEFT Salary Batch');
    XLSX.writeFile(wb, `Shree_RR_Bank_NEFT_Disbursal_${selectedMonth.replace(/ /g, '_')}.xlsx`);
    ERP.toast(`Downloaded Excel: Bank NEFT Disbursal Sheet for ${selectedMonth}!`, 'success');
  },

  // ==================== 3. TOMORROW SHIFT SCHEDULE EXCEL ====================
  exportTomorrowSchedule() {
    if (typeof XLSX === 'undefined') {
      ERP.toast('SheetJS Excel library not loaded.', 'error');
      return;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const activeStaff = (ERP.state.data.users || []).filter(u => u.role !== 'Super Admin' && u.status !== 'Inactive');
    const veh = ERP.state.data.vehicles || [];

    const excelData = [
      ['SHREE RR TRADING COMPANY - PLANT OPERATIONS & FLEET MANAGEMENT'],
      [`TOMORROW'S DUTY SHIFT & MACHINERY SCHEDULE (${tomorrowStr})`],
      ['ACC Chanda Cement Works & Ambuja Darlaghat Limestone Quarries'],
      [],
      ['Sr. No', 'Employee ID', 'Operator / Worker Name', 'Role / Designation', 'Duty Shift', 'Shift Timings', 'Assigned Machinery / Fleet', 'Plant Site Location', 'Shift In-Charge / Supervisor']
    ];

    activeStaff.forEach((u, idx) => {
      const assignedVeh = veh[idx % veh.length];
      const shiftCode = (idx % 3 === 0) ? 'A Shift' : (idx % 3 === 1 ? 'B Shift' : 'G Shift');
      const timings = shiftCode === 'A Shift' ? '06:00 AM - 02:00 PM' : (shiftCode === 'B Shift' ? '02:00 PM - 10:00 PM' : '08:30 AM - 05:30 PM');

      excelData.push([
        idx + 1,
        u.empId,
        u.name,
        u.designation || 'Operator',
        shiftCode,
        timings,
        assignedVeh ? `${assignedVeh.vehicleNo} (${assignedVeh.name})` : 'General Plant Duty',
        u.site || 'ACC Chanda Plant Site',
        'Shift In-Charge (Operations Bay)'
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tomorrow Schedule');
    XLSX.writeFile(wb, `Shree_RR_Tomorrow_Shift_Schedule_${tomorrowStr}.xlsx`);
    ERP.toast(`Downloaded Excel: Tomorrow Shift & Machine Schedule!`, 'success');
  },

  // ==================== 4. MTTR & FLEET AVAILABILITY EXCEL ====================
  exportFleetMTTR() {
    if (typeof XLSX === 'undefined') {
      ERP.toast('SheetJS Excel library not loaded.', 'error');
      return;
    }

    const veh = ERP.state.data.vehicles || [];
    const logs = ERP.state.data.vehicleLogs || [];
    const today = new Date().toISOString().split('T')[0];

    const excelData = [
      ['SHREE RR TRADING COMPANY - HEAVY PLANT MACHINERY FLEET RELIABILITY'],
      [`EQUIPMENT AVAILABILITY & MTTR RELIABILITY REPORT (${today})`],
      ['ACC Chanda Cement Works & Ambuja Darlaghat Limestone Quarries'],
      [],
      [
        'Sr. No',
        'Vehicle Reg No',
        'Equipment Name',
        'Model',
        'Category',
        'Site Location',
        'Scheduled Hours',
        'Actual Operating Hours',
        'Breakdown (B/D) Hours',
        'Breakdown Events',
        'Fleet Availability (%)',
        'MTTR (Mean Time to Repair in Hours)',
        'Hourly Rate (₹)',
        'Reliability Status'
      ]
    ];

    veh.forEach((v, idx) => {
      const vLogs = logs.filter(l => l.vehicleNo.toUpperCase() === v.vehicleNo.toUpperCase());
      const bdHrs = vLogs.reduce((sum, l) => sum + (Number(l.breakdownHours) || 0), 0);
      const bdEvents = vLogs.length;
      const schedHrs = 30 * 24;
      const operHrs = Math.max(0, schedHrs - bdHrs);
      const avail = Math.max(0, Math.min(100, Math.round((operHrs / schedHrs) * 100)));
      const mttr = bdEvents > 0 ? (bdHrs / bdEvents).toFixed(1) : '0.0';

      excelData.push([
        idx + 1,
        v.vehicleNo,
        v.name,
        v.model || 'Heavy Equipment',
        v.category || 'HEMM',
        v.site || 'ACC Chanda',
        schedHrs,
        operHrs,
        bdHrs,
        bdEvents,
        `${avail}%`,
        `${mttr} hrs`,
        v.hourlyRate || 0,
        avail >= 95 ? 'Optimal Availability' : (avail >= 85 ? 'Acceptable' : 'Critical Breakdown Risk')
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Fleet Availability MTTR');
    XLSX.writeFile(wb, `Shree_RR_Fleet_MTTR_Availability_${today}.xlsx`);
    ERP.toast('Downloaded Excel: HEMM Availability & MTTR Reliability Report!', 'success');
  }
};

// Global click wireups
window.exportMonthlyPayrollExcel = function() { ERP.reports.exportMonthlyPayroll(); };
window.exportBankNeftExcel = function() { ERP.reports.exportBankNeft(); };
window.exportTomorrowScheduleExcel = function() { ERP.reports.exportTomorrowSchedule(); };
window.exportFleetMTTRExcel = function() { ERP.reports.exportFleetMTTR(); };

