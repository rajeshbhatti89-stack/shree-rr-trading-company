// 23. Vehicle Statutory Compliance Tracking Engine
function calculateCompliancePriority(v) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysLeft = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const fitnessDays = getDaysLeft(v.fitnessExpiry);
  const pucDays = getDaysLeft(v.pucExpiry);
  const insuranceDays = getDaysLeft(v.insuranceExpiry);
  const permitDays = getDaysLeft(v.permitExpiry);
  const roadTaxDays = getDaysLeft(v.roadTaxExpiry);

  const docList = [
    { name: 'Fitness', days: fitnessDays, no: v.fitnessCertNo, expiry: v.fitnessExpiry },
    { name: 'PUC', days: pucDays, no: v.pucCertNo, expiry: v.pucExpiry },
    { name: 'Insurance', days: insuranceDays, no: v.insurancePolicyNo, expiry: v.insuranceExpiry },
    { name: 'Goods Permit', days: permitDays, no: v.permitNo, expiry: v.permitExpiry },
    { name: 'Road Tax', days: roadTaxDays, no: v.roadTaxReceipt, expiry: v.roadTaxExpiry }
  ];

  let isCritical = false;
  let isWarning = false;
  let minDays = 9999;
  let criticalDocs = [];
  let warningDocs = [];

  docList.forEach((doc) => {
    if (doc.days !== null) {
      if (doc.days <= 0) {
        isCritical = true;
        criticalDocs.push(`${doc.name} (Expired ${Math.abs(doc.days)}d ago)`);
      } else if (doc.days <= 7) {
        isCritical = true;
        criticalDocs.push(`${doc.name} (Expires in ${doc.days}d)`);
      } else if (doc.days <= 30) {
        isWarning = true;
        warningDocs.push(`${doc.name} (Expires in ${doc.days}d)`);
      }
      if (doc.days < minDays) minDays = doc.days;
    }
  });

  let overallPriority = 'COMPLIANT';
  let badgeClass = 'badge-comp-compliant';
  let icon = 'fa-circle-check';
  let label = '🟢 Compliant';
  let tooltip = 'All statutory documents valid';

  if (isCritical) {
    overallPriority = 'CRITICAL';
    badgeClass = 'badge-comp-critical';
    icon = 'fa-triangle-exclamation';
    label = '🚨 Critical / Expired';
    tooltip = `Immediate action needed: ${criticalDocs.join(', ')}`;
  } else if (isWarning) {
    overallPriority = 'WARNING';
    badgeClass = 'badge-comp-warning';
    icon = 'fa-clock-rotate-left';
    label = '⚠️ Expiring Soon';
    tooltip = `Renewal required soon: ${warningDocs.join(', ')}`;
  }

  return {
    overallPriority,
    minDays: minDays === 9999 ? null : minDays,
    badgeClass,
    icon,
    label,
    tooltip,
    docs: {
      fitness: { days: fitnessDays, no: v.fitnessCertNo, expiry: v.fitnessExpiry },
      puc: { days: pucDays, no: v.pucCertNo, expiry: v.pucExpiry },
      insurance: { days: insuranceDays, no: v.insurancePolicyNo, provider: v.insuranceProvider, expiry: v.insuranceExpiry },
      permit: { days: permitDays, no: v.permitNo, type: v.permitType, expiry: v.permitExpiry },
      roadTax: { days: roadTaxDays, no: v.roadTaxReceipt, expiry: v.roadTaxExpiry }
    }
  };
}

function openVehicleComplianceModal() {
  renderComplianceMatrix();
  openModal('modal-vehicle-compliance');
}

function filterCompliancePriority(priority) {
  const select = document.getElementById('compliance-priority-filter');
  if (select) select.value = priority;
  renderComplianceMatrix(priority);
}

function renderComplianceMatrix(presetFilter) {
  const tbody = document.getElementById('compliance-matrix-tbody');
  if (!tbody) return;

  const search = (document.getElementById('compliance-search-input')?.value || '').toLowerCase().trim();
  const priorityFilter = presetFilter || document.getElementById('compliance-priority-filter')?.value || 'ALL';

  let criticalCount = 0;
  let warningCount = 0;
  let compliantCount = 0;

  const analyzedVehicles = allVehicles.map((v) => {
    const comp = calculateCompliancePriority(v);
    if (comp.overallPriority === 'CRITICAL') criticalCount++;
    else if (comp.overallPriority === 'WARNING') warningCount++;
    else compliantCount++;
    return { ...v, comp };
  });

  // Update top counters
  const elCrit = document.getElementById('compliance-count-critical');
  const elWarn = document.getElementById('compliance-count-warning');
  const elComp = document.getElementById('compliance-count-compliant');
  const elTot = document.getElementById('compliance-count-total');
  if (elCrit) elCrit.textContent = criticalCount;
  if (elWarn) elWarn.textContent = warningCount;
  if (elComp) elComp.textContent = compliantCount;
  if (elTot) elTot.textContent = allVehicles.length;

  const filtered = analyzedVehicles.filter((v) => {
    const matchPriority = priorityFilter === 'ALL' || v.comp.overallPriority === priorityFilter;
    const matchSearch =
      !search ||
      (v.vehicleNo && v.vehicleNo.toLowerCase().includes(search)) ||
      (v.name && v.name.toLowerCase().includes(search)) ||
      (v.site && v.site.toLowerCase().includes(search)) ||
      (v.operatorName && v.operatorName.toLowerCase().includes(search)) ||
      (v.fitnessCertNo && v.fitnessCertNo.toLowerCase().includes(search)) ||
      (v.pucCertNo && v.pucCertNo.toLowerCase().includes(search)) ||
      (v.insurancePolicyNo && v.insurancePolicyNo.toLowerCase().includes(search)) ||
      (v.permitNo && v.permitNo.toLowerCase().includes(search));
    return matchPriority && matchSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="padding: 28px; color: var(--text-dim);">No vehicle compliance records found matching filter.</td></tr>`;
    return;
  }

  const formatDocCell = (doc, title) => {
    if (!doc.expiry) return `<span class="badge badge-neutral" style="font-size: 11px;">Not Set</span>`;
    const days = doc.days;
    let pillClass = 'badge-success';
    let daysText = `${days}d left`;
    if (days <= 0) {
      pillClass = 'badge-danger';
      daysText = `Expired (${Math.abs(days)}d)`;
    } else if (days <= 7) {
      pillClass = 'badge-danger';
      daysText = `Urgent: ${days}d`;
    } else if (days <= 30) {
      pillClass = 'badge-warning';
      daysText = `Expires: ${days}d`;
    }
    return `
      <div>
        <span class="badge ${pillClass}" style="font-size: 10px; margin-bottom: 2px;">${daysText}</span>
        <div style="font-size: 11px; font-weight: 700; color: var(--logo-navy);">${escapeHtml(doc.expiry)}</div>
        <div style="font-size: 10px; color: var(--text-muted);">${escapeHtml(doc.no || title)}</div>
      </div>
    `;
  };

  tbody.innerHTML = filtered
    .map((v) => {
      const c = v.comp;
      return `
        <tr>
          <td>
            <strong>${escapeHtml(v.vehicleNo)}</strong>
            <div style="font-size: 11px; color: var(--text-muted);">${escapeHtml(v.name)} (${escapeHtml(v.type || 'HEMM')})</div>
            <div style="font-size: 10px; color: var(--logo-orange);"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(v.site || 'ACC Chanda')}</div>
          </td>
          <td>${formatDocCell(c.docs.fitness, 'Fitness')}</td>
          <td>${formatDocCell(c.docs.puc, 'PUC')}</td>
          <td>${formatDocCell(c.docs.insurance, 'Insurance')}</td>
          <td>${formatDocCell(c.docs.permit, 'Permit')}</td>
          <td>${formatDocCell(c.docs.roadTax, 'Road Tax')}</td>
          <td>
            <span class="badge-compliance-btn ${c.badgeClass}" style="cursor: default;">
              <i class="fa-solid ${c.icon}"></i> ${c.label}
            </span>
          </td>
          <td class="text-right">
            <button class="btn btn-outline-primary btn-xs" onclick="openEditComplianceModal('${v.id || v.vehicleNo}')" title="Update Compliance Dates">
              <i class="fa-solid fa-pen-to-square"></i> Edit
            </button>
          </td>
        </tr>
      `;
    })
    .join('');
}

function openEditComplianceModal(vehId) {
  const veh = allVehicles.find((v) => v.id === vehId || v.vehicleNo === vehId);
  if (!veh) return;

  document.getElementById('modal-edit-compliance-title').innerHTML = `<i class="fa-solid fa-file-shield text-orange"></i> Update Statutory Compliance (${escapeHtml(veh.vehicleNo)})`;
  document.getElementById('edit-comp-veh-id').value = veh.id || veh.vehicleNo;
  document.getElementById('edit-comp-veh-no').value = `${veh.vehicleNo} - ${veh.name} (${veh.type || 'Plant Machine'})`;
  document.getElementById('edit-comp-fitness-no').value = veh.fitnessCertNo || '';
  document.getElementById('edit-comp-fitness-exp').value = veh.fitnessExpiry || '';
  document.getElementById('edit-comp-puc-no').value = veh.pucCertNo || '';
  document.getElementById('edit-comp-puc-exp').value = veh.pucExpiry || '';
  document.getElementById('edit-comp-insurance-prov').value = veh.insuranceProvider || 'National Insurance / TATA AIG';
  document.getElementById('edit-comp-insurance-pol').value = veh.insurancePolicyNo || '';
  document.getElementById('edit-comp-insurance-exp').value = veh.insuranceExpiry || '';
  document.getElementById('edit-comp-permit-type').value = veh.permitType || 'National Permit';
  document.getElementById('edit-comp-permit-no').value = veh.permitNo || '';
  document.getElementById('edit-comp-permit-exp').value = veh.permitExpiry || '';
  document.getElementById('edit-comp-roadtax-no').value = veh.roadTaxReceipt || '';
  document.getElementById('edit-comp-roadtax-exp').value = veh.roadTaxExpiry || '';

  openModal('modal-edit-compliance');
}

async function saveVehicleCompliance(e) {
  const vehId = document.getElementById('edit-comp-veh-id').value;
  if (!vehId) return;

  const payload = {
    fitnessCertNo: document.getElementById('edit-comp-fitness-no').value.trim(),
    fitnessExpiry: document.getElementById('edit-comp-fitness-exp').value,
    pucCertNo: document.getElementById('edit-comp-puc-no').value.trim(),
    pucExpiry: document.getElementById('edit-comp-puc-exp').value,
    insuranceProvider: document.getElementById('edit-comp-insurance-prov').value.trim(),
    insurancePolicyNo: document.getElementById('edit-comp-insurance-pol').value.trim(),
    insuranceExpiry: document.getElementById('edit-comp-insurance-exp').value,
    permitType: document.getElementById('edit-comp-permit-type').value,
    permitNo: document.getElementById('edit-comp-permit-no').value.trim(),
    permitExpiry: document.getElementById('edit-comp-permit-exp').value,
    roadTaxReceipt: document.getElementById('edit-comp-roadtax-no').value.trim(),
    roadTaxExpiry: document.getElementById('edit-comp-roadtax-exp').value
  };

  try {
    const res = await fetch(`/api/payroll/vehicles/${vehId}/compliance`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || '? Statutory compliance updated successfully!');
      closeModal('modal-edit-compliance');
      await fetchVehicles();
      renderComplianceMatrix();
      renderVehiclesTable();
    } else {
      showToast(data.message || 'Failed to update compliance', 'error');
    }
  } catch (err) {
    showToast('Failed to save compliance records', 'error');
  }
}

function exportComplianceReportExcel() {
  const excelData = [
    ['SHREE RR TRADING COMPANY - HEMM FLEET COMPLIANCE STATUS REPORT'],
    [`Generated Date: ${new Date().toLocaleDateString('en-GB')} | Portal: https://payroll.shreerrtradingcompany.com`],
    [],
    [
      'Vehicle Reg No',
      'Machinery Name',
      'Type',
      'Assigned Site',
      'Assigned Operator',
      'Overall Priority',
      'Fitness Expiry',
      'Fitness Cert No',
      'PUC Expiry',
      'PUC Cert No',
      'Insurance Expiry',
      'Policy Number',
      'Insurance Company',
      'Permit Expiry',
      'Permit Number',
      'Permit Type',
      'Road Tax Expiry'
    ]
  ];

  allVehicles.forEach((v) => {
    const c = calculateCompliancePriority(v);
    excelData.push([
      v.vehicleNo || '',
      v.name || '',
      v.type || '',
      v.site || 'ACC Chanda',
      v.operatorName || 'Unassigned',
      c.overallPriority,
      v.fitnessExpiry || 'N/A',
      v.fitnessCertNo || 'N/A',
      v.pucExpiry || 'N/A',
      v.pucCertNo || 'N/A',
      v.insuranceExpiry || 'N/A',
      v.insurancePolicyNo || 'N/A',
      v.insuranceProvider || 'N/A',
      v.permitExpiry || 'N/A',
      v.permitNo || 'N/A',
      v.permitType || 'N/A',
      v.roadTaxExpiry || 'N/A'
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Fleet Compliance');
  XLSX.writeFile(wb, `Shree_RR_Fleet_Compliance_${new Date().toISOString().split('T')[0]}.xlsx`);
  showToast('📄 Fleet Compliance Excel Report downloaded!');
}

function sendComplianceWhatsAppAlert() {
  let criticalCount = 0;
  let warningCount = 0;
  const criticalList = [];
  const warningList = [];

  allVehicles.forEach((v) => {
    const c = calculateCompliancePriority(v);
    if (c.overallPriority === 'CRITICAL') {
      criticalCount++;
      criticalList.push(`• ${v.vehicleNo} (${v.name}): ${c.tooltip}`);
    } else if (c.overallPriority === 'WARNING') {
      warningCount++;
      warningList.push(`• ${v.vehicleNo} (${v.name}): ${c.tooltip}`);
    }
  });

  let text = `🚨 *SHREE RR TRADING COMPANY - FLEET COMPLIANCE ALERT* 🚨\nDate: ${new Date().toLocaleDateString('en-GB')}\n\n`;
  text += `📊 *Summary:* ${criticalCount} Critical / Expired | ${warningCount} Expiring Soon | ${allVehicles.length} Monitored Fleets\n\n`;

  if (criticalList.length > 0) {
    text += `🚨 *CRITICAL / EXPIRED (Action Required):*\n` + criticalList.slice(0, 8).join('\n') + '\n\n';
  }
  if (warningList.length > 0) {
    text += `⚠️ *EXPIRING SOON (<30 Days):*\n` + warningList.slice(0, 8).join('\n') + '\n\n';
  }
  text += `Portal Access: https://payroll.shreerrtradingcompany.com\n_Powered by SrijanDev_`;

  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function initOpeningWelcomePopup() {
  const hasShown = sessionStorage.getItem('srr_welcome_popup_seen');
  if (!hasShown) {
    setTimeout(() => {
      openModal('modal-opening-welcome');
      sessionStorage.setItem('srr_welcome_popup_seen', 'true');
    }, 600);
  }
}



