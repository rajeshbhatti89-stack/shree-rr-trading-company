// 27. Vehicle Maintenance Job Cards Management Engine (with Crew Assignment)
function initJobCardsManagement() {
  const searchInput = document.getElementById('jc-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => renderJobCardsTable());
  }

  const statusFilter = document.getElementById('jc-status-filter');
  if (statusFilter) {
    statusFilter.addEventListener('change', () => renderJobCardsTable());
  }

  const priorityFilter = document.getElementById('jc-priority-filter');
  if (priorityFilter) {
    priorityFilter.addEventListener('change', () => renderJobCardsTable());
  }

  const techFilter = document.getElementById('filter-jc-mechanic');
  if (techFilter) {
    techFilter.addEventListener('change', () => renderJobCardsTable());
  }

  const formJc = document.getElementById('form-job-card');
  if (formJc) {
    formJc.addEventListener('submit', handleSaveJobCard);
  }

  const btnSaveJc = document.getElementById('btn-save-job-card');
  if (btnSaveJc) {
    btnSaveJc.addEventListener('click', (e) => {
      const vehNo = document.getElementById('jc-vehicle-select')?.value?.trim();
      if (!vehNo) {
        e.preventDefault();
        showToast('Please select a Plant Vehicle / Equipment.', 'error');
        document.getElementById('jc-vehicle-select')?.focus();
        return;
      }
      const lead = document.getElementById('jc-lead-mechanic')?.value?.trim();
      if (!lead) {
        e.preventDefault();
        showToast('Please select a Lead Mechanic / Technician.', 'error');
        document.getElementById('jc-lead-mechanic')?.focus();
        return;
      }
      const issue = document.getElementById('jc-issue-reported')?.value?.trim();
      if (!issue) {
        e.preventDefault();
        showToast('Please describe the reported defect / maintenance symptom.', 'error');
        document.getElementById('jc-issue-reported')?.focus();
        return;
      }
    });
  }

  const btnCreate = document.getElementById('btn-open-create-job-card');
  if (btnCreate) {
    btnCreate.addEventListener('click', () => openCreateJobCardModal());
  }

  const btnExport = document.getElementById('btn-export-job-cards-excel');
  if (btnExport) {
    btnExport.addEventListener('click', exportJobCardsExcel);
  }
}

function renderJobCardsTable() {
  const tbody = document.getElementById('job-cards-table-body');
  if (!tbody) return;

  const search = (document.getElementById('jc-search-input')?.value || '').toLowerCase().trim();
  const statusFilter = document.getElementById('jc-status-filter')?.value || 'ALL';
  const priorityFilter = document.getElementById('jc-priority-filter')?.value || 'ALL';
  const techFilter = document.getElementById('filter-jc-mechanic')?.value || 'ALL';

  const filtered = (allJobCards || []).filter((jc) => {
    const matchSearch =
      !search ||
      (jc.jobCardNo && jc.jobCardNo.toLowerCase().includes(search)) ||
      (jc.vehicleNo && jc.vehicleNo.toLowerCase().includes(search)) ||
      (jc.vehicleName && jc.vehicleName.toLowerCase().includes(search)) ||
      (jc.issueReported && jc.issueReported.toLowerCase().includes(search)) ||
      (jc.leadMechanicName && jc.leadMechanicName.toLowerCase().includes(search)) ||
      (jc.helperName && jc.helperName.toLowerCase().includes(search));

    const matchStatus = statusFilter === 'ALL' || jc.status === statusFilter;
    const matchPriority = priorityFilter === 'ALL' || jc.priority === priorityFilter;
    const matchTech =
      techFilter === 'ALL' ||
      jc.leadMechanicId === techFilter ||
      jc.assistantMechanicId === techFilter ||
      jc.helperId === techFilter;

    return matchSearch && matchStatus && matchPriority && matchTech;
  });

  // Calculate KPIs
  let activeCount = 0;
  let inProgressCount = 0;
  let waitingPartsCount = 0;
  let completedCount = 0;
  let totalSparesCost = 0;

  (allJobCards || []).forEach(j => {
    const cost = Number(j.totalMaterialCost) || 0;
    totalSparesCost += cost;
    if (j.status === 'In Progress') inProgressCount++;
    else if (j.status === 'Waiting for Parts') waitingPartsCount++;
    else if (j.status === 'Completed' || j.status === 'Closed') completedCount++;
    else activeCount++;
  });

  const kpiTotal = document.getElementById('kpi-jc-total');
  if (kpiTotal) kpiTotal.textContent = (allJobCards || []).length;

  const kpiProg = document.getElementById('kpi-jc-in-progress');
  if (kpiProg) kpiProg.textContent = inProgressCount;

  const kpiWait = document.getElementById('kpi-jc-waiting-parts');
  if (kpiWait) kpiWait.textContent = waitingPartsCount;

  const kpiComp = document.getElementById('kpi-jc-completed');
  if (kpiComp) kpiComp.textContent = completedCount;

  const kpiCost = document.getElementById('kpi-jc-material-cost');
  if (kpiCost) kpiCost.textContent = `₹${Math.round(totalSparesCost).toLocaleString('en-IN')}`;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center" style="padding: 35px; color: var(--text-dim);">No Job Cards match the selected filters. Click "+ Create Job Card" to log vehicle maintenance.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((jc) => {
    let statusClass = 'badge-primary';
    let statusIcon = 'fa-spinner fa-spin';
    if (jc.status === 'Completed' || jc.status === 'Closed') {
      statusClass = 'badge-success';
      statusIcon = 'fa-circle-check';
    } else if (jc.status === 'Waiting for Parts') {
      statusClass = 'badge-warning';
      statusIcon = 'fa-hourglass-half';
    } else if (jc.status === 'Open') {
      statusClass = 'badge-secondary';
      statusIcon = 'fa-clipboard';
    }

    let priorityBadge = 'badge-pill';
    if (jc.priority === 'Urgent') priorityBadge += ' badge-danger';
    else if (jc.priority === 'High') priorityBadge += ' badge-warning';
    else priorityBadge += ' badge-primary';

    const cost = Number(jc.totalMaterialCost) || 0;

    return `
      <tr>
        <td>
          <span class="emp-cell-id" style="font-family: var(--font-mono); font-weight: 800; color: var(--logo-navy);">
            <i class="fa-solid fa-clipboard-check text-orange"></i> ${escapeHtml(jc.jobCardNo)}
          </span>
          <span class="emp-cell-sub"><i class="fa-solid fa-calendar"></i> ${escapeHtml(jc.date || '')} ${jc.inTime ? `(${escapeHtml(jc.inTime)})` : ''}</span>
        </td>
        <td>
          <span class="emp-cell-name" style="font-weight: 700; color: var(--logo-navy);">${escapeHtml(jc.vehicleNo)}</span>
          <span class="emp-cell-sub">${escapeHtml(jc.vehicleName)} ${jc.vehicleModel ? `| ${escapeHtml(jc.vehicleModel)}` : ''}</span>
        </td>
        <td>
          <span class="badge-pill" style="font-size: 11px;">${escapeHtml(jc.maintenanceType || 'Repair')}</span>
          ${jc.meterReading ? `<div style="font-size: 11px; color: var(--text-dim); margin-top: 3px;"><i class="fa-solid fa-gauge"></i> ${Number(jc.meterReading).toLocaleString('en-IN')} Hrs/KM</div>` : ''}
        </td>
        <td style="max-width: 200px;">
          <div style="font-size: 12px; font-weight: 600; color: var(--text-dark); overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
            ${escapeHtml(jc.issueReported)}
          </div>
          <span class="${priorityBadge}" style="font-size: 10px; margin-top: 4px;">${escapeHtml(jc.priority || 'Normal')}</span>
        </td>
        <td>
          <!-- Assigned Crew: Lead Mechanic, Assistant, Helper -->
          <div class="crew-assignment-box">
            <div class="crew-member lead" title="Lead Mechanic / Technician">
              <i class="fa-solid fa-wrench text-orange"></i>
              <strong>${escapeHtml(jc.leadMechanicName || 'Unassigned')}</strong>
              <span class="role-tag">Lead</span>
            </div>
            ${jc.assistantMechanicName ? `
              <div class="crew-member asst" title="Assistant Mechanic">
                <i class="fa-solid fa-user-gear text-navy"></i>
                <span>${escapeHtml(jc.assistantMechanicName)}</span>
                <span class="role-tag">Asst</span>
              </div>
            ` : ''}
            ${jc.helperName ? `
              <div class="crew-member helper" title="Helper / Greaser">
                <i class="fa-solid fa-hand-holding-hand text-muted"></i>
                <span>${escapeHtml(jc.helperName)}</span>
                <span class="role-tag">Helper</span>
              </div>
            ` : ''}
          </div>
        </td>
        <td>
          <strong style="color: ${cost > 0 ? '#059669' : 'var(--text-dim)'}; font-size: 14px;">
            ₹${cost.toLocaleString('en-IN')}
          </strong>
          <div style="font-size: 10px; color: var(--text-dim); margin-top: 2px;">
            <a href="javascript:void(0)" onclick="openIssueChallanModal('${escapeHtml(jc.vehicleNo)}', '${escapeHtml(jc.jobCardNo)}')" style="color: var(--logo-orange); text-decoration: underline;">
              + Issue Spares
            </a>
          </div>
        </td>
        <td>
          <span class="badge-pill ${statusClass}" style="font-size: 11px;">
            <i class="fa-solid ${statusIcon}"></i> ${escapeHtml(jc.status || 'In Progress')}
          </span>
          ${jc.completedDate ? `<div style="font-size: 10px; color: var(--text-dim); margin-top: 3px;">Done: ${escapeHtml(jc.completedDate)}</div>` : ''}
        </td>
        <td class="text-right">
          <div style="display: inline-flex; gap: 6px; align-items: center;">
            <button class="btn btn-outline btn-xs" title="View & Print Official Job Card" onclick="openPrintJobCardModal('${jc.id || jc.jobCardNo}')">
              <i class="fa-solid fa-print text-navy"></i> Print
            </button>
            <button class="btn btn-outline-warning btn-xs" title="Issue Material Challan for this Job Card" onclick="openIssueChallanModal('${escapeHtml(jc.vehicleNo)}', '${escapeHtml(jc.jobCardNo)}')">
              <i class="fa-solid fa-receipt text-orange"></i> Spares
            </button>
            <button class="btn-icon-only text-navy" title="Edit Job Card" onclick="editJobCard('${jc.id || jc.jobCardNo}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-icon-only btn-danger" title="Delete Job Card" onclick="deleteJobCard('${jc.id || jc.jobCardNo}', '${escapeHtml(jc.jobCardNo)}')">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openCreateJobCardModal(prefillVehNo = '') {
  const titleEl = document.getElementById('modal-job-card-title');
  if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-clipboard-check text-orange"></i> Create Maintenance Job Card`;
  const formEl = document.getElementById('form-job-card');
  if (formEl) formEl.reset();
  const idEl = document.getElementById('jc-id');
  if (idEl) idEl.value = '';
  const cardNoEl = document.getElementById('jc-card-no');
  if (cardNoEl) cardNoEl.value = `JC-${new Date().getFullYear()}-${((allJobCards || []).length + 1).toString().padStart(4, '0')}`;
  const dateEl = document.getElementById('jc-date');
  if (dateEl) dateEl.value = new Date().toISOString().split('T')[0];
  const inTimeEl = document.getElementById('jc-in-time');
  if (inTimeEl) inTimeEl.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const statusEl = document.getElementById('jc-status');
  if (statusEl) statusEl.value = 'In Progress';
  const priorityEl = document.getElementById('jc-priority');
  if (priorityEl) priorityEl.value = 'High';

  populateJobCardVehicleSelect(prefillVehNo);
  if (typeof populateTechnicianDropdowns === 'function') populateTechnicianDropdowns();
  openModal('modal-job-card');
}

function editJobCard(id) {
  const jc = (allJobCards || []).find(j => j.id === id || j.jobCardNo === id);
  if (!jc) return;

  document.getElementById('modal-job-card-title').innerHTML = `<i class="fa-solid fa-pen-to-square text-orange"></i> Edit Job Card (${escapeHtml(jc.jobCardNo)})`;
  document.getElementById('jc-id').value = jc.id;
  document.getElementById('jc-card-no').value = jc.jobCardNo || '';
  document.getElementById('jc-date').value = jc.date || '';
  document.getElementById('jc-in-time').value = jc.inTime || '';
  document.getElementById('jc-out-time').value = jc.outTime || '';
  document.getElementById('jc-meter-reading').value = jc.meterReading || '';
  document.getElementById('jc-maintenance-type').value = jc.maintenanceType || 'Breakdown Repair';
  document.getElementById('jc-priority').value = jc.priority || 'High';
  document.getElementById('jc-issue-reported').value = jc.issueReported || '';
  document.getElementById('jc-status').value = jc.status || 'In Progress';
  document.getElementById('jc-work-carried-out').value = jc.workCarriedOut || '';
  document.getElementById('jc-labor-hours').value = jc.totalLaborHours || '';
  document.getElementById('jc-completed-date').value = jc.completedDate || '';
  document.getElementById('jc-notes').value = jc.notes || '';

  populateJobCardVehicleSelect(jc.vehicleNo);
  populateTechnicianDropdowns(jc.leadMechanicId, jc.assistantMechanicId, jc.helperId);
  openModal('modal-job-card');
}

function populateJobCardVehicleSelect(selectedVehNo = '') {
  const sel = document.getElementById('jc-vehicle-select');
  if (!sel) return;

  const targetVeh = String(selectedVehNo || '').trim().toUpperCase();
  let html = `<option value="">-- Select Plant Vehicle / Equipment * --</option>`;
  (allVehicles || []).forEach(v => {
    if (!v) return;
    const vNo = String(v.vehicleNo || '').trim();
    if (!vNo) return;
    const isSelected = targetVeh && vNo.toUpperCase() === targetVeh;
    html += `<option value="${escapeHtml(vNo)}" data-name="${escapeHtml(v.name || 'Plant Equipment')}" data-model="${escapeHtml(v.model || '')}" ${isSelected ? 'selected' : ''}>${escapeHtml(vNo)} - ${escapeHtml(v.name || 'Equipment')} (${escapeHtml(v.site || 'Pit')})</option>`;
  });
  sel.innerHTML = html;
}

function populateJobCardDropdowns() {
  populateTechnicianDropdowns();
  populateJobCardVehicleSelect();
}

async function handleSaveJobCard(e) {
  if (e && e.preventDefault) e.preventDefault();
  const id = document.getElementById('jc-id')?.value.trim() || '';
  const jobCardNo = document.getElementById('jc-card-no')?.value.trim() || `JC-${new Date().getFullYear()}-${((allJobCards || []).length + 1).toString().padStart(4, '0')}`;
  const vehSelect = document.getElementById('jc-vehicle-select');
  const vehicleNo = vehSelect ? vehSelect.value.trim() : '';
  if (!vehicleNo) {
    showToast('Please select a plant vehicle / equipment.', 'error');
    return;
  }
  const selectedVehOption = (vehSelect && vehSelect.selectedIndex >= 0) ? vehSelect.options[vehSelect.selectedIndex] : null;
  const vehicleName = selectedVehOption?.getAttribute('data-name') || 'Plant Equipment';
  const vehicleModel = selectedVehOption?.getAttribute('data-model') || '';

  const date = document.getElementById('jc-date')?.value || new Date().toISOString().split('T')[0];
  const inTime = document.getElementById('jc-in-time')?.value || '';
  const outTime = document.getElementById('jc-out-time')?.value || '';
  const meterReading = Number(document.getElementById('jc-meter-reading')?.value) || 0;
  const maintenanceType = document.getElementById('jc-maintenance-type')?.value || 'Breakdown Repair';
  const priority = document.getElementById('jc-priority')?.value || 'High';
  const issueReported = document.getElementById('jc-issue-reported')?.value.trim() || '';
  if (!issueReported) {
    showToast('Please describe the reported defect or maintenance requirement.', 'error');
    return;
  }
  const status = document.getElementById('jc-status')?.value || 'In Progress';

  // Technician / Mechanic / Helper Crew Assignment
  const leadSelect = document.getElementById('jc-lead-mechanic');
  const leadMechanicId = leadSelect?.value || '';
  const leadSelectedOpt = (leadSelect && leadSelect.selectedIndex >= 0) ? leadSelect.options[leadSelect.selectedIndex] : null;
  const leadMechanicName = leadSelectedOpt?.getAttribute('data-name') || (leadSelectedOpt?.textContent || 'Unassigned');
  const leadMechanicRole = leadSelectedOpt?.getAttribute('data-role') || 'Mechanic';

  if (!leadMechanicId) {
    showToast('Please assign a Lead Mechanic / Senior Technician.', 'error');
    return;
  }

  const asstSelect = document.getElementById('jc-asst-mechanic');
  const assistantMechanicId = asstSelect?.value || '';
  const asstSelectedOpt = (asstSelect && asstSelect.selectedIndex >= 0) ? asstSelect.options[asstSelect.selectedIndex] : null;
  const assistantMechanicName = assistantMechanicId ? (asstSelectedOpt?.getAttribute('data-name') || '') : '';

  const helperSelect = document.getElementById('jc-helper');
  const helperId = helperSelect?.value || '';
  const helperSelectedOpt = (helperSelect && helperSelect.selectedIndex >= 0) ? helperSelect.options[helperSelect.selectedIndex] : null;
  const helperName = helperId ? (helperSelectedOpt?.getAttribute('data-name') || '') : '';

  const workCarriedOut = document.getElementById('jc-work-carried-out')?.value?.trim() || '';
  const totalLaborHours = Number(document.getElementById('jc-labor-hours')?.value) || 0;
  const completedDate = document.getElementById('jc-completed-date')?.value || '';
  const notes = document.getElementById('jc-notes')?.value?.trim() || '';

  const payload = {
    jobCardNo,
    vehicleNo,
    vehicleName,
    vehicleModel,
    date,
    inTime,
    outTime,
    meterReading,
    maintenanceType,
    priority,
    issueReported,
    status,
    leadMechanicId,
    leadMechanicName,
    leadMechanicRole,
    assistantMechanicId,
    assistantMechanicName,
    helperId,
    helperName,
    workCarriedOut,
    totalLaborHours,
    completedDate: (status === 'Completed' || status === 'Closed') ? (completedDate || new Date().toISOString().split('T')[0]) : '',
    notes
  };

  const isEdit = Boolean(id);
  const url = isEdit ? `/api/payroll/job-cards/${encodeURIComponent(id)}` : '/api/payroll/job-cards';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Job Card saved successfully!');
      closeModal('modal-job-card');
      await fetchJobCards();
      await fetchVehicles();
      if (typeof updateVehicleSubNavBadges === 'function') updateVehicleSubNavBadges();
    } else {
      showToast(data.message || 'Error saving Job Card', 'error');
    }
  } catch (err) {
    console.error('Job card save error:', err);
    if (isEdit) {
      const idx = allJobCards.findIndex(j => j.id === id || j.jobCardNo === id);
      if (idx !== -1) allJobCards[idx] = { ...allJobCards[idx], ...payload, updatedAt: new Date().toISOString() };
    } else {
      const newJc = { id: `jc-${Date.now()}`, ...payload, totalMaterialCost: 0, createdAt: new Date().toISOString() };
      allJobCards.unshift(newJc);
    }
    try { localStorage.setItem(STORAGE_KEYS.JOB_CARDS, JSON.stringify(allJobCards)); } catch (e) {}
    showToast('Job Card saved locally.');
    closeModal('modal-job-card');
    renderJobCardsTable();
    if (typeof updateVehicleSubNavBadges === 'function') updateVehicleSubNavBadges();
  }
}

async function deleteJobCard(id, jobCardNo) {
  if (!confirm(`Are you sure you want to delete Job Card "${jobCardNo}"?`)) return;

  try {
    const res = await fetch(`/api/payroll/job-cards/${encodeURIComponent(id)}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast(`Job Card "${jobCardNo}" deleted.`);
      allJobCards = allJobCards.filter(j => j.id !== id && j.jobCardNo !== id);
      try { localStorage.setItem(STORAGE_KEYS.JOB_CARDS, JSON.stringify(allJobCards)); } catch (e) {}
      renderJobCardsTable();
      if (typeof updateVehicleSubNavBadges === 'function') updateVehicleSubNavBadges();
    } else {
      showToast(data.message || 'Failed to delete Job Card', 'error');
    }
  } catch (err) {
    allJobCards = allJobCards.filter(j => j.id !== id && j.jobCardNo !== id);
    try { localStorage.setItem(STORAGE_KEYS.JOB_CARDS, JSON.stringify(allJobCards)); } catch (e) {}
    showToast(`Job Card "${jobCardNo}" removed.`);
    renderJobCardsTable();
  }
}

function openPrintJobCardModal(id) {
  const jc = (allJobCards || []).find(j => j.id === id || j.jobCardNo === id);
  if (!jc) return;
  currentActiveJobCard = jc;

  // Find linked challans
  const linkedChallans = (allChallans || []).filter(ch => (ch.jobCardNo && ch.jobCardNo.toUpperCase() === jc.jobCardNo.toUpperCase()) || ch.vehicleNo.toUpperCase() === jc.vehicleNo.toUpperCase());
  let partsRowsHtml = '';
  let partsTotal = 0;

  linkedChallans.forEach(ch => {
    (ch.items || []).forEach((it, idx) => {
      const lineTot = Number(it.totalPrice) || (Number(it.qty) * Number(it.unitPrice));
      partsTotal += lineTot;
      partsRowsHtml += `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${escapeHtml(it.partNo || '')}</strong></td>
          <td>${escapeHtml(it.partName || '')}</td>
          <td class="text-center">${escapeHtml(it.warranty || 'N/A')}</td>
          <td class="text-center">${it.qty} ${escapeHtml(it.unit || '')}</td>
          <td class="text-right">₹${Number(it.unitPrice || 0).toLocaleString('en-IN')}</td>
          <td class="text-right"><strong>₹${Math.round(lineTot).toLocaleString('en-IN')}</strong></td>
        </tr>
      `;
    });
  });

  if (!partsRowsHtml) {
    partsRowsHtml = `<tr><td colspan="7" class="text-center" style="color: var(--text-dim); padding: 15px;">No spare parts issued yet for this Job Card.</td></tr>`;
  }

  const printContainer = document.getElementById('print-job-card-container') || document.getElementById('print-job-card-content');
  if (printContainer) {
    printContainer.innerHTML = `
      <div class="official-job-card-sheet">
        <!-- Header -->
        <div class="sheet-header">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid var(--logo-navy); padding-bottom: 12px; margin-bottom: 14px;">
            <div>
              <div style="font-size: 20px; font-weight: 800; color: var(--logo-navy); letter-spacing: 0.5px;">SHREE RR TRADING COMPANY</div>
              <div style="font-size: 11px; color: var(--logo-orange); font-weight: 700; text-transform: uppercase;">Heavy Fleets O&M • HEMM Garage & Engineering Services</div>
              <div style="font-size: 11px; color: var(--text-muted);">ACC Chanda Cement Works & Ambuja Darlaghat Limestone Quarries</div>
            </div>
            <div style="text-align: right;">
              <div class="sheet-badge-title">MAINTENANCE JOB CARD</div>
              <div style="font-family: var(--font-mono); font-size: 16px; font-weight: 800; color: var(--logo-navy); margin-top: 4px;">${escapeHtml(jc.jobCardNo)}</div>
              <div style="font-size: 11px; color: var(--text-muted);">Date: <strong>${escapeHtml(jc.date || '')}</strong></div>
            </div>
          </div>
        </div>

        <!-- Vehicle & Job Metadata Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 12px;">
          <div>
            <div><span style="color: var(--text-dim); width: 130px; display: inline-block;">Vehicle Reg No:</span> <strong style="font-size: 14px; color: var(--logo-navy);">${escapeHtml(jc.vehicleNo)}</strong></div>
            <div style="margin-top: 4px;"><span style="color: var(--text-dim); width: 130px; display: inline-block;">Equipment Name:</span> <strong>${escapeHtml(jc.vehicleName)}</strong></div>
            <div style="margin-top: 4px;"><span style="color: var(--text-dim); width: 130px; display: inline-block;">Model / Series:</span> <strong>${escapeHtml(jc.vehicleModel || 'Heavy Equipment')}</strong></div>
            <div style="margin-top: 4px;"><span style="color: var(--text-dim); width: 130px; display: inline-block;">Meter / Engine Hrs:</span> <strong>${jc.meterReading ? `${Number(jc.meterReading).toLocaleString('en-IN')} Hrs/KM` : 'N/A'}</strong></div>
          </div>
          <div>
            <div><span style="color: var(--text-dim); width: 130px; display: inline-block;">Maintenance Type:</span> <strong style="color: var(--logo-orange);">${escapeHtml(jc.maintenanceType || 'Repair')}</strong></div>
            <div style="margin-top: 4px;"><span style="color: var(--text-dim); width: 130px; display: inline-block;">Priority Level:</span> <strong>${escapeHtml(jc.priority || 'Normal')}</strong></div>
            <div style="margin-top: 4px;"><span style="color: var(--text-dim); width: 130px; display: inline-block;">In-Time / Out-Time:</span> <strong>${escapeHtml(jc.inTime || '--:--')} / ${escapeHtml(jc.outTime || 'Ongoing')}</strong></div>
            <div style="margin-top: 4px;"><span style="color: var(--text-dim); width: 130px; display: inline-block;">Current Status:</span> <strong style="color: ${jc.status === 'Completed' ? '#059669' : '#D97706'};">${escapeHtml(jc.status || 'In Progress')}</strong></div>
          </div>
        </div>

        <!-- Assigned Technical Crew -->
        <div style="margin-bottom: 16px; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px 16px;">
          <div style="font-size: 13px; font-weight: 800; color: var(--logo-navy); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-users-gear text-orange"></i> Assigned Technical Maintenance Crew:
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-size: 12px;">
            <div style="background: #FFF; padding: 8px 12px; border-radius: 6px; border: 1px solid #E2E8F0;">
              <span style="font-size: 10px; color: var(--text-dim); font-weight: 700; text-transform: uppercase;">Lead Mechanic / Technician:</span>
              <div style="font-weight: 700; color: var(--logo-navy); margin-top: 2px;">${escapeHtml(jc.leadMechanicName || 'Unassigned')}</div>
            </div>
            <div style="background: #FFF; padding: 8px 12px; border-radius: 6px; border: 1px solid #E2E8F0;">
              <span style="font-size: 10px; color: var(--text-dim); font-weight: 700; text-transform: uppercase;">Assistant Mechanic:</span>
              <div style="font-weight: 700; color: var(--text-dark); margin-top: 2px;">${escapeHtml(jc.assistantMechanicName || 'None')}</div>
            </div>
            <div style="background: #FFF; padding: 8px 12px; border-radius: 6px; border: 1px solid #E2E8F0;">
              <span style="font-size: 10px; color: var(--text-dim); font-weight: 700; text-transform: uppercase;">Helper / Greaser:</span>
              <div style="font-weight: 700; color: var(--text-dark); margin-top: 2px;">${escapeHtml(jc.helperName || 'None')}</div>
            </div>
          </div>
        </div>

        <!-- Issue Reported -->
        <div style="margin-bottom: 14px;">
          <div style="font-size: 12px; font-weight: 700; color: var(--logo-navy); margin-bottom: 4px;">Problem / Issue Reported by Operator:</div>
          <div style="font-size: 12px; background: #FFF5EE; border-left: 3px solid var(--logo-orange); padding: 8px 12px; border-radius: 0 6px 6px 0;">
            ${escapeHtml(jc.issueReported)}
          </div>
        </div>

        <!-- Work Carried Out -->
        <div style="margin-bottom: 16px;">
          <div style="font-size: 12px; font-weight: 700; color: var(--logo-navy); margin-bottom: 4px;">Action Taken & Work Carried Out:</div>
          <div style="font-size: 12px; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 10px 12px; border-radius: 6px; min-height: 48px;">
            ${escapeHtml(jc.workCarriedOut || 'Repair & inspection under execution in garage bay.')}
          </div>
        </div>

        <!-- Replaced Spares & Consumed Materials Table -->
        <div style="margin-bottom: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--logo-navy);">
              <i class="fa-solid fa-boxes-stacked text-orange"></i> Replaced Spares & Materials (from Issue Challans):
            </div>
            <div style="font-size: 12px; font-weight: 800; color: #059669;">
              Spares Total: ₹${Math.round(partsTotal).toLocaleString('en-IN')}
            </div>
          </div>
          <table class="slip-table" style="width: 100%; font-size: 11px; border-collapse: collapse;">
            <thead>
              <tr style="background: #F1F5F9; border-bottom: 1px solid #CBD5E1;">
                <th style="padding: 6px 8px; text-align: left;">#</th>
                <th style="padding: 6px 8px; text-align: left;">Part No</th>
                <th style="padding: 6px 8px; text-align: left;">Description</th>
                <th style="padding: 6px 8px; text-align: center;">Warranty</th>
                <th style="padding: 6px 8px; text-align: center;">Qty</th>
                <th style="padding: 6px 8px; text-align: right;">Unit Rate</th>
                <th style="padding: 6px 8px; text-align: right;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${partsRowsHtml}
            </tbody>
          </table>
        </div>

        <!-- Sign-off Block -->
        <div style="margin-top: 35px; display: flex; justify-content: space-between; align-items: flex-end; padding-top: 15px; border-top: 1px solid #CBD5E1; font-size: 11px;">
          <div style="text-align: center; width: 180px;">
            <div style="border-bottom: 1px dashed #94A3B8; height: 35px;"></div>
            <div style="margin-top: 4px; font-weight: 700;">${escapeHtml(jc.leadMechanicName || 'Lead Mechanic')}</div>
            <div style="color: var(--text-dim); font-size: 10px;">Lead Technician Sign</div>
          </div>
          <div style="text-align: center; width: 180px;">
            <div style="border-bottom: 1px dashed #94A3B8; height: 35px;"></div>
            <div style="margin-top: 4px; font-weight: 700;">Workshop Store Incharge</div>
            <div style="color: var(--text-dim); font-size: 10px;">Spares Verified Sign</div>
          </div>
          <div style="text-align: center; width: 180px;">
            <div style="border-bottom: 1px dashed #94A3B8; height: 35px;"></div>
            <div style="margin-top: 4px; font-weight: 700;">Site / Plant Manager</div>
            <div style="color: var(--text-dim); font-size: 10px;">Authorized Inspection Sign</div>
          </div>
        </div>
      </div>
    `;
  }

  openModal('modal-print-job-card');
}

function printActiveJobCard() {
  window.print();
}

function exportJobCardsExcel() {
  if (!allJobCards || allJobCards.length === 0) {
    showToast('No Job Cards to export.', 'error');
    return;
  }
  if (typeof XLSX === 'undefined') {
    showToast('Excel exporter library not loaded.', 'error');
    return;
  }

  const rows = allJobCards.map((j, idx) => ({
    'Sr No': idx + 1,
    'Job Card No': j.jobCardNo,
    'Date': j.date,
    'Vehicle Reg No': j.vehicleNo,
    'Equipment Name': j.vehicleName,
    'Maintenance Type': j.maintenanceType,
    'Priority': j.priority,
    'Issue Reported': j.issueReported,
    'Status': j.status,
    'Lead Mechanic / Technician': j.leadMechanicName,
    'Assistant Mechanic': j.assistantMechanicName || '',
    'Helper': j.helperName || '',
    'Spares Material Cost (INR)': Number(j.totalMaterialCost) || 0,
    'Labor Hours': Number(j.totalLaborHours) || 0,
    'Work Carried Out': j.workCarriedOut || '',
    'Completed Date': j.completedDate || ''
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Maintenance Job Cards');

  const fileName = `Shree_RR_Trading_Job_Cards_Register_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
  showToast('Excel Job Cards report downloaded successfully!');
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initJobCardsManagement);
  } else {
    initJobCardsManagement();
  }
}
