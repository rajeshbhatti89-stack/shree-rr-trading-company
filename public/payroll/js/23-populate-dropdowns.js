// 23. Populate Dropdowns
function populateUserDropdowns() {
  const leaveSelect = document.getElementById('leave-select-user');
  const creditSelect = document.getElementById('credit-select-user');

  const options = allUsers
    .filter((u) => u.role !== 'Super Admin')
    .map((u) => {
      const bal = u.leaveBalance !== undefined ? u.leaveBalance : 10;
      const tot = u.totalLeaves || 10;
      return `<option value="${u.id || u.empId}">${escapeHtml(u.name)} (${u.empId}) - ${escapeHtml(u.role || 'Worker')} [Bal: ${bal} / ${tot} Days]</option>`;
    })
    .join('');

  if (leaveSelect) leaveSelect.innerHTML = options;
  if (creditSelect) creditSelect.innerHTML = options;

  populateTechnicianDropdowns();
}

// 5. Assignment of Technician / Mechanic / Helper Dropdowns
function populateTechnicianDropdowns(leadId = '', asstId = '', helperId = '', issuedToId = '') {
  // Sort users into Mechanics/Technicians first, Helpers second, others third
  const staff = (allUsers || []).filter((u) => u.role !== 'Super Admin' && u.status !== 'Inactive');

  const mechanics = staff.filter((u) => {
    const d = (u.designation || '').toLowerCase();
    const r = (u.rank || '').toLowerCase();
    return d.includes('mechanic') || d.includes('technician') || d.includes('fitter') || d.includes('electrician') || r.includes('mechanic');
  });

  const helpers = staff.filter((u) => {
    const d = (u.designation || '').toLowerCase();
    const r = (u.rank || '').toLowerCase();
    return d.includes('helper') || d.includes('greaser') || d.includes('cleaner') || r.includes('helper');
  });

  const others = staff.filter((u) => !mechanics.includes(u) && !helpers.includes(u));

  const formatOption = (u, selectedKey) => {
    const isSelected = (u.id === selectedKey || u.empId === selectedKey);
    return `<option value="${u.id}" data-empid="${u.empId}" data-name="${escapeHtml(u.name)}" data-role="${escapeHtml(u.designation || 'Staff')}" ${isSelected ? 'selected' : ''}>${escapeHtml(u.name)} (${u.empId}) - ${escapeHtml(u.designation || 'Staff')}</option>`;
  };

  const buildGroupedHtml = (emptyLabel, selectedVal) => {
    let html = `<option value="">-- ${emptyLabel} --</option>`;
    if (mechanics.length > 0) {
      html += `<optgroup label="🔧 Mechanics & Technicians">` + mechanics.map(u => formatOption(u, selectedVal)).join('') + `</optgroup>`;
    }
    if (helpers.length > 0) {
      html += `<optgroup label="🛠️ Helpers & Greasers">` + helpers.map(u => formatOption(u, selectedVal)).join('') + `</optgroup>`;
    }
    if (others.length > 0) {
      html += `<optgroup label="👷 Plant Operators & Other Staff">` + others.map(u => formatOption(u, selectedVal)).join('') + `</optgroup>`;
    }
    return html;
  };

  const leadSelect = document.getElementById('jc-lead-mechanic');
  if (leadSelect) leadSelect.innerHTML = buildGroupedHtml('Select Lead Mechanic / Technician *', leadId);

  const asstSelect = document.getElementById('jc-asst-mechanic');
  if (asstSelect) asstSelect.innerHTML = buildGroupedHtml('None (Optional Assistant Mechanic)', asstId);

  const helperSelect = document.getElementById('jc-helper');
  if (helperSelect) helperSelect.innerHTML = buildGroupedHtml('None (Optional Helper / Greaser)', helperId);

  const issuedToSelect = document.getElementById('chl-issued-to');
  if (issuedToSelect) issuedToSelect.innerHTML = buildGroupedHtml('Select Receiving Technician / Mechanic *', issuedToId);

  const filterTechSelect = document.getElementById('filter-jc-mechanic');
  if (filterTechSelect) {
    let techFilterHtml = `<option value="ALL">All Technicians / Mechanics</option>`;
    mechanics.forEach(m => {
      techFilterHtml += `<option value="${m.id}">${escapeHtml(m.name)} (${m.empId})</option>`;
    });
    filterTechSelect.innerHTML = techFilterHtml;
  }
}


