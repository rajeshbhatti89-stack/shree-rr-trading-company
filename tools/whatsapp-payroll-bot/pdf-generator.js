const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

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

const fmt = (v) => `INR ${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

async function generateSalarySlipPdf(slip) {
  const pdfDoc = await PDFDocument.create();
  
  // A4 Page: 595.28 x 841.89 points
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Colors
  const navy = rgb(11 / 255, 25 / 255, 54 / 255);
  const orange = rgb(255 / 255, 107 / 255, 0 / 255);
  const darkGray = rgb(30 / 255, 41 / 255, 59 / 255);
  const lightGray = rgb(100 / 255, 116 / 255, 139 / 255);
  const bgLight = rgb(248 / 255, 250 / 255, 252 / 255);
  const borderGray = rgb(203 / 255, 213 / 255, 225 / 255);
  
  // Outer Border
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: borderGray,
    borderWidth: 1.5,
  });

  // Top Header Banner
  page.drawRectangle({
    x: 20,
    y: height - 100,
    width: width - 40,
    height: 80,
    color: bgLight,
    borderColor: borderGray,
    borderWidth: 1,
  });

  // Orange accent line
  page.drawRectangle({
    x: 20,
    y: height - 103,
    width: width - 40,
    height: 3,
    color: orange,
  });

  // Company Title
  page.drawText('SHREE RR TRADING COMPANY', {
    x: 35,
    y: height - 52,
    size: 20,
    font: fontBold,
    color: navy,
  });

  page.drawText('Plant O&M, Heavy Fleets & Earth Moving Machinery Contracts', {
    x: 35,
    y: height - 68,
    size: 9.5,
    font: fontRegular,
    color: lightGray,
  });

  page.drawText('Site: ACC Chanda Plant Site & Operations | Chandrapur, Maharashtra', {
    x: 35,
    y: height - 82,
    size: 9,
    font: fontRegular,
    color: lightGray,
  });

  // Payslip Month Badge
  const monthText = `PAYSLIP - ${(slip.monthYear || '2026').toUpperCase()}`;
  const monthWidth = fontBold.widthOfTextAtSize(monthText, 11);
  page.drawRectangle({
    x: width - 40 - monthWidth - 20,
    y: height - 68,
    width: monthWidth + 20,
    height: 24,
    color: orange,
  });
  page.drawText(monthText, {
    x: width - 40 - monthWidth - 10,
    y: height - 58,
    size: 11,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // Employee Details Box
  let currY = height - 120;
  page.drawRectangle({
    x: 30,
    y: currY - 100,
    width: width - 60,
    height: 100,
    color: bgLight,
    borderColor: borderGray,
    borderWidth: 1,
  });

  // Left Column
  const leftX = 42;
  const colValX = 145;
  const rightX = 310;
  const rightValX = 420;

  const drawRow = (label, val, xL, xV, y) => {
    page.drawText(`${label}:`, { x: xL, y, size: 8.5, font: fontBold, color: darkGray });
    page.drawText(String(val || '-'), { x: xV, y, size: 8.5, font: fontRegular, color: navy });
  };

  drawRow('Employee ID', slip.empId || slip.userId || '-', leftX, colValX, currY - 20);
  drawRow('Employee Name', slip.userName || '-', leftX, colValX, currY - 35);
  drawRow('Father/Husband', slip.fatherName || '-', leftX, colValX, currY - 50);
  drawRow('Designation', slip.designation || 'Staff', leftX, colValX, currY - 65);
  drawRow('Category', slip.category || 'Skilled', leftX, colValX, currY - 80);
  drawRow('Mobile No', slip.mobile ? `+91 ${slip.mobile}` : (slip.phone || '-'), leftX, colValX, currY - 95);

  // Right Column
  drawRow('Date of Joining', slip.doj || '-', rightX, rightValX, currY - 20);
  drawRow('UAN Number', slip.uan || '-', rightX, rightValX, currY - 35);
  drawRow('PF Number', slip.pfNo || '-', rightX, rightValX, currY - 50);
  drawRow('ESIC Number', slip.esicNo || '-', rightX, rightValX, currY - 65);
  drawRow('Bank A/c & IFSC', `${slip.bankAccount || '-'} (${slip.ifsc || '-'})`, rightX, rightValX, currY - 80);
  drawRow('Working Days', `${slip.workedDays || 31} / ${slip.totalDays || 31} Days`, rightX, rightValX, currY - 95);

  currY -= 125;

  // Earnings & Deductions Table Header
  const tblX = 30;
  const tblW = width - 60;
  const midX = tblX + (tblW / 2);

  // Table Headers
  page.drawRectangle({
    x: tblX,
    y: currY - 24,
    width: tblW,
    height: 24,
    color: navy,
  });

  page.drawText('EARNINGS', { x: tblX + 15, y: currY - 16, size: 10, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText('AMOUNT', { x: midX - 65, y: currY - 16, size: 10, font: fontBold, color: rgb(1, 1, 1) });

  page.drawText('DEDUCTIONS', { x: midX + 15, y: currY - 16, size: 10, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText('AMOUNT', { x: tblX + tblW - 65, y: currY - 16, size: 10, font: fontBold, color: rgb(1, 1, 1) });

  currY -= 24;

  const resolvedOt = Number(slip.earnings?.otWage !== undefined ? slip.earnings.otWage : (slip.otWage || 0));

  const rows = [
    { earnDesc: 'Basic Salary', earnVal: fmt(slip.earnings?.basic), dedDesc: 'Provident Fund (PF @ 12%)', dedVal: fmt(slip.deductions?.pf) },
    { earnDesc: 'Dearness Allowance (DA)', earnVal: fmt(slip.earnings?.da), dedDesc: 'ESIC Contribution', dedVal: fmt(slip.deductions?.esic) },
    { earnDesc: 'House Rent Allowance (HRA)', earnVal: fmt(slip.earnings?.hra), dedDesc: 'Professional Tax (PT)', dedVal: fmt(slip.deductions?.pt) },
    { earnDesc: 'Special Allowance / Field Pay', earnVal: fmt(slip.earnings?.specialAllowance), dedDesc: 'LIC Premium / Other', dedVal: fmt(slip.deductions?.lic) },
    { earnDesc: 'Overtime (OT) Wages', earnVal: fmt(resolvedOt), dedDesc: 'Advance / Loan Recovery', dedVal: fmt(slip.deductions?.advance) },
  ];

  const rowHeight = 26;
  rows.forEach((r, idx) => {
    const isEven = idx % 2 === 0;
    page.drawRectangle({
      x: tblX,
      y: currY - rowHeight,
      width: tblW,
      height: rowHeight,
      color: isEven ? bgLight : rgb(1, 1, 1),
      borderColor: borderGray,
      borderWidth: 0.5,
    });

    // Divider down the middle
    page.drawLine({
      start: { x: midX, y: currY },
      end: { x: midX, y: currY - rowHeight },
      thickness: 0.5,
      color: borderGray,
    });

    // Earnings text
    page.drawText(r.earnDesc, { x: tblX + 15, y: currY - 17, size: 9, font: fontRegular, color: darkGray });
    const eValW = fontRegular.widthOfTextAtSize(r.earnVal, 9);
    page.drawText(r.earnVal, { x: midX - 15 - eValW, y: currY - 17, size: 9, font: fontRegular, color: navy });

    // Deductions text
    page.drawText(r.dedDesc, { x: midX + 15, y: currY - 17, size: 9, font: fontRegular, color: darkGray });
    const dValW = fontRegular.widthOfTextAtSize(r.dedVal, 9);
    page.drawText(r.dedVal, { x: tblX + tblW - 15 - dValW, y: currY - 17, size: 9, font: fontRegular, color: navy });

    currY -= rowHeight;
  });

  // Totals Row
  page.drawRectangle({
    x: tblX,
    y: currY - 26,
    width: tblW,
    height: 26,
    color: rgb(241 / 255, 245 / 255, 249 / 255),
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText('GROSS EARNINGS', { x: tblX + 15, y: currY - 18, size: 9.5, font: fontBold, color: navy });
  const grossText = fmt(slip.grossPay);
  const grossW = fontBold.widthOfTextAtSize(grossText, 9.5);
  page.drawText(grossText, { x: midX - 15 - grossW, y: currY - 18, size: 9.5, font: fontBold, color: navy });

  page.drawText('TOTAL DEDUCTIONS', { x: midX + 15, y: currY - 18, size: 9.5, font: fontBold, color: darkGray });
  const dedText = fmt(slip.totalDeductions);
  const dedW = fontBold.widthOfTextAtSize(dedText, 9.5);
  page.drawText(dedText, { x: tblX + tblW - 15 - dedW, y: currY - 18, size: 9.5, font: fontBold, color: darkGray });

  currY -= 26;

  // NET PAY HIGHLIGHT BOX
  page.drawRectangle({
    x: tblX,
    y: currY - 38,
    width: tblW,
    height: 38,
    color: navy,
  });

  page.drawText('NET TAKE HOME PAY:', { x: tblX + 20, y: currY - 24, size: 12, font: fontBold, color: rgb(1, 1, 1) });
  
  const netStr = fmt(slip.netPay);
  const netW = fontBold.widthOfTextAtSize(netStr, 15);
  page.drawText(netStr, { x: tblX + tblW - 20 - netW, y: currY - 26, size: 15, font: fontBold, color: orange });

  currY -= 50;

  // Net Pay in Words
  const netInt = Math.round(Number(slip.netPay || 0));
  const wordsText = `Amount in Words: Indian Rupees ${numberToWords(netInt)}`;
  page.drawRectangle({
    x: tblX,
    y: currY - 26,
    width: tblW,
    height: 26,
    color: bgLight,
    borderColor: borderGray,
    borderWidth: 1,
  });
  page.drawText(wordsText, { x: tblX + 15, y: currY - 17, size: 9, font: fontBold, color: darkGray });

  currY -= 50;

  // Signatures Row
  page.drawRectangle({
    x: tblX,
    y: currY - 75,
    width: tblW,
    height: 75,
    color: rgb(1, 1, 1),
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawLine({
    start: { x: tblX + 40, y: currY - 50 },
    end: { x: tblX + 200, y: currY - 50 },
    thickness: 1,
    color: borderGray,
  });
  page.drawText('Employee Signature / Thumb', { x: tblX + 45, y: currY - 65, size: 8.5, font: fontRegular, color: lightGray });

  page.drawLine({
    start: { x: tblX + tblW - 220, y: currY - 50 },
    end: { x: tblX + tblW - 40, y: currY - 50 },
    thickness: 1,
    color: borderGray,
  });
  page.drawText('For SHREE RR TRADING COMPANY', { x: tblX + tblW - 225, y: currY - 25, size: 9, font: fontBold, color: navy });
  page.drawText('Authorized Signatory / Managing Director', { x: tblX + tblW - 225, y: currY - 65, size: 8.5, font: fontRegular, color: lightGray });

  // Official Seal Note
  page.drawText('* This is a computer generated official payslip statement of Shree RR Trading Company.', {
    x: tblX + 5,
    y: 48,
    size: 7.5,
    font: fontRegular,
    color: lightGray,
  });

  // Footer Branding: SrijanDev
  page.drawText('(c) 2026 SrijanDev. All Rights Reserved. Powered by SrijanDev Operations & Payroll Engine', {
    x: tblX + 5,
    y: 34,
    size: 7.5,
    font: fontRegular,
    color: lightGray,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

module.exports = {
  generateSalarySlipPdf,
};
