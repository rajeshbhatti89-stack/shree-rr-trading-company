/**
 * Shree RR Trading Company - Enterprise Operations, Fleet & Payroll Portal
 * Module: erp-fleet-maintenance.js
 * Fleets Master, MTTR Reliability, Statutory Compliance & Maintenance Job Cards
 * (c) 2026 Shree RR Trading Company
 */

window.ERP = window.ERP || {};

ERP.fleet = {
  // ==================== 1. FLEET TABLE RENDERING ====================
  renderVehiclesTable() {
    const tbody = document.getElementById('vehicles-table-body');
    if (!tbody) return;

    const allVeh = ERP.state.data.vehicles || [];
    const search = (ERP.state.filters.vehicleSearch || '').toLowerCase().trim();
    const statusFilter = ERP.state.filters.vehicleStatus || 'ALL';

    const filtered = allVeh.filter(v => {
      if (statusFilter !== 'ALL' && v.status !== statusFilter) return false;
      if (!search) return true;
      return (
        (v.vehicleNo && v.vehicleNo.toLowerCase().includes(search)) ||
        (v.name && v.name.toLowerCase().includes(search)) ||
        (v.category && v.category.toLowerCase().includes(search)) ||
        (v.assignedOperator && v.assignedOperator.toLowerCase().includes(search)) ||
        (v.site && v.site.toLowerCase().includes(search))
      );
    });

    const countEl = document.getElementById('fleet-count-badge');
    if (countEl) countEl.textContent = `${filtered.length} Vehicles`;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center" style="padding: 30px; color: var(--text-dim);">
            <i class="fa-solid fa-truck-monster fa-2x" style="margin-bottom: 10px; display: block; opacity: 0.4;"></i>
            No plant machinery or vehicles matching the selected filters.
          </td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    filtered.forEach((v, idx) => {
      let statusBadge = '<span class="status-pill status-active"><i class="fa-solid fa-circle-check"></i> Active</span>';
      if (v.status === 'Under Maintenance' || v.status === 'Breakdown') {
        statusBadge = '<span class="status-pill status-danger"><i class="fa-solid fa-triangle-exclamation"></i> In Garage</span>';
      } else if (v.status === 'Standby / Idle' || v.status === 'Standby') {
        statusBadge = '<span class="status-pill status-warning"><i class="fa-solid fa-clock"></i> Standby</span>';
      } else if (v.status === 'Decommissioned') {
        statusBadge = '<span class="status-pill status-dim"><i class="fa-solid fa-ban"></i> Decommissioned</span>';
      }

      // Compliance indicator
      const comp = v.compliance || {};
      const today = new Date();
      let compAlert = false;
      const getExpiry = (k, altKey) => comp[k] || v[k] || (altKey ? (comp[altKey] || v[altKey]) : null);
      [
        getExpiry('insuranceExpiry'),
        getExpiry('fitnessExpiry'),
        getExpiry('pucExpiry'),
        getExpiry('roadTaxExpiry', 'taxExpiry'),
        getExpiry('permitExpiry')
      ].forEach(expDate => {
        if (expDate) {
          const diffDays = Math.ceil((new Date(expDate) - today) / (1000 * 60 * 60 * 24));
          if (diffDays <= 15) compAlert = true;
        }
      });

      rowsHtml += `
        <tr>
          <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
          <td>
            <div style="font-family: var(--font-mono); font-weight: 800; color: var(--logo-navy); font-size: 13px;">
              ${ERP.utils.escapeHtml(v.vehicleNo)}
            </div>
            <div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">
              ${ERP.utils.escapeHtml(v.model || 'Heavy Equipment')}
            </div>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--text-dark);">${ERP.utils.escapeHtml(v.name || 'Plant Machinery')}</div>
            <div style="font-size: 11px; color: var(--logo-orange); font-weight: 600;">${ERP.utils.escapeHtml(v.category || 'HEMM')}</div>
          </td>
          <td>
            <div style="font-weight: 600; font-size: 12px;">${ERP.utils.escapeHtml(v.assignedOperator || 'Unassigned')}</div>
            <div style="font-size: 10px; color: var(--text-dim);"><i class="fa-solid fa-location-dot"></i> ${ERP.utils.escapeHtml(v.site || 'ACC Chanda')}</div>
          </td>
          <td style="text-align: center;">${statusBadge}</td>
          <td style="text-align: right; font-weight: 700; color: var(--logo-navy);">
            ₹${Number(v.hourlyRate || 0).toLocaleString('en-IN')}/hr
          </td>
          <td style="text-align: center;">
            <button class="btn btn-outline btn-xs" onclick="ERP.fleet.openComplianceModal('${v.id || v.vehicleNo}')" title="Statutory Compliance Expiries">
              <i class="fa-solid fa-shield-halved ${compAlert ? 'text-red' : 'text-green'}"></i> ${compAlert ? 'Alert' : 'Valid'}
            </button>
          </td>
          <td style="text-align: center;">
            <div style="display: flex; gap: 4px; justify-content: center;">
              <button class="btn-icon-only text-navy" title="Edit Vehicle" onclick="ERP.fleet.openEditVehicleModal('${v.id || v.vehicleNo}')">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn-icon-only text-orange" title="Log Breakdown / Maintenance" onclick="ERP.fleet.openBreakdownModal('${ERP.utils.escapeHtml(v.vehicleNo)}')">
                <i class="fa-solid fa-wrench"></i>
              </button>
              <button class="btn-icon-only text-purple" title="Create Job Card" onclick="ERP.maintenance.openCreateJobCardModal('${ERP.utils.escapeHtml(v.vehicleNo)}')">
                <i class="fa-solid fa-clipboard-check"></i>
              </button>
              <button class="btn-icon-only btn-danger" title="Delete Vehicle" onclick="ERP.fleet.deleteVehicle('${v.id || v.vehicleNo}', '${ERP.utils.escapeHtml(v.vehicleNo)}')">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = rowsHtml;
  },

  filterVehicle(vehNo) {
    ERP.state.filters.vehicleSearch = vehNo;
    const input = document.getElementById('fleet-search-input');
    if (input) input.value = vehNo;
    this.renderVehiclesTable();
  },

  // ==================== 2. ADD & EDIT VEHICLE ====================
  openAddVehicleModal() {
    const form = document.getElementById('form-vehicle');
    if (form) form.reset();
    ERP.utils.setElemText('modal-vehicle-title', 'Add Plant Vehicle / Machinery');
    const idInput = document.getElementById('vehicle-id');
    if (idInput) idInput.value = '';
    ERP.modal.open('modal-vehicle');
  },

  openEditVehicleModal(id) {
    const veh = (ERP.state.data.vehicles || []).find(v => v.id === id || v.vehicleNo === id);
    if (!veh) return;

    ERP.utils.setElemText('modal-vehicle-title', `Edit Machinery: ${veh.vehicleNo}`);
    const idInput = document.getElementById('vehicle-id');
    if (idInput) idInput.value = veh.id || veh.vehicleNo;

    const setVal = (elemId, val) => {
      const el = document.getElementById(elemId);
      if (el) el.value = val || '';
    };

    setVal('veh-number', veh.vehicleNo);
    setVal('veh-name', veh.name);
    setVal('veh-type', veh.category);
    setVal('veh-model', veh.model);
    setVal('veh-operator', veh.assignedOperator);
    setVal('veh-site', veh.site || 'ACC Chanda Plant Site');
    setVal('veh-status', veh.status || 'Active (Plant Duty)');
    setVal('veh-rate', veh.hourlyRate || 0);

    ERP.modal.open('modal-vehicle');
  },

  async handleSaveVehicle(e) {
    if (e) e.preventDefault();

    const idInput = document.getElementById('vehicle-id');
    const editId = idInput ? idInput.value.trim() : '';
    const vehNumber = (document.getElementById('veh-number')?.value || '').trim().toUpperCase();
    const vehName = (document.getElementById('veh-name')?.value || '').trim();
    const vehType = (document.getElementById('veh-type')?.value || '').trim();
    const vehModel = (document.getElementById('veh-model')?.value || '').trim();
    const vehOperator = (document.getElementById('veh-operator')?.value || '').trim();
    const vehSite = (document.getElementById('veh-site')?.value || '').trim();
    const vehStatus = (document.getElementById('veh-status')?.value || '').trim();
    const vehRate = Number(document.getElementById('veh-rate')?.value) || 0;

    if (!vehNumber || !vehName) {
      ERP.toast('Please provide Vehicle Registration No and Equipment Name.', 'warning');
      return;
    }

    const payload = {
      vehicleNo: vehNumber,
      name: vehName,
      category: vehType || 'Excavator',
      model: vehModel || 'Heavy Equipment',
      assignedOperator: vehOperator,
      site: vehSite || 'ACC Chanda Plant Site',
      status: vehStatus || 'Active (Plant Duty)',
      hourlyRate: vehRate
    };

    try {
      let res;
      if (editId) {
        res = await ERP.api.put(`/api/payroll/vehicles/${encodeURIComponent(editId)}`, payload);
      } else {
        res = await ERP.api.post('/api/payroll/vehicles', payload);
      }

      if (res && res.success) {
        ERP.toast(`Vehicle ${vehNumber} saved successfully!`, 'success');
        ERP.modal.close('modal-vehicle');
        await ERP.loadAllData();
      } else {
        throw new Error((res && res.message) || 'Failed to save vehicle');
      }
    } catch (err) {
      ERP.toast(err.message || 'Error saving vehicle record', 'error');
    }
  },

  async deleteVehicle(id, vehNo) {
    if (!confirm(`Are you sure you want to permanently delete vehicle fleet: ${vehNo}?`)) return;

    try {
      const res = await ERP.api.delete(`/api/payroll/vehicles/${encodeURIComponent(id)}`);
      if (res && res.success) {
        ERP.toast(`Vehicle ${vehNo} deleted successfully.`, 'info');
        await ERP.loadAllData();
      } else {
        throw new Error((res && res.message) || 'Failed to delete vehicle');
      }
    } catch (err) {
      ERP.toast(err.message || 'Error deleting vehicle', 'error');
    }
  },

  // ==================== 3. STATUTORY COMPLIANCE MODAL ====================
  openComplianceModal(id) {
    const veh = (ERP.state.data.vehicles || []).find(v => v.id === id || v.vehicleNo === id);
    if (!veh) return;

    ERP.utils.setElemText('modal-comp-vehicle-title', `Statutory Compliance: ${veh.vehicleNo}`);
    const idInput = document.getElementById('comp-vehicle-id');
    if (idInput) idInput.value = veh.id || veh.vehicleNo;

    const comp = veh.compliance || {};
    const setVal = (elemId, val) => {
      const el = document.getElementById(elemId);
      if (el) el.value = val || '';
    };

    setVal('comp-insurance-date', comp.insuranceExpiry || veh.insuranceExpiry);
    setVal('comp-fitness-date', comp.fitnessExpiry || veh.fitnessExpiry);
    setVal('comp-permit-date', comp.permitExpiry || veh.permitExpiry);
    setVal('comp-tax-date', comp.roadTaxExpiry || comp.taxExpiry || veh.roadTaxExpiry);
    setVal('comp-puc-date', comp.pucExpiry || veh.pucExpiry);
    setVal('comp-notes', comp.complianceNotes || veh.complianceNotes);

    ERP.modal.open('modal-vehicle-compliance');
  },

  async handleSaveCompliance(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('comp-vehicle-id')?.value;
    if (!id) return;

    const taxVal = document.getElementById('comp-tax-date')?.value || '';
    const payload = {
      insuranceExpiry: document.getElementById('comp-insurance-date')?.value || '',
      fitnessExpiry: document.getElementById('comp-fitness-date')?.value || '',
      permitExpiry: document.getElementById('comp-permit-date')?.value || '',
      roadTaxExpiry: taxVal,
      taxExpiry: taxVal,
      pucExpiry: document.getElementById('comp-puc-date')?.value || '',
      complianceNotes: document.getElementById('comp-notes')?.value || ''
    };

    try {
      const res = await ERP.api.put(`/api/payroll/vehicles/${encodeURIComponent(id)}/compliance`, payload);
      if (res && res.success) {
        ERP.toast('Statutory compliance records updated!', 'success');
        ERP.modal.close('modal-vehicle-compliance');
        await ERP.loadAllData();
      }
    } catch (err) {
      ERP.toast('Failed to update compliance records', 'error');
    }
  },

  // ==================== 4. LOG BREAKDOWN MODAL ====================
  openBreakdownModal(vehNo) {
    const form = document.getElementById('form-vehicle-breakdown');
    if (form) form.reset();

    const sel = document.getElementById('bd-vehicle-select');
    if (sel && vehNo) sel.value = vehNo;

    const dateInput = document.getElementById('bd-date');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    ERP.modal.open('modal-vehicle-breakdown');
  },

  async handleSaveBreakdown(e) {
    if (e) e.preventDefault();

    const vehNo = document.getElementById('bd-vehicle-select')?.value;
    const bdDate = document.getElementById('bd-date')?.value;
    const bdHours = Number(document.getElementById('bd-hours')?.value) || 0;
    const bdReason = (document.getElementById('bd-reason')?.value || '').trim();
    const bdAction = (document.getElementById('bd-action')?.value || '').trim();

    if (!vehNo || bdHours <= 0) {
      ERP.toast('Please specify vehicle and breakdown hours.', 'warning');
      return;
    }

    const payload = {
      vehicleNo: vehNo,
      date: bdDate || new Date().toISOString().split('T')[0],
      breakdownHours: bdHours,
      operatingHours: Math.max(0, 24 - bdHours),
      reason: bdReason,
      actionTaken: bdAction
    };

    try {
      const res = await ERP.api.post('/api/payroll/vehicle-logs', payload);
      if (res && res.success) {
        ERP.toast(`Logged ${bdHours} hrs breakdown for ${vehNo}`, 'success');
        ERP.modal.close('modal-vehicle-breakdown');
        await ERP.loadAllData();
      }
    } catch (err) {
      ERP.toast('Error recording breakdown log', 'error');
    }
  }
};

// ==================== 5. MAINTENANCE JOB CARDS ENGINE ====================
ERP.maintenance = {
  renderJobCardsTable() {
    const tbody = document.getElementById('jobcards-table-body');
    if (!tbody) return;

    const allJC = ERP.state.data.jobCards || [];
    const search = (document.getElementById('jc-search-input')?.value || '').toLowerCase().trim();
    const statusFilter = document.getElementById('jc-filter-status')?.value || 'ALL';
    const priorityFilter = document.getElementById('jc-filter-priority')?.value || 'ALL';

    const filtered = allJC.filter(j => {
      if (statusFilter !== 'ALL' && j.status !== statusFilter) return false;
      if (priorityFilter !== 'ALL' && j.priority !== priorityFilter) return false;
      if (!search) return true;
      return (
        (j.jobCardNo && j.jobCardNo.toLowerCase().includes(search)) ||
        (j.vehicleNo && j.vehicleNo.toLowerCase().includes(search)) ||
        (j.leadMechanicName && j.leadMechanicName.toLowerCase().includes(search)) ||
        (j.issueReported && j.issueReported.toLowerCase().includes(search))
      );
    });

    const countEl = document.getElementById('jobcards-count-badge');
    if (countEl) countEl.textContent = `${filtered.length} Job Cards`;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center" style="padding: 30px; color: var(--text-dim);">
            <i class="fa-solid fa-clipboard-check fa-2x" style="margin-bottom: 10px; display: block; opacity: 0.4;"></i>
            No Maintenance Job Cards found for the selected criteria.
          </td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    filtered.forEach((j, idx) => {
      let statusBadge = '<span class="status-pill status-active"><i class="fa-solid fa-check"></i> Completed</span>';
      if (j.status === 'Open') statusBadge = '<span class="status-pill status-blue"><i class="fa-solid fa-folder-open"></i> Open</span>';
      if (j.status === 'In Progress') statusBadge = '<span class="status-pill status-warning"><i class="fa-solid fa-spinner fa-spin"></i> In Progress</span>';
      if (j.status === 'Waiting for Parts') statusBadge = '<span class="status-pill status-danger"><i class="fa-solid fa-boxes-stacked"></i> Waiting Spares</span>';
      if (j.status === 'Closed') statusBadge = '<span class="status-pill status-dim"><i class="fa-solid fa-lock"></i> Closed</span>';

      let prioBadge = '<span class="priority-pill priority-medium">Medium</span>';
      if (j.priority === 'Emergency') prioBadge = '<span class="priority-pill priority-emergency"><i class="fa-solid fa-fire"></i> Emergency</span>';
      if (j.priority === 'High') prioBadge = '<span class="priority-pill priority-high">High</span>';
      if (j.priority === 'Low') prioBadge = '<span class="priority-pill priority-low">Low</span>';

      rowsHtml += `
        <tr>
          <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
          <td>
            <div style="font-family: var(--font-mono); font-weight: 800; color: var(--logo-navy); font-size: 13px;">
              ${ERP.utils.escapeHtml(j.jobCardNo)}
            </div>
            <div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">
              <i class="fa-solid fa-calendar-day"></i> ${ERP.utils.escapeHtml(j.date || '')}
            </div>
          </td>
          <td>
            <div style="font-weight: 800; color: var(--logo-navy);">${ERP.utils.escapeHtml(j.vehicleNo)}</div>
            <div style="font-size: 11px; color: var(--text-dark);">${ERP.utils.escapeHtml(j.vehicleName || 'Equipment')}</div>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--logo-orange); font-size: 12px;">${ERP.utils.escapeHtml(j.maintenanceType || 'Repair')}</div>
            <div style="font-size: 11px; color: var(--text-dim); max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${ERP.utils.escapeHtml(j.issueReported || '')}
            </div>
          </td>
          <td>
            <div style="font-weight: 600; font-size: 12px;">${ERP.utils.escapeHtml(j.leadMechanicName || 'Unassigned')}</div>
            <div style="font-size: 10px; color: var(--text-dim);">Labor: ${j.laborHours || 0} hrs</div>
          </td>
          <td style="text-align: center;">${prioBadge}</td>
          <td style="text-align: center;">${statusBadge}</td>
          <td style="text-align: center;">
            <div style="display: flex; gap: 4px; justify-content: center;">
              <button class="btn btn-outline-primary btn-xs" onclick="ERP.maintenance.printJobCardModal('${j.id || j.jobCardNo}')" title="Print Work Order Slip">
                <i class="fa-solid fa-print"></i> Print
              </button>
              <button class="btn btn-outline-warning btn-xs" onclick="ERP.inventory.openIssueChallanModal('${ERP.utils.escapeHtml(j.vehicleNo)}', '${ERP.utils.escapeHtml(j.jobCardNo)}')" title="Issue Material Delivery Challan">
                <i class="fa-solid fa-receipt"></i> Spares
              </button>
              <button class="btn-icon-only text-navy" onclick="ERP.maintenance.openEditJobCardModal('${j.id || j.jobCardNo}')" title="Edit Job Card">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn-icon-only btn-danger" onclick="ERP.maintenance.deleteJobCard('${j.id || j.jobCardNo}', '${ERP.utils.escapeHtml(j.jobCardNo)}')" title="Delete Job Card">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = rowsHtml;
  },

  openCreateJobCardModal(preselectedVehNo = '') {
    const form = document.getElementById('form-job-card');
    if (form) form.reset();

    ERP.utils.setElemText('modal-job-card-title', 'Create Maintenance Job Card & Work Order');
    const idInput = document.getElementById('jc-id');
    if (idInput) idInput.value = '';

    // Auto-generate Job Card Number
    const count = (ERP.state.data.jobCards || []).length + 1;
    const jcNo = `JC-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;
    const jcNoInput = document.getElementById('jc-card-no');
    if (jcNoInput) jcNoInput.value = jcNo;

    const dateInput = document.getElementById('jc-date');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    const inTimeInput = document.getElementById('jc-in-time');
    if (inTimeInput) inTimeInput.value = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    if (preselectedVehNo) {
      const vehSel = document.getElementById('jc-vehicle-select');
      if (vehSel) vehSel.value = preselectedVehNo;
    }

    ERP.modal.open('modal-job-card');
  },

  openEditJobCardModal(id) {
    const jc = (ERP.state.data.jobCards || []).find(j => j.id === id || j.jobCardNo === id);
    if (!jc) return;

    ERP.utils.setElemText('modal-job-card-title', `Edit Job Card: ${jc.jobCardNo}`);
    const idInput = document.getElementById('jc-id');
    if (idInput) idInput.value = jc.id || jc.jobCardNo;

    const setVal = (elemId, val) => {
      const el = document.getElementById(elemId);
      if (el) el.value = val || '';
    };

    setVal('jc-card-no', jc.jobCardNo);
    setVal('jc-vehicle-select', jc.vehicleNo);
    setVal('jc-date', jc.date);
    setVal('jc-in-time', jc.inTime);
    setVal('jc-meter-reading', jc.meterReading);
    setVal('jc-maintenance-type', jc.maintenanceType);
    setVal('jc-priority', jc.priority);
    setVal('jc-status', jc.status);
    setVal('jc-labor-hours', jc.laborHours);
    setVal('jc-lead-mechanic', jc.leadMechanicId || jc.leadMechanicName);
    setVal('jc-asst-mechanic', jc.assistantMechanicId || jc.assistantMechanicName);
    setVal('jc-helper', jc.helperId || jc.helperName);
    setVal('jc-issue-reported', jc.issueReported);
    setVal('jc-work-carried-out', jc.workCarriedOut);
    setVal('jc-completed-date', jc.completionDate);
    setVal('jc-out-time', jc.outTime);

    ERP.modal.open('modal-job-card');
  },

  async handleSaveJobCard(e) {
    if (e) e.preventDefault();

    const idInput = document.getElementById('jc-id');
    const editId = idInput ? idInput.value.trim() : '';
    const jcNo = document.getElementById('jc-card-no')?.value.trim();
    const vehNo = document.getElementById('jc-vehicle-select')?.value.trim();
    const jcDate = document.getElementById('jc-date')?.value;
    const inTime = document.getElementById('jc-in-time')?.value.trim();
    const meterReading = Number(document.getElementById('jc-meter-reading')?.value) || 0;
    const maintenanceType = document.getElementById('jc-maintenance-type')?.value;
    const priority = document.getElementById('jc-priority')?.value || 'High';
    const status = document.getElementById('jc-status')?.value || 'In Progress';
    const laborHours = Number(document.getElementById('jc-labor-hours')?.value) || 0;

    const leadMechSel = document.getElementById('jc-lead-mechanic');
    const leadMechName = leadMechSel && leadMechSel.selectedOptions[0] ? leadMechSel.selectedOptions[0].text.split('(')[0].trim() : '';

    const asstMechSel = document.getElementById('jc-asst-mechanic');
    const asstMechName = asstMechSel && asstMechSel.selectedOptions[0] && asstMechSel.value ? asstMechSel.selectedOptions[0].text.split('(')[0].trim() : '';

    const helperSel = document.getElementById('jc-helper');
    const helperName = helperSel && helperSel.selectedOptions[0] && helperSel.value ? helperSel.selectedOptions[0].text.split('(')[0].trim() : '';

    const issueReported = (document.getElementById('jc-issue-reported')?.value || '').trim();
    const workCarriedOut = (document.getElementById('jc-work-carried-out')?.value || '').trim();
    const completionDate = document.getElementById('jc-completed-date')?.value;
    const outTime = document.getElementById('jc-out-time')?.value.trim();

    if (!jcNo || !vehNo || !issueReported) {
      ERP.toast('Please provide Job Card #, Equipment No, and Reported Issue.', 'warning');
      return;
    }

    const matchedVeh = (ERP.state.data.vehicles || []).find(v => v.vehicleNo === vehNo);

    const payload = {
      jobCardNo: jcNo,
      vehicleNo: vehNo,
      vehicleName: matchedVeh ? matchedVeh.name : 'Heavy Machinery',
      vehicleModel: matchedVeh ? matchedVeh.model : 'Plant Equipment',
      date: jcDate || new Date().toISOString().split('T')[0],
      inTime: inTime || '--:--',
      meterReading: meterReading,
      maintenanceType: maintenanceType,
      priority: priority,
      status: status,
      laborHours: laborHours,
      leadMechanicName: leadMechName,
      leadMechanicId: leadMechSel ? leadMechSel.value : '',
      assistantMechanicName: asstMechName,
      helperName: helperName,
      issueReported: issueReported,
      workCarriedOut: workCarriedOut,
      completionDate: completionDate,
      outTime: outTime
    };

    try {
      let res;
      if (editId) {
        res = await ERP.api.put(`/api/payroll/job-cards/${encodeURIComponent(editId)}`, payload);
      } else {
        res = await ERP.api.post('/api/payroll/job-cards', payload);
      }

      if (res && res.success) {
        ERP.toast(`Job Card ${jcNo} saved successfully!`, 'success');
        ERP.modal.close('modal-job-card');
        await ERP.loadAllData();
      } else {
        throw new Error((res && res.message) || 'Failed to save Job Card');
      }
    } catch (err) {
      ERP.toast(err.message || 'Error saving Job Card', 'error');
    }
  },

  async deleteJobCard(id, jcNo) {
    if (!confirm(`Are you sure you want to permanently delete Job Card ${jcNo}?`)) return;

    try {
      const res = await ERP.api.delete(`/api/payroll/job-cards/${encodeURIComponent(id)}`);
      if (res && res.success) {
        ERP.toast(`Job Card ${jcNo} deleted.`, 'info');
        await ERP.loadAllData();
      }
    } catch (err) {
      ERP.toast('Failed to delete Job Card', 'error');
    }
  },

  // ==================== 6. OFFICIAL PRINT JOB CARD MODAL ====================
  printJobCardModal(id) {
    const jc = (ERP.state.data.jobCards || []).find(j => j.id === id || j.jobCardNo === id);
    if (!jc) return;

    // Find linked challans for this job card or vehicle
    const allCh = ERP.state.data.challans || [];
    const linkedChallans = allCh.filter(ch => 
      (ch.jobCardNo && ch.jobCardNo.toUpperCase() === jc.jobCardNo.toUpperCase()) || 
      (ch.vehicleNo && ch.vehicleNo.toUpperCase() === jc.vehicleNo.toUpperCase())
    );

    let partsRowsHtml = '';
    let partsTotal = 0;
    linkedChallans.forEach(ch => {
      (ch.items || []).forEach((it, idx) => {
        const lineTot = Number(it.totalPrice) || (Number(it.qty) * Number(it.unitPrice));
        partsTotal += lineTot;
        partsRowsHtml += `
          <tr>
            <td style="text-align: center;">${idx + 1}</td>
            <td><strong style="font-family: var(--font-mono); color: var(--logo-navy);">${ERP.utils.escapeHtml(it.partNo || '')}</strong></td>
            <td>${ERP.utils.escapeHtml(it.partName || '')}</td>
            <td style="text-align: center;">${ERP.utils.escapeHtml(it.warranty || 'N/A')}</td>
            <td style="text-align: center; font-weight: 700;">${it.qty} ${ERP.utils.escapeHtml(it.unit || 'Nos')}</td>
            <td style="text-align: right;">₹${Number(it.unitPrice || 0).toLocaleString('en-IN')}</td>
            <td style="text-align: right; font-weight: 700;">₹${Math.round(lineTot).toLocaleString('en-IN')}</td>
          </tr>
        `;
      });
    });

    if (!partsRowsHtml) {
      partsRowsHtml = `<tr><td colspan="7" class="text-center" style="color: var(--text-dim); padding: 12px;">No spare parts issued yet under this Job Card.</td></tr>`;
    }

    const container = document.getElementById('print-job-card-container');
    if (container) {
      container.innerHTML = `
        <div class="official-job-card-sheet">
          <!-- Sheet Header -->
          <div class="sheet-header" style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 14px;">
            <div>
              <div style="font-size: 22px; font-weight: 900; color: var(--logo-navy); letter-spacing: 0.5px;">SHREE RR TRADING COMPANY</div>
              <div style="font-size: 11px; color: var(--logo-orange); font-weight: 800; text-transform: uppercase;">Heavy Fleets O&M • HEMM Garage & Engineering Bay</div>
              <div style="font-size: 11px; color: var(--text-muted);">ACC Chanda Cement Works & Ambuja Darlaghat Limestone Quarries</div>
            </div>
            <div style="text-align: right;">
              <div style="display: inline-block; background: #0B1936; color: #FFF; padding: 4px 10px; font-weight: 800; font-size: 11px; border-radius: 4px;">OFFICIAL WORK ORDER</div>
              <div style="font-family: var(--font-mono); font-size: 17px; font-weight: 900; color: var(--logo-navy); margin-top: 4px;">${ERP.utils.escapeHtml(jc.jobCardNo)}</div>
              <div style="font-size: 11px; color: var(--text-muted);">Date: <strong>${ERP.utils.escapeHtml(jc.date || '')}</strong></div>
            </div>
          </div>

          <!-- Machinery & Job Meta Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: #F8FAFC; border: 1px solid #CBD5E1; padding: 10px 14px; border-radius: 6px; margin-bottom: 14px; font-size: 11.5px;">
            <div>
              <div><span style="color: var(--text-dim); width: 130px; display: inline-block;">Vehicle Reg No:</span> <strong style="font-size: 13px; color: var(--logo-navy);">${ERP.utils.escapeHtml(jc.vehicleNo)}</strong></div>
              <div style="margin-top: 3px;"><span style="color: var(--text-dim); width: 130px; display: inline-block;">Equipment Name:</span> <strong>${ERP.utils.escapeHtml(jc.vehicleName || 'Equipment')}</strong></div>
              <div style="margin-top: 3px;"><span style="color: var(--text-dim); width: 130px; display: inline-block;">Model / Capacity:</span> <strong>${ERP.utils.escapeHtml(jc.vehicleModel || 'Heavy Equipment')}</strong></div>
              <div style="margin-top: 3px;"><span style="color: var(--text-dim); width: 130px; display: inline-block;">Meter / Engine Hrs:</span> <strong>${jc.meterReading ? `${Number(jc.meterReading).toLocaleString('en-IN')} Hrs/KM` : 'N/A'}</strong></div>
            </div>
            <div>
              <div><span style="color: var(--text-dim); width: 130px; display: inline-block;">Maintenance Scope:</span> <strong style="color: var(--logo-orange);">${ERP.utils.escapeHtml(jc.maintenanceType || 'Repair')}</strong></div>
              <div style="margin-top: 3px;"><span style="color: var(--text-dim); width: 130px; display: inline-block;">Priority Level:</span> <strong>${ERP.utils.escapeHtml(jc.priority || 'Normal')}</strong></div>
              <div style="margin-top: 3px;"><span style="color: var(--text-dim); width: 130px; display: inline-block;">Time In / Out:</span> <strong>${ERP.utils.escapeHtml(jc.inTime || '--:--')} / ${ERP.utils.escapeHtml(jc.outTime || 'Ongoing')}</strong></div>
              <div style="margin-top: 3px;"><span style="color: var(--text-dim); width: 130px; display: inline-block;">Current Status:</span> <strong>${ERP.utils.escapeHtml(jc.status || 'In Progress')}</strong></div>
            </div>
          </div>

          <!-- Assigned Technical Maintenance Crew -->
          <div style="margin-bottom: 14px; border: 1px solid #CBD5E1; border-radius: 6px; padding: 10px 14px;">
            <div style="font-size: 12px; font-weight: 800; color: var(--logo-navy); margin-bottom: 6px;">
              <i class="fa-solid fa-users-gear text-orange"></i> Assigned Maintenance Technical Crew:
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 11px;">
              <div style="background: #FFF; padding: 6px 10px; border-radius: 4px; border: 1px solid #E2E8F0;">
                <span style="font-size: 9px; color: var(--text-dim); font-weight: 700; text-transform: uppercase;">Lead Mechanic / Technician:</span>
                <div style="font-weight: 700; color: var(--logo-navy);">${ERP.utils.escapeHtml(jc.leadMechanicName || 'Unassigned')}</div>
              </div>
              <div style="background: #FFF; padding: 6px 10px; border-radius: 4px; border: 1px solid #E2E8F0;">
                <span style="font-size: 9px; color: var(--text-dim); font-weight: 700; text-transform: uppercase;">Assistant Mechanic:</span>
                <div style="font-weight: 700;">${ERP.utils.escapeHtml(jc.assistantMechanicName || 'None')}</div>
              </div>
              <div style="background: #FFF; padding: 6px 10px; border-radius: 4px; border: 1px solid #E2E8F0;">
                <span style="font-size: 9px; color: var(--text-dim); font-weight: 700; text-transform: uppercase;">Helper / Greaser:</span>
                <div style="font-weight: 700;">${ERP.utils.escapeHtml(jc.helperName || 'None')}</div>
              </div>
            </div>
          </div>

          <!-- Problem / Defect Reported -->
          <div style="margin-bottom: 12px;">
            <div style="font-size: 11px; font-weight: 800; color: var(--logo-navy); margin-bottom: 4px;">Problem / Breakdown Symptom Reported:</div>
            <div style="font-size: 11.5px; background: #FFF5EE; border-left: 3px solid var(--logo-orange); padding: 8px 12px; border-radius: 0 4px 4px 0;">
              ${ERP.utils.escapeHtml(jc.issueReported)}
            </div>
          </div>

          <!-- Action Taken -->
          <div style="margin-bottom: 14px;">
            <div style="font-size: 11px; font-weight: 800; color: var(--logo-navy); margin-bottom: 4px;">Corrective Action Taken & Work Performed:</div>
            <div style="font-size: 11.5px; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 8px 12px; border-radius: 4px; min-height: 42px;">
              ${ERP.utils.escapeHtml(jc.workCarriedOut || 'Repair & inspection under execution in garage bay.')}
            </div>
          </div>

          <!-- Replaced Spares Table -->
          <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <div style="font-size: 11px; font-weight: 800; color: var(--logo-navy);">
                <i class="fa-solid fa-boxes-stacked text-orange"></i> Replaced Spares & Materials (from Issue Challans):
              </div>
              <div style="font-size: 11.5px; font-weight: 800; color: #059669;">
                Spares Total: ₹${Math.round(partsTotal).toLocaleString('en-IN')}
              </div>
            </div>
            <table class="slip-table" style="width: 100%; font-size: 10.5px; border-collapse: collapse;">
              <thead>
                <tr style="background: #F1F5F9; border-bottom: 1px solid #CBD5E1;">
                  <th style="padding: 5px 8px; text-align: center;">#</th>
                  <th style="padding: 5px 8px; text-align: left;">Part No</th>
                  <th style="padding: 5px 8px; text-align: left;">Description</th>
                  <th style="padding: 5px 8px; text-align: center;">Warranty</th>
                  <th style="padding: 5px 8px; text-align: center;">Qty</th>
                  <th style="padding: 5px 8px; text-align: right;">Unit Rate</th>
                  <th style="padding: 5px 8px; text-align: right;">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${partsRowsHtml}
              </tbody>
            </table>
          </div>

          <!-- Sign-off Block -->
          <div style="margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-end; padding-top: 14px; border-top: 1px solid #CBD5E1; font-size: 10.5px;">
            <div style="text-align: center; width: 180px;">
              <div style="border-bottom: 1px dashed #94A3B8; height: 30px;"></div>
              <div style="margin-top: 4px; font-weight: 700;">${ERP.utils.escapeHtml(jc.leadMechanicName || 'Lead Mechanic')}</div>
              <div style="color: var(--text-dim); font-size: 9.5px;">Lead Technician Sign</div>
            </div>
            <div style="text-align: center; width: 180px;">
              <div style="border-bottom: 1px dashed #94A3B8; height: 30px;"></div>
              <div style="margin-top: 4px; font-weight: 700;">Workshop Store Incharge</div>
              <div style="color: var(--text-dim); font-size: 9.5px;">Spares Verified Sign</div>
            </div>
            <div style="text-align: center; width: 180px;">
              <div style="border-bottom: 1px dashed #94A3B8; height: 30px;"></div>
              <div style="margin-top: 4px; font-weight: 700;">Site / Plant Manager</div>
              <div style="color: var(--text-dim); font-size: 9.5px;">Authorized Inspection Sign</div>
            </div>
          </div>
        </div>
      `;
    }

    ERP.modal.open('modal-print-job-card');
  }
};

// Global Print Isolation Trigger for Job Card
window.printActiveJobCard = function() {
  document.body.classList.add('printing-job-card');
  window.print();
  setTimeout(() => {
    document.body.classList.remove('printing-job-card');
  }, 1000);
};

window.openPrintJobCardModal = function(id) {
  ERP.maintenance.printJobCardModal(id);
};
