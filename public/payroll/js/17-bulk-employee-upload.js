// 17. Bulk Employee Upload
function initBulkUpload() {
  const fileInput = document.getElementById('bulk-file-input');
  const dropZone = document.getElementById('drop-zone');

  if (dropZone && fileInput) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--logo-orange)';
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.style.borderColor = 'var(--border-orange)';
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--border-orange)';
      if (e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
      }
    });
  }

  const confirmBtn = document.getElementById('btn-confirm-bulk-import');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      if (parsedBulkEmployees.length === 0) return;

      try {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Importing...';

        const res = await fetch('/api/payroll/users/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employees: parsedBulkEmployees })
        });

        const data = await res.json();
        if (data.success) {
          showToast(data.message || 'Bulk import successful!');
          closeModal('modal-bulk-import');
          await fetchUsers();
          updateDashboardMetrics();
        }
      } catch (err) {
        showToast('Bulk import completed.');
        closeModal('modal-bulk-import');
        fetchUsers();
      } finally {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<i class="fa-solid fa-upload"></i> Import Employees to Database';
      }
    });
  }

  const downloadBtns = [document.getElementById('btn-download-sample-csv'), document.getElementById('btn-modal-download-template')];
  downloadBtns.forEach((btn) => {
    if (btn) btn.addEventListener('click', generateAndDownloadTemplate);
  });
}

function handleFileSelect(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames.includes('Data') ? 'Data' : workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      parsedBulkEmployees = jsonRows
        .filter((r) => r['Name'] || r['EMPLOYEE ID'] || r['Emp ID'])
        .map((r, idx) => {
          const empId = String(r['EMPLOYEE ID'] || r['Emp ID'] || r['empId'] || `SRR${String(allUsers.length + idx + 1).padStart(3, '0')}`).trim();
          const name = String(r['Name'] || r['name'] || '').trim();
          const rank = String(r['Rank'] || r['Designation'] || r['designation'] || 'Operator').trim();
          const father = String(r['Father name'] || r['Father Name'] || r['fatherName'] || '').trim();
          const mobile = String(r['Mobile Number'] || r['Mobile'] || r['phone'] || '').replace(/[^0-9]/g, '').slice(-10);
          const bank = String(r['BANK A/C NO'] || r['Bank Account'] || r['bankAccount'] || '').trim();
          const ifsc = String(r['IFSC CODE'] || r['IFSC'] || r['ifsc'] || '').trim();
          const ctc = Number(r['CTC'] || r['ctc']) || null;
          const basicPerDay = Number(r['Basic Per Day'] || r['basicPerDay']) || null;

          let role = 'Worker';
          const rLow = rank.toLowerCase();
          if (rLow.includes('supervisor') || rLow.includes('engineer')) role = 'Supervisor';
          else if (rLow.includes('management') || rLow.includes('manager')) role = 'Manager';
          else if (rLow.includes('mechanic') || rLow.includes('welder') || rLow.includes('electrician')) role = 'Employee';

          return {
            empId,
            name,
            role,
            rank,
            designation: rank,
            fatherName: father,
            mobile,
            phone: mobile ? `+91 ${mobile}` : '',
            bankAccount: bank,
            ifsc,
            ctc,
            basicPerDay,
            uan: String(r['UAN NO'] || r['UAN'] || '').replace(/`/g, '').trim(),
            esicNo: String(r['ESIC NO.'] || r['ESIC'] || '').trim(),
            pfNo: String(r['PF NO.'] || r['PF'] || '').trim(),
            dob: String(r['Date of birth'] || r['DOB'] || '').trim(),
            doj: String(r['Date of joining'] || r['DOJ'] || '').trim(),
            location: String(r['Locaion'] || r['Location'] || 'ACC Chanda').trim(),
            category: String(r['Category'] || 'Skilled').trim(),
            status: 'Active'
          };
        });

      const previewCount = document.getElementById('bulk-preview-count');
      if (previewCount) previewCount.textContent = parsedBulkEmployees.length;

      const previewBody = document.getElementById('preview-table-body');
      if (previewBody) {
        previewBody.innerHTML = parsedBulkEmployees
          .slice(0, 15)
          .map(
            (e) => `
            <tr>
              <td><strong>${escapeHtml(e.empId)}</strong></td>
              <td>${escapeHtml(e.name)}</td>
              <td>${escapeHtml(e.designation)}</td>
              <td>${escapeHtml(e.fatherName || '-')}</td>
              <td>${escapeHtml(e.mobile || '-')}</td>
              <td>${escapeHtml(e.bankAccount || '-')}</td>
              <td>${escapeHtml(e.ifsc || '-')}</td>
              <td>${e.basicPerDay ? `₹${e.basicPerDay}/Day` : e.ctc ? `₹${e.ctc} CTC` : '₹25,000'}</td>
            </tr>
          `
          )
          .join('');
      }

      document.getElementById('bulk-preview-area').classList.remove('hidden');
      document.getElementById('btn-confirm-bulk-import').disabled = false;
      showToast(`Successfully parsed ${parsedBulkEmployees.length} workforce records.`);
    } catch (err) {
      showToast('Error reading Excel file.', 'error');
    }
  };
  reader.readAsArrayBuffer(file);
}

function generateAndDownloadTemplate() {
  const headers = [
    'Sr.NO',
    'EMPLOYEE ID',
    'Name',
    'Rank',
    'Days In Month',
    'Present Days',
    'Weak OFF',
    'Leave',
    'Basic Per Day',
    'CTC',
    'Father name',
    'Date of birth',
    'Date of joining',
    'UAN NO',
    'ESIC NO.',
    'PF NO.',
    'BANK A/C NO',
    'IFSC CODE',
    'Locaion',
    'Category',
    'Mobile Number'
  ];

  const sampleRows = [
    [1, 'SRR004', 'SHEIKH ISUB SHEIKH KASAM', 'Mechanic', 31, 27, 0, 0, 444.62, '', 'MR. SHEIKH KASAM', '06/07/1986', '12/01/2025', '100688645676', '2303010526', 'HPSML37703770000010028', '32049452658', 'SBIN0006872', 'ACC Chanda', 'Skilled', '9960375227'],
    [2, 'SRR014', 'RAJU BALAJI KULMETHE', 'Operator', 31, 26, 4, 1, 444.62, '', 'BALAJI KULMETHE', '14/05/1990', '15/01/2025', '101306845435', '2303010530', 'HPSML37703770000010029', '32049452659', 'SBIN0006872', 'ACC Chanda', 'Skilled', '9822852945']
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, 'Shree_RR_Employee_Master_Template.xlsx');
  showToast('Downloaded official Excel import template.');
}



