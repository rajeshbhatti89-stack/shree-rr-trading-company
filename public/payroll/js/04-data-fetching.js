// 4. Data Fetching
async function loadAllData() {
  await Promise.all([
    fetchUsers(),
    fetchVehicles(),
    fetchVehicleLogs(),
    fetchAttendance(),
    fetchRosters(),
    fetchLeaves(),
    fetchSalarySlips(),
    fetchInventory(),
    fetchJobCards(),
    fetchChallans(),
    fetchVehicleConsumption()
  ]);
  updateDashboardMetrics();
}

async function fetchInventory() {
  try {
    const res = await fetch('/api/payroll/inventory');
    const data = await res.json();
    if (data.success && Array.isArray(data.inventory)) {
      allInventory = data.inventory;
      try { localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(allInventory)); } catch (e) {}
    }
  } catch (e) {
    console.warn('Inventory fetch failed, loading local cache', e);
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.INVENTORY);
      if (cached) allInventory = JSON.parse(cached);
    } catch (err) {}
  }
  if (typeof renderInventoryTable === 'function') renderInventoryTable();
}

async function fetchJobCards() {
  try {
    const res = await fetch('/api/payroll/job-cards');
    const data = await res.json();
    if (data.success && Array.isArray(data.jobCards)) {
      allJobCards = data.jobCards;
      try { localStorage.setItem(STORAGE_KEYS.JOB_CARDS, JSON.stringify(allJobCards)); } catch (e) {}
    }
  } catch (e) {
    console.warn('Job cards fetch failed, loading local cache', e);
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.JOB_CARDS);
      if (cached) allJobCards = JSON.parse(cached);
    } catch (err) {}
  }
  if (typeof renderJobCardsTable === 'function') renderJobCardsTable();
  if (typeof populateJobCardDropdowns === 'function') populateJobCardDropdowns();
}

async function fetchChallans() {
  try {
    const res = await fetch('/api/payroll/challans');
    const data = await res.json();
    if (data.success && Array.isArray(data.challans)) {
      allChallans = data.challans;
      try { localStorage.setItem(STORAGE_KEYS.CHALLANS, JSON.stringify(allChallans)); } catch (e) {}
    }
  } catch (e) {
    console.warn('Challans fetch failed, loading local cache', e);
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.CHALLANS);
      if (cached) allChallans = JSON.parse(cached);
    } catch (err) {}
  }
  if (typeof renderChallansTable === 'function') renderChallansTable();
}

async function fetchVehicleConsumption() {
  try {
    const res = await fetch('/api/payroll/vehicle-consumption');
    const data = await res.json();
    if (data.success && Array.isArray(data.allConsumptions)) {
      allVehiclePartConsumptions = data.allConsumptions;
    }
  } catch (e) {
    console.warn('Vehicle consumption fetch failed', e);
  }
  if (typeof renderVehicleConsumptionAnalytics === 'function') renderVehicleConsumptionAnalytics();
}

// Local Storage Keys & Robust Client Persistence Layer
const STORAGE_KEYS = {
  SLIPS: 'srr_payroll_salary_slips_v3',
  USERS: 'srr_payroll_users_v3',
  ATTENDANCE: 'srr_payroll_attendance_v3',
  LEAVES: 'srr_payroll_leaves_v3',
  INVENTORY: 'srr_payroll_inventory_v1',
  JOB_CARDS: 'srr_payroll_job_cards_v1',
  CHALLANS: 'srr_payroll_challans_v1'
};

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

  // Normalize and guarantee 10-digit mobile number on every employee record
  if (Array.isArray(allUsers)) {
    allUsers.forEach((u) => {
      const clean = String(u.mobile || u.phone || '').replace(/[^0-9]/g, '').slice(-10);
      if (clean.length === 10) {
        u.mobile = clean;
        if (!u.phone) u.phone = `+91 ${clean}`;
      }
    });
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

// Local Storage Keys & Robust Client Persistence Layer
const STORAGE_KEYS = {
  SLIPS: 'srr_payroll_salary_slips_v3',
  USERS: 'srr_payroll_users_v3',
  ATTENDANCE: 'srr_payroll_attendance_v3',
  LEAVES: 'srr_payroll_leaves_v3'
};

function saveSlipsToStorage(slips) {
  try {
    if (Array.isArray(slips) && slips.length > 0) {
      localStorage.setItem(STORAGE_KEYS.SLIPS, JSON.stringify(slips));
    }
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
}

function loadSlipsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SLIPS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('LocalStorage load error:', e);
  }
  return [];
}

// Client-side Salary Slips Generator Utility
function generateClientSalarySlips(mYear = 'August 2026', userSubset = null) {
  const targetUsers = Array.isArray(userSubset) ? userSubset : allUsers;
  if (!Array.isArray(targetUsers) || targetUsers.length === 0) return [];
  const activeEmployees = targetUsers.filter((u) => u.role !== 'Super Admin' && u.status !== 'Inactive');
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
    const totalLeavesTaken = Number(u.leave || 0);
    const availableLeaveBalance = u.leaveBalance !== undefined ? Number(u.leaveBalance) : 10;
    const unpaidLeaves = Math.max(0, totalLeavesTaken - availableLeaveBalance);
    
    let pdays;
    if (u.payableDays) {
      pdays = Number(u.payableDays);
    } else if (u.presentDays !== undefined) {
      const paidLeaves = totalLeavesTaken - unpaidLeaves;
      pdays = Number(u.presentDays) + Number(u.weakOff || 0) + paidLeaves + Number(u.publicHoliday || 0);
    } else {
      pdays = dim - unpaidLeaves;
    }
    pdays = Math.min(dim, pdays);
    
    // Prorate salary based on Date of Joining (DOJ) if joined in current month
    if (u.doj) {
      const parts = u.doj.split('/');
      if (parts.length === 3) {
        const joinDay = parseInt(parts[0], 10);
        const joinMonth = parseInt(parts[1], 10) - 1;
        const joinYear = parseInt(parts[2], 10);
        const targetMonthIdx = monthNames.indexOf((mYear.split(' ')[0] || '').toLowerCase());
        const targetYear = parseInt(mYear.split(' ')[1]) || 2026;
        
        if (joinYear === targetYear && joinMonth === targetMonthIdx) {
          const maxDays = dim - joinDay + 1;
          pdays = Math.min(pdays, maxDays);
        }
      }
    }

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
      mobile: String(u.mobile || u.phone || '').replace(/[^0-9]/g, '').slice(-10),
      phone: u.phone || (u.mobile ? `+91 ${String(u.mobile).replace(/[^0-9]/g, '').slice(-10)}` : ''),
      workedDays: pdays,
      totalDays: dim,
      publicHolidays: Number(u.publicHoliday || 0),
      otHours: 0,
      otWage: 0,
      earnings: { basic, da, hra, specialAllowance, bonus: 0, otWage: 0 },
      deductions: { pf, esic, pt, lic: 0, advance: 0, tds: 0 },
      grossPay,
      totalDeductions,
      netPay,
      status: 'Paid',
      paymentDate: mYear.includes('August') ? '2026-08-31' : (mYear.includes('July') ? '2026-07-31' : '2026-09-30'),
      isManuallyCorrected: false,
      manualLocked: false
    };
  });
}

async function fetchSalarySlips() {
  const cachedSlips = loadSlipsFromStorage();
  if (cachedSlips.length > 0) {
    allSalarySlips = cachedSlips;
  }

  try {
    const res = await fetch('/api/payroll/salary-slips');
    const data = await res.json();
    if (data.success && Array.isArray(data.salarySlips) && data.salarySlips.length > 0) {
      const serverSlips = data.salarySlips;
      const mergedSlipsMap = new Map();

      // Seed with server slips
      serverSlips.forEach((s) => {
        const key = s.id || `${s.empId || s.userId}_${s.monthYear}`;
        mergedSlipsMap.set(key, s);
      });

      // Override or retain local manually corrected slips so no server reset erases manual OT/components
      cachedSlips.forEach((cs) => {
        const key = cs.id || `${cs.empId || cs.userId}_${cs.monthYear}`;
        const srv = mergedSlipsMap.get(key);
        if (cs.isManuallyCorrected || cs.manualLocked) {
          mergedSlipsMap.set(key, cs);
        } else if (!srv) {
          mergedSlipsMap.set(key, cs);
        }
      });

      allSalarySlips = Array.from(mergedSlipsMap.values());
      saveSlipsToStorage(allSalarySlips);
    }
  } catch (e) {
    console.warn('Salary slips fetch fallback to local cache', e);
  }

  // Guarantee August 2026, July 2026, and September 2026 salary structures are loaded without overwriting existing/manual slips
  if (allUsers.length > 0) {
    const ensureMonthSlips = (mYear) => {
      const existingEmpKeys = new Set(
        allSalarySlips.filter((s) => s.monthYear === mYear).map((s) => s.empId || s.userId)
      );
      const missingUsers = allUsers.filter(
        (u) => u.role !== 'Super Admin' && u.status !== 'Inactive' && !existingEmpKeys.has(u.empId) && !existingEmpKeys.has(u.id)
      );
      if (missingUsers.length > 0) {
        const newMonthSlips = generateClientSalarySlips(mYear, missingUsers);
        allSalarySlips = [...allSalarySlips, ...newMonthSlips];
      }
    };

    ensureMonthSlips('August 2026');
    ensureMonthSlips('July 2026');
    ensureMonthSlips('September 2026');
    saveSlipsToStorage(allSalarySlips);
  }

  // Ensure all slips have their 10-digit mobile number populated from user profiles
  if (Array.isArray(allSalarySlips)) {
    allSalarySlips.forEach((s) => {
      if (!s.mobile || String(s.mobile).replace(/[^0-9]/g, '').length < 10) {
        s.mobile = resolveEmployeeMobile(s);
      }
      if (!s.phone && s.mobile) {
        s.phone = `+91 ${s.mobile}`;
      }
    });
  }

  renderSalaryTable();
}

