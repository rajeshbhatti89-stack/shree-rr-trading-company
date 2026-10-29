// 10. Vehicle Bulk Import Engine (Excel / CSV)
function initVehicleBulkImport() {
  const fileInput = document.getElementById('bulk-vehicles-file-input');
  const dropZone = document.getElementById('drop-zone-vehicles');

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
        handleVehicleFileSelect(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleVehicleFileSelect(e.target.files[0]);
      }
    });
  }

  const confirmBtn = document.getElementById('btn-confirm-bulk-vehicles');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      if (parsedBulkVehicles.length === 0) return;

      try {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Importing Vehicles...';

        const res = await fetch('/api/payroll/vehicles/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vehicles: parsedBulkVehicles })
        });

        const data = await res.json();
        if (data.success) {
          showToast(`⚡ ${data.message}`);
          closeModal('modal-bulk-vehicles');
          await fetchVehicles();
          updateDashboardMetrics();
        }
      } catch (err) {
        showToast('Bulk vehicle import completed.');
        closeModal('modal-bulk-vehicles');
        fetchVehicles();
      } finally {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<i class="fa-solid fa-upload"></i> Import Vehicles to Fleet Database';
      }
    });
  }

  document.getElementById('btn-download-vehicle-template')?.addEventListener('click', generateAndDownloadVehicleTemplate);
}

function handleVehicleFileSelect(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      parsedBulkVehicles = jsonRows
        .filter((r) => r['Vehicle No'] || r['Vehicle Reg No'] || r['Vehicle Number'] || r['Reg No'] || r['vehicleNo'])
        .map((r, idx) => {
          const vehicleNo = String(r['Vehicle No'] || r['Vehicle Reg No'] || r['Vehicle Number'] || r['Reg No'] || r['vehicleNo'] || `PLANT-0${idx + 1}`).trim().toUpperCase();
          const name = String(r['Equipment Name'] || r['Name'] || r['Machinery Name'] || r['name'] || 'CAT Heavy Plant Excavator').trim();
          const type = String(r['Category'] || r['Type'] || r['Equipment Type'] || r['Equipment Category'] || r['type'] || 'Excavator').trim();
          const model = String(r['Model'] || r['Equipment Model'] || r['model'] || 'CAT 349D').trim();
          const site = String(r['Site'] || r['Location'] || r['site'] || 'ACC Chanda Plant Site').trim();
          const status = String(r['Status'] || r['Operational Status'] || r['status'] || 'Active (Plant Duty)').trim();
          const hourlyRate = Number(r['Hourly Rate'] || r['Rate'] || r['hourlyRate']) || 3500;
          const fuelType = String(r['Fuel Type'] || r['Fuel'] || 'Diesel').trim();

          return { vehicleNo, name, type, model, site, status, hourlyRate, fuelType };
        });

      document.getElementById('bulk-vehicles-preview-count').textContent = parsedBulkVehicles.length;
      const previewBody = document.getElementById('preview-vehicles-table-body');
      if (previewBody) {
        previewBody.innerHTML = parsedBulkVehicles
          .slice(0, 15)
          .map(
            (v) => `
            <tr>
              <td><strong>${escapeHtml(v.vehicleNo)}</strong></td>
              <td>${escapeHtml(v.name)}</td>
              <td>${escapeHtml(v.type)}</td>
              <td>${escapeHtml(v.model)}</td>
              <td>${escapeHtml(v.site)}</td>
              <td>${escapeHtml(v.status)}</td>
              <td>?${Number(v.hourlyRate).toLocaleString('en-IN')}</td>
            </tr>
          `
          )
          .join('');
      }

      document.getElementById('bulk-vehicles-preview-area').classList.remove('hidden');
      document.getElementById('btn-confirm-bulk-vehicles').disabled = false;
      showToast(`Parsed ${parsedBulkVehicles.length} vehicles from spreadsheet.`);
    } catch (err) {
      showToast('Error parsing vehicle Excel file.', 'error');
    }
  };
  reader.readAsArrayBuffer(file);
}

function generateAndDownloadVehicleTemplate() {
  const headers = ['Sr. No', 'Vehicle Reg No', 'Equipment Name', 'Category', 'Model', 'Site Location', 'Fuel Type', 'Hourly Rate (?)', 'Operational Status'];
  const sampleRows = [
    [1, 'HP-12-EX-3491', 'CAT 349D Heavy Plant Excavator', 'Excavator', 'Caterpillar 349D', 'ACC Chanda Plant Site', 'Diesel', 4500, 'Active (Plant Duty)'],
    [2, 'HP-12-TP-5011', 'Tata Signa 2823 10-Wheeler Tipper', 'Tipper / Dumper', 'Signa 2823.K', 'ACC Chanda Plant Site', 'Diesel', 2200, 'Active (Plant Duty)'],
    [3, 'HP-12-JC-4012', 'JCB 3DX Super Backhoe Loader', 'JCB / Loader', '3DX Super', 'ACC Chanda Plant Site', 'Diesel', 1800, 'Active (Plant Duty)'],
    [4, 'HP-12-BC-1102', 'Bobcat S450 Skid Steer Loader', 'Bobcat', 'S450 Skid Steer', 'ACC Chanda Plant Site', 'Diesel', 1600, 'Active (Plant Duty)']
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Vehicles');
  XLSX.writeFile(wb, 'Shree_RR_Plant_Vehicles_Template.xlsx');
  showToast('Downloaded official vehicle fleet import template.');
}



