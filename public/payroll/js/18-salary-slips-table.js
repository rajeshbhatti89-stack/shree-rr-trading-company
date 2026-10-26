// 18. Salary Slips & Table
function initSalarySlips() {
  const bulkGenBtn = document.getElementById('btn-bulk-generate-slips');
  const monthSelect = document.getElementById('payroll-month-select');

  const handleBulkGenerate = async () => {
    const selectedMonth = monthSelect ? monthSelect.value : 'August 2026';
    if (!confirm(`Generate official salary slips for all active employees for ${selectedMonth}?`)) return;

    try {
      if (bulkGenBtn) {
        bulkGenBtn.disabled = true;
        bulkGenBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating Slips...';
      }

      const res = await fetch('/api/payroll/salary-slips/bulk-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthYear: selectedMonth })
      });

      const data = await res.json();
      if (data.success) {
        showToast(`⚡ Generated ${data.generatedCount} salary slips for ${selectedMonth}!`);
        await fetchSalarySlips();
        updateDashboardMetrics();
      }
    } catch (err) {
      console.error('Bulk slip error:', err);
    } finally {
      if (bulkGenBtn) {
        bulkGenBtn.disabled = false;
        bulkGenBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> 1-Click Generate All Slips';
      }
    }
  };

  if (bulkGenBtn) bulkGenBtn.addEventListener('click', handleBulkGenerate);
  if (monthSelect) monthSelect.addEventListener('change', renderSalaryTable);

  const bulkWhatsAppBtn = document.getElementById('btn-bulk-whatsapp-all');
  if (bulkWhatsAppBtn) bulkWhatsAppBtn.addEventListener('click', dispatchBulkWhatsApp);
}

function renderSalaryTable() {
  const tbody = document.getElementById('salary-table-body');
  if (!tbody) return;

  const search = (document.getElementById('slip-search-input')?.value || '').toLowerCase().trim();
  const selectedMonth = document.getElementById('payroll-month-select')?.value || 'August 2026';

  const filtered = allSalarySlips.filter((s) => {
    // Role-based visibility: Normal users only see their own slips (if they somehow access this view)
    if (currentUser && currentUser.role !== 'Super Admin' && !currentUser.permissions?.['payroll.manage_all'] && !currentUser.permissions?.['payroll.salary_structure.view']) {
      if (s.empId !== currentUser.empId && s.userId !== currentUser.id) return false;
    }
    
    // Branch filtering: ACC Chanda managers shouldn't see HQ slips
    if (currentUser && currentUser.role !== 'Super Admin' && currentUser.site !== 'Headquarters / All Sites') {
      if (s.location !== currentUser.site && s.location !== currentUser.location) return false;
    }

    const matchMonth = !selectedMonth || s.monthYear === selectedMonth;
    const matchSearch =
      !search ||
      (s.userName && s.userName.toLowerCase().includes(search)) ||
      (s.empId && s.empId.toLowerCase().includes(search)) ||
      (s.designation && s.designation.toLowerCase().includes(search));
    return matchMonth && matchSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center" style="padding: 30px; color: var(--text-dim);">No salary slips generated for ${selectedMonth}. Click "1-Click Generate All Slips" above.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((s) => {
      const grossStr = `₹${Number(s.grossPay || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      const dedStr = `₹${Number(s.totalDeductions || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      const netStr = `₹${Number(s.netPay || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      const resolvedOt = Number(s.earnings?.otWage !== undefined ? s.earnings.otWage : (s.otWage || 0));
      const isManual = s.isManuallyCorrected || s.manualLocked;

      const otBadge = resolvedOt > 0
        ? `<div style="margin-top: 3px;"><span class="badge" style="background: rgba(255,107,0,0.12); color: #C2410C; font-size: 10.5px; font-weight: 700; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(255,107,0,0.3);"><i class="fa-solid fa-bolt text-orange"></i> OT: ₹${resolvedOt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>`
        : '';
      const lockBadge = isManual
        ? `<span class="badge" style="background: rgba(14,165,233,0.1); color: #0284C7; font-size: 9.5px; font-weight: 700; padding: 1px 5px; border-radius: 4px; margin-left: 4px;" title="Manually Corrected & Locked"><i class="fa-solid fa-lock"></i> Locked</span>`
        : '';

      return `
      <tr>
        <td class="emp-cell-id">${s.id ? s.id.slice(-9) : 'SLP'}</td>
        <td><strong>${escapeHtml(s.monthYear)}</strong>${lockBadge}</td>
        <td>
          <span class="emp-cell-name">${escapeHtml(s.userName)}</span>
          <span class="emp-cell-sub">ID: ${escapeHtml(s.empId)} | Site: ${escapeHtml(s.location || 'ACC Chanda')}</span>
        </td>
        <td>${escapeHtml(s.designation || 'Staff')}</td>
        <td>
          <strong>${s.workedDays || 31} / ${s.totalDays || 31}</strong>
          ${otBadge}
        </td>
        <td><strong>${grossStr}</strong></td>
        <td><span class="text-danger">${dedStr}</span></td>
        <td><strong class="text-orange text-lg">${netStr}</strong></td>
        <td><span class="status-badge status-paid"><i class="fa-solid fa-circle-check"></i> ${s.status || 'Paid'}</span></td>
        <td class="text-right">
          <div style="display: inline-flex; gap: 6px; align-items: center;">
            <button class="btn btn-outline-primary btn-sm" onclick="openSalaryCorrectionModal('${s.id}')" title="Edit / Correct Salary Structure">
              <i class="fa-solid fa-pen-to-square"></i> Edit
            </button>
            <button class="btn btn-outline btn-sm" onclick="viewSalarySlip('${s.id}')" title="View Official Slip">
              <i class="fa-solid fa-file-invoice"></i> View
            </button>
            <button class="btn btn-outline-primary btn-sm" onclick="downloadSlipPdf('${s.id}')" title="Download Official PDF Salary Slip">
              <i class="fa-solid fa-file-pdf"></i> PDF
            </button>
            <button class="btn btn-outline-success btn-sm" onclick="sendSlipWhatsApp('${s.id}')" title="Download PDF & Send on WhatsApp">
              <i class="fa-brands fa-whatsapp"></i> WhatsApp
            </button>
          </div>
        </td>
      </tr>
    `;
    })
    .join('');
}



