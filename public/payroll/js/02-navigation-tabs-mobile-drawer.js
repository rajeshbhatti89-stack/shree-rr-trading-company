// 2. Navigation Tabs & Mobile Drawer
function initNavigation() {
  const navItems = document.querySelectorAll('.sidebar-menu .nav-item');
  navItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = item.getAttribute('data-tab');
      if (!tabId) return; // Never blank out the viewport
      const vTab = item.getAttribute('data-vtab');
      switchTab(tabId);
      if (vTab && typeof switchVehicleSubTab === 'function') {
        switchVehicleSubTab(vTab);
      }
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
  if (!tabId) return;
  closeMobileSidebar();

  let targetVTab = null;
  if (tabId === 'compliance') {
    tabId = 'vehicles';
    targetVTab = 'compliance';
  }

  document.querySelectorAll('.sidebar-menu .nav-item').forEach((i) => i.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach((p) => p.classList.remove('active'));

  if (tabId === 'users') {
    if (currentUser) {
      const isSuper = currentUser.role === 'Super Admin';
      const isHO = currentUser.site && (currentUser.site === 'Headquarters / All Sites' || currentUser.site.toUpperCase() === 'HO');
      const perms = currentUser.permissions || {};
      const canManageUsers = isSuper || isHO || (perms['hr.users.manage'] === true);
      if (!canManageUsers) {
        showToast('Unauthorized: You do not have permission to view HR Employee data.', 'error');
        tabId = 'dashboard';
      }
    }
  }

  const navItem = targetVTab
    ? document.querySelector(`.sidebar-menu .nav-item[data-vtab="${targetVTab}"]`)
    : (document.querySelector(`.sidebar-menu .nav-item[data-tab="${tabId}"]:not([data-vtab])`) || document.querySelector(`.sidebar-menu .nav-item[data-tab="${tabId}"]`));
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
    if (typeof renderJobCardsTable === 'function') renderJobCardsTable();
    if (typeof renderChallansTable === 'function') renderChallansTable();
    if (typeof renderInventoryTable === 'function') renderInventoryTable();
    if (typeof renderVehicleConsumptionAnalytics === 'function') renderVehicleConsumptionAnalytics();
    if (typeof renderComplianceMatrix === 'function') renderComplianceMatrix();
    if (typeof updateVehicleSubNavBadges === 'function') updateVehicleSubNavBadges();
    if (targetVTab && typeof switchVehicleSubTab === 'function') {
      switchVehicleSubTab(targetVTab);
    }
  }
  if (tabId === 'muster') renderMusterRollTable();
  if (tabId === 'tomorrow') renderTomorrowScheduleTable();
  if (tabId === 'attendance-glass') renderAttendanceGlassCards();
  if (tabId === 'reports') populateReportsDefaults();
}
