// 11. Vehicle Availability & MTTR Reliability Analytics
function renderFleetMTTRMatrix() {
  const tbody = document.getElementById('fleet-mttr-table-body');
  if (!tbody) return;

  if (allVehicles.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" class="text-center" style="padding: 30px; color: var(--text-dim);">No plant vehicles in fleet to calculate MTTR.</td></tr>`;
    document.getElementById('kpi-scheduled-hours').textContent = '0 Hrs';
    document.getElementById('kpi-operating-hours').textContent = '0 Hrs';
    document.getElementById('kpi-breakdown-hours').textContent = '0 Hrs';
    document.getElementById('kpi-fleet-availability').textContent = '100.0%';
    document.getElementById('kpi-fleet-mttr').textContent = '0.0 Hrs';
    document.getElementById('kpi-fleet-mtbf').textContent = '0.0 Hrs';
    return;
  }

  const monthFilter = document.getElementById('fleet-mttr-month-filter')?.value || 'ALL';

  let totalFleetScheduled = 0;
  let totalFleetOperating = 0;
  let totalFleetBreakdown = 0;
  let totalFleetBDEvents = 0;

  const rowsHtml = allVehicles.map((v) => {
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

    totalFleetScheduled += scheduled;
    totalFleetOperating += operating;
    totalFleetBreakdown += bdHours;
    totalFleetBDEvents += bdEvents;

    const statusBadge =
      availability >= 95
        ? `<span class="badge-pill" style="background: rgba(16, 185, 129, 0.1); color: #059669; border-color: rgba(16, 185, 129, 0.3);"><i class="fa-solid fa-circle-check"></i> Optimal (95%+)</span>`
        : availability >= 85
        ? `<span class="badge-pill" style="background: rgba(245, 158, 11, 0.1); color: #D97706; border-color: rgba(245, 158, 11, 0.3);"><i class="fa-solid fa-triangle-exclamation"></i> Moderate</span>`
        : `<span class="badge-pill" style="background: rgba(220, 38, 38, 0.1); color: #DC2626; border-color: rgba(220, 38, 38, 0.3);"><i class="fa-solid fa-circle-xmark"></i> Critical B/D</span>`;

    return `
      <tr>
        <td class="emp-cell-id">${escapeHtml(v.vehicleNo)}</td>
        <td>
          <strong>${escapeHtml(v.name)}</strong>
          <span class="emp-cell-sub">${escapeHtml(v.model || 'HEMM')}</span>
        </td>
        <td><span class="badge-pill">${escapeHtml(v.type || 'Equipment')}</span></td>
        <td>${scheduled} Hrs</td>
        <td><strong class="text-success">${operating.toFixed(1)} Hrs</strong></td>
        <td><strong class="text-danger">${bdHours.toFixed(1)} Hrs</strong></td>
        <td><strong>${bdEvents}</strong></td>
        <td><strong class="text-orange text-lg">${availability.toFixed(1)}%</strong></td>
        <td><strong class="text-navy">${mttr.toFixed(1)} Hrs/Rep</strong></td>
        <td><strong>${mtbf.toFixed(1)} Hrs</strong></td>
        <td>${statusBadge}</td>
      </tr>
    `;
  });

  tbody.innerHTML = rowsHtml.join('');

  // Overall KPI Updates
  const overallAvail = totalFleetScheduled > 0 ? ((totalFleetScheduled - totalFleetBreakdown) / totalFleetScheduled) * 100 : 100;
  const overallMTTR = totalFleetBDEvents > 0 ? totalFleetBreakdown / totalFleetBDEvents : 0;
  const overallMTBF = totalFleetBDEvents > 0 ? totalFleetOperating / totalFleetBDEvents : totalFleetOperating;

  document.getElementById('kpi-scheduled-hours').textContent = `${totalFleetScheduled.toLocaleString('en-IN')} Hrs`;
  document.getElementById('kpi-operating-hours').textContent = `${totalFleetOperating.toFixed(1)} Hrs`;
  document.getElementById('kpi-breakdown-hours').textContent = `${totalFleetBreakdown.toFixed(1)} Hrs`;
  document.getElementById('kpi-fleet-availability').textContent = `${overallAvail.toFixed(1)}%`;
  document.getElementById('kpi-fleet-mttr').textContent = `${overallMTTR.toFixed(1)} Hrs`;
  document.getElementById('kpi-fleet-mtbf').textContent = `${overallMTBF.toFixed(1)} Hrs`;
}

function renderVehicleBreakdownLogs() {
  const tbody = document.getElementById('breakdown-logs-table-body');
  if (!tbody) return;

  const monthFilter = document.getElementById('fleet-mttr-month-filter')?.value || 'ALL';
  let logsToRender = allVehicleLogs;
  if (monthFilter !== 'ALL') {
    logsToRender = logsToRender.filter(l => l.date && l.date.startsWith(monthFilter));
  }

  if (logsToRender.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center" style="padding: 30px; color: var(--text-dim);">No breakdown (B/D) logs recorded yet. Click "+ Log Breakdown (B/D) & Service Hours" to record machine downtime.</td></tr>`;
    return;
  }

  tbody.innerHTML = logsToRender
    .map(
      (l) => `
      <tr>
        <td><strong>${l.date}</strong></td>
        <td class="emp-cell-id">${escapeHtml(l.vehicleNo)}</td>
        <td>${escapeHtml(l.vehicleName || 'Equipment')}</td>
        <td><strong class="text-danger">${Number(l.breakdownHours).toFixed(1)} Hrs</strong></td>
        <td><strong class="text-success">${Number(l.operatingHours).toFixed(1)} Hrs</strong></td>
        <td><span class="badge-pill">${escapeHtml(l.failureType || 'Mechanical')}</span></td>
        <td>${escapeHtml(l.reason || '-')}</td>
        <td>${escapeHtml(l.actionTaken || 'Inspected')}</td>
        <td><span class="badge-pill ${l.status === 'Resolved' ? 'status-pit' : 'status-maintenance'}">${escapeHtml(l.status || 'Resolved')}</span></td>
        <td class="text-right">
          <button class="btn-icon-only btn-danger" onclick="deleteVehicleLog('${l.id}')" title="Delete Log">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `
    )
    .join('');
}

async function deleteVehicleLog(logId) {
  if (!confirm('Are you sure you want to delete this breakdown log?')) return;
  try {
    const res = await fetch(`/api/payroll/vehicle-logs/${encodeURIComponent(logId)}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({ success: true }));
    if (data.success) {
      showToast('Breakdown log permanently deleted.');
    }
  } catch (e) {
    console.warn('Vehicle log delete error:', e);
  } finally {
    allVehicleLogs = allVehicleLogs.filter((l) => String(l.id || '').toLowerCase() !== String(logId || '').toLowerCase());
    renderFleetMTTRMatrix();
    renderVehicleBreakdownLogs();
  }
}


