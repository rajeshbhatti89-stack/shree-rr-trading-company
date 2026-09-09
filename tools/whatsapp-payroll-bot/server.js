const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { whatsappService } = require('./whatsapp-service');
const { generateSalarySlipPdf } = require('./pdf-generator');

const app = express();
const PORT = process.env.PORT || 3300;

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

// Helper: fetch slips from live API or fallback to local DB
async function getPayrollSlips() {
  let slips = [];
  let users = [];

  // Try live Cloudflare Workers API
  try {
    const res = await fetch('https://payroll.shreerrtradingcompany.com/api/payroll/salary-slips');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.salarySlips)) {
        slips = data.salarySlips;
      }
    }
  } catch (netErr) {
    console.warn('[Server] Could not connect to live API, checking local DB:', netErr.message);
  }

  // Also try to get live users for mobile mapping
  try {
    const uRes = await fetch('https://payroll.shreerrtradingcompany.com/api/payroll/users');
    if (uRes.ok) {
      const uData = await uRes.json();
      if (uData.success && Array.isArray(uData.users)) {
        users = uData.users;
      }
    }
  } catch (e) {}

  // Fallback to local data/payroll_db.json
  if (slips.length === 0) {
    const localDbPath = path.join(__dirname, '..', '..', 'data', 'payroll_db.json');
    if (fs.existsSync(localDbPath)) {
      try {
        const raw = fs.readFileSync(localDbPath, 'utf8');
        const db = JSON.parse(raw);
        if (Array.isArray(db.salarySlips)) slips = db.salarySlips;
        if (Array.isArray(db.users)) users = db.users;
      } catch (err) {
        console.error('[Server] Error reading local DB:', err);
      }
    }
  }

  // Map mobile numbers cleanly
  const userMap = new Map();
  users.forEach(u => {
    if (u.id) userMap.set(String(u.id).toLowerCase(), u);
    if (u.empId) userMap.set(String(u.empId).toLowerCase(), u);
  });

  return slips.map(s => {
    let mob = s.mobile || s.phone || '';
    if (!mob && s.userId) {
      const u = userMap.get(String(s.userId).toLowerCase()) || userMap.get(String(s.empId || '').toLowerCase());
      if (u) mob = u.mobile || u.phone || '';
    }
    const cleanMob = String(mob).replace(/\D/g, '').slice(-10);
    return {
      ...s,
      mobile: cleanMob
    };
  });
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
app.get('/api/slips', async (req, res) => {
  try {
    const slips = await getPayrollSlips();
    const month = req.query.month;
    const filtered = month 
      ? slips.filter(s => String(s.monthYear || '').toLowerCase() === String(month).toLowerCase())
      : slips;
    res.json({ success: true, count: filtered.length, slips: filtered });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Preview PDF for a slip
app.get('/api/preview-pdf/:id', async (req, res) => {
  try {
    const slips = await getPayrollSlips();
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

// 4. Send Single Slip PDF
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

// 5. Send Batch Slips with Anti-Ban Delay
app.post('/api/send-batch', async (req, res) => {
  const { slips, delaySeconds = 8 } = req.body;
  if (!Array.isArray(slips) || slips.length === 0) {
    return res.status(400).json({ success: false, error: 'No slips provided for dispatch' });
  }

  if (batchState.running) {
    return res.status(400).json({ success: false, error: 'A batch dispatch is already running!' });
  }

  // Initialize batch state
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

  // Run in background
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

      // Anti-ban delay between employees (except last one)
      if (i < slips.length - 1 && !batchState.stopped) {
        // Random jitter (e.g. 8s +- 2s) for human-like pattern
        const jitter = Math.floor(Math.random() * 3) - 1;
        const actualDelay = Math.max(5, delaySeconds + jitter) * 1000;
        
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

// 6. Batch Progress
app.get('/api/batch-progress', (req, res) => {
  res.json({ success: true, ...batchState });
});

// 7. Stop Batch
app.post('/api/batch-stop', (req, res) => {
  batchState.stopped = true;
  res.json({ success: true, message: 'Stopping batch dispatch...' });
});

// 8. Logout WhatsApp
app.post('/api/logout', async (req, res) => {
  try {
    await whatsappService.logout();
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Shree RR Trading - WhatsApp PDF Auto-Sender Ready!`);
  console.log(`🌐 Local Web Dashboard: http://localhost:${PORT}`);
  console.log(`=======================================================`);
  whatsappService.init();
});
