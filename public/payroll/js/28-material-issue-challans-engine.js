// 28. Material Issue Challans Engine (with Automatic Part Saving for Vehicle)
let challanRowCounter = 0;

function initChallansManagement() {
  const searchInput = document.getElementById('chl-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => renderChallansTable());
  }

  const vehFilter = document.getElementById('chl-vehicle-filter');
  if (vehFilter) {
    vehFilter.addEventListener('change', () => renderChallansTable());
  }

  const formChl = document.getElementById('form-material-challan');
  if (formChl) {
    formChl.addEventListener('submit', handleSaveChallan);
  }

  const btnSaveChl = document.getElementById('btn-save-challan');
  if (btnSaveChl) {
    btnSaveChl.addEventListener('click', (e) => {
      const veh = document.getElementById('chl-vehicle-select')?.value?.trim();
      if (!veh) {
        e.preventDefault();
        showToast('Please select a Plant Vehicle / Equipment for the challan.', 'error');
        document.getElementById('chl-vehicle-select')?.focus();
        return;
      }
      const tech = document.getElementById('chl-issued-to')?.value?.trim();
      if (!tech) {
        e.preventDefault();
        showToast('Please select a Receiving Mechanic / Technician.', 'error');
        document.getElementById('chl-issued-to')?.focus();
        return;
      }
      const itemRows = document.querySelectorAll('#challan-items-tbody tr.challan-item-row');
      let hasValidItem = false;
      itemRows.forEach(r => {
        if (r.querySelector('.chl-part-name')?.value?.trim()) hasValidItem = true;
      });
      if (!hasValidItem) {
        e.preventDefault();
        showToast('Please enter at least one spare part name / item row.', 'error');
        return;
      }
    });
  }

  const btnAdd = document.getElementById('btn-open-issue-challan');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => openIssueChallanModal());
  }

  const btnAddRow = document.getElementById('btn-challan-add-item-row');
  if (btnAddRow) {
    btnAddRow.addEventListener('click', () => addChallanItemRow());
  }

  const vehSelect = document.getElementById('chl-vehicle-select');
  if (vehSelect) {
    vehSelect.addEventListener('change', handleChallanVehicleChange);
  }

  const btnExport = document.getElementById('btn-export-challans-excel');
  if (btnExport) {
    btnExport.addEventListener('click', exportChallansExcel);
  }
}

function renderChallansTable() {
  const tbody = document.getElementById('challans-table-body');
  if (!tbody) return;

  const search = (document.getElementById('chl-search-input')?.value || '').toLowerCase().trim();
  const vehFilter = document.getElementById('chl-vehicle-filter')?.value || 'ALL';

  // Update dynamic vehicle filter options
  const filterVehSelect = document.getElementById('chl-vehicle-filter');
  if (filterVehSelect && filterVehSelect.options.length <= 1) {
    let vehHtml = `<option value="ALL">All Plant Vehicles</option>`;
    const uniqueVehs = Array.from(new Set((allChallans || []).map(c => c.vehicleNo).filter(Boolean))).sort();
    uniqueVehs.forEach(v => {
      vehHtml += `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`;
    });
    filterVehSelect.innerHTML = vehHtml;
  }

  const filtered = (allChallans || []).filter((ch) => {
    const matchSearch =
      !search ||
      (ch.challanNo && ch.challanNo.toLowerCase().includes(search)) ||
      (ch.vehicleNo && ch.vehicleNo.toLowerCase().includes(search)) ||
      (ch.vehicleName && ch.vehicleName.toLowerCase().includes(search)) ||
      (ch.jobCardNo && ch.jobCardNo.toLowerCase().includes(search)) ||
      (ch.issuedToName && ch.issuedToName.toLowerCase().includes(search)) ||
      (ch.remarks && ch.remarks.toLowerCase().includes(search));

    const matchVeh = vehFilter === 'ALL' || ch.vehicleNo === vehFilter;
    return matchSearch && matchVeh;
  });

  // Calculate totals
  let totalChallansVal = 0;
  let totalPartsIssued = 0;
  (allChallans || []).forEach(ch => {
    totalChallansVal += Number(ch.totalAmount) || 0;
    totalPartsIssued += Number(ch.totalQty) || 0;
  });

  const kpiCount = document.getElementById('kpi-chl-count') || document.getElementById('kpi-chl-total');
  if (kpiCount) kpiCount.textContent = (allChallans || []).length;

  const kpiVal = document.getElementById('kpi-chl-total-val');
  if (kpiVal) kpiVal.textContent = `₹${Math.round(totalChallansVal).toLocaleString('en-IN')}`;

  const kpiParts = document.getElementById('kpi-chl-total-parts') || document.getElementById('kpi-chl-items-count');
  if (kpiParts) kpiParts.textContent = `${totalPartsIssued} Items`;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center" style="padding: 35px; color: var(--text-dim);">No Material Issue Challans found. Click "+ Issue Material Challan" to issue parts to a vehicle.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((ch) => {
    const total = Number(ch.totalAmount) || 0;
    const itemsCount = Array.isArray(ch.items) ? ch.items.length : (ch.totalItems || 0);

    return `
      <tr>
        <td>
          <span class="emp-cell-id" style="font-family: var(--font-mono); font-weight: 800; color: var(--logo-navy);">
            <i class="fa-solid fa-receipt text-orange"></i> ${escapeHtml(ch.challanNo)}
          </span>
          <span class="emp-cell-sub"><i class="fa-solid fa-calendar"></i> ${escapeHtml(ch.date || '')}</span>
        </td>
        <td>
          <span class="emp-cell-name" style="font-weight: 700; color: var(--logo-navy);">${escapeHtml(ch.vehicleNo)}</span>
          <span class="emp-cell-sub">${escapeHtml(ch.vehicleName || 'Equipment')}</span>
        </td>
        <td>
          ${ch.jobCardNo ? `
            <span class="badge-pill" style="font-family: var(--font-mono); font-size: 11px; background: #EEF2FF; color: #4338CA;">
              <i class="fa-solid fa-clipboard-check"></i> ${escapeHtml(ch.jobCardNo)}
            </span>
          ` : `<span style="color: var(--text-dim); font-size: 11px;">Direct Issue</span>`}
        </td>
        <td>
          <div style="font-weight: 700; color: var(--logo-navy); font-size: 13px;">
            <i class="fa-solid fa-user-wrench text-orange"></i> ${escapeHtml(ch.issuedToName || 'Mechanic')}
          </div>
          <span class="emp-cell-sub">${escapeHtml(ch.issuedToRole || 'Technician')}</span>
        </td>
        <td>
          <span class="badge-pill" style="font-weight: 700;">
            ${itemsCount} Item${itemsCount === 1 ? '' : 's'} (${ch.totalQty || 0} Qty)
          </span>
        </td>
        <td>
          <strong style="color: #059669; font-size: 14px;">₹${total.toLocaleString('en-IN')}</strong>
        </td>
        <td style="max-width: 180px;">
          <div style="font-size: 11px; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(ch.remarks || '')}">
            ${escapeHtml(ch.remarks || 'Material issued for maintenance')}
          </div>
          <span class="badge-pill badge-success" style="font-size: 10px; margin-top: 2px;">${escapeHtml(ch.status || 'Issued')}</span>
        </td>
        <td class="text-right">
          <div style="display: inline-flex; gap: 6px; align-items: center;">
            <button class="btn btn-outline btn-xs" title="Print Official Challan Slip" onclick="openPrintChallanModal('${ch.id || ch.challanNo}')">
              <i class="fa-solid fa-print text-navy"></i> Print
            </button>
            <button class="btn-icon-only text-success" title="View Parts for this Vehicle" onclick="viewVehicleConsumptionDetails('${escapeHtml(ch.vehicleNo)}')">
              <i class="fa-solid fa-boxes-stacked"></i>
            </button>
            <button class="btn-icon-only btn-danger" title="Void & Delete Challan (Restores Inventory)" onclick="deleteChallan('${ch.id || ch.challanNo}', '${escapeHtml(ch.challanNo)}')">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openIssueChallanModal(prefillVehNo = '', prefillJcNo = '') {
  document.getElementById('modal-challan-title').innerHTML = `<i class="fa-solid fa-receipt text-orange"></i> Issue Material Delivery Challan`;
  document.getElementById('form-material-challan').reset();
  document.getElementById('chl-id').value = '';
  document.getElementById('chl-number').value = `CH-${new Date().getFullYear()}-${((allChallans || []).length + 1).toString().padStart(4, '0')}`;
  document.getElementById('chl-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('chl-issued-by').value = (currentUser && currentUser.name) ? currentUser.name : 'Workshop Storekeeper';

  // Populate vehicle dropdown
  populateChallanVehicleDropdown(prefillVehNo);
  handleChallanVehicleChange(null, prefillJcNo);
  populateTechnicianDropdowns();

  // Reset items container and add first row
  const tbody = document.getElementById('challan-items-tbody');
  if (tbody) tbody.innerHTML = '';
  challanRowCounter = 0;
  addChallanItemRow();

  openModal('modal-challan');
}

function populateChallanVehicleDropdown(selectedVehNo = '') {
  const sel = document.getElementById('chl-vehicle-select');
  if (!sel) return;

  const targetVeh = String(selectedVehNo || '').trim().toUpperCase();
  let html = `<option value="">-- Select Plant Vehicle / Equipment * --</option>`;
  (allVehicles || []).forEach(v => {
    if (!v) return;
    const vNo = String(v.vehicleNo || '').trim();
    if (!vNo) return;
    const isSelected = targetVeh && vNo.toUpperCase() === targetVeh;
    html += `<option value="${escapeHtml(vNo)}" data-name="${escapeHtml(v.name || 'Equipment')}" ${isSelected ? 'selected' : ''}>${escapeHtml(vNo)} - ${escapeHtml(v.name || 'Equipment')}</option>`;
  });
  sel.innerHTML = html;
}

function handleChallanVehicleChange(e, prefillJcNo = '') {
  const vehNo = String(document.getElementById('chl-vehicle-select')?.value || '').trim();
  const jcSelect = document.getElementById('chl-job-card-select');
  if (!jcSelect) return;

  if (!vehNo) {
    jcSelect.innerHTML = `<option value="">-- No Vehicle Selected --</option>`;
    return;
  }

  const matchVeh = vehNo.toUpperCase();
  const targetJc = String(prefillJcNo || '').trim().toUpperCase();

  // Filter job cards for this vehicle
  const relevantJcs = (allJobCards || []).filter(j => j && String(j.vehicleNo || '').trim().toUpperCase() === matchVeh);
  let html = `<option value="">-- None (Direct Spare Issue without Job Card) --</option>`;
  relevantJcs.forEach(j => {
    const jcNo = String(j.jobCardNo || '').trim();
    const isSelected = targetJc && jcNo.toUpperCase() === targetJc;
    html += `<option value="${escapeHtml(jcNo)}" ${isSelected ? 'selected' : ''}>${escapeHtml(jcNo)} - ${escapeHtml(j.maintenanceType || 'Maintenance')} [${escapeHtml(j.status || 'In Progress')}]</option>`;
  });
  jcSelect.innerHTML = html;
}

function addChallanItemRow() {
  const tbody = document.getElementById('challan-items-tbody');
  if (!tbody) return;

  challanRowCounter++;
  const rowId = `chl-row-${challanRowCounter}`;

  // Build inventory options
  let invOptionsHtml = `<option value="">-- Select Spare from Inventory (or type below) --</option>`;
  (allInventory || []).forEach(inv => {
    invOptionsHtml += `<option value="${escapeHtml(inv.partNo)}" data-name="${escapeHtml(inv.name)}" data-cat="${escapeHtml(inv.category || 'General')}" data-unit="${escapeHtml(inv.unit || 'Nos')}" data-price="${inv.unitPrice || 0}" data-wty="${escapeHtml(inv.warranty || 'N/A')}" data-stock="${inv.stockQty || 0}">
      ${escapeHtml(inv.partNo)} - ${escapeHtml(inv.name)} (Avail: ${inv.stockQty} ${escapeHtml(inv.unit || 'Nos')} @ ₹${Number(inv.unitPrice || 0).toLocaleString('en-IN')})
    </option>`;
  });

  const tr = document.createElement('tr');
  tr.id = rowId;
  tr.className = 'challan-item-row';
  tr.innerHTML = `
    <td>
      <select class="custom-select chl-part-selector" style="font-size: 12px; margin-bottom: 4px;" onchange="handleChallanPartSelect('${rowId}', this)">
        ${invOptionsHtml}
      </select>
      <input type="text" class="custom-input chl-part-name" placeholder="Part Name / Description *" required style="font-size: 12px; font-weight: 600;">
      <input type="hidden" class="chl-part-no">
      <input type="hidden" class="chl-part-cat">
    </td>
    <td>
      <input type="number" class="custom-input chl-qty" value="1" min="0.01" step="any" required style="font-size: 13px; text-align: center; width: 75px;" oninput="updateChallanRowTotal('${rowId}')">
      <div class="chl-stock-hint" style="font-size: 10px; color: var(--text-dim); margin-top: 2px; text-align: center;"></div>
    </td>
    <td>
      <select class="custom-select chl-unit" style="font-size: 12px; width: 80px;">
        <option value="Nos">Nos</option>
        <option value="Ltrs">Ltrs</option>
        <option value="Sets">Sets</option>
        <option value="Mtrs">Mtrs</option>
        <option value="Kgs">Kgs</option>
        <option value="Pcs">Pcs</option>
      </select>
    </td>
    <td>
      <input type="number" class="custom-input chl-price" placeholder="Rate ₹" min="0" step="any" required style="font-size: 13px; text-align: right; width: 95px;" oninput="updateChallanRowTotal('${rowId}')">
    </td>
    <td>
      <input type="text" class="custom-input chl-wty" placeholder="e.g. 6 Months" value="6 Months" style="font-size: 12px; width: 100px;">
    </td>
    <td>
      <input type="text" class="custom-input chl-total-val" readonly value="₹0" style="font-size: 13px; font-weight: 700; color: #059669; text-align: right; width: 105px; background: #F8FAFC;">
    </td>
    <td class="text-center">
      <button type="button" class="btn-icon-only btn-danger" title="Remove Item Row" onclick="removeChallanItemRow('${rowId}')">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </td>
  `;

  tbody.appendChild(tr);
  updateChallanTotals();
}

function handleChallanPartSelect(rowId, selectElem) {
  const row = document.getElementById(rowId);
  if (!row) return;

  const selectedOpt = selectElem.options[selectElem.selectedIndex];
  if (!selectedOpt || !selectedOpt.value) return;

  const partNo = selectedOpt.value;
  const name = selectedOpt.getAttribute('data-name') || '';
  const cat = selectedOpt.getAttribute('data-cat') || 'General';
  const unit = selectedOpt.getAttribute('data-unit') || 'Nos';
  const price = selectedOpt.getAttribute('data-price') || '0';
  const wty = selectedOpt.getAttribute('data-wty') || 'N/A';
  const stock = selectedOpt.getAttribute('data-stock') || '0';

  row.querySelector('.chl-part-no').value = partNo;
  row.querySelector('.chl-part-name').value = name;
  row.querySelector('.chl-part-cat').value = cat;
  row.querySelector('.chl-unit').value = unit;
  row.querySelector('.chl-price').value = price;
  row.querySelector('.chl-wty').value = wty;

  const hint = row.querySelector('.chl-stock-hint');
  if (hint) {
    hint.innerHTML = `<span style="color: ${Number(stock) > 0 ? '#059669' : '#DC2626'}; font-weight: 700;">In Stock: ${stock}</span>`;
  }

  updateChallanRowTotal(rowId);
}

function updateChallanRowTotal(rowId) {
  const row = document.getElementById(rowId);
  if (!row) return;

  const qty = Number(row.querySelector('.chl-qty')?.value) || 0;
  const price = Number(row.querySelector('.chl-price')?.value) || 0;
  const total = Math.round(qty * price * 100) / 100;

  const totalInput = row.querySelector('.chl-total-val');
  if (totalInput) totalInput.value = `₹${total.toLocaleString('en-IN')}`;

  updateChallanTotals();
}

function removeChallanItemRow(rowId) {
  const row = document.getElementById(rowId);
  if (row) {
    const tbody = row.parentElement;
    row.remove();
    if (tbody && tbody.children.length === 0) {
      addChallanItemRow();
    }
  }
  updateChallanTotals();
}

function updateChallanTotals() {
  const rows = document.querySelectorAll('#challan-items-tbody tr.challan-item-row');
  let grandTotal = 0;
  let totalQty = 0;

  rows.forEach(r => {
    const qty = Number(r.querySelector('.chl-qty')?.value) || 0;
    const price = Number(r.querySelector('.chl-price')?.value) || 0;
    grandTotal += (qty * price);
    totalQty += qty;
  });

  const totValElem = document.getElementById('chl-summary-total-amount');
  if (totValElem) totValElem.textContent = `₹${Math.round(grandTotal).toLocaleString('en-IN')}`;

  const totItemsElem = document.getElementById('chl-summary-items-count');
  if (totItemsElem) totItemsElem.textContent = `${rows.length} Item${rows.length === 1 ? '' : 's'} (${totalQty} Total Qty)`;

  const inWordsElem = document.getElementById('chl-summary-amount-in-words');
  if (inWordsElem) {
    inWordsElem.textContent = (typeof numberToWordsIndian === 'function') ? numberToWordsIndian(Math.round(grandTotal)) : `${Math.round(grandTotal)} Rupees Only`;
  }
}

// AUTOMATIC PART SAVING FOR CHALLAN WITH VEHICLE
async function handleSaveChallan(e) {
  if (e && e.preventDefault) e.preventDefault();
  const challanNo = document.getElementById('chl-number')?.value.trim() || `CH-${new Date().getFullYear()}-${((allChallans || []).length + 1).toString().padStart(4, '0')}`;
  const date = document.getElementById('chl-date')?.value || new Date().toISOString().split('T')[0];
  const vehSelect = document.getElementById('chl-vehicle-select');
  const vehicleNo = vehSelect ? vehSelect.value.trim() : '';
  const selectedVehOpt = (vehSelect && vehSelect.selectedIndex >= 0) ? vehSelect.options[vehSelect.selectedIndex] : null;
  const vehicleName = selectedVehOpt?.getAttribute('data-name') || 'Plant Equipment';

  if (!vehicleNo) {
    showToast('Please select a plant vehicle for the challan.', 'error');
    return;
  }

  const jobCardNo = document.getElementById('chl-job-card-select')?.value.trim() || '';

  const techSelect = document.getElementById('chl-issued-to');
  const issuedToId = techSelect ? techSelect.value.trim() : '';
  const techSelectedOpt = (techSelect && techSelect.selectedIndex >= 0) ? techSelect.options[techSelect.selectedIndex] : null;
  const issuedToName = techSelectedOpt?.getAttribute('data-name') || (techSelectedOpt?.textContent || 'Technician');
  const issuedToRole = techSelectedOpt?.getAttribute('data-role') || 'Mechanic';

  if (!issuedToId) {
    showToast('Please select a Receiving Mechanic / Technician.', 'error');
    return;
  }

  const issuedBy = document.getElementById('chl-issued-by')?.value?.trim() || 'Workshop Storekeeper';
  const remarks = document.getElementById('chl-remarks')?.value?.trim() || '';
  const autoSaveNewParts = document.getElementById('chl-auto-save-parts')?.checked !== false;

  // Extract items from rows
  const itemRows = document.querySelectorAll('#challan-items-tbody tr.challan-item-row');
  const items = [];

  itemRows.forEach(r => {
    const partName = r.querySelector('.chl-part-name')?.value.trim();
    if (!partName) return;

    let partNo = r.querySelector('.chl-part-no')?.value.trim();
    if (!partNo) {
      partNo = `PRT-${partName.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    }
    const category = r.querySelector('.chl-part-cat')?.value.trim() || 'General Spares';
    const qty = Number(r.querySelector('.chl-qty')?.value) || 1;
    const unit = r.querySelector('.chl-unit')?.value.trim() || 'Nos';
    const unitPrice = Number(r.querySelector('.chl-price')?.value) || 0;
    const warranty = r.querySelector('.chl-wty')?.value.trim() || 'N/A';

    items.push({
      partNo,
      partName,
      category,
      qty,
      unit,
      unitPrice,
      totalPrice: Math.round(qty * unitPrice * 100) / 100,
      warranty
    });
  });

  if (items.length === 0) {
    showToast('Please add at least one valid material / spare part to the challan.', 'error');
    return;
  }

  const payload = {
    challanNo,
    date,
    vehicleNo,
    vehicleName,
    jobCardNo,
    issuedToId,
    issuedToName,
    issuedToRole,
    issuedBy,
    remarks,
    autoSaveNewParts,
    items
  };

  try {
    const res = await fetch('/api/payroll/challans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || `Challan ${challanNo} issued & parts saved to vehicle!`);
      closeModal('modal-challan');
      await Promise.all([
        fetchChallans(),
        fetchInventory(),
        fetchJobCards(),
        fetchVehicleConsumption()
      ]);
      if (typeof updateVehicleSubNavBadges === 'function') updateVehicleSubNavBadges();
      // Prompt to preview/print the issued challan
      openPrintChallanModal(data.challan?.id || challanNo);
    } else {
      showToast(data.message || 'Error issuing challan', 'error');
    }
  } catch (err) {
    console.error('Challan save error:', err);
    // Offline local fallback
    let grandTotal = 0;
    let totalQty = 0;
    items.forEach(it => {
      grandTotal += it.totalPrice;
      totalQty += it.qty;
      // Deduct stock locally
      const inv = (allInventory || []).find(i => i && String(i.partNo || '').trim().toUpperCase() === String(it.partNo || '').trim().toUpperCase());
      if (inv) {
        inv.stockQty = Math.max(0, (Number(inv.stockQty) || 0) - it.qty);
      }
    });

    const newChallan = {
      id: `chl-${Date.now()}`,
      ...payload,
      totalItems: items.length,
      totalQty,
      totalAmount: grandTotal,
      status: 'Issued',
      createdAt: new Date().toISOString()
    };
    allChallans.unshift(newChallan);

    // Save parts to local vehicle consumption
    items.forEach(it => {
      allVehiclePartConsumptions.push({
        id: `vpc-${Date.now()}-${Math.random()}`,
        challanNo,
        challanDate: date,
        vehicleNo,
        vehicleName,
        jobCardNo,
        ...it,
        issuedToId,
        issuedToName,
        createdAt: new Date().toISOString()
      });
    });

    try {
      localStorage.setItem(STORAGE_KEYS.CHALLANS, JSON.stringify(allChallans));
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(allInventory));
    } catch (e) {}

    showToast(`Challan ${challanNo} issued locally & saved with vehicle.`);
    closeModal('modal-challan');
    renderChallansTable();
    if (typeof renderInventoryTable === 'function') renderInventoryTable();
    if (typeof renderVehicleConsumptionAnalytics === 'function') renderVehicleConsumptionAnalytics();
    openPrintChallanModal(newChallan.id);
  }
}

async function deleteChallan(id, challanNo) {
  if (!confirm(`Are you sure you want to void and delete Challan "${challanNo}"? This will restore spare parts stock in inventory.`)) return;

  try {
    const res = await fetch(`/api/payroll/challans/${encodeURIComponent(id)}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || `Challan "${challanNo}" voided.`);
      allChallans = allChallans.filter(c => c.id !== id && c.challanNo !== id);
      try { localStorage.setItem(STORAGE_KEYS.CHALLANS, JSON.stringify(allChallans)); } catch (e) {}
      await Promise.all([
        fetchChallans(),
        fetchInventory(),
        fetchJobCards(),
        fetchVehicleConsumption()
      ]);
    } else {
      showToast(data.message || 'Error deleting challan', 'error');
    }
  } catch (err) {
    allChallans = allChallans.filter(c => c.id !== id && c.challanNo !== id);
    try { localStorage.setItem(STORAGE_KEYS.CHALLANS, JSON.stringify(allChallans)); } catch (e) {}
    showToast(`Challan "${challanNo}" removed locally.`);
    renderChallansTable();
  }
}

function openPrintChallanModal(id) {
  const ch = (allChallans || []).find(c => c.id === id || c.challanNo === id);
  if (!ch) return;
  currentActiveChallan = ch;

  let itemsRowsHtml = '';
  (ch.items || []).forEach((it, idx) => {
    const lineTot = Number(it.totalPrice) || (Number(it.qty) * Number(it.unitPrice));
    itemsRowsHtml += `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td><strong style="font-family: var(--font-mono); color: var(--logo-navy);">${escapeHtml(it.partNo)}</strong></td>
        <td>
          <div style="font-weight: 700;">${escapeHtml(it.partName)}</div>
          <div style="font-size: 10px; color: var(--text-dim);">${escapeHtml(it.category || 'General')}</div>
        </td>
        <td style="text-align: center;"><span class="wty-tag"><i class="fa-solid fa-shield-halved text-success"></i> ${escapeHtml(it.warranty || 'N/A')}</span></td>
        <td style="text-align: center;"><strong>${it.qty}</strong> ${escapeHtml(it.unit || 'Nos')}</td>
        <td style="text-align: right;">₹${Number(it.unitPrice || 0).toLocaleString('en-IN')}</td>
        <td style="text-align: right;"><strong>₹${Math.round(lineTot).toLocaleString('en-IN')}</strong></td>
      </tr>
    `;
  });

  const totAmount = Number(ch.totalAmount) || 0;
  const inWords = numberToWordsIndian(Math.round(totAmount));

  const printContainer = document.getElementById('print-challan-container') || document.getElementById('print-challan-content');
  if (printContainer) {
    printContainer.innerHTML = `
      <div class="official-challan-sheet">
        <!-- Header -->
        <div style="border-bottom: 2px solid var(--logo-navy); padding-bottom: 12px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-size: 20px; font-weight: 800; color: var(--logo-navy); letter-spacing: 0.5px;">SHREE RR TRADING COMPANY</div>
            <div style="font-size: 11px; color: var(--logo-orange); font-weight: 700; text-transform: uppercase;">Heavy Fleets & HEMM Workshop Maintenance Store</div>
            <div style="font-size: 11px; color: var(--text-muted);">ACC Chanda Cement Works • Ambuja Darlaghat Plants</div>
          </div>
          <div style="text-align: right;">
            <div class="sheet-badge-title" style="background: var(--logo-orange); color: #FFF; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 800; display: inline-block;">
              MATERIAL DELIVERY / ISSUE CHALLAN
            </div>
            <div style="font-family: var(--font-mono); font-size: 16px; font-weight: 800; color: var(--logo-navy); margin-top: 4px;">
              ${escapeHtml(ch.challanNo)}
            </div>
            <div style="font-size: 11px; color: var(--text-muted);">Issue Date: <strong>${escapeHtml(ch.date || '')}</strong></div>
          </div>
        </div>

        <!-- Issue Metadata Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 12px;">
          <div>
            <div><span style="color: var(--text-dim); width: 125px; display: inline-block;">Vehicle Reg No:</span> <strong style="font-size: 14px; color: var(--logo-navy);">${escapeHtml(ch.vehicleNo)}</strong></div>
            <div style="margin-top: 4px;"><span style="color: var(--text-dim); width: 125px; display: inline-block;">Equipment Name:</span> <strong>${escapeHtml(ch.vehicleName || 'Plant Machinery')}</strong></div>
            <div style="margin-top: 4px;"><span style="color: var(--text-dim); width: 125px; display: inline-block;">Linked Job Card:</span> <strong style="color: var(--logo-orange);">${escapeHtml(ch.jobCardNo || 'Direct Vehicle Issue')}</strong></div>
          </div>
          <div>
            <div><span style="color: var(--text-dim); width: 125px; display: inline-block;">Issued To (Mechanic):</span> <strong style="color: var(--logo-navy);">${escapeHtml(ch.issuedToName || 'Mechanic')}</strong> (${escapeHtml(ch.issuedToRole || 'Technician')})</div>
            <div style="margin-top: 4px;"><span style="color: var(--text-dim); width: 125px; display: inline-block;">Issued By (Store):</span> <strong>${escapeHtml(ch.issuedBy || 'Store Incharge')}</strong></div>
            <div style="margin-top: 4px;"><span style="color: var(--text-dim); width: 125px; display: inline-block;">Challan Status:</span> <strong style="color: #059669;"><i class="fa-solid fa-circle-check"></i> ${escapeHtml(ch.status || 'Issued')}</strong></div>
          </div>
        </div>

        <!-- Purpose / Remarks -->
        <div style="margin-bottom: 14px; font-size: 12px;">
          <span style="font-weight: 700; color: var(--logo-navy);">Issue Purpose / Remarks:</span>
          <span style="color: var(--text-dark); margin-left: 6px;">${escapeHtml(ch.remarks || 'Material issued for vehicle maintenance & overhaul.')}</span>
        </div>

        <!-- Itemized Spares Table -->
        <table class="slip-table" style="width: 100%; font-size: 11px; border-collapse: collapse; margin-bottom: 16px;">
          <thead>
            <tr style="background: #F1F5F9; border-bottom: 2px solid #CBD5E1;">
              <th style="padding: 8px 6px; text-align: center; width: 35px;">#</th>
              <th style="padding: 8px 6px; text-align: left; width: 110px;">Part No</th>
              <th style="padding: 8px 6px; text-align: left;">Item Description & Category</th>
              <th style="padding: 8px 6px; text-align: center; width: 110px;">Warranty</th>
              <th style="padding: 8px 6px; text-align: center; width: 85px;">Quantity</th>
              <th style="padding: 8px 6px; text-align: right; width: 95px;">Rate (₹)</th>
              <th style="padding: 8px 6px; text-align: right; width: 110px;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRowsHtml}
          </tbody>
          <tfoot>
            <tr style="background: #FFF5EE; border-top: 2px solid var(--border-orange); font-size: 13px;">
              <td colspan="4" style="padding: 10px; font-weight: 700; text-align: right; color: var(--logo-navy);">
                GRAND TOTAL AMOUNT:
              </td>
              <td style="padding: 10px; text-align: center; font-weight: 800; color: var(--logo-navy);">
                ${ch.totalQty || 0}
              </td>
              <td></td>
              <td style="padding: 10px; text-align: right; font-weight: 800; color: #059669; font-size: 15px;">
                ₹${Math.round(totAmount).toLocaleString('en-IN')}
              </td>
            </tr>
          </tfoot>
        </table>

        <!-- Amount in Words -->
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 10px 14px; border-radius: 6px; margin-bottom: 30px; font-size: 12px;">
          <span style="font-weight: 700; color: var(--logo-navy);">Amount in Words:</span>
          <span style="color: #059669; font-weight: 700; margin-left: 6px;">Rupees ${escapeHtml(inWords)}</span>
        </div>

        <!-- Sign-off Block -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 20px; border-top: 1px solid #CBD5E1; font-size: 11px;">
          <div style="text-align: center; width: 220px;">
            <div style="border-bottom: 1px dashed #94A3B8; height: 35px;"></div>
            <div style="margin-top: 5px; font-weight: 700; color: var(--logo-navy);">${escapeHtml(ch.issuedToName || 'Receiving Mechanic')}</div>
            <div style="color: var(--text-dim); font-size: 10px;">Material Received & Fitted by Mechanic</div>
          </div>
          <div style="text-align: center; width: 220px;">
            <div style="border-bottom: 1px dashed #94A3B8; height: 35px;"></div>
            <div style="margin-top: 5px; font-weight: 700; color: var(--logo-navy);">${escapeHtml(ch.issuedBy || 'Store Incharge')}</div>
            <div style="color: var(--text-dim); font-size: 10px;">Store Keeper / Material Dispatch Sign</div>
          </div>
        </div>
      </div>
    `;
  }

  openModal('modal-print-challan');
}

function printActiveChallan() {
  window.print();
}

function exportChallansExcel() {
  if (!allChallans || allChallans.length === 0) {
    showToast('No Challans to export.', 'error');
    return;
  }
  if (typeof XLSX === 'undefined') {
    showToast('Excel exporter library not loaded.', 'error');
    return;
  }

  const rows = [];
  allChallans.forEach((ch, cIdx) => {
    (ch.items || []).forEach((it, iIdx) => {
      rows.push({
        'Challan No': ch.challanNo,
        'Date': ch.date,
        'Vehicle Reg No': ch.vehicleNo,
        'Equipment Name': ch.vehicleName,
        'Job Card No': ch.jobCardNo || 'Direct',
        'Issued To Mechanic': ch.issuedToName,
        'Part No': it.partNo,
        'Part Description': it.partName,
        'Category': it.category || 'General',
        'Quantity': Number(it.qty) || 0,
        'Unit': it.unit || 'Nos',
        'Unit Price (INR)': Number(it.unitPrice) || 0,
        'Total Item Price (INR)': Number(it.totalPrice) || 0,
        'Warranty': it.warranty || 'N/A',
        'Challan Grand Total (INR)': Number(ch.totalAmount) || 0,
        'Remarks': ch.remarks || ''
      });
    });
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Material Issue Challans');

  const fileName = `Shree_RR_Trading_Material_Challans_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
  showToast('Excel Material Challans report downloaded successfully!');
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChallansManagement);
  } else {
    initChallansManagement();
  }
}
