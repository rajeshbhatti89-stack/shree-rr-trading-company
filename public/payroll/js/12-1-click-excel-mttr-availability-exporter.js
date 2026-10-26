// 12. 1-Click Excel MTTR & Availability Exporter
function exportFleetMTTRExcel() {
  if (allVehicles.length === 0) {
    showToast('No vehicle fleet records available to export.', 'error');
    return;
  }

  const today = new Date().toISOString().split('T')[0];

  const monthFilter = document.getElementById('fleet-mttr-month-filter')?.value || 'ALL';
  let reportTitle = `EQUIPMENT AVAILABILITY & MTTR RELIABILITY REPORT (${today.toUpperCase()})`;
  if (monthFilter !== 'ALL') {
    reportTitle += ` - Month: ${monthFilter}`;
  }

  // Sheet 1: MTTR Performance Matrix
  const mttrData = [
    ['SHREE RR TRADING COMPANY - HEAVY PLANT MACHINERY FLEET RELIABILITY'],
    [reportTitle],
    ['Site: ACC Chanda Plant Site & Operations | Portal: https://payroll.shreerrtradingcompany.com'],
    [],
    [
      'Sr. No',
      'Vehicle Reg No',
      'Equipment Name',
      'Equipment Model',
      'Category',
      'Plant Site Location',
      'Scheduled Hours',
      'Actual Operating Hours',
      'Breakdown (B/D) Hours',
      'Breakdown Events Count',
      'Fleet Availability (%)',
      'MTTR (Mean Time to Repair in Hours)',
      'MTBF (Mean Time Between Failures in Hours)',
      'Hourly Rate (?)',
      'Reliability Status'
    ]
  ];

  allVehicles.forEach((v, idx) => {
    let vLogs = allVehicleLogs.filter((l) => l.vehicleNo.toUpperCase() === v.vehicleNo.toUpperCase());
    if (monthFilter !== 'ALL') {
      vLogs = vLogs.filter(l => l.date && l.date.startsWith(monthFilter));
    }
    const scheduled = vLogs.reduce((sum, l) => sum + (Number(l.totalHours) || 24), 0) || (monthFilter === 'ALL' ? 720 : new Date(parseInt(monthFilter.split('-')[0]), parseInt(monthFilter.split('-')[1]), 0).getDate() * 24);
    const bdHours = vLogs.reduce((sum, l) => sum + (Number(l.breakdownHours) || 0), 0);
    const bdEvents = vLogs.filter((l) => Number(l.breakdownHours) > 0).length;
    const operating = vLogs.reduce((sum, l) => sum + (Number(l.operatingHours) || 0), 0) || Math.max(0, scheduled - bdHours);

    const availability = scheduled > 0 ? ((scheduled - bdHours) / scheduled) * 100 : 100;
    const mttr = bdEvents > 0 ? bdHours / bdEvents : 0;
    const mtbf = bdEvents > 0 ? operating / bdEvents : operating;
    const status = availability >= 95 ? 'Optimal (95%+)' : availability >= 85 ? 'Moderate (85-95%)' : 'Critical B/D';

    mttrData.push([
      idx + 1,
      v.vehicleNo,
      v.name,
      v.model || 'HEMM',
      v.type || 'Machinery',
      v.site || 'ACC Chanda Mine Pit',
      scheduled,
      operating.toFixed(1),
      bdHours.toFixed(1),
      bdEvents,
      `${availability.toFixed(1)}%`,
      mttr.toFixed(1),
      mtbf.toFixed(1),
      v.hourlyRate || 3500,
      status
    ]);
  });

  // Sheet 2: Breakdown Logs
  const logData = [
    ['SHREE RR TRADING COMPANY - DETAILED BREAKDOWN (B/D) & MAINTENANCE INCIDENT LOGS'],
    [],
    ['Log Date', 'Vehicle Reg No', 'Equipment Name', 'B/D Downtime (Hours)', 'Operating Hours', 'Failure Type', 'Breakdown Reason & Remarks', 'Action Taken by Mechanical Lead', 'Resolution Status']
  ];

  allVehicleLogs.forEach((l) => {
    logData.push([
      l.date,
      l.vehicleNo,
      l.vehicleName || '',
      Number(l.breakdownHours).toFixed(1),
      Number(l.operatingHours).toFixed(1),
      l.failureType || 'Mechanical',
      l.reason || '',
      l.actionTaken || '',
      l.status || 'Resolved'
    ]);
  });

  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.aoa_to_sheet(mttrData);
  const ws2 = XLSX.utils.aoa_to_sheet(logData);

  XLSX.utils.book_append_sheet(wb, ws1, 'MTTR Availability Matrix');
  XLSX.utils.book_append_sheet(wb, ws2, 'Breakdown Logs');

  XLSX.writeFile(wb, `Shree_RR_Vehicle_Availability_and_MTTR_Report_${today}.xlsx`);
  showToast('Downloaded 1-Click Excel: HEMM Fleet Availability & MTTR Reliability Report!');
}


