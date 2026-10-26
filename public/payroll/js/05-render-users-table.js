// 5. Render Users Table
function renderUsersTable() {
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;

  const search = (document.getElementById('user-search-input')?.value || '').toLowerCase().trim();
  const roleFilter = document.getElementById('user-role-filter')?.value || 'ALL';
  const catFilter = document.getElementById('user-category-filter')?.value || 'ALL';

  const excludedLocations = ['ho', 'filter plant', 'shr letter', 'offer'];
  const filtered = allUsers.filter((u) => {
    if (u.role === 'Super Admin' && (!currentUser || currentUser.role !== 'Super Admin')) return false;
    const loc = (u.location || '').toLowerCase();
    const site = (u.site || '').toLowerCase();
    if ((!currentUser || currentUser.role !== 'Super Admin') && excludedLocations.some(ex => loc.includes(ex) || site.includes(ex))) return false;
    
    // ACC Chanda (or other branch) users should only see their own branch users
    if (currentUser && currentUser.role !== 'Super Admin' && currentUser.site !== 'Headquarters / All Sites') {
      if (u.site !== currentUser.site && u.location !== currentUser.location) return false;
    }
    
    const matchSearch =
      !search ||
      (u.name && u.name.toLowerCase().includes(search)) ||
      (u.empId && u.empId.toLowerCase().includes(search)) ||
      (u.mobile && u.mobile.includes(search)) ||
      (u.designation && u.designation.toLowerCase().includes(search));
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchCat = catFilter === 'ALL' || u.category === catFilter;
    return matchSearch && matchRole && matchCat;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" class="text-center" style="padding: 30px; color: var(--text-dim);">No matching employees found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((u) => {
      const isDaily = !!u.basicPerDay;
      let grossHtml = '', ctcHtml = '';

      if (isDaily) {
        const sc = u.salaryComponents || {};
        const dailyRate = Number(u.basicPerDay) + (Number(sc.daPerDay) || 0) + (Number(sc.hraPerDay) || 0);
        const monthlyGross = Math.round(dailyRate * 26);
        const ec = u.employerContributions || {};
        const erPf = ec.pfAmount || (Math.round(Number(u.basicPerDay) * 26 * ((ec.pfVal ?? 12) <= 30 ? (ec.pfVal ?? 12) / 100 : 0)) || (ec.pfVal > 30 ? ec.pfVal : 0));
        const erEsic = ec.esicAmount || (monthlyGross <= 21000 ? Math.round(monthlyGross * ((ec.esicVal ?? 3.25) <= 10 ? (ec.esicVal ?? 3.25) / 100 : 0)) : 0);
        const totalCtc = u.ctc || (monthlyGross + erPf + erEsic);

        grossHtml = `<strong>?${monthlyGross.toLocaleString('en-IN')}</strong><span class="emp-cell-sub">?${dailyRate.toFixed(2)}/d × 26d</span>`;
        ctcHtml = `<strong style="color: #FF6B00;">?${Math.round(totalCtc).toLocaleString('en-IN')}</strong><span class="emp-cell-sub">Est. CTC / Mo</span>`;
      } else {
        const sc = u.salaryComponents || {};
        const scSum = sc.basic ? (Number(sc.basic || 0) + Number(sc.da || 0) + Number(sc.hra || 0) + Number(sc.specialAllowance || 0) + Number(sc.bonus || 0) + Number(sc.otherEarnings || 0)) : 0;
        const monthlyGross = u.grossSalary || scSum || u.baseSalary || u.ctc || 25000;

        const ec = u.employerContributions || {};
        let totalCtc = u.ctc;
        if (!totalCtc) {
          if (ec.totalEmployer) {
            totalCtc = monthlyGross + Number(ec.totalEmployer);
          } else {
            const erPf = ec.pfAmount || Math.round((Number(sc.basic) || (monthlyGross * 0.5)) * ((ec.pfVal ?? 12) <= 30 ? (ec.pfVal ?? 12) / 100 : 0));
            const erEsic = ec.esicAmount || (monthlyGross <= 21000 ? Math.round(monthlyGross * ((ec.esicVal ?? 0) <= 10 ? (ec.esicVal ?? 0) / 100 : 0)) : 0);
            totalCtc = monthlyGross + erPf + erEsic + Number(ec.gratuity || 0);
          }
        }

        grossHtml = `<strong style="color: #15803D;">?${Number(monthlyGross).toLocaleString('en-IN')}</strong><span class="emp-cell-sub">Gross / Mo</span>`;
        ctcHtml = `<strong style="color: #FF6B00;">?${Number(totalCtc).toLocaleString('en-IN')}</strong><span class="emp-cell-sub">Total CTC / Mo</span>`;
      }

      const cleanMobile = (u.mobile || u.phone || '').replace(/[^0-9]/g, '').slice(-10);
      const whatsappBtn = cleanMobile
        ? `<a href="https://wa.me/91${cleanMobile}" target="_blank" class="btn-icon-only text-success" title="Chat on WhatsApp (+91 ${cleanMobile})">
            <i class="fa-brands fa-whatsapp"></i>
           </a>`
        : `<span class="text-dim">-</span>`;

      const roleClass = u.role === 'Worker' ? 'role-worker' : (u.role === 'Supervisor' ? 'role-supervisor' : (u.role === 'Manager' ? 'role-manager' : 'role-employee'));
      const isLoginActive = u.loginAllowed === true || u.loginEnabled === true;
      const accessBadge = isLoginActive
        ? `<span class="badge-pill" style="background: rgba(16, 185, 129, 0.1); color: #059669; border-color: rgba(16, 185, 129, 0.3);"><i class="fa-solid fa-lock-open"></i> Active</span>`
        : `<span class="badge-pill" style="background: #F1F5F9; color: #64748B; border-color: #CBD5E1;"><i class="fa-solid fa-lock"></i> Locked</span>`;

      const canViewSalary = currentUser && (currentUser.role === 'Super Admin' || (currentUser.permissions && (currentUser.permissions['payroll.salary_structure.view'] || currentUser.permissions['payroll.manage_all'])));
      
      const finalGrossHtml = canViewSalary ? grossHtml : `<span class="text-dim"><i class="fa-solid fa-lock"></i> Restricted</span>`;
      const finalCtcHtml = canViewSalary ? ctcHtml : `<span class="text-dim"><i class="fa-solid fa-lock"></i> Restricted</span>`;
      const letterBtn = canViewSalary ? `<button class="btn-icon-only text-orange" title="Generate Official Appointment / Offer Letter" onclick="openAppointmentLetterModal('${u.id || u.empId}')">
              <i class="fa-solid fa-file-signature"></i>
            </button>` : '';

      return `
      <tr>
        <td class="emp-cell-id">${u.empId || 'SRR'}</td>
        <td>
          <span class="emp-cell-name">${escapeHtml(u.name)}</span>
          <span class="emp-cell-sub"><i class="fa-solid fa-user-tag"></i> Father: ${escapeHtml(u.fatherName || 'N/A')}</span>
        </td>
        <td><span class="role-badge ${roleClass}"><i class="fa-solid fa-id-badge"></i> ${escapeHtml(u.role || 'Worker')}</span></td>
        <td>
          <div style="display: flex; align-items: center; gap: 6px;">
            ${accessBadge}
            <button class="btn-icon-only text-navy" title="Manage Granular RBAC Permissions" onclick="openUserAccessModal('${u.id || u.empId}')">
              <i class="fa-solid fa-user-shield"></i>
            </button>
          </div>
        </td>
        <td>
          <strong>${escapeHtml(u.designation || u.rank || 'Staff')}</strong>
          <span class="emp-cell-sub">PF: ${escapeHtml(u.pfNo ? u.pfNo.slice(-7) : 'N/A')}</span>
        </td>
        <td>
          <span class="badge-pill" style="background: #FEF3C7; color: #B45309; border-color: #FDE68A;">
            <strong>${u.leaveBalance !== undefined ? u.leaveBalance : 10}</strong> / ${u.totalLeaves || 10} Days
          </span>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span>${cleanMobile ? `+91 ${cleanMobile}` : 'N/A'}</span>
            ${whatsappBtn}
          </div>
        </td>
        <td>
          <strong>${escapeHtml(u.bankAccount || 'N/A')}</strong>
          <span class="emp-cell-sub">IFSC: ${escapeHtml(u.ifsc || 'N/A')}</span>
        </td>
        <td>${finalGrossHtml}</td>
        <td>${finalCtcHtml}</td>
        <td class="text-right">
          <div style="display: inline-flex; gap: 6px;">
            ${letterBtn}
            <button class="btn-icon-only text-navy" title="Edit Record" onclick="editUser('${u.id || u.empId}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-icon-only btn-danger" title="Delete / Left Organisation" onclick="deleteUser('${u.id || u.empId}', '${escapeHtml(u.name)}')">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
    })
    .join('');
}



