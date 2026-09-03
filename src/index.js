import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('*', cors())

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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "department": "Mining Fleet & Garage O&M",
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
      "site": "ACC Chanda Pit A",
      "equipment": "HP-12-EX-3491 - CAT 349D Heavy Mining Excavator",
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
      "site": "ACC Chanda Pit B",
      "equipment": "HP-12-EX-3492 - CAT 349D Heavy Mining Excavator #2",
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

  // Ensure all employees have 10 allocated leaves and accurate leave balance without affecting any other data
  if (dbData && Array.isArray(dbData.users)) {
    let changed = false
    dbData.users.forEach((u) => {
      if (u.totalLeaves !== 10) {
        u.totalLeaves = 10
        const taken = Number(u.leavesTaken) || 0
        u.leaveBalance = Math.max(0, 10 - taken)
        changed = true
      }
    })
    if (changed && env && env.PAYROLL_DB) {
      await env.PAYROLL_DB.put('db_v8', JSON.stringify(dbData))
    }
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

// 1. Auth Login (Strict Credential Verification)
app.post('/api/payroll/auth/login', async (c) => {
  const body = await c.req.json()
  const { email, password } = body
  if (!email || !password) {
    return c.json({ success: false, message: 'Email / ID and password required' }, 400)
  }

  const cleanEmail = email.trim().toLowerCase()
  const db = await getDb(c.env)

  // Super Admin Check (Exclusive credentials)
  if (cleanEmail === 'admin@srijandev.in' && password === 'Jaishreeram@907') {
    const adminUser = db.users.find((u) => u.email.toLowerCase() === 'admin@srijandev.in') || {
      id: 'usr-admin-srijandev',
      empId: 'SRR-ADMIN',
      name: 'Super Administrator',
      email: 'admin@srijandev.in',
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
    return c.json({ success: true, message: 'Super Admin login successful', user: adminUser })
  }

  const user = db.users.find(
    (u) => (u.email.toLowerCase() === cleanEmail || (u.empId && u.empId.toLowerCase() === cleanEmail)) && u.password === password
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
  const { userId, newPassword } = await c.req.json()
  if (!userId || !newPassword || newPassword.length < 6) {
    return c.json({ success: false, message: 'Valid new password is required (min 6 chars).' }, 400)
  }

  const db = await getDb(c.env)
  const index = db.users.findIndex((u) => u.id === userId || u.empId === userId)
  if (index === -1) return c.json({ success: false, message: 'User not found' }, 404)

  db.users[index].password = newPassword.trim()
  db.users[index].mustChangePassword = false
  await setDb(c.env, db)

  return c.json({ success: true, message: 'Password changed successfully.' })
})

// 2. Users CRUD & Granular Feature Permissions Matrix
app.get('/api/payroll/users', async (c) => {
  const db = await getDb(c.env)
  const usersSafe = db.users.map(({ password, ...u }) => u)
  return c.json({ success: true, users: usersSafe })
})

app.post('/api/payroll/users', async (c) => {
  const body = await c.req.json()
  const { name, email, password, role, designation, rank, department, site, location, phone, mobile, baseSalary, ctc, basicPerDay, uan, esicNo, pfNo, bankAccount, ifsc, fatherName, dob, doj, category, loginAllowed, loginEnabled, mustChangePassword, permissions } = body

  if (!name) {
    return c.json({ success: false, message: 'Employee name is required' }, 400)
  }

  const db = await getDb(c.env)
  const empCount = db.users.length
  const empId = body.empId || `SRR${String(empCount + 1).padStart(3, '0')}`

  const existing = db.users.find((u) => u.empId && u.empId.toLowerCase() === empId.toLowerCase())
  if (existing) {
    return c.json({ success: false, message: `Employee with ID ${empId} already exists` }, 400)
  }

  const assignedRole = role || 'Worker'
  const isSuper = assignedRole === 'Super Admin'

  const defaultPermissions = permissions || {
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

  const newUser = {
    id: `usr-${empId.toLowerCase()}`,
    empId,
    name: name.trim(),
    email: (email || `${empId.toLowerCase()}@shreerrtradingcompany.com`).trim().toLowerCase(),
    password: password || `${empId}@123`,
    role: assignedRole,
    loginAllowed: loginAllowed !== undefined ? loginAllowed : (loginEnabled !== undefined ? loginEnabled : false),
    loginEnabled: loginAllowed !== undefined ? loginAllowed : (loginEnabled !== undefined ? loginEnabled : false),
    mustChangePassword: mustChangePassword !== undefined ? mustChangePassword : (!isSuper),
    permissions: defaultPermissions,
    designation: designation || rank || 'Staff Member',
    rank: rank || designation || 'Staff',
    department: department || 'Mining Fleet & Garage O&M',
    site: site || location || 'ACC Chanda',
    location: location || site || 'ACC Chanda',
    phone: phone || (mobile ? `+91 ${mobile}` : ''),
    mobile: mobile || (phone ? phone.replace(/[^0-9]/g, '').slice(-10) : ''),
    baseSalary: Number(baseSalary) || Number(ctc) || (Number(basicPerDay) ? Number(basicPerDay) * 30 : 25000),
    ctc: Number(ctc) || null,
    basicPerDay: Number(basicPerDay) || null,
    bankAccount: bankAccount || '',
    ifsc: ifsc || '',
    uan: uan || '',
    esicNo: esicNo || '',
    pfNo: pfNo || '',
    fatherName: fatherName || '',
    dob: dob || '',
    doj: doj || new Date().toLocaleDateString('en-GB'),
    category: category || 'Skilled',
    presentDays: Number(body.presentDays) || 26,
    weakOff: Number(body.weakOff) || 4,
    leave: Number(body.leave) || 0,
    totalLeaves: 10,
    leavesTaken: Number(body.leave) || 0,
    leaveBalance: Math.max(0, 10 - (Number(body.leave) || 0)),
    payableDays: (Number(body.presentDays) || 26) + (Number(body.weakOff) || 4) + (Number(body.leave) || 0),
    daysInMonth: Number(body.daysInMonth) || 30,
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
  const id = c.req.param('id')
  const { loginAllowed, loginEnabled, password, permissions, role, mustChangePassword } = await c.req.json()
  const db = await getDb(c.env)

  const index = db.users.findIndex((u) => u.id === id || u.empId === id)
  if (index === -1) {
    return c.json({ success: false, message: 'User not found' }, 404)
  }

  const target = db.users[index]
  if (loginAllowed !== undefined) target.loginAllowed = loginAllowed
  if (loginEnabled !== undefined) target.loginEnabled = loginEnabled
  if (mustChangePassword !== undefined) target.mustChangePassword = mustChangePassword
  if (role) target.role = role
  if (password && password.trim()) target.password = password.trim()
  if (permissions) target.permissions = { ...(target.permissions || {}), ...permissions }

  await setDb(c.env, db)
  const { password: _, ...userSafe } = target
  return c.json({ success: true, message: 'Feature permissions matrix updated successfully', user: userSafe })
})

app.put('/api/payroll/users/:id', async (c) => {
  const id = c.req.param('id')
  const updates = await c.req.json()
  const db = await getDb(c.env)

  const index = db.users.findIndex((u) => u.id === id || u.empId === id)
  if (index === -1) {
    return c.json({ success: false, message: 'Employee not found' }, 404)
  }

  if (!updates.password) {
    delete updates.password
  }

  db.users[index] = { ...db.users[index], ...updates }
  await setDb(c.env, db)

  const { password: _, ...userSafe } = db.users[index]
  return c.json({ success: true, message: 'Employee updated successfully', user: userSafe })
})

app.delete('/api/payroll/users/:id', async (c) => {
  const id = c.req.param('id')
  const db = await getDb(c.env)

  const initialLength = db.users.length
  db.users = db.users.filter((u) => u.id !== id && u.empId !== id)

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
  const body = await c.req.json()
  const { vehicleNo, name, type, model, site, operatorId, operatorName, status, fuelType, hourlyRate, notes } = body

  if (!vehicleNo || !name) {
    return c.json({ success: false, message: 'Vehicle number and name are required' }, 400)
  }

  const db = await getDb(c.env)
  if (!db.vehicles) db.vehicles = []

  const existing = db.vehicles.find((v) => v.vehicleNo.toLowerCase() === vehicleNo.trim().toLowerCase())
  if (existing) {
    return c.json({ success: false, message: `Vehicle with number ${vehicleNo} already exists` }, 400)
  }

  const newVehicle = {
    id: `veh-${Date.now()}`,
    vehicleNo: vehicleNo.trim().toUpperCase(),
    name: name.trim(),
    type: type || 'Excavator',
    model: model || 'Heavy Mining Machinery',
    site: site || 'ACC Chanda Mine Pit',
    operatorId: operatorId || '',
    operatorName: operatorName || 'Unassigned',
    status: status || 'Active (In Pit)',
    fuelType: fuelType || 'Diesel',
    hourlyRate: Number(hourlyRate) || 0,
    notes: notes || '',
    createdAt: new Date().toISOString()
  }

  db.vehicles.push(newVehicle)
  await setDb(c.env, db)

  return c.json({ success: true, message: 'Vehicle added successfully', vehicle: newVehicle })
})

// Bulk Import Vehicles Endpoint
app.post('/api/payroll/vehicles/bulk', async (c) => {
  const body = await c.req.json()
  const { vehicles } = body

  if (!Array.isArray(vehicles) || vehicles.length === 0) {
    return c.json({ success: false, message: 'Valid vehicles array is required' }, 400)
  }

  const db = await getDb(c.env)
  if (!db.vehicles) db.vehicles = []

  let importedCount = 0
  for (const v of vehicles) {
    if (!v.vehicleNo || !v.name) continue
    const vNo = v.vehicleNo.trim().toUpperCase()
    const existingIndex = db.vehicles.findIndex((x) => x.vehicleNo.toUpperCase() === vNo)

    const vehicleObj = {
      id: existingIndex !== -1 ? db.vehicles[existingIndex].id : `veh-${Date.now()}-${importedCount}`,
      vehicleNo: vNo,
      name: v.name.trim(),
      type: v.type || 'Excavator',
      model: v.model || 'Heavy Machinery',
      site: v.site || 'ACC Chanda Mine Pit',
      operatorId: v.operatorId || '',
      operatorName: v.operatorName || 'Unassigned',
      status: v.status || 'Active (In Pit)',
      fuelType: v.fuelType || 'Diesel',
      hourlyRate: Number(v.hourlyRate) || 0,
      notes: v.notes || 'Bulk Imported Fleet',
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
  return c.json({ success: true, message: `Successfully imported ${importedCount} mining vehicles!`, vehicles: db.vehicles })
})

// Delete All Vehicles Endpoint
app.delete('/api/payroll/vehicles/all', async (c) => {
  const db = await getDb(c.env)
  db.vehicles = []
  await setDb(c.env, db)
  return c.json({ success: true, message: 'All vehicles have been deleted from the system.' })
})

app.put('/api/payroll/vehicles/:id', async (c) => {
  const id = c.req.param('id')
  const updates = await c.req.json()
  const db = await getDb(c.env)

  if (!db.vehicles) db.vehicles = []
  const index = db.vehicles.findIndex((v) => v.id === id || v.vehicleNo === id)
  if (index === -1) {
    return c.json({ success: false, message: 'Vehicle not found' }, 404)
  }

  db.vehicles[index] = { ...db.vehicles[index], ...updates }
  await setDb(c.env, db)

  return c.json({ success: true, message: 'Vehicle updated successfully', vehicle: db.vehicles[index] })
})

app.delete('/api/payroll/vehicles/:id', async (c) => {
  const id = c.req.param('id')
  const db = await getDb(c.env)

  if (!db.vehicles) db.vehicles = []
  const initialLength = db.vehicles.length
  db.vehicles = db.vehicles.filter((v) => v.id !== id && v.vehicleNo !== id)

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
  const body = await c.req.json()
  const { date, vehicleNo, totalHours, operatingHours, breakdownHours, idleHours, failureType, reason, actionTaken, status } = body

  if (!vehicleNo) {
    return c.json({ success: false, message: 'Vehicle number is required' }, 400)
  }

  const db = await getDb(c.env)
  if (!db.vehicleLogs) db.vehicleLogs = []

  const veh = (db.vehicles || []).find((v) => v.vehicleNo.toUpperCase() === vehicleNo.toUpperCase())

  const scheduledHrs = Number(totalHours) || 24
  const bdHrs = Number(breakdownHours) || 0
  const opHrs = operatingHours !== undefined ? Number(operatingHours) : Math.max(0, scheduledHrs - bdHrs)
  const idlHrs = idleHours !== undefined ? Number(idleHours) : 0

  const newLog = {
    id: `vlog-${Date.now()}`,
    date: date || new Date().toISOString().split('T')[0],
    vehicleNo: vehicleNo.toUpperCase(),
    vehicleName: veh ? veh.name : 'Heavy Machinery',
    model: veh ? veh.model : '',
    totalHours: scheduledHrs,
    operatingHours: opHrs,
    breakdownHours: bdHrs,
    idleHours: idlHrs,
    failureType: failureType || 'Mechanical Fault',
    reason: reason || 'Scheduled Wear / Component Replacement',
    actionTaken: actionTaken || 'Repaired & Inspected by Garage Engineer',
    status: status || (bdHrs > 0 ? 'Resolved' : 'Operating Normal'),
    createdAt: new Date().toISOString()
  }

  db.vehicleLogs.unshift(newLog)
  await setDb(c.env, db)

  return c.json({ success: true, message: 'Vehicle breakdown / availability record logged!', log: newLog })
})

app.delete('/api/payroll/vehicle-logs/:id', async (c) => {
  const id = c.req.param('id')
  const db = await getDb(c.env)
  if (!db.vehicleLogs) db.vehicleLogs = []
  db.vehicleLogs = db.vehicleLogs.filter((l) => l.id !== id)
  await setDb(c.env, db)
  return c.json({ success: true, message: 'Vehicle log entry deleted.' })
})

// 5. Attendance & Daily Muster Roll
app.get('/api/payroll/attendance', async (c) => {
  const db = await getDb(c.env)
  return c.json({ success: true, attendance: db.attendance || [] })
})

app.post('/api/payroll/attendance', async (c) => {
  const body = await c.req.json()
  const { userId, date, shift, shiftCode, clockIn, clockOut, status, site, notes } = body
  if (!userId || !date) {
    return c.json({ success: false, message: 'userId and date are required' }, 400)
  }

  const db = await getDb(c.env)
  const user = db.users.find((u) => u.id === userId || u.empId === userId)

  const isAbsentOrOff = status === 'Absent' || status === 'Weekly Off' || status === 'Leave'
  const newRecord = {
    id: `att-${Date.now()}`,
    userId,
    empId: user ? user.empId : '',
    userName: user ? user.name : 'Employee',
    date: date || new Date().toISOString().split('T')[0],
    shift: shift || 'G Shift (08:30 AM - 05:30 PM)',
    shiftCode: shiftCode || 'G',
    clockIn: clockIn || (isAbsentOrOff ? '-' : '08:30 AM'),
    clockOut: clockOut || (isAbsentOrOff ? '-' : '05:30 PM'),
    status: status || 'Present',
    site: site || (user ? user.site : 'ACC Chanda'),
    notes: notes || (status === 'Absent' ? 'Muster Roll: Absent' : 'Muster Roll Entry')
  }

  if (!db.attendance) db.attendance = []
  db.attendance.unshift(newRecord)
  await setDb(c.env, db)

  return c.json({ success: true, message: 'Attendance recorded', attendance: newRecord })
})

app.post('/api/payroll/attendance/muster-roll-bulk', async (c) => {
  const body = await c.req.json()
  const { date, musterRecords } = body

  if (!date || !Array.isArray(musterRecords) || musterRecords.length === 0) {
    return c.json({ success: false, message: 'Date and musterRecords array required' }, 400)
  }

  const db = await getDb(c.env)
  if (!db.attendance) db.attendance = []

  db.attendance = db.attendance.filter((a) => a.date !== date)

  for (const r of musterRecords) {
    const user = db.users.find((u) => u.id === r.userId || u.empId === r.empId)
    const isAbOrOff = r.status === 'Absent' || r.status === 'Weekly Off' || r.status === 'Leave'
    db.attendance.push({
      id: `att-${Date.now()}-${r.empId}`,
      userId: r.userId || (user ? user.id : ''),
      empId: r.empId,
      userName: r.userName || (user ? user.name : 'Employee'),
      date,
      shift: r.shift || 'G Shift (08:30 AM - 05:30 PM)',
      shiftCode: r.shiftCode || 'G',
      clockIn: r.clockIn || (isAbOrOff ? '-' : (r.shiftCode === 'A' ? '06:00 AM' : (r.shiftCode === 'B' ? '02:00 PM' : (r.shiftCode === 'C' ? '10:00 PM' : '08:30 AM')))),
      clockOut: r.clockOut || (isAbOrOff ? '-' : (r.shiftCode === 'A' ? '02:00 PM' : (r.shiftCode === 'B' ? '10:00 PM' : (r.shiftCode === 'C' ? '06:00 AM' : '05:30 PM')))),
      status: r.status || 'Present',
      site: r.site || (user ? user.site : 'ACC Chanda'),
      notes: r.notes || (r.status === 'Absent' ? 'Daily Muster Roll: Absent' : `Daily Muster Roll: Shift ${r.shiftCode || 'G'} Marked`)
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
  const body = await c.req.json()
  const { userId, date, shift, shiftCode, site, equipment, vehicleId, supervisor } = body
  if (!userId || !date || !shift) {
    return c.json({ success: false, message: 'userId, date, and shift are required' }, 400)
  }

  const db = await getDb(c.env)
  const user = db.users.find((u) => u.id === userId || u.empId === userId)

  const newRoster = {
    id: `rst-${Date.now()}`,
    userId,
    empId: user ? user.empId : '',
    userName: user ? user.name : 'Employee',
    designation: user ? user.designation : 'Staff',
    date,
    shift,
    shiftCode: shiftCode || (shift.includes('G Shift') ? 'G' : (shift.includes('A Shift') ? 'A' : (shift.includes('B Shift') ? 'B' : 'C'))),
    site: site || (user ? user.site : 'ACC Chanda'),
    equipment: equipment || 'General Plant Duty',
    vehicleId: vehicleId || '',
    supervisor: supervisor || 'Shift Supervisor'
  }

  if (!db.rosters) db.rosters = []
  db.rosters.unshift(newRoster)
  await setDb(c.env, db)

  return c.json({ success: true, message: 'Duty Roster assigned', roster: newRoster })
})

app.post('/api/payroll/rosters/tomorrow-bulk', async (c) => {
  const body = await c.req.json()
  const { date, scheduleRecords } = body

  if (!date || !Array.isArray(scheduleRecords) || scheduleRecords.length === 0) {
    return c.json({ success: false, message: 'Date and scheduleRecords array required' }, 400)
  }

  const db = await getDb(c.env)
  if (!db.rosters) db.rosters = []

  db.rosters = db.rosters.filter((r) => r.date !== date)

  for (const s of scheduleRecords) {
    const user = db.users.find((u) => u.id === s.userId || u.empId === s.empId)
    db.rosters.push({
      id: `rst-${Date.now()}-${s.empId}`,
      userId: s.userId || (user ? user.id : ''),
      empId: s.empId,
      userName: s.userName || (user ? user.name : 'Employee'),
      designation: user ? user.designation : (s.designation || 'Operator'),
      date,
      shift: s.shift || 'G Shift (08:30 AM - 05:30 PM)',
      shiftCode: s.shiftCode || 'G',
      site: s.site || 'ACC Chanda Mine Pit',
      equipment: s.equipment || 'General Plant Duty',
      vehicleId: s.vehicleId || '',
      supervisor: s.supervisor || 'Shift In-charge'
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
  const id = c.req.param('id')
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
  const body = await c.req.json()
  const { userId, empId, leaveType, startDate, endDate, days, reason } = body

  if (!userId || !startDate) {
    return c.json({ success: false, message: 'User and start date are required' }, 400)
  }

  const db = await getDb(c.env)
  const user = db.users.find((u) => u.id === userId || u.empId === userId || u.empId === empId)

  const numDays = Number(days) || 1
  const newLeave = {
    id: `lev-${Date.now()}`,
    userId: user ? user.id : userId,
    empId: user ? user.empId : empId,
    userName: user ? user.name : 'Employee',
    leaveType: leaveType || 'Casual Leave',
    startDate,
    endDate: endDate || startDate,
    days: numDays,
    reason: reason || 'Personal Leave',
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
  const body = await c.req.json()
  const { userId, empId, creditDays, reason, notes } = body

  const numCredit = Math.max(1, Number(creditDays) || 1)
  const db = await getDb(c.env)
  const user = db.users.find((u) => u.id === userId || u.empId === userId || u.empId === empId)

  if (!user) {
    return c.json({ success: false, message: 'Employee not found.' }, 404)
  }

  // Credit leaves: Increase totalLeaves and leaveBalance
  user.totalLeaves = (Number(user.totalLeaves) || 10) + numCredit
  user.leaveBalance = Math.max(0, user.totalLeaves - (Number(user.leavesTaken) || 0))

  if (!db.leaveCredits) db.leaveCredits = []
  const creditRecord = {
    id: `crd-${Date.now()}`,
    userId: user.id,
    empId: user.empId,
    userName: user.name,
    creditDays: numCredit,
    reason: reason || 'Manual Leave Credit Adjustment',
    notes: notes || '',
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

app.delete('/api/payroll/leaves/:id', async (c) => {
  const id = c.req.param('id')
  const db = await getDb(c.env)
  if (!db.leaves) db.leaves = []

  const leave = db.leaves.find((l) => l.id === id)
  if (!leave) {
    return c.json({ success: false, message: 'Leave record not found.' }, 404)
  }

  const user = db.users.find((u) => u.id === leave.userId || u.empId === leave.empId)
  if (user) {
    user.leavesTaken = Math.max(0, (Number(user.leavesTaken) || 0) - (Number(leave.days) || 1))
    user.leaveBalance = Math.max(0, (Number(user.totalLeaves) || 10) - user.leavesTaken)
  }

  // Remove any automated leave attendance override for this period
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

app.post('/api/payroll/salary-slips/bulk-generate', async (c) => {
  const body = await c.req.json()
  const { monthYear, month, year } = body

  const mYear = monthYear || 'September 2026'
  const db = await getDb(c.env)

  const activeEmployees = db.users.filter((u) => u.role !== 'Super Admin' && u.status === 'Active')
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

  const newSlips = []

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

    const slip = {
      id: `slp-${u.empId.toLowerCase()}-${Date.now()}`,
      userId: u.id,
      empId: u.empId,
      userName: u.name,
      monthYear: mYear,
      month: month || mYear.split(' ')[0],
      year: year || mYear.split(' ')[1] || '2026',
      designation: u.designation || u.rank || 'Staff',
      department: u.department || 'Mining Fleet & Garage O&M',
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
      paymentDate: new Date().toISOString().split('T')[0]
    }

    newSlips.push(slip)
  }

  if (!db.salarySlips) db.salarySlips = []
  db.salarySlips = [...newSlips, ...db.salarySlips.filter((s) => s.monthYear !== mYear)]
  await setDb(c.env, db)

  return c.json({ 
    success: true, 
    message: `Generated ${newSlips.length} salary slips for ${mYear} successfully!`, 
    generatedCount: newSlips.length,
    salarySlips: db.salarySlips 
  })
})

app.delete('/api/payroll/salary-slips/:id', async (c) => {
  const id = c.req.param('id')
  const db = await getDb(c.env)
  db.salarySlips = (db.salarySlips || []).filter((s) => s.id !== id)
  await setDb(c.env, db)
  return c.json({ success: true, message: 'Salary slip deleted' })
})

export default app
