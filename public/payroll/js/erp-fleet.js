/**
 * Shree RR Trading Company - Enterprise Operations, Fleet & Payroll Portal
 * Module: erp-fleet.js
 * Plant Fleets Master, MTTR Reliability & Statutory Compliance Tracking
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

    const countBadge = document.getElementById('fleet-count-badge');
    if (countBadge) countBadge.textContent = `${filtered.length} Machines`;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center" style="padding: 30px; color: var(--text-dim);">
            <i class="fa-solid fa-truck-monster fa-2x" style="margin-bottom: 10px; display: block; opacity: 0.4;"></i>
            No plant machinery found matching the search criteria.
          </td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    filtered.forEach((v, idx) => {
      let statusBadge = '<span class="status-pill status-active"><i class="fa-solid fa-circle-check"></i> Active</span>';
      if (v.status === 'Under Maintenance' || v.status === 'Breakdown') {
        statusBadge = '<span class="status-pill status-danger"><i class="fa-solid fa-wrench"></i> Breakdown</span>';
      } else if (v.status === 'Standby / Idle') {
        statusBadge = '<span class="status-pill status-warning"><i class="fa-solid fa-pause"></i> Standby</span>';
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
              ${ERP.utils.escapeHtml(v.model || v.make || 'HEMM')}
            </div>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--text-dark);">${ERP.utils.escapeHtml(v.name)}</div>
            <div style="font-size: 11px; color: var(--text-muted);">${ERP.utils.escapeHtml(v.category || 'Heavy Machinery')} • ${ERP.utils.escapeHtml(v.site || 'ACC Chanda')}</div>
          </td>
          <td>
            <div style="font-weight: 600;">${ERP.utils.escapeHtml(v.assignedOperator || 'Pit Pool')}</div>
            <div style="font-size: 11px; color: var(--text-dim);">${ERP.utils.escapeHtml(v.operatorContact || 'Site Radio')}</div>
          </td>
          <td style="text-align: center;">${statusBadge}</td>
          <td style="text-align: right; font-weight: 700; color: var(--logo-navy);">
            ₹${Number(v.hourlyRate || 0).toLocaleString('en-IN')}
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
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = rowsHtml;
  },

  // ==================== 2. ADD / EDIT VEHICLE MODAL ====================
  openAddVehicleModal() {
    const form = document.getElementById('form-vehicle');
    if (form) form.reset();

    ERP.utils.setElemText('modal-vehicle-title', 'Add Plant Machinery / Vehicle');
    const idInput = document.getElementById('vehicle-id');
    if (idInput) idInput.value = '';

    ERP.modal.open('modal-vehicle');
  },

  openEditVehicleModal(id) {
    const v = (ERP.state.data.vehicles || []).find(veh => veh.id === id || veh.vehicleNo === id);
    if (!v) return;

    ERP.utils.setElemText('modal-vehicle-title', `Edit Vehicle: ${v.vehicleNo}`);
    const setVal = (elemId, val) => {
      const el = document.getElementById(elemId);
      if (el) el.value = val || '';
    };

    setVal('vehicle-id', v.id || v.vehicleNo);
    setVal('veh-number', v.vehicleNo);
    setVal('v-no', v.vehicleNo);
    setVal('veh-name', v.name);
    setVal('v-name', v.name);
    setVal('veh-model', v.model);
    setVal('v-model', v.model);
    setVal('veh-type', v.category || 'Excavator');
    setVal('v-category', v.category || 'Excavator');
    setVal('veh-operator', v.assignedOperator);
    setVal('v-operator', v.assignedOperator);
    setVal('v-operator-phone', v.operatorContact);
    setVal('veh-rate', v.hourlyRate || 0);
    setVal('v-hourly-rate', v.hourlyRate || 0);
    setVal('veh-site', v.site || 'ACC Chanda Plant Site');
    setVal('v-site', v.site || 'ACC Chanda Plant Site');
    setVal('veh-status', v.status || 'Active (Plant Duty)');
    setVal('v-status', v.status || 'Active (Plant Duty)');

    ERP.modal.open('modal-vehicle');
  },

  async handleSaveVehicle(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('vehicle-id')?.value;
    const isEdit = !!id;

    const payload = {
      vehicleNo: (document.getElementById('veh-number')?.value || document.getElementById('v-no')?.value)?.trim().toUpperCase(),
      name: (document.getElementById('veh-name')?.value || document.getElementById('v-name')?.value)?.trim(),
      model: (document.getElementById('veh-model')?.value || document.getElementById('v-model')?.value)?.trim() || '',
      category: document.getElementById('veh-type')?.value || document.getElementById('v-category')?.value || 'Excavator',
      assignedOperator: document.getElementById('veh-operator')?.value?.trim() || document.getElementById('v-operator')?.value?.trim() || '',
      operatorContact: document.getElementById('v-operator-phone')?.value?.trim() || '',
      hourlyRate: Number(document.getElementById('veh-rate')?.value || document.getElementById('v-hourly-rate')?.value) || 0,
      site: document.getElementById('veh-site')?.value?.trim() || document.getElementById('v-site')?.value?.trim() || 'ACC Chanda Plant Site',
      status: document.getElementById('veh-status')?.value || document.getElementById('v-status')?.value || 'Active (Plant Duty)'
    };

    if (!payload.vehicleNo || !payload.name) {
      ERP.toast('Registration No and Equipment Name are required', 'warning');
      return;
    }

    try {
      let res;
      if (isEdit) {
        res = await ERP.api.put(`/api/payroll/vehicles/${encodeURIComponent(id)}`, payload);
      } else {
        res = await ERP.api.post('/api/payroll/vehicles', payload);
      }

      if (res && res.success) {
        ERP.toast(`Vehicle ${payload.vehicleNo} ${isEdit ? 'updated' : 'added'} successfully!`, 'success');
        ERP.modal.close('modal-vehicle');
        await ERP.loadAllData();
      } else {
        throw new Error((res && res.message) || 'Failed to save vehicle');
      }
    } catch (err) {
      ERP.toast(err.message, 'error');
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

    const dateInput = document.getElementById('bd-date') || document.getElementById('bd-start-time');
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    ERP.modal.open('modal-vehicle-breakdown');
  },

  async handleSaveBreakdown(e) {
    if (e) e.preventDefault();

    const vehNo = document.getElementById('bd-vehicle-select')?.value;
    const bdDate = document.getElementById('bd-date')?.value || document.getElementById('bd-start-time')?.value || new Date().toISOString().split('T')[0];
    const bdHours = Number(document.getElementById('bd-hours')?.value) || 0;
    const bdReason = document.getElementById('bd-reason')?.value?.trim() || document.getElementById('bd-description')?.value?.trim() || document.getElementById('bd-type')?.value || 'Mechanical Breakdown';
    const bdAction = document.getElementById('bd-action')?.value?.trim() || '';

    if (!vehNo) {
      ERP.toast('Please select a vehicle', 'warning');
      return;
    }

    const payload = {
      vehicleNo: vehNo,
      date: bdDate,
      breakdownHours: bdHours,
      type: bdReason,
      startTime: bdDate,
      reason: bdReason,
      description: bdReason,
      correctiveAction: bdAction,
      status: 'Open'
    };

    try {
      const res = await ERP.api.post('/api/payroll/vehicles/breakdown', payload);
      if (res && res.success) {
        ERP.toast(`Breakdown incident logged for ${vehNo}!`, 'success');
        ERP.modal.close('modal-vehicle-breakdown');
        await ERP.loadAllData();
      } else {
        throw new Error((res && res.message) || 'Failed to log breakdown');
      }
    } catch (err) {
      ERP.toast(err.message, 'error');
    }
  }
};

// Aliases for global compatibility
window.allVehicles = ERP.state.data.vehicles;

