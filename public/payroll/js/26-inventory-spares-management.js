// 26. Spares & Materials Inventory Management Engine (with Wty & Price)
function initInventoryManagement() {
  const searchInput = document.getElementById('inv-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => renderInventoryTable());
  }

  const catFilter = document.getElementById('inv-category-filter');
  if (catFilter) {
    catFilter.addEventListener('change', () => renderInventoryTable());
  }

  const statusFilter = document.getElementById('inv-status-filter');
  if (statusFilter) {
    statusFilter.addEventListener('change', () => renderInventoryTable());
  }

  const formInv = document.getElementById('form-inventory-item');
  if (formInv) {
    formInv.addEventListener('submit', handleSaveInventoryItem);
  }

  const formInward = document.getElementById('form-stock-inward');
  if (formInward) {
    formInward.addEventListener('submit', handleSaveStockInward);
  }

  const btnAdd = document.getElementById('btn-open-add-inventory-modal');
  if (btnAdd) {
    btnAdd.addEventListener('click', openAddInventoryModal);
  }

  const btnExport = document.getElementById('btn-export-inventory-excel');
  if (btnExport) {
    btnExport.addEventListener('click', exportInventoryExcel);
  }
}

function renderInventoryTable() {
  const tbody = document.getElementById('inventory-table-body');
  if (!tbody) return;

  const search = (document.getElementById('inv-search-input')?.value || '').toLowerCase().trim();
  const catFilter = document.getElementById('inv-category-filter')?.value || 'ALL';
  const statusFilter = document.getElementById('inv-status-filter')?.value || 'ALL';

  // Update dynamic category options
  const catSelect = document.getElementById('inv-category-filter');
  if (catSelect && catSelect.options.length <= 1) {
    const cats = Array.from(new Set(allInventory.map(i => i.category).filter(Boolean))).sort();
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      catSelect.appendChild(opt);
    });
  }

  const filtered = (allInventory || []).filter((item) => {
    const matchSearch =
      !search ||
      (item.partNo && item.partNo.toLowerCase().includes(search)) ||
      (item.name && item.name.toLowerCase().includes(search)) ||
      (item.supplier && item.supplier.toLowerCase().includes(search)) ||
      (item.warranty && item.warranty.toLowerCase().includes(search));

    const matchCat = catFilter === 'ALL' || item.category === catFilter;

    const qty = Number(item.stockQty) || 0;
    const min = Number(item.minStock) || 2;
    let matchStatus = true;
    if (statusFilter === 'IN_STOCK') matchStatus = qty > min;
    else if (statusFilter === 'LOW_STOCK') matchStatus = qty > 0 && qty <= min;
    else if (statusFilter === 'OUT_OF_STOCK') matchStatus = qty <= 0;

    return matchSearch && matchCat && matchStatus;
  });

  // Calculate KPIs
  let totalValuation = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  (allInventory || []).forEach(item => {
    const q = Number(item.stockQty) || 0;
    const p = Number(item.unitPrice) || 0;
    const m = Number(item.minStock) || 2;
    totalValuation += (q * p);
    if (q <= 0) outOfStockCount++;
    else if (q <= m) lowStockCount++;
  });

  const kpiCount = document.getElementById('kpi-inv-total-items');
  if (kpiCount) kpiCount.textContent = (allInventory || []).length;

  const kpiVal = document.getElementById('kpi-inv-total-valuation');
  if (kpiVal) kpiVal.textContent = `₹${Math.round(totalValuation).toLocaleString('en-IN')}`;

  const kpiLow = document.getElementById('kpi-inv-low-stock');
  if (kpiLow) kpiLow.textContent = lowStockCount;

  const kpiOut = document.getElementById('kpi-inv-out-of-stock');
  if (kpiOut) kpiOut.textContent = outOfStockCount;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center" style="padding: 35px; color: var(--text-dim);">No spare parts match your filters. Click "+ Add Spare Part" to register new inventory.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((item) => {
    const qty = Number(item.stockQty) || 0;
    const price = Number(item.unitPrice) || 0;
    const min = Number(item.minStock) || 2;
    const val = qty * price;

    let stockBadgeClass = 'badge-success';
    let stockStatusText = 'In Stock';
    if (qty <= 0) {
      stockBadgeClass = 'badge-danger';
      stockStatusText = 'Out of Stock';
    } else if (qty <= min) {
      stockBadgeClass = 'badge-warning';
      stockStatusText = 'Low Stock';
    }

    const wty = item.warranty || 'N/A';
    const hasWty = wty && wty !== 'N/A' && !wty.toLowerCase().includes('no');
    const wtyBadgeClass = hasWty ? 'wty-active-badge' : 'wty-none-badge';

    return `
      <tr>
        <td>
          <span class="emp-cell-id" style="font-family: var(--font-mono); font-weight: 700; color: var(--logo-navy);">
            <i class="fa-solid fa-barcode text-orange"></i> ${escapeHtml(item.partNo)}
          </span>
        </td>
        <td>
          <span class="emp-cell-name" style="font-weight: 700;">${escapeHtml(item.name)}</span>
          <span class="emp-cell-sub">Supplier: ${escapeHtml(item.supplier || 'OEM')} ${item.location ? `| Loc: ${escapeHtml(item.location)}` : ''}</span>
        </td>
        <td>
          <span class="badge-pill">${escapeHtml(item.category || 'General')}</span>
        </td>
        <td>
          <span class="stock-pill ${stockBadgeClass}">
            <strong>${qty}</strong> ${escapeHtml(item.unit || 'Nos')}
          </span>
          <div style="font-size: 10px; color: var(--text-dim); margin-top: 3px;">Min: ${min} ${escapeHtml(item.unit || 'Nos')}</div>
        </td>
        <td>
          <strong style="color: var(--logo-navy); font-size: 14px;">₹${price.toLocaleString('en-IN')}</strong>
          <span class="emp-cell-sub">per ${escapeHtml(item.unit || 'Nos')}</span>
        </td>
        <td>
          <span class="badge-pill ${wtyBadgeClass}">
            <i class="fa-solid ${hasWty ? 'fa-shield-halved text-success' : 'fa-circle-xmark text-muted'}"></i> ${escapeHtml(wty)}
          </span>
        </td>
        <td>
          <strong style="color: #059669; font-size: 14px;">₹${Math.round(val).toLocaleString('en-IN')}</strong>
        </td>
        <td>
          <span class="badge-pill ${stockBadgeClass}" style="font-size: 11px;">${stockStatusText}</span>
        </td>
        <td class="text-right">
          <div style="display: inline-flex; gap: 6px; align-items: center;">
            <button class="btn btn-outline-success btn-xs" title="Stock Inward" onclick="openStockInwardModal('${item.id || item.partNo}')">
              <i class="fa-solid fa-arrow-down"></i> Inward
            </button>
            <button class="btn-icon-only text-navy" title="Edit Spare Part" onclick="editInventoryItem('${item.id || item.partNo}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-icon-only btn-danger" title="Delete Item" onclick="deleteInventoryItem('${item.id || item.partNo}', '${escapeHtml(item.partNo)}')">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddInventoryModal() {
  document.getElementById('modal-inventory-title').innerHTML = `<i class="fa-solid fa-boxes-stacked text-orange"></i> Add Spare Part / Material`;
  document.getElementById('form-inventory-item').reset();
  document.getElementById('inv-item-id').value = '';
  document.getElementById('inv-part-no').readOnly = false;
  document.getElementById('inv-part-no').value = `PRT-${Date.now().toString().slice(-5)}`;
  document.getElementById('inv-unit').value = 'Nos';
  document.getElementById('inv-warranty').value = '6 Months';
  document.getElementById('inv-min-stock').value = '2';
  openModal('modal-inventory-item');
}

function editInventoryItem(id) {
  const item = (allInventory || []).find(i => i.id === id || i.partNo === id);
  if (!item) return;

  document.getElementById('modal-inventory-title').innerHTML = `<i class="fa-solid fa-pen-to-square text-orange"></i> Edit Spare Part (${escapeHtml(item.partNo)})`;
  document.getElementById('inv-item-id').value = item.id;
  document.getElementById('inv-part-no').value = item.partNo || '';
  document.getElementById('inv-part-no').readOnly = true;
  document.getElementById('inv-name').value = item.name || '';
  document.getElementById('inv-category').value = item.category || 'Mechanical';
  document.getElementById('inv-stock-qty').value = item.stockQty !== undefined ? item.stockQty : 0;
  document.getElementById('inv-unit').value = item.unit || 'Nos';
  document.getElementById('inv-unit-price').value = item.unitPrice !== undefined ? item.unitPrice : '';
  document.getElementById('inv-warranty').value = item.warranty || 'N/A';
  document.getElementById('inv-min-stock').value = item.minStock !== undefined ? item.minStock : 2;
  document.getElementById('inv-supplier').value = item.supplier || '';
  document.getElementById('inv-location').value = item.location || '';
  document.getElementById('inv-notes').value = item.notes || '';

  openModal('modal-inventory-item');
}

async function handleSaveInventoryItem(e) {
  e.preventDefault();
  const id = document.getElementById('inv-item-id').value.trim();
  const partNo = document.getElementById('inv-part-no').value.trim();
  const name = document.getElementById('inv-name').value.trim();
  const category = document.getElementById('inv-category').value.trim();
  const stockQty = Number(document.getElementById('inv-stock-qty').value) || 0;
  const unit = document.getElementById('inv-unit').value.trim() || 'Nos';
  const unitPrice = Number(document.getElementById('inv-unit-price').value) || 0;
  const warranty = document.getElementById('inv-warranty').value.trim() || 'N/A';
  const minStock = Number(document.getElementById('inv-min-stock').value) || 2;
  const supplier = document.getElementById('inv-supplier').value.trim();
  const location = document.getElementById('inv-location').value.trim();
  const notes = document.getElementById('inv-notes').value.trim();

  const payload = {
    partNo,
    name,
    category,
    stockQty,
    unit,
    unitPrice,
    warranty,
    minStock,
    supplier,
    location,
    notes
  };

  const isEdit = Boolean(id);
  const url = isEdit ? `/api/payroll/inventory/${encodeURIComponent(id)}` : '/api/payroll/inventory';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || (isEdit ? 'Spare part updated.' : 'Spare part added to inventory.'));
      closeModal('modal-inventory-item');
      await fetchInventory();
      if (typeof updateVehicleSubNavBadges === 'function') updateVehicleSubNavBadges();
    } else {
      showToast(data.message || 'Error saving spare part', 'error');
    }
  } catch (err) {
    console.error('Inventory save error:', err);
    // Offline local fallback
    if (isEdit) {
      const idx = allInventory.findIndex(i => i.id === id || i.partNo === id);
      if (idx !== -1) allInventory[idx] = { ...allInventory[idx], ...payload, updatedAt: new Date().toISOString() };
    } else {
      const newItem = { id: `inv-${Date.now()}`, ...payload, updatedAt: new Date().toISOString() };
      allInventory.unshift(newItem);
    }
    try { localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(allInventory)); } catch (e) {}
    showToast('Saved to local storage.');
    closeModal('modal-inventory-item');
    renderInventoryTable();
    if (typeof updateVehicleSubNavBadges === 'function') updateVehicleSubNavBadges();
  }
}

async function deleteInventoryItem(id, partNo) {
  if (!confirm(`Are you sure you want to remove part "${partNo}" from inventory?`)) return;

  try {
    const res = await fetch(`/api/payroll/inventory/${encodeURIComponent(id)}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast(`Part "${partNo}" deleted from inventory.`);
      allInventory = allInventory.filter(i => i.id !== id && i.partNo !== id);
      try { localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(allInventory)); } catch (e) {}
      renderInventoryTable();
      if (typeof updateVehicleSubNavBadges === 'function') updateVehicleSubNavBadges();
    } else {
      showToast(data.message || 'Failed to delete part', 'error');
    }
  } catch (err) {
    allInventory = allInventory.filter(i => i.id !== id && i.partNo !== id);
    try { localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(allInventory)); } catch (e) {}
    showToast(`Part "${partNo}" removed.`);
    renderInventoryTable();
  }
}

function openStockInwardModal(id) {
  const item = (allInventory || []).find(i => i.id === id || i.partNo === id);
  if (!item) return;

  document.getElementById('inward-item-id').value = item.id;
  document.getElementById('inward-part-display').textContent = `${item.partNo} - ${item.name} (Current Stock: ${item.stockQty} ${item.unit})`;
  document.getElementById('inward-quantity').value = '';
  document.getElementById('inward-unit-price').value = item.unitPrice || '';
  document.getElementById('inward-supplier').value = item.supplier || '';
  document.getElementById('inward-invoice-no').value = '';
  document.getElementById('inward-date').value = new Date().toISOString().split('T')[0];

  openModal('modal-stock-inward');
}

async function handleSaveStockInward(e) {
  e.preventDefault();
  const id = document.getElementById('inward-item-id').value;
  const quantity = Number(document.getElementById('inward-quantity').value) || 0;
  const newUnitPrice = Number(document.getElementById('inward-unit-price').value) || 0;
  const supplier = document.getElementById('inward-supplier').value.trim();
  const invoiceNo = document.getElementById('inward-invoice-no').value.trim();

  if (quantity <= 0) {
    showToast('Inward quantity must be greater than zero.', 'error');
    return;
  }

  try {
    const res = await fetch('/api/payroll/inventory/adjust-stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, quantity, newUnitPrice, supplier, invoiceNo })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Stock inward updated successfully!');
      closeModal('modal-stock-inward');
      await fetchInventory();
    } else {
      showToast(data.message || 'Error updating stock', 'error');
    }
  } catch (err) {
    const item = allInventory.find(i => i.id === id || i.partNo === id);
    if (item) {
      item.stockQty = (Number(item.stockQty) || 0) + quantity;
      if (newUnitPrice > 0) item.unitPrice = newUnitPrice;
      try { localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(allInventory)); } catch (e) {}
    }
    showToast(`Stock inward recorded locally: +${quantity}`);
    closeModal('modal-stock-inward');
    renderInventoryTable();
  }
}

function exportInventoryExcel() {
  if (!allInventory || allInventory.length === 0) {
    showToast('Inventory is empty. No records to export.', 'error');
    return;
  }

  if (typeof XLSX === 'undefined') {
    showToast('Excel exporter library not loaded. Please try again.', 'error');
    return;
  }

  const rows = allInventory.map((item, idx) => ({
    'Sr No': idx + 1,
    'Part No / Code': item.partNo,
    'Part Name / Description': item.name,
    'Category': item.category || 'General',
    'Stock Qty': Number(item.stockQty) || 0,
    'Unit of Measure': item.unit || 'Nos',
    'Unit Price (INR)': Number(item.unitPrice) || 0,
    'Warranty Period': item.warranty || 'N/A',
    'Total Stock Valuation (INR)': Math.round((Number(item.stockQty) || 0) * (Number(item.unitPrice) || 0)),
    'Min Reorder Alert Level': Number(item.minStock) || 2,
    'Stock Status': (Number(item.stockQty) || 0) <= 0 ? 'Out of Stock' : ((Number(item.stockQty) || 0) <= (Number(item.minStock) || 2) ? 'Low Stock' : 'In Stock'),
    'Preferred Supplier / OEM': item.supplier || 'OEM',
    'Storage Location / Bin': item.location || 'Workshop Store',
    'Notes / Applications': item.notes || ''
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Spares Inventory Master');

  const fileName = `Shree_RR_Trading_Spares_Inventory_Master_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
  showToast('Excel inventory report downloaded successfully!');
}
