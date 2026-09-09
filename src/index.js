import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// 1. Global CORS & Security Response Headers
app.use('*', cors())

app.use('*', async (c, next) => {
  await next()
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'SAMEORIGIN')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  c.header('X-XSS-Protection', '1; mode=block')
})

// 2. Global Error Handler - Prevents Internal Stack Traces & Key Leaks
app.onError((err, c) => {
  console.error('[Secure Error Handler]:', err && err.message ? err.message : err)
  return c.json({
    success: false,
    message: 'An internal server error occurred. Please try again or contact system support.'
  }, 500)
})

// Global 404 Handler
app.notFound((c) => {
  return c.json({
    success: false,
    message: 'Requested API endpoint was not found on this server.'
  }, 404)
})

// Subdomain auto-redirect to /payroll/
app.use('*', async (c, next) => {
  const url = new URL(c.req.url)
  if (url.hostname.startsWith('payroll.')) {
    if (url.pathname === '/' || url.pathname === '' || url.pathname === '/index.html') {
      return c.redirect('/payroll/', 302)
    }
  }
  await next()
})

// Security Input Sanitization & Validation Helpers
function sanitizeString(val, maxLen = 300) {
  if (val === null || val === undefined) return ''
  const str = String(val).trim()
  return str
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .slice(0, maxLen)
}

function sanitizeEmail(val) {
  if (!val) return ''
  return String(val)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@._+-]/g, '')
    .slice(0, 150)
}

function sanitizeAlphanumeric(val, maxLen = 100) {
  if (!val) return ''
  return String(val)
    .trim()
    .replace(/[^a-zA-Z0-9\-_./ ]/g, '')
    .slice(0, maxLen)
}

function sanitizeNumber(val, defaultVal = 0, min = 0, max = 100000000) {
  const num = Number(val)
  if (isNaN(num)) return defaultVal
  return Math.min(Math.max(num, min), max)
}

function sanitizeDateString(val) {
  if (!val) return ''
  const str = String(val).trim()
  return str.replace(/[^0-9\-/T:Z.]/g, '').slice(0, 35)
}

// Clean Seed Data: Super Admin + 31 Employees (Vehicles cleared for fresh bulk upload, B/D & MTTR tracking ready)
const DEFAULT_INITIAL_DB = {
  "users": [
    {
      "id": "usr-admin-srijandev",
      "empId": "SRR-ADMIN",
      "name": "Super Administrator",
      "email": "admin@srijandev.in",
      "password": "Jaishreeram@907",
      "role": "Super Admin",
      "designation": "System Administrator",
      "rank": "Executive Management",
      "department": "Corporate & Administration",
      "site": "Headquarters / All Sites",
      "location": "ACC Chanda & Darlaghat",
      "phone": "+91 98057 75907",
      "mobile": "9805775907",
      "fatherName": "",
      "dob": "01/01/1985",
      "doj": "01/01/2024",
      "uan": "",
      "esicNo": "",
      "pfNo": "",
      "bankAccount": "",
      "ifsc": "",
      "category": "Executive",
      "baseSalary": 150000,
      "ctc": 150000,
      "status": "Active",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "loginEnabled": true,
      "permissions": {
        "*": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": false,
      "loginAllowed": true
    },
    {
      "id": "usr-srr002",
      "empId": "SRR002",
      "name": "MOHMMAD IRFAN SULEMAN SIDDIKI",
      "email": "srr002@shreerrtradingcompany.com",
      "password": "SRR002@123",
      "role": "Employee",
      "designation": "Mechanic",
      "rank": "Mechanic",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 9822852945",
      "mobile": "9822852945",
      "fatherName": "SULEMAN",
      "dob": "08/11/1977",
      "doj": "12/01/2025",
      "uan": "101306845435",
      "esicNo": "",
      "pfNo": "HPSML37703770000010029",
      "bankAccount": "60114961877",
      "ifsc": "MAHB0001139",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 27,
      "weakOff": 4,
      "leave": 0,
      "payableDays": 31,
      "basicPerDay": null,
      "ctc": 35000,
      "baseSalary": 35000,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr004",
      "empId": "SRR004",
      "name": "SHEIKH ISUB SHEIKH KASAM",
      "email": "srr004@shreerrtradingcompany.com",
      "password": "SRR004@123",
      "role": "Employee",
      "designation": "Mechanic",
      "rank": "Mechanic",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 9960375227",
      "mobile": "9960375227",
      "fatherName": "MR. SHEIKH KASAM",
      "dob": "06/07/1986",
      "doj": "12/01/2025",
      "uan": "100688645676",
      "esicNo": "2303010526",
      "pfNo": "HPSML37703770000010028",
      "bankAccount": "32049452658",
      "ifsc": "SBIN0006872",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 27,
      "weakOff": 0,
      "leave": 0,
      "payableDays": 27,
      "basicPerDay": 444.62,
      "ctc": null,
      "baseSalary": 13338.6,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 2,
      "leaveBalance": 8,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr005",
      "empId": "SRR005",
      "name": "Ramesh Komuraiah Rudrarapu",
      "email": "srr005@shreerrtradingcompany.com",
      "password": "SRR005@123",
      "role": "Employee",
      "designation": "Mechanic",
      "rank": "Mechanic",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 9960139135",
      "mobile": "9960139135",
      "fatherName": "RUDRARAM KOMURAIAH",
      "dob": "25/01/1985",
      "doj": "12/01/2025",
      "uan": "102288509946",
      "esicNo": "",
      "pfNo": "HPSML37703770000010008",
      "bankAccount": "10794346484",
      "ifsc": "SBIN0006872",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 22,
      "weakOff": 4,
      "leave": 5,
      "payableDays": 31,
      "basicPerDay": null,
      "ctc": 28000,
      "baseSalary": 28000,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr006",
      "empId": "SRR006",
      "name": "PRAVIN PURUSHOTTAM PENDOR",
      "email": "srr006@shreerrtradingcompany.com",
      "password": "SRR006@123",
      "role": "Worker",
      "designation": "Helper",
      "rank": "Helper",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 8605585979",
      "mobile": "8605585979",
      "fatherName": "PURUSHOTTAM PANDOOR",
      "dob": "17/05/1988",
      "doj": "12/01/2025",
      "uan": "100688645243",
      "esicNo": "2303045153",
      "pfNo": "HPSML37703770000010002",
      "bankAccount": "33241787677",
      "ifsc": "SBIN0006872",
      "category": "Semi-Skilled",
      "daysInMonth": 31,
      "presentDays": 27,
      "weakOff": 0,
      "leave": 0,
      "payableDays": 27,
      "basicPerDay": 428.77,
      "ctc": null,
      "baseSalary": 12863.099999999999,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr008",
      "empId": "SRR008",
      "name": "Lokesh Raju Daheka",
      "email": "srr008@shreerrtradingcompany.com",
      "password": "SRR008@123",
      "role": "Worker",
      "designation": "Helper",
      "rank": "Helper",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 7666972959",
      "mobile": "7666972959",
      "fatherName": "RAJU DAHEKAR",
      "dob": "25/12/2005",
      "doj": "12/01/2025",
      "uan": "102287602720",
      "esicNo": "1415892943",
      "pfNo": "HPSML37703770000010011",
      "bankAccount": "60559700055",
      "ifsc": "MAHB0001088",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 26,
      "weakOff": 5,
      "leave": 0,
      "payableDays": 31,
      "basicPerDay": null,
      "ctc": null,
      "baseSalary": 25000,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr009",
      "empId": "SRR009",
      "name": "Hamid Ahmad Nizamuddin Sheikh",
      "email": "srr009@shreerrtradingcompany.com",
      "password": "SRR009@123",
      "role": "Worker",
      "designation": "Helper",
      "rank": "Helper",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 9527291665",
      "mobile": "9527291665",
      "fatherName": "NIJAMUDEEN SHEIKH",
      "dob": "04/06/1994",
      "doj": "12/01/2025",
      "uan": "102287823992",
      "esicNo": "1415892773",
      "pfNo": "HPSML37703770000010005",
      "bankAccount": "33553423397",
      "ifsc": "SBIN0006872",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 26,
      "weakOff": 4,
      "leave": 1,
      "payableDays": 31,
      "basicPerDay": null,
      "ctc": null,
      "baseSalary": 25000,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr010",
      "empId": "SRR010",
      "name": "MO HASIM ABDUL NAIM ANSARI",
      "email": "srr010@shreerrtradingcompany.com",
      "password": "SRR010@123",
      "role": "Employee",
      "designation": "Welder / Fitter",
      "rank": "Welder / Fitter",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 7776039252",
      "mobile": "7776039252",
      "fatherName": "NAIM ANSARI",
      "dob": "24/11/1968",
      "doj": "12/01/2025",
      "uan": "101265795612",
      "esicNo": "",
      "pfNo": "HPSML37703770000010004",
      "bankAccount": "36566678237",
      "ifsc": "SBIN0006045",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 27,
      "weakOff": 4,
      "leave": 0,
      "payableDays": 31,
      "basicPerDay": null,
      "ctc": 30000,
      "baseSalary": 30000,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr011",
      "empId": "SRR011",
      "name": "Pawan Raju Asapwar",
      "email": "srr011@shreerrtradingcompany.com",
      "password": "SRR011@123",
      "role": "Employee",
      "designation": "Welder / Fitter",
      "rank": "Welder / Fitter",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 9322382571",
      "mobile": "9322382571",
      "fatherName": "VITTHAL ASAPWAR",
      "dob": "29/05/2004",
      "doj": "12/01/2025",
      "uan": "102287609045",
      "esicNo": "1415892774",
      "pfNo": "HPSML37703770000010013",
      "bankAccount": "36746757262",
      "ifsc": "SBIN0006872",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 25,
      "weakOff": 4,
      "leave": 2,
      "payableDays": 31,
      "basicPerDay": null,
      "ctc": null,
      "baseSalary": 25000,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr012",
      "empId": "SRR012",
      "name": "TAUSIF KHAN",
      "email": "srr012@shreerrtradingcompany.com",
      "password": "SRR012@123",
      "role": "Employee",
      "designation": "Auto Electrician",
      "rank": "Auto Electrician",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 7667313126",
      "mobile": "7667313126",
      "fatherName": "AASIF KHAN",
      "dob": "27/09/1997",
      "doj": "12/01/2025",
      "uan": "101777512672",
      "esicNo": "",
      "pfNo": "HPSML37703770000010015",
      "bankAccount": "39692648513",
      "ifsc": "SBIN0014664",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 27,
      "weakOff": 4,
      "leave": 0,
      "payableDays": 31,
      "basicPerDay": null,
      "ctc": 35000,
      "baseSalary": 35000,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr014",
      "empId": "SRR014",
      "name": "RAJU BALAJI KULMETHE",
      "email": "srr014@shreerrtradingcompany.com",
      "password": "SRR014@123",
      "role": "Worker",
      "designation": "Operator",
      "rank": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 8999776972",
      "mobile": "8999776972",
      "fatherName": "BALAJI",
      "dob": "07/07/1975",
      "doj": "12/01/2025",
      "uan": "100687937899",
      "esicNo": "2303010417",
      "pfNo": "HPSML37703770000010012",
      "bankAccount": "31564867222",
      "ifsc": "SBIN0006872",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 25,
      "weakOff": 0,
      "leave": 0,
      "payableDays": 25,
      "basicPerDay": 444.62,
      "ctc": null,
      "baseSalary": 13338.6,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 1,
      "leaveBalance": 9,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr015",
      "empId": "SRR015",
      "name": "AAVUNOORI SRINIVAS",
      "email": "srr015@shreerrtradingcompany.com",
      "password": "SRR015@123",
      "role": "Worker",
      "designation": "Operator",
      "rank": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 8530412624",
      "mobile": "8530412624",
      "fatherName": "MR.RAJAIAH AAVUNOORI",
      "dob": "24/06/1985",
      "doj": "12/01/2025",
      "uan": "100688646864",
      "esicNo": "2303010522",
      "pfNo": "HPSML37703770000010017",
      "bankAccount": "32912310895",
      "ifsc": "SBIN0006872",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 29,
      "weakOff": 0,
      "leave": 0,
      "payableDays": 29,
      "basicPerDay": 444.62,
      "ctc": null,
      "baseSalary": 13338.6,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr016",
      "empId": "SRR016",
      "name": "GANESH SHAMRAO GHULE",
      "email": "srr016@shreerrtradingcompany.com",
      "password": "SRR016@123",
      "role": "Worker",
      "designation": "Operator",
      "rank": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 9850345686",
      "mobile": "9850345686",
      "fatherName": "SHYAMRAO",
      "dob": "01/01/1984",
      "doj": "12/01/2025",
      "uan": "100689220406",
      "esicNo": "2303010517",
      "pfNo": "HPSML37703770000010023",
      "bankAccount": "32688972261",
      "ifsc": "SBIN0006872",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 29,
      "weakOff": 0,
      "leave": 0,
      "payableDays": 29,
      "basicPerDay": 444.62,
      "ctc": null,
      "baseSalary": 13338.6,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr017",
      "empId": "SRR017",
      "name": "SHANKAR BHUMAYYA KOLGURI",
      "email": "srr017@shreerrtradingcompany.com",
      "password": "SRR017@123",
      "role": "Worker",
      "designation": "Operator",
      "rank": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 8698989471",
      "mobile": "8698989471",
      "fatherName": "BHUMAYYA",
      "dob": "15/06/1976",
      "doj": "12/01/2025",
      "uan": "100687999139",
      "esicNo": "2303010422",
      "pfNo": "HPSML37703770000010018",
      "bankAccount": "32759687638",
      "ifsc": "SBIN0006872",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 26,
      "weakOff": 0,
      "leave": 0,
      "payableDays": 26,
      "basicPerDay": 444.62,
      "ctc": null,
      "baseSalary": 13338.6,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr018",
      "empId": "SRR018",
      "name": "DILIP CHINCHOLKAR",
      "email": "srr018@shreerrtradingcompany.com",
      "password": "SRR018@123",
      "role": "Worker",
      "designation": "Operator",
      "rank": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 8309740448",
      "mobile": "8309740448",
      "fatherName": "BABRAO",
      "dob": "01/05/1982",
      "doj": "12/01/2025",
      "uan": "100234722168",
      "esicNo": "2303010496",
      "pfNo": "HPSML37703770000010034",
      "bankAccount": "32785818786",
      "ifsc": "SBIN0006872",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 28,
      "weakOff": 0,
      "leave": 0,
      "payableDays": 28,
      "basicPerDay": 444.62,
      "ctc": null,
      "baseSalary": 13338.6,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr019",
      "empId": "SRR019",
      "name": "KRISHNA MURLIDHAR BURBANDE",
      "email": "srr019@shreerrtradingcompany.com",
      "password": "SRR019@123",
      "role": "Worker",
      "designation": "Operator",
      "rank": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 9552202985",
      "mobile": "9552202985",
      "fatherName": "MR.MURALIDHAR BURBANDE",
      "dob": "08/12/1982",
      "doj": "12/01/2025",
      "uan": "100688646654",
      "esicNo": "`2303010524",
      "pfNo": "HPSML37703770000010019",
      "bankAccount": "32705565667",
      "ifsc": "SBIN0006872",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 18,
      "weakOff": 0,
      "leave": 0,
      "payableDays": 18,
      "basicPerDay": 444.62,
      "ctc": null,
      "baseSalary": 13338.6,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr020",
      "empId": "SRR020",
      "name": "SUNIL CHARANDAS BHARNE",
      "email": "srr020@shreerrtradingcompany.com",
      "password": "SRR020@123",
      "role": "Worker",
      "designation": "Operator",
      "rank": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 9637563591",
      "mobile": "9637563591",
      "fatherName": "Charandas Donge",
      "dob": "23/07/1977",
      "doj": "12/01/2025",
      "uan": "100915315861",
      "esicNo": "`2303010533",
      "pfNo": "HPSML37703770000010032",
      "bankAccount": "960910100014881",
      "ifsc": "BKID0009609",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 27,
      "weakOff": 0,
      "leave": 0,
      "payableDays": 27,
      "basicPerDay": 444.62,
      "ctc": null,
      "baseSalary": 13338.6,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr021",
      "empId": "SRR021",
      "name": "RAJU SHAMRAO WELE",
      "email": "srr021@shreerrtradingcompany.com",
      "password": "SRR021@123",
      "role": "Worker",
      "designation": "Operator",
      "rank": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 8788678697",
      "mobile": "8788678697",
      "fatherName": "MR.SHYAMRAO JAYRAM WELE",
      "dob": "07/01/1976",
      "doj": "12/01/2025",
      "uan": "100688647137",
      "esicNo": "`2303010518",
      "pfNo": "HPSML37703770000010022",
      "bankAccount": "31703740800",
      "ifsc": "SBIN0006872",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 26,
      "weakOff": 0,
      "leave": 0,
      "payableDays": 26,
      "basicPerDay": 444.62,
      "ctc": null,
      "baseSalary": 13338.6,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr022",
      "empId": "SRR022",
      "name": "Manoj Soyam",
      "email": "srr022@shreerrtradingcompany.com",
      "password": "SRR022@123",
      "role": "Worker",
      "designation": "Operator",
      "rank": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 9529582575",
      "mobile": "9529582575",
      "fatherName": "MAHADEO",
      "dob": "13/09/1977",
      "doj": "12/01/2025",
      "uan": "100688528107",
      "esicNo": "2303010410",
      "pfNo": "HPSML37703770000010009",
      "bankAccount": "32155046791",
      "ifsc": "SBIN0006872",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 24,
      "weakOff": 0,
      "leave": 0,
      "payableDays": 24,
      "basicPerDay": 444.62,
      "ctc": null,
      "baseSalary": 13338.6,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr023",
      "empId": "SRR023",
      "name": "VINOD PUNDALIK GADDALWAR",
      "email": "srr023@shreerrtradingcompany.com",
      "password": "SRR023@123",
      "role": "Worker",
      "designation": "Operator",
      "rank": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 8007201324",
      "mobile": "8007201324",
      "fatherName": "PUNDALIK GADDALWAR",
      "dob": "10/01/1980",
      "doj": "12/01/2025",
      "uan": "101658335429",
      "esicNo": "2303695173",
      "pfNo": "HPSML37703770000010006",
      "bankAccount": "36560916959",
      "ifsc": "SBIN0006872",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 25,
      "weakOff": 0,
      "leave": 0,
      "payableDays": 25,
      "basicPerDay": 444.62,
      "ctc": null,
      "baseSalary": 13338.6,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr024",
      "empId": "SRR024",
      "name": "KESHAW MALAYYA SODARI",
      "email": "srr024@shreerrtradingcompany.com",
      "password": "SRR024@123",
      "role": "Worker",
      "designation": "Operator",
      "rank": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 7249437457",
      "mobile": "7249437457",
      "fatherName": "MR.MALAYYA SODARI",
      "dob": "13/10/1972",
      "doj": "12/01/2025",
      "uan": "100688646631",
      "esicNo": "`2303010521",
      "pfNo": "HPSML37703770000010007",
      "bankAccount": "32735253518",
      "ifsc": "SBIN0006872",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 27,
      "weakOff": 0,
      "leave": 0,
      "payableDays": 27,
      "basicPerDay": 444.62,
      "ctc": null,
      "baseSalary": 13338.6,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr025",
      "empId": "SRR025",
      "name": "AMIT SUNIL BODHE",
      "email": "srr025@shreerrtradingcompany.com",
      "password": "SRR025@123",
      "role": "Worker",
      "designation": "Operator",
      "rank": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 9881483583",
      "mobile": "9881483583",
      "fatherName": "SUNIL",
      "dob": "08/12/1992",
      "doj": "12/01/2025",
      "uan": "101278118797",
      "esicNo": "2303268934",
      "pfNo": "HPSML37703770000010016",
      "bankAccount": "922010007696930",
      "ifsc": "UTIB0004356",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 23,
      "weakOff": 0,
      "leave": 0,
      "payableDays": 23,
      "basicPerDay": 444.62,
      "ctc": null,
      "baseSalary": 13338.6,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr026",
      "empId": "SRR026",
      "name": "DILIP WASUDEO DONGE",
      "email": "srr026@shreerrtradingcompany.com",
      "password": "SRR026@123",
      "role": "Worker",
      "designation": "Operator",
      "rank": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 9923919764",
      "mobile": "9923919764",
      "fatherName": "Vasudeo Donge",
      "dob": "19/07/1974",
      "doj": "12/01/2025",
      "uan": "100930377119",
      "esicNo": "2303010530",
      "pfNo": "HPSML37703770000010024",
      "bankAccount": "32660452618",
      "ifsc": "SBIN0006872",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 18,
      "weakOff": 0,
      "leave": 0,
      "payableDays": 18,
      "basicPerDay": 444.62,
      "ctc": null,
      "baseSalary": 13338.6,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr027",
      "empId": "SRR027",
      "name": "SHRINIWAS SHANKAR YERLAWAR",
      "email": "srr027@shreerrtradingcompany.com",
      "password": "SRR027@123",
      "role": "Worker",
      "designation": "Operator",
      "rank": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 7083441166",
      "mobile": "7083441166",
      "fatherName": "MR.SHANKAR",
      "dob": "18/07/1979",
      "doj": "12/01/2025",
      "uan": "100688647074",
      "esicNo": "2303010520",
      "pfNo": "HPSML37703770000010014",
      "bankAccount": "33138302478",
      "ifsc": "SBIN0006872",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 29,
      "weakOff": 0,
      "leave": 0,
      "payableDays": 29,
      "basicPerDay": 444.62,
      "ctc": null,
      "baseSalary": 13338.6,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr029",
      "empId": "SRR029",
      "name": "ASHISH SHATRUGHAN DESHBHRATAR",
      "email": "srr029@shreerrtradingcompany.com",
      "password": "SRR029@123",
      "role": "Worker",
      "designation": "Operator",
      "rank": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 9112298378",
      "mobile": "9112298378",
      "fatherName": "SHATRUGHAN",
      "dob": "04/09/1986",
      "doj": "12/01/2026",
      "uan": "101672140364",
      "esicNo": "",
      "pfNo": "HPSML37703770000010025",
      "bankAccount": "31480548356",
      "ifsc": "SBIN0006872",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 22,
      "weakOff": 4,
      "leave": 0,
      "payableDays": 26,
      "basicPerDay": null,
      "ctc": 23800,
      "baseSalary": 23800,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr030",
      "empId": "SRR030",
      "name": "GAJANAN MAROTI HEKAD",
      "email": "srr030@shreerrtradingcompany.com",
      "password": "SRR030@123",
      "role": "Worker",
      "designation": "Operator",
      "rank": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 8010962515",
      "mobile": "8010962515",
      "fatherName": "MAROTI HEKAD",
      "dob": "27/09/1982",
      "doj": "12/01/2025",
      "uan": "101206371531",
      "esicNo": "2304362276",
      "pfNo": "HPSML37703770000010027",
      "bankAccount": "33391810107",
      "ifsc": "SBIN0006872",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 26,
      "weakOff": 5,
      "leave": 0,
      "payableDays": 31,
      "basicPerDay": null,
      "ctc": 23800,
      "baseSalary": 23800,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr031",
      "empId": "SRR031",
      "name": "PARVEJ ALAM IKRAMUDDIN SHEIKH",
      "email": "srr031@shreerrtradingcompany.com",
      "password": "SRR031@123",
      "role": "Worker",
      "designation": "Operator",
      "rank": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 9158581505",
      "mobile": "9158581505",
      "fatherName": "IKRAMUDDIN",
      "dob": "20/08/1992",
      "doj": "12/01/2025",
      "uan": "101185663168",
      "esicNo": "",
      "pfNo": "HPSML37703770000010031",
      "bankAccount": "`960910110011126",
      "ifsc": "BKID0009609",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 21,
      "weakOff": 4,
      "leave": 6,
      "payableDays": 31,
      "basicPerDay": null,
      "ctc": 23800,
      "baseSalary": 23800,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr032",
      "empId": "SRR032",
      "name": "SHIVAM CHANDRASHEKHAR SOYAM",
      "email": "srr032@shreerrtradingcompany.com",
      "password": "SRR032@123",
      "role": "Worker",
      "designation": "Operator",
      "rank": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 8180898287",
      "mobile": "8180898287",
      "fatherName": "CHANDRASHEKHAR",
      "dob": "04/09/1996",
      "doj": "12/01/2025",
      "uan": "101222729381",
      "esicNo": "",
      "pfNo": "HPSML37703770000010021",
      "bankAccount": "`963510110002699",
      "ifsc": "BKID0009635",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 0,
      "weakOff": 0,
      "leave": 0,
      "payableDays": 0,
      "basicPerDay": null,
      "ctc": 23800,
      "baseSalary": 23800,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr033",
      "empId": "SRR033",
      "name": "RAJESH SIDDHGOPAL YADAV",
      "email": "srr033@shreerrtradingcompany.com",
      "password": "SRR033@123",
      "role": "Worker",
      "designation": "Operator",
      "rank": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 7058293701",
      "mobile": "7058293701",
      "fatherName": "SIDDHGOPAL YADAV",
      "dob": "15/04/1985",
      "doj": "12/01/2025",
      "uan": "101628025779",
      "esicNo": "",
      "pfNo": "HPSML37703770000010026",
      "bankAccount": "30331583492",
      "ifsc": "SBIN0006872",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 25,
      "weakOff": 5,
      "leave": 1,
      "payableDays": 31,
      "basicPerDay": null,
      "ctc": 23800,
      "baseSalary": 23800,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr034",
      "empId": "SRR034",
      "name": "KANNUR SHYAM SUNDER",
      "email": "srr034@shreerrtradingcompany.com",
      "password": "SRR034@123",
      "role": "Worker",
      "designation": "Operator",
      "rank": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 8309333686",
      "mobile": "8309333686",
      "fatherName": "RAJARAM KANNUR",
      "dob": "27/11/1990",
      "doj": "12/01/2025",
      "uan": "101566340136",
      "esicNo": "",
      "pfNo": "HPSML37703770000010001",
      "bankAccount": "`50100526451377",
      "ifsc": "HDFC0003196",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 27,
      "weakOff": 4,
      "leave": 0,
      "payableDays": 31,
      "basicPerDay": null,
      "ctc": 23800,
      "baseSalary": 23800,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr035",
      "empId": "SRR035",
      "name": "SUKHDEV RAMJI SINGH",
      "email": "srr035@shreerrtradingcompany.com",
      "password": "SRR035@123",
      "role": "Worker",
      "designation": "Helper",
      "rank": "Helper",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 8087897427",
      "mobile": "8087897427",
      "fatherName": "RAMJI",
      "dob": "15/04/1991",
      "doj": "15/01/2026",
      "uan": "101788268906",
      "esicNo": "2304461532",
      "pfNo": "HPSML37703770000010003",
      "bankAccount": "`960910110011023",
      "ifsc": "BKID0009609",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 22,
      "weakOff": 5,
      "leave": 4,
      "payableDays": 31,
      "basicPerDay": null,
      "ctc": null,
      "baseSalary": 25000,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": true,
      "loginAllowed": false
    },
    {
      "id": "usr-srr036",
      "empId": "SRR036",
      "name": "RAHUL BHATTI",
      "email": "srr036@shreerrtradingcompany.com",
      "password": "SRR036@123",
      "role": "Manager",
      "designation": "Management",
      "rank": "Management",
      "department": "Plant Fleet & Garage O&M",
      "site": "ACC Chanda",
      "location": "ACC Chanda",
      "phone": "+91 9805775907",
      "mobile": "9805775907",
      "fatherName": "JAGDISH CHAND",
      "dob": "12/12/1990",
      "doj": "01/07/2026",
      "uan": "100445306074",
      "esicNo": "",
      "pfNo": "HPSML37703770000010036",
      "bankAccount": "25690110002872",
      "ifsc": "UCBA0002569",
      "category": "Skilled",
      "daysInMonth": 31,
      "presentDays": 27,
      "weakOff": 4,
      "leave": 0,
      "payableDays": 31,
      "basicPerDay": null,
      "ctc": 35228,
      "baseSalary": 35228,
      "status": "Active",
      "createdAt": "2026-01-12T00:00:00.000Z",
      "loginEnabled": false,
      "permissions": {
        "payroll.salary_structure.view": false,
        "payroll.manage_all": false,
        "reports.bank_deposit.export": false,
        "attendance.muster.mark": false,
        "fleets.manage": false,
        "hr.users.manage": false,
        "hr.appointment_letter.generate": false,
        "expenses.field_claims.process": false,
        "payroll.slip.view_own": true
      },
      "totalLeaves": 10,
      "leavesTaken": 0,
      "leaveBalance": 10,
      "mustChangePassword": true,
      "loginAllowed": false
    }
  ],
  "salarySlips": [
    {
      "id": "slp-srr002-2026-07",
      "userId": "usr-srr002",
      "empId": "SRR002",
      "userName": "MOHMMAD IRFAN SULEMAN SIDDIKI",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Mechanic",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "SULEMAN",
      "dob": "08/11/1977",
      "doj": "12/01/2025",
      "uan": "101306845435",
      "esicNo": "",
      "pfNo": "HPSML37703770000010029",
      "bankAccount": "60114961877",
      "ifsc": "MAHB0001139",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "9822852945",
      "phone": "+91 9822852945",
      "workedDays": 31,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 17500.0,
        "da": 0.0,
        "hra": 7000.0,
        "specialAllowance": 8400.0,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 2100.0,
        "esic": 0.0,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 32900.0,
      "totalDeductions": 2300.0,
      "netPay": 30600.0,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr004-2026-07",
      "userId": "usr-srr004",
      "empId": "SRR004",
      "userName": "SHEIKH ISUB SHEIKH KASAM",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Mechanic",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "MR. SHEIKH KASAM",
      "dob": "06/07/1986",
      "doj": "12/01/2025",
      "uan": "100688645676",
      "esicNo": "2303010526",
      "pfNo": "HPSML37703770000010028",
      "bankAccount": "32049452658",
      "ifsc": "SBIN0006872",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "9960375227",
      "phone": "+91 9960375227",
      "workedDays": 27,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 12004.74,
        "da": 7813.26,
        "hra": 1692.9,
        "specialAllowance": 0.0,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 2378.16,
        "esic": 161.33,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 21510.9,
      "totalDeductions": 2739.49,
      "netPay": 18771.41,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr005-2026-07",
      "userId": "usr-srr005",
      "empId": "SRR005",
      "userName": "Ramesh Komuraiah Rudrarapu",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Mechanic",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "RUDRARAM KOMURAIAH",
      "dob": "25/01/1985",
      "doj": "12/01/2025",
      "uan": "102288509946",
      "esicNo": "",
      "pfNo": "HPSML37703770000010008",
      "bankAccount": "10794346484",
      "ifsc": "SBIN0006872",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "9960139135",
      "phone": "+91 9960139135",
      "workedDays": 31,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 14000.0,
        "da": 0.0,
        "hra": 5600.0,
        "specialAllowance": 6720.0,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 1680.0,
        "esic": 0.0,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 26320.0,
      "totalDeductions": 1880.0,
      "netPay": 24440.0,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr006-2026-07",
      "userId": "usr-srr006",
      "empId": "SRR006",
      "userName": "PRAVIN PURUSHOTTAM PENDOR",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Helper",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "PURUSHOTTAM PANDOOR",
      "dob": "17/05/1988",
      "doj": "12/01/2025",
      "uan": "100688645243",
      "esicNo": "2303045153",
      "pfNo": "HPSML37703770000010002",
      "bankAccount": "33241787677",
      "ifsc": "SBIN0006872",
      "location": "ACC Chanda",
      "category": "Semi-Skilled",
      "mobile": "8605585979",
      "phone": "+91 8605585979",
      "workedDays": 27,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 11576.79,
        "da": 7813.26,
        "hra": 1692.9,
        "specialAllowance": 0.0,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 2326.81,
        "esic": 158.12,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 21082.95,
      "totalDeductions": 2684.93,
      "netPay": 18398.02,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr008-2026-07",
      "userId": "usr-srr008",
      "empId": "SRR008",
      "userName": "Lokesh Raju Daheka",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Helper",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "RAJU DAHEKAR",
      "dob": "25/12/2005",
      "doj": "12/01/2025",
      "uan": "102287602720",
      "esicNo": "1415892943",
      "pfNo": "HPSML37703770000010011",
      "bankAccount": "60559700055",
      "ifsc": "MAHB0001088",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "7666972959",
      "phone": "+91 7666972959",
      "workedDays": 31,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 13783.22,
        "da": 8970.78,
        "hra": 1943.7,
        "specialAllowance": 0.0,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 2730.48,
        "esic": 185.23,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 24697.7,
      "totalDeductions": 3115.71,
      "netPay": 21581.99,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr009-2026-07",
      "userId": "usr-srr009",
      "empId": "SRR009",
      "userName": "Hamid Ahmad Nizamuddin Sheikh",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Helper",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "NIJAMUDEEN SHEIKH",
      "dob": "04/06/1994",
      "doj": "12/01/2025",
      "uan": "102287823992",
      "esicNo": "1415892773",
      "pfNo": "HPSML37703770000010005",
      "bankAccount": "33553423397",
      "ifsc": "SBIN0006872",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "9527291665",
      "phone": "+91 9527291665",
      "workedDays": 31,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 13783.22,
        "da": 8970.78,
        "hra": 1943.7,
        "specialAllowance": 0.0,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 2730.48,
        "esic": 185.23,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 24697.7,
      "totalDeductions": 3115.71,
      "netPay": 21581.99,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr010-2026-07",
      "userId": "usr-srr010",
      "empId": "SRR010",
      "userName": "MO HASIM ABDUL NAIM ANSARI",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Welder / Fitter",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "NAIM ANSARI",
      "dob": "24/11/1968",
      "doj": "12/01/2025",
      "uan": "101265795612",
      "esicNo": "",
      "pfNo": "HPSML37703770000010004",
      "bankAccount": "36566678237",
      "ifsc": "SBIN0006045",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "7776039252",
      "phone": "+91 7776039252",
      "workedDays": 31,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 15000.0,
        "da": 0.0,
        "hra": 6000.0,
        "specialAllowance": 7200.0,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 1800.0,
        "esic": 0.0,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 28200.0,
      "totalDeductions": 2000.0,
      "netPay": 26200.0,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr011-2026-07",
      "userId": "usr-srr011",
      "empId": "SRR011",
      "userName": "Pawan Raju Asapwar",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Welder / Fitter",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "VITTHAL ASAPWAR",
      "dob": "29/05/2004",
      "doj": "12/01/2025",
      "uan": "102287609045",
      "esicNo": "1415892774",
      "pfNo": "HPSML37703770000010013",
      "bankAccount": "36746757262",
      "ifsc": "SBIN0006872",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "9322382571",
      "phone": "+91 9322382571",
      "workedDays": 31,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 13783.22,
        "da": 8970.78,
        "hra": 1943.7,
        "specialAllowance": 0.0,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 2730.48,
        "esic": 185.23,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 24697.7,
      "totalDeductions": 3115.71,
      "netPay": 21581.99,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr012-2026-07",
      "userId": "usr-srr012",
      "empId": "SRR012",
      "userName": "TAUSIF KHAN",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Auto Electrician",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "AASIF KHAN",
      "dob": "27/09/1997",
      "doj": "12/01/2025",
      "uan": "101777512672",
      "esicNo": "",
      "pfNo": "HPSML37703770000010015",
      "bankAccount": "39692648513",
      "ifsc": "SBIN0014664",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "7667313126",
      "phone": "+91 7667313126",
      "workedDays": 31,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 17500.0,
        "da": 0.0,
        "hra": 7000.0,
        "specialAllowance": 8400.0,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 2100.0,
        "esic": 0.0,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 32900.0,
      "totalDeductions": 2300.0,
      "netPay": 30600.0,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr014-2026-07",
      "userId": "usr-srr014",
      "empId": "SRR014",
      "userName": "RAJU BALAJI KULMETHE",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "BALAJI",
      "dob": "07/07/1975",
      "doj": "12/01/2025",
      "uan": "100687937899",
      "esicNo": "2303010417",
      "pfNo": "HPSML37703770000010012",
      "bankAccount": "31564867222",
      "ifsc": "SBIN0006872",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "8999776972",
      "phone": "+91 8999776972",
      "workedDays": 25,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 11115.5,
        "da": 7234.5,
        "hra": 1567.5,
        "specialAllowance": 0.0,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 2202.0,
        "esic": 149.38,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 19917.5,
      "totalDeductions": 2551.38,
      "netPay": 17366.12,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr015-2026-07",
      "userId": "usr-srr015",
      "empId": "SRR015",
      "userName": "AAVUNOORI SRINIVAS",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "MR.RAJAIAH AAVUNOORI",
      "dob": "24/06/1985",
      "doj": "12/01/2025",
      "uan": "100688646864",
      "esicNo": "2303010522",
      "pfNo": "HPSML37703770000010017",
      "bankAccount": "32912310895",
      "ifsc": "SBIN0006872",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "8530412624",
      "phone": "+91 8530412624",
      "workedDays": 29,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 12893.98,
        "da": 8392.02,
        "hra": 1818.3,
        "specialAllowance": 0.0,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 2554.32,
        "esic": 173.28,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 23104.3,
      "totalDeductions": 2927.6,
      "netPay": 20176.7,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr016-2026-07",
      "userId": "usr-srr016",
      "empId": "SRR016",
      "userName": "GANESH SHAMRAO GHULE",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "SHYAMRAO",
      "dob": "01/01/1984",
      "doj": "12/01/2025",
      "uan": "100689220406",
      "esicNo": "2303010517",
      "pfNo": "HPSML37703770000010023",
      "bankAccount": "32688972261",
      "ifsc": "SBIN0006872",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "9850345686",
      "phone": "+91 9850345686",
      "workedDays": 29,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 12893.98,
        "da": 8392.02,
        "hra": 1818.3,
        "specialAllowance": 0.0,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 2554.32,
        "esic": 173.28,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 23104.3,
      "totalDeductions": 2927.6,
      "netPay": 20176.7,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr017-2026-07",
      "userId": "usr-srr017",
      "empId": "SRR017",
      "userName": "SHANKAR BHUMAYYA KOLGURI",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "BHUMAYYA",
      "dob": "15/06/1976",
      "doj": "12/01/2025",
      "uan": "100687999139",
      "esicNo": "2303010422",
      "pfNo": "HPSML37703770000010018",
      "bankAccount": "32759687638",
      "ifsc": "SBIN0006872",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "8698989471",
      "phone": "+91 8698989471",
      "workedDays": 26,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 11560.12,
        "da": 7523.88,
        "hra": 1630.2,
        "specialAllowance": 0.0,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 2290.08,
        "esic": 155.36,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 20714.2,
      "totalDeductions": 2645.44,
      "netPay": 18068.76,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr018-2026-07",
      "userId": "usr-srr018",
      "empId": "SRR018",
      "userName": "DILIP CHINCHOLKAR",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "BABRAO",
      "dob": "01/05/1982",
      "doj": "12/01/2025",
      "uan": "100234722168",
      "esicNo": "2303010496",
      "pfNo": "HPSML37703770000010034",
      "bankAccount": "32785818786",
      "ifsc": "SBIN0006872",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "8309740448",
      "phone": "+91 8309740448",
      "workedDays": 28,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 12449.36,
        "da": 8102.64,
        "hra": 1755.6,
        "specialAllowance": 0.0,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 2466.24,
        "esic": 167.31,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 22307.6,
      "totalDeductions": 2833.55,
      "netPay": 19474.05,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr019-2026-07",
      "userId": "usr-srr019",
      "empId": "SRR019",
      "userName": "KRISHNA MURLIDHAR BURBANDE",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "MR.MURALIDHAR BURBANDE",
      "dob": "08/12/1982",
      "doj": "12/01/2025",
      "uan": "100688646654",
      "esicNo": "`2303010524",
      "pfNo": "HPSML37703770000010019",
      "bankAccount": "32705565667",
      "ifsc": "SBIN0006872",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "9552202985",
      "phone": "+91 9552202985",
      "workedDays": 18,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 8003.16,
        "da": 5208.84,
        "hra": 1128.6,
        "specialAllowance": 0.0,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 1585.44,
        "esic": 107.55,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 14340.6,
      "totalDeductions": 1892.99,
      "netPay": 12447.61,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr020-2026-07",
      "userId": "usr-srr020",
      "empId": "SRR020",
      "userName": "SUNIL CHARANDAS BHARNE",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "Charandas Donge",
      "dob": "23/07/1977",
      "doj": "12/01/2025",
      "uan": "100915315861",
      "esicNo": "`2303010533",
      "pfNo": "HPSML37703770000010032",
      "bankAccount": "960910100014881",
      "ifsc": "BKID0009609",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "9637563591",
      "phone": "+91 9637563591",
      "workedDays": 27,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 12004.74,
        "da": 7813.26,
        "hra": 1692.9,
        "specialAllowance": 0.0,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 2378.16,
        "esic": 161.33,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 21510.9,
      "totalDeductions": 2739.49,
      "netPay": 18771.41,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr021-2026-07",
      "userId": "usr-srr021",
      "empId": "SRR021",
      "userName": "RAJU SHAMRAO WELE",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "MR.SHYAMRAO JAYRAM WELE",
      "dob": "07/01/1976",
      "doj": "12/01/2025",
      "uan": "100688647137",
      "esicNo": "`2303010518",
      "pfNo": "HPSML37703770000010022",
      "bankAccount": "31703740800",
      "ifsc": "SBIN0006872",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "8788678697",
      "phone": "+91 8788678697",
      "workedDays": 26,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 11560.12,
        "da": 7523.88,
        "hra": 1630.2,
        "specialAllowance": 0.0,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 2290.08,
        "esic": 155.36,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 20714.2,
      "totalDeductions": 2645.44,
      "netPay": 18068.76,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr022-2026-07",
      "userId": "usr-srr022",
      "empId": "SRR022",
      "userName": "Manoj Soyam",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "MAHADEO",
      "dob": "13/09/1977",
      "doj": "12/01/2025",
      "uan": "100688528107",
      "esicNo": "2303010410",
      "pfNo": "HPSML37703770000010009",
      "bankAccount": "32155046791",
      "ifsc": "SBIN0006872",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "9529582575",
      "phone": "+91 9529582575",
      "workedDays": 24,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 10670.88,
        "da": 6945.12,
        "hra": 1504.8,
        "specialAllowance": 0.0,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 2113.92,
        "esic": 143.41,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 19120.8,
      "totalDeductions": 2457.33,
      "netPay": 16663.47,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr023-2026-07",
      "userId": "usr-srr023",
      "empId": "SRR023",
      "userName": "VINOD PUNDALIK GADDALWAR",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "PUNDALIK GADDALWAR",
      "dob": "10/01/1980",
      "doj": "12/01/2025",
      "uan": "101658335429",
      "esicNo": "2303695173",
      "pfNo": "HPSML37703770000010006",
      "bankAccount": "36560916959",
      "ifsc": "SBIN0006872",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "8007201324",
      "phone": "+91 8007201324",
      "workedDays": 25,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 11115.5,
        "da": 7234.5,
        "hra": 1567.5,
        "specialAllowance": 0.0,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 2202.0,
        "esic": 149.38,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 19917.5,
      "totalDeductions": 2551.38,
      "netPay": 17366.12,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr024-2026-07",
      "userId": "usr-srr024",
      "empId": "SRR024",
      "userName": "KESHAW MALAYYA SODARI",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "MR.MALAYYA SODARI",
      "dob": "13/10/1972",
      "doj": "12/01/2025",
      "uan": "100688646631",
      "esicNo": "`2303010521",
      "pfNo": "HPSML37703770000010007",
      "bankAccount": "32735253518",
      "ifsc": "SBIN0006872",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "7249437457",
      "phone": "+91 7249437457",
      "workedDays": 27,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 12004.74,
        "da": 7813.26,
        "hra": 1692.9,
        "specialAllowance": 0.0,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 2378.16,
        "esic": 161.33,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 21510.9,
      "totalDeductions": 2739.49,
      "netPay": 18771.41,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr025-2026-07",
      "userId": "usr-srr025",
      "empId": "SRR025",
      "userName": "AMIT SUNIL BODHE",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "SUNIL",
      "dob": "08/12/1992",
      "doj": "12/01/2025",
      "uan": "101278118797",
      "esicNo": "2303268934",
      "pfNo": "HPSML37703770000010016",
      "bankAccount": "922010007696930",
      "ifsc": "UTIB0004356",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "9881483583",
      "phone": "+91 9881483583",
      "workedDays": 23,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 10226.26,
        "da": 6655.74,
        "hra": 1442.1,
        "specialAllowance": 0.0,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 2025.84,
        "esic": 137.43,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 18324.1,
      "totalDeductions": 2363.27,
      "netPay": 15960.83,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr026-2026-07",
      "userId": "usr-srr026",
      "empId": "SRR026",
      "userName": "DILIP WASUDEO DONGE",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "Vasudeo Donge",
      "dob": "19/07/1974",
      "doj": "12/01/2025",
      "uan": "100930377119",
      "esicNo": "2303010530",
      "pfNo": "HPSML37703770000010024",
      "bankAccount": "32660452618",
      "ifsc": "SBIN0006872",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "9923919764",
      "phone": "+91 9923919764",
      "workedDays": 18,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 8003.16,
        "da": 5208.84,
        "hra": 1128.6,
        "specialAllowance": 0.0,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 1585.44,
        "esic": 107.55,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 14340.6,
      "totalDeductions": 1892.99,
      "netPay": 12447.61,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr027-2026-07",
      "userId": "usr-srr027",
      "empId": "SRR027",
      "userName": "SHRINIWAS SHANKAR YERLAWAR",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "MR.SHANKAR",
      "dob": "18/07/1979",
      "doj": "12/01/2025",
      "uan": "100688647074",
      "esicNo": "2303010520",
      "pfNo": "HPSML37703770000010014",
      "bankAccount": "33138302478",
      "ifsc": "SBIN0006872",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "7083441166",
      "phone": "+91 7083441166",
      "workedDays": 29,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 12893.98,
        "da": 8392.02,
        "hra": 1818.3,
        "specialAllowance": 0.0,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 2554.32,
        "esic": 173.28,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 23104.3,
      "totalDeductions": 2927.6,
      "netPay": 20176.7,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr029-2026-07",
      "userId": "usr-srr029",
      "empId": "SRR029",
      "userName": "ASHISH SHATRUGHAN DESHBHRATAR",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "SHATRUGHAN",
      "dob": "04/09/1986",
      "doj": "12/01/2026",
      "uan": "101672140364",
      "esicNo": "",
      "pfNo": "HPSML37703770000010025",
      "bankAccount": "31480548356",
      "ifsc": "SBIN0006872",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "9112298378",
      "phone": "+91 9112298378",
      "workedDays": 26,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 9980.65,
        "da": 0.0,
        "hra": 3992.26,
        "specialAllowance": 4790.7,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 1197.68,
        "esic": 0.0,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 18763.61,
      "totalDeductions": 1397.68,
      "netPay": 17365.93,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr030-2026-07",
      "userId": "usr-srr030",
      "empId": "SRR030",
      "userName": "GAJANAN MAROTI HEKAD",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "MAROTI HEKAD",
      "dob": "27/09/1982",
      "doj": "12/01/2025",
      "uan": "101206371531",
      "esicNo": "2304362276",
      "pfNo": "HPSML37703770000010027",
      "bankAccount": "33391810107",
      "ifsc": "SBIN0006872",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "8010962515",
      "phone": "+91 8010962515",
      "workedDays": 31,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 11900.0,
        "da": 0.0,
        "hra": 4760.0,
        "specialAllowance": 5712.0,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 1428.0,
        "esic": 0.0,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 22372.0,
      "totalDeductions": 1628.0,
      "netPay": 20744.0,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr031-2026-07",
      "userId": "usr-srr031",
      "empId": "SRR031",
      "userName": "PARVEJ ALAM IKRAMUDDIN SHEIKH",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "IKRAMUDDIN",
      "dob": "20/08/1992",
      "doj": "12/01/2025",
      "uan": "101185663168",
      "esicNo": "",
      "pfNo": "HPSML37703770000010031",
      "bankAccount": "`960910110011126",
      "ifsc": "BKID0009609",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "9158581505",
      "phone": "+91 9158581505",
      "workedDays": 31,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 11900.0,
        "da": 0.0,
        "hra": 4760.0,
        "specialAllowance": 5712.0,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 1428.0,
        "esic": 0.0,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 22372.0,
      "totalDeductions": 1628.0,
      "netPay": 20744.0,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr032-2026-07",
      "userId": "usr-srr032",
      "empId": "SRR032",
      "userName": "SHIVAM CHANDRASHEKHAR SOYAM",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "CHANDRASHEKHAR",
      "dob": "04/09/1996",
      "doj": "12/01/2025",
      "uan": "101222729381",
      "esicNo": "",
      "pfNo": "HPSML37703770000010021",
      "bankAccount": "`963510110002699",
      "ifsc": "BKID0009635",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "8180898287",
      "phone": "+91 8180898287",
      "workedDays": 30,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 11516.13,
        "da": 0.0,
        "hra": 4606.45,
        "specialAllowance": 5527.74,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 1381.94,
        "esic": 0.0,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 21650.32,
      "totalDeductions": 1581.94,
      "netPay": 20068.38,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr033-2026-07",
      "userId": "usr-srr033",
      "empId": "SRR033",
      "userName": "RAJESH SIDDHGOPAL YADAV",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "SIDDHGOPAL YADAV",
      "dob": "15/04/1985",
      "doj": "12/01/2025",
      "uan": "101628025779",
      "esicNo": "",
      "pfNo": "HPSML37703770000010026",
      "bankAccount": "30331583492",
      "ifsc": "SBIN0006872",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "7058293701",
      "phone": "+91 7058293701",
      "workedDays": 31,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 11900.0,
        "da": 0.0,
        "hra": 4760.0,
        "specialAllowance": 5712.0,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 1428.0,
        "esic": 0.0,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 22372.0,
      "totalDeductions": 1628.0,
      "netPay": 20744.0,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr034-2026-07",
      "userId": "usr-srr034",
      "empId": "SRR034",
      "userName": "KANNUR SHYAM SUNDER",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Operator",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "RAJARAM KANNUR",
      "dob": "27/11/1990",
      "doj": "12/01/2025",
      "uan": "101566340136",
      "esicNo": "",
      "pfNo": "HPSML37703770000010001",
      "bankAccount": "`50100526451377",
      "ifsc": "HDFC0003196",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "8309333686",
      "phone": "+91 8309333686",
      "workedDays": 31,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 11900.0,
        "da": 0.0,
        "hra": 4760.0,
        "specialAllowance": 5712.0,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 1428.0,
        "esic": 0.0,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 22372.0,
      "totalDeductions": 1628.0,
      "netPay": 20744.0,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr035-2026-07",
      "userId": "usr-srr035",
      "empId": "SRR035",
      "userName": "SUKHDEV RAMJI SINGH",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Helper",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "RAMJI",
      "dob": "15/04/1991",
      "doj": "15/01/2026",
      "uan": "101788268906",
      "esicNo": "2304461532",
      "pfNo": "HPSML37703770000010003",
      "bankAccount": "`960910110011023",
      "ifsc": "BKID0009609",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "8087897427",
      "phone": "+91 8087897427",
      "workedDays": 31,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 13783.22,
        "da": 8970.78,
        "hra": 1943.7,
        "specialAllowance": 0.0,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 2730.48,
        "esic": 185.23,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 24697.7,
      "totalDeductions": 3115.71,
      "netPay": 21581.99,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    },
    {
      "id": "slp-srr036-2026-07",
      "userId": "usr-srr036",
      "empId": "SRR036",
      "userName": "RAHUL BHATTI",
      "monthYear": "July 2026",
      "month": "July",
      "year": 2026,
      "designation": "Management",
      "department": "Plant Fleet & Garage O&M",
      "fatherName": "JAGDISH CHAND",
      "dob": "12/12/1990",
      "doj": "01/07/2026",
      "uan": "100445306074",
      "esicNo": "",
      "pfNo": "HPSML37703770000010036",
      "bankAccount": "25690110002872",
      "ifsc": "UCBA0002569",
      "location": "ACC Chanda",
      "category": "Skilled",
      "mobile": "9805775907",
      "phone": "+91 9805775907",
      "workedDays": 31,
      "totalDays": 31,
      "otHours": 0,
      "otWage": 0,
      "earnings": {
        "basic": 17614.0,
        "da": 0.0,
        "hra": 7045.6,
        "specialAllowance": 8454.72,
        "bonus": 0,
        "otWage": 0
      },
      "deductions": {
        "pf": 2113.68,
        "esic": 0.0,
        "pt": 200.0,
        "lic": 0,
        "advance": 0
      },
      "grossPay": 33114.32,
      "totalDeductions": 2313.68,
      "netPay": 30800.64,
      "status": "Paid",
      "paymentDate": "2026-08-05"
    }
  ],
  "rosters": [
    {
      "id": "rst-002",
      "userId": "usr-srr002",
      "empId": "SRR002",
      "userName": "MOHMMAD IRFAN SULEMAN SIDDIKI",
      "designation": "Mechanic",
      "date": "2026-09-03",
      "shift": "A Shift (06:00 AM - 02:00 PM)",
      "shiftCode": "A",
      "site": "ACC Chanda",
      "equipment": "Maintenance Bay",
      "supervisor": "Shift In-Charge"
    },
    {
      "id": "rst-003",
      "userId": "usr-srr004",
      "empId": "SRR004",
      "userName": "SHEIKH ISUB SHEIKH KASAM",
      "designation": "Mechanic",
      "date": "2026-09-03",
      "shift": "B Shift (02:00 PM - 10:00 PM)",
      "shiftCode": "B",
      "site": "ACC Chanda",
      "equipment": "Maintenance Bay",
      "supervisor": "Shift In-Charge"
    },
    {
      "id": "rst-004",
      "userId": "usr-srr005",
      "empId": "SRR005",
      "userName": "Ramesh Komuraiah Rudrarapu",
      "designation": "Mechanic",
      "date": "2026-09-03",
      "shift": "C Shift (10:00 PM - 06:00 AM)",
      "shiftCode": "C",
      "site": "ACC Chanda",
      "equipment": "Maintenance Bay",
      "supervisor": "Shift In-Charge"
    },
    {
      "id": "rst-005",
      "userId": "usr-srr006",
      "empId": "SRR006",
      "userName": "PRAVIN PURUSHOTTAM PENDOR",
      "designation": "Helper",
      "date": "2026-09-03",
      "shift": "G Shift (08:30 AM - 05:30 PM)",
      "shiftCode": "G",
      "site": "ACC Chanda",
      "equipment": "Mine Plant Site",
      "supervisor": "Shift In-Charge"
    },
    {
      "id": "rst-006",
      "userId": "usr-srr008",
      "empId": "SRR008",
      "userName": "Lokesh Raju Daheka",
      "designation": "Helper",
      "date": "2026-09-03",
      "shift": "A Shift (06:00 AM - 02:00 PM)",
      "shiftCode": "A",
      "site": "ACC Chanda",
      "equipment": "Mine Plant Site",
      "supervisor": "Shift In-Charge"
    },
    {
      "id": "rst-007",
      "userId": "usr-srr009",
      "empId": "SRR009",
      "userName": "Hamid Ahmad Nizamuddin Sheikh",
      "designation": "Helper",
      "date": "2026-09-03",
      "shift": "B Shift (02:00 PM - 10:00 PM)",
      "shiftCode": "B",
      "site": "ACC Chanda",
      "equipment": "Mine Plant Site",
      "supervisor": "Shift In-Charge"
    },
    {
      "id": "rst-008",
      "userId": "usr-srr010",
      "empId": "SRR010",
      "userName": "MO HASIM ABDUL NAIM ANSARI",
      "designation": "Welder / Fitter",
      "date": "2026-09-03",
      "shift": "C Shift (10:00 PM - 06:00 AM)",
      "shiftCode": "C",
      "site": "ACC Chanda",
      "equipment": "Mine Plant Site",
      "supervisor": "Shift In-Charge"
    },
    {
      "id": "rst-009",
      "userId": "usr-srr011",
      "empId": "SRR011",
      "userName": "Pawan Raju Asapwar",
      "designation": "Welder / Fitter",
      "date": "2026-09-03",
      "shift": "G Shift (08:30 AM - 05:30 PM)",
      "shiftCode": "G",
      "site": "ACC Chanda",
      "equipment": "Mine Plant Site",
      "supervisor": "Shift In-Charge"
    },
    {
      "id": "rst-010",
      "userId": "usr-srr012",
      "empId": "SRR012",
      "userName": "TAUSIF KHAN",
      "designation": "Auto Electrician",
      "date": "2026-09-03",
      "shift": "A Shift (06:00 AM - 02:00 PM)",
      "shiftCode": "A",
      "site": "ACC Chanda",
      "equipment": "Mine Plant Site",
      "supervisor": "Shift In-Charge"
    },
    {
      "id": "rst-011",
      "userId": "usr-srr014",
      "empId": "SRR014",
      "userName": "RAJU BALAJI KULMETHE",
      "designation": "Operator",
      "date": "2026-09-03",
      "shift": "B Shift (02:00 PM - 10:00 PM)",
      "shiftCode": "B",
      "site": "ACC Chanda",
      "equipment": "CAT 349D Excavator",
      "supervisor": "Shift In-Charge"
    },
    {
      "id": "rst-012",
      "userId": "usr-srr015",
      "empId": "SRR015",
      "userName": "AAVUNOORI SRINIVAS",
      "designation": "Operator",
      "date": "2026-09-03",
      "shift": "C Shift (10:00 PM - 06:00 AM)",
      "shiftCode": "C",
      "site": "ACC Chanda",
      "equipment": "CAT 349D Excavator",
      "supervisor": "Shift In-Charge"
    },
    {
      "id": "rst-013",
      "userId": "usr-srr016",
      "empId": "SRR016",
      "userName": "GANESH SHAMRAO GHULE",
      "designation": "Operator",
      "date": "2026-09-03",
      "shift": "G Shift (08:30 AM - 05:30 PM)",
      "shiftCode": "G",
      "site": "ACC Chanda",
      "equipment": "CAT 349D Excavator",
      "supervisor": "Shift In-Charge"
    },
    {
      "id": "rst-014",
      "userId": "usr-srr017",
      "empId": "SRR017",
      "userName": "SHANKAR BHUMAYYA KOLGURI",
      "designation": "Operator",
      "date": "2026-09-03",
      "shift": "A Shift (06:00 AM - 02:00 PM)",
      "shiftCode": "A",
      "site": "ACC Chanda",
      "equipment": "CAT 349D Excavator",
      "supervisor": "Shift In-Charge"
    },
    {
      "id": "rst-015",
      "userId": "usr-srr018",
      "empId": "SRR018",
      "userName": "DILIP CHINCHOLKAR",
      "designation": "Operator",
      "date": "2026-09-03",
      "shift": "B Shift (02:00 PM - 10:00 PM)",
      "shiftCode": "B",
      "site": "ACC Chanda",
      "equipment": "CAT 349D Excavator",
      "supervisor": "Shift In-Charge"
    },
    {
      "id": "rst-016",
      "userId": "usr-srr019",
      "empId": "SRR019",
      "userName": "KRISHNA MURLIDHAR BURBANDE",
      "designation": "Operator",
      "date": "2026-09-03",
      "shift": "C Shift (10:00 PM - 06:00 AM)",
      "shiftCode": "C",
      "site": "ACC Chanda",
      "equipment": "CAT 349D Excavator",
      "supervisor": "Shift In-Charge"
    },
    {
      "id": "rst-017",
      "userId": "usr-srr020",
      "empId": "SRR020",
      "userName": "SUNIL CHARANDAS BHARNE",
      "designation": "Operator",
      "date": "2026-09-03",
      "shift": "G Shift (08:30 AM - 05:30 PM)",
      "shiftCode": "G",
      "site": "ACC Chanda",
      "equipment": "CAT 349D Excavator",
      "supervisor": "Shift In-Charge"
    },
    {
      "id": "rst-018",
      "userId": "usr-srr021",
      "empId": "SRR021",
      "userName": "RAJU SHAMRAO WELE",
      "designation": "Operator",
      "date": "2026-09-03",
      "shift": "A Shift (06:00 AM - 02:00 PM)",
      "shiftCode": "A",
      "site": "ACC Chanda",
      "equipment": "CAT 349D Excavator",
      "supervisor": "Shift In-Charge"
    },
    {
      "id": "rst-019",
      "userId": "usr-srr022",
      "empId": "SRR022",
      "userName": "Manoj Soyam",
      "designation": "Operator",
      "date": "2026-09-03",
      "shift": "B Shift (02:00 PM - 10:00 PM)",
      "shiftCode": "B",
      "site": "ACC Chanda",
      "equipment": "CAT 349D Excavator",
      "supervisor": "Shift In-Charge"
    },
    {
      "id": "rst-020",
      "userId": "usr-srr023",
      "empId": "SRR023",
      "userName": "VINOD PUNDALIK GADDALWAR",
      "designation": "Operator",
      "date": "2026-09-03",
      "shift": "C Shift (10:00 PM - 06:00 AM)",
      "shiftCode": "C",
      "site": "ACC Chanda",
      "equipment": "CAT 349D Excavator",
      "supervisor": "Shift In-Charge"
    },
    {
      "id": "rst-021",
      "userId": "usr-srr024",
      "empId": "SRR024",
      "userName": "KESHAW MALAYYA SODARI",
      "designation": "Operator",
      "date": "2026-09-03",
      "shift": "G Shift (08:30 AM - 05:30 PM)",
      "shiftCode": "G",
      "site": "ACC Chanda",
      "equipment": "CAT 349D Excavator",
      "supervisor": "Shift In-Charge"
    },
    {
      "id": "rst-022",
      "userId": "usr-srr025",
      "empId": "SRR025",
      "userName": "AMIT SUNIL BODHE",
      "designation": "Operator",
      "date": "2026-09-03",
      "shift": "A Shift (06:00 AM - 02:00 PM)",
      "shiftCode": "A",
      "site": "ACC Chanda",
      "equipment": "CAT 349D Excavator",
      "supervisor": "Shift In-Charge"
    },
    {
      "id": "rst-023",
      "userId": "usr-srr026",
      "empId": "SRR026",
      "userName": "DILIP WASUDEO DONGE",
      "designation": "Operator",
      "date": "2026-09-03",
      "shift": "B Shift (02:00 PM - 10:00 PM)",
      "shiftCode": "B",
      "site": "ACC Chanda",
      "equipment": "CAT 349D Excavator",
      "supervisor": "Shift In-Charge"
    },
    {
      "id": "rst-024",
      "userId": "usr-srr027",
      "empId": "SRR027",
      "userName": "SHRINIWAS SHANKAR YERLAWAR",
      "designation": "Operator",
      "date": "2026-09-03",
      "shift": "C Shift (10:00 PM - 06:00 AM)",
      "shiftCode": "C",
      "site": "ACC Chanda",
      "equipment": "CAT 349D Excavator",
      "supervisor": "Shift In-Charge"
    },
    {
      "id": "rst-tom-001",
      "date": "2026-09-04",
      "userId": "usr-srr014",
      "empId": "SRR014",
      "userName": "RAJU BALAJI KULMETHE",
      "designation": "Operator",
      "shift": "G Shift (08:30 AM - 05:30 PM)",
      "shiftCode": "G",
      "site": "ACC Chanda Plant Site A",
      "equipment": "HP-12-EX-3491 - CAT 349D Heavy Plant Excavator",
      "vehicleId": "veh-001",
      "supervisor": "Shift In-Charge"
    },
    {
      "id": "rst-tom-002",
      "date": "2026-09-04",
      "userId": "usr-srr015",
      "empId": "SRR015",
      "userName": "AAVUNOORI SRINIVAS",
      "designation": "Operator",
      "shift": "A Shift (06:00 AM - 02:00 PM)",
      "shiftCode": "A",
      "site": "ACC Chanda Plant Site B",
      "equipment": "HP-12-EX-3492 - CAT 349D Heavy Plant Excavator #2",
      "vehicleId": "veh-002",
      "supervisor": "Shift In-Charge"
    },
    {
      "id": "rst-tom-003",
      "date": "2026-09-04",
      "userId": "usr-srr016",
      "empId": "SRR016",
      "userName": "GANESH SHAMRAO GHULE",
      "designation": "Operator",
      "shift": "B Shift (02:00 PM - 10:00 PM)",
      "shiftCode": "B",
      "site": "ACC Chanda Haulage Line",
      "equipment": "HP-12-TP-5011 - Tata Signa 3525.TK Tipper 10-Wheeler",
      "vehicleId": "veh-003",
      "supervisor": "Shift In-Charge"
    },
    {
      "id": "rst-tom-004",
      "date": "2026-09-04",
      "userId": "usr-srr018",
      "empId": "SRR018",
      "userName": "DILIP CHINCHOLKAR",
      "designation": "Operator",
      "shift": "C Shift (10:00 PM - 06:00 AM)",
      "shiftCode": "C",
      "site": "ACC Chanda Haulage Line",
      "equipment": "HP-12-TP-5012 - Tata Signa 3525.TK Tipper 10-Wheeler #2",
      "vehicleId": "veh-004",
      "supervisor": "Shift In-Charge"
    },
    {
      "id": "rst-tom-005",
      "date": "2026-09-04",
      "userId": "usr-srr020",
      "empId": "SRR020",
      "userName": "SUNIL CHARANDAS BHARNE",
      "designation": "Operator",
      "shift": "G Shift (08:30 AM - 05:30 PM)",
      "shiftCode": "G",
      "site": "ACC Chanda Yard & Crusher",
      "equipment": "HP-12-JCB-3001 - JCB 3DX EcoXpert Backhoe Loader",
      "vehicleId": "veh-005",
      "supervisor": "Shift In-Charge"
    },
    {
      "id": "rst-tom-006",
      "date": "2026-09-04",
      "userId": "usr-srr021",
      "empId": "SRR021",
      "userName": "RAJU SHAMRAO WELE",
      "designation": "Operator",
      "shift": "G Shift (08:30 AM - 05:30 PM)",
      "shiftCode": "G",
      "site": "Plant Maintenance Bay 1",
      "equipment": "HP-12-BC-4501 - Bobcat S450 Skid Steer Loader",
      "vehicleId": "veh-006",
      "supervisor": "Shift In-Charge"
    }
  ],
  "attendance": [
    {
      "id": "att-002",
      "userId": "usr-srr002",
      "empId": "SRR002",
      "userName": "MOHMMAD IRFAN SULEMAN SIDDIKI",
      "date": "2026-09-03",
      "shift": "A Shift (06:00 AM - 02:00 PM)",
      "shiftCode": "A",
      "clockIn": "06:00 AM",
      "clockOut": "02:00 PM",
      "status": "Present",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift A Verified"
    },
    {
      "id": "att-003",
      "userId": "usr-srr004",
      "empId": "SRR004",
      "userName": "SHEIKH ISUB SHEIKH KASAM",
      "date": "2026-09-03",
      "shift": "B Shift (02:00 PM - 10:00 PM)",
      "shiftCode": "B",
      "clockIn": "02:00 PM",
      "clockOut": "10:00 PM",
      "status": "Present",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift B Verified"
    },
    {
      "id": "att-004",
      "userId": "usr-srr005",
      "empId": "SRR005",
      "userName": "Ramesh Komuraiah Rudrarapu",
      "date": "2026-09-03",
      "shift": "C Shift (10:00 PM - 06:00 AM)",
      "shiftCode": "C",
      "clockIn": "10:00 PM",
      "clockOut": "06:00 AM",
      "status": "Present",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift C Verified"
    },
    {
      "id": "att-005",
      "userId": "usr-srr006",
      "empId": "SRR006",
      "userName": "PRAVIN PURUSHOTTAM PENDOR",
      "date": "2026-09-03",
      "shift": "G Shift (08:30 AM - 05:30 PM)",
      "shiftCode": "G",
      "clockIn": "08:30 AM",
      "clockOut": "05:30 PM",
      "status": "Present",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift G Verified"
    },
    {
      "id": "att-006",
      "userId": "usr-srr008",
      "empId": "SRR008",
      "userName": "Lokesh Raju Daheka",
      "date": "2026-09-03",
      "shift": "A Shift (06:00 AM - 02:00 PM)",
      "shiftCode": "A",
      "clockIn": "06:00 AM",
      "clockOut": "02:00 PM",
      "status": "Present",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift A Verified"
    },
    {
      "id": "att-007",
      "userId": "usr-srr009",
      "empId": "SRR009",
      "userName": "Hamid Ahmad Nizamuddin Sheikh",
      "date": "2026-09-03",
      "shift": "B Shift (02:00 PM - 10:00 PM)",
      "shiftCode": "B",
      "clockIn": "02:00 PM",
      "clockOut": "10:00 PM",
      "status": "Present",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift B Verified"
    },
    {
      "id": "att-008",
      "userId": "usr-srr010",
      "empId": "SRR010",
      "userName": "MO HASIM ABDUL NAIM ANSARI",
      "date": "2026-09-03",
      "shift": "C Shift (10:00 PM - 06:00 AM)",
      "shiftCode": "C",
      "clockIn": "10:00 PM",
      "clockOut": "06:00 AM",
      "status": "Weekly Off",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift C Verified"
    },
    {
      "id": "att-009",
      "userId": "usr-srr011",
      "empId": "SRR011",
      "userName": "Pawan Raju Asapwar",
      "date": "2026-09-03",
      "shift": "G Shift (08:30 AM - 05:30 PM)",
      "shiftCode": "G",
      "clockIn": "08:30 AM",
      "clockOut": "05:30 PM",
      "status": "Present",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift G Verified"
    },
    {
      "id": "att-010",
      "userId": "usr-srr012",
      "empId": "SRR012",
      "userName": "TAUSIF KHAN",
      "date": "2026-09-03",
      "shift": "A Shift (06:00 AM - 02:00 PM)",
      "shiftCode": "A",
      "clockIn": "06:00 AM",
      "clockOut": "02:00 PM",
      "status": "Present",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift A Verified"
    },
    {
      "id": "att-011",
      "userId": "usr-srr014",
      "empId": "SRR014",
      "userName": "RAJU BALAJI KULMETHE",
      "date": "2026-09-03",
      "shift": "B Shift (02:00 PM - 10:00 PM)",
      "shiftCode": "B",
      "clockIn": "02:00 PM",
      "clockOut": "10:00 PM",
      "status": "Present",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift B Verified"
    },
    {
      "id": "att-012",
      "userId": "usr-srr015",
      "empId": "SRR015",
      "userName": "AAVUNOORI SRINIVAS",
      "date": "2026-09-03",
      "shift": "C Shift (10:00 PM - 06:00 AM)",
      "shiftCode": "C",
      "clockIn": "10:00 PM",
      "clockOut": "06:00 AM",
      "status": "Present",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift C Verified"
    },
    {
      "id": "att-013",
      "userId": "usr-srr016",
      "empId": "SRR016",
      "userName": "GANESH SHAMRAO GHULE",
      "date": "2026-09-03",
      "shift": "G Shift (08:30 AM - 05:30 PM)",
      "shiftCode": "G",
      "clockIn": "08:30 AM",
      "clockOut": "05:30 PM",
      "status": "Present",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift G Verified"
    },
    {
      "id": "att-014",
      "userId": "usr-srr017",
      "empId": "SRR017",
      "userName": "SHANKAR BHUMAYYA KOLGURI",
      "date": "2026-09-03",
      "shift": "A Shift (06:00 AM - 02:00 PM)",
      "shiftCode": "A",
      "clockIn": "06:00 AM",
      "clockOut": "02:00 PM",
      "status": "Present",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift A Verified"
    },
    {
      "id": "att-015",
      "userId": "usr-srr018",
      "empId": "SRR018",
      "userName": "DILIP CHINCHOLKAR",
      "date": "2026-09-03",
      "shift": "B Shift (02:00 PM - 10:00 PM)",
      "shiftCode": "B",
      "clockIn": "02:00 PM",
      "clockOut": "10:00 PM",
      "status": "Present",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift B Verified"
    },
    {
      "id": "att-016",
      "userId": "usr-srr019",
      "empId": "SRR019",
      "userName": "KRISHNA MURLIDHAR BURBANDE",
      "date": "2026-09-03",
      "shift": "C Shift (10:00 PM - 06:00 AM)",
      "shiftCode": "C",
      "clockIn": "10:00 PM",
      "clockOut": "06:00 AM",
      "status": "Leave",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift C Verified"
    },
    {
      "id": "att-017",
      "userId": "usr-srr020",
      "empId": "SRR020",
      "userName": "SUNIL CHARANDAS BHARNE",
      "date": "2026-09-03",
      "shift": "G Shift (08:30 AM - 05:30 PM)",
      "shiftCode": "G",
      "clockIn": "08:30 AM",
      "clockOut": "05:30 PM",
      "status": "Present",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift G Verified"
    },
    {
      "id": "att-018",
      "userId": "usr-srr021",
      "empId": "SRR021",
      "userName": "RAJU SHAMRAO WELE",
      "date": "2026-09-03",
      "shift": "A Shift (06:00 AM - 02:00 PM)",
      "shiftCode": "A",
      "clockIn": "06:00 AM",
      "clockOut": "02:00 PM",
      "status": "Present",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift A Verified"
    },
    {
      "id": "att-019",
      "userId": "usr-srr022",
      "empId": "SRR022",
      "userName": "Manoj Soyam",
      "date": "2026-09-03",
      "shift": "B Shift (02:00 PM - 10:00 PM)",
      "shiftCode": "B",
      "clockIn": "02:00 PM",
      "clockOut": "10:00 PM",
      "status": "Present",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift B Verified"
    },
    {
      "id": "att-020",
      "userId": "usr-srr023",
      "empId": "SRR023",
      "userName": "VINOD PUNDALIK GADDALWAR",
      "date": "2026-09-03",
      "shift": "C Shift (10:00 PM - 06:00 AM)",
      "shiftCode": "C",
      "clockIn": "10:00 PM",
      "clockOut": "06:00 AM",
      "status": "Present",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift C Verified"
    },
    {
      "id": "att-021",
      "userId": "usr-srr024",
      "empId": "SRR024",
      "userName": "KESHAW MALAYYA SODARI",
      "date": "2026-09-03",
      "shift": "G Shift (08:30 AM - 05:30 PM)",
      "shiftCode": "G",
      "clockIn": "08:30 AM",
      "clockOut": "05:30 PM",
      "status": "Present",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift G Verified"
    },
    {
      "id": "att-022",
      "userId": "usr-srr025",
      "empId": "SRR025",
      "userName": "AMIT SUNIL BODHE",
      "date": "2026-09-03",
      "shift": "A Shift (06:00 AM - 02:00 PM)",
      "shiftCode": "A",
      "clockIn": "06:00 AM",
      "clockOut": "02:00 PM",
      "status": "Present",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift A Verified"
    },
    {
      "id": "att-023",
      "userId": "usr-srr026",
      "empId": "SRR026",
      "userName": "DILIP WASUDEO DONGE",
      "date": "2026-09-03",
      "shift": "B Shift (02:00 PM - 10:00 PM)",
      "shiftCode": "B",
      "clockIn": "02:00 PM",
      "clockOut": "10:00 PM",
      "status": "Present",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift B Verified"
    },
    {
      "id": "att-024",
      "userId": "usr-srr027",
      "empId": "SRR027",
      "userName": "SHRINIWAS SHANKAR YERLAWAR",
      "date": "2026-09-03",
      "shift": "C Shift (10:00 PM - 06:00 AM)",
      "shiftCode": "C",
      "clockIn": "10:00 PM",
      "clockOut": "06:00 AM",
      "status": "Present",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift C Verified"
    },
    {
      "id": "att-025",
      "userId": "usr-srr029",
      "empId": "SRR029",
      "userName": "ASHISH SHATRUGHAN DESHBHRATAR",
      "date": "2026-09-03",
      "shift": "G Shift (08:30 AM - 05:30 PM)",
      "shiftCode": "G",
      "clockIn": "08:30 AM",
      "clockOut": "05:30 PM",
      "status": "Present",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift G Verified"
    },
    {
      "id": "att-026",
      "userId": "usr-srr030",
      "empId": "SRR030",
      "userName": "GAJANAN MAROTI HEKAD",
      "date": "2026-09-03",
      "shift": "A Shift (06:00 AM - 02:00 PM)",
      "shiftCode": "A",
      "clockIn": "06:00 AM",
      "clockOut": "02:00 PM",
      "status": "Present",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift A Verified"
    },
    {
      "id": "att-027",
      "userId": "usr-srr031",
      "empId": "SRR031",
      "userName": "PARVEJ ALAM IKRAMUDDIN SHEIKH",
      "date": "2026-09-03",
      "shift": "B Shift (02:00 PM - 10:00 PM)",
      "shiftCode": "B",
      "clockIn": "02:00 PM",
      "clockOut": "10:00 PM",
      "status": "Present",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift B Verified"
    },
    {
      "id": "att-028",
      "userId": "usr-srr032",
      "empId": "SRR032",
      "userName": "SHIVAM CHANDRASHEKHAR SOYAM",
      "date": "2026-09-03",
      "shift": "C Shift (10:00 PM - 06:00 AM)",
      "shiftCode": "C",
      "clockIn": "10:00 PM",
      "clockOut": "06:00 AM",
      "status": "Present",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift C Verified"
    },
    {
      "id": "att-029",
      "userId": "usr-srr033",
      "empId": "SRR033",
      "userName": "RAJESH SIDDHGOPAL YADAV",
      "date": "2026-09-03",
      "shift": "G Shift (08:30 AM - 05:30 PM)",
      "shiftCode": "G",
      "clockIn": "08:30 AM",
      "clockOut": "05:30 PM",
      "status": "Present",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift G Verified"
    },
    {
      "id": "att-030",
      "userId": "usr-srr034",
      "empId": "SRR034",
      "userName": "KANNUR SHYAM SUNDER",
      "date": "2026-09-03",
      "shift": "A Shift (06:00 AM - 02:00 PM)",
      "shiftCode": "A",
      "clockIn": "06:00 AM",
      "clockOut": "02:00 PM",
      "status": "Present",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift A Verified"
    },
    {
      "id": "att-031",
      "userId": "usr-srr035",
      "empId": "SRR035",
      "userName": "SUKHDEV RAMJI SINGH",
      "date": "2026-09-03",
      "shift": "B Shift (02:00 PM - 10:00 PM)",
      "shiftCode": "B",
      "clockIn": "02:00 PM",
      "clockOut": "10:00 PM",
      "status": "Present",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift B Verified"
    },
    {
      "id": "att-032",
      "userId": "usr-srr036",
      "empId": "SRR036",
      "userName": "RAHUL BHATTI",
      "date": "2026-09-03",
      "shift": "C Shift (10:00 PM - 06:00 AM)",
      "shiftCode": "C",
      "clockIn": "10:00 PM",
      "clockOut": "06:00 AM",
      "status": "Present",
      "site": "ACC Chanda",
      "notes": "Muster Roll: Shift C Verified"
    }
  ],
  "vehicles": [],
  "leaves": [
    {
      "id": "lev-001",
      "userId": "usr-srr004",
      "empId": "SRR004",
      "userName": "SHEIKH ISUB SHEIKH KASAM",
      "leaveType": "Casual Leave",
      "startDate": "2026-07-14",
      "endDate": "2026-07-15",
      "days": 2,
      "reason": "Personal Family Function",
      "status": "Approved",
      "appliedDate": "2026-07-10"
    },
    {
      "id": "lev-002",
      "userId": "usr-srr014",
      "empId": "SRR014",
      "userName": "RAJU BALAJI KULMETHE",
      "leaveType": "Sick Leave",
      "startDate": "2026-07-22",
      "endDate": "2026-07-22",
      "days": 1,
      "reason": "Medical Checkup",
      "status": "Approved",
      "appliedDate": "2026-07-21"
    }
  ],
  "vehicleLogs": []
}

// Salary Slips Generator Utility
function generateDefaultSalarySlips(users, mYear = 'August 2026') {
  if (!Array.isArray(users)) return []
  const activeEmployees = users.filter((u) => u.role !== 'Super Admin' && u.status === 'Active')
  const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
  let defaultDim = 31 // August has 31 days
  if (mYear) {
    const parts = mYear.split(' ')
    const mIdx = monthNames.indexOf(parts[0].toLowerCase())
    const yr = parseInt(parts[1]) || 2026
    if (mIdx !== -1) {
      defaultDim = new Date(yr, mIdx + 1, 0).getDate()
    }
  }

  const slips = []
  for (const u of activeEmployees) {
    const dim = defaultDim
    const pdays = Math.min(dim, Number(u.payableDays) || (Number(u.presentDays || 26) + Number(u.weakOff || 4) + Number(u.leave || 0)))
    const ctc = Number(u.ctc)
    const bpd = Number(u.basicPerDay)

    let basic = 0, da = 0, hra = 0, specialAllowance = 0, grossPay = 0
    let pf = 0, esic = 0, pt = 0, totalDeductions = 0, netPay = 0

    if (ctc && ctc > 0) {
      const basicPerDay = (ctc / 2) / dim
      basic = Math.round(basicPerDay * pdays * 100) / 100
      da = 0
      hra = Math.round(0.40 * basic * 100) / 100
      const pfEmployer = Math.round((basic + da) * 0.12 * 100) / 100
      const ctcWorking = Math.round((ctc / dim) * pdays * 100) / 100
      grossPay = Math.round((ctcWorking - pfEmployer) * 100) / 100
      specialAllowance = Math.round(Math.max(0, grossPay - (basic + da + hra)) * 100) / 100
      pf = Math.round((basic + da) * 0.12 * 100) / 100
      pt = grossPay > 0 ? 200 : 0
      esic = 0
      totalDeductions = Math.round((pf + pt + esic) * 100) / 100
      netPay = Math.round((grossPay - totalDeductions) * 100) / 100
    } else {
      const bpdVal = bpd || 444.62
      basic = Math.round(bpdVal * pdays * 100) / 100
      da = Math.round(289.38 * pdays * 100) / 100
      hra = Math.round(62.70 * pdays * 100) / 100
      specialAllowance = 0
      grossPay = Math.round((basic + da + hra) * 100) / 100
      pf = Math.round((basic + da) * 0.12 * 100) / 100
      esic = Math.round(grossPay * 0.0075 * 100) / 100
      pt = grossPay > 0 ? 200 : 0
      totalDeductions = Math.round((pf + esic + pt) * 100) / 100
      netPay = Math.round((grossPay - totalDeductions) * 100) / 100
    }

    slips.push({
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
      paymentDate: mYear.includes('August') ? '2026-08-31' : (mYear.includes('July') ? '2026-07-31' : '2026-09-30'),
      isManuallyCorrected: false,
      manualLocked: false
    })
  }
  return slips
}

// Database Access Helpers
const getDb = async (env) => {
  let dbData = DEFAULT_INITIAL_DB
  if (!env || !env.PAYROLL_DB) {
    dbData = DEFAULT_INITIAL_DB
  } else {
    const raw = await env.PAYROLL_DB.get('db_v8')
    if (!raw) {
      await env.PAYROLL_DB.put('db_v8', JSON.stringify(DEFAULT_INITIAL_DB))
      dbData = DEFAULT_INITIAL_DB
    } else {
      try {
        dbData = JSON.parse(raw)
      } catch (e) {
        dbData = DEFAULT_INITIAL_DB
      }
    }
  }

  let dbNeedsSave = false

  // Ensure all employees have allocated leaves and accurate leave balance without wiping out custom credits or deductions
  if (dbData && Array.isArray(dbData.users)) {
    dbData.users.forEach((u) => {
      if (u.totalLeaves === undefined || u.totalLeaves === null) {
        u.totalLeaves = 10
        dbNeedsSave = true
      }
      if (u.leavesTaken === undefined || u.leavesTaken === null) {
        u.leavesTaken = 0
        dbNeedsSave = true
      }
      if (u.leaveBalance === undefined || u.leaveBalance === null) {
        u.leaveBalance = Math.max(0, (Number(u.totalLeaves) || 10) - (Number(u.leavesTaken) || 0))
        dbNeedsSave = true
      }
    })
  }

  // Ensure August 2026, July 2026, and September 2026 salary structures/slips exist without overwriting existing/manual slips
  if (dbData && Array.isArray(dbData.users)) {
    if (!dbData.salarySlips) dbData.salarySlips = []

    const hasAugust = dbData.salarySlips.some((s) => s.monthYear === 'August 2026')
    const hasJuly = dbData.salarySlips.some((s) => s.monthYear === 'July 2026')
    const hasSeptember = dbData.salarySlips.some((s) => s.monthYear === 'September 2026')

    if (!hasAugust || !hasJuly || !hasSeptember) {
      if (!hasAugust) {
        const existingEmpIds = new Set(dbData.salarySlips.filter((s) => s.monthYear === 'August 2026').map((s) => s.empId || s.userId))
        const augSlips = generateDefaultSalarySlips(dbData.users.filter((u) => !existingEmpIds.has(u.empId) && !existingEmpIds.has(u.id)), 'August 2026')
        dbData.salarySlips = [...dbData.salarySlips, ...augSlips]
        dbNeedsSave = true
      }
      if (!hasJuly) {
        const existingEmpIds = new Set(dbData.salarySlips.filter((s) => s.monthYear === 'July 2026').map((s) => s.empId || s.userId))
        const julSlips = generateDefaultSalarySlips(dbData.users.filter((u) => !existingEmpIds.has(u.empId) && !existingEmpIds.has(u.id)), 'July 2026')
        dbData.salarySlips = [...dbData.salarySlips, ...julSlips]
        dbNeedsSave = true
      }
      if (!hasSeptember) {
        const existingEmpIds = new Set(dbData.salarySlips.filter((s) => s.monthYear === 'September 2026').map((s) => s.empId || s.userId))
        const sepSlips = generateDefaultSalarySlips(dbData.users.filter((u) => !existingEmpIds.has(u.empId) && !existingEmpIds.has(u.id)), 'September 2026')
        dbData.salarySlips = [...dbData.salarySlips, ...sepSlips]
        dbNeedsSave = true
      }
    }
  }

  if (dbNeedsSave && env && env.PAYROLL_DB) {
    await env.PAYROLL_DB.put('db_v8', JSON.stringify(dbData))
  }

  return dbData
}

const setDb = async (env, data) => {
  if (env && env.PAYROLL_DB) {
    await env.PAYROLL_DB.put('db_v8', JSON.stringify(data))
  }
}

// Health Check
app.get('/health', (c) => c.json({ status: 'OK', timestamp: new Date().toISOString(), platform: 'Shree RR Trading Company Secure RBAC Payroll Portal' }))

// Admin Reset DB
app.post('/api/payroll/reset-db', async (c) => {
  await setDb(c.env, DEFAULT_INITIAL_DB)
  return c.json({ success: true, message: 'Database reset to clean state: vehicles cleared, MTTR and availability tracking ready.' })
})

// 1. Auth Login (Strict Credential Verification with Env Vars & Input Sanitization)
app.post('/api/payroll/auth/login', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const rawEmail = sanitizeString(body.email, 150)
  const rawPassword = body.password ? String(body.password).trim() : ''

  if (!rawEmail || !rawPassword) {
    return c.json({ success: false, message: 'Email / ID and password required' }, 400)
  }

  const cleanEmail = rawEmail.toLowerCase()
  const db = await getDb(c.env)

  // Super Admin Check (Environment-driven with safe dev defaults)
  const adminEmail = sanitizeEmail(c.env?.ADMIN_EMAIL || 'admin@srijandev.in')
  const adminPassword = c.env?.ADMIN_PASSWORD || 'Jaishreeram@907'

  if (cleanEmail === adminEmail && rawPassword === adminPassword) {
    const adminUser = (db.users || []).find((u) => u.email && u.email.toLowerCase() === adminEmail) || {
      id: 'usr-admin-srijandev',
      empId: 'SRR-ADMIN',
      name: 'Super Administrator',
      email: adminEmail,
      role: 'Super Admin',
      designation: 'System Administrator',
      loginAllowed: true,
      mustChangePassword: false,
      permissions: {
        'payroll.salary_structure.view': true,
        'payroll.manage_all': true,
        'reports.bank_deposit.export': true,
        'attendance.muster.mark': true,
        'fleets.manage': true,
        'hr.users.manage': true,
        'hr.appointment_letter.generate': true,
        'expenses.field_claims.process': true,
        '*': true
      }
    }
    const { password: _, ...adminSafe } = adminUser
    return c.json({ success: true, message: 'Super Admin login successful', user: adminSafe })
  }

  const user = (db.users || []).find(
    (u) => (u.email && u.email.toLowerCase() === cleanEmail || (u.empId && u.empId.toLowerCase() === cleanEmail)) && u.password === rawPassword
  )

  if (!user) {
    return c.json({ success: false, message: 'Invalid credentials. Please verify your login email/ID and password.' }, 401)
  }
  if (user.status === 'Inactive') {
    return c.json({ success: false, message: 'Account is deactivated. Contact Superadmin.' }, 403)
  }
  if ((user.loginAllowed === false || user.loginEnabled === false) && user.role !== 'Super Admin') {
    return c.json({ success: false, message: 'Portal login access has not been granted for your account. Please contact Super Admin.' }, 403)
  }

  const { password: _, ...userSafe } = user
  return c.json({ success: true, message: 'Login successful', user: userSafe })
})

// Force Password Change API
app.post('/api/payroll/auth/change-password', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const userId = sanitizeAlphanumeric(body.userId, 100)
  const newPassword = body.newPassword ? String(body.newPassword).trim() : ''

  if (!userId || !newPassword || newPassword.length < 6) {
    return c.json({ success: false, message: 'Valid new password is required (min 6 chars).' }, 400)
  }

  const db = await getDb(c.env)
  const index = (db.users || []).findIndex((u) => u.id === userId || u.empId === userId)
  if (index === -1) return c.json({ success: false, message: 'User not found' }, 404)

  db.users[index].password = newPassword
  db.users[index].mustChangePassword = false
  await setDb(c.env, db)

  return c.json({ success: true, message: 'Password changed successfully.' })
})

// 2. Users CRUD & Granular Feature Permissions Matrix
app.get('/api/payroll/users', async (c) => {
  const db = await getDb(c.env)
  const usersSafe = (db.users || []).map(({ password, ...u }) => u)
  return c.json({ success: true, users: usersSafe })
})

app.post('/api/payroll/users', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const name = sanitizeString(body.name, 120)
  if (!name) {
    return c.json({ success: false, message: 'Employee name is required' }, 400)
  }

  const db = await getDb(c.env)
  const empCount = (db.users || []).length
  const empId = sanitizeAlphanumeric(body.empId, 50) || `SRR${String(empCount + 1).padStart(3, '0')}`

  const existing = (db.users || []).find((u) => u.empId && u.empId.toLowerCase() === empId.toLowerCase())
  if (existing) {
    return c.json({ success: false, message: `Employee with ID ${empId} already exists` }, 400)
  }

  const assignedRole = sanitizeString(body.role, 50) || 'Worker'
  const isSuper = assignedRole === 'Super Admin'

  const defaultPermissions = body.permissions || {
    'payroll.salary_structure.view': false,
    'payroll.manage_all': false,
    'reports.bank_deposit.export': false,
    'attendance.muster.mark': false,
    'fleets.manage': false,
    'hr.users.manage': false,
    'hr.appointment_letter.generate': false,
    'expenses.field_claims.process': false,
    'payroll.slip.view_own': true
  }

  const emailVal = sanitizeEmail(body.email) || `${empId.toLowerCase()}@shreerrtradingcompany.com`
  const pwdVal = body.password ? String(body.password).trim() : `${empId}@123`

  const newUser = {
    id: `usr-${empId.toLowerCase()}`,
    empId,
    name,
    email: emailVal,
    password: pwdVal,
    role: assignedRole,
    loginAllowed: body.loginAllowed !== undefined ? Boolean(body.loginAllowed) : (body.loginEnabled !== undefined ? Boolean(body.loginEnabled) : false),
    loginEnabled: body.loginAllowed !== undefined ? Boolean(body.loginAllowed) : (body.loginEnabled !== undefined ? Boolean(body.loginEnabled) : false),
    mustChangePassword: body.mustChangePassword !== undefined ? Boolean(body.mustChangePassword) : (!isSuper),
    permissions: defaultPermissions,
    designation: sanitizeString(body.designation || body.rank, 100) || 'Staff Member',
    rank: sanitizeString(body.rank || body.designation, 100) || 'Staff',
    department: sanitizeString(body.department, 100) || 'Plant Fleet & Garage O&M',
    site: sanitizeString(body.site || body.location, 100) || 'ACC Chanda',
    location: sanitizeString(body.location || body.site, 100) || 'ACC Chanda',
    phone: sanitizeString(body.phone, 30) || (body.mobile ? `+91 ${sanitizeString(body.mobile, 15)}` : ''),
    mobile: sanitizeString(body.mobile, 15) || (body.phone ? String(body.phone).replace(/[^0-9]/g, '').slice(-10) : ''),
    baseSalary: sanitizeNumber(body.baseSalary || body.ctc, 25000),
    ctc: body.ctc ? sanitizeNumber(body.ctc) : null,
    basicPerDay: body.basicPerDay ? sanitizeNumber(body.basicPerDay) : null,
    bankAccount: sanitizeAlphanumeric(body.bankAccount, 50),
    ifsc: sanitizeAlphanumeric(body.ifsc, 30),
    uan: sanitizeAlphanumeric(body.uan, 30),
    esicNo: sanitizeAlphanumeric(body.esicNo, 30),
    pfNo: sanitizeAlphanumeric(body.pfNo, 40),
    fatherName: sanitizeString(body.fatherName, 120),
    dob: sanitizeDateString(body.dob),
    doj: sanitizeDateString(body.doj) || new Date().toLocaleDateString('en-GB'),
    category: sanitizeString(body.category, 50) || 'Skilled',
    presentDays: sanitizeNumber(body.presentDays, 26, 0, 31),
    weakOff: sanitizeNumber(body.weakOff, 4, 0, 10),
    leave: sanitizeNumber(body.leave, 0, 0, 31),
    totalLeaves: sanitizeNumber(body.totalLeaves, 10, 0, 100),
    leavesTaken: sanitizeNumber(body.leave, 0, 0, 100),
    leaveBalance: Math.max(0, sanitizeNumber(body.totalLeaves, 10) - sanitizeNumber(body.leave, 0)),
    payableDays: sanitizeNumber(body.presentDays, 26) + sanitizeNumber(body.weakOff, 4) + sanitizeNumber(body.leave, 0),
    daysInMonth: sanitizeNumber(body.daysInMonth, 30, 28, 31),
    status: 'Active',
    createdAt: new Date().toISOString()
  }

  db.users.push(newUser)
  await setDb(c.env, db)

  const { password: _, ...userSafe } = newUser
  return c.json({ success: true, message: 'Record created successfully', user: userSafe })
})

// Superadmin Dynamic Feature Provisioning Matrix Endpoint
app.put('/api/payroll/users/:id/access', async (c) => {
  const id = sanitizeAlphanumeric(c.req.param('id'), 100)
  const body = await c.req.json().catch(() => ({}))
  const db = await getDb(c.env)

  const index = (db.users || []).findIndex((u) => u.id === id || u.empId === id)
  if (index === -1) {
    return c.json({ success: false, message: 'User not found' }, 404)
  }

  const target = db.users[index]
  if (body.loginAllowed !== undefined) target.loginAllowed = Boolean(body.loginAllowed)
  if (body.loginEnabled !== undefined) target.loginEnabled = Boolean(body.loginEnabled)
  if (body.mustChangePassword !== undefined) target.mustChangePassword = Boolean(body.mustChangePassword)
  if (body.role) target.role = sanitizeString(body.role, 50)
  if (body.password && String(body.password).trim()) target.password = String(body.password).trim()
  if (body.permissions && typeof body.permissions === 'object') {
    target.permissions = { ...(target.permissions || {}), ...body.permissions }
  }

  await setDb(c.env, db)
  const { password: _, ...userSafe } = target
  return c.json({ success: true, message: 'Feature permissions matrix updated successfully', user: userSafe })
})

app.put('/api/payroll/users/:id', async (c) => {
  const id = sanitizeAlphanumeric(c.req.param('id'), 100)
  const updates = await c.req.json().catch(() => ({}))
  const db = await getDb(c.env)

  const index = (db.users || []).findIndex((u) => u.id === id || u.empId === id)
  if (index === -1) {
    return c.json({ success: false, message: 'Employee not found' }, 404)
  }

  if (!updates.password || !String(updates.password).trim()) {
    delete updates.password
  }

  // Sanitize updated fields
  const safeUpdates = {}
  for (const [k, v] of Object.entries(updates)) {
    if (typeof v === 'string') {
      safeUpdates[k] = sanitizeString(v, 250)
    } else if (typeof v === 'number') {
      safeUpdates[k] = sanitizeNumber(v)
    } else {
      safeUpdates[k] = v
    }
  }

  db.users[index] = { ...db.users[index], ...safeUpdates }
  await setDb(c.env, db)

  const { password: _, ...userSafe } = db.users[index]
  return c.json({ success: true, message: 'Employee updated successfully', user: userSafe })
})

app.delete('/api/payroll/users/:id', async (c) => {
  const id = sanitizeAlphanumeric(c.req.param('id'), 100)
  const db = await getDb(c.env)

  const initialLength = (db.users || []).length
  db.users = (db.users || []).filter((u) => u.id !== id && u.empId !== id)

  if (db.users.length === initialLength) {
    return c.json({ success: false, message: 'Employee not found' }, 404)
  }

  await setDb(c.env, db)
  return c.json({ success: true, message: 'Employee record removed from organisation.' })
})

// 3. Vehicles Management & Availability / Breakdown (B/D) Engine
app.get('/api/payroll/vehicles', async (c) => {
  const db = await getDb(c.env)
  return c.json({ success: true, vehicles: db.vehicles || [] })
})

app.post('/api/payroll/vehicles', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const vehicleNo = sanitizeAlphanumeric(body.vehicleNo, 30)
  const name = sanitizeString(body.name, 100)

  if (!vehicleNo || !name) {
    return c.json({ success: false, message: 'Vehicle number and name are required' }, 400)
  }

  const db = await getDb(c.env)
  if (!db.vehicles) db.vehicles = []

  const existing = db.vehicles.find((v) => v.vehicleNo.toLowerCase() === vehicleNo.toLowerCase())
  if (existing) {
    return c.json({ success: false, message: `Vehicle with number ${vehicleNo} already exists` }, 400)
  }

  const newVehicle = {
    id: `veh-${Date.now()}`,
    vehicleNo,
    name,
    type: sanitizeString(body.type, 50) || 'Excavator',
    model: sanitizeString(body.model, 80) || 'Heavy Plant Machinery',
    site: sanitizeString(body.site, 80) || 'ACC Chanda Plant Site',
    operatorId: sanitizeAlphanumeric(body.operatorId, 50),
    operatorName: sanitizeString(body.operatorName, 100) || 'Unassigned',
    status: sanitizeString(body.status, 50) || 'Active (Plant Duty)',
    fuelType: sanitizeString(body.fuelType, 30) || 'Diesel',
    hourlyRate: sanitizeNumber(body.hourlyRate),
    notes: sanitizeString(body.notes, 250),
    fitnessExpiry: sanitizeDateString(body.fitnessExpiry),
    fitnessCertNo: sanitizeAlphanumeric(body.fitnessCertNo, 50),
    pucExpiry: sanitizeDateString(body.pucExpiry),
    pucCertNo: sanitizeAlphanumeric(body.pucCertNo, 50),
    insuranceExpiry: sanitizeDateString(body.insuranceExpiry),
    insurancePolicyNo: sanitizeAlphanumeric(body.insurancePolicyNo, 50),
    insuranceProvider: sanitizeString(body.insuranceProvider, 100) || 'National Insurance / TATA AIG',
    permitExpiry: sanitizeDateString(body.permitExpiry),
    permitNo: sanitizeAlphanumeric(body.permitNo, 50),
    permitType: sanitizeString(body.permitType, 80) || 'National / Commercial Goods Permit',
    roadTaxExpiry: sanitizeDateString(body.roadTaxExpiry),
    roadTaxReceipt: sanitizeAlphanumeric(body.roadTaxReceipt, 50),
    complianceNotes: sanitizeString(body.complianceNotes, 250),
    createdAt: new Date().toISOString()
  }

  db.vehicles.push(newVehicle)
  await setDb(c.env, db)

  return c.json({ success: true, message: 'Vehicle added successfully', vehicle: newVehicle })
})

// Bulk Import Vehicles Endpoint
app.post('/api/payroll/vehicles/bulk', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const { vehicles } = body

  if (!Array.isArray(vehicles) || vehicles.length === 0) {
    return c.json({ success: false, message: 'Valid vehicles array is required' }, 400)
  }

  const db = await getDb(c.env)
  if (!db.vehicles) db.vehicles = []

  let importedCount = 0
  for (const v of vehicles) {
    const vNo = sanitizeAlphanumeric(v.vehicleNo, 30)
    const vName = sanitizeString(v.name, 100)
    if (!vNo || !vName) continue

    const existingIndex = db.vehicles.findIndex((x) => x.vehicleNo.toUpperCase() === vNo.toUpperCase())

    const vehicleObj = {
      id: existingIndex !== -1 ? db.vehicles[existingIndex].id : `veh-${Date.now()}-${importedCount}`,
      vehicleNo: vNo,
      name: vName,
      type: sanitizeString(v.type, 50) || 'Excavator',
      model: sanitizeString(v.model, 80) || 'Heavy Plant Machinery',
      site: sanitizeString(v.site, 80) || 'ACC Chanda Plant Site',
      operatorId: sanitizeAlphanumeric(v.operatorId, 50),
      operatorName: sanitizeString(v.operatorName, 100) || 'Unassigned',
      status: sanitizeString(v.status, 50) || 'Active (Plant Duty)',
      fuelType: sanitizeString(v.fuelType, 30) || 'Diesel',
      hourlyRate: sanitizeNumber(v.hourlyRate),
      notes: sanitizeString(v.notes, 250) || 'Bulk Imported Plant Fleet',
      fitnessExpiry: sanitizeDateString(v.fitnessExpiry) || (existingIndex !== -1 ? db.vehicles[existingIndex].fitnessExpiry : '2027-03-31'),
      fitnessCertNo: sanitizeAlphanumeric(v.fitnessCertNo, 50) || (existingIndex !== -1 ? db.vehicles[existingIndex].fitnessCertNo : `FIT-${vNo.slice(-4)}`),
      pucExpiry: sanitizeDateString(v.pucExpiry) || (existingIndex !== -1 ? db.vehicles[existingIndex].pucExpiry : '2026-11-30'),
      pucCertNo: sanitizeAlphanumeric(v.pucCertNo, 50) || (existingIndex !== -1 ? db.vehicles[existingIndex].pucCertNo : `PUC-${vNo.slice(-4)}`),
      insuranceExpiry: sanitizeDateString(v.insuranceExpiry) || (existingIndex !== -1 ? db.vehicles[existingIndex].insuranceExpiry : '2026-12-31'),
      insurancePolicyNo: sanitizeAlphanumeric(v.insurancePolicyNo, 50) || (existingIndex !== -1 ? db.vehicles[existingIndex].insurancePolicyNo : `POL-${vNo.slice(-6)}`),
      insuranceProvider: sanitizeString(v.insuranceProvider, 100) || (existingIndex !== -1 ? db.vehicles[existingIndex].insuranceProvider : 'National Insurance / TATA AIG'),
      permitExpiry: sanitizeDateString(v.permitExpiry) || (existingIndex !== -1 ? db.vehicles[existingIndex].permitExpiry : '2027-06-30'),
      permitNo: sanitizeAlphanumeric(v.permitNo, 50) || (existingIndex !== -1 ? db.vehicles[existingIndex].permitNo : `PRM-${vNo.slice(-5)}`),
      permitType: sanitizeString(v.permitType, 80) || (existingIndex !== -1 ? db.vehicles[existingIndex].permitType : 'National / Commercial Goods Permit'),
      roadTaxExpiry: sanitizeDateString(v.roadTaxExpiry) || (existingIndex !== -1 ? db.vehicles[existingIndex].roadTaxExpiry : '2027-03-31'),
      roadTaxReceipt: sanitizeAlphanumeric(v.roadTaxReceipt, 50),
      complianceNotes: sanitizeString(v.complianceNotes, 250),
      createdAt: new Date().toISOString()
    }

    if (existingIndex !== -1) {
      db.vehicles[existingIndex] = { ...db.vehicles[existingIndex], ...vehicleObj }
    } else {
      db.vehicles.push(vehicleObj)
    }
    importedCount++
  }

  await setDb(c.env, db)
  return c.json({ success: true, message: `Successfully imported ${importedCount} plant vehicles!`, vehicles: db.vehicles })
})

// Delete All Vehicles Endpoint
app.delete('/api/payroll/vehicles/all', async (c) => {
  const db = await getDb(c.env)
  db.vehicles = []
  await setDb(c.env, db)
  return c.json({ success: true, message: 'All vehicles have been deleted from the system.' })
})

app.put('/api/payroll/vehicles/:id', async (c) => {
  const id = sanitizeAlphanumeric(c.req.param('id'), 100)
  const updates = await c.req.json().catch(() => ({}))
  const db = await getDb(c.env)

  if (!db.vehicles) db.vehicles = []
  const index = db.vehicles.findIndex((v) => v.id === id || v.vehicleNo.toUpperCase() === id.toUpperCase())
  if (index === -1) {
    return c.json({ success: false, message: 'Vehicle not found' }, 404)
  }

  const safeUpdates = {}
  for (const [k, v] of Object.entries(updates)) {
    if (typeof v === 'string') safeUpdates[k] = sanitizeString(v, 250)
    else if (typeof v === 'number') safeUpdates[k] = sanitizeNumber(v)
    else safeUpdates[k] = v
  }

  db.vehicles[index] = { ...db.vehicles[index], ...safeUpdates }
  await setDb(c.env, db)

  return c.json({ success: true, message: 'Vehicle updated successfully', vehicle: db.vehicles[index] })
})

// Single Vehicle Compliance Update Endpoint
app.put('/api/payroll/vehicles/:id/compliance', async (c) => {
  const id = sanitizeAlphanumeric(c.req.param('id'), 100)
  const complianceData = await c.req.json().catch(() => ({}))
  const db = await getDb(c.env)

  if (!db.vehicles) db.vehicles = []
  const index = db.vehicles.findIndex((v) => v.id === id || v.vehicleNo.toUpperCase() === id.toUpperCase())
  if (index === -1) {
    return c.json({ success: false, message: 'Vehicle not found' }, 404)
  }

  db.vehicles[index] = {
    ...db.vehicles[index],
    fitnessExpiry: complianceData.fitnessExpiry !== undefined ? sanitizeDateString(complianceData.fitnessExpiry) : db.vehicles[index].fitnessExpiry,
    fitnessCertNo: complianceData.fitnessCertNo !== undefined ? sanitizeAlphanumeric(complianceData.fitnessCertNo, 50) : db.vehicles[index].fitnessCertNo,
    pucExpiry: complianceData.pucExpiry !== undefined ? sanitizeDateString(complianceData.pucExpiry) : db.vehicles[index].pucExpiry,
    pucCertNo: complianceData.pucCertNo !== undefined ? sanitizeAlphanumeric(complianceData.pucCertNo, 50) : db.vehicles[index].pucCertNo,
    insuranceExpiry: complianceData.insuranceExpiry !== undefined ? sanitizeDateString(complianceData.insuranceExpiry) : db.vehicles[index].insuranceExpiry,
    insurancePolicyNo: complianceData.insurancePolicyNo !== undefined ? sanitizeAlphanumeric(complianceData.insurancePolicyNo, 50) : db.vehicles[index].insurancePolicyNo,
    insuranceProvider: complianceData.insuranceProvider !== undefined ? sanitizeString(complianceData.insuranceProvider, 100) : db.vehicles[index].insuranceProvider,
    permitExpiry: complianceData.permitExpiry !== undefined ? sanitizeDateString(complianceData.permitExpiry) : db.vehicles[index].permitExpiry,
    permitNo: complianceData.permitNo !== undefined ? sanitizeAlphanumeric(complianceData.permitNo, 50) : db.vehicles[index].permitNo,
    permitType: complianceData.permitType !== undefined ? sanitizeString(complianceData.permitType, 80) : db.vehicles[index].permitType,
    roadTaxExpiry: complianceData.roadTaxExpiry !== undefined ? sanitizeDateString(complianceData.roadTaxExpiry) : db.vehicles[index].roadTaxExpiry,
    roadTaxReceipt: complianceData.roadTaxReceipt !== undefined ? sanitizeAlphanumeric(complianceData.roadTaxReceipt, 50) : db.vehicles[index].roadTaxReceipt,
    complianceNotes: complianceData.complianceNotes !== undefined ? sanitizeString(complianceData.complianceNotes, 250) : db.vehicles[index].complianceNotes,
    lastComplianceUpdate: new Date().toISOString()
  }

  await setDb(c.env, db)
  return c.json({
    success: true,
    message: `Compliance statutory records for ${db.vehicles[index].vehicleNo} updated successfully!`,
    vehicle: db.vehicles[index]
  })
})

app.delete('/api/payroll/vehicles/:id', async (c) => {
  const id = sanitizeAlphanumeric(c.req.param('id'), 100)
  const db = await getDb(c.env)

  if (!db.vehicles) db.vehicles = []
  const initialLength = db.vehicles.length
  db.vehicles = db.vehicles.filter((v) => v.id !== id && v.vehicleNo.toUpperCase() !== id.toUpperCase())

  if (db.vehicles.length === initialLength) {
    return c.json({ success: false, message: 'Vehicle not found' }, 404)
  }

  await setDb(c.env, db)
  return c.json({ success: true, message: 'Vehicle deleted from fleet records.' })
})

// 4. Vehicle Breakdown (B/D) & Availability Logs
app.get('/api/payroll/vehicle-logs', async (c) => {
  const db = await getDb(c.env)
  return c.json({ success: true, vehicleLogs: db.vehicleLogs || [] })
})

app.post('/api/payroll/vehicle-logs', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const vehicleNo = sanitizeAlphanumeric(body.vehicleNo, 30)

  if (!vehicleNo) {
    return c.json({ success: false, message: 'Vehicle number is required' }, 400)
  }

  const db = await getDb(c.env)
  if (!db.vehicleLogs) db.vehicleLogs = []

  const veh = (db.vehicles || []).find((v) => v.vehicleNo.toUpperCase() === vehicleNo.toUpperCase())

  const scheduledHrs = sanitizeNumber(body.totalHours, 24, 1, 24)
  const bdHrs = sanitizeNumber(body.breakdownHours, 0, 0, scheduledHrs)
  const opHrs = body.operatingHours !== undefined ? sanitizeNumber(body.operatingHours, 0, 0, scheduledHrs) : Math.max(0, scheduledHrs - bdHrs)
  const idlHrs = sanitizeNumber(body.idleHours, 0, 0, scheduledHrs)

  const newLog = {
    id: `vlog-${Date.now()}`,
    date: sanitizeDateString(body.date) || new Date().toISOString().split('T')[0],
    vehicleNo,
    vehicleName: veh ? veh.name : 'Heavy Machinery',
    model: veh ? veh.model : '',
    totalHours: scheduledHrs,
    operatingHours: opHrs,
    breakdownHours: bdHrs,
    idleHours: idlHrs,
    failureType: sanitizeString(body.failureType, 80) || 'Mechanical Fault',
    reason: sanitizeString(body.reason, 200) || 'Scheduled Wear / Component Replacement',
    actionTaken: sanitizeString(body.actionTaken, 200) || 'Repaired & Inspected by Garage Engineer',
    status: sanitizeString(body.status, 50) || (bdHrs > 0 ? 'Resolved' : 'Operating Normal'),
    createdAt: new Date().toISOString()
  }

  db.vehicleLogs.unshift(newLog)
  await setDb(c.env, db)

  return c.json({ success: true, message: 'Vehicle breakdown / availability record logged!', log: newLog })
})

app.delete('/api/payroll/vehicle-logs/:id', async (c) => {
  const rawId = c.req.param('id')
  const id = sanitizeAlphanumeric(rawId, 100)
  const db = await getDb(c.env)
  if (!db.vehicleLogs) db.vehicleLogs = []
  const initialLength = db.vehicleLogs.length
  db.vehicleLogs = db.vehicleLogs.filter((l) => 
    String(l.id || '').trim().toLowerCase() !== String(id).trim().toLowerCase() &&
    String(l.id || '').trim().toLowerCase() !== String(rawId || '').trim().toLowerCase()
  )
  await setDb(c.env, db)
  const deletedCount = initialLength - db.vehicleLogs.length
  return c.json({ success: true, message: 'Vehicle log entry deleted.', deletedCount })
})

// 5. Attendance & Daily Muster Roll
app.get('/api/payroll/attendance', async (c) => {
  const db = await getDb(c.env)
  return c.json({ success: true, attendance: db.attendance || [] })
})

app.post('/api/payroll/attendance', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const userId = sanitizeAlphanumeric(body.userId, 50)
  const date = sanitizeDateString(body.date)

  if (!userId || !date) {
    return c.json({ success: false, message: 'userId and date are required' }, 400)
  }

  const db = await getDb(c.env)
  const user = (db.users || []).find((u) => u.id === userId || u.empId === userId)

  const status = sanitizeString(body.status, 30) || 'Present'
  const isAbsentOrOff = status === 'Absent' || status === 'Weekly Off' || status === 'Leave'

  const newRecord = {
    id: `att-${Date.now()}`,
    userId,
    empId: user ? user.empId : '',
    userName: user ? user.name : 'Employee',
    date,
    shift: sanitizeString(body.shift, 80) || 'G Shift (08:30 AM - 05:30 PM)',
    shiftCode: sanitizeAlphanumeric(body.shiftCode, 10) || 'G',
    clockIn: sanitizeString(body.clockIn, 30) || (isAbsentOrOff ? '-' : '08:30 AM'),
    clockOut: sanitizeString(body.clockOut, 30) || (isAbsentOrOff ? '-' : '05:30 PM'),
    status,
    site: sanitizeString(body.site || (user ? user.site : 'ACC Chanda'), 80),
    notes: sanitizeString(body.notes, 200) || (status === 'Absent' ? 'Muster Roll: Absent' : 'Muster Roll Entry')
  }

  if (!db.attendance) db.attendance = []
  db.attendance.unshift(newRecord)
  await setDb(c.env, db)

  return c.json({ success: true, message: 'Attendance recorded', attendance: newRecord })
})

app.post('/api/payroll/attendance/muster-roll-bulk', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const date = sanitizeDateString(body.date)
  const { musterRecords } = body

  if (!date || !Array.isArray(musterRecords) || musterRecords.length === 0) {
    return c.json({ success: false, message: 'Date and musterRecords array required' }, 400)
  }

  const db = await getDb(c.env)
  if (!db.attendance) db.attendance = []

  db.attendance = db.attendance.filter((a) => a.date !== date)

  for (const r of musterRecords) {
    const user = (db.users || []).find((u) => u.id === r.userId || u.empId === r.empId)
    const status = sanitizeString(r.status, 30) || 'Present'
    const isAbOrOff = status === 'Absent' || status === 'Weekly Off' || status === 'Leave'
    const shiftCode = sanitizeAlphanumeric(r.shiftCode, 10) || 'G'

    db.attendance.push({
      id: `att-${Date.now()}-${sanitizeAlphanumeric(r.empId, 30)}`,
      userId: sanitizeAlphanumeric(r.userId, 50) || (user ? user.id : ''),
      empId: sanitizeAlphanumeric(r.empId, 30),
      userName: sanitizeString(r.userName, 100) || (user ? user.name : 'Employee'),
      date,
      shift: sanitizeString(r.shift, 80) || 'G Shift (08:30 AM - 05:30 PM)',
      shiftCode,
      clockIn: sanitizeString(r.clockIn, 30) || (isAbOrOff ? '-' : (shiftCode === 'A' ? '06:00 AM' : (shiftCode === 'B' ? '02:00 PM' : (shiftCode === 'C' ? '10:00 PM' : '08:30 AM')))),
      clockOut: sanitizeString(r.clockOut, 30) || (isAbOrOff ? '-' : (shiftCode === 'A' ? '02:00 PM' : (shiftCode === 'B' ? '10:00 PM' : (shiftCode === 'C' ? '06:00 AM' : '05:30 PM')))),
      status,
      site: sanitizeString(r.site || (user ? user.site : 'ACC Chanda'), 80),
      notes: sanitizeString(r.notes, 200) || (status === 'Absent' ? 'Daily Muster Roll: Absent' : `Daily Muster Roll: Shift ${shiftCode} Marked`)
    })
  }

  await setDb(c.env, db)
  return c.json({ 
    success: true, 
    message: `Muster roll for ${date} saved successfully (${musterRecords.length} workers marked).`,
    attendance: db.attendance 
  })
})

// 6. Duty Rosters & Tomorrow Shift/Machine Schedule
app.get('/api/payroll/rosters', async (c) => {
  const db = await getDb(c.env)
  return c.json({ success: true, rosters: db.rosters || [] })
})

app.post('/api/payroll/rosters', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const userId = sanitizeAlphanumeric(body.userId, 50)
  const date = sanitizeDateString(body.date)
  const shift = sanitizeString(body.shift, 80)

  if (!userId || !date || !shift) {
    return c.json({ success: false, message: 'userId, date, and shift are required' }, 400)
  }

  const db = await getDb(c.env)
  const user = (db.users || []).find((u) => u.id === userId || u.empId === userId)

  const newRoster = {
    id: `rst-${Date.now()}`,
    userId,
    empId: user ? user.empId : '',
    userName: user ? user.name : 'Employee',
    designation: user ? user.designation : 'Staff',
    date,
    shift,
    shiftCode: sanitizeAlphanumeric(body.shiftCode, 10) || (shift.includes('G Shift') ? 'G' : (shift.includes('A Shift') ? 'A' : (shift.includes('B Shift') ? 'B' : 'C'))),
    site: sanitizeString(body.site || (user ? user.site : 'ACC Chanda'), 80),
    equipment: sanitizeString(body.equipment, 100) || 'General Plant Duty',
    vehicleId: sanitizeAlphanumeric(body.vehicleId, 50),
    supervisor: sanitizeString(body.supervisor, 100) || 'Shift Supervisor'
  }

  if (!db.rosters) db.rosters = []
  db.rosters.unshift(newRoster)
  await setDb(c.env, db)

  return c.json({ success: true, message: 'Duty Roster assigned', roster: newRoster })
})

app.post('/api/payroll/rosters/tomorrow-bulk', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const date = sanitizeDateString(body.date)
  const { scheduleRecords } = body

  if (!date || !Array.isArray(scheduleRecords) || scheduleRecords.length === 0) {
    return c.json({ success: false, message: 'Date and scheduleRecords array required' }, 400)
  }

  const db = await getDb(c.env)
  if (!db.rosters) db.rosters = []

  db.rosters = db.rosters.filter((r) => r.date !== date)

  for (const s of scheduleRecords) {
    const user = (db.users || []).find((u) => u.id === s.userId || u.empId === s.empId)
    db.rosters.push({
      id: `rst-${Date.now()}-${sanitizeAlphanumeric(s.empId, 30)}`,
      userId: sanitizeAlphanumeric(s.userId, 50) || (user ? user.id : ''),
      empId: sanitizeAlphanumeric(s.empId, 30),
      userName: sanitizeString(s.userName, 100) || (user ? user.name : 'Employee'),
      designation: user ? user.designation : (sanitizeString(s.designation, 100) || 'Operator'),
      date,
      shift: sanitizeString(s.shift, 80) || 'G Shift (08:30 AM - 05:30 PM)',
      shiftCode: sanitizeAlphanumeric(s.shiftCode, 10) || 'G',
      site: sanitizeString(s.site, 80) || 'ACC Chanda Mine Pit',
      equipment: sanitizeString(s.equipment, 100) || 'General Plant Duty',
      vehicleId: sanitizeAlphanumeric(s.vehicleId, 50),
      supervisor: sanitizeString(s.supervisor, 100) || 'Shift In-charge'
    })
  }

  await setDb(c.env, db)
  return c.json({ 
    success: true, 
    message: `Tomorrow's shift & machine schedule for ${date} saved successfully (${scheduleRecords.length} operators assigned).`,
    rosters: db.rosters 
  })
})

app.delete('/api/payroll/rosters/:id', async (c) => {
  const id = sanitizeAlphanumeric(c.req.param('id'), 100)
  const db = await getDb(c.env)
  db.rosters = (db.rosters || []).filter((r) => r.id !== id)
  await setDb(c.env, db)
  return c.json({ success: true, message: 'Duty Roster deleted' })
})

// 7. Leave Management
app.get('/api/payroll/leaves', async (c) => {
  const db = await getDb(c.env)
  return c.json({ success: true, leaves: db.leaves || [] })
})

app.post('/api/payroll/leaves', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const userId = sanitizeAlphanumeric(body.userId, 50)
  const empId = sanitizeAlphanumeric(body.empId, 30)
  const startDate = sanitizeDateString(body.startDate)

  if (!userId || !startDate) {
    return c.json({ success: false, message: 'User and start date are required' }, 400)
  }

  const db = await getDb(c.env)
  const user = (db.users || []).find((u) => u.id === userId || u.empId === userId || u.empId === empId)

  const numDays = sanitizeNumber(body.days, 1, 0.5, 365)
  const newLeave = {
    id: `lev-${Date.now()}`,
    userId: user ? user.id : userId,
    empId: user ? user.empId : empId,
    userName: user ? user.name : 'Employee',
    leaveType: sanitizeString(body.leaveType, 50) || 'Casual Leave',
    startDate,
    endDate: sanitizeDateString(body.endDate) || startDate,
    days: numDays,
    reason: sanitizeString(body.reason, 200) || 'Personal Leave',
    status: 'Approved',
    appliedDate: new Date().toISOString().split('T')[0]
  }

  if (!db.leaves) db.leaves = []
  db.leaves.unshift(newLeave)

  if (user) {
    user.leavesTaken = (Number(user.leavesTaken) || 0) + numDays
    user.leaveBalance = Math.max(0, (Number(user.totalLeaves) || 10) - user.leavesTaken)
  }

  await setDb(c.env, db)
  return c.json({ success: true, message: 'Leave recorded & balance updated', leave: newLeave })
})

app.post('/api/payroll/leaves/credit', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const userId = sanitizeAlphanumeric(body.userId, 50)
  const empId = sanitizeAlphanumeric(body.empId, 30)

  const numCredit = sanitizeNumber(body.creditDays, 1, 1, 100)
  const db = await getDb(c.env)
  const user = (db.users || []).find((u) => u.id === userId || u.empId === userId || u.empId === empId)

  if (!user) {
    return c.json({ success: false, message: 'Employee not found.' }, 404)
  }

  user.totalLeaves = (Number(user.totalLeaves) || 10) + numCredit
  user.leaveBalance = Math.max(0, user.totalLeaves - (Number(user.leavesTaken) || 0))

  if (!db.leaveCredits) db.leaveCredits = []
  const creditRecord = {
    id: `crd-${Date.now()}`,
    userId: user.id,
    empId: user.empId,
    userName: user.name,
    creditDays: numCredit,
    reason: sanitizeString(body.reason, 150) || 'Manual Leave Credit Adjustment',
    notes: sanitizeString(body.notes, 200),
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  }
  db.leaveCredits.unshift(creditRecord)

  await setDb(c.env, db)
  return c.json({
    success: true,
    message: `⚡ Successfully credited ${numCredit} leave day(s) to ${user.name}. New Balance: ${user.leaveBalance} / ${user.totalLeaves} Days`,
    user,
    creditRecord
  })
})

app.post('/api/payroll/leaves/deduct', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const userId = sanitizeAlphanumeric(body.userId, 50)
  const empId = sanitizeAlphanumeric(body.empId, 30)

  const numDeduct = sanitizeNumber(body.deductDays, 1, 1, 100)
  const db = await getDb(c.env)
  const user = (db.users || []).find((u) => u.id === userId || u.empId === userId || u.empId === empId)

  if (!user) {
    return c.json({ success: false, message: 'Employee not found.' }, 404)
  }

  user.totalLeaves = Math.max(0, (Number(user.totalLeaves) || 10) - numDeduct)
  user.leaveBalance = Math.max(0, user.totalLeaves - (Number(user.leavesTaken) || 0))

  if (!db.leaveDeductions) db.leaveDeductions = []
  const deductRecord = {
    id: `ded-${Date.now()}`,
    userId: user.id,
    empId: user.empId,
    userName: user.name,
    deductDays: numDeduct,
    reason: sanitizeString(body.reason, 150) || 'Manual Leave Quota Deduction',
    notes: sanitizeString(body.notes, 200),
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  }
  db.leaveDeductions.unshift(deductRecord)

  await setDb(c.env, db)
  return c.json({
    success: true,
    message: `⚡ Successfully deducted ${numDeduct} leave day(s) from ${user.name}. New Balance: ${user.leaveBalance} / ${user.totalLeaves} Days`,
    user,
    deductRecord
  })
})

app.delete('/api/payroll/leaves/:id', async (c) => {
  const id = sanitizeAlphanumeric(c.req.param('id'), 100)
  const db = await getDb(c.env)
  if (!db.leaves) db.leaves = []

  const leave = db.leaves.find((l) => l.id === id)
  if (!leave) {
    return c.json({ success: false, message: 'Leave record not found.' }, 404)
  }

  const user = (db.users || []).find((u) => u.id === leave.userId || u.empId === leave.empId)
  if (user) {
    user.leavesTaken = Math.max(0, (Number(user.leavesTaken) || 0) - (Number(leave.days) || 1))
    user.leaveBalance = Math.max(0, (Number(user.totalLeaves) || 10) - user.leavesTaken)
  }

  if (Array.isArray(db.attendance)) {
    db.attendance = db.attendance.filter(
      (a) => !((a.userId === leave.userId || a.empId === leave.empId) && a.date >= leave.startDate && a.date <= leave.endDate && a.status === 'Leave')
    )
  }

  db.leaves = db.leaves.filter((l) => l.id !== id)
  await setDb(c.env, db)
  return c.json({
    success: true,
    message: `Leave record deleted successfully. ${user ? user.name + '\'s' : 'Employee'} balance restored to ${user ? user.leaveBalance : 'updated'}.`,
    user
  })
})

// 8. Salary Slip APIs
app.get('/api/payroll/salary-slips', async (c) => {
  const db = await getDb(c.env)
  return c.json({ success: true, salarySlips: db.salarySlips || [] })
})

app.get('/api/payroll/salary-slips/:id', async (c) => {
  const rawId = c.req.param('id')
  const id = sanitizeAlphanumeric(rawId, 100)
  const db = await getDb(c.env)
  const slips = db.salarySlips || []
  const slip = slips.find(
    (s) =>
      String(s.id || '').trim().toLowerCase() === String(id).trim().toLowerCase() ||
      String(s.id || '').trim().toLowerCase() === String(rawId).trim().toLowerCase() ||
      String(s.empId || '').trim().toLowerCase() === String(id).trim().toLowerCase()
  )
  if (!slip) {
    return c.json({ success: false, message: 'Salary slip not found' }, 404)
  }
  return c.json({ success: true, slip })
})

app.post('/api/payroll/salary-slips/bulk-generate', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const monthYear = sanitizeString(body.monthYear, 50)
  const month = sanitizeString(body.month, 30)
  const year = sanitizeString(body.year, 10)

  const mYear = monthYear || 'September 2026'
  const db = await getDb(c.env)

  const activeEmployees = (db.users || []).filter((u) => u.role !== 'Super Admin' && u.status === 'Active')
  if (activeEmployees.length === 0) {
    return c.json({ success: false, message: 'No active employees found to generate salary slips' }, 400)
  }

  const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
  let defaultDim = 30
  if (mYear) {
    const parts = mYear.split(' ')
    const mIdx = monthNames.indexOf(parts[0].toLowerCase())
    const yr = parseInt(parts[1]) || 2026
    if (mIdx !== -1) {
      defaultDim = new Date(yr, mIdx + 1, 0).getDate()
    }
  }

  if (!db.salarySlips) db.salarySlips = []

  // STRICT RULE: Identify and preserve any slips that have been manually corrected / locked by user
  const existingLockedSlips = db.salarySlips.filter(
    (s) => s.monthYear === mYear && (s.isManuallyCorrected === true || s.manualLocked === true)
  )
  const lockedEmpKeys = new Set(existingLockedSlips.map((s) => `${s.empId || s.userId}_${s.monthYear}`))

  const newSlips = []

  for (const u of activeEmployees) {
    const empKey = `${u.empId || u.id}_${mYear}`
    if (lockedEmpKeys.has(empKey)) {
      continue
    }

    const dim = defaultDim
    const pdays = Math.min(dim, Number(u.payableDays) || (Number(u.presentDays || 26) + Number(u.weakOff || 4) + Number(u.leave || 0)))
    const ctc = Number(u.ctc)
    const bpd = Number(u.basicPerDay)

    let basic = 0, da = 0, hra = 0, specialAllowance = 0, grossPay = 0
    let pf = 0, esic = 0, pt = 0, totalDeductions = 0, netPay = 0

    if (ctc && ctc > 0) {
      const basicPerDay = (ctc / 2) / dim
      basic = Math.round(basicPerDay * pdays * 100) / 100
      da = 0
      hra = Math.round(0.40 * basic * 100) / 100
      const pfEmployer = Math.round((basic + da) * 0.12 * 100) / 100
      const ctcWorking = Math.round((ctc / dim) * pdays * 100) / 100
      grossPay = Math.round((ctcWorking - pfEmployer) * 100) / 100
      specialAllowance = Math.round(Math.max(0, grossPay - (basic + da + hra)) * 100) / 100
      pf = Math.round((basic + da) * 0.12 * 100) / 100
      pt = grossPay > 0 ? 200 : 0
      esic = 0
      totalDeductions = Math.round((pf + pt + esic) * 100) / 100
      netPay = Math.round((grossPay - totalDeductions) * 100) / 100
    } else {
      const bpdVal = bpd || 444.62
      basic = Math.round(bpdVal * pdays * 100) / 100
      da = Math.round(289.38 * pdays * 100) / 100
      hra = Math.round(62.70 * pdays * 100) / 100
      specialAllowance = 0
      grossPay = Math.round((basic + da + hra) * 100) / 100
      pf = Math.round((basic + da) * 0.12 * 100) / 100
      esic = Math.round(grossPay * 0.0075 * 100) / 100
      pt = grossPay > 0 ? 200 : 0
      totalDeductions = Math.round((pf + esic + pt) * 100) / 100
      netPay = Math.round((grossPay - totalDeductions) * 100) / 100
    }

    const slip = {
      id: `slp-${(u.empId || 'srr').toLowerCase()}-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      userId: u.id,
      empId: u.empId,
      userName: u.name,
      monthYear: mYear,
      month: month || mYear.split(' ')[0],
      year: year || mYear.split(' ')[1] || '2026',
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
      otHours: 0,
      otWage: 0,
      earnings: { basic, da, hra, specialAllowance, bonus: 0, otWage: 0 },
      deductions: { pf, esic, pt, lic: 0, advance: 0 },
      grossPay,
      totalDeductions,
      netPay,
      status: 'Paid',
      paymentDate: new Date().toISOString().split('T')[0],
      isManuallyCorrected: false,
      manualLocked: false
    }

    newSlips.push(slip)
  }

  const otherMonthSlips = db.salarySlips.filter((s) => s.monthYear !== mYear)
  db.salarySlips = [...existingLockedSlips, ...newSlips, ...otherMonthSlips]
  await setDb(c.env, db)

  return c.json({ 
    success: true, 
    message: `Generated ${newSlips.length} salary slips for ${mYear} successfully! (${existingLockedSlips.length} manual slips protected).`, 
    generatedCount: newSlips.length,
    salarySlips: db.salarySlips 
  })
})

app.post('/api/payroll/salary-slips/update', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const {
    id,
    userId,
    empId,
    monthYear,
    month,
    year,
    workedDays,
    totalDays,
    otHours,
    otWage,
    earnings,
    deductions,
    grossPay,
    totalDeductions,
    netPay,
    status,
    paymentDate,
    remarks,
    bankAccount,
    ifsc,
    updateUserBaseSalary,
    newCtc,
    newBasicPerDay
  } = body

  const sUserId = sanitizeAlphanumeric(userId, 50)
  const sEmpId = sanitizeAlphanumeric(empId, 30)
  const sMonthYear = sanitizeString(monthYear, 50)

  if ((!sUserId && !sEmpId) || !sMonthYear) {
    return c.json({ success: false, message: 'Employee ID and Month/Year are required' }, 400)
  }

  const db = await getDb(c.env)
  if (!db.salarySlips) db.salarySlips = []

  const user = (db.users || []).find((u) => u.id === sUserId || u.empId === sEmpId || u.empId === sUserId)
  const finalUserId = user ? user.id : (sUserId || `usr-${(sEmpId || 'srr').toLowerCase()}`)
  const finalEmpId = user ? user.empId : (sEmpId || 'SRR')
  const finalUserName = user ? user.name : sanitizeString(body.userName, 100) || 'Employee'

  const cleanNum = (val) => Math.round(sanitizeNumber(val, 0, 0, 100000000) * 100) / 100

  // STRICT COMPONENT ISOLATION: Keep every earning and deduction in its own clean bucket
  const safeBasic = cleanNum(earnings?.basic)
  const safeDa = cleanNum(earnings?.da)
  const safeHra = cleanNum(earnings?.hra)
  const safeSpecial = cleanNum(earnings?.specialAllowance)
  const safeBonus = cleanNum(earnings?.bonus)
  const safeOtWage = cleanNum(otWage !== undefined ? otWage : earnings?.otWage)

  const safeGross = cleanNum(grossPay !== undefined ? grossPay : (safeBasic + safeDa + safeHra + safeSpecial + safeBonus + safeOtWage))

  const safePf = cleanNum(deductions?.pf)
  const safeEsic = cleanNum(deductions?.esic)
  const safePt = cleanNum(deductions?.pt)
  const safeLic = cleanNum(deductions?.lic)
  const safeAdvance = cleanNum(deductions?.advance)
  const safeTds = cleanNum(deductions?.tds)

  const safeDeductions = cleanNum(totalDeductions !== undefined ? totalDeductions : (safePf + safeEsic + safePt + safeLic + safeAdvance + safeTds))
  const safeNet = cleanNum(netPay !== undefined ? netPay : (safeGross - safeDeductions))

  const safeSlipId = sanitizeAlphanumeric(id, 80)
  let existingIndex = db.salarySlips.findIndex((s) => (safeSlipId && s.id === safeSlipId) || ((s.userId === finalUserId || s.empId === finalEmpId) && s.monthYear === sMonthYear))

  const updatedSlip = {
    id: safeSlipId || (existingIndex >= 0 ? db.salarySlips[existingIndex].id : `slp-${finalEmpId.toLowerCase()}-${Date.now()}`),
    userId: finalUserId,
    empId: finalEmpId,
    userName: finalUserName,
    monthYear: sMonthYear,
    month: sanitizeString(month, 30) || sMonthYear.split(' ')[0],
    year: sanitizeString(year, 10) || sMonthYear.split(' ')[1] || '2026',
    designation: user ? (user.designation || user.rank) : sanitizeString(body.designation, 100) || 'Staff',
    department: user ? user.department : sanitizeString(body.department, 100) || 'Plant Fleet & Garage O&M',
    fatherName: user ? user.fatherName : sanitizeString(body.fatherName, 120),
    dob: user ? user.dob : sanitizeDateString(body.dob),
    doj: user ? user.doj : sanitizeDateString(body.doj),
    uan: user ? user.uan : sanitizeAlphanumeric(body.uan, 30),
    esicNo: user ? user.esicNo : sanitizeAlphanumeric(body.esicNo, 30),
    pfNo: user ? user.pfNo : sanitizeAlphanumeric(body.pfNo, 40),
    bankAccount: sanitizeAlphanumeric(bankAccount, 50) || (user ? user.bankAccount : ''),
    ifsc: sanitizeAlphanumeric(ifsc, 30) || (user ? user.ifsc : ''),
    location: user ? (user.location || user.site) : sanitizeString(body.location, 80) || 'ACC Chanda',
    category: user ? user.category : sanitizeString(body.category, 50) || 'Skilled',
    mobile: user ? (user.mobile || user.phone) : sanitizeString(body.mobile, 15),
    phone: user ? (user.phone || user.mobile) : sanitizeString(body.phone, 30),
    workedDays: sanitizeNumber(workedDays, 31, 0, 31),
    totalDays: sanitizeNumber(totalDays, 31, 28, 31),
    otHours: sanitizeNumber(otHours, 0, 0, 300),
    otWage: safeOtWage,
    earnings: {
      basic: safeBasic,
      da: safeDa,
      hra: safeHra,
      specialAllowance: safeSpecial,
      bonus: safeBonus,
      otWage: safeOtWage
    },
    deductions: {
      pf: safePf,
      esic: safeEsic,
      pt: safePt,
      lic: safeLic,
      advance: safeAdvance,
      tds: safeTds
    },
    grossPay: safeGross,
    totalDeductions: safeDeductions,
    netPay: safeNet,
    status: sanitizeString(status, 30) || 'Paid',
    paymentDate: sanitizeDateString(paymentDate) || new Date().toISOString().split('T')[0],
    remarks: sanitizeString(remarks, 250) || 'Salary structure adjusted/corrected by user',
    isManuallyCorrected: true,
    manualLocked: true,
    updatedAt: new Date().toISOString()
  }

  if (existingIndex >= 0) {
    db.salarySlips[existingIndex] = updatedSlip
  } else {
    db.salarySlips.unshift(updatedSlip)
  }

  if (user) {
    if (bankAccount) user.bankAccount = sanitizeAlphanumeric(bankAccount, 50)
    if (ifsc) user.ifsc = sanitizeAlphanumeric(ifsc, 30)
    if (updateUserBaseSalary) {
      const fixedMonthlyCtc = cleanNum(safeBasic + safeDa + safeHra + safeSpecial)
      if (fixedMonthlyCtc > 0) {
        user.ctc = fixedMonthlyCtc
        user.baseSalary = fixedMonthlyCtc
      } else if (newCtc) {
        user.ctc = sanitizeNumber(newCtc)
        user.baseSalary = sanitizeNumber(newCtc)
      }
    }
    if (updateUserBaseSalary && newBasicPerDay) {
      user.basicPerDay = sanitizeNumber(newBasicPerDay)
    }
  }

  await setDb(c.env, db)

  return c.json({
    success: true,
    message: `⚡ Salary structure & monthly slip for ${finalUserName} (${sMonthYear}) updated successfully! (OT & Components Locked)`,
    slip: updatedSlip,
    salarySlips: db.salarySlips
  })
})

app.delete('/api/payroll/salary-slips/:id', async (c) => {
  const id = sanitizeAlphanumeric(c.req.param('id'), 100)
  const db = await getDb(c.env)
  db.salarySlips = (db.salarySlips || []).filter((s) => s.id !== id)
  await setDb(c.env, db)
  return c.json({ success: true, message: 'Salary slip deleted' })
})

export default app

