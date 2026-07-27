/* ============================================================
   SHREE RR TRADING COMPANY - PAYROLL & EMPLOYEE MANAGEMENT PORTAL
   Client Logic & State Controller
============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  let currentUser = JSON.parse(localStorage.getItem('payroll_user')) || null;
  let usersList = [];
  let attendanceList = [];
  let rosterList = [];
  let salarySlipsList = [];

  // DOM Elements
  const loginContainer = document.getElementById('login-container');
  const appContainer = document.getElementById('app-container');
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-btn');

  const navItems = document.querySelectorAll('.nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const pageTitle = document.getElementById('current-page-title');

  const userAvatar = document.getElementById('user-avatar');
  const userDisplayName = document.getElementById('user-display-name');
  const userDisplayRole = document.getElementById('user-display-role');

  const btnAddEmployeeTop = document.getElementById('btn-add-employee-top');
  const btnCreateUserModal = document.getElementById('btn-create-user-modal');
  const formCreateUser = document.getElementById('form-create-user');

  const btnCreateRosterModal = document.getElementById('btn-create-roster-modal');
  const formCreateRoster = document.getElementById('form-create-roster');
  const rosterUserIdSelect = document.getElementById('roster-user-id');

  const btnGenerateSlipModal = document.getElementById('btn-generate-slip-modal');
  const formCreateSlip = document.getElementById('form-create-slip');
  const slipUserIdSelect = document.getElementById('slip-user-id');

  const btnPunchIn = document.getElementById('btn-punch-in');
  const btnPunchOut = document.getElementById('btn-punch-out');
  const myPunchStatus = document.getElementById('my-punch-status');

  // Modals
  const modalUser = document.getElementById('modal-user');
  const modalRoster = document.getElementById('modal-roster');
  const modalSalarySlip = document.getElementById('modal-salary-slip');
  const modalViewSlip = document.getElementById('modal-view-slip');
  const modalCloseBtns = document.querySelectorAll('.modal-close');

  // Initialize
  initClock();
  setupModalListeners();

  if (currentUser) {
    showApp();
  } else {
    showLogin();
  }

  // --- CLOCK ---
  function initClock() {
    const clockEl = document.getElementById('live-clock-display');
    function updateTime() {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    updateTime();
    setInterval(updateTime, 1000);
  }

  // --- AUTH LOGIC ---
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    try {
      const res = await fetch('/api/payroll/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success) {
        currentUser = data.user;
        localStorage.setItem('payroll_user', JSON.stringify(currentUser));
        showApp();
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Error connecting to server. Please try again.');
    }
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('payroll_user');
    currentUser = null;
    showLogin();
  });

  function showLogin() {
    loginContainer.classList.remove('hidden');
    appContainer.classList.add('hidden');
  }

  function showApp() {
    loginContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');

    // Set User Profile UI
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    userAvatar.textContent = initials;
    userDisplayName.textContent = currentUser.name;
    userDisplayRole.textContent = currentUser.role;

    // Check Authority / Role
    const isSuperAdminOrHR = currentUser.role === 'Super Admin' || currentUser.role === 'HR / Payroll Manager';
    if (isSuperAdminOrHR) {
      btnAddEmployeeTop.classList.remove('hidden');
    } else {
      btnAddEmployeeTop.classList.add('hidden');
    }

    loadAllData();
  }

  // --- TAB NAVIGATION ---
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = item.getAttribute('data-tab');

      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      tabPanes.forEach(pane => {
        if (pane.id === `tab-${targetTab}`) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });

      // Update Page Title
      const tabTitles = {
        'dashboard': 'Dashboard Overview',
        'users': 'Employee & User Management',
        'attendance': 'Attendance Log Portal',
        'roster': 'Duty Roster & Fleets',
        'payroll': 'Salary Slips & Payroll'
      };
      pageTitle.textContent = tabTitles[targetTab] || 'Dashboard';
    });
  });

  // --- MODAL CONTROLS ---
  function setupModalListeners() {
    modalCloseBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modalUser.classList.add('hidden');
        modalRoster.classList.add('hidden');
        modalSalarySlip.classList.add('hidden');
        modalViewSlip.classList.add('hidden');
      });
    });

    if (btnCreateUserModal) {
      btnCreateUserModal.addEventListener('click', () => modalUser.classList.remove('hidden'));
    }
    if (btnAddEmployeeTop) {
      btnAddEmployeeTop.addEventListener('click', () => modalUser.classList.remove('hidden'));
    }
    if (btnCreateRosterModal) {
      btnCreateRosterModal.addEventListener('click', () => {
        populateUserDropdown(rosterUserIdSelect);
        modalRoster.classList.remove('hidden');
      });
    }
    if (btnGenerateSlipModal) {
      btnGenerateSlipModal.addEventListener('click', () => {
        populateUserDropdown(slipUserIdSelect);
        modalSalarySlip.classList.remove('hidden');
      });
    }
  }

  function populateUserDropdown(selectEl) {
    selectEl.innerHTML = usersList.map(u => 
      `<option value="${u.id}">${u.name} (${u.role} - ${u.designation})</option>`
    ).join('');
  }

  // --- API DATA LOADERS ---
  async function loadAllData() {
    await Promise.all([
      fetchUsers(),
      fetchAttendance(),
      fetchRosters(),
      fetchSalarySlips()
    ]);

    updateDashboardKPIs();
  }

  async function fetchUsers() {
    try {
      const res = await fetch('/api/payroll/users');
      const data = await res.json();
      if (data.success) {
        usersList = data.users;
        renderUsers();
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }

  async function fetchAttendance() {
    try {
      const res = await fetch('/api/payroll/attendance');
      const data = await res.json();
      if (data.success) {
        attendanceList = data.attendance;
        renderAttendance();
        renderDashboardAttendance();
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
    }
  }

  async function fetchRosters() {
    try {
      const res = await fetch('/api/payroll/rosters');
      const data = await res.json();
      if (data.success) {
        rosterList = data.rosters;
        renderRosters();
      }
    } catch (err) {
      console.error('Error fetching rosters:', err);
    }
  }

  async function fetchSalarySlips() {
    try {
      const res = await fetch('/api/payroll/salary-slips');
      const data = await res.json();
      if (data.success) {
        salarySlipsList = data.salarySlips;
        renderSalarySlips();
      }
    } catch (err) {
      console.error('Error fetching salary slips:', err);
    }
  }

  // --- RENDER FUNCTIONS ---
  function updateDashboardKPIs() {
    document.getElementById('kpi-total-users').textContent = usersList.length;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayPresent = attendanceList.filter(a => a.date === todayStr && a.status === 'Present').length;
    document.getElementById('kpi-present-today').textContent = todayPresent;

    document.getElementById('kpi-active-roster').textContent = rosterList.length;

    const totalPayroll = salarySlipsList.reduce((acc, s) => acc + (s.netPay || 0), 0);
    document.getElementById('kpi-total-payroll').textContent = `₹${totalPayroll.toLocaleString('en-IN')}`;

    // Check my punch status
    const myToday = attendanceList.find(a => a.userId === currentUser.id && a.date === todayStr);
    if (myToday) {
      myPunchStatus.textContent = `Punched In (${myToday.clockIn})`;
      myPunchStatus.className = 'status-badge badge-success';
    } else {
      myPunchStatus.textContent = 'Not Punched In';
      myPunchStatus.className = 'status-badge badge-warning';
    }
  }

  function renderUsers() {
    const tbody = document.querySelector('#users-table tbody');
    if (!tbody) return;

    tbody.innerHTML = usersList.map(u => `
      <tr>
        <td>
          <div class="user-cell">
            <strong>${u.name}</strong><br>
            <small class="text-muted">PAN: ${u.panNumber || 'N/A'}</small>
          </div>
        </td>
        <td>${u.email}</td>
        <td><span class="badge ${u.role === 'Super Admin' ? 'badge-primary' : 'badge-success'}">${u.role}</span></td>
        <td>${u.designation}<br><small class="text-muted">${u.department}</small></td>
        <td><i class="fa-solid fa-location-dot text-primary"></i> ${u.site}</td>
        <td><strong>₹${(u.baseSalary || 0).toLocaleString('en-IN')}</strong></td>
        <td><span class="badge ${u.status === 'Active' ? 'badge-success' : 'badge-danger'}">${u.status}</span></td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="toggleUserStatus('${u.id}', '${u.status}')">
            ${u.status === 'Active' ? 'Deactivate' : 'Activate'}
          </button>
        </td>
      </tr>
    `).join('');
  }

  function renderAttendance() {
    const tbody = document.querySelector('#attendance-table tbody');
    if (!tbody) return;

    tbody.innerHTML = attendanceList.map(a => `
      <tr>
        <td><strong>${a.date}</strong></td>
        <td>${a.userName}</td>
        <td>${a.site}</td>
        <td><span class="text-success"><i class="fa-solid fa-arrow-down-long"></i> ${a.clockIn}</span></td>
        <td><span class="text-danger"><i class="fa-solid fa-arrow-up-long"></i> ${a.clockOut || '--'}</span></td>
        <td><span class="badge badge-success">${a.status}</span></td>
        <td><small class="text-muted">${a.notes || ''}</small></td>
      </tr>
    `).join('');
  }

  function renderDashboardAttendance() {
    const tbody = document.querySelector('#dashboard-attendance-table tbody');
    if (!tbody) return;

    const recent = attendanceList.slice(0, 5);
    tbody.innerHTML = recent.map(a => `
      <tr>
        <td><strong>${a.userName}</strong></td>
        <td>${a.site}</td>
        <td>${a.clockIn}</td>
        <td>${a.clockOut || '--'}</td>
        <td><span class="badge badge-success">${a.status}</span></td>
      </tr>
    `).join('');
  }

  function renderRosters() {
    const tbody = document.querySelector('#roster-table tbody');
    if (!tbody) return;

    tbody.innerHTML = rosterList.map(r => `
      <tr>
        <td><strong>${r.date}</strong></td>
        <td>${r.userName}</td>
        <td>${r.designation}</td>
        <td><span class="badge badge-primary">${r.shift}</span></td>
        <td><i class="fa-solid fa-location-dot text-warning"></i> ${r.site}</td>
        <td><i class="fa-solid fa-truck-monster text-primary"></i> ${r.equipment}</td>
        <td>${r.supervisor}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="deleteRoster('${r.id}')"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `).join('');
  }

  function renderSalarySlips() {
    const tbody = document.querySelector('#salary-slips-table tbody');
    if (!tbody) return;

    tbody.innerHTML = salarySlipsList.map(s => `
      <tr>
        <td><code>${s.id}</code></td>
        <td><strong>${s.userName}</strong><br><small class="text-muted">${s.designation}</small></td>
        <td>${s.monthYear}</td>
        <td class="text-success">₹${s.grossPay.toLocaleString('en-IN')}</td>
        <td class="text-danger">₹${s.totalDeductions.toLocaleString('en-IN')}</td>
        <td><strong class="text-primary">₹${s.netPay.toLocaleString('en-IN')}</strong></td>
        <td><span class="badge badge-success">${s.status}</span></td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="viewSalarySlip('${s.id}')">
            <i class="fa-solid fa-file-pdf"></i> View Pay Slip
          </button>
        </td>
      </tr>
    `).join('');
  }

  // --- ACTION HANDLERS ---

  // 1. Submit New User Form
  formCreateUser.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newUserObj = {
      name: document.getElementById('user-name').value,
      email: document.getElementById('user-email').value,
      password: document.getElementById('user-password').value,
      role: document.getElementById('user-role').value,
      designation: document.getElementById('user-designation').value,
      department: document.getElementById('user-department').value,
      site: document.getElementById('user-site').value,
      phone: document.getElementById('user-phone').value,
      baseSalary: document.getElementById('user-salary').value,
      bankAccount: document.getElementById('user-bank').value,
      panNumber: document.getElementById('user-pan').value,
    };

    try {
      const res = await fetch('/api/payroll/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserObj)
      });
      const data = await res.json();

      if (data.success) {
        alert('User created successfully!');
        modalUser.classList.add('hidden');
        formCreateUser.reset();
        loadAllData();
      } else {
        alert(data.message || 'Failed to create user');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server');
    }
  });

  // 2. Punch In / Out
  btnPunchIn.addEventListener('click', async () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    try {
      const res = await fetch('/api/payroll/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          date: dateStr,
          clockIn: timeStr,
          status: 'Present',
          site: currentUser.site || 'Main Site',
          notes: 'Self Punch-In'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Clocked In at ${timeStr}`);
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  });

  btnPunchOut.addEventListener('click', () => {
    alert('Clock-Out recorded for today.');
  });

  // 3. Submit Roster Form
  formCreateRoster.addEventListener('submit', async (e) => {
    e.preventDefault();
    const rosterObj = {
      userId: document.getElementById('roster-user-id').value,
      date: document.getElementById('roster-date').value,
      shift: document.getElementById('roster-shift').value,
      site: document.getElementById('roster-site').value,
      equipment: document.getElementById('roster-equipment').value,
      supervisor: document.getElementById('roster-supervisor').value
    };

    try {
      const res = await fetch('/api/payroll/rosters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rosterObj)
      });
      const data = await res.json();
      if (data.success) {
        alert('Duty Roster assigned successfully!');
        modalRoster.classList.add('hidden');
        formCreateRoster.reset();
        fetchRosters();
      }
    } catch (err) {
      console.error(err);
    }
  });

  // 4. Submit Salary Slip Form
  formCreateSlip.addEventListener('submit', async (e) => {
    e.preventDefault();
    const slipObj = {
      userId: document.getElementById('slip-user-id').value,
      monthYear: document.getElementById('slip-month').value,
      workedDays: document.getElementById('slip-worked-days').value,
      totalDays: document.getElementById('slip-total-days').value,
      basic: document.getElementById('slip-basic').value,
      hra: document.getElementById('slip-hra').value,
      fieldAllowance: document.getElementById('slip-field').value,
      overtime: document.getElementById('slip-overtime').value,
      pf: document.getElementById('slip-pf').value,
      esi: document.getElementById('slip-esi').value,
      advance: document.getElementById('slip-advance').value,
      paymentDate: document.getElementById('slip-payment-date').value
    };

    try {
      const res = await fetch('/api/payroll/salary-slips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slipObj)
      });
      const data = await res.json();
      if (data.success) {
        alert('Salary Slip generated successfully!');
        modalSalarySlip.classList.add('hidden');
        formCreateSlip.reset();
        fetchSalarySlips();
      }
    } catch (err) {
      console.error(err);
    }
  });

  // Global functions for buttons in table
  window.toggleUserStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch(`/api/payroll/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  window.deleteRoster = async (id) => {
    if (!confirm('Are you sure you want to delete this roster shift?')) return;
    try {
      const res = await fetch(`/api/payroll/rosters/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchRosters();
      }
    } catch (err) {
      console.error(err);
    }
  };

  window.viewSalarySlip = (slipId) => {
    const slip = salarySlipsList.find(s => s.id === slipId);
    if (!slip) return;

    const printableContainer = document.getElementById('printable-slip-content');
    printableContainer.innerHTML = `
      <div class="slip-header-brand">
        <div>
          <h2 class="slip-company-name">SHREE RR TRADING COMPANY</h2>
          <p class="slip-company-sub">Mining Operations & Maintenance, Heavy Fleets & Infrastructure</p>
          <p class="slip-company-sub">Subdomain Portal: payroll.shreerrtradingcompany.com</p>
        </div>
        <div class="slip-title-badge">
          <h4>SALARY SLIP STATEMENT</h4>
          <p><strong>Month:</strong> ${slip.monthYear}</p>
          <p><strong>Slip No:</strong> ${slip.id}</p>
        </div>
      </div>

      <div class="slip-meta-grid">
        <div class="slip-meta-item"><span class="lbl">Employee Name:</span> ${slip.userName}</div>
        <div class="slip-meta-item"><span class="lbl">Designation:</span> ${slip.designation}</div>
        <div class="slip-meta-item"><span class="lbl">Department:</span> ${slip.department}</div>
        <div class="slip-meta-item"><span class="lbl">Days Worked / Total:</span> ${slip.workedDays} / ${slip.totalDays} Days</div>
        <div class="slip-meta-item"><span class="lbl">Bank Account:</span> ${slip.bankAccount}</div>
        <div class="slip-meta-item"><span class="lbl">PAN Number:</span> ${slip.panNumber}</div>
        <div class="slip-meta-item"><span class="lbl">Payment Date:</span> ${slip.paymentDate}</div>
        <div class="slip-meta-item"><span class="lbl">Status:</span> <strong style="color:#10b981;">${slip.status}</strong></div>
      </div>

      <table class="slip-table">
        <thead>
          <tr>
            <th>Earnings Breakdown</th>
            <th>Amount (₹)</th>
            <th>Deductions Breakdown</th>
            <th>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Basic Salary</td>
            <td>₹${(slip.earnings.basic || 0).toLocaleString('en-IN')}</td>
            <td>Provident Fund (PF)</td>
            <td>₹${(slip.deductions.pf || 0).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>House Rent Allowance (HRA)</td>
            <td>₹${(slip.earnings.hra || 0).toLocaleString('en-IN')}</td>
            <td>Employees State Insurance (ESI)</td>
            <td>₹${(slip.deductions.esi || 0).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>Field / Site Allowance</td>
            <td>₹${(slip.earnings.fieldAllowance || 0).toLocaleString('en-IN')}</td>
            <td>Salary Advance / Loan</td>
            <td>₹${(slip.deductions.advance || 0).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>Overtime / Performance Incentive</td>
            <td>₹${(slip.earnings.overtime || 0).toLocaleString('en-IN')}</td>
            <td>--</td>
            <td>--</td>
          </tr>
          <tr class="slip-total-row">
            <td><strong>GROSS EARNINGS</strong></td>
            <td><strong>₹${slip.grossPay.toLocaleString('en-IN')}</strong></td>
            <td><strong>TOTAL DEDUCTIONS</strong></td>
            <td><strong>₹${slip.totalDeductions.toLocaleString('en-IN')}</strong></td>
          </tr>
        </tbody>
      </table>

      <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:16px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span style="font-size:12px; color:#166534; font-weight:700;">NET PAYABLE AMOUNT:</span><br>
          <strong style="font-size:24px; color:#15803d; font-family:'Outfit', sans-serif;">₹${slip.netPay.toLocaleString('en-IN')}</strong>
        </div>
        <div style="text-align:right; font-size:12px; color:#166534;">
          <span>Digitally Verified & Authorized by</span><br>
          <strong>Srijandev Payroll Engine</strong>
        </div>
      </div>

      <div class="slip-footer-signatures">
        <div class="sig-box">
          <div class="sig-line"></div>
          Employee Signature
        </div>
        <div class="sig-box">
          <div class="sig-line"></div>
          Authorized Signatory<br>
          <strong>Shree RR Trading Company</strong>
        </div>
      </div>
    `;

    modalViewSlip.classList.remove('hidden');
  };
});
