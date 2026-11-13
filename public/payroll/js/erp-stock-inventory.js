/**
 * Shree RR Trading Company - Enterprise Operations, Fleet & Payroll Portal
 * Module: erp-stock-inventory.js
 * Warehouse Spares Master, Material Delivery Challans & Consumption Analytics
 * (c) 2026 Shree RR Trading Company
 */

window.ERP = window.ERP || {};

ERP.inventory = {
  // ==================== 1. INVENTORY TABLE RENDERING ====================
  renderInventoryTable() {
    const tbody = document.getElementById('inventory-table-body');
    if (!tbody) return;

    const allInv = ERP.state.data.inventory || [];
    const search = (document.getElementById('inventory-search-input')?.value || '').toLowerCase().trim();
    const catFilter = document.getElementById('inventory-filter-category')?.value || 'ALL';

    const filtered = allInv.filter(it => {
      if (catFilter !== 'ALL' && it.category !== catFilter) return false;
      if (!search) return true;
      return (
        (it.partNo && it.partNo.toLowerCase().includes(search)) ||
        (it.name && it.name.toLowerCase().includes(search)) ||
        (it.category && it.category.toLowerCase().includes(search)) ||
        (it.supplier && it.supplier.toLowerCase().includes(search))
      );
    });

    const countEl = document.getElementById('inventory-count-badge');
    if (countEl) countEl.textContent = `${filtered.length} Items`;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center" style="padding: 30px; color: var(--text-dim);">
            <i class="fa-solid fa-boxes-stacked fa-2x" style="margin-bottom: 10px; display: block; opacity: 0.4;"></i>
            No spare parts found matching the selected warehouse criteria.
          </td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    filtered.forEach((it, idx) => {
      const qty = Number(it.quantity) || 0;
      const reorder = Number(it.reorderLevel) || 5;

      let stockBadge = '<span class="status-pill status-active"><i class="fa-solid fa-check"></i> In Stock</span>';
      if (qty === 0) {
        stockBadge = '<span class="status-pill status-danger"><i class="fa-solid fa-circle-xmark"></i> Out of Stock</span>';
      } else if (qty <= reorder) {
        stockBadge = '<span class="status-pill status-warning"><i class="fa-solid fa-triangle-exclamation"></i> Low Stock</span>';
      }

      rowsHtml += `
        <tr>
          <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
          <td>
            <div style="font-family: var(--font-mono); font-weight: 800; color: var(--logo-navy); font-size: 13px;">
              ${ERP.utils.escapeHtml(it.partNo)}
            </div>
            <div style="font-size: 10.5px; color: var(--text-dim); margin-top: 2px;">
              ${ERP.utils.escapeHtml(it.supplier || 'Plant Central Warehouse')}
            </div>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--text-dark);">${ERP.utils.escapeHtml(it.name)}</div>
            <div style="font-size: 11px; color: var(--logo-orange); font-weight: 600;">${ERP.utils.escapeHtml(it.category || 'General')}</div>
          </td>
          <td style="text-align: center;">
            <div style="font-weight: 800; font-size: 14px; color: ${qty <= reorder ? '#DC2626' : 'var(--logo-navy)'};">
              ${qty} <span style="font-size: 11px; font-weight: 500;">${ERP.utils.escapeHtml(it.unit || 'Nos')}</span>
            </div>
            <div style="font-size: 9.5px; color: var(--text-dim);">Min: ${reorder}</div>
          </td>
          <td style="text-align: center;">${stockBadge}</td>
          <td style="text-align: right; font-weight: 700; color: var(--logo-navy);">
            ₹${Number(it.unitPrice || 0).toLocaleString('en-IN')}
          </td>
          <td style="text-align: center; font-size: 11px;">
            <span class="wty-tag"><i class="fa-solid fa-shield-halved text-green"></i> ${ERP.utils.escapeHtml(it.warranty || '6 Months')}</span>
          </td>
          <td style="text-align: center;">
            <div style="display: flex; gap: 4px; justify-content: center;">
              <button class="btn btn-outline-success btn-xs" onclick="ERP.inventory.openStockInwardModal('${it.id || it.partNo}')" title="Inward Incoming Stock">
                <i class="fa-solid fa-plus"></i> Inward
              </button>
              <button class="btn-icon-only text-navy" onclick="ERP.inventory.openEditItemModal('${it.id || it.partNo}')" title="Edit Spare Item">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn-icon-only btn-danger" onclick="ERP.inventory.deleteItem('${it.id || it.partNo}', '${ERP.utils.escapeHtml(it.partNo)}')" title="Delete Spare Item">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = rowsHtml;
  },

  // ==================== 2. ADD & EDIT SPARE PART ====================
  openAddItemModal() {
    const form = document.getElementById('form-inventory-item');
    if (form) form.reset();
    ERP.utils.setElemText('modal-inventory-title', 'Add New Spare Part / Warehouse Item');
    const idInput = document.getElementById('inv-item-id');
    if (idInput) idInput.value = '';
    ERP.modal.open('modal-inventory-item');
  },

  openEditItemModal(id) {
    const it = (ERP.state.data.inventory || []).find(i => i.id === id || i.partNo === id);
    if (!it) return;

    ERP.utils.setElemText('modal-inventory-title', `Edit Part: ${it.partNo}`);
    const idInput = document.getElementById('inv-item-id');
    if (idInput) idInput.value = it.id || it.partNo;

    const setVal = (elemId, val) => {
      const el = document.getElementById(elemId);
      if (el) el.value = val || '';
    };

    setVal('inv-part-no', it.partNo);
    setVal('inv-part-name', it.name);
    setVal('inv-category', it.category);
    setVal('inv-qty', it.quantity);
    setVal('inv-unit', it.unit || 'Nos');
    setVal('inv-unit-price', it.unitPrice);
    setVal('inv-reorder', it.reorderLevel || 5);
    setVal('inv-warranty', it.warranty || '6 Months');
    setVal('inv-supplier', it.supplier);

    ERP.modal.open('modal-inventory-item');
  },

  async handleSaveItem(e) {
    if (e) e.preventDefault();

    const idInput = document.getElementById('inv-item-id');
    const editId = idInput ? idInput.value.trim() : '';
    const partNo = (document.getElementById('inv-part-no')?.value || '').trim().toUpperCase();
    const name = (document.getElementById('inv-part-name')?.value || '').trim();
    const category = document.getElementById('inv-category')?.value;
    const qty = Number(document.getElementById('inv-qty')?.value) || 0;
    const unit = document.getElementById('inv-unit')?.value || 'Nos';
    const unitPrice = Number(document.getElementById('inv-unit-price')?.value) || 0;
    const reorder = Number(document.getElementById('inv-reorder')?.value) || 5;
    const warranty = (document.getElementById('inv-warranty')?.value || '').trim();
    const supplier = (document.getElementById('inv-supplier')?.value || '').trim();

    if (!partNo || !name) {
      ERP.toast('Please provide OEM Part No and Item Description.', 'warning');
      return;
    }

    const payload = {
      partNo: partNo,
      name: name,
      category: category || 'Filters & Maintenance',
      quantity: qty,
      unit: unit,
      unitPrice: unitPrice,
      reorderLevel: reorder,
      warranty: warranty || '6 Months',
      supplier: supplier || 'Plant Central Warehouse'
    };

    try {
      let res;
      if (editId) {
        res = await ERP.api.put(`/api/payroll/inventory/${encodeURIComponent(editId)}`, payload);
      } else {
        res = await ERP.api.post('/api/payroll/inventory', payload);
      }

      if (res && res.success) {
        ERP.toast(`Spare part ${partNo} saved successfully!`, 'success');
        ERP.modal.close('modal-inventory-item');
        await ERP.loadAllData();
      } else {
        throw new Error((res && res.message) || 'Failed to save inventory item');
      }
    } catch (err) {
      ERP.toast(err.message || 'Error saving spare part', 'error');
    }
  },

  async deleteItem(id, partNo) {
    if (!confirm(`Are you sure you want to delete spare part ${partNo}?`)) return;

    try {
      const res = await ERP.api.delete(`/api/payroll/inventory/${encodeURIComponent(id)}`);
      if (res && res.success) {
        ERP.toast(`Spare item ${partNo} deleted.`, 'info');
        await ERP.loadAllData();
      }
    } catch (err) {
      ERP.toast('Failed to delete spare part', 'error');
    }
  },

  // ==================== 3. STOCK INWARD (GRN) ====================
  openStockInwardModal(partId = '') {
    const form = document.getElementById('form-stock-inward');
    if (form) form.reset();

    const dateInput = document.getElementById('inward-date');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    const sel = document.getElementById('inward-part-select');
    if (sel) {
      const allInv = ERP.state.data.inventory || [];
      sel.innerHTML = `
        <option value="">-- Select Spare Part to Inward --</option>
        ${allInv.map(i => `<option value="${ERP.utils.escapeHtml(i.partNo)}">${ERP.utils.escapeHtml(i.partNo)} - ${ERP.utils.escapeHtml(i.name)} (Current Stock: ${i.quantity})</option>`).join('')}
      `;
      if (partId) {
        const matched = allInv.find(i => i.id === partId || i.partNo === partId);
        if (matched) sel.value = matched.partNo;
      }
    }

    ERP.modal.open('modal-stock-inward');
  },

  async handleStockInward(e) {
    if (e) e.preventDefault();

    const partNo = document.getElementById('inward-part-select')?.value;
    const addQty = Number(document.getElementById('inward-qty')?.value) || 0;
    const supplier = (document.getElementById('inward-supplier')?.value || '').trim();

    if (!partNo || addQty <= 0) {
      ERP.toast('Please select an item and enter positive inward quantity.', 'warning');
      return;
    }

    try {
      const res = await ERP.api.post('/api/payroll/inventory/adjust-stock', {
        partNo: partNo,
        delta: addQty,
        reason: `Goods Receipt / Inward from ${supplier || 'Vendor'}`
      });

      if (res && res.success) {
        ERP.toast(`Inwarded ${addQty} units for ${partNo}!`, 'success');
        ERP.modal.close('modal-stock-inward');
        await ERP.loadAllData();
      } else {
        throw new Error((res && res.message) || 'Failed to adjust stock');
      }
    } catch (err) {
      ERP.toast(err.message || 'Error inwarding stock', 'error');
    }
  },

  // ==================== 4. MATERIAL ISSUE CHALLANS ====================
  renderChallansTable() {
    const tbody = document.getElementById('challans-table-body');
    if (!tbody) return;

    const allCh = ERP.state.data.challans || [];
    const search = (document.getElementById('challans-search-input')?.value || '').toLowerCase().trim();

    const filtered = allCh.filter(ch => {
      if (!search) return true;
      return (
        (ch.challanNo && ch.challanNo.toLowerCase().includes(search)) ||
        (ch.vehicleNo && ch.vehicleNo.toLowerCase().includes(search)) ||
        (ch.jobCardNo && ch.jobCardNo.toLowerCase().includes(search)) ||
        (ch.issuedToName && ch.issuedToName.toLowerCase().includes(search))
      );
    });

    const countEl = document.getElementById('challans-count-badge');
    if (countEl) countEl.textContent = `${filtered.length} Challans`;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center" style="padding: 30px; color: var(--text-dim);">
            <i class="fa-solid fa-receipt fa-2x" style="margin-bottom: 10px; display: block; opacity: 0.4;"></i>
            No Material Delivery Challans recorded yet.
          </td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    filtered.forEach((ch, idx) => {
      const totQty = Number(ch.totalQty) || (ch.items ? ch.items.reduce((s, i) => s + (Number(i.qty) || 0), 0) : 0);
      const totAmt = Number(ch.totalAmount) || (ch.items ? ch.items.reduce((s, i) => s + ((Number(i.qty) || 0) * (Number(i.unitPrice) || 0)), 0) : 0);

      rowsHtml += `
        <tr>
          <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
          <td>
            <div style="font-family: var(--font-mono); font-weight: 800; color: var(--logo-navy); font-size: 13px;">
              ${ERP.utils.escapeHtml(ch.challanNo)}
            </div>
            <div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">
              <i class="fa-solid fa-calendar-day"></i> ${ERP.utils.escapeHtml(ch.date || '')}
            </div>
          </td>
          <td>
            <div style="font-weight: 800; color: var(--logo-navy);">${ERP.utils.escapeHtml(ch.vehicleNo)}</div>
            <div style="font-size: 11px; color: var(--logo-orange); font-weight: 700;">
              Job Card: ${ERP.utils.escapeHtml(ch.jobCardNo || 'N/A')}
            </div>
          </td>
          <td>
            <div style="font-weight: 600; font-size: 12px;">${ERP.utils.escapeHtml(ch.issuedToName || 'Technician')}</div>
            <div style="font-size: 10px; color: var(--text-dim);">By: ${ERP.utils.escapeHtml(ch.issuedBy || 'Store Incharge')}</div>
          </td>
          <td style="text-align: center; font-weight: 700; color: var(--logo-navy);">
            ${totQty} <span style="font-size: 11px; font-weight: 500;">Items</span>
          </td>
          <td style="text-align: right; font-weight: 800; color: #059669; font-size: 13px;">
            ₹${Math.round(totAmt).toLocaleString('en-IN')}
          </td>
          <td style="text-align: center;">
            <span class="status-pill status-active"><i class="fa-solid fa-circle-check"></i> Dispatched</span>
          </td>
          <td style="text-align: center;">
            <div style="display: flex; gap: 4px; justify-content: center;">
              <button class="btn btn-outline-primary btn-xs" onclick="ERP.inventory.printChallanModal('${ch.id || ch.challanNo}')" title="Print Delivery Challan Slip">
                <i class="fa-solid fa-print"></i> Print
              </button>
              <button class="btn-icon-only text-green" onclick="ERP.inventory.viewVehicleConsumption('${ERP.utils.escapeHtml(ch.vehicleNo)}')" title="View Vehicle Parts History">
                <i class="fa-solid fa-boxes-stacked"></i>
              </button>
              <button class="btn-icon-only btn-danger" onclick="ERP.inventory.deleteChallan('${ch.id || ch.challanNo}', '${ERP.utils.escapeHtml(ch.challanNo)}')" title="Delete Challan">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = rowsHtml;
  },

  openIssueChallanModal(preVeh = '', preJc = '') {
    const form = document.getElementById('form-challan');
    if (form) form.reset();

    ERP.utils.setElemText('modal-challan-title', 'Issue Material Delivery Challan & Dispatch Spares');

    // Auto-generate Challan Number
    const count = (ERP.state.data.challans || []).length + 1;
    const chNo = `CH-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;
    const chNoInput = document.getElementById('chl-no');
    if (chNoInput) chNoInput.value = chNo;

    const dateInput = document.getElementById('chl-date');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    if (preVeh) {
      const vehSel = document.getElementById('chl-vehicle-select');
      if (vehSel) vehSel.value = preVeh;
    }

    const jcInput = document.getElementById('chl-job-card-no');
    if (jcInput) jcInput.value = preJc || '';

    // Initialize items table with one fresh line item
    this.resetChallanItemsTable();

    ERP.modal.open('modal-challan');
  },

  resetChallanItemsTable() {
    const tbody = document.getElementById('challan-items-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    this.addChallanLineItem();
  },

  addChallanLineItem() {
    const tbody = document.getElementById('challan-items-tbody');
    if (!tbody) return;

    const rowIdx = tbody.children.length;
    const tr = document.createElement('tr');
    tr.className = 'challan-item-row';

    const allInv = ERP.state.data.inventory || [];
    const partsOptions = allInv.map(i => `<option value="${ERP.utils.escapeHtml(i.partNo)}" data-name="${ERP.utils.escapeHtml(i.name)}" data-price="${i.unitPrice || 0}" data-unit="${ERP.utils.escapeHtml(i.unit || 'Nos')}" data-wty="${ERP.utils.escapeHtml(i.warranty || '6 Months')}" data-stock="${i.quantity || 0}">${ERP.utils.escapeHtml(i.partNo)} - ${ERP.utils.escapeHtml(i.name)} [Stock: ${i.quantity}]</option>`).join('');

    tr.innerHTML = `
      <td style="text-align: center; font-weight: 700;">${rowIdx + 1}</td>
      <td>
        <select class="custom-select chl-item-select" required onchange="ERP.inventory.handleChallanPartSelect(this)" style="font-size: 11.5px; width: 100%;">
          <option value="">-- Choose Spare Item --</option>
          ${partsOptions}
        </select>
        <input type="hidden" class="chl-item-name">
        <input type="hidden" class="chl-item-wty">
        <input type="hidden" class="chl-item-unit">
      </td>
      <td>
        <input type="number" class="custom-input chl-item-qty" min="1" value="1" required oninput="ERP.inventory.recalcChallanTotals()" style="width: 70px; text-align: center; font-size: 12px; font-weight: 700;">
      </td>
      <td>
        <input type="number" class="custom-input chl-item-price" min="0" value="0" readonly style="width: 90px; text-align: right; font-size: 12px; background: #F8FAFC;">
      </td>
      <td style="text-align: right; font-weight: 800; color: #059669; font-size: 12.5px;">
        <span class="chl-line-total">₹0</span>
      </td>
      <td style="text-align: center;">
        <button type="button" class="btn-icon-only btn-danger" onclick="this.closest('tr').remove(); ERP.inventory.recalcChallanTotals();" title="Remove Line">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  },

  handleChallanPartSelect(sel) {
    const tr = sel.closest('tr');
    if (!tr) return;

    const opt = sel.selectedOptions[0];
    if (!opt || !sel.value) return;

    const name = opt.getAttribute('data-name') || '';
    const price = Number(opt.getAttribute('data-price')) || 0;
    const wty = opt.getAttribute('data-wty') || '6 Months';
    const unit = opt.getAttribute('data-unit') || 'Nos';

    tr.querySelector('.chl-item-name').value = name;
    tr.querySelector('.chl-item-wty').value = wty;
    tr.querySelector('.chl-item-unit').value = unit;
    tr.querySelector('.chl-item-price').value = price;

    this.recalcChallanTotals();
  },

  recalcChallanTotals() {
    const rows = document.querySelectorAll('#challan-items-tbody tr');
    let grandQty = 0;
    let grandAmt = 0;

    rows.forEach(r => {
      const qty = Number(r.querySelector('.chl-item-qty')?.value) || 0;
      const price = Number(r.querySelector('.chl-item-price')?.value) || 0;
      const lineTot = qty * price;
      grandQty += qty;
      grandAmt += lineTot;

      const span = r.querySelector('.chl-line-total');
      if (span) span.textContent = '₹' + Math.round(lineTot).toLocaleString('en-IN');
    });

    ERP.utils.setElemText('chl-grand-qty', `${grandQty} Nos`);
    ERP.utils.setElemText('chl-grand-amount', '₹' + Math.round(grandAmt).toLocaleString('en-IN'));
  },

  async handleSaveChallan(e) {
    if (e) e.preventDefault();

    const chNo = document.getElementById('chl-no')?.value.trim();
    const vehNo = document.getElementById('chl-vehicle-select')?.value.trim();
    const jcNo = (document.getElementById('chl-job-card-no')?.value || '').trim();
    const chDate = document.getElementById('chl-date')?.value;
    const recipientSel = document.getElementById('chl-issued-to');
    const recipientName = recipientSel && recipientSel.selectedOptions[0] ? recipientSel.selectedOptions[0].text.split('(')[0].trim() : 'Mechanic';
    const recipientId = recipientSel ? recipientSel.value : '';
    const purpose = (document.getElementById('chl-purpose')?.value || '').trim();

    if (!chNo || !vehNo || !recipientId) {
      ERP.toast('Please provide Challan No, Vehicle, and Receiving Technician.', 'warning');
      return;
    }

    const rows = document.querySelectorAll('#challan-items-tbody tr');
    const items = [];
    let totQty = 0;
    let totAmt = 0;

    rows.forEach(r => {
      const partNo = r.querySelector('.chl-item-select')?.value;
      if (!partNo) return;
      const name = r.querySelector('.chl-item-name')?.value || partNo;
      const qty = Number(r.querySelector('.chl-item-qty')?.value) || 0;
      const price = Number(r.querySelector('.chl-item-price')?.value) || 0;
      const wty = r.querySelector('.chl-item-wty')?.value || '6 Months';
      const unit = r.querySelector('.chl-item-unit')?.value || 'Nos';

      const lineTot = qty * price;
      totQty += qty;
      totAmt += lineTot;

      items.push({
        partNo: partNo,
        partName: name,
        qty: qty,
        unitPrice: price,
        totalPrice: lineTot,
        warranty: wty,
        unit: unit
      });
    });

    if (items.length === 0) {
      ERP.toast('Please add at least one spare part item to issue.', 'warning');
      return;
    }

    const payload = {
      challanNo: chNo,
      date: chDate || new Date().toISOString().split('T')[0],
      vehicleNo: vehNo,
      jobCardNo: jcNo,
      issuedToName: recipientName,
      issuedToId: recipientId,
      issuedBy: ERP.state.currentUser ? ERP.state.currentUser.name : 'Store Incharge',
      items: items,
      totalQty: totQty,
      totalAmount: totAmt,
      purpose: purpose || 'Plant Machinery Maintenance'
    };

    try {
      const res = await ERP.api.post('/api/payroll/challans', payload);
      if (res && res.success) {
        ERP.toast(`Material Challan ${chNo} issued successfully!`, 'success');
        ERP.modal.close('modal-challan');
        await ERP.loadAllData();
      } else {
        throw new Error((res && res.message) || 'Failed to issue challan');
      }
    } catch (err) {
      ERP.toast(err.message || 'Error issuing delivery challan', 'error');
    }
  },

  async deleteChallan(id, chNo) {
    if (!confirm(`Are you sure you want to void and delete Challan ${chNo}? Issued stock will be restored to warehouse inventory.`)) return;

    try {
      const res = await ERP.api.delete(`/api/payroll/challans/${encodeURIComponent(id)}`);
      if (res && res.success) {
        ERP.toast(`Challan ${chNo} deleted and stock restored.`, 'info');
        await ERP.loadAllData();
      }
    } catch (err) {
      ERP.toast('Failed to delete challan', 'error');
    }
  },

  // ==================== 5. OFFICIAL PRINT CHALLAN MODAL ====================
  printChallanModal(id) {
    const ch = (ERP.state.data.challans || []).find(c => c.id === id || c.challanNo === id);
    if (!ch) return;

    let itemsRowsHtml = '';
    (ch.items || []).forEach((it, idx) => {
      const lineTot = Number(it.totalPrice) || (Number(it.qty) * Number(it.unitPrice));
      itemsRowsHtml += `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td><strong style="font-family: var(--font-mono); color: var(--logo-navy);">${ERP.utils.escapeHtml(it.partNo)}</strong></td>
          <td>
            <div style="font-weight: 700;">${ERP.utils.escapeHtml(it.partName)}</div>
            <div style="font-size: 10px; color: var(--text-dim);">${ERP.utils.escapeHtml(it.category || 'General')}</div>
          </td>
          <td style="text-align: center;"><span class="wty-tag"><i class="fa-solid fa-shield-halved text-green"></i> ${ERP.utils.escapeHtml(it.warranty || 'N/A')}</span></td>
          <td style="text-align: center; font-weight: 800;">${it.qty} ${ERP.utils.escapeHtml(it.unit || 'Nos')}</td>
          <td style="text-align: right;">₹${Number(it.unitPrice || 0).toLocaleString('en-IN')}</td>
          <td style="text-align: right; font-weight: 800;">₹${Math.round(lineTot).toLocaleString('en-IN')}</td>
        </tr>
      `;
    });

    const totAmt = Number(ch.totalAmount) || 0;
    const inWords = ERP.utils.numberToWordsIndian(Math.round(totAmt));

    const container = document.getElementById('print-challan-container');
    if (container) {
      container.innerHTML = `
        <div class="official-challan-sheet">
          <!-- Sheet Header -->
          <div class="sheet-header" style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 14px;">
            <div>
              <div style="font-size: 22px; font-weight: 900; color: var(--logo-navy); letter-spacing: 0.5px;">SHREE RR TRADING COMPANY</div>
              <div style="font-size: 11px; color: var(--logo-orange); font-weight: 800; text-transform: uppercase;">Central Spares Warehouse • Material Issue & Dispatch</div>
              <div style="font-size: 11px; color: var(--text-muted);">ACC Chanda Plant Site & Operations, Gadchandur</div>
            </div>
            <div style="text-align: right;">
              <div style="display: inline-block; background: #0B1936; color: #FFF; padding: 4px 10px; font-weight: 800; font-size: 11px; border-radius: 4px;">MATERIAL DELIVERY CHALLAN</div>
              <div style="font-family: var(--font-mono); font-size: 17px; font-weight: 900; color: var(--logo-navy); margin-top: 4px;">${ERP.utils.escapeHtml(ch.challanNo)}</div>
              <div style="font-size: 11px; color: var(--text-muted);">Date: <strong>${ERP.utils.escapeHtml(ch.date || '')}</strong></div>
            </div>
          </div>

          <!-- Metadata Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: #F8FAFC; border: 1px solid #CBD5E1; padding: 10px 14px; border-radius: 6px; margin-bottom: 14px; font-size: 11.5px;">
            <div>
              <div><span style="color: var(--text-dim); width: 130px; display: inline-block;">Target Vehicle No:</span> <strong style="font-size: 13px; color: var(--logo-navy);">${ERP.utils.escapeHtml(ch.vehicleNo)}</strong></div>
              <div style="margin-top: 3px;"><span style="color: var(--text-dim); width: 130px; display: inline-block;">Linked Job Card:</span> <strong style="color: var(--logo-orange);">${ERP.utils.escapeHtml(ch.jobCardNo || 'Direct Garage Issue')}</strong></div>
              <div style="margin-top: 3px;"><span style="color: var(--text-dim); width: 130px; display: inline-block;">Plant Location:</span> <strong>ACC Chanda Plant Workshop Bay</strong></div>
            </div>
            <div>
              <div><span style="color: var(--text-dim); width: 130px; display: inline-block;">Issued To / Fitter:</span> <strong>${ERP.utils.escapeHtml(ch.issuedToName || 'Technician')}</strong></div>
              <div style="margin-top: 3px;"><span style="color: var(--text-dim); width: 130px; display: inline-block;">Dispatch Keeper:</span> <strong>${ERP.utils.escapeHtml(ch.issuedBy || 'Store Incharge')}</strong></div>
              <div style="margin-top: 3px;"><span style="color: var(--text-dim); width: 130px; display: inline-block;">Dispatch Purpose:</span> <strong>${ERP.utils.escapeHtml(ch.purpose || 'Maintenance')}</strong></div>
            </div>
          </div>

          <!-- Items Table -->
          <table class="slip-table" style="width: 100%; font-size: 10.5px; border-collapse: collapse; margin-bottom: 14px;">
            <thead>
              <tr style="background: #F1F5F9; border-bottom: 1px solid #CBD5E1;">
                <th style="padding: 6px 8px; text-align: center; width: 35px;">#</th>
                <th style="padding: 6px 8px; text-align: left; width: 110px;">OEM Part No</th>
                <th style="padding: 6px 8px; text-align: left;">Item Description & Category</th>
                <th style="padding: 6px 8px; text-align: center; width: 100px;">Warranty</th>
                <th style="padding: 6px 8px; text-align: center; width: 80px;">Quantity</th>
                <th style="padding: 6px 8px; text-align: right; width: 95px;">Rate (₹)</th>
                <th style="padding: 6px 8px; text-align: right; width: 110px;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsHtml}
            </tbody>
            <tfoot>
              <tr style="background: #FFF5EE; border-top: 2px solid var(--logo-orange); font-size: 12px;">
                <td colspan="4" style="padding: 8px 10px; font-weight: 700; text-align: right; color: var(--logo-navy);">
                  GRAND TOTAL AMOUNT:
                </td>
                <td style="padding: 8px; text-align: center; font-weight: 800; color: var(--logo-navy);">
                  ${ch.totalQty || 0}
                </td>
                <td></td>
                <td style="padding: 8px 10px; text-align: right; font-weight: 900; color: #059669; font-size: 14px;">
                  ₹${Math.round(totAmt).toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>

          <!-- Amount in Words -->
          <div style="background: #F8FAFC; border: 1px solid #CBD5E1; padding: 8px 12px; border-radius: 4px; margin-bottom: 24px; font-size: 11.5px;">
            <span style="font-weight: 700; color: var(--logo-navy);">Amount in Words:</span>
            <span style="color: #059669; font-weight: 800; margin-left: 6px;">Rupees ${ERP.utils.escapeHtml(inWords)}</span>
          </div>

          <!-- Signatures -->
          <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 14px; border-top: 1px solid #CBD5E1; font-size: 10.5px;">
            <div style="text-align: center; width: 220px;">
              <div style="border-bottom: 1px dashed #94A3B8; height: 30px;"></div>
              <div style="margin-top: 4px; font-weight: 700; color: var(--logo-navy);">${ERP.utils.escapeHtml(ch.issuedToName || 'Receiving Mechanic')}</div>
              <div style="color: var(--text-dim); font-size: 9.5px;">Material Received & Fitted Sign</div>
            </div>
            <div style="text-align: center; width: 220px;">
              <div style="border-bottom: 1px dashed #94A3B8; height: 30px;"></div>
              <div style="margin-top: 4px; font-weight: 700; color: var(--logo-navy);">${ERP.utils.escapeHtml(ch.issuedBy || 'Store Incharge')}</div>
              <div style="color: var(--text-dim); font-size: 9.5px;">Warehouse Dispatch Sign</div>
            </div>
          </div>
        </div>
      `;
    }

    ERP.modal.open('modal-print-challan');
  },

  // ==================== 6. VEHICLE CONSUMPTION HISTORY ====================
  viewVehicleConsumption(vehNo) {
    ERP.utils.setElemText('vehicle-consumption-modal-title', `Spares Consumption: ${vehNo}`);
    const tbody = document.getElementById('vehicle-consumption-tbody');
    if (!tbody) return;

    const allCh = ERP.state.data.challans || [];
    const matchedCh = allCh.filter(c => c.vehicleNo && c.vehicleNo.toUpperCase() === vehNo.toUpperCase());

    let rowsHtml = '';
    let grandTot = 0;

    matchedCh.forEach(ch => {
      (ch.items || []).forEach(it => {
        const lineTot = Number(it.totalPrice) || ((Number(it.qty) || 0) * (Number(it.unitPrice) || 0));
        grandTot += lineTot;

        rowsHtml += `
          <tr>
            <td><strong>${ERP.utils.escapeHtml(ch.date)}</strong></td>
            <td><strong style="font-family: var(--font-mono);">${ERP.utils.escapeHtml(ch.challanNo)}</strong></td>
            <td>${ERP.utils.escapeHtml(it.partNo)}</td>
            <td>${ERP.utils.escapeHtml(it.partName)}</td>
            <td style="text-align: center;">${it.qty} ${ERP.utils.escapeHtml(it.unit || 'Nos')}</td>
            <td style="text-align: right;">₹${Number(it.unitPrice || 0).toLocaleString('en-IN')}</td>
            <td style="text-align: right; font-weight: 700; color: #059669;">₹${Math.round(lineTot).toLocaleString('en-IN')}</td>
          </tr>
        `;
      });
    });

    if (!rowsHtml) {
      rowsHtml = `<tr><td colspan="7" class="text-center" style="padding: 20px; color: var(--text-dim);">No parts issued yet for ${vehNo}.</td></tr>`;
    }

    tbody.innerHTML = rowsHtml;
    ERP.utils.setElemText('vehicle-consumption-total-amount', '₹' + Math.round(grandTot).toLocaleString('en-IN'));
    ERP.modal.open('modal-vehicle-consumption-details');
  }
};

// Global Print Isolation Trigger for Challan
window.printActiveChallan = function() {
  document.body.classList.add('printing-challan');
  window.print();
  setTimeout(() => {
    document.body.classList.remove('printing-challan');
  }, 1000);
};

window.openPrintChallanModal = function(id) {
  ERP.inventory.printChallanModal(id);
};

// Aliases for compatibility
ERP.stock = ERP.inventory;

