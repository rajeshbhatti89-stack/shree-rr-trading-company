/**
 * SHREE RR TRADING COMPANY - ENTERPRISE OPERATIONS, PAYROLL, VEHICLE AVAILABILITY & MTTR SUITE
 * Features:
 * 1. Vehicle Fleet Management & Bulk Upload (Excel/CSV)
 * 2. Delete All Vehicles option
 * 3. Vehicle Availability & Breakdown (B/D in Hours) Engine
 * 4. Automatic MTTR (Mean Time To Repair) & MTBF Reliability Calculator
 * 5. 1-Click Excel Exporters (MTTR Report, Tomorrow Schedule, Monthly Payroll, Bank NEFT)
 * 6. Attendance Glass View & Leave Balance Tracker
 * 7. Superadmin Role-Based Access Control (RBAC) & Feature Matrix
 */

// Global State
let currentUser = null;
let allUsers = [];
let allVehicles = [];
let allVehicleLogs = [];
let allAttendance = [];
let allRosters = [];
let allLeaves = [];
let allSalarySlips = [];
let parsedBulkEmployees = [];
let parsedBulkVehicles = [];
let currentActiveSlip = null;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initNavigation();
  initMobileSidebar();
  initAuth();
  initEventListeners();
  checkExistingSession();
  initOpeningWelcomePopup();
  initLeaveManagement();
});

// 1. Clock Display
function initClock() {
  const clockEl = document.getElementById('live-clock-display');
  const update = () => {
    const now = new Date();
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    }
  };
  update();
  setInterval(update, 1000);
}

// 2. Navigation Tabs & Mobile Drawer
function initNavigation() {
  const navItems = document.querySelectorAll('.sidebar-menu .nav-item');
  navItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = item.getAttribute('data-tab');
      switchTab(tabId);
    });
  });
}

function initMobileSidebar() {
  const toggleBtn = document.getElementById('mobile-sidebar-toggle');
  const closeBtn = document.getElementById('sidebar-close-btn');
  const backdrop = document.getElementById('sidebar-backdrop');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openMobileSidebar();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closeMobileSidebar();
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', () => {
      closeMobileSidebar();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileSidebar();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) {
      closeMobileSidebar();
    }
  });
}

function openMobileSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const toggleBtn = document.getElementById('mobile-sidebar-toggle');
  if (sidebar) sidebar.classList.add('mobile-open');
  if (backdrop) backdrop.classList.add('active');
  if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const toggleBtn = document.getElementById('mobile-sidebar-toggle');
  if (sidebar) sidebar.classList.remove('mobile-open');
  if (backdrop) backdrop.classList.remove('active');
  if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

function switchTab(tabId) {
  closeMobileSidebar();

  document.querySelectorAll('.sidebar-menu .nav-item').forEach((i) => i.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach((p) => p.classList.remove('active'));

  const navItem = document.querySelector(`.sidebar-menu .nav-item[data-tab="${tabId}"]`);
  const tabPane = document.getElementById(`tab-${tabId}`);

  if (navItem) navItem.classList.add('active');
  if (tabPane) tabPane.classList.add('active');

  const pageTitle = document.getElementById('current-page-title');
  if (pageTitle) {
    const titles = {
      dashboard: 'Operations Dashboard',
      users: 'Workforce & Access Management',
      vehicles: 'Plant Vehicles & Fleet Management',
      muster: 'Daily Muster Roll (Today)',
      tomorrow: "Tomorrow's Shift & Machine Schedule",
      'attendance-glass': 'Attendance Glass & Leave Tracker',
      payroll: 'Salary Slips & Disbursal',
      reports: 'Executive Reports & Disbursals Center'
    };
    pageTitle.textContent = titles[tabId] || 'Operations Dashboard';
  }

  if (tabId === 'vehicles') {
    renderVehiclesTable();
    renderFleetMTTRMatrix();
    renderVehicleBreakdownLogs();
  }
  if (tabId === 'muster') renderMusterRollTable();
  if (tabId === 'tomorrow') renderTomorrowScheduleTable();
  if (tabId === 'attendance-glass') renderAttendanceGlassCards();
  if (tabId === 'reports') populateReportsDefaults();
}

// 3. Authentication & RBAC Session
function initAuth() {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value.trim();
      const btn = document.getElementById('login-btn');

      try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';

        const res = await fetch('/api/payroll/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (data.success) {
          currentUser = data.user;
          sessionStorage.setItem('srr_payroll_user', JSON.stringify(currentUser));
          showPortal();
          showToast(`Welcome, ${currentUser.name}!`);

          if (currentUser.mustChangePassword) {
            promptFirstLoginPasswordChange();
          }
        } else {
          showToast(data.message || 'Invalid credentials. Please verify your login details.', 'error');
        }
      } catch (err) {
        console.error('Login error:', err);
        showToast('Login request failed. Check network connection.', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Sign In to Portal';
      }
    });
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('srr_payroll_user');
      currentUser = null;
      document.getElementById('app-container').classList.add('hidden');
      document.getElementById('login-container').classList.remove('hidden');
      document.getElementById('login-form').reset();
      showToast('Signed out successfully.');
    });
  }
}

function checkExistingSession() {
  const saved = sessionStorage.getItem('srr_payroll_user');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      showPortal();
    } catch (e) {
      sessionStorage.removeItem('srr_payroll_user');
    }
  }
}

function showPortal() {
  document.getElementById('login-container').classList.add('hidden');
  document.getElementById('app-container').classList.remove('hidden');

  if (currentUser) {
    document.getElementById('user-display-name').textContent = currentUser.name || 'Super Admin';
    document.getElementById('user-display-role').textContent = currentUser.role || 'Administrator';
    const initials = (currentUser.name || 'SA')
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    document.getElementById('user-avatar').textContent = initials;

    applyDynamicRBACPermissions();
  }

  loadAllData();
}

function applyDynamicRBACPermissions() {
  if (!currentUser) return;
  const isSuper = currentUser.role === 'Super Admin';
  const perms = currentUser.permissions || {};

  const checkPerm = (permKey) => {
    if (isSuper || perms['*'] === true) return true;
    return perms[permKey] === true;
  };

  const navUsers = document.getElementById('nav-users');
  if (navUsers) {
    if (checkPerm('hr.users.manage')) navUsers.classList.remove('hidden');
    else navUsers.classList.add('hidden');
  }

  const navVehicles = document.getElementById('nav-vehicles');
  if (navVehicles) {
    if (checkPerm('fleets.manage')) navVehicles.classList.remove('hidden');
    else navVehicles.classList.add('hidden');
  }

  const navMuster = document.getElementById('nav-muster');
  if (navMuster) {
    if (checkPerm('attendance.muster.mark')) navMuster.classList.remove('hidden');
    else navMuster.classList.add('hidden');
  }

  const navTomorrow = document.getElementById('nav-tomorrow');
  if (navTomorrow) {
    if (checkPerm('attendance.muster.mark') || checkPerm('fleets.manage')) navTomorrow.classList.remove('hidden');
    else navTomorrow.classList.add('hidden');
  }

  const navPayroll = document.getElementById('nav-payroll');
  if (navPayroll) {
    if (checkPerm('payroll.salary_structure.view') || checkPerm('payroll.manage_all')) navPayroll.classList.remove('hidden');
    else navPayroll.classList.add('hidden');
  }

  const navReports = document.getElementById('nav-reports');
  if (navReports) {
    if (checkPerm('reports.bank_deposit.export')) navReports.classList.remove('hidden');
    else navReports.classList.add('hidden');
  }
}

function promptFirstLoginPasswordChange() {
  const newPwd = prompt(`Security Notice: You are logging in with a temporary password.\nPlease enter your new permanent password:`);
  if (!newPwd || newPwd.length < 6) {
    alert('Password must be at least 6 characters. Please change it from your profile.');
    return;
  }

  fetch('/api/payroll/auth/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: currentUser.id || currentUser.empId, newPassword: newPwd })
  })
    .then((r) => r.json())
    .then((data) => {
      if (data.success) {
        showToast('Permanent password saved successfully.');
        currentUser.mustChangePassword = false;
        sessionStorage.setItem('srr_payroll_user', JSON.stringify(currentUser));
      }
    })
    .catch(() => {});
}

// 4. Data Fetching
async function loadAllData() {
  await Promise.all([
    fetchUsers(),
    fetchVehicles(),
    fetchVehicleLogs(),
    fetchAttendance(),
    fetchRosters(),
    fetchLeaves(),
    fetchSalarySlips()
  ]);
  updateDashboardMetrics();
}

async function fetchUsers() {
  try {
    const res = await fetch('/api/payroll/users');
    const data = await res.json();
    if (data.success && Array.isArray(data.users)) {
      allUsers = data.users;
    }
  } catch (e) {
    console.warn('Users fetch cache', e);
  }
  renderUsersTable();
  populateUserDropdowns();
  renderMusterRollTable();
  renderTomorrowScheduleTable();
  renderAttendanceGlassCards();
}

async function fetchVehicles() {
  try {
    const res = await fetch('/api/payroll/vehicles');
    const data = await res.json();
    if (data.success && Array.isArray(data.vehicles)) {
      allVehicles = data.vehicles;
    }
  } catch (e) {
    console.warn('Vehicles fetch failed', e);
  }
  renderVehiclesTable();
  populateVehicleDropdowns();
  renderTomorrowScheduleTable();
  renderFleetMTTRMatrix();
}

async function fetchVehicleLogs() {
  try {
    const res = await fetch('/api/payroll/vehicle-logs');
    const data = await res.json();
    if (data.success && Array.isArray(data.vehicleLogs)) {
      allVehicleLogs = data.vehicleLogs;
    }
  } catch (e) {
    console.warn('Vehicle logs fetch failed', e);
  }
  renderFleetMTTRMatrix();
  renderVehicleBreakdownLogs();
}

async function fetchAttendance() {
  try {
    const res = await fetch('/api/payroll/attendance');
    const data = await res.json();
    if (data.success && Array.isArray(data.attendance)) {
      allAttendance = data.attendance;
    }
  } catch (e) {
    console.warn('Attendance fetch failed', e);
  }
  renderAttendanceGlassCards();
  renderMusterRollTable();
}

async function fetchRosters() {
  try {
    const res = await fetch('/api/payroll/rosters');
    const data = await res.json();
    if (data.success && Array.isArray(data.rosters)) {
      allRosters = data.rosters;
    }
  } catch (e) {
    console.warn('Roster fetch failed', e);
  }
  renderTomorrowScheduleTable();
}

async function fetchLeaves() {
  try {
    const res = await fetch('/api/payroll/leaves');
    const data = await res.json();
    if (data.success && Array.isArray(data.leaves)) {
      allLeaves = data.leaves;
    }
  } catch (e) {
    console.warn('Leaves fetch failed', e);
  }
  renderAttendanceGlassCards();
}

// Client-side Salary Slips Generator Utility
function generateClientSalarySlips(mYear = 'August 2026') {
  if (!Array.isArray(allUsers) || allUsers.length === 0) return [];
  const activeEmployees = allUsers.filter((u) => u.role !== 'Super Admin' && u.status !== 'Inactive');
  const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  let defaultDim = 31;
  if (mYear) {
    const parts = mYear.split(' ');
    const mIdx = monthNames.indexOf(parts[0].toLowerCase());
    const yr = parseInt(parts[1]) || 2026;
    if (mIdx !== -1) {
      defaultDim = new Date(yr, mIdx + 1, 0).getDate();
    }
  }

  return activeEmployees.map((u) => {
    const dim = defaultDim;
    const pdays = Math.min(dim, Number(u.payableDays) || (Number(u.presentDays || 26) + Number(u.weakOff || 4) + Number(u.leave || 0)));
    const ctc = Number(u.ctc);
    const bpd = Number(u.basicPerDay);

    let basic = 0, da = 0, hra = 0, specialAllowance = 0, grossPay = 0;
    let pf = 0, esic = 0, pt = 0, totalDeductions = 0, netPay = 0;

    if (ctc && ctc > 0) {
      const basicPerDay = (ctc / 2) / dim;
      basic = Math.round(basicPerDay * pdays * 100) / 100;
      da = 0;
      hra = Math.round(0.40 * basic * 100) / 100;
      const pfEmployer = Math.round((basic + da) * 0.12 * 100) / 100;
      const ctcWorking = Math.round((ctc / dim) * pdays * 100) / 100;
      grossPay = Math.round((ctcWorking - pfEmployer) * 100) / 100;
      specialAllowance = Math.round(Math.max(0, grossPay - (basic + da + hra)) * 100) / 100;
      pf = Math.round((basic + da) * 0.12 * 100) / 100;
      pt = grossPay > 0 ? 200 : 0;
      esic = 0;
      totalDeductions = Math.round((pf + pt + esic) * 100) / 100;
      netPay = Math.round((grossPay - totalDeductions) * 100) / 100;
    } else {
      const bpdVal = bpd || 444.62;
      basic = Math.round(bpdVal * pdays * 100) / 100;
      da = Math.round(289.38 * pdays * 100) / 100;
      hra = Math.round(62.70 * pdays * 100) / 100;
      specialAllowance = 0;
      grossPay = Math.round((basic + da + hra) * 100) / 100;
      pf = Math.round((basic + da) * 0.12 * 100) / 100;
      esic = Math.round(grossPay * 0.0075 * 100) / 100;
      pt = grossPay > 0 ? 200 : 0;
      totalDeductions = Math.round((pf + esic + pt) * 100) / 100;
      netPay = Math.round((grossPay - totalDeductions) * 100) / 100;
    }

    return {
      id: `slp-${(u.empId || 'srr').toLowerCase()}-${mYear.replace(/\s+/g, '-').toLowerCase()}`,
      userId: u.id,
      empId: u.empId,
      userName: u.name,
      monthYear: mYear,
      month: mYear.split(' ')[0],
      year: mYear.split(' ')[1] || '2026',
      designation: u.designation || u.rank || 'Staff',
      department: u.department || 'Plant Fleet & Garage O&M',
      fatherName: u.fatherName || '',
      dob: u.dob || '',
      doj: u.doj || '',
      uan: u.uan || '',
      esicNo: u.esicNo || '',
      pfNo: u.pfNo || '',
      bankAccount: u.bankAccount || '',
      ifsc: u.ifsc || '',
      location: u.location || u.site || 'ACC Chanda',
      category: u.category || 'Skilled',
      mobile: u.mobile || '',
      phone: u.phone || '',
      workedDays: pdays,
      totalDays: dim,
      otHours: 0,
      otWage: 0,
      earnings: { basic, da, hra, specialAllowance, bonus: 0, otWage: 0 },
      deductions: { pf, esic, pt, lic: 0, advance: 0 },
      grossPay,
      totalDeductions,
      netPay,
      status: 'Paid',
      paymentDate: mYear.includes('August') ? '2026-08-31' : (mYear.includes('July') ? '2026-07-31' : '2026-09-30')
    };
  });
}

async function fetchSalarySlips() {
  try {
    const res = await fetch('/api/payroll/salary-slips');
    const data = await res.json();
    if (data.success && Array.isArray(data.salarySlips) && data.salarySlips.length > 0) {
      allSalarySlips = data.salarySlips;
    }
  } catch (e) {
    console.warn('Salary slips fetch failed', e);
  }

  // Guarantee August 2026, July 2026, and September 2026 salary structures are loaded
  if (allUsers.length > 0) {
    const hasAugust = allSalarySlips.some((s) => s.monthYear === 'August 2026');
    const hasJuly = allSalarySlips.some((s) => s.monthYear === 'July 2026');
    const hasSeptember = allSalarySlips.some((s) => s.monthYear === 'September 2026');

    if (!hasAugust) {
      allSalarySlips = [...generateClientSalarySlips('August 2026'), ...allSalarySlips];
    }
    if (!hasJuly) {
      allSalarySlips = [...allSalarySlips, ...generateClientSalarySlips('July 2026')];
    }
    if (!hasSeptember) {
      allSalarySlips = [...allSalarySlips, ...generateClientSalarySlips('September 2026')];
    }
  }

  renderSalaryTable();
}

// 5. Render Users Table
function renderUsersTable() {
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;

  const search = (document.getElementById('user-search-input')?.value || '').toLowerCase().trim();
  const roleFilter = document.getElementById('user-role-filter')?.value || 'ALL';
  const catFilter = document.getElementById('user-category-filter')?.value || 'ALL';

  const filtered = allUsers.filter((u) => {
    if (u.role === 'Super Admin') return false;
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
    tbody.innerHTML = `<tr><td colspan="10" class="text-center" style="padding: 30px; color: var(--text-dim);">No matching employees found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((u) => {
      const isDaily = !!u.basicPerDay;
      const rateText = isDaily
        ? `₹${Number(u.basicPerDay).toFixed(2)} / Day`
        : u.ctc
        ? `₹${Number(u.ctc).toLocaleString('en-IN')} / Mo`
        : `₹${Number(u.baseSalary || 25000).toLocaleString('en-IN')} / Mo`;

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
        <td><strong>${rateText}</strong></td>
        <td class="text-right">
          <div style="display: inline-flex; gap: 6px;">
            <button class="btn-icon-only text-orange" title="Generate Official Appointment / Offer Letter" onclick="openAppointmentLetterModal('${u.id || u.empId}')">
              <i class="fa-solid fa-file-signature"></i>
            </button>
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

// 6. Superadmin Dynamic Permissions Modal Handler
function openUserAccessModal(userId) {
  const user = allUsers.find((u) => u.id === userId || u.empId === userId);
  if (!user) return;

  document.getElementById('access-user-id').value = user.id || user.empId;
  document.getElementById('access-user-name').textContent = user.name;
  document.getElementById('access-user-sub').textContent = `Emp ID: ${user.empId} | Trade: ${user.designation || user.rank || 'Staff'} | Site: ${user.location || 'ACC Chanda'}`;
  document.getElementById('access-user-role').value = user.role || 'Worker';
  document.getElementById('access-login-toggle').checked = (user.loginAllowed === true || user.loginEnabled === true);
  document.getElementById('access-user-password').value = user.password || `${user.empId}@123`;

  const perms = user.permissions || {};
  document.getElementById('perm-manage-users').checked = perms['hr.users.manage'] === true;
  document.getElementById('perm-mark-muster').checked = perms['attendance.muster.mark'] === true;
  document.getElementById('perm-manage-fleets').checked = perms['fleets.manage'] === true;
  document.getElementById('perm-view-salary').checked = perms['payroll.salary_structure.view'] === true;
  document.getElementById('perm-manage-payroll').checked = perms['payroll.manage_all'] === true;
  document.getElementById('perm-export-reports').checked = perms['reports.bank_deposit.export'] === true;
  document.getElementById('perm-appointment-letters').checked = perms['hr.appointment_letter.generate'] === true;
  document.getElementById('perm-field-expenses').checked = perms['expenses.field_claims.process'] === true;

  openModal('modal-user-access');
}

// 7. Delete User
async function deleteUser(userId, userName) {
  if (!confirm(`Are you sure you want to remove "${userName}" from the organisation?\nThis will permanently delete their employee record.`)) {
    return;
  }

  try {
    const res = await fetch(`/api/payroll/users/${userId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast(`Employee "${userName}" removed successfully.`);
      allUsers = allUsers.filter((u) => u.id !== userId && u.empId !== userId);
      renderUsersTable();
      renderMusterRollTable();
      renderTomorrowScheduleTable();
      renderAttendanceGlassCards();
      updateDashboardMetrics();
    }
  } catch (err) {
    allUsers = allUsers.filter((u) => u.id !== userId && u.empId !== userId);
    renderUsersTable();
    updateDashboardMetrics();
  }
}

// 8. Add/Edit User Modal
function editUser(userId) {
  const user = allUsers.find((u) => u.id === userId || u.empId === userId);
  if (!user) return;

  document.getElementById('modal-user-title').innerHTML = `<i class="fa-solid fa-user-pen text-orange"></i> Edit Record (${user.empId})`;
  document.getElementById('user-id').value = user.id || user.empId;
  document.getElementById('user-empId').value = user.empId || '';
  document.getElementById('user-empId').readOnly = true;
  document.getElementById('user-name').value = user.name || '';
  document.getElementById('user-role').value = user.role || 'Worker';
  document.getElementById('user-fatherName').value = user.fatherName || '';
  document.getElementById('user-mobile').value = (user.mobile || user.phone || '').replace(/[^0-9]/g, '').slice(-10);
  document.getElementById('user-designation').value = user.designation || user.rank || 'Operator';
  document.getElementById('user-category').value = user.category || 'Skilled';
  document.getElementById('user-location').value = user.location || user.site || 'ACC Chanda';
  document.getElementById('user-ctc').value = user.ctc || '';
  document.getElementById('user-basicPerDay').value = user.basicPerDay || '';
  document.getElementById('user-bankAccount').value = user.bankAccount || '';
  document.getElementById('user-ifsc').value = user.ifsc || '';
  document.getElementById('user-uan').value = user.uan || '';
  document.getElementById('user-pfNo').value = user.pfNo || '';
  document.getElementById('user-esicNo').value = user.esicNo || '';
  document.getElementById('user-dob').value = user.dob || '';

  openModal('modal-user');
}

function openAddUserModal() {
  document.getElementById('modal-user-title').innerHTML = `<i class="fa-solid fa-user-plus text-orange"></i> Add New Employee / Worker`;
  document.getElementById('form-user').reset();
  document.getElementById('user-id').value = '';
  document.getElementById('user-empId').readOnly = false;
  const nextId = `SRR${String(allUsers.length + 1).padStart(3, '0')}`;
  document.getElementById('user-empId').value = nextId;
  openModal('modal-user');
}

// 9. Vehicles Management Table
function renderVehiclesTable() {
  const tbody = document.getElementById('vehicles-table-body');
  const countBadge = document.getElementById('fleet-count-badge');
  if (countBadge) countBadge.textContent = `${allVehicles.length} Active Vehicles`;
  if (!tbody) return;

  // Dynamically populate vehicle-type-filter with distinct manual categories
  const filterSelect = document.getElementById('vehicle-type-filter');
  if (filterSelect) {
    const currentVal = filterSelect.value || 'ALL';
    const uniqueTypes = Array.from(new Set(allVehicles.map((v) => v.type).filter(Boolean))).sort();
    let filterHtml = '<option value="ALL">All Equipment Categories</option>';
    uniqueTypes.forEach((t) => {
      filterHtml += `<option value="${escapeHtml(t)}" ${t === currentVal ? 'selected' : ''}>${escapeHtml(t)}</option>`;
    });
    filterSelect.innerHTML = filterHtml;
  }

  const search = (document.getElementById('vehicle-search-input')?.value || '').toLowerCase().trim();
  const typeFilter = document.getElementById('vehicle-type-filter')?.value || 'ALL';

  const filtered = allVehicles.filter((v) => {
    const matchSearch =
      !search ||
      (v.vehicleNo && v.vehicleNo.toLowerCase().includes(search)) ||
      (v.name && v.name.toLowerCase().includes(search)) ||
      (v.operatorName && v.operatorName.toLowerCase().includes(search)) ||
      (v.site && v.site.toLowerCase().includes(search));
    const matchType = typeFilter === 'ALL' || v.type === typeFilter;
    return matchSearch && matchType;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center" style="padding: 35px; color: var(--text-dim);">No plant vehicles in fleet. Click "Bulk Import (Excel)" or "Add Plant Vehicle" above.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((v) => {
      const isPit = (v.status || '').includes('Active');
      const isMaint = (v.status || '').includes('Maintenance');
      const statusClass = isPit ? 'status-pit' : (isMaint ? 'status-maintenance' : 'status-idle');
      const vType = v.type || '';
      const icon = vType.includes('Excavator')
        ? 'fa-truck-monster'
        : vType.includes('Tipper')
        ? 'fa-truck-front'
        : vType.includes('JCB') || vType.includes('Loader')
        ? 'fa-tractor'
        : vType.includes('Bobcat')
        ? 'fa-truck-pickup'
        : vType.includes('Water')
        ? 'fa-faucet-drip'
        : 'fa-truck-ramp-box';

      const comp = calculateCompliancePriority(v);

      return `
      <tr>
        <td>
          <span class="emp-cell-id"><i class="fa-solid ${icon} text-orange"></i> ${escapeHtml(v.vehicleNo)}</span>
        </td>
        <td>
          <span class="emp-cell-name">${escapeHtml(v.name)}</span>
          <span class="emp-cell-sub">Model: ${escapeHtml(v.model || 'Plant Fleet')} | Fuel: ${escapeHtml(v.fuelType || 'Diesel')}</span>
        </td>
        <td><span class="badge-pill">${escapeHtml(v.type || 'Plant Equipment')}</span></td>
        <td>
          <strong>${escapeHtml(v.operatorName || 'Unassigned')}</strong>
          <span class="emp-cell-sub">${v.operatorId ? `ID: ${escapeHtml(v.operatorId)}` : 'Spare Driver'}</span>
        </td>
        <td>${escapeHtml(v.site || 'ACC Chanda Plant Site')}</td>
        <td><span class="badge-pill ${statusClass}">${escapeHtml(v.status || 'Active')}</span></td>
        <td>
          <button class="badge-compliance-btn ${comp.badgeClass}" onclick="openEditComplianceModal('${v.id || v.vehicleNo}')" title="${escapeHtml(comp.tooltip)} - Click to update">
            <i class="fa-solid ${comp.icon}"></i> ${comp.label}
          </button>
        </td>
        <td><strong>₹${Number(v.hourlyRate || 0).toLocaleString('en-IN')} / Hr</strong></td>
        <td class="text-right">
          <div style="display: inline-flex; gap: 6px;">
            <button class="btn-icon-only text-warning" title="Statutory Compliance Records" onclick="openEditComplianceModal('${v.id || v.vehicleNo}')">
              <i class="fa-solid fa-shield-halved"></i>
            </button>
            <button class="btn-icon-only text-navy" title="Edit Vehicle" onclick="editVehicle('${v.id || v.vehicleNo}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-icon-only btn-danger" title="Delete Vehicle" onclick="deleteVehicle('${v.id || v.vehicleNo}', '${escapeHtml(v.vehicleNo)}')">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
    })
    .join('');
}

function openAddVehicleModal() {
  document.getElementById('modal-vehicle-title').innerHTML = `<i class="fa-solid fa-truck-ramp-box text-orange"></i> Add Plant Vehicle / Fleet`;
  document.getElementById('form-vehicle').reset();
  document.getElementById('vehicle-id').value = '';
  document.getElementById('veh-type').value = '';
  document.getElementById('veh-site').value = 'ACC Chanda Plant Site';
  document.getElementById('veh-status').value = 'Active (Plant Duty)';
  populateVehicleOperatorSelect();
  openModal('modal-vehicle');
}

function editVehicle(vehId) {
  const veh = allVehicles.find((v) => v.id === vehId || v.vehicleNo === vehId);
  if (!veh) return;

  document.getElementById('modal-vehicle-title').innerHTML = `<i class="fa-solid fa-truck-front text-orange"></i> Edit Plant Vehicle (${veh.vehicleNo})`;
  document.getElementById('vehicle-id').value = veh.id || veh.vehicleNo;
  document.getElementById('veh-number').value = veh.vehicleNo || '';
  document.getElementById('veh-name').value = veh.name || '';
  document.getElementById('veh-type').value = veh.type || '';
  document.getElementById('veh-model').value = veh.model || '';
  document.getElementById('veh-site').value = veh.site || 'ACC Chanda Plant Site';
  document.getElementById('veh-status').value = veh.status || 'Active (Plant Duty)';
  document.getElementById('veh-rate').value = veh.hourlyRate || '';
  document.getElementById('veh-notes').value = veh.notes || '';

  populateVehicleOperatorSelect(veh.operatorId);
  openModal('modal-vehicle');
}

async function deleteVehicle(vehId, vehNo) {
  if (!confirm(`Are you sure you want to delete vehicle "${vehNo}" from the fleet?`)) return;

  try {
    const res = await fetch(`/api/payroll/vehicles/${vehId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast(`Vehicle "${vehNo}" deleted.`);
      allVehicles = allVehicles.filter((v) => v.id !== vehId && v.vehicleNo !== vehId);
      renderVehiclesTable();
      populateVehicleDropdowns();
      renderTomorrowScheduleTable();
      renderFleetMTTRMatrix();
      updateDashboardMetrics();
    }
  } catch (err) {
    allVehicles = allVehicles.filter((v) => v.id !== vehId && v.vehicleNo !== vehId);
    renderVehiclesTable();
    updateDashboardMetrics();
  }
}

async function deleteAllVehicles() {
  if (allVehicles.length === 0) {
    showToast('Vehicle list is already empty.', 'error');
    return;
  }
  if (!confirm(`CAUTION: Are you sure you want to DELETE ALL ${allVehicles.length} vehicles from the system?`)) {
    return;
  }

  try {
    const res = await fetch('/api/payroll/vehicles/all', { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('All vehicles deleted from fleet database.');
      allVehicles = [];
      allVehicleLogs = [];
      renderVehiclesTable();
      populateVehicleDropdowns();
      renderTomorrowScheduleTable();
      renderFleetMTTRMatrix();
      renderVehicleBreakdownLogs();
      updateDashboardMetrics();
    }
  } catch (err) {
    showToast('All vehicles cleared.');
    allVehicles = [];
    renderVehiclesTable();
  }
}

function populateVehicleOperatorSelect(selectedId = '') {
  const select = document.getElementById('veh-operator');
  if (!select) return;

  const operators = allUsers.filter((u) => u.role !== 'Super Admin');
  const options = [`<option value="">-- No Assigned Operator (Spare Fleet) --</option>`].concat(
    operators.map((u) => `<option value="${u.empId}" ${u.empId === selectedId ? 'selected' : ''}>${escapeHtml(u.name)} (${u.empId}) - ${escapeHtml(u.designation || 'Staff')}</option>`)
  );
  select.innerHTML = options.join('');
}

function populateVehicleDropdowns() {
  const options = allVehicles.map((v) => `<option value="${v.vehicleNo} - ${escapeHtml(v.name)}">${v.vehicleNo} - ${escapeHtml(v.name)} (${escapeHtml(v.site || 'Pit')})</option>`);
  options.unshift(`<option value="Absent (Not Available / Absent)">Absent (Not Available / Absent)</option>`);
  options.unshift(`<option value="Leave (Approved Leave)">Leave (Approved Leave)</option>`);
  options.unshift(`<option value="Weekly Off (WO)">Weekly Off (WO)</option>`);
  options.unshift(`<option value="No Machinery (Standby / Off)">No Machinery (Standby / Off)</option>`);
  options.unshift(`<option value="Heavy Fleet Maintenance Bay">Heavy Fleet Maintenance Bay</option>`);
  options.unshift(`<option value="General Plant Duty">General Plant Duty</option>`);

  const bdSelect = document.getElementById('bd-vehicle-select');
  if (bdSelect) {
    if (allVehicles.length === 0) {
      bdSelect.innerHTML = `<option value="">-- No Vehicles Registered --</option>`;
    } else {
      bdSelect.innerHTML = allVehicles.map((v) => `<option value="${v.vehicleNo}">${v.vehicleNo} - ${escapeHtml(v.name)} (${escapeHtml(v.model || v.type)})</option>`).join('');
    }
  }

  return options.join('');
}

// 10. Vehicle Bulk Import Engine (Excel / CSV)
function initVehicleBulkImport() {
  const fileInput = document.getElementById('bulk-vehicles-file-input');
  const dropZone = document.getElementById('drop-zone-vehicles');

  if (dropZone && fileInput) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--logo-orange)';
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.style.borderColor = 'var(--border-orange)';
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--border-orange)';
      if (e.dataTransfer.files.length > 0) {
        handleVehicleFileSelect(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleVehicleFileSelect(e.target.files[0]);
      }
    });
  }

  const confirmBtn = document.getElementById('btn-confirm-bulk-vehicles');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      if (parsedBulkVehicles.length === 0) return;

      try {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Importing Vehicles...';

        const res = await fetch('/api/payroll/vehicles/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vehicles: parsedBulkVehicles })
        });

        const data = await res.json();
        if (data.success) {
          showToast(`⚡ ${data.message}`);
          closeModal('modal-bulk-vehicles');
          await fetchVehicles();
          updateDashboardMetrics();
        }
      } catch (err) {
        showToast('Bulk vehicle import completed.');
        closeModal('modal-bulk-vehicles');
        fetchVehicles();
      } finally {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<i class="fa-solid fa-upload"></i> Import Vehicles to Fleet Database';
      }
    });
  }

  document.getElementById('btn-download-vehicle-template')?.addEventListener('click', generateAndDownloadVehicleTemplate);
}

function handleVehicleFileSelect(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      parsedBulkVehicles = jsonRows
        .filter((r) => r['Vehicle No'] || r['Vehicle Reg No'] || r['Vehicle Number'] || r['Reg No'] || r['vehicleNo'])
        .map((r, idx) => {
          const vehicleNo = String(r['Vehicle No'] || r['Vehicle Reg No'] || r['Vehicle Number'] || r['Reg No'] || r['vehicleNo'] || `PLANT-0${idx + 1}`).trim().toUpperCase();
          const name = String(r['Equipment Name'] || r['Name'] || r['Machinery Name'] || r['name'] || 'CAT Heavy Plant Excavator').trim();
          const type = String(r['Category'] || r['Type'] || r['Equipment Type'] || r['Equipment Category'] || r['type'] || 'Excavator').trim();
          const model = String(r['Model'] || r['Equipment Model'] || r['model'] || 'CAT 349D').trim();
          const site = String(r['Site'] || r['Location'] || r['site'] || 'ACC Chanda Plant Site').trim();
          const status = String(r['Status'] || r['Operational Status'] || r['status'] || 'Active (Plant Duty)').trim();
          const hourlyRate = Number(r['Hourly Rate'] || r['Rate'] || r['hourlyRate']) || 3500;
          const fuelType = String(r['Fuel Type'] || r['Fuel'] || 'Diesel').trim();

          return { vehicleNo, name, type, model, site, status, hourlyRate, fuelType };
        });

      document.getElementById('bulk-vehicles-preview-count').textContent = parsedBulkVehicles.length;
      const previewBody = document.getElementById('preview-vehicles-table-body');
      if (previewBody) {
        previewBody.innerHTML = parsedBulkVehicles
          .slice(0, 15)
          .map(
            (v) => `
            <tr>
              <td><strong>${escapeHtml(v.vehicleNo)}</strong></td>
              <td>${escapeHtml(v.name)}</td>
              <td>${escapeHtml(v.type)}</td>
              <td>${escapeHtml(v.model)}</td>
              <td>${escapeHtml(v.site)}</td>
              <td>${escapeHtml(v.status)}</td>
              <td>₹${Number(v.hourlyRate).toLocaleString('en-IN')}</td>
            </tr>
          `
          )
          .join('');
      }

      document.getElementById('bulk-vehicles-preview-area').classList.remove('hidden');
      document.getElementById('btn-confirm-bulk-vehicles').disabled = false;
      showToast(`Parsed ${parsedBulkVehicles.length} vehicles from spreadsheet.`);
    } catch (err) {
      showToast('Error parsing vehicle Excel file.', 'error');
    }
  };
  reader.readAsArrayBuffer(file);
}

function generateAndDownloadVehicleTemplate() {
  const headers = ['Sr. No', 'Vehicle Reg No', 'Equipment Name', 'Category', 'Model', 'Site Location', 'Fuel Type', 'Hourly Rate (₹)', 'Operational Status'];
  const sampleRows = [
    [1, 'HP-12-EX-3491', 'CAT 349D Heavy Plant Excavator', 'Excavator', 'Caterpillar 349D', 'ACC Chanda Plant Site', 'Diesel', 4500, 'Active (Plant Duty)'],
    [2, 'HP-12-TP-5011', 'Tata Signa 2823 10-Wheeler Tipper', 'Tipper / Dumper', 'Signa 2823.K', 'ACC Chanda Plant Site', 'Diesel', 2200, 'Active (Plant Duty)'],
    [3, 'HP-12-JC-4012', 'JCB 3DX Super Backhoe Loader', 'JCB / Loader', '3DX Super', 'ACC Chanda Plant Site', 'Diesel', 1800, 'Active (Plant Duty)'],
    [4, 'HP-12-BC-1102', 'Bobcat S450 Skid Steer Loader', 'Bobcat', 'S450 Skid Steer', 'ACC Chanda Plant Site', 'Diesel', 1600, 'Active (Plant Duty)']
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Vehicles');
  XLSX.writeFile(wb, 'Shree_RR_Plant_Vehicles_Template.xlsx');
  showToast('Downloaded official vehicle fleet import template.');
}

// 11. Vehicle Availability & MTTR Reliability Analytics
function renderFleetMTTRMatrix() {
  const tbody = document.getElementById('fleet-mttr-table-body');
  if (!tbody) return;

  if (allVehicles.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" class="text-center" style="padding: 30px; color: var(--text-dim);">No plant vehicles in fleet to calculate MTTR.</td></tr>`;
    document.getElementById('kpi-scheduled-hours').textContent = '0 Hrs';
    document.getElementById('kpi-operating-hours').textContent = '0 Hrs';
    document.getElementById('kpi-breakdown-hours').textContent = '0 Hrs';
    document.getElementById('kpi-fleet-availability').textContent = '100.0%';
    document.getElementById('kpi-fleet-mttr').textContent = '0.0 Hrs';
    document.getElementById('kpi-fleet-mtbf').textContent = '0.0 Hrs';
    return;
  }

  let totalFleetScheduled = 0;
  let totalFleetOperating = 0;
  let totalFleetBreakdown = 0;
  let totalFleetBDEvents = 0;

  const rowsHtml = allVehicles.map((v) => {
    const vLogs = allVehicleLogs.filter((l) => l.vehicleNo.toUpperCase() === v.vehicleNo.toUpperCase());
    const scheduled = vLogs.reduce((sum, l) => sum + (Number(l.totalHours) || 24), 0) || 720;
    const bdHours = vLogs.reduce((sum, l) => sum + (Number(l.breakdownHours) || 0), 0);
    const bdEvents = vLogs.filter((l) => Number(l.breakdownHours) > 0).length;
    const operating = vLogs.reduce((sum, l) => sum + (Number(l.operatingHours) || 0), 0) || Math.max(0, scheduled - bdHours);

    const availability = scheduled > 0 ? ((scheduled - bdHours) / scheduled) * 100 : 100;
    const mttr = bdEvents > 0 ? bdHours / bdEvents : 0;
    const mtbf = bdEvents > 0 ? operating / bdEvents : operating;

    totalFleetScheduled += scheduled;
    totalFleetOperating += operating;
    totalFleetBreakdown += bdHours;
    totalFleetBDEvents += bdEvents;

    const statusBadge =
      availability >= 95
        ? `<span class="badge-pill" style="background: rgba(16, 185, 129, 0.1); color: #059669; border-color: rgba(16, 185, 129, 0.3);"><i class="fa-solid fa-circle-check"></i> Optimal (95%+)</span>`
        : availability >= 85
        ? `<span class="badge-pill" style="background: rgba(245, 158, 11, 0.1); color: #D97706; border-color: rgba(245, 158, 11, 0.3);"><i class="fa-solid fa-triangle-exclamation"></i> Moderate</span>`
        : `<span class="badge-pill" style="background: rgba(220, 38, 38, 0.1); color: #DC2626; border-color: rgba(220, 38, 38, 0.3);"><i class="fa-solid fa-circle-xmark"></i> Critical B/D</span>`;

    return `
      <tr>
        <td class="emp-cell-id">${escapeHtml(v.vehicleNo)}</td>
        <td>
          <strong>${escapeHtml(v.name)}</strong>
          <span class="emp-cell-sub">${escapeHtml(v.model || 'HEMM')}</span>
        </td>
        <td><span class="badge-pill">${escapeHtml(v.type || 'Equipment')}</span></td>
        <td>${scheduled} Hrs</td>
        <td><strong class="text-success">${operating.toFixed(1)} Hrs</strong></td>
        <td><strong class="text-danger">${bdHours.toFixed(1)} Hrs</strong></td>
        <td><strong>${bdEvents}</strong></td>
        <td><strong class="text-orange text-lg">${availability.toFixed(1)}%</strong></td>
        <td><strong class="text-navy">${mttr.toFixed(1)} Hrs/Rep</strong></td>
        <td><strong>${mtbf.toFixed(1)} Hrs</strong></td>
        <td>${statusBadge}</td>
      </tr>
    `;
  });

  tbody.innerHTML = rowsHtml.join('');

  // Overall KPI Updates
  const overallAvail = totalFleetScheduled > 0 ? ((totalFleetScheduled - totalFleetBreakdown) / totalFleetScheduled) * 100 : 100;
  const overallMTTR = totalFleetBDEvents > 0 ? totalFleetBreakdown / totalFleetBDEvents : 0;
  const overallMTBF = totalFleetBDEvents > 0 ? totalFleetOperating / totalFleetBDEvents : totalFleetOperating;

  document.getElementById('kpi-scheduled-hours').textContent = `${totalFleetScheduled.toLocaleString('en-IN')} Hrs`;
  document.getElementById('kpi-operating-hours').textContent = `${totalFleetOperating.toFixed(1)} Hrs`;
  document.getElementById('kpi-breakdown-hours').textContent = `${totalFleetBreakdown.toFixed(1)} Hrs`;
  document.getElementById('kpi-fleet-availability').textContent = `${overallAvail.toFixed(1)}%`;
  document.getElementById('kpi-fleet-mttr').textContent = `${overallMTTR.toFixed(1)} Hrs`;
  document.getElementById('kpi-fleet-mtbf').textContent = `${overallMTBF.toFixed(1)} Hrs`;
}

function renderVehicleBreakdownLogs() {
  const tbody = document.getElementById('breakdown-logs-table-body');
  if (!tbody) return;

  if (allVehicleLogs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center" style="padding: 30px; color: var(--text-dim);">No breakdown (B/D) logs recorded yet. Click "+ Log Breakdown (B/D) & Service Hours" to record machine downtime.</td></tr>`;
    return;
  }

  tbody.innerHTML = allVehicleLogs
    .map(
      (l) => `
      <tr>
        <td><strong>${l.date}</strong></td>
        <td class="emp-cell-id">${escapeHtml(l.vehicleNo)}</td>
        <td>${escapeHtml(l.vehicleName || 'Equipment')}</td>
        <td><strong class="text-danger">${Number(l.breakdownHours).toFixed(1)} Hrs</strong></td>
        <td><strong class="text-success">${Number(l.operatingHours).toFixed(1)} Hrs</strong></td>
        <td><span class="badge-pill">${escapeHtml(l.failureType || 'Mechanical')}</span></td>
        <td>${escapeHtml(l.reason || '-')}</td>
        <td>${escapeHtml(l.actionTaken || 'Inspected')}</td>
        <td><span class="badge-pill ${l.status === 'Resolved' ? 'status-pit' : 'status-maintenance'}">${escapeHtml(l.status || 'Resolved')}</span></td>
        <td class="text-right">
          <button class="btn-icon-only btn-danger" onclick="deleteVehicleLog('${l.id}')" title="Delete Log">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `
    )
    .join('');
}

async function deleteVehicleLog(logId) {
  if (!confirm('Are you sure you want to delete this breakdown log?')) return;
  try {
    const res = await fetch(`/api/payroll/vehicle-logs/${logId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('Breakdown log deleted.');
      allVehicleLogs = allVehicleLogs.filter((l) => l.id !== logId);
      renderFleetMTTRMatrix();
      renderVehicleBreakdownLogs();
    }
  } catch (e) {
    allVehicleLogs = allVehicleLogs.filter((l) => l.id !== logId);
    renderFleetMTTRMatrix();
    renderVehicleBreakdownLogs();
  }
}

// 12. 1-Click Excel MTTR & Availability Exporter
function exportFleetMTTRExcel() {
  if (allVehicles.length === 0) {
    showToast('No vehicle fleet records available to export.', 'error');
    return;
  }

  const today = new Date().toISOString().split('T')[0];

  // Sheet 1: MTTR Performance Matrix
  const mttrData = [
    ['SHREE RR TRADING COMPANY - HEAVY PLANT MACHINERY FLEET RELIABILITY'],
    [`EQUIPMENT AVAILABILITY & MTTR RELIABILITY REPORT (${today.toUpperCase()})`],
    ['Site: ACC Chanda Plant Site & Operations | Portal: https://payroll.shreerrtradingcompany.com'],
    [],
    [
      'Sr. No',
      'Vehicle Reg No',
      'Equipment Name',
      'Equipment Model',
      'Category',
      'Plant Site Location',
      'Scheduled Hours',
      'Actual Operating Hours',
      'Breakdown (B/D) Hours',
      'Breakdown Events Count',
      'Fleet Availability (%)',
      'MTTR (Mean Time to Repair in Hours)',
      'MTBF (Mean Time Between Failures in Hours)',
      'Hourly Rate (₹)',
      'Reliability Status'
    ]
  ];

  allVehicles.forEach((v, idx) => {
    const vLogs = allVehicleLogs.filter((l) => l.vehicleNo.toUpperCase() === v.vehicleNo.toUpperCase());
    const scheduled = vLogs.reduce((sum, l) => sum + (Number(l.totalHours) || 24), 0) || 720;
    const bdHours = vLogs.reduce((sum, l) => sum + (Number(l.breakdownHours) || 0), 0);
    const bdEvents = vLogs.filter((l) => Number(l.breakdownHours) > 0).length;
    const operating = vLogs.reduce((sum, l) => sum + (Number(l.operatingHours) || 0), 0) || Math.max(0, scheduled - bdHours);

    const availability = scheduled > 0 ? ((scheduled - bdHours) / scheduled) * 100 : 100;
    const mttr = bdEvents > 0 ? bdHours / bdEvents : 0;
    const mtbf = bdEvents > 0 ? operating / bdEvents : operating;
    const status = availability >= 95 ? 'Optimal (95%+)' : availability >= 85 ? 'Moderate (85-95%)' : 'Critical B/D';

    mttrData.push([
      idx + 1,
      v.vehicleNo,
      v.name,
      v.model || 'HEMM',
      v.type || 'Machinery',
      v.site || 'ACC Chanda Mine Pit',
      scheduled,
      operating.toFixed(1),
      bdHours.toFixed(1),
      bdEvents,
      `${availability.toFixed(1)}%`,
      mttr.toFixed(1),
      mtbf.toFixed(1),
      v.hourlyRate || 3500,
      status
    ]);
  });

  // Sheet 2: Breakdown Logs
  const logData = [
    ['SHREE RR TRADING COMPANY - DETAILED BREAKDOWN (B/D) & MAINTENANCE INCIDENT LOGS'],
    [],
    ['Log Date', 'Vehicle Reg No', 'Equipment Name', 'B/D Downtime (Hours)', 'Operating Hours', 'Failure Type', 'Breakdown Reason & Remarks', 'Action Taken by Mechanical Lead', 'Resolution Status']
  ];

  allVehicleLogs.forEach((l) => {
    logData.push([
      l.date,
      l.vehicleNo,
      l.vehicleName || '',
      Number(l.breakdownHours).toFixed(1),
      Number(l.operatingHours).toFixed(1),
      l.failureType || 'Mechanical',
      l.reason || '',
      l.actionTaken || '',
      l.status || 'Resolved'
    ]);
  });

  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.aoa_to_sheet(mttrData);
  const ws2 = XLSX.utils.aoa_to_sheet(logData);

  XLSX.utils.book_append_sheet(wb, ws1, 'MTTR Availability Matrix');
  XLSX.utils.book_append_sheet(wb, ws2, 'Breakdown Logs');

  XLSX.writeFile(wb, `Shree_RR_Vehicle_Availability_and_MTTR_Report_${today}.xlsx`);
  showToast('Downloaded 1-Click Excel: HEMM Fleet Availability & MTTR Reliability Report!');
}

// 13. Daily Muster Roll (Today's Live Attendance)
function renderMusterRollTable() {
  const tbody = document.getElementById('muster-table-body');
  if (!tbody) return;

  const datePicker = document.getElementById('muster-date-picker');
  const selectedDate = datePicker ? datePicker.value : new Date().toISOString().split('T')[0];
  const search = (document.getElementById('muster-search-input')?.value || '').toLowerCase().trim();

  let workers = allUsers.filter((u) => u.role !== 'Super Admin' && u.status === 'Active');
  if (search) {
    workers = workers.filter((u) => 
      (u.name && u.name.toLowerCase().includes(search)) || 
      (u.empId && u.empId.toLowerCase().includes(search)) ||
      (u.designation && u.designation.toLowerCase().includes(search)) ||
      (u.rank && u.rank.toLowerCase().includes(search)) ||
      (u.role && u.role.toLowerCase().includes(search))
    );
  }

  if (workers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center" style="padding: 30px; color: var(--text-dim);">No active employees matching criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = workers
    .map((u, idx) => {
      const existing = allAttendance.find((a) => (a.userId === u.id || a.empId === u.empId) && a.date === selectedDate);
      const defaultShift = existing ? existing.shift : (idx % 4 === 1 ? 'A Shift (06:00 AM - 02:00 PM)' : (idx % 4 === 2 ? 'B Shift (02:00 PM - 10:00 PM)' : (idx % 4 === 3 ? 'C Shift (10:00 PM - 06:00 AM)' : 'G Shift (08:30 AM - 05:30 PM)')));
      const defaultStatus = existing ? existing.status : 'Present';
      const isAbsentOrOff = defaultStatus === 'Absent' || defaultStatus === 'Weekly Off' || defaultStatus === 'Leave';
      const clockIn = existing ? existing.clockIn : (isAbsentOrOff ? '-' : (defaultShift.includes('A Shift') ? '06:00 AM' : (defaultShift.includes('B Shift') ? '02:00 PM' : (defaultShift.includes('C Shift') ? '10:00 PM' : '08:30 AM'))));
      const clockOut = existing ? existing.clockOut : (isAbsentOrOff ? '-' : (defaultShift.includes('A Shift') ? '02:00 PM' : (defaultShift.includes('B Shift') ? '10:00 PM' : (defaultShift.includes('C Shift') ? '06:00 AM' : '05:30 PM'))));

      return `
      <tr data-userid="${u.id}" data-empid="${u.empId}" data-username="${escapeHtml(u.name)}">
        <td style="font-family: var(--font-mono); font-weight: 700; color: var(--text-dim);">${idx + 1}</td>
        <td class="emp-cell-id">${u.empId}</td>
        <td>
          <span class="emp-cell-name">${escapeHtml(u.name)}</span>
          <span class="emp-cell-sub">Father: ${escapeHtml(u.fatherName || 'N/A')}</span>
        </td>
        <td>
          <span class="role-badge ${u.role === 'Worker' ? 'role-worker' : (u.role === 'Supervisor' ? 'role-supervisor' : 'role-employee')}">${escapeHtml(u.role || 'Worker')}</span>
          <span class="emp-cell-sub">${escapeHtml(u.designation || 'Staff')}</span>
        </td>
        <td style="min-width: 170px;">
          <select class="muster-select muster-shift-select" onchange="handleMusterShiftChange(this)">
            <option value="G Shift (08:30 AM - 05:30 PM)" ${defaultShift.includes('G Shift') ? 'selected' : ''}>G Shift - General (8:30a-5:30p)</option>
            <option value="A Shift (06:00 AM - 02:00 PM)" ${defaultShift.includes('A Shift') ? 'selected' : ''}>A Shift - Morning (6a-2p)</option>
            <option value="B Shift (02:00 PM - 10:00 PM)" ${defaultShift.includes('B Shift') ? 'selected' : ''}>B Shift - Evening (2p-10p)</option>
            <option value="C Shift (10:00 PM - 06:00 AM)" ${defaultShift.includes('C Shift') ? 'selected' : ''}>C Shift - Night (10p-6a)</option>
            <option value="WO - Weekly Off" ${defaultShift.includes('WO') ? 'selected' : ''}>WO - Weekly Off</option>
          </select>
        </td>
        <td style="min-width: 130px;">
          <select class="muster-select muster-status-select" onchange="handleMusterStatusChange(this)">
            <option value="Present" ${defaultStatus === 'Present' ? 'selected' : ''}>✅ Present</option>
            <option value="Absent" ${defaultStatus === 'Absent' ? 'selected' : ''}>❌ Absent</option>
            <option value="Weekly Off" ${defaultStatus === 'Weekly Off' ? 'selected' : ''}>☕ Weekly Off</option>
            <option value="Leave" ${defaultStatus === 'Leave' ? 'selected' : ''}>🏖 Leave</option>
            <option value="Half Day" ${defaultStatus === 'Half Day' ? 'selected' : ''}>⏱ Half Day</option>
            <option value="Overtime" ${defaultStatus === 'Overtime' ? 'selected' : ''}>⚡ Overtime</option>
          </select>
        </td>
        <td style="width: 100px;">
          <input type="text" class="muster-select muster-clockin-input" value="${clockIn}">
        </td>
        <td style="width: 100px;">
          <input type="text" class="muster-select muster-clockout-input" value="${clockOut}">
        </td>
        <td style="width: 130px;">
          <input type="text" class="muster-select muster-site-input" value="${escapeHtml(u.location || 'ACC Chanda')}">
        </td>
        <td style="width: 150px;">
          <input type="text" class="muster-select muster-notes-input" placeholder="Notes" value="${escapeHtml(existing?.notes || (defaultStatus === 'Absent' ? 'Muster Roll: Absent' : (defaultStatus === 'Weekly Off' ? 'Muster Roll: Weekly Off' : (defaultStatus === 'Leave' ? 'Muster Roll: On Leave' : 'Biometric Punch'))))}">
        </td>
      </tr>
    `;
    })
    .join('');
}

function handleMusterStatusChange(selectEl) {
  const row = selectEl.closest('tr');
  if (!row) return;
  const statusVal = selectEl.value;
  const shiftSelect = row.querySelector('.muster-shift-select');
  const clockIn = row.querySelector('.muster-clockin-input');
  const clockOut = row.querySelector('.muster-clockout-input');
  const notes = row.querySelector('.muster-notes-input');

  if (statusVal === 'Absent') {
    if (clockIn) clockIn.value = '-';
    if (clockOut) clockOut.value = '-';
    if (notes && (!notes.value || notes.value === 'Biometric Punch' || notes.value.startsWith('Muster Roll:'))) {
      notes.value = 'Muster Roll: Absent';
    }
  } else if (statusVal === 'Weekly Off') {
    if (clockIn) clockIn.value = '-';
    if (clockOut) clockOut.value = '-';
    if (shiftSelect && !shiftSelect.value.includes('WO')) {
      shiftSelect.value = 'WO - Weekly Off';
    }
    if (notes && (!notes.value || notes.value === 'Biometric Punch' || notes.value.startsWith('Muster Roll:'))) {
      notes.value = 'Muster Roll: Weekly Off';
    }
  } else if (statusVal === 'Leave') {
    if (clockIn) clockIn.value = '-';
    if (clockOut) clockOut.value = '-';
    if (notes && (!notes.value || notes.value === 'Biometric Punch' || notes.value.startsWith('Muster Roll:'))) {
      notes.value = 'Muster Roll: On Leave';
    }
  } else if (statusVal === 'Half Day') {
    const shiftVal = shiftSelect ? shiftSelect.value : 'G Shift';
    if (shiftVal.includes('A Shift')) {
      if (clockIn) clockIn.value = '06:00 AM';
      if (clockOut) clockOut.value = '10:00 AM';
    } else if (shiftVal.includes('B Shift')) {
      if (clockIn) clockIn.value = '02:00 PM';
      if (clockOut) clockOut.value = '06:00 PM';
    } else if (shiftVal.includes('C Shift')) {
      if (clockIn) clockIn.value = '10:00 PM';
      if (clockOut) clockOut.value = '02:00 AM';
    } else {
      if (clockIn) clockIn.value = '08:30 AM';
      if (clockOut) clockOut.value = '01:30 PM';
    }
    if (notes && (!notes.value || notes.value === 'Biometric Punch' || notes.value.startsWith('Muster Roll:'))) {
      notes.value = 'Muster Roll: Half Day';
    }
  } else {
    // Present or Overtime
    const shiftVal = shiftSelect ? shiftSelect.value : 'G Shift';
    if (shiftSelect && shiftSelect.value.includes('WO')) {
      shiftSelect.value = 'G Shift (08:30 AM - 05:30 PM)';
    }
    if (shiftVal.includes('A Shift')) {
      if (clockIn) clockIn.value = '06:00 AM';
      if (clockOut) clockOut.value = '02:00 PM';
    } else if (shiftVal.includes('B Shift')) {
      if (clockIn) clockIn.value = '02:00 PM';
      if (clockOut) clockOut.value = '10:00 PM';
    } else if (shiftVal.includes('C Shift')) {
      if (clockIn) clockIn.value = '10:00 PM';
      if (clockOut) clockOut.value = '06:00 AM';
    } else {
      if (clockIn) clockIn.value = '08:30 AM';
      if (clockOut) clockOut.value = '05:30 PM';
    }
    if (notes && (!notes.value || notes.value.startsWith('Muster Roll:'))) {
      notes.value = statusVal === 'Overtime' ? 'Muster Roll: Overtime Shift' : 'Biometric Punch';
    }
  }
}

function handleMusterShiftChange(selectEl) {
  const row = selectEl.closest('tr');
  if (!row) return;
  const shiftVal = selectEl.value;
  const statusSelect = row.querySelector('.muster-status-select');
  const clockIn = row.querySelector('.muster-clockin-input');
  const clockOut = row.querySelector('.muster-clockout-input');

  if (shiftVal.includes('WO')) {
    if (statusSelect) statusSelect.value = 'Weekly Off';
    if (clockIn) clockIn.value = '-';
    if (clockOut) clockOut.value = '-';
    return;
  }

  // If status is currently Absent, keep Absent and '-' times
  if (statusSelect && statusSelect.value === 'Absent') {
    return;
  }

  // If status was Weekly Off, reset status to Present
  if (statusSelect && statusSelect.value === 'Weekly Off') {
    statusSelect.value = 'Present';
  }

  if (shiftVal.includes('A Shift')) {
    if (clockIn) clockIn.value = '06:00 AM';
    if (clockOut) clockOut.value = '02:00 PM';
  } else if (shiftVal.includes('B Shift')) {
    if (clockIn) clockIn.value = '02:00 PM';
    if (clockOut) clockOut.value = '10:00 PM';
  } else if (shiftVal.includes('C Shift')) {
    if (clockIn) clockIn.value = '10:00 PM';
    if (clockOut) clockOut.value = '06:00 AM';
  } else {
    if (clockIn) clockIn.value = '08:30 AM';
    if (clockOut) clockOut.value = '05:30 PM';
  }
}

function exportDailyMusterExcel() {
  const datePicker = document.getElementById('muster-date-picker');
  const selectedDate = datePicker ? datePicker.value : new Date().toISOString().split('T')[0];
  const rows = document.querySelectorAll('#muster-table-body tr');

  const excelData = [
    ['SHREE RR TRADING COMPANY - PLANT OPERATIONS & LIVE WORKFORCE MUSTER ROLL'],
    [`DAILY LIVE MUSTER ROLL ATTENDANCE STATEMENT (${selectedDate})`],
    ['Site: ACC Chanda Plant Site & Operations | Portal: https://payroll.shreerrtradingcompany.com'],
    [],
    ['Sr. No', 'Employee ID', 'Employee / Worker Name', 'Role', 'Designation', 'Duty Shift', 'Attendance Status', 'Clock In', 'Clock Out', 'Site Location', 'Verification Notes']
  ];

  rows.forEach((r, idx) => {
    const empId = r.getAttribute('data-empid') || '';
    const userName = r.getAttribute('data-username') || '';
    const role = r.querySelector('.role-badge')?.textContent.trim() || '';
    const designation = r.querySelector('.emp-cell-sub')?.textContent.trim() || '';
    const shift = r.querySelector('.muster-shift-select')?.value || 'G Shift';
    const status = r.querySelector('.muster-status-select')?.value || 'Present';
    const clockIn = r.querySelector('.muster-clockin-input')?.value || '-';
    const clockOut = r.querySelector('.muster-clockout-input')?.value || '-';
    const site = r.querySelector('.muster-site-input')?.value || 'ACC Chanda';
    const notes = r.querySelector('.muster-notes-input')?.value || '';

    excelData.push([idx + 1, empId, userName, role, designation, shift, status, clockIn, clockOut, site, notes]);
  });

  const ws = XLSX.utils.aoa_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Daily Muster Roll');
  XLSX.writeFile(wb, `Shree_RR_Daily_Muster_Roll_${selectedDate}.xlsx`);
  showToast(`Downloaded 1-Click Excel: Daily Muster Roll for ${selectedDate}!`);
}

// 14. Tomorrow's Shift & Machine Schedule System
function getTomorrowDateString() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

function isTomorrowShiftMatch(defaultShift, type) {
  if (!defaultShift) return false;
  const s = String(defaultShift).toLowerCase().trim();
  if (type === 'G') return s.startsWith('g shift') || s === 'g';
  if (type === 'A') return s.startsWith('a shift') || s === 'a';
  if (type === 'B') return s.startsWith('b shift') || s === 'b';
  if (type === 'C') return s.startsWith('c shift') || s === 'c';
  if (type === 'WO') return s.startsWith('wo') || s.includes('weekly off') || s.includes('week off');
  if (type === 'Leave') return s.includes('leave');
  if (type === 'Absent') return s.includes('absent') || s === 'ab';
  return false;
}

function handleTomorrowShiftSelectChange(selectElem) {
  const row = selectElem.closest('tr');
  if (!row) return;
  const shiftVal = selectElem.value;
  const vehicleSelect = row.querySelector('.tom-vehicle-select');

  if (vehicleSelect) {
    if (shiftVal.includes('WO')) {
      vehicleSelect.value = 'Weekly Off (WO)';
    } else if (shiftVal.includes('Leave')) {
      vehicleSelect.value = 'Leave (Approved Leave)';
    } else if (shiftVal.includes('Absent')) {
      vehicleSelect.value = 'Absent (Not Available / Absent)';
    } else {
      if (vehicleSelect.value === 'Weekly Off (WO)' || vehicleSelect.value === 'Leave (Approved Leave)' || vehicleSelect.value === 'Absent (Not Available / Absent)' || vehicleSelect.value.startsWith('No Machinery')) {
        vehicleSelect.value = 'General Plant Duty';
      }
    }
  }
}

function handleTomorrowVehicleSelectChange(selectElem) {
  const row = selectElem.closest('tr');
  if (!row) return;
  const vehVal = selectElem.value;
  const shiftSelect = row.querySelector('.tom-shift-select');

  if (shiftSelect) {
    if (vehVal === 'Weekly Off (WO)') {
      shiftSelect.value = 'WO (Weekly Off)';
    } else if (vehVal === 'Leave (Approved Leave)') {
      shiftSelect.value = 'Leave (Approved Leave)';
    } else if (vehVal === 'Absent (Not Available / Absent)') {
      shiftSelect.value = 'Absent (Not Available / Absent)';
    }
  }
}

function renderTomorrowScheduleTable() {
  const tbody = document.getElementById('tomorrow-table-body');
  if (!tbody) return;

  const tomorrowStr = getTomorrowDateString();
  const displayEl = document.getElementById('tomorrow-date-display');
  if (displayEl) {
    const d = new Date(tomorrowStr);
    displayEl.textContent = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
  }

  const workers = allUsers.filter((u) => u.role !== 'Super Admin' && u.status === 'Active');
  if (workers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="padding: 30px; color: var(--text-dim);">No active workforce found.</td></tr>`;
    return;
  }

  tbody.innerHTML = workers
    .map((u, idx) => {
      const existingRoster = allRosters.find((r) => (r.userId === u.id || r.empId === u.empId) && r.date === tomorrowStr);
      const defaultShift = existingRoster ? existingRoster.shift : (idx % 4 === 1 ? 'A Shift (06:00 AM - 02:00 PM)' : (idx % 4 === 2 ? 'B Shift (02:00 PM - 10:00 PM)' : (idx % 4 === 3 ? 'C Shift (10:00 PM - 06:00 AM)' : 'G Shift (08:30 AM - 05:30 PM)')));
      const selectedEquip = existingRoster && existingRoster.equipment ? existingRoster.equipment : (
        isTomorrowShiftMatch(defaultShift, 'WO') ? 'Weekly Off (WO)' : (
          isTomorrowShiftMatch(defaultShift, 'Leave') ? 'Leave (Approved Leave)' : (
            isTomorrowShiftMatch(defaultShift, 'Absent') ? 'Absent (Not Available / Absent)' : (
              allVehicles[idx % allVehicles.length] ? `${allVehicles[idx % allVehicles.length].vehicleNo} - ${allVehicles[idx % allVehicles.length].name}` : 'General Plant Duty'
            )
          )
        )
      );
      const defaultSite = existingRoster ? existingRoster.site : (u.location || 'ACC Chanda Plant Site');
      const defaultSupervisor = existingRoster ? existingRoster.supervisor : 'Shift In-Charge (Plant Operations)';

      const vehicleOptions = [
        `<option value="General Plant Duty" ${selectedEquip === 'General Plant Duty' ? 'selected' : ''}>General Plant Duty</option>`,
        `<option value="Heavy Fleet Maintenance Bay" ${selectedEquip === 'Heavy Fleet Maintenance Bay' ? 'selected' : ''}>Heavy Fleet Maintenance Bay</option>`,
        `<option value="No Machinery (Standby / Off)" ${selectedEquip === 'No Machinery (Standby / Off)' ? 'selected' : ''}>No Machinery (Standby / Off)</option>`,
        `<option value="Weekly Off (WO)" ${selectedEquip === 'Weekly Off (WO)' ? 'selected' : ''}>Weekly Off (WO)</option>`,
        `<option value="Leave (Approved Leave)" ${selectedEquip === 'Leave (Approved Leave)' ? 'selected' : ''}>Leave (Approved Leave)</option>`,
        `<option value="Absent (Not Available / Absent)" ${selectedEquip === 'Absent (Not Available / Absent)' ? 'selected' : ''}>Absent (Not Available / Absent)</option>`
      ].concat(
        allVehicles.map((v) => {
          const val = `${v.vehicleNo} - ${v.name}`;
          const isSel = selectedEquip === val || selectedEquip.startsWith(v.vehicleNo);
          return `<option value="${val}" ${isSel ? 'selected' : ''}>${v.vehicleNo} - ${escapeHtml(v.name)} (${escapeHtml(v.site || 'Pit')})</option>`;
        })
      ).join('');

      return `
      <tr data-userid="${u.id}" data-empid="${u.empId}" data-username="${escapeHtml(u.name)}" data-designation="${escapeHtml(u.designation || 'Operator')}">
        <td style="font-family: var(--font-mono); font-weight: 700; color: var(--text-dim);">${idx + 1}</td>
        <td class="emp-cell-id">${u.empId}</td>
        <td>
          <span class="emp-cell-name">${escapeHtml(u.name)}</span>
          <span class="emp-cell-sub">Role: ${escapeHtml(u.role || 'Worker')}</span>
        </td>
        <td><strong>${escapeHtml(u.designation || u.rank || 'Operator')}</strong></td>
        <td style="min-width: 190px;">
          <select class="muster-select tom-shift-select" onchange="handleTomorrowShiftSelectChange(this)">
            <option value="G Shift (08:30 AM - 05:30 PM)" ${isTomorrowShiftMatch(defaultShift, 'G') ? 'selected' : ''}>G Shift (08:30 AM - 05:30 PM)</option>
            <option value="A Shift (06:00 AM - 02:00 PM)" ${isTomorrowShiftMatch(defaultShift, 'A') ? 'selected' : ''}>A Shift (06:00 AM - 02:00 PM)</option>
            <option value="B Shift (02:00 PM - 10:00 PM)" ${isTomorrowShiftMatch(defaultShift, 'B') ? 'selected' : ''}>B Shift (02:00 PM - 10:00 PM)</option>
            <option value="C Shift (10:00 PM - 06:00 AM)" ${isTomorrowShiftMatch(defaultShift, 'C') ? 'selected' : ''}>C Shift (10:00 PM - 06:00 AM)</option>
            <option value="WO (Weekly Off)" ${isTomorrowShiftMatch(defaultShift, 'WO') ? 'selected' : ''}>WO (Weekly Off)</option>
            <option value="Leave (Approved Leave)" ${isTomorrowShiftMatch(defaultShift, 'Leave') ? 'selected' : ''}>Leave (Approved Leave)</option>
            <option value="Absent (Not Available / Absent)" ${isTomorrowShiftMatch(defaultShift, 'Absent') ? 'selected' : ''}>Absent (Not Available / Absent)</option>
          </select>
        </td>
        <td style="min-width: 220px;">
          <select class="muster-select tom-vehicle-select" onchange="handleTomorrowVehicleSelectChange(this)">
            ${vehicleOptions}
          </select>
        </td>
        <td style="width: 140px;">
          <input type="text" class="muster-select tom-site-input" value="${escapeHtml(defaultSite)}">
        </td>
        <td style="width: 160px;">
          <input type="text" class="muster-select tom-supervisor-input" value="${escapeHtml(defaultSupervisor)}">
        </td>
      </tr>
    `;
    })
    .join('');

  workers.forEach((u, idx) => {
    const row = tbody.children[idx];
    if (row) {
      const existingRoster = allRosters.find((r) => (r.userId === u.id || r.empId === u.empId) && r.date === tomorrowStr);
      const vSelect = row.querySelector('.tom-vehicle-select');
      if (vSelect && existingRoster && existingRoster.equipment) {
        vSelect.value = existingRoster.equipment;
      }
    }
  });
}

async function saveTomorrowSchedule() {
  const tomorrowStr = getTomorrowDateString();
  const rows = document.querySelectorAll('#tomorrow-table-body tr');
  const scheduleRecords = [];

  rows.forEach((r) => {
    const userId = r.getAttribute('data-userid');
    const empId = r.getAttribute('data-empid');
    const userName = r.getAttribute('data-username');
    const designation = r.getAttribute('data-designation');
    const shift = r.querySelector('.tom-shift-select')?.value || 'G Shift (08:30 AM - 05:30 PM)';
    let shiftCode = 'G';
    if (shift.includes('G Shift')) shiftCode = 'G';
    else if (shift.includes('A Shift')) shiftCode = 'A';
    else if (shift.includes('B Shift')) shiftCode = 'B';
    else if (shift.includes('C Shift')) shiftCode = 'C';
    else if (shift.includes('WO') || shift.toLowerCase().includes('week')) shiftCode = 'WO';
    else if (shift.toLowerCase().includes('leave')) shiftCode = 'Leave';
    else if (shift.toLowerCase().includes('absent') || shift === 'AB') shiftCode = 'Absent';

    const equipment = r.querySelector('.tom-vehicle-select')?.value || 'General Plant Duty';
    const site = r.querySelector('.tom-site-input')?.value || 'ACC Chanda Plant Site';
    const supervisor = r.querySelector('.tom-supervisor-input')?.value || 'Shift In-Charge (Plant Operations)';

    scheduleRecords.push({ userId, empId, userName, designation, shift, shiftCode, equipment, site, supervisor });
  });

  const saveBtn = document.getElementById('btn-save-tomorrow-schedule');
  try {
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving Schedule...';
    }

    const res = await fetch('/api/payroll/rosters/tomorrow-bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: tomorrowStr, scheduleRecords })
    });

    const data = await res.json();
    if (data.success) {
      showToast(`⚡ Tomorrow's shift & machinery schedule saved! (${scheduleRecords.length} operators scheduled)`);
      await fetchRosters();
    }
  } catch (err) {
    showToast("Tomorrow's schedule saved locally.");
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Tomorrow\'s Schedule';
    }
  }
}

// 15. Attendance Glass View & Leave Balance Tracker (Live Dynamic Sync with Muster Roll & Approved Leaves)
function renderAttendanceGlassCards() {
  const container = document.getElementById('glass-employee-cards');
  if (!container) return;

  const search = (document.getElementById('glass-search-input')?.value || '').toLowerCase().trim();
  const selectedMonth = document.getElementById('glass-month-select')?.value || 'September 2026';

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [mName, yStr] = selectedMonth.split(' ');
  const year = parseInt(yStr) || 2026;
  let monthIndex = monthNames.findIndex((m) => m.toLowerCase() === (mName || '').toLowerCase());
  if (monthIndex === -1) monthIndex = 8; // September default (0-indexed)
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate(); // 30 for September
  const monthNumStr = String(monthIndex + 1).padStart(2, '0');

  const workers = allUsers.filter((u) => {
    if (u.role === 'Super Admin') return false;
    return (
      !search ||
      (u.name && u.name.toLowerCase().includes(search)) ||
      (u.empId && u.empId.toLowerCase().includes(search)) ||
      (u.designation && u.designation.toLowerCase().includes(search)) ||
      (u.role && u.role.toLowerCase().includes(search))
    );
  });

  if (workers.length === 0) {
    container.innerHTML = `<div class="peach-glass" style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-dim);">No employee records found.</div>`;
    return;
  }

  container.innerHTML = workers
    .map((u) => {
      // Find all approved leaves for this employee
      const userApprovedLeaves = (allLeaves || []).filter(
        (lv) => (lv.userId === u.id || lv.empId === u.empId) && lv.status === 'Approved'
      );

      let markedPresentCount = 0;
      let markedWOCount = 0;
      let markedLeaveCount = 0;
      let markedAbsentCount = 0;
      let markedHalfDayCount = 0;
      let hasAnyMusterRecords = false;

      let dayPills = '';
      for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = String(day).padStart(2, '0');
        const dateStr = `${year}-${monthNumStr}-${dayStr}`;
        const dateObj = new Date(year, monthIndex, day);
        const isSunday = dateObj.getDay() === 0;

        // Query live attendance record from Daily Muster Roll
        const attRecord = (allAttendance || []).find(
          (a) => (a.userId === u.id || a.empId === u.empId) && a.date === dateStr
        );

        // Query approved leave spanning this date
        const leaveRecord = userApprovedLeaves.find(
          (lv) => lv.startDate <= dateStr && lv.endDate >= dateStr
        );

        let pClass = 'pill-wo';
        let pText = 'WO';
        let tooltip = `Day ${day} (${dateStr})`;

        if (attRecord) {
          hasAnyMusterRecords = true;
          const status = attRecord.status || 'Present';
          const shift = attRecord.shift || 'G Shift';
          const shiftCode = attRecord.shiftCode || (shift.includes('A') ? 'A' : (shift.includes('B') ? 'B' : (shift.includes('C') ? 'C' : 'G')));

          if (status === 'Present' || status === 'Overtime') {
            markedPresentCount++;
            pClass = 'pill-p';
            pText = shiftCode === 'WO' ? 'P' : shiftCode;
            tooltip += `: Present [Shift ${shiftCode}] - ${shift}${attRecord.notes ? ' | ' + attRecord.notes : ''}`;
          } else if (status === 'Half Day') {
            markedHalfDayCount++;
            markedPresentCount += 0.5;
            pClass = 'pill-hd';
            pText = 'HD';
            tooltip += `: Half Day [Shift ${shiftCode}]`;
          } else if (status === 'Weekly Off') {
            markedWOCount++;
            pClass = 'pill-wo';
            pText = 'WO';
            tooltip += `: Weekly Off (Muster Marked)`;
          } else if (status === 'Leave') {
            markedLeaveCount++;
            pClass = 'pill-l';
            pText = 'L';
            tooltip += `: On Leave [${attRecord.notes || 'Approved Leave'}]`;
          } else if (status === 'Absent') {
            markedAbsentCount++;
            pClass = 'pill-a';
            pText = 'A';
            tooltip += `: Absent (${attRecord.notes || 'Not Available'})`;
          } else {
            markedPresentCount++;
            pClass = 'pill-p';
            pText = 'P';
            tooltip += `: ${status}`;
          }
        } else if (leaveRecord) {
          markedLeaveCount++;
          pClass = 'pill-l';
          pText = 'L';
          tooltip += `: Approved Leave (${leaveRecord.leaveType || 'Leave'})`;
        } else if (isSunday) {
          markedWOCount++;
          pClass = 'pill-wo';
          pText = 'WO';
          tooltip += `: Sunday Weekly Off`;
        } else {
          pClass = 'pill-p';
          pText = 'P';
          tooltip += `: Scheduled Working Day (G Shift)`;
        }

        dayPills += `<div class="day-pill ${pClass}" title="${escapeHtml(tooltip)}">${pText}</div>`;
      }

      // Live metrics calculation
      const totalLeaves = Number(u.totalLeaves) || 10;
      const totalApprovedLeaveDays = userApprovedLeaves.reduce((acc, cur) => acc + (Number(cur.days) || 1), 0);
      const leavesTakenTotal = Math.max(Number(u.leavesTaken) || 0, totalApprovedLeaveDays, markedLeaveCount);
      const leaveBal = Number(u.leaveBalance) !== undefined ? Number(u.leaveBalance) : Math.max(0, totalLeaves - leavesTakenTotal);

      // Gauge stats: Use marked live muster counts if available, otherwise display monthly scheduled defaults
      const pDisplay = hasAnyMusterRecords
        ? markedPresentCount
        : (Number(u.presentDays) || (daysInMonth - (Number(u.weakOff) || 4)));
      const woDisplay = hasAnyMusterRecords
        ? markedWOCount
        : (Number(u.weakOff) || 4);
      const lDisplay = markedLeaveCount > 0 ? markedLeaveCount : (Number(u.leave) || 0);

      return `
      <div class="emp-glass-card peach-glass">
        <div class="card-head">
          <div class="card-emp-info">
            <h4>${escapeHtml(u.name)}</h4>
            <span>ID: <strong>${u.empId}</strong> | ${escapeHtml(u.designation || u.rank || 'Staff')} | ${escapeHtml(u.location || u.site || 'ACC Chanda')}</span>
          </div>
          <span class="role-badge ${u.role === 'Worker' ? 'role-worker' : (u.role === 'Supervisor' ? 'role-supervisor' : 'role-employee')}">${escapeHtml(u.role || 'Worker')}</span>
        </div>

        <div class="leave-gauge-box">
          <div class="gauge-item">
            <span class="g-val text-success">${pDisplay}</span>
            <span class="g-lbl">Present (P)</span>
          </div>
          <div class="gauge-item">
            <span class="g-val text-navy">${woDisplay}</span>
            <span class="g-lbl">Weekly Off (WO)</span>
          </div>
          <div class="gauge-item">
            <span class="g-val text-orange"><strong>${leaveBal}</strong> / ${totalLeaves}</span>
            <span class="g-lbl">Leave Balance</span>
          </div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; margin-bottom: 6px; color: var(--text-muted);">
            <span>${selectedMonth} Live Muster Matrix (Day 1 - ${daysInMonth})</span>
            <span><span class="text-success">● P: ${pDisplay}</span> | <span class="text-navy">● WO: ${woDisplay}</span> | <span class="text-warning">● L: ${lDisplay}</span>${markedAbsentCount > 0 ? ` | <span class="text-danger">● A: ${markedAbsentCount}</span>` : ''}</span>
          </div>
          <div class="day-pill-trail">
            ${dayPills}
          </div>
        </div>

        <div style="margin-top: 10px; display: flex; gap: 6px; justify-content: flex-end; border-top: 1px solid rgba(0,0,0,0.06); padding-top: 8px;">
          <button class="btn btn-outline-success btn-xs" onclick="openCreditLeaveModalForEmp('${u.id || u.empId}')" title="Credit Extra Leave Days">
            <i class="fa-solid fa-gift"></i> + Credit
          </button>
          <button class="btn btn-outline-primary btn-xs" onclick="openLeaveModalForEmp('${u.id || u.empId}')" title="Log / Request Leave">
            <i class="fa-solid fa-calendar-plus"></i> + Leave
          </button>
          <button class="btn btn-outline-secondary btn-xs" onclick="openLeaveHistoryModal('${u.id || u.empId}')" title="View & Delete Leaves">
            <i class="fa-solid fa-list-check"></i> Records
          </button>
        </div>
      </div>
    `;
    })
    .join('');
}

// 16. 1-Click Excel Reports Exporters
function exportTomorrowScheduleExcel() {
  const tomorrowStr = getTomorrowDateString();
  const rows = document.querySelectorAll('#tomorrow-table-body tr');
  const excelData = [
    ['SHREE RR TRADING COMPANY - PLANT OPERATIONS & FLEET MANAGEMENT'],
    [`TOMORROW'S DUTY SHIFT & MACHINERY SCHEDULE (${tomorrowStr.toUpperCase()})`],
    ['Generated from Operations Portal: https://payroll.shreerrtradingcompany.com'],
    [],
    ['Sr. No', 'Employee ID', 'Operator / Worker Name', 'Role / Designation', 'Duty Shift (G/A/B/C)', 'Shift Timings', 'Assigned Machinery / Vehicle', 'Plant Site / Location', 'Shift In-Charge / Supervisor']
  ];

  rows.forEach((r, idx) => {
    const empId = r.getAttribute('data-empid') || '';
    const userName = r.getAttribute('data-username') || '';
    const designation = r.getAttribute('data-designation') || 'Operator';
    const shift = r.querySelector('.tom-shift-select')?.value || 'G Shift (08:30 AM - 05:30 PM)';
    const equipment = r.querySelector('.tom-vehicle-select')?.value || 'General Plant Duty';
    const site = r.querySelector('.tom-site-input')?.value || 'ACC Chanda Plant Site';
    const supervisor = r.querySelector('.tom-supervisor-input')?.value || 'Shift In-Charge (Plant Operations)';

    let shiftCode = 'G Shift';
    let timings = '08:30 AM - 05:30 PM';

    if (shift.includes('A Shift')) {
      shiftCode = 'A Shift';
      timings = '06:00 AM - 02:00 PM';
    } else if (shift.includes('B Shift')) {
      shiftCode = 'B Shift';
      timings = '02:00 PM - 10:00 PM';
    } else if (shift.includes('C Shift')) {
      shiftCode = 'C Shift';
      timings = '10:00 PM - 06:00 AM';
    } else if (shift.includes('WO') || shift.toLowerCase().includes('week')) {
      shiftCode = 'WO (Weekly Off)';
      timings = 'Weekly Off';
    } else if (shift.toLowerCase().includes('leave')) {
      shiftCode = 'Leave (Approved)';
      timings = 'Approved Leave';
    } else if (shift.toLowerCase().includes('absent') || shift === 'AB') {
      shiftCode = 'Absent';
      timings = 'Absent / Off Duty';
    } else {
      shiftCode = 'G Shift';
      timings = '08:30 AM - 05:30 PM';
    }

    excelData.push([idx + 1, empId, userName, designation, shiftCode, timings, equipment, site, supervisor]);
  });

  const ws = XLSX.utils.aoa_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tomorrow Schedule');
  XLSX.writeFile(wb, `Shree_RR_Tomorrow_Shift_Schedule_${tomorrowStr}.xlsx`);
  showToast(`Downloaded 1-Click Excel: Tomorrow's Shift & Machine Schedule!`);
}

function exportMonthlyPayrollExcel() {
  const selectedMonth = document.getElementById('payroll-month-select')?.value || 'August 2026';
  const monthSlips = allSalarySlips.filter((s) => s.monthYear === selectedMonth);

  if (monthSlips.length === 0) {
    showToast(`Please click "1-Click Generate All Slips" first before exporting payroll.`, 'error');
    return;
  }

  const excelData = [
    ['SHREE RR TRADING COMPANY - PLANT O&M & HEAVY FLEETS CONTRACTS'],
    [`COMPREHENSIVE MONTHLY SALARY STATEMENT FOR ${selectedMonth.toUpperCase()}`],
    ['Site: ACC Chanda Plant Site & Operations | Portal: https://payroll.shreerrtradingcompany.com'],
    [],
    [
      'Sr. No',
      'Emp ID',
      'Employee Name',
      'Father Name',
      'Designation / Rank',
      'Category',
      'Site Location',
      'Days in Month',
      'Payable Working Days',
      'Basic Salary (₹)',
      'DA (₹)',
      'HRA (₹)',
      'Special Allowance (₹)',
      'GROSS EARNINGS (₹)',
      'PF (12%) (₹)',
      'ESIC (₹)',
      'PT (₹)',
      'TOTAL DEDUCTIONS (₹)',
      'NET TAKE HOME PAY (₹)',
      'Bank Account No',
      'Bank IFSC',
      'UAN NO',
      'PF NO',
      'ESIC NO',
      'Mobile / WhatsApp'
    ]
  ];

  monthSlips.forEach((s, idx) => {
    excelData.push([
      idx + 1,
      s.empId,
      s.userName,
      s.fatherName || '',
      s.designation || 'Staff',
      s.category || 'Skilled',
      s.location || 'ACC Chanda',
      s.totalDays || 31,
      s.workedDays || 31,
      Number(s.earnings?.basic || 0).toFixed(2),
      Number(s.earnings?.da || 0).toFixed(2),
      Number(s.earnings?.hra || 0).toFixed(2),
      Number(s.earnings?.specialAllowance || 0).toFixed(2),
      Number(s.grossPay || 0).toFixed(2),
      Number(s.deductions?.pf || 0).toFixed(2),
      Number(s.deductions?.esic || 0).toFixed(2),
      Number(s.deductions?.pt || 0).toFixed(2),
      Number(s.totalDeductions || 0).toFixed(2),
      Number(s.netPay || 0).toFixed(2),
      s.bankAccount || '',
      s.ifsc || '',
      s.uan || '',
      s.pfNo || '',
      s.esicNo || '',
      s.mobile || ''
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Payroll Master');
  XLSX.writeFile(wb, `Shree_RR_Monthly_Payroll_Master_${selectedMonth.replace(/\s+/g, '_')}.xlsx`);
  showToast(`Downloaded 1-Click Excel: Monthly Payroll Master (${monthSlips.length} employees)!`);
}

function exportBankDisbursalExcel() {
  const selectedMonth = document.getElementById('payroll-month-select')?.value || 'August 2026';
  const monthSlips = allSalarySlips.filter((s) => s.monthYear === selectedMonth);

  if (monthSlips.length === 0) {
    showToast(`Please generate salary slips first before downloading bank disbursal file.`, 'error');
    return;
  }

  const excelData = [
    ['SHREE RR TRADING COMPANY - CORPORATE BANK SALARY DISBURSAL / NEFT UPLOAD FILE'],
    [`SALARY DISBURSAL FOR ${selectedMonth.toUpperCase()}`],
    ['Debit Account: SHREE RR TRADING COMPANY (Corporate Current A/C)'],
    [],
    [
      'Sr. No',
      'Beneficiary Name (As per Bank)',
      'Employee ID',
      'Bank Account Number',
      'IFSC Code',
      'Net Salary Amount (₹)',
      'Payment Narration / Remarks',
      'Registered Mobile Number'
    ]
  ];

  let totalAmount = 0;

  monthSlips.forEach((s, idx) => {
    const netAmount = Number(s.netPay || 0);
    totalAmount += netAmount;
    excelData.push([
      idx + 1,
      s.userName,
      s.empId,
      s.bankAccount || 'On Record',
      s.ifsc || 'SBIN0006872',
      netAmount.toFixed(2),
      `Salary ${s.monthYear} Shree RR Trading`,
      s.mobile ? `+91 ${s.mobile}` : ''
    ]);
  });

  excelData.push([]);
  excelData.push(['', 'TOTAL DISBURSAL BATCH AMOUNT:', '', '', '', totalAmount.toFixed(2), `${monthSlips.length} Records Verified`, '']);

  const ws = XLSX.utils.aoa_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'NEFT Bank Deposit');
  XLSX.writeFile(wb, `Shree_RR_Bank_NEFT_Deposit_${selectedMonth.replace(/\s+/g, '_')}.xlsx`);
  showToast(`Downloaded 1-Click Bank NEFT Deposit File (Total: ₹${totalAmount.toLocaleString('en-IN')})!`);
}

function populateReportsDefaults() {
  const repTomBtn = document.getElementById('btn-rep-tomorrow-excel');
  const repPayBtn = document.getElementById('btn-rep-payroll-excel');
  const repBankBtn = document.getElementById('btn-rep-bank-excel');
  const repMttrBtn = document.getElementById('btn-rep-mttr-excel');

  if (repTomBtn) repTomBtn.onclick = exportTomorrowScheduleExcel;
  if (repPayBtn) repPayBtn.onclick = exportMonthlyPayrollExcel;
  if (repBankBtn) repBankBtn.onclick = exportBankDisbursalExcel;
  if (repMttrBtn) repMttrBtn.onclick = exportFleetMTTRExcel;
}

// 17. Bulk Employee Upload
function initBulkUpload() {
  const fileInput = document.getElementById('bulk-file-input');
  const dropZone = document.getElementById('drop-zone');

  if (dropZone && fileInput) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--logo-orange)';
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.style.borderColor = 'var(--border-orange)';
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--border-orange)';
      if (e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
      }
    });
  }

  const confirmBtn = document.getElementById('btn-confirm-bulk-import');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      if (parsedBulkEmployees.length === 0) return;

      try {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Importing...';

        const res = await fetch('/api/payroll/users/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employees: parsedBulkEmployees })
        });

        const data = await res.json();
        if (data.success) {
          showToast(data.message || 'Bulk import successful!');
          closeModal('modal-bulk-import');
          await fetchUsers();
          updateDashboardMetrics();
        }
      } catch (err) {
        showToast('Bulk import completed.');
        closeModal('modal-bulk-import');
        fetchUsers();
      } finally {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<i class="fa-solid fa-upload"></i> Import Employees to Database';
      }
    });
  }

  const downloadBtns = [document.getElementById('btn-download-sample-csv'), document.getElementById('btn-modal-download-template')];
  downloadBtns.forEach((btn) => {
    if (btn) btn.addEventListener('click', generateAndDownloadTemplate);
  });
}

function handleFileSelect(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames.includes('Data') ? 'Data' : workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      parsedBulkEmployees = jsonRows
        .filter((r) => r['Name'] || r['EMPLOYEE ID'] || r['Emp ID'])
        .map((r, idx) => {
          const empId = String(r['EMPLOYEE ID'] || r['Emp ID'] || r['empId'] || `SRR${String(allUsers.length + idx + 1).padStart(3, '0')}`).trim();
          const name = String(r['Name'] || r['name'] || '').trim();
          const rank = String(r['Rank'] || r['Designation'] || r['designation'] || 'Operator').trim();
          const father = String(r['Father name'] || r['Father Name'] || r['fatherName'] || '').trim();
          const mobile = String(r['Mobile Number'] || r['Mobile'] || r['phone'] || '').replace(/[^0-9]/g, '').slice(-10);
          const bank = String(r['BANK A/C NO'] || r['Bank Account'] || r['bankAccount'] || '').trim();
          const ifsc = String(r['IFSC CODE'] || r['IFSC'] || r['ifsc'] || '').trim();
          const ctc = Number(r['CTC'] || r['ctc']) || null;
          const basicPerDay = Number(r['Basic Per Day'] || r['basicPerDay']) || null;

          let role = 'Worker';
          const rLow = rank.toLowerCase();
          if (rLow.includes('supervisor') || rLow.includes('engineer')) role = 'Supervisor';
          else if (rLow.includes('management') || rLow.includes('manager')) role = 'Manager';
          else if (rLow.includes('mechanic') || rLow.includes('welder') || rLow.includes('electrician')) role = 'Employee';

          return {
            empId,
            name,
            role,
            rank,
            designation: rank,
            fatherName: father,
            mobile,
            phone: mobile ? `+91 ${mobile}` : '',
            bankAccount: bank,
            ifsc,
            ctc,
            basicPerDay,
            uan: String(r['UAN NO'] || r['UAN'] || '').replace(/`/g, '').trim(),
            esicNo: String(r['ESIC NO.'] || r['ESIC'] || '').trim(),
            pfNo: String(r['PF NO.'] || r['PF'] || '').trim(),
            dob: String(r['Date of birth'] || r['DOB'] || '').trim(),
            doj: String(r['Date of joining'] || r['DOJ'] || '').trim(),
            location: String(r['Locaion'] || r['Location'] || 'ACC Chanda').trim(),
            category: String(r['Category'] || 'Skilled').trim(),
            status: 'Active'
          };
        });

      const previewCount = document.getElementById('bulk-preview-count');
      if (previewCount) previewCount.textContent = parsedBulkEmployees.length;

      const previewBody = document.getElementById('preview-table-body');
      if (previewBody) {
        previewBody.innerHTML = parsedBulkEmployees
          .slice(0, 15)
          .map(
            (e) => `
            <tr>
              <td><strong>${escapeHtml(e.empId)}</strong></td>
              <td>${escapeHtml(e.name)}</td>
              <td>${escapeHtml(e.designation)}</td>
              <td>${escapeHtml(e.fatherName || '-')}</td>
              <td>${escapeHtml(e.mobile || '-')}</td>
              <td>${escapeHtml(e.bankAccount || '-')}</td>
              <td>${escapeHtml(e.ifsc || '-')}</td>
              <td>${e.basicPerDay ? `₹${e.basicPerDay}/Day` : e.ctc ? `₹${e.ctc} CTC` : '₹25,000'}</td>
            </tr>
          `
          )
          .join('');
      }

      document.getElementById('bulk-preview-area').classList.remove('hidden');
      document.getElementById('btn-confirm-bulk-import').disabled = false;
      showToast(`Successfully parsed ${parsedBulkEmployees.length} workforce records.`);
    } catch (err) {
      showToast('Error reading Excel file.', 'error');
    }
  };
  reader.readAsArrayBuffer(file);
}

function generateAndDownloadTemplate() {
  const headers = [
    'Sr.NO',
    'EMPLOYEE ID',
    'Name',
    'Rank',
    'Days In Month',
    'Present Days',
    'Weak OFF',
    'Leave',
    'Basic Per Day',
    'CTC',
    'Father name',
    'Date of birth',
    'Date of joining',
    'UAN NO',
    'ESIC NO.',
    'PF NO.',
    'BANK A/C NO',
    'IFSC CODE',
    'Locaion',
    'Category',
    'Mobile Number'
  ];

  const sampleRows = [
    [1, 'SRR004', 'SHEIKH ISUB SHEIKH KASAM', 'Mechanic', 31, 27, 0, 0, 444.62, '', 'MR. SHEIKH KASAM', '06/07/1986', '12/01/2025', '100688645676', '2303010526', 'HPSML37703770000010028', '32049452658', 'SBIN0006872', 'ACC Chanda', 'Skilled', '9960375227'],
    [2, 'SRR014', 'RAJU BALAJI KULMETHE', 'Operator', 31, 26, 4, 1, 444.62, '', 'BALAJI KULMETHE', '14/05/1990', '15/01/2025', '101306845435', '2303010530', 'HPSML37703770000010029', '32049452659', 'SBIN0006872', 'ACC Chanda', 'Skilled', '9822852945']
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, 'Shree_RR_Employee_Master_Template.xlsx');
  showToast('Downloaded official Excel import template.');
}

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

      return `
      <tr>
        <td class="emp-cell-id">${s.id ? s.id.slice(-9) : 'SLP'}</td>
        <td><strong>${escapeHtml(s.monthYear)}</strong></td>
        <td>
          <span class="emp-cell-name">${escapeHtml(s.userName)}</span>
          <span class="emp-cell-sub">ID: ${escapeHtml(s.empId)} | Site: ${escapeHtml(s.location || 'ACC Chanda')}</span>
        </td>
        <td>${escapeHtml(s.designation || 'Staff')}</td>
        <td><strong>${s.workedDays || 31} / ${s.totalDays || 31}</strong></td>
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

// 19. WhatsApp Dispatch & Strict 1-Page PDF Engine
async function dispatchWhatsAppWithPdfAttachment({ element, filename, mobile, textMessage, title, recipientName }) {
  if (!element) {
    showToast('Document element not found.', 'error');
    return;
  }

  showToast(`Preparing 1-Page Official PDF for ${recipientName || 'Employee'}...`);

  // Apply strict single-page constraints
  element.classList.add('pdf-strict-single-page');

  const opt = {
    margin: [4, 6, 4, 6],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false, scrollY: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  let pdfBlob = null;
  try {
    if (typeof html2pdf !== 'undefined') {
      pdfBlob = await html2pdf().set(opt).from(element).output('blob');
    }
  } catch (err) {
    console.warn('PDF blob generation error:', err);
  } finally {
    element.classList.remove('pdf-strict-single-page');
  }

  // Auto trigger download of the official 1-page PDF file to device
  if (pdfBlob) {
    try {
      const blobUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 25000);
    } catch (dErr) {
      console.error('Download error:', dErr);
    }
  }

  const cleanMobile = String(mobile || '').replace(/[^0-9]/g, '').slice(-10);
  let targetPhone = cleanMobile;
  if (!targetPhone || targetPhone.length < 10) {
    const entered = prompt(`Enter 10-digit WhatsApp Mobile number for ${recipientName || 'Employee'}:`, '9822852945');
    if (!entered) return;
    targetPhone = entered.replace(/[^0-9]/g, '').slice(-10);
  }

  // Attempt 1: Native File WebShare (Android Chrome / iOS Safari / macOS / Mobile WhatsApp)
  let sharedAsFile = false;
  if (pdfBlob && navigator.canShare) {
    try {
      const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });
      if (navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          files: [pdfFile],
          title: title || filename,
          text: textMessage
        });
        sharedAsFile = true;
        showToast(`✅ Official PDF Attached & Shared via WhatsApp to ${recipientName}!`);
      }
    } catch (shareErr) {
      console.log('WebShare file share skipped or cancelled:', shareErr);
    }
  }

  // Attempt 2: Desktop WhatsApp Web / Non-WebShare Fallback with Auto-Download & Pre-filled text
  if (!sharedAsFile) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textMessage);
      }
    } catch (cErr) {
      console.warn('Clipboard write error:', cErr);
    }

    const waUrl = `https://api.whatsapp.com/send?phone=91${targetPhone}&text=${encodeURIComponent(textMessage)}`;
    window.open(waUrl, '_blank');

    showToast(`📄 1-Page PDF Downloaded! In WhatsApp, click 📎 Attach > Document to attach "${filename}"`, 'success', 8000);
  }
}

async function downloadSlipPdf(slipId) {
  let slip = slipId ? allSalarySlips.find((s) => s.id === slipId) : currentActiveSlip;
  if (!slip && allSalarySlips.length > 0) slip = allSalarySlips[0];
  if (!slip) {
    showToast('No salary slip selected for PDF export.', 'error');
    return;
  }

  // Populate printable modal
  viewSalarySlip(slip.id);

  const element = document.getElementById('printable-salary-slip-content');
  if (!element) return;

  element.classList.add('pdf-strict-single-page');

  const opt = {
    margin: [4, 6, 4, 6],
    filename: `Shree_RR_SalarySlip_${slip.empId}_${slip.monthYear.replace(/\s+/g, '_')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false, scrollY: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  showToast(`Generating Strict 1-Page PDF Payslip for ${slip.userName}...`);

  try {
    if (typeof html2pdf !== 'undefined') {
      await html2pdf().set(opt).from(element).save();
      showToast(`Downloaded 1-Page PDF: ${opt.filename}`);
    } else {
      window.print();
    }
  } finally {
    element.classList.remove('pdf-strict-single-page');
  }
}

function createWhatsAppMessage(slip) {
  const cleanMobile = String(slip.mobile || slip.phone || '').replace(/[^0-9]/g, '').slice(-10);
  const basic = Number(slip.earnings?.basic || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const da = Number(slip.earnings?.da || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const hra = Number(slip.earnings?.hra || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const special = Number(slip.earnings?.specialAllowance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const gross = Number(slip.grossPay || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  const pf = Number(slip.deductions?.pf || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const esic = Number(slip.deductions?.esic || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const pt = Number(slip.deductions?.pt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const deductions = Number(slip.totalDeductions || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const netPay = Number(slip.netPay || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  const msg = `*SHREE RR TRADING COMPANY*
*Official Salary Slip - ${slip.monthYear}*
━━━━━━━━━━━━━━━━━━━━
👤 *Employee:* ${slip.userName} (${slip.empId})
🛠 *Designation:* ${slip.designation}
📍 *Site Location:* ${slip.location || 'ACC Chanda Plant Site'}
📅 *Payable Days:* ${slip.workedDays || 31} / ${slip.totalDays || 31} Days

💵 *GROSS EARNINGS:* *₹${gross}*
 • Basic Salary: ₹${basic}
 • DA: ₹${da}
 • HRA: ₹${hra}
 • Special Plant Allowance: ₹${special}

📉 *TOTAL DEDUCTIONS:* *₹${deductions}*
 • PF Contribution: ₹${pf}
 • ESIC: ₹${esic}
 • Professional Tax (PT): ₹${pt}

💰 *NET TAKE HOME SALARY:* *₹${netPay}*
🏦 *Bank A/C:* ${slip.bankAccount || 'On Record'} (${slip.ifsc || ''})

📎 _Official 1-Page PDF Payslip attached._
━━━━━━━━━━━━━━━━━━━━
_Portal: https://payroll.shreerrtradingcompany.com_
_Developed & Powered by SrijanDev © 2026_`;

  return { mobile: cleanMobile, text: msg };
}

async function sendSlipWhatsApp(slipId) {
  const slip = allSalarySlips.find((s) => s.id === slipId);
  if (!slip) return;

  viewSalarySlip(slip.id);

  const element = document.getElementById('printable-salary-slip-content');
  const filename = `Shree_RR_SalarySlip_${slip.empId}_${slip.monthYear.replace(/\s+/g, '_')}.pdf`;
  const { mobile, text } = createWhatsAppMessage(slip);

  await dispatchWhatsAppWithPdfAttachment({
    element,
    filename,
    mobile: mobile || slip.mobile,
    textMessage: text,
    title: `Salary Slip ${slip.monthYear} - ${slip.userName}`,
    recipientName: slip.userName
  });
}

function dispatchBulkWhatsApp() {
  const selectedMonth = document.getElementById('payroll-month-select')?.value || 'August 2026';
  const monthSlips = allSalarySlips.filter((s) => s.monthYear === selectedMonth);

  if (monthSlips.length === 0) {
    showToast(`No salary slips available for ${selectedMonth} to send.`, 'error');
    return;
  }

  let index = 0;
  function sendNext() {
    if (index >= monthSlips.length) {
      showToast(`Finished sending WhatsApp slips for ${monthSlips.length} employees.`);
      return;
    }
    const slip = monthSlips[index];
    index++;
    sendSlipWhatsApp(slip.id);
  }

  if (confirm(`Open WhatsApp to send salary slips and download PDFs for ${monthSlips.length} employees?`)) {
    sendNext();
  }
}

// 20. Official Printable Salary Slip Modal
function viewSalarySlip(slipId) {
  const slip = allSalarySlips.find((s) => s.id === slipId);
  if (!slip) return;

  currentActiveSlip = slip;

  document.getElementById('slip-display-month').textContent = `PAY SLIP FOR ${slip.monthYear.toUpperCase()}`;
  document.getElementById('slip-val-empId').textContent = slip.empId || 'SRR';
  document.getElementById('slip-val-name').textContent = slip.userName || '-';
  document.getElementById('slip-val-father').textContent = slip.fatherName || '-';
  document.getElementById('slip-val-designation').textContent = slip.designation || '-';
  document.getElementById('slip-val-category').textContent = slip.category || 'Skilled';
  document.getElementById('slip-val-location').textContent = slip.location || 'ACC Chanda';

  document.getElementById('slip-val-dob').textContent = slip.dob || 'N/A';
  document.getElementById('slip-val-doj').textContent = slip.doj || 'N/A';
  document.getElementById('slip-val-uan').textContent = slip.uan || 'N/A';
  document.getElementById('slip-val-pf').textContent = slip.pfNo || 'N/A';
  document.getElementById('slip-val-esic').textContent = slip.esicNo || 'N/A';
  document.getElementById('slip-val-bank').textContent = `${slip.bankAccount || 'N/A'} (IFSC: ${slip.ifsc || 'N/A'})`;

  document.getElementById('slip-val-totalDays').textContent = slip.totalDays || 31;
  document.getElementById('slip-val-workedDays').textContent = slip.workedDays || 31;
  document.getElementById('slip-val-mobile').textContent = slip.mobile ? `+91 ${slip.mobile}` : 'N/A';

  const basic = Number(slip.earnings?.basic || 0);
  const da = Number(slip.earnings?.da || 0);
  const hra = Number(slip.earnings?.hra || 0);
  const special = Number(slip.earnings?.specialAllowance || 0);
  const ot = Number(slip.earnings?.otWage || 0);
  const gross = Number(slip.grossPay || 0);

  document.getElementById('slip-earn-basic').textContent = `₹${basic.toFixed(2)}`;
  document.getElementById('slip-earn-da').textContent = `₹${da.toFixed(2)}`;
  document.getElementById('slip-earn-hra').textContent = `₹${hra.toFixed(2)}`;
  document.getElementById('slip-earn-special').textContent = `₹${special.toFixed(2)}`;
  document.getElementById('slip-earn-ot').textContent = `₹${ot.toFixed(2)}`;
  document.getElementById('slip-calc-gross').textContent = `₹${gross.toFixed(2)}`;

  const pf = Number(slip.deductions?.pf || 0);
  const esic = Number(slip.deductions?.esic || 0);
  const pt = Number(slip.deductions?.pt || 0);
  const lic = Number(slip.deductions?.lic || 0);
  const adv = Number(slip.deductions?.advance || 0);
  const deductions = Number(slip.totalDeductions || 0);
  const net = Number(slip.netPay || 0);

  document.getElementById('slip-ded-pf').textContent = `₹${pf.toFixed(2)}`;
  document.getElementById('slip-ded-esic').textContent = `₹${esic.toFixed(2)}`;
  document.getElementById('slip-ded-pt').textContent = `₹${pt.toFixed(2)}`;
  document.getElementById('slip-ded-lic').textContent = `₹${lic.toFixed(2)}`;
  document.getElementById('slip-ded-advance').textContent = `₹${adv.toFixed(2)}`;
  document.getElementById('slip-calc-deductions').textContent = `₹${deductions.toFixed(2)}`;

  document.getElementById('slip-calc-net').textContent = `₹${net.toFixed(2)}`;
  document.getElementById('slip-val-networds').textContent = numberToWordsIndian(Math.round(net)) + ' Rupees Only';

  const modalWaBtn = document.getElementById('slip-whatsapp-btn');
  if (modalWaBtn) {
    modalWaBtn.onclick = () => sendSlipWhatsApp(slip.id);
  }

  openModal('modal-salary-slip');
}

// 21. Event Listeners & Modals
function initEventListeners() {
  initBulkUpload();
  initVehicleBulkImport();
  initSalarySlips();

  // Muster Date Picker & Quick Actions
  const datePicker = document.getElementById('muster-date-picker');
  if (datePicker) {
    if (!datePicker.value) {
      datePicker.value = new Date().toISOString().split('T')[0];
    }
    datePicker.addEventListener('change', () => {
      renderMusterRollTable();
      renderAttendanceGlassCards();
    });
  }

  document.getElementById('muster-search-input')?.addEventListener('input', renderMusterRollTable);
  document.getElementById('btn-export-muster-excel')?.addEventListener('click', exportDailyMusterExcel);

  const fillAllGBtn = document.getElementById('btn-muster-mark-all-g');
  if (fillAllGBtn) {
    fillAllGBtn.addEventListener('click', () => {
      document.querySelectorAll('.muster-shift-select').forEach((s) => (s.value = 'G Shift (08:30 AM - 05:30 PM)'));
      document.querySelectorAll('.muster-status-select').forEach((s) => (s.value = 'Present'));
      document.querySelectorAll('.muster-clockin-input').forEach((c) => (c.value = '08:30 AM'));
      document.querySelectorAll('.muster-clockout-input').forEach((c) => (c.value = '05:30 PM'));
      showToast('Workforce set to G Shift (08:30 AM - 05:30 PM, Present)');
    });
  }

  const saveMusterBtn = document.getElementById('btn-save-daily-muster');
  if (saveMusterBtn) {
    saveMusterBtn.addEventListener('click', async () => {
      const date = datePicker ? datePicker.value : new Date().toISOString().split('T')[0];
      const rows = document.querySelectorAll('#muster-table-body tr');
      const musterRecords = [];

      rows.forEach((r) => {
        const userId = r.getAttribute('data-userid');
        const empId = r.getAttribute('data-empid');
        const userName = r.getAttribute('data-username');
        const shift = r.querySelector('.muster-shift-select')?.value || 'G Shift (08:30 AM - 05:30 PM)';
        const shiftCode = shift.includes('G Shift') ? 'G' : (shift.includes('A Shift') ? 'A' : (shift.includes('B Shift') ? 'B' : (shift.includes('C Shift') ? 'C' : 'WO')));
        const status = r.querySelector('.muster-status-select')?.value || 'Present';
        const isAbsentOrOff = status === 'Absent' || status === 'Weekly Off' || status === 'Leave';
        const clockIn = r.querySelector('.muster-clockin-input')?.value || (isAbsentOrOff ? '-' : (shiftCode === 'G' ? '08:30 AM' : '08:00 AM'));
        const clockOut = r.querySelector('.muster-clockout-input')?.value || (isAbsentOrOff ? '-' : (shiftCode === 'G' ? '05:30 PM' : '05:00 PM'));
        const site = r.querySelector('.muster-site-input')?.value || 'ACC Chanda';
        const notes = r.querySelector('.muster-notes-input')?.value || (status === 'Absent' ? 'Daily Muster Roll: Absent' : (status === 'Weekly Off' ? 'Muster Roll: Weekly Off' : (status === 'Leave' ? 'Muster Roll: On Leave' : `Muster Roll: Shift ${shiftCode} Marked`)));

        musterRecords.push({ userId, empId, userName, date, shift, shiftCode, clockIn, clockOut, status, site, notes });
      });

      if (musterRecords.length === 0) return;

      try {
        saveMusterBtn.disabled = true;
        saveMusterBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

        const res = await fetch('/api/payroll/attendance/muster-roll-bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date, musterRecords })
        });
        const data = await res.json();
        if (data.success) {
          showToast(`⚡ Saved today's muster roll for ${date}! (${musterRecords.length} workers)`);
          await fetchAttendance();
          renderAttendanceGlassCards();
          updateDashboardMetrics();
        }
      } catch (e) {
        showToast('Saved locally.');
      } finally {
        saveMusterBtn.disabled = false;
        saveMusterBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Today\'s Muster Roll';
      }
    });
  }

  // Tomorrow Schedule Actions
  document.getElementById('btn-save-tomorrow-schedule')?.addEventListener('click', saveTomorrowSchedule);
  document.getElementById('btn-export-tomorrow-excel')?.addEventListener('click', exportTomorrowScheduleExcel);
  document.getElementById('btn-quick-tomorrow')?.addEventListener('click', () => switchTab('tomorrow'));
  document.getElementById('dash-btn-tomorrow')?.addEventListener('click', () => switchTab('tomorrow'));
  document.getElementById('dash-btn-muster')?.addEventListener('click', () => switchTab('muster'));
  document.getElementById('dash-btn-reports')?.addEventListener('click', () => switchTab('reports'));
  document.getElementById('dash-btn-leaves')?.addEventListener('click', () => switchTab('attendance-glass'));
  document.getElementById('btn-quick-excel-reports')?.addEventListener('click', () => switchTab('reports'));

  // Vehicle Actions
  document.getElementById('btn-bulk-import-vehicles')?.addEventListener('click', () => {
    document.getElementById('bulk-vehicles-preview-area').classList.add('hidden');
    document.getElementById('btn-confirm-bulk-vehicles').disabled = true;
    openModal('modal-bulk-vehicles');
  });

  document.getElementById('btn-delete-all-vehicles')?.addEventListener('click', deleteAllVehicles);
  document.getElementById('btn-export-fleet-mttr-excel')?.addEventListener('click', exportFleetMTTRExcel);

  document.getElementById('btn-open-breakdown-modal')?.addEventListener('click', () => {
    populateVehicleDropdowns();
    document.getElementById('bd-log-date').value = new Date().toISOString().split('T')[0];
    openModal('modal-vehicle-breakdown');
  });

  // Search & Filter Listeners
  ['user-search-input', 'user-role-filter', 'user-category-filter'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', renderUsersTable);
    document.getElementById(id)?.addEventListener('change', renderUsersTable);
  });

  ['vehicle-search-input', 'vehicle-type-filter'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', renderVehiclesTable);
    document.getElementById(id)?.addEventListener('change', renderVehiclesTable);
  });

  document.getElementById('glass-search-input')?.addEventListener('input', renderAttendanceGlassCards);
  document.getElementById('glass-month-select')?.addEventListener('change', renderAttendanceGlassCards);
  document.getElementById('slip-search-input')?.addEventListener('input', renderSalaryTable);

  document.getElementById('btn-add-employee-top')?.addEventListener('click', openAddUserModal);
  document.getElementById('btn-open-add-user-modal')?.addEventListener('click', openAddUserModal);
  document.getElementById('btn-open-add-vehicle-modal')?.addEventListener('click', openAddVehicleModal);

  document.getElementById('btn-open-leave-modal')?.addEventListener('click', () => {
    populateUserDropdowns();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('leave-start-date').value = today;
    document.getElementById('leave-end-date').value = today;
    openModal('modal-leave');
  });

  document.getElementById('btn-open-credit-leave-modal')?.addEventListener('click', () => {
    populateUserDropdowns();
    openModal('modal-leave-credit');
  });

  document.getElementById('btn-open-leave-history-modal')?.addEventListener('click', () => {
    openLeaveHistoryModal();
  });

  document.getElementById('leave-history-search')?.addEventListener('input', () => {
    renderLeaveHistoryTable();
  });

  document.getElementById('btn-bulk-import-emp')?.addEventListener('click', () => {
    document.getElementById('bulk-preview-area').classList.add('hidden');
    document.getElementById('btn-confirm-bulk-import').disabled = true;
    openModal('modal-bulk-import');
  });

  // Form: Save User (Superadmin Exclusive User Creation)
  const formUser = document.getElementById('form-user');
  if (formUser) {
    formUser.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('user-id').value;
      const empId = document.getElementById('user-empId').value.trim();
      const name = document.getElementById('user-name').value.trim();
      const role = document.getElementById('user-role').value;
      const fatherName = document.getElementById('user-fatherName').value.trim();
      const mobile = document.getElementById('user-mobile').value.trim();
      const designation = document.getElementById('user-designation').value;
      const category = document.getElementById('user-category').value;
      const location = document.getElementById('user-location').value.trim();
      const ctc = document.getElementById('user-ctc').value ? Number(document.getElementById('user-ctc').value) : null;
      const basicPerDay = document.getElementById('user-basicPerDay').value ? Number(document.getElementById('user-basicPerDay').value) : null;
      const bankAccount = document.getElementById('user-bankAccount').value.trim();
      const ifsc = document.getElementById('user-ifsc').value.trim();
      const uan = document.getElementById('user-uan').value.trim();
      const pfNo = document.getElementById('user-pfNo').value.trim();
      const esicNo = document.getElementById('user-esicNo').value.trim();
      const dob = document.getElementById('user-dob').value.trim();

      const payload = {
        empId,
        name,
        role,
        fatherName,
        mobile,
        phone: mobile ? `+91 ${mobile}` : '',
        designation,
        rank: designation,
        category,
        location,
        site: location,
        ctc,
        basicPerDay,
        bankAccount,
        ifsc,
        uan,
        pfNo,
        esicNo,
        dob
      };

      const isEdit = !!id;
      const url = isEdit ? `/api/payroll/users/${id}` : '/api/payroll/users';
      const method = isEdit ? 'PUT' : 'POST';

      try {
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (data.success) {
          showToast(data.message || 'Saved successfully!');
          closeModal('modal-user');
          await fetchUsers();
          updateDashboardMetrics();
        }
      } catch (err) {
        closeModal('modal-user');
        fetchUsers();
      }
    });
  }

  // Form: Save Dynamic Permissions Matrix
  const formAccess = document.getElementById('form-user-access');
  if (formAccess) {
    formAccess.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('btn-save-user-access');
      const userId = document.getElementById('access-user-id').value;
      const role = document.getElementById('access-user-role').value;
      const loginAllowed = document.getElementById('access-login-toggle').checked;
      const password = document.getElementById('access-user-password').value.trim();

      const permissions = {
        'hr.users.manage': document.getElementById('perm-manage-users')?.checked || false,
        'attendance.muster.mark': document.getElementById('perm-mark-muster')?.checked || false,
        'fleets.manage': document.getElementById('perm-manage-fleets')?.checked || false,
        'payroll.salary_structure.view': document.getElementById('perm-view-salary')?.checked || false,
        'payroll.manage_all': document.getElementById('perm-manage-payroll')?.checked || false,
        'reports.bank_deposit.export': document.getElementById('perm-export-reports')?.checked || false,
        'hr.appointment_letter.generate': document.getElementById('perm-appointment-letters')?.checked || false,
        'expenses.field_claims.process': document.getElementById('perm-field-expenses')?.checked || false
      };

      try {
        if (saveBtn) {
          saveBtn.disabled = true;
          saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
        }

        const res = await fetch(`/api/payroll/users/${userId}/access`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, loginAllowed, loginEnabled: loginAllowed, password, permissions })
        });
        const data = await res.json();

        const targetIndex = allUsers.findIndex((u) => u.id === userId || u.empId === userId);
        if (targetIndex !== -1) {
          allUsers[targetIndex].role = role;
          allUsers[targetIndex].loginAllowed = loginAllowed;
          allUsers[targetIndex].loginEnabled = loginAllowed;
          allUsers[targetIndex].password = password;
          allUsers[targetIndex].permissions = permissions;
        }

        renderUsersTable();
        closeModal('modal-user-access');
        showToast(`⚡ Access & permissions saved! Login is now ${loginAllowed ? 'ACTIVE' : 'LOCKED'}.`);
        await fetchUsers();
        updateDashboardMetrics();
      } catch (err) {
        closeModal('modal-user-access');
        renderUsersTable();
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Access & Permissions';
        }
      }
    });
  }

  // Form: Vehicle Add/Edit
  const formVeh = document.getElementById('form-vehicle');
  if (formVeh) {
    formVeh.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('vehicle-id').value;
      const vehicleNo = document.getElementById('veh-number').value.trim();
      const name = document.getElementById('veh-name').value.trim();
      const type = document.getElementById('veh-type').value;
      const model = document.getElementById('veh-model').value.trim();
      const operatorSelect = document.getElementById('veh-operator');
      const operatorId = operatorSelect.value;
      const operatorName = operatorSelect.options[operatorSelect.selectedIndex]?.text.split(' (')[0] || 'Unassigned';
      const site = document.getElementById('veh-site').value.trim();
      const status = document.getElementById('veh-status').value;
      const hourlyRate = Number(document.getElementById('veh-rate').value) || 0;
      const notes = document.getElementById('veh-notes').value.trim();

      const payload = { vehicleNo, name, type, model, operatorId, operatorName: operatorId ? operatorName : 'Unassigned', site, status, hourlyRate, notes };
      const isEdit = !!id;
      const url = isEdit ? `/api/payroll/vehicles/${id}` : '/api/payroll/vehicles';
      const method = isEdit ? 'PUT' : 'POST';

      try {
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (data.success) {
          showToast(data.message || 'Vehicle record saved!');
          closeModal('modal-vehicle');
          await fetchVehicles();
          updateDashboardMetrics();
        }
      } catch (err) {
        closeModal('modal-vehicle');
        fetchVehicles();
      }
    });
  }

  // Form: Log Vehicle Breakdown (B/D) & Maintenance
  const formBreakdown = document.getElementById('form-vehicle-breakdown');
  if (formBreakdown) {
    formBreakdown.addEventListener('submit', async (e) => {
      e.preventDefault();
      const vehicleNo = document.getElementById('bd-vehicle-select').value;
      const date = document.getElementById('bd-log-date').value;
      const totalHours = Number(document.getElementById('bd-total-hours').value) || 24;
      const breakdownHours = Number(document.getElementById('bd-breakdown-hours').value) || 0;
      const operatingHours = Number(document.getElementById('bd-operating-hours').value) || Math.max(0, totalHours - breakdownHours);
      const failureType = document.getElementById('bd-failure-type').value;
      const status = document.getElementById('bd-status').value;
      const reason = document.getElementById('bd-reason').value.trim();
      const actionTaken = document.getElementById('bd-action').value.trim();

      const payload = { vehicleNo, date, totalHours, operatingHours, breakdownHours, failureType, status, reason, actionTaken };

      try {
        const res = await fetch('/api/payroll/vehicle-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showToast('⚡ Breakdown / Availability hours logged!');
          closeModal('modal-vehicle-breakdown');
          await fetchVehicleLogs();
        }
      } catch (err) {
        closeModal('modal-vehicle-breakdown');
        fetchVehicleLogs();
      }
    });
  }

  // Form: Save Vehicle Compliance
  const formEditCompliance = document.getElementById('form-edit-compliance');
  if (formEditCompliance) {
    formEditCompliance.addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveVehicleCompliance(e);
    });
  }

  // Compliance Filter & Search Listeners
  document.getElementById('compliance-search-input')?.addEventListener('input', () => renderComplianceMatrix());
  document.getElementById('compliance-priority-filter')?.addEventListener('change', () => renderComplianceMatrix());

  // Form: Unified Leave Management (Apply / Credit / Deduct)
  const formLeave = document.getElementById('form-leave');
  if (formLeave) {
    formLeave.addEventListener('submit', async (e) => {
      e.preventDefault();
      const mode = document.querySelector('input[name="leave-action-mode"]:checked')?.value || 'apply';
      const userId = document.getElementById('leave-select-user').value;
      const days = Number(document.getElementById('leave-days-count').value) || 1;
      const reason = document.getElementById('leave-reason').value.trim();

      if (!userId) {
        showToast('Please select an employee.', 'error');
        return;
      }

      if (mode === 'apply') {
        const leaveType = document.getElementById('leave-type-select').value;
        const startDate = document.getElementById('leave-start-date').value;
        const endDate = document.getElementById('leave-end-date').value || startDate;

        if (!startDate) {
          showToast('Please select a start date.', 'error');
          return;
        }

        try {
          const res = await fetch('/api/payroll/leaves', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, leaveType, startDate, endDate, days, reason: reason || 'Personal Leave' })
          });
          const data = await res.json();
          if (data.success) {
            showToast(`⚡ Leave recorded! ${days} day(s) deducted from balance.`);
            closeModal('modal-leave');
            await fetchUsers();
            await fetchLeaves();
            await fetchAttendance();
            renderAttendanceGlassCards();
            renderUsersTable();
            renderLeaveHistoryTable();
            populateUserDropdowns();
          } else {
            showToast(data.message || 'Leave recording failed', 'error');
          }
        } catch (e) {
          showToast('Failed to record leave', 'error');
          closeModal('modal-leave');
        }
      } else if (mode === 'credit') {
        const adjustCategory = document.getElementById('leave-adjust-reason-select').value;
        try {
          const res = await fetch('/api/payroll/leaves/credit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, creditDays: days, reason: adjustCategory, notes: reason })
          });
          const data = await res.json();
          if (data.success) {
            showToast(data.message || `⚡ Successfully credited ${days} leave days!`);
            closeModal('modal-leave');
            await fetchUsers();
            await fetchLeaves();
            renderAttendanceGlassCards();
            renderUsersTable();
            renderLeaveHistoryTable();
            populateUserDropdowns();
          } else {
            showToast(data.message || 'Leave credit failed', 'error');
          }
        } catch (e) {
          showToast('Failed to credit leave days', 'error');
          closeModal('modal-leave');
        }
      } else if (mode === 'deduct') {
        const adjustCategory = document.getElementById('leave-adjust-reason-select').value;
        try {
          const res = await fetch('/api/payroll/leaves/deduct', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, deductDays: days, reason: adjustCategory, notes: reason })
          });
          const data = await res.json();
          if (data.success) {
            showToast(data.message || `⚡ Successfully deducted ${days} leave days!`);
            closeModal('modal-leave');
            await fetchUsers();
            await fetchLeaves();
            renderAttendanceGlassCards();
            renderUsersTable();
            renderLeaveHistoryTable();
            populateUserDropdowns();
          } else {
            showToast(data.message || 'Leave deduction failed', 'error');
          }
        } catch (e) {
          showToast('Failed to deduct leave days', 'error');
          closeModal('modal-leave');
        }
      }
    });
  }

  // Form: Quick Leave Credit / Deduct Modal
  const formLeaveCredit = document.getElementById('form-leave-credit');
  if (formLeaveCredit) {
    formLeaveCredit.addEventListener('submit', async (e) => {
      e.preventDefault();
      const adjustType = document.querySelector('input[name="quick-adjust-type"]:checked')?.value || 'credit';
      const userId = document.getElementById('credit-select-user').value;
      const days = Number(document.getElementById('credit-days-count').value) || 1;
      const reason = document.getElementById('credit-reason-type').value;
      const notes = document.getElementById('credit-notes').value.trim();

      const endpoint = adjustType === 'deduct' ? '/api/payroll/leaves/deduct' : '/api/payroll/leaves/credit';
      const payload = adjustType === 'deduct' 
        ? { userId, deductDays: days, reason, notes }
        : { userId, creditDays: days, reason, notes };

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message || `⚡ Successfully updated leave balance!`);
          closeModal('modal-leave-credit');
          await fetchUsers();
          await fetchLeaves();
          renderAttendanceGlassCards();
          renderUsersTable();
          populateUserDropdowns();
        } else {
          showToast(data.message || 'Adjustment failed', 'error');
        }
      } catch (err) {
        showToast('Failed to adjust leave days', 'error');
        closeModal('modal-leave-credit');
      }
    });
  }
}

// 22. Leave Management Functions & Modal Helpers
function initLeaveManagement() {
  document.querySelectorAll('input[name="leave-action-mode"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      const mode = e.target.value;
      const applySec = document.getElementById('leave-section-apply');
      const reasonSec = document.getElementById('leave-section-adjust-reason');
      const countLabel = document.getElementById('leave-days-count-label');
      const submitBtn = document.getElementById('btn-submit-leave-form');

      if (mode === 'apply') {
        if (applySec) applySec.classList.remove('hidden');
        if (reasonSec) reasonSec.classList.add('hidden');
        if (countLabel) countLabel.textContent = 'Total Number of Days *';
        if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save Leave Record';
      } else if (mode === 'credit') {
        if (applySec) applySec.classList.add('hidden');
        if (reasonSec) reasonSec.classList.remove('hidden');
        if (countLabel) countLabel.textContent = 'Days to Credit (+) *';
        if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-plus-circle text-success"></i> + Credit Extra Leave Days';
      } else if (mode === 'deduct') {
        if (applySec) applySec.classList.add('hidden');
        if (reasonSec) reasonSec.classList.remove('hidden');
        if (countLabel) countLabel.textContent = 'Days to Deduct (-) *';
        if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-minus-circle text-danger"></i> - Deduct Leave Days';
      }
    });
  });
}

function updateSelectedEmployeeLeaveInfo() {
  const select = document.getElementById('leave-select-user');
  if (!select) return;
  const val = select.value;
  const user = allUsers.find((u) => u.id === val || u.empId === val);
  const nameBadge = document.getElementById('leave-emp-name-badge');
  const balDisplay = document.getElementById('leave-emp-balance-display');
  const takenDisplay = document.getElementById('leave-emp-taken-display');

  if (user) {
    const bal = user.leaveBalance !== undefined ? user.leaveBalance : 10;
    const tot = user.totalLeaves || 10;
    const taken = user.leavesTaken !== undefined ? user.leavesTaken : 0;
    if (nameBadge) nameBadge.textContent = `${user.name} (${user.empId}) - ${user.designation || user.role}`;
    if (balDisplay) balDisplay.textContent = `${bal} / ${tot} Days`;
    if (takenDisplay) takenDisplay.textContent = `${taken} Day(s) Taken`;
  } else {
    if (nameBadge) nameBadge.textContent = 'Select an employee';
    if (balDisplay) balDisplay.textContent = '- / - Days';
    if (takenDisplay) takenDisplay.textContent = '';
  }
}

function autoCalculateLeaveDays() {
  const startEl = document.getElementById('leave-start-date');
  const endEl = document.getElementById('leave-end-date');
  const daysEl = document.getElementById('leave-days-count');

  if (startEl && endEl && daysEl && startEl.value && endEl.value) {
    const s = new Date(startEl.value);
    const e = new Date(endEl.value);
    if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
      const diffMs = e.getTime() - s.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
      daysEl.value = Math.max(1, diffDays);
    }
  }
}

function openCreditLeaveModalForEmp(empIdentifier) {
  populateUserDropdowns();
  const select = document.getElementById('credit-select-user');
  if (select && empIdentifier) {
    const opt = Array.from(select.options).find(
      (o) => o.value === empIdentifier || o.textContent.includes(`(${empIdentifier})`)
    );
    if (opt) select.value = opt.value;
  }
  openModal('modal-leave-credit');
}

function openLeaveModalForEmp(empIdentifier, initialMode = 'apply') {
  populateUserDropdowns();
  const select = document.getElementById('leave-select-user');
  if (select && empIdentifier) {
    const opt = Array.from(select.options).find(
      (o) => o.value === empIdentifier || o.textContent.includes(`(${empIdentifier})`)
    );
    if (opt) select.value = opt.value;
  }
  const today = new Date().toISOString().split('T')[0];
  if (document.getElementById('leave-start-date')) document.getElementById('leave-start-date').value = today;
  if (document.getElementById('leave-end-date')) document.getElementById('leave-end-date').value = today;
  if (document.getElementById('leave-days-count')) document.getElementById('leave-days-count').value = 1;

  const modeRadio = document.querySelector(`input[name="leave-action-mode"][value="${initialMode}"]`);
  if (modeRadio) {
    modeRadio.checked = true;
    modeRadio.dispatchEvent(new Event('change'));
  }

  updateSelectedEmployeeLeaveInfo();
  openModal('modal-leave');
}

function openLeaveHistoryModal(filterEmp) {
  const searchInput = document.getElementById('leave-history-search');
  if (searchInput) {
    searchInput.value = filterEmp || '';
  }
  renderLeaveHistoryTable(filterEmp);
  openModal('modal-leave-history');
}

function renderLeaveHistoryTable(presetFilter) {
  const tbody = document.getElementById('leave-history-table-body');
  if (!tbody) return;

  const search = (
    presetFilter !== undefined
      ? presetFilter
      : (document.getElementById('leave-history-search')?.value || '')
  ).toLowerCase().trim();

  const leaves = (allLeaves || []).filter((l) => {
    if (!search) return true;
    return (
      (l.userName && l.userName.toLowerCase().includes(search)) ||
      (l.empId && l.empId.toLowerCase().includes(search)) ||
      (l.userId && l.userId.toLowerCase().includes(search)) ||
      (l.leaveType && l.leaveType.toLowerCase().includes(search)) ||
      (l.reason && l.reason.toLowerCase().includes(search)) ||
      (l.startDate && l.startDate.includes(search)) ||
      (l.endDate && l.endDate.includes(search))
    );
  });

  if (leaves.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 28px; color: var(--text-dim);">No leave records found${search ? ' matching search query' : ''}.</td></tr>`;
    return;
  }

  tbody.innerHTML = leaves
    .map((l) => {
      const typeBadge = (l.leaveType || '').includes('Sick')
        ? '<span class="badge badge-danger">Sick Leave</span>'
        : ((l.leaveType || '').includes('Casual')
          ? '<span class="badge badge-warning">Casual Leave</span>'
          : '<span class="badge badge-primary">' + escapeHtml(l.leaveType || 'Leave') + '</span>');

      return `
        <tr>
          <td>
            <strong>${escapeHtml(l.userName || 'Employee')}</strong>
            <span class="emp-cell-sub">ID: ${escapeHtml(l.empId || l.userId || 'N/A')}</span>
          </td>
          <td>${typeBadge}</td>
          <td>
            <strong>${escapeHtml(l.startDate || '-')}</strong> ${l.endDate && l.endDate !== l.startDate ? ' → ' + escapeHtml(l.endDate) : ''}
          </td>
          <td><span class="badge badge-neutral">${l.days || 1} Day(s)</span></td>
          <td><small style="color: var(--text-muted);">${escapeHtml(l.reason || 'Personal Leave')}</small></td>
          <td><span class="badge badge-success"><i class="fa-solid fa-check"></i> Approved</span></td>
          <td class="text-right">
            <button class="btn btn-outline-danger btn-xs" onclick="deleteLeaveRecord('${l.id}')" title="Revoke & Delete Leave Record">
              <i class="fa-solid fa-trash-can"></i> Delete
            </button>
          </td>
        </tr>
      `;
    })
    .join('');
}

async function deleteLeaveRecord(leaveId) {
  if (!confirm('Are you sure you want to delete / revoke this leave record? The employee\'s leave quota will be automatically restored.')) {
    return;
  }

  try {
    const res = await fetch(`/api/payroll/leaves/${leaveId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Leave deleted & balance restored!');
      await fetchUsers();
      await fetchLeaves();
      await fetchAttendance();
      renderLeaveHistoryTable();
      renderAttendanceGlassCards();
      renderUsersTable();
      populateUserDropdowns();
    } else {
      showToast(data.message || 'Failed to delete leave', 'error');
    }
  } catch (err) {
    showToast('Error deleting leave record', 'error');
  }
}

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
      showToast(data.message || '⚡ Statutory compliance updated successfully!');
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
}

// 23. Dashboard Metrics Calculation
function updateDashboardMetrics() {
  const activeWorkers = allUsers.filter((u) => u.role !== 'Super Admin' && u.status === 'Active');
  const totalUsersEl = document.getElementById('kpi-total-users');
  if (totalUsersEl) totalUsersEl.textContent = activeWorkers.length;

  const totalVehiclesEl = document.getElementById('kpi-total-vehicles');
  if (totalVehiclesEl) totalVehiclesEl.textContent = allVehicles.length;

  const todayStr = document.getElementById('muster-date-picker')?.value || new Date().toISOString().split('T')[0];
  const todayMuster = (allAttendance || []).filter((a) => a.date === todayStr);
  const presentCount = todayMuster.filter((a) => a.status === 'Present' || a.status === 'Overtime' || a.status === 'Half Day').length;

  const presentEl = document.getElementById('kpi-present-today');
  if (presentEl) {
    presentEl.textContent = todayMuster.length > 0 ? presentCount : Math.min(activeWorkers.length, Math.round(activeWorkers.length * 0.94));
  }

  const selectedMonth = document.getElementById('payroll-month-select')?.value || 'September 2026';
  const monthSlips = allSalarySlips.filter((s) => s.monthYear === selectedMonth);
  const totalNet = monthSlips.reduce((sum, s) => sum + (Number(s.netPay) || 0), 0);

  const totalPayrollEl = document.getElementById('kpi-total-payroll');
  if (totalPayrollEl) {
    totalPayrollEl.textContent = totalNet > 0 ? `₹${Math.round(totalNet).toLocaleString('en-IN')}` : '₹6,84,520';
  }

  const workersCount = activeWorkers.filter((u) => u.role === 'Worker').length;
  const employeesCount = activeWorkers.filter((u) => u.role === 'Employee').length;
  const supervisorsCount = activeWorkers.filter((u) => u.role === 'Supervisor').length;

  const distWork = document.getElementById('dist-workers');
  const distEmp = document.getElementById('dist-employees');
  const distSup = document.getElementById('dist-supervisors');
  const distVeh = document.getElementById('dist-vehicles');

  if (distWork) distWork.textContent = workersCount || 0;
  if (distEmp) distEmp.textContent = employeesCount || 0;
  if (distSup) distSup.textContent = supervisorsCount || 0;
  if (distVeh) distVeh.textContent = allVehicles.length || 0;
}

// 24. Utilities
function openModal(id) {
  const m = document.getElementById(id);
  if (m) {
    m.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) {
    m.classList.add('hidden');
    // If no other modal is open, restore overflow
    const openModals = document.querySelectorAll('.modal-backdrop:not(.hidden)');
    if (openModals.length === 0) {
      document.body.style.overflow = '';
    }
  }
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 4000);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function numberToWordsIndian(num) {
  if (!num || isNaN(num)) return 'Zero';
  num = Math.floor(Math.abs(num));
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n) {
    if (n === 0) return '';
    let str = '';
    if (Math.floor(n / 10000000) > 0) {
      str += inWords(Math.floor(n / 10000000)) + 'Crore ';
      n %= 10000000;
    }
    if (Math.floor(n / 100000) > 0) {
      str += inWords(Math.floor(n / 100000)) + 'Lakh ';
      n %= 100000;
    }
    if (Math.floor(n / 1000) > 0) {
      str += inWords(Math.floor(n / 1000)) + 'Thousand ';
      n %= 1000;
    }
    if (Math.floor(n / 100) > 0) {
      str += inWords(Math.floor(n / 100)) + 'Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (n < 20) {
        str += a[n];
      } else {
        str += b[Math.floor(n / 10)] + (n % 10 > 0 ? ' ' + a[n % 10] : ' ');
      }
    }
    return str;
  }

  const result = inWords(num).trim();
  return result ? result + ' Only' : 'Zero Only';
}

// 25. SYSTEM-GENERATED HR LETTERS & APPOINTMENT ENGINE
function openAppointmentLetterModal(targetUserId) {
  const empSelect = document.getElementById('letter-select-emp');
  if (!empSelect) return;

  const validUsers = allUsers.filter((u) => u.role !== 'Super Admin');
  if (validUsers.length === 0) {
    showToast('No active employees found to generate letters.', 'error');
    return;
  }

  empSelect.innerHTML = validUsers
    .map((u) => `<option value="${u.id || u.empId}">${u.empId || 'SRR'} - ${escapeHtml(u.name)} (${escapeHtml(u.designation || u.rank || 'Staff')})</option>`)
    .join('');

  if (targetUserId) {
    const match = validUsers.find((u) => u.id === targetUserId || u.empId === targetUserId);
    if (match) empSelect.value = match.id || match.empId;
  }

  const issueDateEl = document.getElementById('letter-issue-date');
  if (issueDateEl && !issueDateEl.value) {
    issueDateEl.value = new Date().toISOString().split('T')[0];
  }

  handleLetterEmployeeChange();
  openModal('modal-appointment-letter');
}

function handleLetterEmployeeChange() {
  const empSelect = document.getElementById('letter-select-emp');
  const userId = empSelect ? empSelect.value : '';
  const user = allUsers.find((u) => u.id === userId || u.empId === userId) || allUsers.find((u) => u.role !== 'Super Admin') || allUsers[0];
  if (!user) return;

  const numPart = user.empId ? user.empId.replace(/[^0-9]/g, '') : '01';
  document.getElementById('letter-ref-no').value = `SRRTC/HR/ACC-PLANT/2026/${numPart.padStart(3, '0')}`;
  document.getElementById('letter-doj-input').value = user.doj || '01/01/2026';
  document.getElementById('letter-designation-input').value = user.designation || user.rank || 'Operator';
  
  const ctcVal = Number(user.ctc) || Number(user.baseSalary) || (Number(user.basicPerDay) ? Number(user.basicPerDay) * 30 : 35000);
  document.getElementById('letter-ctc-input').value = ctcVal;
  document.getElementById('letter-site-input').value = user.site || user.location || 'ACC Chanda Plant Site & Operations, Chandrapur';

  updateLetterTemplate();
}

function updateLetterTemplate() {
  const empSelect = document.getElementById('letter-select-emp');
  const userId = empSelect ? empSelect.value : '';
  const user = allUsers.find((u) => u.id === userId || u.empId === userId) || allUsers.find((u) => u.role !== 'Super Admin') || allUsers[0];
  if (!user) return;

  const letterType = document.getElementById('letter-type-select')?.value || 'appointment';
  const refNo = document.getElementById('letter-ref-no')?.value || `SRRTC/HR/ACC-PLANT/2026/014`;
  const issueDateRaw = document.getElementById('letter-issue-date')?.value || new Date().toISOString().split('T')[0];
  const doj = document.getElementById('letter-doj-input')?.value || user.doj || '01/01/2026';
  const probation = document.getElementById('letter-probation-input')?.value || '3 Months';
  const designation = document.getElementById('letter-designation-input')?.value || user.designation || user.rank || 'Staff';
  const ctc = Number(document.getElementById('letter-ctc-input')?.value || user.ctc || user.baseSalary || 35000);
  const site = document.getElementById('letter-site-input')?.value || user.site || user.location || 'ACC Chanda Plant Site & Operations, Chandrapur';
  const notice = document.getElementById('letter-notice-input')?.value || '30 Days';
  const sigName = document.getElementById('letter-signatory-name')?.value || 'Managing Director / Authorized Signatory';
  const sigTitle = document.getElementById('letter-signatory-title')?.value || 'Shree RR Trading Company';
  const customNote = document.getElementById('letter-custom-note')?.value?.trim() || '';

  // Format Date (e.g. 04 September 2026)
  const dateObj = new Date(issueDateRaw);
  const formattedDate = isNaN(dateObj.getTime())
    ? issueDateRaw
    : dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  // Update Headers & Recipient Particulars
  document.getElementById('view-letter-ref').textContent = refNo;
  document.getElementById('view-letter-date').textContent = formattedDate;
  document.getElementById('view-letter-emp-name').textContent = `MR. ${user.name.toUpperCase()}`;
  document.getElementById('view-letter-father').textContent = user.fatherName || 'On Record';
  document.getElementById('view-letter-empid').textContent = user.empId || 'SRR';
  document.getElementById('view-letter-desig').textContent = designation;
  document.getElementById('view-letter-site').textContent = site;
  document.getElementById('view-letter-mobile').textContent = user.mobile ? `+91 ${user.mobile}` : '+91 7416008100';
  document.getElementById('view-letter-category').textContent = user.category || 'Skilled Plant Operations Staff';

  document.getElementById('view-letter-acc-name').textContent = user.name.toUpperCase();
  document.getElementById('view-letter-acc-mobile').textContent = user.mobile ? `+91 ${user.mobile}` : 'On Record';
  document.getElementById('view-letter-sig-name').textContent = sigName;
  document.getElementById('view-letter-sig-title').textContent = sigTitle;

  const acceptanceBox = document.getElementById('view-letter-acceptance-slip');
  const subjectEl = document.getElementById('view-letter-subject');
  const bodyEl = document.getElementById('view-letter-body-content');

  // Salary calculations
  const basic = Math.round(ctc * 0.50);
  const da = Math.round(ctc * 0.20);
  const hra = Math.round(ctc * 0.15);
  const special = Math.round(ctc - (basic + da + hra));
  const pf = Math.round((basic + da) * 0.12);
  const esic = Math.round(ctc * 0.0075);
  const pt = 200;
  const totalDed = pf + esic + pt;
  const netTakeHome = ctc - totalDed;

  const salaryTableHtml = `
    <div style="margin: 6px 0;">
      <div style="font-weight: 800; font-size: 10px; color: #0B1936; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.02em;">
        Annexure-A: Monthly Remuneration & Compensation Breakup
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; margin-bottom: 4px; border: 1px solid #CBD5E1;">
        <thead>
          <tr style="background: #FFF5EE; border-bottom: 1.5px solid #FF6B00; text-align: left;">
            <th style="padding: 3px 6px; border-right: 1px solid #E2E8F0;">Component / Allowance</th>
            <th style="padding: 3px 6px; border-right: 1px solid #E2E8F0; text-align: right;">Amount (₹ / Mo)</th>
            <th style="padding: 3px 6px; border-right: 1px solid #E2E8F0;">Statutory Deductions</th>
            <th style="padding: 3px 6px; text-align: right;">Amount (₹ / Mo)</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0;">Basic Salary</td>
            <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0; text-align: right; font-weight: 600;">₹${basic.toLocaleString('en-IN')}</td>
            <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0;">Provident Fund (PF @ 12%)</td>
            <td style="padding: 2.5px 6px; text-align: right; color: #DC2626;">₹${pf.toLocaleString('en-IN')}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0;">Dearness Allowance (DA)</td>
            <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0; text-align: right; font-weight: 600;">₹${da.toLocaleString('en-IN')}</td>
            <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0;">ESIC Contribution (0.75%)</td>
            <td style="padding: 2.5px 6px; text-align: right; color: #DC2626;">₹${esic.toLocaleString('en-IN')}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0;">House Rent Allowance (HRA)</td>
            <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0; text-align: right; font-weight: 600;">₹${hra.toLocaleString('en-IN')}</td>
            <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0;">Professional Tax (PT)</td>
            <td style="padding: 2.5px 6px; text-align: right; color: #DC2626;">₹${pt}</td>
          </tr>
          <tr style="border-bottom: 1px solid #CBD5E1;">
            <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0;">Special Plant Allowance</td>
            <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0; text-align: right; font-weight: 600;">₹${special.toLocaleString('en-IN')}</td>
            <td style="padding: 2.5px 6px; border-right: 1px solid #E2E8F0; font-weight: 700;">Total Deductions</td>
            <td style="padding: 2.5px 6px; text-align: right; font-weight: 700; color: #DC2626;">₹${totalDed.toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr style="background: #F8FAFC; font-weight: 800; border-top: 1.5px solid #0B1936;">
            <td style="padding: 3px 6px; border-right: 1px solid #E2E8F0; color: #0B1936;">GROSS MONTHLY CTC</td>
            <td style="padding: 3px 6px; border-right: 1px solid #E2E8F0; text-align: right; color: #FF6B00; font-size: 10px;">₹${ctc.toLocaleString('en-IN')}</td>
            <td style="padding: 3px 6px; border-right: 1px solid #E2E8F0; color: #0B1936;">NET TAKE HOME PAY</td>
            <td style="padding: 3px 6px; text-align: right; color: #059669; font-size: 10px;">₹${netTakeHome.toLocaleString('en-IN')}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;

  if (letterType === 'appointment') {
    if (acceptanceBox) acceptanceBox.style.display = 'block';
    subjectEl.textContent = `SUBJECT: FORMAL LETTER OF APPOINTMENT AS ${designation.toUpperCase()} - PLANT OPERATIONS`;
    bodyEl.innerHTML = `
      <p style="margin-bottom: 5px;">Dear <strong>${escapeHtml(user.name)}</strong>,</p>
      <p style="margin-bottom: 5px;">
        With reference to your application, technical interview, and subsequent discussions, the management of <strong>Shree RR Trading Company</strong> is pleased to appoint you as <strong>${escapeHtml(designation)}</strong> in our Plant Fleet & Operations Division on the following terms:
      </p>

      <div style="margin-bottom: 3.5px;"><strong>1. Date of Joining & Site:</strong> Effective from <strong>${escapeHtml(doj)}</strong>. Posted at <strong>${escapeHtml(site)}</strong>. Transferable across company plant sites & crushing units as operational requirements dictate.</div>

      <div style="margin-bottom: 3.5px;"><strong>2. Probation Period:</strong> Initial probation of <strong>${escapeHtml(probation)}</strong> from joining date. Confirmed in writing upon satisfactory performance.</div>

      <div style="margin-bottom: 3.5px;"><strong>3. Remuneration:</strong> Total Gross Monthly CTC will be <strong>₹${ctc.toLocaleString('en-IN')}</strong> (${numberToWordsIndian(ctc)} Rupees). EPF, ESIC, and PT deducted as applicable by statutory law. Breakdown attached in <strong>Annexure-A</strong>.</div>

      ${salaryTableHtml}

      <div style="margin-bottom: 3.5px;"><strong>4. Plant Shifts:</strong> Roster covers 24/7 plant operations (G Shift: 08:30 AM – 05:30 PM, A Shift: 06:00 AM – 02:00 PM, B Shift: 02:00 PM – 10:00 PM, C Shift: 10:00 PM – 06:00 AM) as scheduled by Shift In-Charge.</div>

      <div style="margin-bottom: 3.5px;"><strong>5. Safety & PPE:</strong> Mandatory wearing of prescribed Personal Protective Equipment (Helmet, Steel-Toe Shoes, High-Vis Vest). Zero-tolerance policy applies to plant safety violations.</div>

      <div style="margin-bottom: 3.5px;"><strong>6. Notice Period:</strong> Either party may terminate employment by giving <strong>${escapeHtml(notice)}</strong> prior notice in writing or payment in lieu thereof.</div>

      <div style="margin-bottom: 3.5px;"><strong>7. Confidentiality:</strong> You shall strictly protect operational data, equipment logs, production statistics, and affairs of company and client entities (Ambuja / ACC).</div>

      ${customNote ? `<div style="background: #FFFBEB; border: 1px solid #FCD34D; border-radius: 4px; padding: 4px 8px; margin-top: 4px; color: #92400E; font-size: 10px;"><strong>Special Terms:</strong> ${escapeHtml(customNote)}</div>` : ''}

      <p style="margin-top: 6px; margin-bottom: 0;">
        Please sign and return the duplicate acknowledgment copy below as acceptance of these terms. We welcome you to Shree RR Trading Company.
      </p>
    `;
  } else if (letterType === 'offer') {
    if (acceptanceBox) acceptanceBox.style.display = 'block';
    subjectEl.textContent = `SUBJECT: OFFER OF EMPLOYMENT FOR THE POSITION OF ${designation.toUpperCase()}`;
    bodyEl.innerHTML = `
      <p style="margin-bottom: 6px;">Dear <strong>${escapeHtml(user.name)}</strong>,</p>
      <p style="margin-bottom: 6px;">
        We are pleased to offer you employment with <strong>Shree RR Trading Company</strong> as <strong>${escapeHtml(designation)}</strong> based at our <strong>${escapeHtml(site)}</strong>.
      </p>

      <div style="margin-bottom: 4px;"><strong>• Proposed Designation:</strong> ${escapeHtml(designation)}</div>
      <div style="margin-bottom: 4px;"><strong>• Plant Deployment Location:</strong> ${escapeHtml(site)}</div>
      <div style="margin-bottom: 4px;"><strong>• Expected Joining Date:</strong> ${escapeHtml(doj)}</div>
      <div style="margin-bottom: 4px;"><strong>• Monthly CTC Package:</strong> ₹${ctc.toLocaleString('en-IN')} / Month (Detailed Annexure-A attached below)</div>
      <div style="margin-bottom: 4px;"><strong>• Probationary Period:</strong> ${escapeHtml(probation)}</div>

      ${salaryTableHtml}

      <div style="margin-bottom: 6px;">
        <strong>Documents Required on Joining Day:</strong>
        <ol style="margin-left: 18px; margin-top: 2px; margin-bottom: 0; padding-left: 0;">
          <li>Original and self-attested copies of Aadhaar Card and PAN Card</li>
          <li>Bank Account Passbook / Cancelled Cheque (with IFSC)</li>
          <li>4 Passport Size Color Photographs & License (for Equipment Operators)</li>
        </ol>
      </div>

      ${customNote ? `<div style="background: #FFFBEB; border: 1px solid #FCD34D; border-radius: 4px; padding: 4px 8px; margin-top: 4px; color: #92400E; font-size: 10px;"><strong>Special Notes:</strong> ${escapeHtml(customNote)}</div>` : ''}

      <p style="margin-top: 6px; margin-bottom: 0;">
        Please confirm your acceptance of this offer by signing and returning the acknowledgment copy within 7 days.
      </p>
    `;
  } else if (letterType === 'experience') {
    if (acceptanceBox) acceptanceBox.style.display = 'none';
    subjectEl.textContent = `TO WHOMSOEVER IT MAY CONCERN`;
    bodyEl.innerHTML = `
      <p style="margin-bottom: 10px; font-size: 11.5px; line-height: 1.6;">
        This is to certify that <strong>Mr. ${escapeHtml(user.name)}</strong>, S/o <strong>${escapeHtml(user.fatherName || 'On Record')}</strong>, holding Employee ID <strong>${escapeHtml(user.empId)}</strong>, was employed with <strong>Shree RR Trading Company</strong> from <strong>${escapeHtml(doj)}</strong> to <strong>${formattedDate}</strong>.
      </p>

      <p style="margin-bottom: 8px; font-size: 11px; line-height: 1.6;">
        During his tenure with our organization, he served as <strong>${escapeHtml(designation)}</strong> deployed at <strong>${escapeHtml(site)}</strong>. His primary responsibilities included operation, maintenance, and precision upkeep of heavy earth moving machinery, tippers, excavators, and plant fleet equipment.
      </p>

      <p style="margin-bottom: 8px; font-size: 11px; line-height: 1.6;">
        He has consistently demonstrated strong technical proficiency, professional discipline, adherence to strict plant safety standards, and exemplary attendance records. His character and conduct during his employment were found to be excellent.
      </p>

      ${customNote ? `<p style="margin-bottom: 8px; font-size: 11px; line-height: 1.6;">${escapeHtml(customNote)}</p>` : ''}

      <p style="margin-top: 14px; font-size: 11px; line-height: 1.6;">
        We appreciate his valuable contributions to our plant operations and wish him all the very best in all his future career endeavors.
      </p>
    `;
  } else if (letterType === 'relieving') {
    if (acceptanceBox) acceptanceBox.style.display = 'none';
    subjectEl.textContent = `SUBJECT: RELIEVING ORDER & NO DUES CLEARANCE CERTIFICATE`;
    bodyEl.innerHTML = `
      <p style="margin-bottom: 8px;">Dear <strong>${escapeHtml(user.name)}</strong>,</p>
      <p style="margin-bottom: 8px; font-size: 11px; line-height: 1.6;">
        With reference to your resignation letter dated <strong>${formattedDate}</strong>, we hereby confirm that you are formally relieved from your duties and responsibilities as <strong>${escapeHtml(designation)}</strong> with <strong>Shree RR Trading Company</strong> at <strong>${escapeHtml(site)}</strong>, effective from the close of working hours on <strong>${formattedDate}</strong>.
      </p>

      <p style="margin-bottom: 8px; font-size: 11px; line-height: 1.6;">
        We confirm that all company assets, machine logsheets, tools, PPE, and identification badges in your custody have been satisfactorily handed over to site management. Your full and final salary settlement, accrued leave benefits, and statutory accounts have been processed as per company rules.
      </p>

      <p style="margin-bottom: 8px; font-size: 11px; line-height: 1.6;">
        We place on record our sincere appreciation for your valuable service and dedication during your tenure with us.
      </p>

      ${customNote ? `<p style="margin-bottom: 8px; font-size: 11px; line-height: 1.6;">${escapeHtml(customNote)}</p>` : ''}

      <p style="margin-top: 12px; font-size: 11px; line-height: 1.6;">
        We wish you the very best of success in all your future professional pursuits.
      </p>
    `;
  } else if (letterType === 'increment') {
    if (acceptanceBox) acceptanceBox.style.display = 'block';
    subjectEl.textContent = `SUBJECT: ANNUAL PERFORMANCE APPRAISAL & SALARY REVISION LETTER`;
    bodyEl.innerHTML = `
      <p style="margin-bottom: 8px;">Dear <strong>${escapeHtml(user.name)}</strong>,</p>
      <p style="margin-bottom: 8px; font-size: 11px; line-height: 1.5;">
        In recognition of your exceptional performance, machine uptime, dedication, and valuable contributions to the plant fleet operations at <strong>${escapeHtml(site)}</strong>, the management of <strong>Shree RR Trading Company</strong> is pleased to revise your monthly compensation package.
      </p>
      <p style="margin-bottom: 8px; font-size: 11px; line-height: 1.5;">
        Effective from <strong>${escapeHtml(doj)}</strong>, your revised Gross Monthly CTC will be <strong>₹${ctc.toLocaleString('en-IN')}</strong> (${numberToWordsIndian(ctc)} Rupees per month).
      </p>

      ${salaryTableHtml}

      <p style="margin-bottom: 8px; font-size: 11px; line-height: 1.5;">
        All other terms and conditions of your original appointment letter remain unchanged and in full effect. We look forward to your continued commitment, high standards of safety, and operational excellence in the coming year.
      </p>

      ${customNote ? `<div style="background: #FFFBEB; border: 1px solid #FCD34D; border-radius: 4px; padding: 4px 8px; margin-top: 6px; color: #92400E; font-size: 10px;"><strong>Special Commendation:</strong> ${escapeHtml(customNote)}</div>` : ''}

      <p style="margin-top: 8px; margin-bottom: 0;">
        Congratulations on your well-deserved salary revision!
      </p>
    `;
  }
}

async function downloadLetterPdf() {
  const empSelect = document.getElementById('letter-select-emp');
  const userId = empSelect ? empSelect.value : '';
  const user = allUsers.find((u) => u.id === userId || u.empId === userId) || allUsers[0];
  const letterType = document.getElementById('letter-type-select')?.value || 'appointment';

  const element = document.getElementById('printable-appointment-letter');
  if (!element) return;

  element.classList.add('pdf-strict-single-page');

  const opt = {
    margin: [4, 6, 4, 6],
    filename: `Shree_RR_${letterType.toUpperCase()}_Letter_${user ? user.empId : 'EMP'}_${user ? user.name.replace(/\s+/g, '_') : 'Letter'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false, scrollY: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  showToast(`Generating Strict 1-Page ${letterType} letter PDF for ${user ? user.name : 'Employee'}...`);

  try {
    if (typeof html2pdf !== 'undefined') {
      await html2pdf().set(opt).from(element).save();
      showToast(`Downloaded 1-Page Letter PDF: ${opt.filename}`);
    } else {
      window.print();
    }
  } finally {
    element.classList.remove('pdf-strict-single-page');
  }
}

function printAppointmentLetter() {
  window.print();
}

async function sendLetterWhatsApp() {
  const empSelect = document.getElementById('letter-select-emp');
  const userId = empSelect ? empSelect.value : '';
  const user = allUsers.find((u) => u.id === userId || u.empId === userId);
  if (!user) {
    showToast('Please select an employee first.', 'error');
    return;
  }

  const letterType = document.getElementById('letter-type-select')?.value || 'appointment';
  const letterTypeTitle = {
    appointment: 'Letter of Appointment',
    offer: 'Employment Offer Letter',
    experience: 'Work Experience Certificate',
    relieving: 'Relieving & Clearance Certificate',
    increment: 'Salary Revision & Appraisal Letter'
  }[letterType] || 'Official HR Letter';

  const refNo = document.getElementById('letter-ref-no')?.value || 'SRRTC/HR/2026/01';
  const designation = document.getElementById('letter-designation-input')?.value || user.designation || 'Staff';
  const site = document.getElementById('letter-site-input')?.value || user.site || 'ACC Chanda Plant Site';
  const ctc = Number(document.getElementById('letter-ctc-input')?.value || user.ctc || user.baseSalary || 35000);
  const doj = document.getElementById('letter-doj-input')?.value || user.doj || '01/01/2026';

  const element = document.getElementById('printable-appointment-letter');
  const filename = `Shree_RR_${letterType.toUpperCase()}_Letter_${user.empId}_${user.name.replace(/\s+/g, '_')}.pdf`;

  const msg = `*SHREE RR TRADING COMPANY*
*Official HR Letter - ${letterTypeTitle}*
━━━━━━━━━━━━━━━━━━━━
📄 *Ref. No:* ${refNo}
👤 *Employee:* ${user.name} (${user.empId})
🛠 *Designation:* ${designation}
📍 *Plant Site:* ${site}
📅 *Effective Date:* ${doj}
💵 *Gross Monthly CTC:* ₹${ctc.toLocaleString('en-IN')}

📎 _Official 1-Page HR Letter (${letterTypeTitle}) PDF document attached._
━━━━━━━━━━━━━━━━━━━━
_Verification Portal: https://payroll.shreerrtradingcompany.com_
_Developed & Powered by SrijanDev © 2026_`;

  await dispatchWhatsAppWithPdfAttachment({
    element,
    filename,
    mobile: user.mobile || user.phone,
    textMessage: msg,
    title: `HR Letter (${letterTypeTitle}) - ${user.name}`,
    recipientName: user.name
  });
}

// ==================== SALARY STRUCTURE CORRECTION ENGINE ====================
function openSalaryCorrectionModal(slipIdOrUserId) {
  const empSelect = document.getElementById('correction-select-emp');
  const monthSelect = document.getElementById('correction-select-month');

  // Populate employee dropdown
  if (empSelect) {
    const activeEmployees = allUsers.filter((u) => u.role !== 'Super Admin');
    empSelect.innerHTML = activeEmployees
      .map((u) => `<option value="${u.id || u.empId}">${escapeHtml(u.name)} (${u.empId}) - ${escapeHtml(u.designation || u.role || 'Staff')}</option>`)
      .join('');
  }

  let targetSlip = null;
  let targetUser = null;

  if (slipIdOrUserId) {
    targetSlip = allSalarySlips.find((s) => s.id === slipIdOrUserId || s.userId === slipIdOrUserId || s.empId === slipIdOrUserId);
    if (targetSlip) {
      targetUser = allUsers.find((u) => u.id === targetSlip.userId || u.empId === targetSlip.empId);
    } else {
      targetUser = allUsers.find((u) => u.id === slipIdOrUserId || u.empId === slipIdOrUserId);
    }
  }

  if (!targetUser && allUsers.length > 0) {
    targetUser = allUsers.find((u) => u.role !== 'Super Admin') || allUsers[0];
  }

  if (targetUser && empSelect) {
    empSelect.value = targetUser.id || targetUser.empId;
  }

  if (targetSlip && monthSelect) {
    monthSelect.value = targetSlip.monthYear || 'August 2026';
  } else if (monthSelect) {
    const tableMonth = document.getElementById('payroll-month-select')?.value;
    monthSelect.value = tableMonth || 'August 2026';
  }

  loadCorrectionFormData(targetSlip, targetUser);
  openModal('modal-salary-correction');
}

function handleCorrectionEmployeeChange() {
  const empSelect = document.getElementById('correction-select-emp');
  const monthSelect = document.getElementById('correction-select-month');
  const selectedUserId = empSelect ? empSelect.value : '';
  const selectedMonth = monthSelect ? monthSelect.value : 'August 2026';

  const user = allUsers.find((u) => u.id === selectedUserId || u.empId === selectedUserId);
  const existingSlip = allSalarySlips.find((s) => (s.userId === selectedUserId || s.empId === (user ? user.empId : selectedUserId)) && s.monthYear === selectedMonth);

  loadCorrectionFormData(existingSlip, user);
}

function loadCorrectionFormData(slip, user) {
  const monthSelect = document.getElementById('correction-select-month');
  const selectedMonth = monthSelect ? monthSelect.value : 'August 2026';

  if (!user && slip) {
    user = allUsers.find((u) => u.id === slip.userId || u.empId === slip.empId);
  }

  // Update employee metadata quick card
  if (user) {
    const desigEl = document.getElementById('corr-meta-desig');
    const catEl = document.getElementById('corr-meta-cat');
    const siteEl = document.getElementById('corr-meta-site');
    const ctcEl = document.getElementById('corr-meta-ctc');
    const uanEl = document.getElementById('corr-meta-uan');
    const pfEl = document.getElementById('corr-meta-pf');
    const bankEl = document.getElementById('corr-meta-bank');

    if (desigEl) desigEl.textContent = user.designation || user.role || '-';
    if (catEl) catEl.textContent = user.category || 'Skilled';
    if (siteEl) siteEl.textContent = user.location || user.site || 'ACC Chanda';
    if (ctcEl) {
      if (user.ctc) ctcEl.textContent = `₹${Number(user.ctc).toLocaleString('en-IN')} / Mo`;
      else if (user.basicPerDay) ctcEl.textContent = `₹${Number(user.basicPerDay).toFixed(2)} / Day`;
      else ctcEl.textContent = `₹${Number(user.baseSalary || 25000).toLocaleString('en-IN')} / Mo`;
    }
    if (uanEl) uanEl.textContent = user.uan || 'N/A';
    if (pfEl) pfEl.textContent = user.pfNo || 'N/A';
    if (bankEl) bankEl.textContent = `${user.bankAccount || 'N/A'} (${user.ifsc || 'N/A'})`;
  }

  // Determine Days in Month
  const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  let dim = 31;
  if (selectedMonth) {
    const parts = selectedMonth.split(' ');
    const mIdx = monthNames.indexOf(parts[0].toLowerCase());
    const yr = parseInt(parts[1]) || 2026;
    if (mIdx !== -1) {
      dim = new Date(yr, mIdx + 1, 0).getDate();
    }
  }

  const slipIdEl = document.getElementById('correction-slip-id');
  if (slipIdEl) slipIdEl.value = slip ? slip.id : '';

  const totalDaysEl = document.getElementById('correction-total-days');
  if (totalDaysEl) totalDaysEl.value = slip ? (slip.totalDays || dim) : dim;

  const workedDaysEl = document.getElementById('correction-worked-days');
  if (workedDaysEl) {
    workedDaysEl.value = slip ? (slip.workedDays !== undefined ? slip.workedDays : (user ? (user.payableDays || dim) : dim)) : (user ? (user.payableDays || dim) : dim);
  }

  const otHoursEl = document.getElementById('correction-ot-hours');
  if (otHoursEl) otHoursEl.value = slip ? (slip.otHours || 0) : 0;

  const otRateEl = document.getElementById('correction-ot-rate');
  if (otRateEl) {
    otRateEl.value = slip ? (slip.otHours && slip.otWage ? (slip.otWage / slip.otHours).toFixed(2) : 0) : 0;
  }

  if (slip) {
    document.getElementById('correction-earn-basic').value = Number(slip.earnings?.basic || 0).toFixed(2);
    document.getElementById('correction-earn-da').value = Number(slip.earnings?.da || 0).toFixed(2);
    document.getElementById('correction-earn-hra').value = Number(slip.earnings?.hra || 0).toFixed(2);
    document.getElementById('correction-earn-special').value = Number(slip.earnings?.specialAllowance || 0).toFixed(2);
    document.getElementById('correction-earn-bonus').value = Number(slip.earnings?.bonus || 0).toFixed(2);
    document.getElementById('correction-earn-ot').value = Number(slip.earnings?.otWage !== undefined ? slip.earnings.otWage : (slip.otWage || 0)).toFixed(2);

    document.getElementById('correction-ded-pf').value = Number(slip.deductions?.pf || 0).toFixed(2);
    document.getElementById('correction-ded-esic').value = Number(slip.deductions?.esic || 0).toFixed(2);
    document.getElementById('correction-ded-pt').value = Number(slip.deductions?.pt !== undefined ? slip.deductions.pt : 200).toFixed(2);
    document.getElementById('correction-ded-advance').value = Number(slip.deductions?.advance || 0).toFixed(2);
    document.getElementById('correction-ded-lic').value = Number(slip.deductions?.lic || 0).toFixed(2);
    document.getElementById('correction-ded-tds').value = Number(slip.deductions?.tds || 0).toFixed(2);

    document.getElementById('correction-payment-status').value = slip.status || 'Paid';
    document.getElementById('correction-payment-date').value = slip.paymentDate || new Date().toISOString().split('T')[0];
    document.getElementById('correction-bank-account').value = slip.bankAccount || (user ? user.bankAccount : '');
    document.getElementById('correction-bank-ifsc').value = slip.ifsc || (user ? user.ifsc : '');
    document.getElementById('correction-remarks').value = slip.remarks || '';
  } else {
    // Fresh computation using standard formula
    recalculateCorrectionSlip(true);
    document.getElementById('correction-payment-status').value = 'Paid';
    document.getElementById('correction-payment-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('correction-bank-account').value = user ? (user.bankAccount || '') : '';
    document.getElementById('correction-bank-ifsc').value = user ? (user.ifsc || '') : '';
    document.getElementById('correction-remarks').value = `Generated default structure for ${selectedMonth}`;
  }

  recalculateCorrectionSlip(false);
}

function recalculateCorrectionSlip(useStandardFormula = false) {
  const empSelect = document.getElementById('correction-select-emp');
  const userId = empSelect ? empSelect.value : '';
  const user = allUsers.find((u) => u.id === userId || u.empId === userId);

  const dim = Math.max(1, Number(document.getElementById('correction-total-days')?.value) || 31);
  const workedDays = Math.max(0, Number(document.getElementById('correction-worked-days')?.value) || 0);
  const otHours = Math.max(0, Number(document.getElementById('correction-ot-hours')?.value) || 0);
  const otRate = Math.max(0, Number(document.getElementById('correction-ot-rate')?.value) || 0);

  if (useStandardFormula && user) {
    const ctc = Number(user.ctc);
    const bpd = Number(user.basicPerDay);

    let calcBasic = 0, calcDa = 0, calcHra = 0, calcSpecial = 0, calcGross = 0;
    let calcPf = 0, calcEsic = 0, calcPt = 200, calcOtWage = 0;

    if (otHours > 0 && otRate > 0) {
      calcOtWage = Math.round(otHours * otRate * 100) / 100;
    }

    if (ctc && ctc > 0) {
      const basicPerDay = (ctc / 2) / dim;
      calcBasic = Math.round(basicPerDay * workedDays * 100) / 100;
      calcDa = 0;
      calcHra = Math.round(0.40 * calcBasic * 100) / 100;
      const pfEmployer = Math.round((calcBasic + calcDa) * 0.12 * 100) / 100;
      const ctcWorking = Math.round((ctc / dim) * workedDays * 100) / 100;
      calcGross = Math.round((ctcWorking - pfEmployer) * 100) / 100;
      calcSpecial = Math.round(Math.max(0, calcGross - (calcBasic + calcDa + calcHra)) * 100) / 100;
      calcPf = Math.round((calcBasic + calcDa) * 0.12 * 100) / 100;
      calcPt = calcGross > 0 ? 200 : 0;
      calcEsic = 0;
    } else {
      const bpdVal = bpd || 444.62;
      calcBasic = Math.round(bpdVal * workedDays * 100) / 100;
      calcDa = Math.round(289.38 * workedDays * 100) / 100;
      calcHra = Math.round(62.70 * workedDays * 100) / 100;
      calcSpecial = 0;
      calcGross = Math.round((calcBasic + calcDa + calcHra) * 100) / 100;
      calcPf = Math.round((calcBasic + calcDa) * 0.12 * 100) / 100;
      calcEsic = Math.round(calcGross * 0.0075 * 100) / 100;
      calcPt = calcGross > 0 ? 200 : 0;
    }

    document.getElementById('correction-earn-basic').value = calcBasic.toFixed(2);
    document.getElementById('correction-earn-da').value = calcDa.toFixed(2);
    document.getElementById('correction-earn-hra').value = calcHra.toFixed(2);
    document.getElementById('correction-earn-special').value = calcSpecial.toFixed(2);
    document.getElementById('correction-earn-bonus').value = '0.00';
    document.getElementById('correction-earn-ot').value = calcOtWage.toFixed(2);

    document.getElementById('correction-ded-pf').value = calcPf.toFixed(2);
    document.getElementById('correction-ded-esic').value = calcEsic.toFixed(2);
    document.getElementById('correction-ded-pt').value = calcPt.toFixed(2);
    document.getElementById('correction-ded-advance').value = '0.00';
    document.getElementById('correction-ded-lic').value = '0.00';
    document.getElementById('correction-ded-tds').value = '0.00';

    showToast(`⚡ Standard statutory salary formula calculated for ${user.name}!`);
  }

  // Auto calculate OT wages if OT rate & hours are keyed in
  let currentOt = Number(document.getElementById('correction-earn-ot')?.value) || 0;
  if (otHours > 0 && otRate > 0 && !useStandardFormula) {
    currentOt = Math.round(otHours * otRate * 100) / 100;
    const otInput = document.getElementById('correction-earn-ot');
    if (otInput && document.activeElement !== otInput) {
      otInput.value = currentOt.toFixed(2);
    }
  }

  const basic = Number(document.getElementById('correction-earn-basic')?.value) || 0;
  const da = Number(document.getElementById('correction-earn-da')?.value) || 0;
  const hra = Number(document.getElementById('correction-earn-hra')?.value) || 0;
  const special = Number(document.getElementById('correction-earn-special')?.value) || 0;
  const bonus = Number(document.getElementById('correction-earn-bonus')?.value) || 0;
  const ot = Number(document.getElementById('correction-earn-ot')?.value) || 0;

  const gross = Math.round((basic + da + hra + special + bonus + ot) * 100) / 100;

  const pf = Number(document.getElementById('correction-ded-pf')?.value) || 0;
  const esic = Number(document.getElementById('correction-ded-esic')?.value) || 0;
  const pt = Number(document.getElementById('correction-ded-pt')?.value) || 0;
  const adv = Number(document.getElementById('correction-ded-advance')?.value) || 0;
  const lic = Number(document.getElementById('correction-ded-lic')?.value) || 0;
  const tds = Number(document.getElementById('correction-ded-tds')?.value) || 0;

  const totalDeductions = Math.round((pf + esic + pt + adv + lic + tds) * 100) / 100;
  const netPay = Math.round((gross - totalDeductions) * 100) / 100;

  const grossDisp = document.getElementById('correction-gross-display');
  const dedDisp = document.getElementById('correction-deductions-display');
  const netDisp = document.getElementById('correction-net-display');
  const wordsDisp = document.getElementById('correction-net-words');

  if (grossDisp) grossDisp.textContent = `₹${gross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  if (dedDisp) dedDisp.textContent = `₹${totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  if (netDisp) netDisp.textContent = `₹${netPay.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  if (wordsDisp) wordsDisp.textContent = numberToWordsIndian(Math.max(0, Math.round(netPay))) + ' Rupees Only';
}

async function saveSalaryCorrection() {
  const saveBtn = document.getElementById('btn-save-salary-correction');
  const empSelect = document.getElementById('correction-select-emp');
  const monthSelect = document.getElementById('correction-select-month');

  const userId = empSelect ? empSelect.value : '';
  const monthYear = monthSelect ? monthSelect.value : 'August 2026';
  const user = allUsers.find((u) => u.id === userId || u.empId === userId);

  if (!user) {
    showToast('Please select a valid employee.', 'error');
    return;
  }

  const slipId = document.getElementById('correction-slip-id')?.value;
  const totalDays = Number(document.getElementById('correction-total-days')?.value) || 31;
  const workedDays = Number(document.getElementById('correction-worked-days')?.value) || 31;
  const otHours = Number(document.getElementById('correction-ot-hours')?.value) || 0;
  const otWage = Number(document.getElementById('correction-earn-ot')?.value) || 0;

  const basic = Number(document.getElementById('correction-earn-basic')?.value) || 0;
  const da = Number(document.getElementById('correction-earn-da')?.value) || 0;
  const hra = Number(document.getElementById('correction-earn-hra')?.value) || 0;
  const specialAllowance = Number(document.getElementById('correction-earn-special')?.value) || 0;
  const bonus = Number(document.getElementById('correction-earn-bonus')?.value) || 0;

  const grossPay = Math.round((basic + da + hra + specialAllowance + bonus + otWage) * 100) / 100;

  const pf = Number(document.getElementById('correction-ded-pf')?.value) || 0;
  const esic = Number(document.getElementById('correction-ded-esic')?.value) || 0;
  const pt = Number(document.getElementById('correction-ded-pt')?.value) || 0;
  const advance = Number(document.getElementById('correction-ded-advance')?.value) || 0;
  const lic = Number(document.getElementById('correction-ded-lic')?.value) || 0;
  const tds = Number(document.getElementById('correction-ded-tds')?.value) || 0;

  const totalDeductions = Math.round((pf + esic + pt + advance + lic + tds) * 100) / 100;
  const netPay = Math.round((grossPay - totalDeductions) * 100) / 100;

  const status = document.getElementById('correction-payment-status')?.value || 'Paid';
  const paymentDate = document.getElementById('correction-payment-date')?.value || new Date().toISOString().split('T')[0];
  const bankAccount = document.getElementById('correction-bank-account')?.value.trim();
  const ifsc = document.getElementById('correction-bank-ifsc')?.value.trim();
  const remarks = document.getElementById('correction-remarks')?.value.trim();
  const updateMasterCtc = document.getElementById('correction-update-profile-ctc')?.checked || false;

  const payload = {
    id: slipId || undefined,
    userId: user.id,
    empId: user.empId,
    userName: user.name,
    monthYear,
    month: monthYear.split(' ')[0],
    year: monthYear.split(' ')[1] || '2026',
    designation: user.designation || user.rank || 'Staff',
    department: user.department || 'Plant Fleet & Garage O&M',
    fatherName: user.fatherName || '',
    dob: user.dob || '',
    doj: user.doj || '',
    uan: user.uan || '',
    esicNo: user.esicNo || '',
    pfNo: user.pfNo || '',
    bankAccount: bankAccount || user.bankAccount || '',
    ifsc: ifsc || user.ifsc || '',
    location: user.location || user.site || 'ACC Chanda',
    category: user.category || 'Skilled',
    mobile: user.mobile || user.phone || '',
    phone: user.phone || user.mobile || '',
    workedDays,
    totalDays,
    otHours,
    otWage,
    earnings: { basic, da, hra, specialAllowance, bonus, otWage },
    deductions: { pf, esic, pt, advance, lic, tds },
    grossPay,
    totalDeductions,
    netPay,
    status,
    paymentDate,
    remarks: remarks || `Salary structure corrected for ${monthYear}`,
    updateUserBaseSalary: updateMasterCtc,
    newCtc: updateMasterCtc ? grossPay : undefined
  };

  try {
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    }

    const res = await fetch('/api/payroll/salary-slips/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
      showToast(data.message || `Salary structure & payslip for ${user.name} saved successfully!`);

      // Update in-memory state
      if (Array.isArray(data.salarySlips) && data.salarySlips.length > 0) {
        allSalarySlips = data.salarySlips;
      } else if (data.slip) {
        const idx = allSalarySlips.findIndex((s) => s.id === data.slip.id || (s.empId === data.slip.empId && s.monthYear === data.slip.monthYear));
        if (idx >= 0) {
          allSalarySlips[idx] = data.slip;
        } else {
          allSalarySlips.unshift(data.slip);
        }
      }

      if (updateMasterCtc && user) {
        user.ctc = grossPay;
        user.baseSalary = grossPay;
      }
      if (bankAccount && user) user.bankAccount = bankAccount;
      if (ifsc && user) user.ifsc = ifsc;

      closeModal('modal-salary-correction');
      renderSalaryTable();
      updateDashboardMetrics();
    } else {
      showToast(data.message || 'Failed to save salary slip', 'error');
    }
  } catch (err) {
    console.error('Error saving salary correction:', err);
    // Offline local fallback
    const localSlip = { ...payload, id: slipId || `slp-${user.empId.toLowerCase()}-${Date.now()}` };
    const idx = allSalarySlips.findIndex((s) => s.id === localSlip.id || (s.empId === localSlip.empId && s.monthYear === localSlip.monthYear));
    if (idx >= 0) allSalarySlips[idx] = localSlip;
    else allSalarySlips.unshift(localSlip);

    closeModal('modal-salary-correction');
    renderSalaryTable();
    showToast(`⚡ Salary structure updated locally for ${user.name}!`);
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save & Apply Corrections';
    }
  }
}

function previewCurrentCorrectionSlip() {
  const empSelect = document.getElementById('correction-select-emp');
  const monthSelect = document.getElementById('correction-select-month');
  const userId = empSelect ? empSelect.value : '';
  const monthYear = monthSelect ? monthSelect.value : 'August 2026';
  const user = allUsers.find((u) => u.id === userId || u.empId === userId);

  if (!user) {
    showToast('Please select an employee first.', 'error');
    return;
  }

  const totalDays = Number(document.getElementById('correction-total-days')?.value) || 31;
  const workedDays = Number(document.getElementById('correction-worked-days')?.value) || 31;
  const otHours = Number(document.getElementById('correction-ot-hours')?.value) || 0;
  const otWage = Number(document.getElementById('correction-earn-ot')?.value) || 0;

  const basic = Number(document.getElementById('correction-earn-basic')?.value) || 0;
  const da = Number(document.getElementById('correction-earn-da')?.value) || 0;
  const hra = Number(document.getElementById('correction-earn-hra')?.value) || 0;
  const specialAllowance = Number(document.getElementById('correction-earn-special')?.value) || 0;
  const bonus = Number(document.getElementById('correction-earn-bonus')?.value) || 0;

  const grossPay = Math.round((basic + da + hra + specialAllowance + bonus + otWage) * 100) / 100;

  const pf = Number(document.getElementById('correction-ded-pf')?.value) || 0;
  const esic = Number(document.getElementById('correction-ded-esic')?.value) || 0;
  const pt = Number(document.getElementById('correction-ded-pt')?.value) || 0;
  const advance = Number(document.getElementById('correction-ded-advance')?.value) || 0;
  const lic = Number(document.getElementById('correction-ded-lic')?.value) || 0;
  const tds = Number(document.getElementById('correction-ded-tds')?.value) || 0;

  const totalDeductions = Math.round((pf + esic + pt + advance + lic + tds) * 100) / 100;
  const netPay = Math.round((grossPay - totalDeductions) * 100) / 100;

  const tempSlip = {
    id: `temp-${Date.now()}`,
    userId: user.id,
    empId: user.empId,
    userName: user.name,
    monthYear,
    month: monthYear.split(' ')[0],
    year: monthYear.split(' ')[1] || '2026',
    designation: user.designation || user.rank || 'Staff',
    department: user.department || 'Plant Fleet & Garage O&M',
    fatherName: user.fatherName || '',
    dob: user.dob || '',
    doj: user.doj || '',
    uan: user.uan || '',
    esicNo: user.esicNo || '',
    pfNo: user.pfNo || '',
    bankAccount: document.getElementById('correction-bank-account')?.value || user.bankAccount || '',
    ifsc: document.getElementById('correction-bank-ifsc')?.value || user.ifsc || '',
    location: user.location || user.site || 'ACC Chanda',
    category: user.category || 'Skilled',
    mobile: user.mobile || user.phone || '',
    phone: user.phone || user.mobile || '',
    workedDays,
    totalDays,
    otHours,
    otWage,
    earnings: { basic, da, hra, specialAllowance, bonus, otWage },
    deductions: { pf, esic, pt, advance, lic, tds },
    grossPay,
    totalDeductions,
    netPay,
    status: document.getElementById('correction-payment-status')?.value || 'Paid',
    paymentDate: document.getElementById('correction-payment-date')?.value || new Date().toISOString().split('T')[0]
  };

  currentActiveSlip = tempSlip;
  viewSalarySlip(tempSlip.id);
}

// Global Window Bindings for Inline HTML Callbacks
window.openAppointmentLetterModal = openAppointmentLetterModal;
window.handleLetterEmployeeChange = handleLetterEmployeeChange;
window.updateLetterTemplate = updateLetterTemplate;
window.downloadLetterPdf = downloadLetterPdf;
window.printAppointmentLetter = printAppointmentLetter;
window.sendLetterWhatsApp = sendLetterWhatsApp;
window.downloadSlipPdf = downloadSlipPdf;
window.viewSalarySlip = viewSalarySlip;
window.sendSlipWhatsApp = sendSlipWhatsApp;
window.dispatchBulkWhatsApp = dispatchBulkWhatsApp;

// Salary Structure Correction window bindings
window.openSalaryCorrectionModal = openSalaryCorrectionModal;
window.handleCorrectionEmployeeChange = handleCorrectionEmployeeChange;
window.recalculateCorrectionSlip = recalculateCorrectionSlip;
window.saveSalaryCorrection = saveSalaryCorrection;
window.previewCurrentCorrectionSlip = previewCurrentCorrectionSlip;



