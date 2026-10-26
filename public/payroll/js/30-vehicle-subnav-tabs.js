// 30. Vehicle Section Sub-Navigation Controller
let currentVehicleSubTab = 'fleet-master';

function initVehicleSubNav() {
  const btns = document.querySelectorAll('.v-subnav-btn');
  btns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = btn.getAttribute('data-vtab');
      if (targetTab) {
        switchVehicleSubTab(targetTab);
      }
    });
  });
  updateVehicleSubNavBadges();
}

function switchVehicleSubTab(tabName) {
  currentVehicleSubTab = tabName;

  // Update active state on buttons
  document.querySelectorAll('.v-subnav-btn').forEach((b) => {
    if (b.getAttribute('data-vtab') === tabName) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  // Toggle view panels
  const viewPanels = [
    'vview-fleet-master',
    'vview-job-cards',
    'vview-challans',
    'vview-inventory',
    'vview-consumption',
    'vview-mttr'
  ];

  viewPanels.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      if (id === `vview-${tabName}`) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });

  // Re-render target view
  if (tabName === 'fleet-master') {
    if (typeof renderVehiclesTable === 'function') renderVehiclesTable();
  } else if (tabName === 'job-cards') {
    if (typeof renderJobCardsTable === 'function') renderJobCardsTable();
  } else if (tabName === 'challans') {
    if (typeof renderChallansTable === 'function') renderChallansTable();
  } else if (tabName === 'inventory') {
    if (typeof renderInventoryTable === 'function') renderInventoryTable();
  } else if (tabName === 'consumption') {
    if (typeof renderVehicleConsumptionAnalytics === 'function') renderVehicleConsumptionAnalytics();
  } else if (tabName === 'mttr') {
    if (typeof renderFleetMTTRMatrix === 'function') renderFleetMTTRMatrix();
    if (typeof renderVehicleBreakdownLogs === 'function') renderVehicleBreakdownLogs();
  }

  updateVehicleSubNavBadges();
}

function updateVehicleSubNavBadges() {
  const jcBadge = document.getElementById('vsub-jc-count');
  if (jcBadge) {
    const openCount = (allJobCards || []).filter(j => j.status !== 'Completed' && j.status !== 'Closed').length;
    jcBadge.textContent = openCount;
    jcBadge.className = `v-badge ${openCount > 0 ? 'v-badge-alert' : ''}`;
  }

  const chlBadge = document.getElementById('vsub-chl-count');
  if (chlBadge) {
    chlBadge.textContent = (allChallans || []).length;
  }

  const invBadge = document.getElementById('vsub-inv-count');
  if (invBadge) {
    const lowStock = (allInventory || []).filter(i => (Number(i.stockQty) || 0) <= (Number(i.minStock) || 2)).length;
    invBadge.textContent = (allInventory || []).length;
    if (lowStock > 0) {
      invBadge.title = `${lowStock} items low in stock!`;
    }
  }

  const fleetBadge = document.getElementById('vsub-fleet-count');
  if (fleetBadge) {
    fleetBadge.textContent = (allVehicles || []).length;
  }
}
