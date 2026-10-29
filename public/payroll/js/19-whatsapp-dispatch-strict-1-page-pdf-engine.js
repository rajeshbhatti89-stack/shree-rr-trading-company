// 19. WhatsApp Dispatch & Strict 1-Page PDF Engine

// Intelligent Mobile Number Resolver (Checks slip, user master, and bulk employee cache)
function resolveEmployeeMobile(slip) {
  if (!slip) return '';

  // 1. Direct slip fields
  let raw = slip.mobile || slip.phone || slip.whatsapp || slip.contactNumber;
  let clean = String(raw || '').replace(/[^0-9]/g, '').slice(-10);
  if (clean.length === 10) return clean;

  // 2. Cross-reference with allUsers
  if (Array.isArray(allUsers) && allUsers.length > 0) {
    const matchedUser = allUsers.find(
      (u) =>
        (slip.userId && (u.id === slip.userId || u.empId === slip.userId)) ||
        (slip.empId && (u.empId === slip.empId || u.id === slip.empId)) ||
        (slip.userName && u.name && u.name.trim().toLowerCase() === slip.userName.trim().toLowerCase())
    );
    if (matchedUser) {
      raw = matchedUser.mobile || matchedUser.phone || matchedUser.whatsapp;
      clean = String(raw || '').replace(/[^0-9]/g, '').slice(-10);
      if (clean.length === 10) return clean;
    }
  }

  // 3. Cross-reference with parsedBulkEmployees
  if (Array.isArray(parsedBulkEmployees) && parsedBulkEmployees.length > 0) {
    const matchedBulk = parsedBulkEmployees.find(
      (b) =>
        (slip.empId && b.empId === slip.empId) ||
        (slip.userName && b.name && b.name.trim().toLowerCase() === slip.userName.trim().toLowerCase())
    );
    if (matchedBulk) {
      raw = matchedBulk.mobile || matchedBulk.phone;
      clean = String(raw || '').replace(/[^0-9]/g, '').slice(-10);
      if (clean.length === 10) return clean;
    }
  }

  return '';
}

async function dispatchWhatsAppWithPdfAttachment({ element, filename, mobile, textMessage, title, recipientName, interactive = true, autoDownload = true }) {
  if (!element) {
    showToast('Document element not found.', 'error');
    return { success: false, reason: 'Document element not found' };
  }

  showToast(`Preparing 1-Page Official PDF for ${recipientName || 'Employee'}...`);

  // Apply strict single-page constraints
  element.classList.add('pdf-strict-single-page');

  const opt = {
    margin: [4, 6, 4, 6],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false, scrollY: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  let pdfBlob = null;
  try {
    if (typeof html2pdf !== 'undefined') {
      pdfBlob = await html2pdf().set(opt).from(element).toPdf().get('pdf').then((pdf) => {
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = totalPages; i > 1; i--) {
          pdf.deletePage(i);
        }
        return pdf.output('blob');
      });
    }
  } catch (err) {
    console.warn('PDF blob generation error:', err);
  } finally {
    element.classList.remove('pdf-strict-single-page');
  }

  // Auto trigger download of the official 1-page PDF file to device
  if (pdfBlob && autoDownload) {
    try {
      const blobUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 25000);
    } catch (dErr) {
      console.error('Download error:', dErr);
    }
  }

  const cleanMobile = String(mobile || '').replace(/[^0-9]/g, '').slice(-10);
  let targetPhone = cleanMobile;
  if (!targetPhone || targetPhone.length < 10) {
    if (interactive) {
      const entered = prompt(`Enter 10-digit WhatsApp Mobile number for ${recipientName || 'Employee'}:`, '');
      if (!entered) return { success: false, reason: 'Mobile prompt cancelled' };
      targetPhone = entered.replace(/[^0-9]/g, '').slice(-10);
    } else {
      return { success: false, reason: 'Missing mobile number' };
    }
  }

  if (targetPhone.length < 10) {
    showToast(`Invalid mobile number for ${recipientName || 'Employee'}`, 'error');
    return { success: false, reason: 'Invalid phone length' };
  }

  // Copy personalized statement text to clipboard
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(textMessage);
    }
  } catch (cErr) {
    console.warn('Clipboard write error:', cErr);
  }

  // Attempt 1: Native File WebShare on mobile devices (Android / iOS)
  let sharedAsFile = false;
  if (pdfBlob && navigator.canShare && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
    try {
      const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });
      if (navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          files: [pdfFile],
          title: title || filename,
          text: textMessage
        });
        sharedAsFile = true;
        showToast(`✅ Official PDF Attached & Shared via WhatsApp to ${recipientName}!`);
        return { success: true, method: 'webshare', targetPhone };
      }
    } catch (shareErr) {
      console.log('WebShare file share skipped or cancelled:', shareErr);
    }
  }

  // Attempt 2: Desktop WhatsApp Web / Direct WhatsApp API URL
  if (!sharedAsFile) {
    const waUrl = `https://api.whatsapp.com/send?phone=91${targetPhone}&text=${encodeURIComponent(textMessage)}`;
    const newWin = window.open(waUrl, '_blank');
    if (!newWin) {
      showToast(`⚠️ Pop-up blocked for ${recipientName}. Please allow pop-ups for automatic WhatsApp dispatch.`, 'warning', 6000);
      return { success: true, method: 'popup_blocked', targetPhone, waUrl };
    }

    showToast(`📄 1-Page PDF Downloaded! In WhatsApp, click 📎 Attach > Document to attach "${filename}"`, 'success', 7000);
    return { success: true, method: 'whatsapp_web', targetPhone, waUrl };
  }

  return { success: true, targetPhone };
}

async function downloadSlipPdf(slipId) {
  let slip = slipId ? allSalarySlips.find((s) => s.id === slipId) : currentActiveSlip;
  if (!slip && allSalarySlips.length > 0) slip = allSalarySlips[0];
  if (!slip) {
    showToast('No salary slip selected for PDF export.', 'error');
    return;
  }

  // Populate printable modal
  viewSalarySlip(slip.id);

  const element = document.getElementById('printable-salary-slip-content');
  if (!element) return;

  element.classList.add('pdf-strict-single-page');

  const opt = {
    margin: [4, 6, 4, 6],
    filename: `Shree_RR_SalarySlip_${slip.empId || slip.userId || 'EMP'}_${(slip.monthYear || 'Month').replace(/\s+/g, '_')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false, scrollY: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  showToast(`Generating Strict 1-Page PDF Payslip for ${slip.userName}...`);

  try {
    if (typeof html2pdf !== 'undefined') {
      await html2pdf().set(opt).from(element).save();
      showToast(`Downloaded 1-Page PDF: ${opt.filename}`);
    } else {
      window.print();
    }
  } finally {
    element.classList.remove('pdf-strict-single-page');
  }
}

function createWhatsAppMessage(slip) {
  const cleanMobile = resolveEmployeeMobile(slip);
  const basic = Number(slip.earnings?.basic || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const da = Number(slip.earnings?.da || 0);
  const hra = Number(slip.earnings?.hra || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const special = Number(slip.earnings?.specialAllowance || 0);
  const bonus = Number(slip.earnings?.bonus || 0);
  const ot = Number(slip.earnings?.otWage !== undefined ? slip.earnings.otWage : (slip.otWage || 0));
  const gross = Number(slip.grossPay || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  const pf = Number(slip.deductions?.pf || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const esic = Number(slip.deductions?.esic || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const pt = Number(slip.deductions?.pt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const deductions = Number(slip.totalDeductions || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const netPay = Number(slip.netPay || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  let earningsText = ` • Basic Salary: ?${basic}\n`;
  if (da > 0) earningsText += ` • DA: ?${da.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n`;
  earningsText += ` • HRA: ?${hra}\n`;
  if (special > 0) earningsText += ` • Special Plant Allowance: ?${special.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n`;
  if (bonus > 0) earningsText += ` • Bonus / Arrears: ?${bonus.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n`;
  if (ot > 0) earningsText += ` • Overtime (OT) Wages: ?${ot.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n`;

  const slipIdParam = encodeURIComponent(slip.id || slip.empId || '');
  const pdfDownloadUrl = `https://payroll.shreerrtradingcompany.com/payroll/slip.html?id=${slipIdParam}&download=1`;

  const msg = `*SHREE RR TRADING COMPANY*
*Official Salary Slip - ${slip.monthYear}*
━━━━━━━━━━━━━━━━━━━━
👤 *Employee:* ${slip.userName} (${slip.empId || 'SRR'})
🛠 *Designation:* ${slip.designation || 'Staff'}
📍 *Site Location:* ${slip.location || 'ACC Chanda Plant Site'}
📅 *Payable Days:* ${slip.workedDays || 31} / ${slip.totalDays || 31} Days

?? *GROSS EARNINGS:* *?${gross}*
${earningsText.trimEnd()}

📉 *TOTAL DEDUCTIONS:* *?${deductions}*
 • PF Contribution: ?${pf}
 • ESIC: ?${esic}
 • Professional Tax (PT): ?${pt}

💰 *NET TAKE HOME SALARY:* *?${netPay}*
🏦 *Bank A/C:* ${slip.bankAccount || 'On Record'} (${slip.ifsc || ''})

📄 *OFFICIAL 1-PAGE PDF PAYSLIP DOWNLOAD:*
👉 ${pdfDownloadUrl}
_(Click link to view & download official stamped PDF payslip)_
━━━━━━━━━━━━━━━━━━━━
_Portal: https://payroll.shreerrtradingcompany.com_
_Developed & Powered by SrijanDev © 2026_`;

  return { mobile: cleanMobile, text: msg, pdfUrl: pdfDownloadUrl };
}

async function sendSlipWhatsApp(slipId, options = {}) {
  const slip = allSalarySlips.find((s) => s.id === slipId);
  if (!slip) return { success: false, reason: 'Salary slip not found' };

  // Resolve mobile number
  let mobile = options.mobile || resolveEmployeeMobile(slip);
  if (!slip.mobile && mobile) {
    slip.mobile = mobile;
  }

  // Populate printable modal DOM
  viewSalarySlip(slip.id);

  // Allow DOM to settle before html2pdf runs
  await new Promise((r) => setTimeout(r, 80));

  const element = document.getElementById('printable-salary-slip-content');
  const filename = `Shree_RR_SalarySlip_${slip.empId || slip.userId || 'EMP'}_${(slip.monthYear || 'Month').replace(/\s+/g, '_')}.pdf`;
  const { text } = createWhatsAppMessage(slip);

  const autoDownload = options.autoDownload !== undefined ? options.autoDownload : true;
  const interactive = options.interactive !== undefined ? options.interactive : true;

  return await dispatchWhatsAppWithPdfAttachment({
    element,
    filename,
    mobile: mobile,
    textMessage: text,
    title: `Salary Slip ${slip.monthYear} - ${slip.userName}`,
    recipientName: slip.userName,
    interactive,
    autoDownload
  });
}

// =========================================================================
// 19B. Bulk WhatsApp Salary Slip Dispatch Hub & Automated Queue Engine
// =========================================================================
let bulkWaState = {
  active: false,
  paused: false,
  slips: [],
  currentIndex: 0,
  selectedMonth: '',
  timerId: null,
  sentMap: new Map() // slipId -> { timestamp, method }
};

function dispatchBulkWhatsApp() {
  openBulkWhatsAppModal();
}

function openBulkWhatsAppModal() {
  const selectedMonth = document.getElementById('payroll-month-select')?.value || 'August 2026';
  const monthSlips = allSalarySlips.filter((s) => s.monthYear === selectedMonth);

  if (monthSlips.length === 0) {
    if (confirm(`No salary slips found for ${selectedMonth}.\nWould you like to automatically generate 1-Click salary slips for ${selectedMonth} now?`)) {
      const genBtn = document.getElementById('btn-bulk-generate-slips');
      if (genBtn) genBtn.click();
    }
    return;
  }

  // Auto-enrich all slips with mobile numbers from users
  monthSlips.forEach((s) => {
    if (!s.mobile || String(s.mobile).replace(/[^0-9]/g, '').length < 10) {
      s.mobile = resolveEmployeeMobile(s);
    }
  });

  bulkWaState.slips = monthSlips;
  bulkWaState.selectedMonth = selectedMonth;
  bulkWaState.currentIndex = 0;
  bulkWaState.active = false;
  bulkWaState.paused = false;
  if (bulkWaState.timerId) clearTimeout(bulkWaState.timerId);

  renderBulkWhatsAppModal();
  openModal('modal-bulk-whatsapp-dispatch');
}

function renderBulkWhatsAppModal() {
  const { slips, selectedMonth, sentMap } = bulkWaState;

  // Month badge
  const monthBadge = document.getElementById('bulk-wa-month-badge');
  if (monthBadge) monthBadge.textContent = selectedMonth;

  // Metrics
  const totalCountEl = document.getElementById('bulk-wa-total-count');
  const readyCountEl = document.getElementById('bulk-wa-ready-count');
  const progressCountEl = document.getElementById('bulk-wa-progress-count');
  const totalNetEl = document.getElementById('bulk-wa-total-net');

  let readyCount = 0;
  let totalNet = 0;
  slips.forEach((s) => {
    const mob = resolveEmployeeMobile(s);
    if (mob && mob.length === 10) readyCount++;
    totalNet += Number(s.netPay || 0);
  });

  const sentCount = sentMap.size;
  if (totalCountEl) totalCountEl.textContent = `${slips.length} Employees`;
  if (readyCountEl) readyCountEl.textContent = `${readyCount} / ${slips.length} Ready`;
  if (progressCountEl) progressCountEl.textContent = `${sentCount} / ${slips.length} Dispatched`;
  if (totalNetEl) totalNetEl.textContent = `₹${totalNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  // Table body
  const tbody = document.getElementById('bulk-wa-table-body');
  if (!tbody) return;

  tbody.innerHTML = slips
    .map((s, idx) => {
      const mob = resolveEmployeeMobile(s);
      const isSent = sentMap.has(s.id);
      const isCurrent = bulkWaState.active && bulkWaState.currentIndex === idx;
      const netPayStr = `₹${Number(s.netPay || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

      let statusBadge = '';
      if (isSent) {
        statusBadge = `<span class="badge" style="background: rgba(16, 185, 129, 0.12); color: #059669; font-weight: 700; padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.3);"><i class="fa-solid fa-circle-check"></i> Sent & Opened</span>`;
      } else if (isCurrent) {
        statusBadge = `<span class="badge" style="background: rgba(255, 107, 0, 0.12); color: #C2410C; font-weight: 700; padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255, 107, 0, 0.3);"><i class="fa-solid fa-spinner fa-spin"></i> Processing...</span>`;
      } else {
        statusBadge = `<span class="badge" style="background: #F1F5F9; color: #64748B; font-weight: 700; padding: 4px 8px; border-radius: 6px;">Pending</span>`;
      }

      const mobileInputHtml = mob && mob.length === 10
        ? `<div style="display: flex; align-items: center; gap: 6px;">
             <span style="font-family: var(--font-mono); font-weight: 700; color: #16A34A; font-size: 13px;">+91 ${mob}</span>
             <button class="btn-icon-only text-muted" style="font-size: 11px;" onclick="editBulkEmployeeMobile('${s.id}')" title="Edit Mobile Number"><i class="fa-solid fa-pencil"></i></button>
           </div>`
        : `<div style="display: flex; align-items: center; gap: 4px;">
             <input type="text" id="bulk-mob-input-${s.id}" class="custom-input" placeholder="10-digit mobile" maxlength="10" style="width: 110px; font-size: 11px; padding: 2px 6px; border: 1px solid #FF6B00; background: #FFF7ED; font-family: var(--font-mono);" value="" onchange="saveInlineBulkMobile('${s.id}', this.value)">
             <button class="btn btn-primary btn-sm" style="padding: 2px 6px; font-size: 11px;" onclick="saveInlineBulkMobile('${s.id}', document.getElementById('bulk-mob-input-${s.id}')?.value)">Save</button>
           </div>`;

      const rowStyle = isCurrent ? 'background: #FFF7ED; font-weight: 600;' : '';

      return `
        <tr id="bulk-wa-row-${s.id}" style="${rowStyle}">
          <td style="text-align: center; color: var(--text-dim); font-size: 12px;">${idx + 1}</td>
          <td>
            <div style="font-weight: 700; color: var(--logo-navy);">${escapeHtml(s.userName)}</div>
            <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">ID: ${escapeHtml(s.empId || 'SRR')}</div>
          </td>
          <td>
            <div style="font-size: 12px; font-weight: 600;">${escapeHtml(s.designation || 'Staff')}</div>
            <div style="font-size: 11px; color: var(--text-muted);">${escapeHtml(s.location || 'ACC Chanda')}</div>
          </td>
          <td>${mobileInputHtml}</td>
          <td style="text-align: right; font-weight: 800; color: var(--logo-navy);">${netPayStr}</td>
          <td style="text-align: center;">
            <button class="btn btn-outline-primary btn-sm" style="padding: 3px 8px; font-size: 11px;" onclick="downloadSlipPdf('${s.id}')" title="Download 1-Page Official PDF">
              <i class="fa-solid fa-file-pdf"></i> PDF
            </button>
          </td>
          <td style="text-align: center;" id="bulk-wa-status-cell-${s.id}">${statusBadge}</td>
          <td style="text-align: right;">
            <button class="btn btn-outline-success btn-sm" style="padding: 4px 10px; font-size: 12px; font-weight: 700;" onclick="sendSingleSlipFromBulkModal('${s.id}')" title="Send Official Statement & Open WhatsApp">
              <i class="fa-brands fa-whatsapp"></i> ${isSent ? 'Resend' : 'Send'}
            </button>
          </td>
        </tr>
      `;
    })
    .join('');
}

function updateBulkProgressBar(current, total, statusText) {
  const fill = document.getElementById('bulk-wa-progress-fill');
  const percentText = document.getElementById('bulk-wa-percentage');
  const statusEl = document.getElementById('bulk-wa-status-text');

  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  if (fill) fill.style.width = `${pct}%`;
  if (percentText) percentText.textContent = `${pct}%`;
  if (statusEl && statusText) {
    statusEl.innerHTML = statusText;
  }
}

function resetBulkQueueButtons() {
  const startBtn = document.getElementById('btn-start-bulk-whatsapp-queue');
  const pauseBtn = document.getElementById('btn-pause-bulk-whatsapp-queue');
  const nextBtn = document.getElementById('btn-next-bulk-whatsapp-queue');
  const stopBtn = document.getElementById('btn-stop-bulk-whatsapp-queue');

  if (startBtn) {
    startBtn.classList.remove('hidden');
    startBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Restart Dispatch Queue';
  }
  if (pauseBtn) pauseBtn.classList.add('hidden');
  if (nextBtn) nextBtn.classList.add('hidden');
  if (stopBtn) stopBtn.classList.add('hidden');
}

async function startAutomatedBulkWhatsAppDispatch() {
  const { slips } = bulkWaState;
  if (!slips || slips.length === 0) {
    showToast('No salary slips to dispatch.', 'error');
    return;
  }

  // Check if any missing mobile numbers
  const missingCount = slips.filter((s) => !resolveEmployeeMobile(s) || resolveEmployeeMobile(s).length < 10).length;
  if (missingCount > 0) {
    if (!confirm(`Warning: ${missingCount} employee(s) have missing WhatsApp mobile numbers in the list.\nDo you want to proceed? (The system will pause on any employee missing a number so you can enter it).`)) {
      return;
    }
  }

  bulkWaState.active = true;
  bulkWaState.paused = false;
  bulkWaState.currentIndex = 0;

  const startBtn = document.getElementById('btn-start-bulk-whatsapp-queue');
  const pauseBtn = document.getElementById('btn-pause-bulk-whatsapp-queue');
  const nextBtn = document.getElementById('btn-next-bulk-whatsapp-queue');
  const stopBtn = document.getElementById('btn-stop-bulk-whatsapp-queue');

  if (startBtn) startBtn.classList.add('hidden');
  if (pauseBtn) { pauseBtn.classList.remove('hidden'); pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause'; }
  if (nextBtn) nextBtn.classList.remove('hidden');
  if (stopBtn) stopBtn.classList.remove('hidden');

  processNextBulkWhatsAppItem();
}

async function processNextBulkWhatsAppItem() {
  if (!bulkWaState.active) return;
  if (bulkWaState.paused) return;

  const { slips, currentIndex } = bulkWaState;

  if (currentIndex >= slips.length) {
    // Finished all slips
    bulkWaState.active = false;
    updateBulkProgressBar(slips.length, slips.length, `🎉 All ${slips.length} employee salary slips successfully dispatched via WhatsApp!`);
    showToast(`🎉 Bulk WhatsApp dispatch complete! All ${slips.length} salary slips sent.`);
    resetBulkQueueButtons();
    renderBulkWhatsAppModal();
    return;
  }

  const slip = slips[currentIndex];
  let mobile = resolveEmployeeMobile(slip);

  // If missing mobile, pause queue and alert user
  if (!mobile || mobile.length < 10) {
    bulkWaState.paused = true;
    updateBulkProgressBar(currentIndex, slips.length, `⚠️ Missing WhatsApp number for <strong>${escapeHtml(slip.userName)}</strong>. Please enter 10-digit number below and click Resume.`);
    const pauseBtn = document.getElementById('btn-pause-bulk-whatsapp-queue');
    if (pauseBtn) pauseBtn.innerHTML = '<i class="fa-solid fa-play"></i> Resume';
    showToast(`Missing mobile number for ${slip.userName}. Enter number to proceed.`, 'warning');
    const inputEl = document.getElementById(`bulk-mob-input-${slip.id}`);
    if (inputEl) inputEl.focus();
    return;
  }

  // Update status UI
  updateBulkProgressBar(currentIndex, slips.length, `⚡ [${currentIndex + 1}/${slips.length}] Generating 1-Page PDF & opening WhatsApp for <strong>${escapeHtml(slip.userName)}</strong> (+91 ${mobile})...`);
  renderBulkWhatsAppModal();

  // Scroll active row into view
  const activeRow = document.getElementById(`bulk-wa-row-${slip.id}`);
  if (activeRow) {
    activeRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    activeRow.style.background = '#FFF7ED';
  }

  const autoDownload = document.getElementById('bulk-wa-download-pdf-toggle')?.checked !== false;

  // Execute single send
  try {
    const res = await sendSlipWhatsApp(slip.id, {
      mobile,
      interactive: false,
      autoDownload
    });

    bulkWaState.sentMap.set(slip.id, { timestamp: Date.now(), method: res?.method || 'whatsapp' });
  } catch (err) {
    console.error('Error dispatching to ' + slip.userName, err);
  }

  renderBulkWhatsAppModal();

  // Advance index
  bulkWaState.currentIndex++;

  // Delay handling
  const delaySec = parseInt(document.getElementById('bulk-wa-delay-select')?.value || '3');
  if (delaySec === 0) {
    // Manual next mode
    updateBulkProgressBar(bulkWaState.currentIndex, slips.length, `✅ Sent to <strong>${escapeHtml(slip.userName)}</strong>! Click <strong>"Send Next Now ⏩"</strong> to dispatch next employee.`);
    const nextBtn = document.getElementById('btn-next-bulk-whatsapp-queue');
    if (nextBtn) {
      nextBtn.focus();
    }
  } else {
    // Auto-advance with countdown
    let remaining = delaySec;
    const updateCountdown = () => {
      if (!bulkWaState.active || bulkWaState.paused) return;
      if (remaining <= 0) {
        processNextBulkWhatsAppItem();
      } else {
        updateBulkProgressBar(bulkWaState.currentIndex, slips.length, `✅ Sent to <strong>${escapeHtml(slip.userName)}</strong>! Next employee in ${remaining}s... (or click Send Next ⏩)`);
        remaining--;
        bulkWaState.timerId = setTimeout(updateCountdown, 1000);
      }
    };
    updateCountdown();
  }
}

function advanceNextBulkWhatsAppManual() {
  if (bulkWaState.timerId) clearTimeout(bulkWaState.timerId);
  processNextBulkWhatsAppItem();
}

function togglePauseBulkWhatsApp() {
  bulkWaState.paused = !bulkWaState.paused;
  const pauseBtn = document.getElementById('btn-pause-bulk-whatsapp-queue');
  if (bulkWaState.paused) {
    if (bulkWaState.timerId) clearTimeout(bulkWaState.timerId);
    if (pauseBtn) pauseBtn.innerHTML = '<i class="fa-solid fa-play"></i> Resume';
    updateBulkProgressBar(bulkWaState.currentIndex, bulkWaState.slips.length, '⏸ Queue Paused. Click Resume or Send Next to continue.');
  } else {
    if (pauseBtn) pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
    processNextBulkWhatsAppItem();
  }
}

function stopBulkWhatsAppDispatch() {
  bulkWaState.active = false;
  bulkWaState.paused = false;
  if (bulkWaState.timerId) clearTimeout(bulkWaState.timerId);
  resetBulkQueueButtons();
  updateBulkProgressBar(bulkWaState.currentIndex, bulkWaState.slips.length, '⏹ Queue Stopped.');
  renderBulkWhatsAppModal();
}

function handleBulkDelayChange() {
  const val = document.getElementById('bulk-wa-delay-select')?.value;
  bulkWaState.delaySec = parseInt(val || '3');
}

async function sendSingleSlipFromBulkModal(slipId) {
  const slip = bulkWaState.slips.find((s) => s.id === slipId) || allSalarySlips.find((s) => s.id === slipId);
  if (!slip) return;

  const autoDownload = document.getElementById('bulk-wa-download-pdf-toggle')?.checked !== false;
  const res = await sendSlipWhatsApp(slip.id, {
    interactive: true,
    autoDownload
  });

  if (res && res.success) {
    bulkWaState.sentMap.set(slip.id, { timestamp: Date.now(), method: res.method || 'whatsapp' });
    renderBulkWhatsAppModal();
  }
}

function editBulkEmployeeMobile(slipId) {
  const slip = allSalarySlips.find((s) => s.id === slipId);
  if (!slip) return;
  const entered = prompt(`Enter 10-digit WhatsApp Mobile number for ${slip.userName}:`, slip.mobile || '');
  if (entered !== null) {
    saveInlineBulkMobile(slipId, entered);
  }
}

function saveInlineBulkMobile(slipId, newMobile) {
  const clean = String(newMobile || '').replace(/[^0-9]/g, '').slice(-10);
  if (clean.length < 10) {
    showToast('Please enter a valid 10-digit mobile number.', 'error');
    return;
  }

  // Update slip
  const slip = allSalarySlips.find((s) => s.id === slipId);
  if (slip) {
    slip.mobile = clean;
    slip.phone = `+91 ${clean}`;
  }

  // Update matching user in allUsers
  if (slip) {
    const user = allUsers.find((u) => u.id === slip.userId || u.empId === slip.empId || u.name === slip.userName);
    if (user) {
      user.mobile = clean;
      user.phone = `+91 ${clean}`;
    }
  }

  saveSlipsToStorage(allSalarySlips);
  showToast(`Updated mobile number for ${slip ? slip.userName : 'Employee'}: +91 ${clean}`);
  renderBulkWhatsAppModal();
}



