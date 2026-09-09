const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const multer = require('multer');
const { whatsappService } = require('./whatsapp-service');
const { generateSalarySlipPdf } = require('./pdf-generator');

const app = express();
const PORT = process.env.PORT || 3300;
const upload = multer({ dest: path.join(__dirname, 'uploads/') });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Batch Dispatch State
let batchState = {
  running: false,
  total: 0,
  current: 0,
  sent: 0,
  failed: 0,
  logs: [],
  currentSlip: null,
  stopped: false
};

const dbPath = path.join(__dirname, '..', '..', 'data', 'payroll_db.json');

// Helper: load slips from local DB
function getLocalPayrollSlips() {
  if (fs.existsSync(dbPath)) {
    try {
      const raw = fs.readFileSync(dbPath, 'utf8');
      const db = JSON.parse(raw);
      if (Array.isArray(db.salarySlips) && db.salarySlips.length > 0) {
        return db.salarySlips;
      }
    } catch (e) {
      console.error('Error reading db:', e);
    }
  }
  return [];
}

// 1. Status of WhatsApp connection
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    status: whatsappService.status,
    user: whatsappService.user,
    qrDataUrl: whatsappService.status === 'qr_ready' ? whatsappService.qrDataUrl : null,
    qrString: whatsappService.status === 'qr_ready' ? whatsappService.qrString : null
  });
});

// 2. Fetch Slips
app.get('/api/slips', (req, res) => {
  try {
    const slips = getLocalPayrollSlips();
    const month = req.query.month;
    const filtered = month 
      ? slips.filter(s => String(s.monthYear || '').toLowerCase() === String(month).toLowerCase())
      : slips;
    res.json({ success: true, count: filtered.length, slips: filtered });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Upload & Import Excel / CSV Payroll Master
app.post('/api/upload-excel', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  try {
    const filePath = req.file.path;
    const wb = xlsx.readFile(filePath);
    const sheetName = wb.SheetNames.find(n => n.toLowerCase().includes('payroll') || n.toLowerCase().includes('master')) || wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    let headerIdx = -1;
    for (let i = 0; i < Math.min(15, rows.length); i++) {
      const r = rows[i];
      if (r && r.some(c => String(c).toLowerCase().includes('emp id') || String(c).toLowerCase().includes('employee name'))) {
        headerIdx = i;
        break;
      }
    }

    if (headerIdx === -1) {
      return res.status(400).json({ success: false, error: 'Could not find employee table headers in Excel' });
    }

    const headers = rows[headerIdx].map(h => String(h || '').trim().toLowerCase());
    const findCol = (keys) => headers.findIndex(h => keys.some(k => h.includes(k)));

    const colEmpId = findCol(['emp id', 'employee id']);
    const colName = findCol(['employee name', 'worker name', 'name']);
    const colFather = findCol(['father']);
    const colDesig = findCol(['designation', 'rank']);
    const colCat = findCol(['category']);
    const colSite = findCol(['site', 'location']);
    const colDays = findCol(['days in month', 'total days']);
    const colWorked = findCol(['payable working days', 'worked days', 'duty days']);
    const colBasic = findCol(['basic salary', 'basic']);
    const colDa = findCol(['da']);
    const colHra = findCol(['hra']);
    const colSpecial = findCol(['special']);
    const colGross = findCol(['gross earnings', 'gross']);
    const colPf = findCol(['pf (12%)', 'pf']);
    const colEsic = findCol(['esic']);
    const colPt = findCol(['pt']);
    const colNet = findCol(['net take home', 'net pay']);
    const colBank = findCol(['bank account', 'account']);
    const colIfsc = findCol(['ifsc']);
    const colUan = findCol(['uan']);
    const colPfNo = findCol(['pf no']);
    const colEsicNo = findCol(['esic no']);
    const colMobile = findCol(['mobile', 'whats', 'phone']);

    const newSlips = [];
    const newUsers = [];

    // Determine monthYear from file name or top title
    let monthYear = 'August 2026';
    for (let r = 0; r < headerIdx; r++) {
      const txt = (rows[r] || []).join(' ');
      if (txt.toLowerCase().includes('2026')) {
        const mMatch = txt.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+2026/i);
        if (mMatch) monthYear = mMatch[0];
      }
    }

    for (let i = headerIdx + 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || !r[colEmpId] || String(r[colEmpId]).toLowerCase().includes('total')) continue;

      const empId = String(r[colEmpId]).trim();
      const name = String(r[colName] || '').trim();
      if (!name) continue;

      const fatherName = colFather !== -1 ? String(r[colFather] || '').trim() : '';
      const designation = colDesig !== -1 ? String(r[colDesig] || 'Staff').trim() : 'Staff';
      const category = colCat !== -1 ? String(r[colCat] || 'Skilled').trim() : 'Skilled';
      const site = colSite !== -1 ? String(r[colSite] || 'ACC Chanda').trim() : 'ACC Chanda';
      const totalDays = Number(r[colDays]) || 31;
      const workedDays = Number(r[colWorked]) || 31;

      const basic = Number(r[colBasic]) || 0;
      const da = Number(r[colDa]) || 0;
      const hra = Number(r[colHra]) || 0;
      const specialAllowance = Number(r[colSpecial]) || 0;
      const grossPay = Number(r[colGross]) || (basic + da + hra + specialAllowance);

      const pf = Number(r[colPf]) || 0;
      const esic = Number(r[colEsic]) || 0;
      const pt = Number(r[colPt]) || 200;
      const totalDeductions = (pf + esic + pt);
      const netPay = Number(r[colNet]) || (grossPay - totalDeductions);

      const bankAccount = colBank !== -1 ? String(r[colBank] || '').trim() : '';
      const ifsc = colIfsc !== -1 ? String(r[colIfsc] || '').trim() : '';
      const uan = colUan !== -1 ? String(r[colUan] || '').trim() : '';
      const pfNo = colPfNo !== -1 ? String(r[colPfNo] || '').trim() : '';
      const esicNo = colEsicNo !== -1 ? String(r[colEsicNo] || '').trim() : '';

      let rawMob = colMobile !== -1 ? String(r[colMobile] || '').trim() : '';
      const cleanMobile = rawMob.replace(/\D/g, '').slice(-10);

      const userId = `usr-${empId.toLowerCase()}`;
      newUsers.push({
        id: userId,
        empId,
        name,
        fatherName,
        email: `${empId.toLowerCase()}@shreerr.com`,
        role: designation.includes('Manager') ? 'HR / Payroll Manager' : (designation.includes('Supervisor') ? 'Site Supervisor' : 'Worker / Operator'),
        designation,
        department: 'Plant Operations',
        site,
        category,
        phone: cleanMobile ? `+91 ${cleanMobile}` : '',
        mobile: cleanMobile,
        baseSalary: grossPay,
        bankAccount: bankAccount ? `${ifsc} - ${bankAccount}` : '',
        ifsc,
        uan,
        pfNo,
        esicNo,
        status: 'Active'
      });

      const slipId = `slp-${monthYear.toLowerCase().replace(/\s+/g, '-')}-${empId.toLowerCase()}`;
      newSlips.push({
        id: slipId,
        userId,
        empId,
        userName: name,
        fatherName,
        monthYear,
        month: monthYear.split(' ')[0],
        year: monthYear.split(' ')[1] || '2026',
        designation,
        department: 'Plant Operations',
        category,
        location: site,
        totalDays,
        workedDays,
        mobile: cleanMobile,
        phone: cleanMobile ? `+91 ${cleanMobile}` : '',
        bankAccount,
        ifsc,
        uan,
        pfNo,
        esicNo,
        earnings: { basic, da, hra, specialAllowance, bonus: 0, otWage: 0 },
        deductions: { pf, esic, pt, lic: 0, advance: 0 },
        grossPay,
        totalDeductions,
        netPay,
        status: 'Paid',
        paymentDate: '2026-08-31',
        isManuallyCorrected: false,
        manualLocked: true
      });
    }

    // Save to data/payroll_db.json
    if (fs.existsSync(dbPath)) {
      const rawDb = fs.readFileSync(dbPath, 'utf8');
      const db = JSON.parse(rawDb);
      const admin = db.users.find(u => u.role === 'Super Admin');
      db.users = admin ? [admin, ...newUsers] : newUsers;
      
      // Merge slips
      const slipMap = new Map();
      (db.salarySlips || []).forEach(s => slipMap.set(s.id, s));
      newSlips.forEach(s => slipMap.set(s.id, s));
      db.salarySlips = Array.from(slipMap.values());

      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
    }

    // Cleanup upload
    try { fs.unlinkSync(filePath); } catch (e) {}

    res.json({
      success: true,
      message: `Successfully imported ${newSlips.length} employees from Excel for ${monthYear}!`,
      count: newSlips.length,
      monthYear
    });

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Preview PDF for a slip
app.get('/api/preview-pdf/:id', async (req, res) => {
  try {
    const slips = getLocalPayrollSlips();
    const slip = slips.find(s => String(s.id).toLowerCase() === String(req.params.id).toLowerCase());
    if (!slip) {
      return res.status(404).send('Salary slip not found');
    }
    const pdfBuf = await generateSalarySlipPdf(slip);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Salary_Slip_${slip.empId || 'EMP'}.pdf"`);
    res.send(pdfBuf);
  } catch (err) {
    res.status(500).send('Error generating PDF: ' + err.message);
  }
});

// 5. Send Single Slip PDF
app.post('/api/send-single', async (req, res) => {
  const { slip } = req.body;
  if (!slip) return res.status(400).json({ success: false, error: 'Slip data required' });
  if (!slip.mobile || slip.mobile.length !== 10) {
    return res.status(400).json({ success: false, error: 'Valid 10-digit mobile number required' });
  }

  try {
    const pdfBuf = await generateSalarySlipPdf(slip);
    const fileName = `Salary_Slip_${(slip.monthYear || 'Month').replace(/\s+/g, '_')}_${slip.empId || 'EMP'}.pdf`;
    const caption = `📄 *SHREE RR TRADING COMPANY*\nOfficial Salary Slip for *${slip.monthYear || '2026'}*\n\n` +
      `👤 *Employee:* ${slip.userName || 'Staff'} (${slip.empId || 'SRR'})\n` +
      `🏢 *Designation:* ${slip.designation || 'Staff'}\n` +
      `🗓️ *Payable Days:* ${slip.workedDays || 31} / ${slip.totalDays || 31} Days\n` +
      `💰 *Net Take Home Pay:* ₹${Number(slip.netPay || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n\n` +
      `_Aapki official stamped PDF salary slip upar attach kar di gayi hai. Ise khol kar check karein._\n\n` +
      `*Shree RR Trading Company* | ACC Chanda Plant Site`;

    const sendRes = await whatsappService.sendSalarySlipDocument({
      mobile: slip.mobile,
      pdfBuffer: pdfBuf,
      fileName,
      caption,
      employeeName: slip.userName
    });

    res.json({ success: true, ...sendRes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Send Batch Slips with Anti-Ban Delay
app.post('/api/send-batch', async (req, res) => {
  const { slips, delaySeconds = 10 } = req.body;
  if (!Array.isArray(slips) || slips.length === 0) {
    return res.status(400).json({ success: false, error: 'No slips provided for dispatch' });
  }

  if (batchState.running) {
    return res.status(400).json({ success: false, error: 'A batch dispatch is already running!' });
  }

  batchState = {
    running: true,
    total: slips.length,
    current: 0,
    sent: 0,
    failed: 0,
    logs: [],
    currentSlip: null,
    stopped: false
  };

  res.json({ success: true, message: 'Batch dispatch started', total: slips.length });

  (async () => {
    for (let i = 0; i < slips.length; i++) {
      if (batchState.stopped) {
        batchState.logs.unshift({ time: new Date().toLocaleTimeString(), text: 'Batch dispatch cancelled by user.' });
        break;
      }

      const slip = slips[i];
      batchState.current = i + 1;
      batchState.currentSlip = slip;

      const logPrefix = `[${i + 1}/${slips.length}] ${slip.userName || 'Employee'} (${slip.mobile || 'No Mobile'})`;

      if (!slip.mobile || String(slip.mobile).length !== 10) {
        batchState.failed++;
        batchState.logs.unshift({
          time: new Date().toLocaleTimeString(),
          status: 'error',
          text: `${logPrefix} ❌ Skipped: Invalid mobile number.`
        });
        continue;
      }

      try {
        const pdfBuf = await generateSalarySlipPdf(slip);
        const fileName = `Salary_Slip_${(slip.monthYear || 'Month').replace(/\s+/g, '_')}_${slip.empId || 'EMP'}.pdf`;
        const caption = `📄 *SHREE RR TRADING COMPANY*\nOfficial Salary Slip for *${slip.monthYear || '2026'}*\n\n` +
          `👤 *Employee:* ${slip.userName || 'Staff'} (${slip.empId || 'SRR'})\n` +
          `🏢 *Designation:* ${slip.designation || 'Staff'}\n` +
          `🗓️ *Payable Days:* ${slip.workedDays || 31} / ${slip.totalDays || 31} Days\n` +
          `💰 *Net Take Home Pay:* ₹${Number(slip.netPay || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n\n` +
          `_Aapki official stamped PDF salary slip upar attach kar di gayi hai. Ise khol kar check karein._\n\n` +
          `*Shree RR Trading Company* | ACC Chanda Plant Site`;

        await whatsappService.sendSalarySlipDocument({
          mobile: slip.mobile,
          pdfBuffer: pdfBuf,
          fileName,
          caption,
          employeeName: slip.userName
        });

        batchState.sent++;
        batchState.logs.unshift({
          time: new Date().toLocaleTimeString(),
          status: 'success',
          text: `${logPrefix} ✅ PDF Sent Successfully via WhatsApp!`
        });

      } catch (sendErr) {
        batchState.failed++;
        batchState.logs.unshift({
          time: new Date().toLocaleTimeString(),
          status: 'error',
          text: `${logPrefix} ❌ Failed: ${sendErr.message}`
        });
      }

      // Anti-ban delay between employees
      if (i < slips.length - 1 && !batchState.stopped) {
        const jitter = Math.floor(Math.random() * 3) - 1;
        const actualDelay = Math.max(6, delaySeconds + jitter) * 1000;
        
        batchState.logs.unshift({
          time: new Date().toLocaleTimeString(),
          status: 'waiting',
          text: `⏳ Anti-Ban Safe Delay: Waiting ${(actualDelay / 1000).toFixed(0)}s before next employee...`
        });

        await new Promise(r => setTimeout(r, actualDelay));
      }
    }

    batchState.running = false;
    batchState.currentSlip = null;
    batchState.logs.unshift({
      time: new Date().toLocaleTimeString(),
      status: 'complete',
      text: `🎉 Batch Completed! Sent: ${batchState.sent}, Failed: ${batchState.failed}`
    });
  })().catch(err => {
    console.error('Batch loop error:', err);
    batchState.running = false;
  });
});

// 7. Batch Progress
app.get('/api/batch-progress', (req, res) => {
  res.json({ success: true, ...batchState });
});

// 8. Stop Batch
app.post('/api/batch-stop', (req, res) => {
  batchState.stopped = true;
  res.json({ success: true, message: 'Stopping batch dispatch...' });
});

// 9. Logout WhatsApp
app.post('/api/logout', async (req, res) => {
  try {
    await whatsappService.logout();
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Ensure uploads dir
if (!fs.existsSync(path.join(__dirname, 'uploads/'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads/'), { recursive: true });
}

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Shree RR Trading - WhatsApp PDF Auto-Sender Ready!`);
  console.log(`🌐 Local Web Dashboard: http://localhost:${PORT}`);
  console.log(`=======================================================`);
  whatsappService.init();
});
