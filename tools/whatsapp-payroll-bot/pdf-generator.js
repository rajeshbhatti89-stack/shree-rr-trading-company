const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const logoPath = path.join(__dirname, '..', '..', 'public', 'images', 'logo.png');
const srijandevLogoPath = path.join(__dirname, '..', '..', 'public', 'images', 'srijandev_logo.png');

const logoBase64 = fs.existsSync(logoPath) ? `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}` : '';
const srijandevBase64 = fs.existsSync(srijandevLogoPath) ? `data:image/png;base64,${fs.readFileSync(srijandevLogoPath).toString('base64')}` : '';

let sharedBrowser = null;

async function getBrowser() {
  if (sharedBrowser && sharedBrowser.isConnected()) {
    return sharedBrowser;
  }
  sharedBrowser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  return sharedBrowser;
}

function numberToWords(num) {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Only ' : 'Only';
  return str.trim();
}

function fmt(v) {
  return `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function buildScreenshot1Html(slip) {
  const otVal = Number(slip.earnings?.otWage !== undefined ? slip.earnings.otWage : (slip.otWage || 0));
  const netInt = Math.round(Number(slip.netPay || 0));
  const netWords = numberToWords(netInt);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background: #ffffff;
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0F172A;
      padding: 0;
      margin: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .official-salary-slip {
      background: #FFFFFF;
      border: 1.5px solid #0B1936;
      padding: 24px 28px;
      width: 100%;
      min-height: 100%;
    }

    .slip-top-brand {
      display: flex;
      align-items: center;
      gap: 20px;
      border-bottom: 2px solid #0B1936;
      padding-bottom: 14px;
      margin-bottom: 14px;
    }

    .slip-logo {
      height: 64px;
      width: auto;
      object-fit: contain;
    }

    .slip-company-info h2 {
      font-size: 21px;
      font-weight: 900;
      color: #0B1936;
      letter-spacing: -0.01em;
      margin-bottom: 2px;
    }

    .slip-sub {
      font-size: 11.5px;
      font-weight: 600;
      color: #64748B;
      margin-bottom: 2px;
    }

    .slip-site {
      font-size: 11px;
      color: #94A3B8;
      margin-bottom: 4px;
    }

    .slip-month-title {
      font-size: 13px;
      font-weight: 800;
      color: #FF6B00;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .slip-emp-details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 11.5px;
      line-height: 1.85;
      margin-bottom: 12px;
    }

    .slip-emp-details-grid div strong {
      color: #0F172A;
      display: inline-block;
      min-width: 135px;
    }

    .slip-attendance-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 16px;
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      border-radius: 4px;
      font-size: 11.5px;
      margin-bottom: 12px;
    }

    .slip-attendance-row strong {
      color: #0B1936;
    }

    .slip-calc-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11.5px;
      margin-bottom: 12px;
      border: 1.5px solid #0B1936;
    }

    .slip-calc-table th, .slip-calc-table td {
      border: 1px solid #CBD5E1;
      padding: 7.5px 12px;
    }

    .slip-calc-table thead th {
      background: #F1F5F9;
      font-weight: 800;
      color: #0B1936;
      font-size: 11.5px;
    }

    .slip-calc-table tbody td {
      color: #1E293B;
    }

    .text-right {
      text-align: right;
    }

    .slip-foot-gross th {
      background: #F8FAFC;
      font-weight: 800;
      color: #0B1936;
      font-size: 11.5px;
    }

    .slip-foot-net th {
      background: #E2E8F0;
      font-weight: 900;
      color: #0B1936;
    }

    .slip-net-words-box {
      padding: 9px 14px;
      background: #F8FAFC;
      font-size: 11px;
      margin-bottom: 22px;
      border: 1px solid #CBD5E1;
      border-radius: 4px;
    }

    .slip-signature-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 25px;
      margin-bottom: 20px;
    }

    .sig-box {
      width: 250px;
    }

    .sig-box.text-right {
      text-align: right;
    }

    .sig-box p {
      font-size: 11px;
      color: #475569;
    }

    .auth-stamp {
      font-size: 10px;
      color: #64748B;
      margin-top: 4px;
    }

    .slip-srijandev-footer {
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid #CBD5E1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9px;
      color: #64748B;
    }

    .slip-srijandev-footer img {
      height: 18px;
      width: auto;
      object-fit: contain;
    }
  </style>
</head>
<body>

  <div class="official-salary-slip">
    <!-- Top Header Banner -->
    <div class="slip-top-brand">
      ${logoBase64 ? `<img src="${logoBase64}" alt="Shree RR Trading Company" class="slip-logo">` : ''}
      <div class="slip-company-info">
        <h2>SHREE RR TRADING COMPANY</h2>
        <p class="slip-sub">Plant O&M, Heavy Fleets & Earth Moving Machinery Contracts</p>
        <p class="slip-site">ACC Chanda Plant Site & Operations</p>
        <div class="slip-month-title">PAY SLIP FOR ${(slip.monthYear || 'AUGUST 2026').toUpperCase()}</div>
      </div>
    </div>

    <!-- Employee Details Grid -->
    <div class="slip-emp-details-grid">
      <div>
        <div><strong>Employee ID:</strong> <span>${slip.empId || slip.userId || 'SRR'}</span></div>
        <div><strong>Employee Name:</strong> <span>${slip.userName || '-'}</span></div>
        <div><strong>Father/Husband Name:</strong> <span>${slip.fatherName || '-'}</span></div>
        <div><strong>Designation:</strong> <span>${slip.designation || 'Staff'}</span></div>
        <div><strong>Category:</strong> <span>${slip.category || 'Skilled'}</span></div>
        <div><strong>Location:</strong> <span>${slip.location || slip.site || 'ACC Chanda'}</span></div>
      </div>
      <div>
        <div><strong>Date of Birth:</strong> <span>${slip.dob || '-'}</span></div>
        <div><strong>Date of Joining:</strong> <span>${slip.doj || '-'}</span></div>
        <div><strong>UAN Number:</strong> <span>${slip.uan || '-'}</span></div>
        <div><strong>PF Number:</strong> <span>${slip.pfNo || '-'}</span></div>
        <div><strong>ESIC Number:</strong> <span>${slip.esicNo || '-'}</span></div>
        <div><strong>Bank Account & IFSC:</strong> <span>${slip.bankAccount || '-'} (${slip.ifsc || '-'})</span></div>
      </div>
    </div>

    <!-- Attendance Row -->
    <div class="slip-attendance-row">
      <div><strong>Total Days in Month:</strong> <span>${slip.totalDays || 31}</span></div>
      <div><strong>Payable Working Days:</strong> <span>${slip.workedDays || 31}</span></div>
      <div><strong>Mobile Number:</strong> <span>${slip.mobile ? `+91 ${slip.mobile}` : (slip.phone || '-')}</span></div>
    </div>

    <!-- Earnings & Deductions Table -->
    <table class="slip-calc-table">
      <thead>
        <tr>
          <th colspan="2" style="text-align: left; background: #F1F5F9;">EARNINGS</th>
          <th colspan="2" style="text-align: left; background: #F1F5F9;">DEDUCTIONS</th>
        </tr>
        <tr>
          <th style="width: 32%;">Description</th>
          <th class="text-right" style="width: 18%;">Amount (₹)</th>
          <th style="width: 32%;">Description</th>
          <th class="text-right" style="width: 18%;">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Basic Salary</td>
          <td class="text-right">${fmt(slip.earnings?.basic)}</td>
          <td>Provident Fund (PF @ 12%)</td>
          <td class="text-right">${fmt(slip.deductions?.pf)}</td>
        </tr>
        <tr>
          <td>Dearness Allowance (DA)</td>
          <td class="text-right">${fmt(slip.earnings?.da)}</td>
          <td>ESIC Contribution</td>
          <td class="text-right">${fmt(slip.deductions?.esic)}</td>
        </tr>
        <tr>
          <td>House Rent Allowance (HRA)</td>
          <td class="text-right">${fmt(slip.earnings?.hra)}</td>
          <td>Professional Tax (PT)</td>
          <td class="text-right">${fmt(slip.deductions?.pt)}</td>
        </tr>
        <tr>
          <td>Special Allowance / Field Pay</td>
          <td class="text-right">${fmt(slip.earnings?.specialAllowance)}</td>
          <td>LIC Premium / Other</td>
          <td class="text-right">${fmt(slip.deductions?.lic)}</td>
        </tr>
        <tr>
          <td>Overtime (OT) Wages</td>
          <td class="text-right">${fmt(otVal)}</td>
          <td>Advance / Adjustments</td>
          <td class="text-right">${fmt(slip.deductions?.advance)}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="slip-foot-gross">
          <th>GROSS EARNINGS</th>
          <th class="text-right">${fmt(slip.grossPay)}</th>
          <th>TOTAL DEDUCTIONS</th>
          <th class="text-right">${fmt(slip.totalDeductions)}</th>
        </tr>
        <tr class="slip-foot-net">
          <th colspan="2" style="font-size: 12px; font-weight: 900;">NET TAKE HOME PAY</th>
          <th colspan="2" class="text-right" style="font-size: 15px; font-weight: 900; color: #FF6B00;">${fmt(slip.netPay)}</th>
        </tr>
      </tfoot>
    </table>

    <!-- Amount in Words -->
    <div class="slip-net-words-box">
      <strong>Amount in Words:</strong> <span>Indian Rupees ${netWords}</span>
    </div>

    <!-- Signature Row -->
    <div class="slip-signature-row">
      <div class="sig-box">
        <p style="border-top: 1px dashed #94A3B8; padding-top: 6px;">Employee Signature / Thumb</p>
      </div>
      <div class="sig-box text-right">
        <p><strong>For SHREE RR TRADING COMPANY</strong></p>
        <div class="auth-stamp" style="margin-top: 25px;">Authorized Signatory / Managing Director</div>
      </div>
    </div>

    <!-- SrijanDev Footer -->
    <div class="slip-srijandev-footer">
      <div style="display: flex; align-items: center; gap: 8px;">
        ${srijandevBase64 ? `<img src="${srijandevBase64}" alt="SrijanDev">` : ''}
        <div>
          <span>© 2026 <strong>SrijanDev</strong>. All Rights Reserved.</span>
          <span style="margin: 0 4px;">•</span>
          <span>Powered by SrijanDev Operations & Payroll Engine</span>
        </div>
      </div>
      <div style="text-align: right;">
        <span>System Generated Official Payslip</span>
        <span style="margin: 0 4px;">•</span>
        <span>Valid Without Physical Signature</span>
      </div>
    </div>
  </div>

</body>
</html>
`;
}

async function generateSalarySlipPdf(slip) {
  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
    const html = buildScreenshot1Html(slip);

    await page.setContent(html, { waitUntil: 'load' });

    const pdfBuf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '8mm',
        bottom: '8mm',
        left: '10mm',
        right: '10mm'
      }
    });

    await page.close();
    return Buffer.from(pdfBuf);
  } catch (err) {
    console.error('PDF generation error, fallback:', err);
    throw err;
  }
}

module.exports = {
  generateSalarySlipPdf,
};
