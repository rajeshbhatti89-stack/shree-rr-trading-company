// 24. Utilities
function openModal(id) {
  const m = document.getElementById(id);
  if (m) {
    m.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  if (!id) {
    document.querySelectorAll('.modal-backdrop:not(.hidden)').forEach(m => m.classList.add('hidden'));
    document.body.style.overflow = '';
    return;
  }
  const m = document.getElementById(id);
  if (m) {
    m.classList.add('hidden');
  }
  // If no other modal is open, restore overflow
  const openModals = document.querySelectorAll('.modal-backdrop:not(.hidden)');
  if (openModals.length === 0) {
    document.body.style.overflow = '';
  }
}

// Global dismiss listeners: Backdrop Click & ESC Key
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    if (e.target && e.target.classList && e.target.classList.contains('modal-backdrop')) {
      closeModal(e.target.id);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      const openModals = document.querySelectorAll('.modal-backdrop:not(.hidden)');
      if (openModals.length > 0) {
        closeModal(openModals[openModals.length - 1].id);
      }
    }
  });
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 4000);
}

function escapeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return '₹' + Math.round(num).toLocaleString('en-IN');
}

function numberToWordsIndian(num) {
  if (!num || isNaN(num)) return 'Zero';
  num = Math.floor(Math.abs(num));
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n) {
    if (n === 0) return '';
    let str = '';
    if (Math.floor(n / 10000000) > 0) {
      str += inWords(Math.floor(n / 10000000)) + 'Crore ';
      n %= 10000000;
    }
    if (Math.floor(n / 100000) > 0) {
      str += inWords(Math.floor(n / 100000)) + 'Lakh ';
      n %= 100000;
    }
    if (Math.floor(n / 1000) > 0) {
      str += inWords(Math.floor(n / 1000)) + 'Thousand ';
      n %= 1000;
    }
    if (Math.floor(n / 100) > 0) {
      str += inWords(Math.floor(n / 100)) + 'Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (n < 20) {
        str += a[n];
      } else {
        str += b[Math.floor(n / 10)] + (n % 10 > 0 ? ' ' + a[n % 10] : ' ');
      }
    }
    return str;
  }

  const result = inWords(num).trim();
  return result ? result + ' Only' : 'Zero Only';
}

// Window global assignments to ensure universal accessibility
window.openModal = openModal;
window.closeModal = closeModal;
window.showToast = showToast;
window.escapeHtml = escapeHtml;
window.formatCurrency = formatCurrency;
window.numberToWordsIndian = numberToWordsIndian;
