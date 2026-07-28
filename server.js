const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3005;

let DATA_FILE = path.join(__dirname, 'data', 'payroll_db.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const PAYROLL_DIR = path.join(__dirname, 'public', 'payroll');

app.use(express.json());

// Health Check endpoint for Render / Cloud deployments
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Helper to read DB
function readDb() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      // Try /tmp fallback if local file not found
      const tmpFile = path.join('/tmp', 'payroll_db.json');
      if (fs.existsSync(tmpFile)) {
        DATA_FILE = tmpFile;
      } else {
        return { users: [], attendance: [], rosters: [], salarySlips: [] };
      }
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading payroll_db.json:', err);
    return { users: [], attendance: [], rosters: [], salarySlips: [] };
  }
}

// Helper to write DB
function writeDb(data) {
  try {
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing payroll_db.json, attempting /tmp fallback:', err);
    try {
      DATA_FILE = path.join('/tmp', 'payroll_db.json');
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (tmpErr) {
      console.error('Error writing to /tmp:', tmpErr);
      return false;
    }
  }
}

// --- SUBDOMAIN & PATH ROUTING MIDDLEWARE ---
app.use((req, res, next) => {
  const rawHost = req.headers['x-forwarded-host'] || req.headers.host || '';
  const host = String(rawHost).toLowerCase();
  const isPayrollSubdomain = host.startsWith('payroll.');

  if (isPayrollSubdomain) {
    if (req.path.startsWith('/api/')) {
      return next();
    }

    // Strip leading /payroll if present
    const relPath = req.path.replace(/^\/payroll/, '');
    const targetFile = path.join(PAYROLL_DIR, relPath === '' ? 'index.html' : relPath);

    if (fs.existsSync(targetFile) && fs.statSync(targetFile).isFile()) {
      return res.sendFile(targetFile);
    }

    return res.sendFile(path.join(PAYROLL_DIR, 'index.html'));
  }

  next();
});

// Serve payroll portal static assets under /payroll
app.use('/payroll', express.static(PAYROLL_DIR));

// Explicit fallback route for /payroll and /payroll/* on main domain
app.get('/payroll*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(PAYROLL_DIR, 'index.html'));
});

// Serve main website static assets
app.use(express.static(PUBLIC_DIR));

// --- API ENDPOINTS ---

// 1. Auth Login
app.post('/api/payroll/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  const db = readDb();
  const user = db.users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  if (user.status === 'Inactive') {
    return res.status(403).json({ success: false, message: 'Account is deactivated. Contact Admin.' });
  }

  // Return user without password
  const { password: _, ...userSafe } = user;
  res.json({
    success: true,
    message: 'Login successful',
    user: userSafe
  });
});

// 2. Users (Get & Create)
app.get('/api/payroll/users', (req, res) => {
  const db = readDb();
  const usersSafe = db.users.map(({ password, ...u }) => u);
  res.json({ success: true, users: usersSafe });
});

app.post('/api/payroll/users', (req, res) => {
  const { name, email, password, role, designation, department, site, phone, baseSalary, bankAccount, panNumber } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'Name, Email, Password and Role are required' });
  }

  const db = readDb();
  const existing = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'User with this email already exists' });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: password,
    role: role || 'Employee',
    designation: designation || 'Staff Member',
    department: department || 'General Operations',
    site: site || 'Headquarters',
    phone: phone || '',
    baseSalary: Number(baseSalary) || 0,
    bankAccount: bankAccount || 'Pending Verification',
    panNumber: panNumber || 'N/A',
    status: 'Active',
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDb(db);

  const { password: _, ...userSafe } = newUser;
  res.json({ success: true, message: 'User created successfully', user: userSafe });
});

app.put('/api/payroll/users/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const db = readDb();

  const index = db.users.findIndex((u) => u.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Prevent changing password via update unless explicitly provided
  if (!updates.password) {
    delete updates.password;
  }

  db.users[index] = { ...db.users[index], ...updates };
  writeDb(db);

  const { password: _, ...userSafe } = db.users[index];
  res.json({ success: true, message: 'User updated successfully', user: userSafe });
});

// 3. Attendance APIs
app.get('/api/payroll/attendance', (req, res) => {
  const db = readDb();
  res.json({ success: true, attendance: db.attendance });
});

app.post('/api/payroll/attendance', (req, res) => {
  const { userId, date, clockIn, clockOut, status, site, notes } = req.body;
  if (!userId || !date) {
    return res.status(400).json({ success: false, message: 'userId and date are required' });
  }

  const db = readDb();
  const user = db.users.find((u) => u.id === userId);

  const newRecord = {
    id: `att-${Date.now()}`,
    userId,
    userName: user ? user.name : 'Employee',
    date: date || new Date().toISOString().split('T')[0],
    clockIn: clockIn || '08:30 AM',
    clockOut: clockOut || '05:30 PM',
    status: status || 'Present',
    site: site || (user ? user.site : 'Site'),
    notes: notes || 'Punched via Payroll Portal'
  };

  db.attendance.unshift(newRecord);
  writeDb(db);

  res.json({ success: true, message: 'Attendance recorded', attendance: newRecord });
});

// 4. Duty Roster APIs
app.get('/api/payroll/rosters', (req, res) => {
  const db = readDb();
  res.json({ success: true, rosters: db.rosters });
});

app.post('/api/payroll/rosters', (req, res) => {
  const { userId, date, shift, site, equipment, supervisor } = req.body;
  if (!userId || !date || !shift) {
    return res.status(400).json({ success: false, message: 'userId, date, and shift are required' });
  }

  const db = readDb();
  const user = db.users.find((u) => u.id === userId);

  const newRoster = {
    id: `rst-${Date.now()}`,
    userId,
    userName: user ? user.name : 'Employee',
    designation: user ? user.designation : 'Staff',
    date,
    shift,
    site: site || (user ? user.site : 'Site'),
    equipment: equipment || 'N/A',
    supervisor: supervisor || 'Rajesh Bhatti'
  };

  db.rosters.unshift(newRoster);
  writeDb(db);

  res.json({ success: true, message: 'Duty Roster assigned', roster: newRoster });
});

app.delete('/api/payroll/rosters/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.rosters = db.rosters.filter((r) => r.id !== id);
  writeDb(db);
  res.json({ success: true, message: 'Duty Roster deleted' });
});

// 5. Salary Slip APIs
app.get('/api/payroll/salary-slips', (req, res) => {
  const db = readDb();
  res.json({ success: true, salarySlips: db.salarySlips });
});

app.post('/api/payroll/salary-slips', (req, res) => {
  const { userId, monthYear, workedDays, totalDays, basic, hra, fieldAllowance, overtime, pf, esi, advance, paymentDate } = req.body;

  if (!userId || !monthYear) {
    return res.status(400).json({ success: false, message: 'userId and monthYear required' });
  }

  const db = readDb();
  const user = db.users.find((u) => u.id === userId);

  const nBasic = Number(basic) || 0;
  const nHra = Number(hra) || 0;
  const nField = Number(fieldAllowance) || 0;
  const nOt = Number(overtime) || 0;

  const nPf = Number(pf) || 0;
  const nEsi = Number(esi) || 0;
  const nAdvance = Number(advance) || 0;

  const grossPay = nBasic + nHra + nField + nOt;
  const totalDeductions = nPf + nEsi + nAdvance;
  const netPay = grossPay - totalDeductions;

  const newSlip = {
    id: `slp-${Date.now()}`,
    userId,
    userName: user ? user.name : 'Employee',
    monthYear,
    designation: user ? user.designation : 'Staff',
    department: user ? user.department : 'General',
    bankAccount: user ? user.bankAccount : 'N/A',
    panNumber: user ? user.panNumber : 'N/A',
    workedDays: Number(workedDays) || 26,
    totalDays: Number(totalDays) || 30,
    earnings: {
      basic: nBasic,
      hra: nHra,
      fieldAllowance: nField,
      overtime: nOt
    },
    deductions: {
      pf: nPf,
      esi: nEsi,
      advance: nAdvance
    },
    grossPay,
    totalDeductions,
    netPay,
    status: 'Paid',
    paymentDate: paymentDate || new Date().toISOString().split('T')[0]
  };

  db.salarySlips.unshift(newSlip);
  writeDb(db);

  res.json({ success: true, message: 'Salary slip generated successfully', salarySlip: newSlip });
});

// Fallback SPA route for main site
app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🏗️  Shree RR Trading Company Corporate & Payroll Server`);
  console.log(`🌐 Server active on port ${PORT}`);
  console.log(`💼 Payroll Portal: http://0.0.0.0:${PORT}/payroll`);
  console.log(`====================================================`);
});
