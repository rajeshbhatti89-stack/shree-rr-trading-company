// 9. Vehicles Management Table
function renderVehiclesTable() {
  const tbody = document.getElementById('vehicles-table-body');
  const countBadge = document.getElementById('fleet-count-badge');
  if (countBadge) countBadge.textContent = `${allVehicles.length} Active Vehicles`;
  if (!tbody) return;

  // Dynamically populate vehicle-type-filter with distinct manual categories
  const filterSelect = document.getElementById('vehicle-type-filter');
  if (filterSelect) {
    const currentVal = filterSelect.value || 'ALL';
    const uniqueTypes = Array.from(new Set(allVehicles.map((v) => v.type).filter(Boolean))).sort();
    let filterHtml = '<option value="ALL">All Equipment Categories</option>';
    uniqueTypes.forEach((t) => {
      filterHtml += `<option value="${escapeHtml(t)}" ${t === currentVal ? 'selected' : ''}>${escapeHtml(t)}</option>`;
    });
    filterSelect.innerHTML = filterHtml;
  }

  const search = (document.getElementById('vehicle-search-input')?.value || '').toLowerCase().trim();
  const typeFilter = document.getElementById('vehicle-type-filter')?.value || 'ALL';

  const filtered = allVehicles.filter((v) => {
    const matchSearch =
      !search ||
      (v.vehicleNo && v.vehicleNo.toLowerCase().includes(search)) ||
      (v.name && v.name.toLowerCase().includes(search)) ||
      (v.operatorName && v.operatorName.toLowerCase().includes(search)) ||
      (v.site && v.site.toLowerCase().includes(search));
    const matchType = typeFilter === 'ALL' || v.type === typeFilter;
    return matchSearch && matchType;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center" style="padding: 35px; color: var(--text-dim);">No plant vehicles in fleet. Click "Bulk Import (Excel)" or "Add Plant Vehicle" above.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((v) => {
      const isPit = (v.status || '').includes('Active');
      const isMaint = (v.status || '').includes('Maintenance');
      const statusClass = isPit ? 'status-pit' : (isMaint ? 'status-maintenance' : 'status-idle');
      const vType = v.type || '';
      const icon = vType.includes('Excavator')
        ? 'fa-truck-monster'
        : vType.includes('Tipper')
        ? 'fa-truck-front'
        : vType.includes('JCB') || vType.includes('Loader')
        ? 'fa-tractor'
        : vType.includes('Bobcat')
        ? 'fa-truck-pickup'
        : vType.includes('Water')
        ? 'fa-faucet-drip'
        : 'fa-truck-ramp-box';

      const comp = typeof calculateCompliancePriority === 'function'
        ? calculateCompliancePriority(v)
        : { badgeClass: 'badge-secondary', badgeText: 'Compliant', popoverHtml: '' };

      return `
      <tr>
        <td>
          <span class="emp-cell-id"><i class="fa-solid ${icon} text-orange"></i> ${escapeHtml(v.vehicleNo)}</span>
        </td>
        <td>
          <span class="emp-cell-name">${escapeHtml(v.name)}</span>
          <span class="emp-cell-sub">Model: ${escapeHtml(v.model || 'Plant Fleet')} | Fuel: ${escapeHtml(v.fuelType || 'Diesel')}</span>
        </td>
        <td><span class="badge-pill">${escapeHtml(v.type || 'Plant Equipment')}</span></td>
        <td>
          <strong>${escapeHtml(v.operatorName || 'Unassigned')}</strong>
          <span class="emp-cell-sub">${v.operatorId ? `ID: ${escapeHtml(v.operatorId)}` : 'Spare Driver'}</span>
        </td>
        <td>${escapeHtml(v.site || 'ACC Chanda Plant Site')}</td>
        <td><span class="badge-pill ${statusClass}">${escapeHtml(v.status || 'Active')}</span></td>
        <td>
          <button class="badge-compliance-btn ${comp.badgeClass}" onclick="openEditComplianceModal('${v.id || v.vehicleNo}')" title="${escapeHtml(comp.tooltip)} - Click to update">
            <i class="fa-solid ${comp.icon}"></i> ${comp.label}
          </button>
        </td>
        <td><strong>₹${Number(v.hourlyRate || 0).toLocaleString('en-IN')} / Hr</strong></td>
        <td class="text-right">
          <div style="display: inline-flex; gap: 6px; align-items: center;">
            <button class="btn-icon-only text-primary" title="Create Maintenance Job Card" onclick="openCreateJobCardModal('${escapeHtml(v.vehicleNo)}')">
              <i class="fa-solid fa-clipboard-check"></i>
            </button>
            <button class="btn-icon-only text-orange" title="Issue Material Challan" onclick="openIssueChallanModal('${escapeHtml(v.vehicleNo)}')">
              <i class="fa-solid fa-receipt"></i>
            </button>
            <button class="btn-icon-only text-success" title="Spares Consumption & Cost History" onclick="viewVehicleConsumptionDetails('${escapeHtml(v.vehicleNo)}')">
              <i class="fa-solid fa-boxes-stacked"></i>
            </button>
            <button class="btn-icon-only text-warning" title="Statutory Compliance Records" onclick="openEditComplianceModal('${v.id || v.vehicleNo}')">
              <i class="fa-solid fa-shield-halved"></i>
            </button>
            <button class="btn-icon-only text-navy" title="Edit Vehicle" onclick="editVehicle('${v.id || v.vehicleNo}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-icon-only btn-danger" title="Delete Vehicle" onclick="deleteVehicle('${v.id || v.vehicleNo}', '${escapeHtml(v.vehicleNo)}')">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
    })
    .join('');
}

function openAddVehicleModal() {
  document.getElementById('modal-vehicle-title').innerHTML = `<i class="fa-solid fa-truck-ramp-box text-orange"></i> Add Plant Vehicle / Fleet`;
  document.getElementById('form-vehicle').reset();
  document.getElementById('vehicle-id').value = '';
  document.getElementById('veh-type').value = '';
  document.getElementById('veh-site').value = 'ACC Chanda Plant Site';
  document.getElementById('veh-status').value = 'Active (Plant Duty)';
  populateVehicleOperatorSelect();
  openModal('modal-vehicle');
}

function editVehicle(vehId) {
  const veh = allVehicles.find((v) => v.id === vehId || v.vehicleNo === vehId);
  if (!veh) return;

  document.getElementById('modal-vehicle-title').innerHTML = `<i class="fa-solid fa-truck-front text-orange"></i> Edit Plant Vehicle (${veh.vehicleNo})`;
  document.getElementById('vehicle-id').value = veh.id || veh.vehicleNo;
  document.getElementById('veh-number').value = veh.vehicleNo || '';
  document.getElementById('veh-name').value = veh.name || '';
  document.getElementById('veh-type').value = veh.type || '';
  document.getElementById('veh-model').value = veh.model || '';
  document.getElementById('veh-site').value = veh.site || 'ACC Chanda Plant Site';
  document.getElementById('veh-status').value = veh.status || 'Active (Plant Duty)';
  document.getElementById('veh-rate').value = veh.hourlyRate || '';
  document.getElementById('veh-notes').value = veh.notes || '';

  populateVehicleOperatorSelect(veh.operatorId);
  openModal('modal-vehicle');
}

async function deleteVehicle(vehId, vehNo) {
  if (!confirm(`Are you sure you want to delete vehicle "${vehNo}" from the fleet?`)) return;

  try {
    const res = await fetch(`/api/payroll/vehicles/${vehId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast(`Vehicle "${vehNo}" deleted.`);
      allVehicles = allVehicles.filter((v) => v.id !== vehId && v.vehicleNo !== vehId);
      renderVehiclesTable();
      populateVehicleDropdowns();
      renderTomorrowScheduleTable();
      renderFleetMTTRMatrix();
      updateDashboardMetrics();
    }
  } catch (err) {
    allVehicles = allVehicles.filter((v) => v.id !== vehId && v.vehicleNo !== vehId);
    renderVehiclesTable();
    updateDashboardMetrics();
  }
}

async function deleteAllVehicles() {
  if (allVehicles.length === 0) {
    showToast('Vehicle list is already empty.', 'error');
    return;
  }
  if (!confirm(`CAUTION: Are you sure you want to DELETE ALL ${allVehicles.length} vehicles from the system?`)) {
    return;
  }

  try {
    const res = await fetch('/api/payroll/vehicles/all', { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('All vehicles deleted from fleet database.');
      allVehicles = [];
      allVehicleLogs = [];
      renderVehiclesTable();
      populateVehicleDropdowns();
      renderTomorrowScheduleTable();
      renderFleetMTTRMatrix();
      renderVehicleBreakdownLogs();
      updateDashboardMetrics();
    }
  } catch (err) {
    showToast('All vehicles cleared.');
    allVehicles = [];
    renderVehiclesTable();
  }
}

function populateVehicleOperatorSelect(selectedId = '') {
  const select = document.getElementById('veh-operator');
  if (!select) return;

  const operators = allUsers.filter((u) => u.role !== 'Super Admin');
  const options = [`<option value="">-- No Assigned Operator (Spare Fleet) --</option>`].concat(
    operators.map((u) => `<option value="${u.empId}" ${u.empId === selectedId ? 'selected' : ''}>${escapeHtml(u.name)} (${u.empId}) - ${escapeHtml(u.designation || 'Staff')}</option>`)
  );
  select.innerHTML = options.join('');
}

function populateVehicleDropdowns() {
  const options = allVehicles.map((v) => `<option value="${v.vehicleNo} - ${escapeHtml(v.name)}">${v.vehicleNo} - ${escapeHtml(v.name)} (${escapeHtml(v.site || 'Pit')})</option>`);
  options.unshift(`<option value="Absent (Not Available / Absent)">Absent (Not Available / Absent)</option>`);
  options.unshift(`<option value="Leave (Approved Leave)">Leave (Approved Leave)</option>`);
  options.unshift(`<option value="Weekly Off (WO)">Weekly Off (WO)</option>`);
  options.unshift(`<option value="No Machinery (Standby / Off)">No Machinery (Standby / Off)</option>`);
  options.unshift(`<option value="Heavy Fleet Maintenance Bay">Heavy Fleet Maintenance Bay</option>`);
  options.unshift(`<option value="General Plant Duty">General Plant Duty</option>`);

  const bdSelect = document.getElementById('bd-vehicle-select');
  if (bdSelect) {
    if (allVehicles.length === 0) {
      bdSelect.innerHTML = `<option value="">-- No Vehicles Registered --</option>`;
    } else {
      bdSelect.innerHTML = allVehicles.map((v) => `<option value="${v.vehicleNo}">${v.vehicleNo} - ${escapeHtml(v.name)} (${escapeHtml(v.model || v.type)})</option>`).join('');
    }
  }

  return options.join('');
}



