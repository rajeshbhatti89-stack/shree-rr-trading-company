/**
 * Shree RR Trading Company - Enterprise Operations, Fleet & Payroll Portal
 * Module: erp-maintenance.js
 * Workshop Job Cards, Maintenance Work Orders & Official Printable Slips
 * (c) 2026 Shree RR Trading Company
 */

window.ERP = window.ERP || {};

ERP.maintenance = {
  // ==================== 1. JOB CARDS TABLE RENDERING ====================
  renderJobCardsTable() {
    const tbody = document.getElementById('jobcards-table-body');
    if (!tbody) return;

    const allJc = ERP.state.data.jobCards || [];
    const search = (document.getElementById('jc-search-input')?.value || document.getElementById('jobcard-search-input')?.value || '').toLowerCase().trim();
    const statusFilter = document.getElementById('jc-filter-status')?.value || document.getElementById('jobcard-filter-status')?.value || 'ALL';

    const filtered = allJc.filter(j => {
      if (statusFilter !== 'ALL' && j.status !== statusFilter) return false;
      if (!search) return true;
      return (
        (j.jobCardNo && j.jobCardNo.toLowerCase().includes(search)) ||
        (j.vehicleNo && j.vehicleNo.toLowerCase().includes(search)) ||
        (j.leadMechanicName && j.leadMechanicName.toLowerCase().includes(search)) ||
        (j.issueReported && j.issueReported.toLowerCase().includes(search))
      );
    });

    const countBadge = document.getElementById('jobcards-count-badge');
    if (countBadge) countBadge.textContent = `${filtered.length} Job Cards`;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center" style="padding: 30px; color: var(--text-dim);">
            <i class="fa-solid fa-clipboard-list fa-2x" style="margin-bottom: 10px; display: block; opacity: 0.4;"></i>
            No maintenance job cards found matching the criteria.
          </td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    filtered.forEach((j, idx) => {
      let statusClass = 'status-warning';
      if (j.status === 'Completed' || j.status === 'Closed') statusClass = 'status-active';
      else if (j.status === 'Waiting for Parts') statusClass = 'status-danger';

      rowsHtml += `
        <tr>
          <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
          <td>
            <div style="font-family: var(--font-mono); font-weight: 800; color: var(--logo-navy); font-size: 13px;">
              ${ERP.utils.escapeHtml(j.jobCardNo)}
            </div>
            <div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">
              ${ERP.utils.escapeHtml(j.dateOpened || j.date || 'Today')}
            </div>
          </td>
          <td>
            <div style="font-family: var(--font-mono); font-weight: 800; color: var(--text-dark);">
              ${ERP.utils.escapeHtml(j.vehicleNo)}
            </div>
            <div style="font-size: 11px; color: var(--text-muted);">${ERP.utils.escapeHtml(j.category || 'Breakdown')}</div>
          </td>
          <td>
            <div style="font-weight: 700;">${ERP.utils.escapeHtml(j.leadMechanicName || 'Unassigned')}</div>
            <div style="font-size: 11px; color: var(--text-dim);">Crew: ${ERP.utils.escapeHtml(j.assistantMechanicName || 'None')} • ${ERP.utils.escapeHtml(j.helperName || 'None')}</div>
          </td>
          <td>
            <div style="font-size: 12px; color: var(--text-dark); max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${ERP.utils.escapeHtml(j.issueReported)}">
              ${ERP.utils.escapeHtml(j.issueReported || 'Mechanical maintenance')}
            </div>
          </td>
          <td style="text-align: center;">
            <span class="status-pill ${statusClass}">${ERP.utils.escapeHtml(j.status || 'In Progress')}</span>
          </td>
          <td style="text-align: center; font-weight: 700;">
            ${j.laborHours || 0} hrs
          </td>
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

  // ==================== 2. CREATE JOB CARD MODAL ====================
  openCreateJobCardModal(preselectedVehNo = '') {
    const form = document.getElementById('form-job-card');
    if (form) form.reset();

    ERP.utils.setElemText('modal-job-card-title', 'Create Maintenance Job Card');
    const idInput = document.getElementById('jc-id');
    if (idInput) idInput.value = '';

    const nextNo = `JC-${new Date().getFullYear()}-${String((ERP.state.data.jobCards || []).length + 1).padStart(4, '0')}`;
    const noInput = document.getElementById('jc-card-no') || document.getElementById('jc-no');
    if (noInput) noInput.value = nextNo;

    const dateInput = document.getElementById('jc-date');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    // Populate Vehicle Dropdown
    const vehSel = document.getElementById('jc-vehicle-select');
    if (vehSel) {
      vehSel.innerHTML = '<option value="">-- Choose Machine / Vehicle * --</option>' +
        (ERP.state.data.vehicles || []).map(v => `
          <option value="${v.vehicleNo}" ${preselectedVehNo && v.vehicleNo === preselectedVehNo ? 'selected' : ''}>
            ${ERP.utils.escapeHtml(v.vehicleNo)} - ${ERP.utils.escapeHtml(v.name)} (${ERP.utils.escapeHtml(v.status || 'Active')})
          </option>
        `).join('');
    }

    // Populate Mechanics Crew Dropdowns
    const staff = ERP.state.data.users || [];
    const mechanics = staff.filter(u => u.role === 'Mechanic' || (u.designation && u.designation.toLowerCase().includes('mech')) || u.department === 'Maintenance');
    const crewOptions = (mechanics.length > 0 ? mechanics : staff).map(u => `
      <option value="${ERP.utils.escapeHtml(u.name)}">${ERP.utils.escapeHtml(u.name)} (${ERP.utils.escapeHtml(u.designation || 'Technician')})</option>
    `).join('');

    const leadSel = document.getElementById('jc-lead-mechanic');
    if (leadSel) leadSel.innerHTML = '<option value="">-- Lead Technician * --</option>' + crewOptions;

    const asstSel = document.getElementById('jc-asst-mechanic');
    if (asstSel) asstSel.innerHTML = '<option value="">-- Assistant Mechanic (Optional) --</option>' + crewOptions;

    const helperSel = document.getElementById('jc-helper');
    if (helperSel) helperSel.innerHTML = '<option value="">-- Greaser / Helper (Optional) --</option>' + crewOptions;

    ERP.modal.open('modal-job-card');
  },

  openEditJobCardModal(id) {
    const jc = (ERP.state.data.jobCards || []).find(j => j.id === id || j.jobCardNo === id);
    if (!jc) return;

    this.openCreateJobCardModal(jc.vehicleNo);
    ERP.utils.setElemText('modal-job-card-title', `Edit Job Card: ${jc.jobCardNo}`);

    const idInput = document.getElementById('jc-id');
    if (idInput) idInput.value = jc.id || jc.jobCardNo;

    const noInput = document.getElementById('jc-card-no') || document.getElementById('jc-no');
    if (noInput) noInput.value = jc.jobCardNo;

    const dateInput = document.getElementById('jc-date');
    if (dateInput) dateInput.value = jc.dateOpened || jc.date || '';

    const catSel = document.getElementById('jc-maintenance-type') || document.getElementById('jc-category');
    if (catSel) catSel.value = jc.category || 'Breakdown Repair';

    const statSel = document.getElementById('jc-status');
    if (statSel) statSel.value = jc.status || 'In Progress';

    const laborInput = document.getElementById('jc-labor-hours');
    if (laborInput) laborInput.value = jc.laborHours || 0;

    const issueText = document.getElementById('jc-issue-reported');
    if (issueText) issueText.value = jc.issueReported || '';

    const workText = document.getElementById('jc-work-carried-out');
    if (workText) workText.value = jc.workCarriedOut || '';

    const compDateInput = document.getElementById('jc-completed-date');
    if (compDateInput) compDateInput.value = jc.completedDate || '';

    const leadSel = document.getElementById('jc-lead-mechanic');
    if (leadSel && jc.leadMechanicName) leadSel.value = jc.leadMechanicName;

    const asstSel = document.getElementById('jc-asst-mechanic');
    if (asstSel && jc.assistantMechanicName) asstSel.value = jc.assistantMechanicName;

    const helperSel = document.getElementById('jc-helper');
    if (helperSel && jc.helperName) helperSel.value = jc.helperName;

    ERP.modal.open('modal-job-card');
  },

  async handleSaveJobCard(e) {
    if (e) e.preventDefault();

    const id = document.getElementById('jc-id')?.value;
    const isEdit = !!id;

    const payload = {
      jobCardNo: document.getElementById('jc-card-no')?.value?.trim() || document.getElementById('jc-no')?.value?.trim(),
      vehicleNo: document.getElementById('jc-vehicle-select')?.value?.trim().toUpperCase(),
      dateOpened: document.getElementById('jc-date')?.value || new Date().toISOString().split('T')[0],
      category: document.getElementById('jc-maintenance-type')?.value || document.getElementById('jc-category')?.value || 'Breakdown Repair',
      status: document.getElementById('jc-status')?.value || 'In Progress',
      laborHours: Number(document.getElementById('jc-labor-hours')?.value) || 0,
      leadMechanicName: document.getElementById('jc-lead-mechanic')?.value?.trim() || '',
      assistantMechanicName: document.getElementById('jc-asst-mechanic')?.value?.trim() || '',
      helperName: document.getElementById('jc-helper')?.value?.trim() || '',
      issueReported: document.getElementById('jc-issue-reported')?.value?.trim() || '',
      workCarriedOut: document.getElementById('jc-work-carried-out')?.value?.trim() || '',
      completedDate: document.getElementById('jc-completed-date')?.value || ''
    };

    if (!payload.vehicleNo || !payload.issueReported) {
      ERP.toast('Vehicle and Reported Defect are required', 'warning');
      return;
    }

    try {
      let res;
      if (isEdit) {
        res = await ERP.api.put(`/api/payroll/job-cards/${encodeURIComponent(id)}`, payload);
      } else {
        res = await ERP.api.post('/api/payroll/job-cards', payload);
      }

      if (res && res.success) {
        ERP.toast(`Job Card ${payload.jobCardNo} ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
        ERP.modal.close('modal-job-card');
        await ERP.loadAllData();
      } else {
        throw new Error((res && res.message) || 'Failed to save Job Card');
      }
    } catch (err) {
      // Local fallback
      if (isEdit) {
        const jcIdx = (ERP.state.data.jobCards || []).findIndex(j => j.id === id || j.jobCardNo === id);
        if (jcIdx !== -1) ERP.state.data.jobCards[jcIdx] = { ...ERP.state.data.jobCards[jcIdx], ...payload };
      } else {
        ERP.state.data.jobCards = [payload, ...(ERP.state.data.jobCards || [])];
      }
      ERP.maintenance.renderJobCardsTable();
      ERP.modal.close('modal-job-card');
      ERP.toast('Job Card saved locally.', 'success');
    }
  },

  async deleteJobCard(id, no) {
    if (!confirm(`Are you sure you want to delete Job Card ${no}?`)) return;

    try {
      const res = await ERP.api.delete(`/api/payroll/job-cards/${encodeURIComponent(id)}`);
      if (res && res.success) {
        ERP.toast(`Job Card ${no} deleted.`, 'info');
        await ERP.loadAllData();
      } else {
        throw new Error((res && res.message) || 'Failed to delete Job Card');
      }
    } catch (err) {
      ERP.state.data.jobCards = (ERP.state.data.jobCards || []).filter(j => j.id !== id && j.jobCardNo !== id);
      ERP.maintenance.renderJobCardsTable();
      ERP.toast('Job card removed.', 'info');
    }
  },

  // ==================== 3. OFFICIAL PRINT JOB CARD MODAL ====================
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
            <td style="font-family: var(--font-mono); font-weight: 700;">${ERP.utils.escapeHtml(it.partNo)}</td>
            <td>${ERP.utils.escapeHtml(it.partName)}</td>
            <td style="text-align: center;">${it.qty} ${ERP.utils.escapeHtml(it.unit || 'Nos')}</td>
            <td style="text-align: right;">₹${Number(it.unitPrice || 0).toLocaleString('en-IN')}</td>
            <td style="text-align: right; font-weight: 700;">₹${Math.round(lineTot).toLocaleString('en-IN')}</td>
            <td style="text-align: center; font-size: 11px;">Challan #${ERP.utils.escapeHtml(ch.challanNo)}</td>
          </tr>
        `;
      });
    });

    if (!partsRowsHtml) {
      partsRowsHtml = `
        <tr>
          <td colspan="7" class="text-center" style="padding: 14px; color: var(--text-dim);">
            No spare parts issued yet for this job card. (Issue spares via Central Warehouse Challan)
          </td>
        </tr>
      `;
    }

    const container = document.getElementById('print-job-card-container');
    if (container) {
      container.innerHTML = `
        <div class="official-job-card-sheet" id="printable-job-card-document">
          <!-- Sheet Header -->
          <div class="official-job-card-header">
            <div style="font-size: 20px; font-weight: 900; letter-spacing: 0.5px; color: #000;">SHREE RR TRADING COMPANY</div>
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #333; margin-top: 2px;">
              HEMM & Heavy Fleets Workshop O&M Maintenance Division • ACC Cement Chanda Works
            </div>
            <div style="font-size: 10px; color: #555; margin-top: 2px;">
              Central Mining Garage Bay, ACC Works, Ghugus Road, Chandrapur (M.H.) 442502
            </div>
            <div style="margin-top: 10px; display: inline-block; padding: 4px 16px; border: 1.5px solid #000; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">
              MAINTENANCE JOB CARD & WORK ORDER
            </div>
          </div>

          <!-- Metadata Box -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; border: 1.5px solid #000; padding: 8px 12px; margin-bottom: 12px; background: #FAFAFA; font-size: 11px;">
            <div><span style="color: #555;">Job Card No:</span> <strong style="font-family: var(--font-mono); font-size: 12px;">${ERP.utils.escapeHtml(jc.jobCardNo)}</strong></div>
            <div><span style="color: #555;">Vehicle Reg No:</span> <strong style="font-family: var(--font-mono); font-size: 12px;">${ERP.utils.escapeHtml(jc.vehicleNo)}</strong></div>
            <div><span style="color: #555;">Date Opened:</span> <strong>${ERP.utils.escapeHtml(jc.dateOpened || jc.date || '')}</strong></div>
            <div><span style="color: #555;">Status:</span> <strong style="text-transform: uppercase;">${ERP.utils.escapeHtml(jc.status || 'In Progress')}</strong></div>

            <div><span style="color: #555;">Maintenance Type:</span> <strong>${ERP.utils.escapeHtml(jc.category || 'Breakdown')}</strong></div>
            <div><span style="color: #555;">Labor Hours:</span> <strong>${jc.laborHours || 0} Hours</strong></div>
            <div><span style="color: #555;">Completion Date:</span> <strong>${ERP.utils.escapeHtml(jc.completedDate || 'In Progress')}</strong></div>
            <div><span style="color: #555;">Plant Site:</span> <strong>ACC Chanda Pit Bay</strong></div>
          </div>

          <!-- Technical Crew Assigned -->
          <div style="border: 1px solid #CBD5E1; padding: 8px 12px; border-radius: 4px; margin-bottom: 12px; background: #F8FAFC;">
            <div style="font-size: 10.5px; font-weight: 800; text-transform: uppercase; color: var(--logo-navy); margin-bottom: 6px;">
              Assigned Maintenance Technical Crew:
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
          <div style="margin-bottom: 18px;">
            <div style="font-size: 11px; font-weight: 800; color: var(--logo-navy); margin-bottom: 4px; display: flex; justify-content: space-between;">
              <span>Warehouse Spare Parts Issued & Replaced:</span>
              <span style="color: #059669; font-weight: 800;">Parts Subtotal: ₹${Math.round(partsTotal).toLocaleString('en-IN')}</span>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead>
                <tr style="background: #F1F5F9; border-top: 1px solid #000; border-bottom: 1px solid #000;">
                  <th style="width: 30px; text-align: center; padding: 5px;">#</th>
                  <th style="width: 120px; text-align: left; padding: 5px;">Part No</th>
                  <th style="text-align: left; padding: 5px;">Item Description</th>
                  <th style="width: 70px; text-align: center; padding: 5px;">Qty</th>
                  <th style="width: 90px; text-align: right; padding: 5px;">Rate (₹)</th>
                  <th style="width: 100px; text-align: right; padding: 5px;">Total (₹)</th>
                  <th style="width: 120px; text-align: center; padding: 5px;">Challan Ref</th>
                </tr>
              </thead>
              <tbody>
                ${partsRowsHtml}
              </tbody>
            </table>
          </div>

          <!-- Signatures -->
          <div style="display: flex; justify-content: space-between; margin-top: 25px; padding-top: 10px; border-top: 1px solid #E2E8F0; font-size: 11px;">
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

// Global compatibility alias
window.allJobCards = ERP.state.data.jobCards;

