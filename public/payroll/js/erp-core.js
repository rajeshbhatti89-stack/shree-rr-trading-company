/**
 * Shree RR Trading Company - Enterprise Operations, Fleet & Payroll Portal
 * ERPNext / Frappe Desk Style Modular Core Architecture
 * Module: erp-core.js
 * (c) 2026 Shree RR Trading Company
 */

// Global ERP Namespace
window.ERP = window.ERP || {};

// ==================== 1. GLOBAL STATE ====================
ERP.state = {
  currentUser: null,
  token: null,
  activeWorkspace: 'dashboard',
  selectedMonth: 'October 2026',
  data: {
    users: [],
    vehicles: [],
    vehicleLogs: [],
    inventory: [],
    jobCards: [],
    challans: [],
    attendance: [],
    rosters: [],
    leaves: [],
    salarySlips: []
  },
  filters: {
    userSearch: '',
    userRole: 'ALL',
    vehicleSearch: '',
    vehicleStatus: 'ALL',
    jobCardStatus: 'ALL',
    jobCardPriority: 'ALL',
    inventoryCategory: 'ALL',
    inventorySearch: '',
    challanSearch: ''
  }
};

// Aliases for seamless backward compatibility
window.allUsers = [];
window.allVehicles = [];
window.allVehicleLogs = [];
window.allInventory = [];
window.allJobCards = [];
window.allChallans = [];
window.allAttendance = [];
window.allRosters = [];
window.allLeaves = [];
window.allSalarySlips = [];
window.currentUser = null;

// ==================== 2. HTTP & API CLIENT ====================
ERP.api = {
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : endpoint;
    const headers = Object.assign(
      {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      options.headers || {}
    );

    if (ERP.state.token) {
      headers['Authorization'] = `Bearer ${ERP.state.token}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      const contentType = response.headers.get('content-type') || '';
      let data = null;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const errorMsg = (data && data.message) || (data && data.error) || `HTTP error ${response.status}`;
        throw new Error(errorMsg);
      }
      return data;
    } catch (err) {
      console.warn(`[ERP.api] Error calling ${endpoint}:`, err);
      throw err;
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};

// ==================== 3. TOAST & NOTIFICATIONS ====================
ERP.toast = function(message, type = 'info', duration = 3500) {
  let container = document.getElementById('erp-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'erp-toast-container';
    container.className = 'erp-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `erp-toast erp-toast-${type} animate-slide-in`;

  let icon = 'fa-circle-info text-blue';
  if (type === 'success') icon = 'fa-circle-check text-green';
  if (type === 'error' || type === 'danger') icon = 'fa-triangle-exclamation text-red';
  if (type === 'warning') icon = 'fa-triangle-exclamation text-orange';

  toast.innerHTML = `
    <div class="erp-toast-icon"><i class="fa-solid ${icon}"></i></div>
    <div class="erp-toast-content">${ERP.utils.escapeHtml(message)}</div>
    <button class="erp-toast-close" onclick="this.parentElement.remove()">&times;</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('animate-fade-out');
    setTimeout(() => toast.remove(), 400);
  }, duration);
};

window.showToast = function(msg, type) {
  ERP.toast(msg, type || 'info');
};

// ==================== 4. MODAL MANAGER ====================
ERP.modal = {
  open(id) {
    const el = document.getElementById(id);
    if (!el) {
      console.warn(`[ERP.modal] Modal #${id} not found`);
      return;
    }
    el.classList.remove('hidden');
    el.classList.add('active');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';

    // Auto-focus first visible input
    const firstInput = el.querySelector('input:not([type="hidden"]), select, textarea');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 80);
    }
  },

  close(id) {
    if (!id) {
      document.querySelectorAll('.modal-backdrop:not(.hidden)').forEach(m => {
        m.classList.add('hidden');
        m.classList.remove('active');
      });
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('hidden');
      el.classList.remove('active');
    }
    if (!document.querySelector('.modal-backdrop:not(.hidden)')) {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    }
  }
};

window.openModal = function(id) { ERP.modal.open(id); };
window.closeModal = function(id) { ERP.modal.close(id); };

// ==================== 5. AUTH & RBAC SYSTEM ====================
ERP.auth = {
  init() {
    const savedUser = localStorage.getItem('srr_user_session');
    const savedToken = localStorage.getItem('srr_auth_token');
    if (savedUser) {
      try {
        ERP.state.currentUser = JSON.parse(savedUser);
        ERP.state.token = savedToken || 'session-token';
        window.currentUser = ERP.state.currentUser;
      } catch (e) {
        localStorage.removeItem('srr_user_session');
      }
    }

    if (ERP.state.currentUser) {
      this.showApp();
    } else {
      this.showLogin();
    }
  },

  async login(emailOrId, password) {
    try {
      const res = await ERP.api.post('/api/payroll/auth/login', {
        email: emailOrId.trim(),
        empId: emailOrId.trim(),
        password: password
      });

      if (res && res.success && res.user) {
        ERP.state.currentUser = res.user;
        ERP.state.token = res.token || 'auth-token-' + Date.now();
        window.currentUser = res.user;
        localStorage.setItem('srr_user_session', JSON.stringify(res.user));
        localStorage.setItem('srr_auth_token', ERP.state.token);

        ERP.toast(`Welcome back, ${res.user.name || 'User'}!`, 'success');
        this.showApp();
        ERP.loadAllData();
        return true;
      } else {
        throw new Error((res && res.message) || 'Invalid login credentials');
      }
    } catch (err) {
      ERP.toast(err.message || 'Login failed', 'error');
      return false;
    }
  },

  logout() {
    ERP.state.currentUser = null;
    ERP.state.token = null;
    window.currentUser = null;
    localStorage.removeItem('srr_user_session');
    localStorage.removeItem('srr_auth_token');
    ERP.toast('Logged out successfully.', 'info');
    this.showLogin();
  },

  showApp() {
    const loginWrap = document.getElementById('login-container');
    const appWrap = document.getElementById('app-container');
    if (loginWrap) loginWrap.classList.add('hidden');
    if (appWrap) appWrap.classList.remove('hidden');

    this.renderUserProfilePill();
    this.enforcePermissionsUI();
  },

  showLogin() {
    const loginWrap = document.getElementById('login-container');
    const appWrap = document.getElementById('app-container');
    if (loginWrap) loginWrap.classList.remove('hidden');
    if (appWrap) appWrap.classList.add('hidden');
  },

  renderUserProfilePill() {
    const u = ERP.state.currentUser;
    if (!u) return;

    const nameEl = document.getElementById('nav-user-name');
    const roleEl = document.getElementById('nav-user-role');
    const avatarEl = document.getElementById('nav-user-avatar');
    const siteEl = document.getElementById('nav-user-site');

    if (nameEl) nameEl.textContent = u.name || 'User';
    if (roleEl) roleEl.textContent = u.role || u.designation || 'Staff';
    if (siteEl) siteEl.textContent = u.site || u.location || 'ACC Chanda Site';
    if (avatarEl) {
      const initials = (u.name || 'U').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
      avatarEl.textContent = initials;
    }
  },

  hasPermission(permKey) {
    const u = ERP.state.currentUser;
    if (!u) return false;
    if (u.role === 'Super Admin') return true;
    if (u.permissions && (u.permissions['*'] || u.permissions[permKey])) return true;
    return false;
  },

  enforcePermissionsUI() {
    const u = ERP.state.currentUser;
    if (!u) return;
    const isSuperAdmin = (u.role === 'Super Admin');

    // Hide or disable Super Admin restricted elements
    document.querySelectorAll('[data-perm-required]').forEach(el => {
      const req = el.getAttribute('data-perm-required');
      if (!ERP.auth.hasPermission(req)) {
        el.style.display = 'none';
      } else {
        el.style.display = '';
      }
    });

    const superAdminTabs = document.querySelectorAll('.superadmin-only');
    superAdminTabs.forEach(el => {
      el.style.display = isSuperAdmin ? '' : 'none';
    });
  }
};

// ==================== 6. DESK ROUTER & WORKSPACES ====================
ERP.router = {
  activeWorkspace: 'dashboard',

  navigate(workspaceId) {
    this.activeWorkspace = workspaceId;
    ERP.state.activeWorkspace = workspaceId;

    // Update Sidebar Navigation active status
    document.querySelectorAll('.desk-nav-item').forEach(item => {
      if (item.getAttribute('data-workspace') === workspaceId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update View Containers
    document.querySelectorAll('.desk-workspace-pane').forEach(pane => {
      if (pane.id === `workspace-${workspaceId}`) {
        pane.classList.remove('hidden');
        pane.classList.add('active');
      } else {
        pane.classList.add('hidden');
        pane.classList.remove('active');
      }
    });

    // Update Breadcrumb
    const breadcrumbCurrent = document.getElementById('desk-breadcrumb-current');
    if (breadcrumbCurrent) {
      const titles = {
        'dashboard': 'Executive Operations Overview',
        'payroll': 'Payroll & Salary Slips Master',
        'attendance': 'Live Attendance & Muster Roll',
        'leaves': 'Leave Management & Balance Register',
        'fleet': 'Plant Fleets & Heavy Machinery O&M',
        'maintenance': 'Job Cards & Maintenance Bay',
        'inventory': 'Warehouse Spares & Delivery Challans',
        'employees': 'Staff & Human Resources Master',
        'reports': 'Verified 1-Click Excel Exporters',
        'settings': 'Access Control & RBAC Configuration'
      };
      breadcrumbCurrent.textContent = titles[workspaceId] || 'Workspace';
    }

    // Trigger workspace view refresh
    ERP.router.refreshWorkspace(workspaceId);

    // Auto close mobile drawer if open
    document.getElementById('desk-sidebar')?.classList.remove('mobile-open');
  },

  refreshWorkspace(wsId) {
    if (wsId === 'dashboard') ERP.dashboard.updateKPIs();
    if (wsId === 'payroll' && typeof ERP.payroll?.renderTable === 'function') ERP.payroll.renderTable();
    if (wsId === 'fleet' && typeof ERP.fleet?.renderVehiclesTable === 'function') ERP.fleet.renderVehiclesTable();
    if (wsId === 'maintenance' && typeof ERP.maintenance?.renderJobCardsTable === 'function') ERP.maintenance.renderJobCardsTable();
    if (wsId === 'inventory' && typeof ERP.inventory?.renderInventoryTable === 'function') ERP.inventory.renderInventoryTable();
    if (wsId === 'attendance' && typeof ERP.attendance?.renderMusterRoll === 'function') ERP.attendance.renderMusterRoll();
    if (wsId === 'leaves' && typeof ERP.leaves?.renderAll === 'function') ERP.leaves.renderAll();
    if (wsId === 'employees') {
      if (typeof ERP.employees?.renderUsersTable === 'function') ERP.employees.renderUsersTable();
      else if (typeof ERP.hr?.renderUsersTable === 'function') ERP.hr.renderUsersTable();
    }
  }
};

// ==================== 7. DATA FETCHER & SYNC ENGINE ====================
ERP.loadAllData = async function() {
  const refreshIcon = document.getElementById('btn-refresh-data-icon');
  if (refreshIcon) refreshIcon.classList.add('fa-spin');

  try {
    const [usersRes, vehRes, logsRes, invRes, jcRes, chRes, attRes, rosRes, levRes, slpRes] = await Promise.allSettled([
      ERP.api.get('/api/payroll/users'),
      ERP.api.get('/api/payroll/vehicles'),
      ERP.api.get('/api/payroll/vehicle-logs'),
      ERP.api.get('/api/payroll/inventory'),
      ERP.api.get('/api/payroll/job-cards'),
      ERP.api.get('/api/payroll/challans'),
      ERP.api.get('/api/payroll/attendance'),
      ERP.api.get('/api/payroll/rosters'),
      ERP.api.get('/api/payroll/leaves'),
      ERP.api.get('/api/payroll/salary-slips')
    ]);

    if (usersRes.status === 'fulfilled' && usersRes.value && usersRes.value.users) {
      ERP.state.data.users = usersRes.value.users;
    }
    if (vehRes.status === 'fulfilled' && vehRes.value && vehRes.value.vehicles) {
      ERP.state.data.vehicles = vehRes.value.vehicles;
    }
    if (logsRes.status === 'fulfilled' && logsRes.value && logsRes.value.logs) {
      ERP.state.data.vehicleLogs = logsRes.value.logs;
    }
    if (invRes.status === 'fulfilled' && invRes.value && invRes.value.inventory) {
      ERP.state.data.inventory = invRes.value.inventory;
    }
    if (jcRes.status === 'fulfilled' && jcRes.value && jcRes.value.jobCards) {
      ERP.state.data.jobCards = jcRes.value.jobCards;
    }
    if (chRes.status === 'fulfilled' && chRes.value && chRes.value.challans) {
      ERP.state.data.challans = chRes.value.challans;
    }
    if (attRes.status === 'fulfilled' && attRes.value && attRes.value.attendance) {
      ERP.state.data.attendance = attRes.value.attendance;
    }
    if (rosRes.status === 'fulfilled' && rosRes.value && rosRes.value.rosters) {
      ERP.state.data.rosters = rosRes.value.rosters;
    }
    if (levRes.status === 'fulfilled' && levRes.value && levRes.value.leaves) {
      ERP.state.data.leaves = levRes.value.leaves;
    }
    if (slpRes.status === 'fulfilled' && slpRes.value && slpRes.value.salarySlips) {
      ERP.state.data.salarySlips = slpRes.value.salarySlips;
    }

    // Sync global window references for 100% backward compatibility
    window.allUsers = ERP.state.data.users;
    window.allVehicles = ERP.state.data.vehicles;
    window.allVehicleLogs = ERP.state.data.vehicleLogs;
    window.allInventory = ERP.state.data.inventory;
    window.allJobCards = ERP.state.data.jobCards;
    window.allChallans = ERP.state.data.challans;
    window.allAttendance = ERP.state.data.attendance;
    window.allRosters = ERP.state.data.rosters;
    window.allLeaves = ERP.state.data.leaves;
    window.allSalarySlips = ERP.state.data.salarySlips;

    // Guarantee October 2026, September 2026, August 2026 slips exist for active employees
    ERP.payroll.ensureMonthSlips('October 2026');
    ERP.payroll.ensureMonthSlips('September 2026');
    ERP.payroll.ensureMonthSlips('August 2026');

    // Populate common select dropdowns
    ERP.populateCommonDropdowns();

    // Render active workspace view
    ERP.router.refreshWorkspace(ERP.state.activeWorkspace);

    console.log('[ERP] Full dataset loaded and synchronized successfully.');
  } catch (err) {
    console.error('[ERP] Data load error:', err);
    ERP.toast('Failed to load portal data. Check connection.', 'error');
  } finally {
    if (refreshIcon) refreshIcon.classList.remove('fa-spin');
  }
};

// ==================== 8. DASHBOARD KPI CALCULATOR ====================
ERP.dashboard = {
  updateKPIs() {
    const veh = ERP.state.data.vehicles || [];
    const logs = ERP.state.data.vehicleLogs || [];
    const users = ERP.state.data.users || [];
    const jc = ERP.state.data.jobCards || [];
    const inv = ERP.state.data.inventory || [];
    const slips = ERP.state.data.salarySlips || [];

    // Fleet availability calculation
    let totalAvail = 0;
    let countedVeh = 0;
    veh.forEach(v => {
      const vLogs = logs.filter(l => l.vehicleNo.toUpperCase() === v.vehicleNo.toUpperCase());
      const bdHrs = vLogs.reduce((sum, l) => sum + (Number(l.breakdownHours) || 0), 0);
      const schedHrs = 30 * 24; // Monthly schedule
      const avail = Math.max(0, Math.min(100, Math.round(((schedHrs - bdHrs) / schedHrs) * 100)));
      totalAvail += avail;
      countedVeh++;
    });
    const avgAvail = countedVeh > 0 ? Math.round(totalAvail / countedVeh) : 96;

    // MTTR calculation
    let totBdHours = 0;
    let totBdEvents = 0;
    logs.forEach(l => {
      totBdHours += (Number(l.breakdownHours) || 0);
      totBdEvents += 1;
    });
    const avgMttr = totBdEvents > 0 ? (totBdHours / totBdEvents).toFixed(1) : '2.4';

    // Staff stats
    const activeStaff = users.filter(u => u.role !== 'Super Admin' && u.status !== 'Inactive');

    // Job cards stats
    const openJobCards = jc.filter(j => j.status !== 'Completed' && j.status !== 'Closed');

    // Spares critical stats
    const lowStockItems = inv.filter(i => (Number(i.quantity) || 0) <= (Number(i.reorderLevel) || 5));

    // October monthly payroll gross
    const octSlips = slips.filter(s => s.monthYear === ERP.state.selectedMonth);
    const totalPayrollGross = octSlips.reduce((sum, s) => sum + (Number(s.grossPay) || 0), 0);

    // Update DOM KPI elements
    ERP.utils.setElemText('kpi-fleet-avail', `${avgAvail}%`);
    ERP.utils.setElemText('kpi-fleet-mttr', `${avgMttr}h`);
    ERP.utils.setElemText('kpi-active-fleets', `${veh.length} Units`);
    ERP.utils.setElemText('kpi-active-staff', `${activeStaff.length} On Duty`);
    ERP.utils.setElemText('kpi-open-jobcards', `${openJobCards.length} Active`);
    ERP.utils.setElemText('kpi-low-spares', `${lowStockItems.length} Low`);
    ERP.utils.setElemText('kpi-monthly-payroll', `₹${Math.round(totalPayrollGross).toLocaleString('en-IN')}`);
    ERP.utils.setElemText('kpi-payroll-month-label', ERP.state.selectedMonth);
  }
};

// ==================== 9. AWESOMEBAR GLOBAL SEARCH (CTRL+K) ====================
ERP.awesomebar = {
  init() {
    const searchInput = document.getElementById('desk-awesome-input');
    const resultsContainer = document.getElementById('desk-awesome-results');
    const modal = document.getElementById('modal-awesome-search');

    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        ERP.modal.open('modal-awesome-search');
      }
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.search(e.target.value.trim());
      });
    }
  },

  search(query) {
    const list = document.getElementById('desk-awesome-results');
    if (!list) return;

    if (!query) {
      list.innerHTML = `
        <div class="awesome-category-title">Quick Workspaces</div>
        <div class="awesome-item" onclick="ERP.router.navigate('dashboard'); ERP.modal.close('modal-awesome-search');">
          <i class="fa-solid fa-gauge text-orange"></i> Operations Executive Dashboard
        </div>
        <div class="awesome-item" onclick="ERP.router.navigate('payroll'); ERP.modal.close('modal-awesome-search');">
          <i class="fa-solid fa-money-check-dollar text-green"></i> Payroll & Salary Slips Master
        </div>
        <div class="awesome-item" onclick="ERP.router.navigate('fleet'); ERP.modal.close('modal-awesome-search');">
          <i class="fa-solid fa-truck-monster text-blue"></i> Heavy Plant Machinery Fleet
        </div>
        <div class="awesome-item" onclick="ERP.router.navigate('maintenance'); ERP.modal.close('modal-awesome-search');">
          <i class="fa-solid fa-screwdriver-wrench text-orange"></i> Maintenance Job Cards & Bay
        </div>
        <div class="awesome-item" onclick="ERP.router.navigate('inventory'); ERP.modal.close('modal-awesome-search');">
          <i class="fa-solid fa-boxes-stacked text-purple"></i> Spares & Delivery Challans
        </div>
      `;
      return;
    }

    const q = query.toLowerCase();
    let html = '';

    // Search Vehicles
    const matchedVeh = (ERP.state.data.vehicles || []).filter(v => 
      v.vehicleNo.toLowerCase().includes(q) || (v.name && v.name.toLowerCase().includes(q))
    ).slice(0, 4);

    if (matchedVeh.length > 0) {
      html += `<div class="awesome-category-title"><i class="fa-solid fa-truck-monster"></i> Fleets / Machinery</div>`;
      matchedVeh.forEach(v => {
        html += `
          <div class="awesome-item" onclick="ERP.router.navigate('fleet'); ERP.fleet.filterVehicle('${ERP.utils.escapeHtml(v.vehicleNo)}'); ERP.modal.close('modal-awesome-search');">
            <strong>${ERP.utils.escapeHtml(v.vehicleNo)}</strong> - ${ERP.utils.escapeHtml(v.name || 'Heavy Equipment')} (${ERP.utils.escapeHtml(v.status || 'Active')})
          </div>
        `;
      });
    }

    // Search Employees
    const matchedUsers = (ERP.state.data.users || []).filter(u =>
      (u.name && u.name.toLowerCase().includes(q)) || (u.empId && u.empId.toLowerCase().includes(q))
    ).slice(0, 4);

    if (matchedUsers.length > 0) {
      html += `<div class="awesome-category-title"><i class="fa-solid fa-users"></i> Staff & Employees</div>`;
      matchedUsers.forEach(u => {
        html += `
          <div class="awesome-item" onclick="ERP.router.navigate('employees'); ERP.modal.close('modal-awesome-search');">
            <strong>${ERP.utils.escapeHtml(u.name)}</strong> (${ERP.utils.escapeHtml(u.empId || '')}) - ${ERP.utils.escapeHtml(u.designation || 'Staff')}
          </div>
        `;
      });
    }

    // Search Job Cards
    const matchedJC = (ERP.state.data.jobCards || []).filter(j =>
      (j.jobCardNo && j.jobCardNo.toLowerCase().includes(q)) || (j.vehicleNo && j.vehicleNo.toLowerCase().includes(q))
    ).slice(0, 4);

    if (matchedJC.length > 0) {
      html += `<div class="awesome-category-title"><i class="fa-solid fa-clipboard-check"></i> Job Cards</div>`;
      matchedJC.forEach(j => {
        html += `
          <div class="awesome-item" onclick="ERP.router.navigate('maintenance'); ERP.modal.close('modal-awesome-search');">
            <strong>${ERP.utils.escapeHtml(j.jobCardNo)}</strong> [${ERP.utils.escapeHtml(j.vehicleNo)}] - ${ERP.utils.escapeHtml(j.maintenanceType || 'Repair')}
          </div>
        `;
      });
    }

    // Search Spares
    const matchedSpares = (ERP.state.data.inventory || []).filter(i =>
      (i.partNo && i.partNo.toLowerCase().includes(q)) || (i.name && i.name.toLowerCase().includes(q))
    ).slice(0, 4);

    if (matchedSpares.length > 0) {
      html += `<div class="awesome-category-title"><i class="fa-solid fa-box"></i> Spares & Inventory</div>`;
      matchedSpares.forEach(i => {
        html += `
          <div class="awesome-item" onclick="ERP.router.navigate('inventory'); ERP.modal.close('modal-awesome-search');">
            <strong>${ERP.utils.escapeHtml(i.partNo)}</strong> - ${ERP.utils.escapeHtml(i.name)} [Stock: ${i.quantity} ${ERP.utils.escapeHtml(i.unit || 'Nos')}]
          </div>
        `;
      });
    }

    if (!html) {
      html = `<div style="padding: 20px; text-align: center; color: var(--text-dim);">No matching records found for "<strong>${ERP.utils.escapeHtml(query)}</strong>"</div>`;
    }

    list.innerHTML = html;
  }
};

// ==================== 10. COMMON UTILITIES ====================
ERP.utils = {
  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  setElemText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  },

  formatCurrency(num) {
    const val = Number(num) || 0;
    return '₹' + Math.round(val).toLocaleString('en-IN');
  },

  numberToWordsIndian(num) {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    num = Math.floor(Math.abs(Number(num) || 0));
    if (num === 0) return 'Zero';

    const formatHundreds = (n) => {
      let str = '';
      if (n > 99) {
        str += a[Math.floor(n / 100)] + 'Hundred ';
        n %= 100;
      }
      if (n > 19) {
        str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
      } else if (n > 0) {
        str += a[n];
      }
      return str;
    };

    let words = '';
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;
    const remaining = num;

    if (crore > 0) words += formatHundreds(crore) + 'Crore ';
    if (lakh > 0) words += formatHundreds(lakh) + 'Lakh ';
    if (thousand > 0) words += formatHundreds(thousand) + 'Thousand ';
    if (remaining > 0) words += formatHundreds(remaining);

    return words.trim() + ' Only';
  }
};

window.escapeHtml = ERP.utils.escapeHtml;
window.numberToWordsIndian = ERP.utils.numberToWordsIndian;

// ==================== 11. COMMON DROPDOWN POPULATOR ====================
ERP.populateCommonDropdowns = function() {
  const users = ERP.state.data.users || [];
  const activeStaff = users.filter(u => u.role !== 'Super Admin' && u.status !== 'Inactive');

  const mechanics = activeStaff.filter(u => {
    const d = (u.designation || '').toLowerCase();
    const r = (u.rank || '').toLowerCase();
    return d.includes('mechanic') || d.includes('technician') || d.includes('fitter') || d.includes('electrician') || r.includes('mechanic');
  });

  const helpers = activeStaff.filter(u => {
    const d = (u.designation || '').toLowerCase();
    const r = (u.rank || '').toLowerCase();
    return d.includes('helper') || d.includes('greaser') || d.includes('cleaner') || r.includes('helper');
  });

  const others = activeStaff.filter(u => !mechanics.includes(u) && !helpers.includes(u));

  const formatOption = (u) => {
    return `<option value="${u.id || u.empId}">${ERP.utils.escapeHtml(u.name)} (${u.empId || ''}) - ${ERP.utils.escapeHtml(u.designation || 'Staff')}</option>`;
  };

  const crewOptionsHtml = `
    <option value="">-- Select Crew Member --</option>
    <optgroup label="🔧 Mechanics & Technicians">${(mechanics.length > 0 ? mechanics : activeStaff).map(formatOption).join('')}</optgroup>
    ${helpers.length > 0 ? `<optgroup label="🛠️ Helpers & Greasers">${helpers.map(formatOption).join('')}</optgroup>` : ''}
    ${others.length > 0 ? `<optgroup label="👷 Operators & Staff">${others.map(formatOption).join('')}</optgroup>` : ''}
  `;

  // Lead mechanic, asst mechanic, helper, challan recipient
  ['jc-lead-mechanic', 'jc-asst-mechanic', 'jc-helper', 'chl-issued-to'].forEach(id => {
    const sel = document.getElementById(id);
    if (sel) sel.innerHTML = crewOptionsHtml;
  });

  // Vehicle select options
  const veh = ERP.state.data.vehicles || [];
  const vehOptionsHtml = `
    <option value="">-- Select Equipment / Fleet --</option>
    ${veh.map(v => `<option value="${ERP.utils.escapeHtml(v.vehicleNo)}">${ERP.utils.escapeHtml(v.vehicleNo)} - ${ERP.utils.escapeHtml(v.name || 'Equipment')} (${ERP.utils.escapeHtml(v.category || 'General')})</option>`).join('')}
  `;

  ['jc-vehicle-select', 'chl-vehicle-select'].forEach(id => {
    const sel = document.getElementById(id);
    if (sel) sel.innerHTML = vehOptionsHtml;
  });

  // Operators select for vehicle assignment
  const opSelect = document.getElementById('veh-operator');
  if (opSelect) {
    opSelect.innerHTML = `
      <option value="">-- Assign Equipment Operator / Driver --</option>
      ${activeStaff.map(u => `<option value="${ERP.utils.escapeHtml(u.name)}">${ERP.utils.escapeHtml(u.name)} (${u.empId || ''}) - ${ERP.utils.escapeHtml(u.designation || 'Operator')}</option>`).join('')}
    `;
  }

  // Staff options for Leave Management modals
  const staffSelectOptions = `
    <option value="">-- Choose Employee / Staff --</option>
    ${activeStaff.map(u => `<option value="${u.id || u.empId}">${ERP.utils.escapeHtml(u.name)} (${u.empId || ''}) - ${ERP.utils.escapeHtml(u.designation || 'Staff')}</option>`).join('')}
  `;
  ['leave-apply-user', 'leave-credit-user', 'leave-deduct-user'].forEach(id => {
    const sel = document.getElementById(id);
    if (sel) sel.innerHTML = staffSelectOptions;
  });
};

// Aliases for global compatibility
ERP.employees = ERP.hr;
window.ERP = ERP;

