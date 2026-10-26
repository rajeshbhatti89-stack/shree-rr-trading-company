// 29. Vehicle Material Consumption & Cost Analytics Engine
function initVehicleConsumptionAnalytics() {
  const vehFilter = document.getElementById('vcost-vehicle-filter');
  if (vehFilter) {
    vehFilter.addEventListener('change', () => renderVehicleConsumptionAnalytics());
  }

  const dateFilter = document.getElementById('vcost-month-filter');
  if (dateFilter) {
    dateFilter.addEventListener('change', () => renderVehicleConsumptionAnalytics());
  }

  const btnExport = document.getElementById('btn-export-consumption-excel');
  if (btnExport) {
    btnExport.addEventListener('click', exportVehicleConsumptionExcel);
  }
}

function renderVehicleConsumptionAnalytics() {
  const tbodySummary = document.getElementById('vehicle-cost-summary-tbody');
  const tbodyDetails = document.getElementById('vehicle-consumption-items-tbody');

  // Collect all consumption items
  let allItems = [];
  if (allVehiclePartConsumptions && allVehiclePartConsumptions.length > 0) {
    allItems = [...allVehiclePartConsumptions];
  } else {
    // Derive from allChallans
    (allChallans || []).forEach(ch => {
      (ch.items || []).forEach(it => {
        allItems.push({
          challanNo: ch.challanNo,
          challanDate: ch.date,
          vehicleNo: ch.vehicleNo,
          vehicleName: ch.vehicleName,
          jobCardNo: ch.jobCardNo,
          issuedToName: ch.issuedToName,
          ...it
        });
      });
    });
  }

  const selectedVeh = document.getElementById('vcost-vehicle-filter')?.value || 'ALL';
  const selectedMonth = document.getElementById('vcost-month-filter')?.value || 'ALL';

  // Populate dynamic vehicle filter
  const vehFilterElem = document.getElementById('vcost-vehicle-filter');
  if (vehFilterElem && vehFilterElem.options.length <= 1) {
    let vehHtml = `<option value="ALL">All Plant Vehicles</option>`;
    const registeredVehs = Array.from(new Set([
      ...(allVehicles || []).map(v => v.vehicleNo),
      ...allItems.map(i => i.vehicleNo)
    ].filter(Boolean))).sort();

    registeredVehs.forEach(v => {
      vehHtml += `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`;
    });
    vehFilterElem.innerHTML = vehHtml;
  }

  // Filter items
  const filteredItems = allItems.filter(item => {
    const matchVeh = selectedVeh === 'ALL' || (item.vehicleNo && item.vehicleNo.toUpperCase() === selectedVeh.toUpperCase());
    const matchMonth = selectedMonth === 'ALL' || (item.challanDate && item.challanDate.startsWith(selectedMonth));
    return matchVeh && matchMonth;
  });

  // Aggregate by vehicle
  const vehicleMap = {};

  // Ensure all known vehicles appear in table
  (allVehicles || []).forEach(v => {
    if (selectedVeh === 'ALL' || v.vehicleNo.toUpperCase() === selectedVeh.toUpperCase()) {
      vehicleMap[v.vehicleNo.toUpperCase()] = {
        vehicleNo: v.vehicleNo,
        vehicleName: v.name,
        type: v.type || 'Equipment',
        model: v.model || '',
        site: v.site || 'Plant Site',
        totalChallans: 0,
        challanSet: new Set(),
        totalPartsCount: 0,
        totalCost: 0,
        lastDate: '',
        items: []
      };
    }
  });

  filteredItems.forEach(it => {
    const vKey = (it.vehicleNo || 'UNASSIGNED').toUpperCase();
    if (!vehicleMap[vKey]) {
      vehicleMap[vKey] = {
        vehicleNo: it.vehicleNo || 'UNASSIGNED',
        vehicleName: it.vehicleName || 'Equipment',
        type: 'Plant Machinery',
        model: '',
        site: 'ACC Chanda',
        totalChallans: 0,
        challanSet: new Set(),
        totalPartsCount: 0,
        totalCost: 0,
        lastDate: '',
        items: []
      };
    }

    const cost = Number(it.totalPrice) || (Number(it.qty) * Number(it.unitPrice)) || 0;
    vehicleMap[vKey].totalCost += cost;
    vehicleMap[vKey].totalPartsCount += Number(it.qty) || 0;
    if (it.challanNo) vehicleMap[vKey].challanSet.add(it.challanNo);
    if (!vehicleMap[vKey].lastDate || it.challanDate > vehicleMap[vKey].lastDate) {
      vehicleMap[vKey].lastDate = it.challanDate;
    }
    vehicleMap[vKey].items.push(it);
  });

  const vehicleSummaryList = Object.values(vehicleMap);
  vehicleSummaryList.forEach(v => {
    v.totalChallans = v.challanSet.size;
  });

  // Sort by highest material cost first
  vehicleSummaryList.sort((a, b) => b.totalCost - a.totalCost);

  // Overall KPIs
  let grandTotalCost = 0;
  let grandTotalParts = 0;
  let topVehName = 'None';
  let topVehCost = 0;

  vehicleSummaryList.forEach(v => {
    grandTotalCost += v.totalCost;
    grandTotalParts += v.totalPartsCount;
    if (v.totalCost > topVehCost) {
      topVehCost = v.totalCost;
      topVehName = `${v.vehicleNo} (₹${Math.round(v.totalCost).toLocaleString('en-IN')})`;
    }
  });

  const kpiGrandCost = document.getElementById('kpi-vcost-total-amount');
  if (kpiGrandCost) kpiGrandCost.textContent = `₹${Math.round(grandTotalCost).toLocaleString('en-IN')}`;

  const kpiGrandParts = document.getElementById('kpi-vcost-total-parts');
  if (kpiGrandParts) kpiGrandParts.textContent = grandTotalParts;

  const kpiTopVeh = document.getElementById('kpi-vcost-top-vehicle');
  if (kpiTopVeh) kpiTopVeh.textContent = topVehName;

  const kpiVehCount = document.getElementById('kpi-vcost-active-machines');
  if (kpiVehCount) kpiVehCount.textContent = vehicleSummaryList.filter(v => v.totalCost > 0).length;

  // Render Vehicle Summary Table
  if (tbodySummary) {
    if (vehicleSummaryList.length === 0) {
      tbodySummary.innerHTML = `<tr><td colspan="8" class="text-center" style="padding: 35px; color: var(--text-dim);">No vehicle consumption records found.</td></tr>`;
    } else {
      tbodySummary.innerHTML = vehicleSummaryList.map(v => {
        const sharePercent = grandTotalCost > 0 ? Math.round((v.totalCost / grandTotalCost) * 100) : 0;
        return `
          <tr>
            <td>
              <span class="emp-cell-id" style="font-family: var(--font-mono); font-weight: 800; color: var(--logo-navy);">
                <i class="fa-solid fa-truck-monster text-orange"></i> ${escapeHtml(v.vehicleNo)}
              </span>
              <span class="emp-cell-sub">${escapeHtml(v.vehicleName)}</span>
            </td>
            <td>
              <span class="badge-pill">${escapeHtml(v.type || 'Equipment')}</span>
              <span class="emp-cell-sub">${escapeHtml(v.model || v.site || '')}</span>
            </td>
            <td class="text-center">
              <span class="badge-pill" style="font-weight: 700; background: #EEF2FF; color: #4338CA;">
                ${v.totalChallans} Challan${v.totalChallans === 1 ? '' : 's'}
              </span>
            </td>
            <td class="text-center">
              <strong style="color: var(--logo-navy);">${v.totalPartsCount}</strong> Spares
            </td>
            <td>
              <strong style="color: #059669; font-size: 15px;">₹${Math.round(v.totalCost).toLocaleString('en-IN')}</strong>
            </td>
            <td style="width: 170px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div class="progress-bar-wrap" style="flex: 1; height: 8px; background: #E2E8F0; border-radius: 4px; overflow: hidden;">
                  <div style="width: ${sharePercent}%; height: 100%; background: ${sharePercent > 40 ? '#DC2626' : (sharePercent > 20 ? 'var(--logo-orange)' : '#059669')}; border-radius: 4px;"></div>
                </div>
                <span style="font-size: 11px; font-weight: 700; color: var(--text-dim); width: 35px;">${sharePercent}%</span>
              </div>
            </td>
            <td>
              ${v.lastDate ? `<i class="fa-solid fa-calendar-day text-dim"></i> ${escapeHtml(v.lastDate)}` : '<span style="color: var(--text-dim); font-size: 11px;">No Issues</span>'}
            </td>
            <td class="text-right">
              <button class="btn btn-primary btn-xs" title="View Full Itemized Spares Breakdown for ${escapeHtml(v.vehicleNo)}" onclick="viewVehicleConsumptionDetails('${escapeHtml(v.vehicleNo)}')">
                <i class="fa-solid fa-list-check"></i> View Spares
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // Render Detailed Itemized Parts Log Table
  if (tbodyDetails) {
    if (filteredItems.length === 0) {
      tbodyDetails.innerHTML = `<tr><td colspan="10" class="text-center" style="padding: 30px; color: var(--text-dim);">No parts issued matching the filter.</td></tr>`;
    } else {
      tbodyDetails.innerHTML = filteredItems.map((it, idx) => {
        const itemTot = Number(it.totalPrice) || (Number(it.qty) * Number(it.unitPrice)) || 0;
        return `
          <tr>
            <td style="font-size: 11px; color: var(--text-dim);">${idx + 1}</td>
            <td><strong>${escapeHtml(it.challanDate || '')}</strong></td>
            <td>
              <strong style="color: var(--logo-navy);">${escapeHtml(it.vehicleNo)}</strong>
              <div style="font-size: 10px; color: var(--text-dim);">${escapeHtml(it.vehicleName || '')}</div>
            </td>
            <td>
              <span class="badge-pill" style="font-family: var(--font-mono); font-size: 11px; background: #FFF5EE; color: var(--logo-orange);">
                ${escapeHtml(it.challanNo || '')}
              </span>
              ${it.jobCardNo ? `<div style="font-size: 10px; color: var(--text-dim);">${escapeHtml(it.jobCardNo)}</div>` : ''}
            </td>
            <td>
              <strong style="color: var(--logo-navy);">${escapeHtml(it.partName || '')}</strong>
              <div style="font-size: 10px; color: var(--text-dim); font-family: var(--font-mono);">${escapeHtml(it.partNo || '')}</div>
            </td>
            <td><span class="badge-pill" style="font-size: 10px;">${escapeHtml(it.category || 'General')}</span></td>
            <td>
              <span class="wty-tag"><i class="fa-solid fa-shield-halved text-success"></i> ${escapeHtml(it.warranty || 'N/A')}</span>
            </td>
            <td class="text-center"><strong>${it.qty}</strong> ${escapeHtml(it.unit || 'Nos')}</td>
            <td class="text-right">₹${Number(it.unitPrice || 0).toLocaleString('en-IN')}</td>
            <td class="text-right"><strong style="color: #059669;">₹${Math.round(itemTot).toLocaleString('en-IN')}</strong></td>
          </tr>
        `;
      }).join('');
    }
  }
}

// Modal: Detailed Itemized Spares for a Specific Vehicle
function viewVehicleConsumptionDetails(vehNo) {
  if (!vehNo) return;

  const targetVeh = (allVehicles || []).find(v => v.vehicleNo.toUpperCase() === vehNo.toUpperCase());

  let vehicleItems = [];
  if (allVehiclePartConsumptions && allVehiclePartConsumptions.length > 0) {
    vehicleItems = allVehiclePartConsumptions.filter(i => (i.vehicleNo || '').toUpperCase() === vehNo.toUpperCase());
  } else {
    (allChallans || []).forEach(ch => {
      if ((ch.vehicleNo || '').toUpperCase() === vehNo.toUpperCase()) {
        (ch.items || []).forEach(it => {
          vehicleItems.push({
            challanNo: ch.challanNo,
            challanDate: ch.date,
            jobCardNo: ch.jobCardNo,
            issuedToName: ch.issuedToName,
            ...it
          });
        });
      }
    });
  }

  let totalSpent = 0;
  let totalQty = 0;
  vehicleItems.forEach(it => {
    totalSpent += Number(it.totalPrice) || (Number(it.qty) * Number(it.unitPrice)) || 0;
    totalQty += Number(it.qty) || 0;
  });

  const headerElem = document.getElementById('vehicle-consumption-modal-title');
  if (headerElem) {
    headerElem.innerHTML = `<i class="fa-solid fa-truck-monster text-orange"></i> Spares Consumption & Cost History: <strong>${escapeHtml(vehNo)}</strong>`;
  }

  const subElem = document.getElementById('vehicle-consumption-modal-sub');
  if (subElem) {
    subElem.innerHTML = `Equipment: <strong>${escapeHtml(targetVeh ? targetVeh.name : vehNo)}</strong> (${escapeHtml(targetVeh ? targetVeh.model : 'Plant Fleet')}) • Total Spares Cost: <strong style="color: #059669; font-size: 15px;">₹${Math.round(totalSpent).toLocaleString('en-IN')}</strong> (${totalQty} Items Replaced)`;
  }

  const tbody = document.getElementById('vehicle-detail-spares-tbody');
  if (tbody) {
    if (vehicleItems.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="text-center" style="padding: 30px; color: var(--text-dim);">No spare parts or materials have been issued to ${escapeHtml(vehNo)} yet.</td></tr>`;
    } else {
      tbody.innerHTML = vehicleItems.map((it, idx) => {
        const itemTot = Number(it.totalPrice) || (Number(it.qty) * Number(it.unitPrice)) || 0;
        return `
          <tr>
            <td style="text-align: center;">${idx + 1}</td>
            <td><strong>${escapeHtml(it.challanDate || '')}</strong></td>
            <td>
              <span class="badge-pill" style="font-family: var(--font-mono); font-size: 11px; background: #FFF5EE; color: var(--logo-orange);">
                ${escapeHtml(it.challanNo || '')}
              </span>
              ${it.jobCardNo ? `<div style="font-size: 10px; color: var(--text-dim); margin-top: 2px;">JC: ${escapeHtml(it.jobCardNo)}</div>` : ''}
            </td>
            <td>
              <strong style="color: var(--logo-navy);">${escapeHtml(it.partName || '')}</strong>
              <div style="font-size: 10px; color: var(--text-dim); font-family: var(--font-mono);">${escapeHtml(it.partNo || '')}</div>
            </td>
            <td><span class="badge-pill" style="font-size: 10px;">${escapeHtml(it.category || 'General')}</span></td>
            <td><span class="wty-tag"><i class="fa-solid fa-shield-halved text-success"></i> ${escapeHtml(it.warranty || 'N/A')}</span></td>
            <td style="text-align: center;"><strong>${it.qty}</strong> ${escapeHtml(it.unit || 'Nos')}</td>
            <td style="text-align: right;">₹${Number(it.unitPrice || 0).toLocaleString('en-IN')}</td>
            <td style="text-align: right;"><strong style="color: #059669;">₹${Math.round(itemTot).toLocaleString('en-IN')}</strong></td>
          </tr>
        `;
      }).join('');
    }
  }

  openModal('modal-vehicle-consumption-details');
}

function exportVehicleConsumptionExcel() {
  if (typeof XLSX === 'undefined') {
    showToast('Excel library not loaded.', 'error');
    return;
  }

  let allItems = [];
  if (allVehiclePartConsumptions && allVehiclePartConsumptions.length > 0) {
    allItems = [...allVehiclePartConsumptions];
  } else {
    (allChallans || []).forEach(ch => {
      (ch.items || []).forEach(it => {
        allItems.push({
          challanNo: ch.challanNo,
          challanDate: ch.date,
          vehicleNo: ch.vehicleNo,
          vehicleName: ch.vehicleName,
          jobCardNo: ch.jobCardNo,
          issuedToName: ch.issuedToName,
          ...it
        });
      });
    });
  }

  if (allItems.length === 0) {
    showToast('No vehicle consumption records to export.', 'error');
    return;
  }

  const rows = allItems.map((it, idx) => ({
    'Sr No': idx + 1,
    'Date of Issue': it.challanDate,
    'Vehicle Reg No': it.vehicleNo,
    'Equipment Name': it.vehicleName || '',
    'Challan No': it.challanNo,
    'Job Card No': it.jobCardNo || 'Direct Issue',
    'Part No / SKU': it.partNo,
    'Part Description': it.partName,
    'Category': it.category || 'General',
    'Warranty Period': it.warranty || 'N/A',
    'Quantity Issued': Number(it.qty) || 0,
    'Unit': it.unit || 'Nos',
    'Unit Rate (INR)': Number(it.unitPrice) || 0,
    'Total Cost (INR)': Math.round((Number(it.totalPrice) || (Number(it.qty) * Number(it.unitPrice)) || 0)),
    'Receiving Mechanic': it.issuedToName || ''
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Vehicle Material Consumption');

  const fileName = `Shree_RR_Trading_Vehicle_Material_Consumption_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
  showToast('Vehicle-wise material consumption Excel report downloaded!');
}
