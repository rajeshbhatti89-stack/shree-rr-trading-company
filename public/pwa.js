/**
 * SHREE RR TRADING COMPANY - PWA INSTALL & SERVICE WORKER CONTROLLER
 * Cross-platform PWA engine for Desktop (Windows/Mac/Linux), Laptop, Android & iOS
 */

let deferredInstallPrompt = null;

// 1. Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const isPayrollPortal = window.location.pathname.startsWith('/payroll');
    const swPath = isPayrollPortal ? '/payroll/sw.js' : '/sw.js';
    const swScope = isPayrollPortal ? '/payroll/' : '/';

    navigator.serviceWorker
      .register(swPath, { scope: swScope })
      .then((reg) => {
        console.log('✅ PWA Service Worker Registered. Scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('PWA Service Worker registration warning:', err);
      });
  });
}

// 2. Capture 'beforeinstallprompt' Event (Desktop / Laptop / Android)
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  console.log('💡 PWA Install Prompt captured');

  // Reveal all install buttons on page
  document.querySelectorAll('.btn-install-pwa').forEach((btn) => {
    btn.style.display = 'inline-flex';
    btn.classList.remove('hidden');
  });

  // Show floating install banner if not dismissed previously
  showPwaFloatingBanner();
});

// 3. Track App Installed
window.addEventListener('appinstalled', () => {
  console.log('🎉 PWA Successfully Installed!');
  deferredInstallPrompt = null;
  hidePwaFloatingBanner();
  showPwaToast('✅ App Installed successfully! Launch it anytime from your desktop or home screen.');
});

// 4. Trigger Install Flow
async function triggerPwaInstall() {
  if (deferredInstallPrompt) {
    try {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      console.log('PWA User Choice:', choice.outcome);
      if (choice.outcome === 'accepted') {
        showPwaToast('Installing Shree RR Trading app...');
      }
      deferredInstallPrompt = null;
      hidePwaFloatingBanner();
    } catch (err) {
      console.error('Install prompt error:', err);
    }
  } else if (isIosSafari()) {
    showIosInstallModal();
  } else if (isPwaStandalone()) {
    showPwaToast('App is already installed and running in standalone mode!');
  } else {
    showPwaToast('To install: click the Install icon (💻/⬇️) in your browser address bar or menu.');
  }
}

// 5. Standalone Detection
function isPwaStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

// 6. iOS Device Detection
function isIosSafari() {
  const ua = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isIos && isSafari && !isPwaStandalone();
}

// 7. Floating Install Banner UI
function showPwaFloatingBanner() {
  if (isPwaStandalone()) return;
  const dismissed = sessionStorage.getItem('srr_pwa_banner_dismissed');
  if (dismissed) return;

  let banner = document.getElementById('pwa-install-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.className = 'pwa-install-banner';
    banner.innerHTML = `
      <div class="pwa-banner-content">
        <img src="/images/pwa-icon-192.png" alt="Shree RR Trading" class="pwa-banner-icon">
        <div class="pwa-banner-text">
          <strong>Install Shree RR Trading App</strong>
          <span>Fast, offline-ready desktop & mobile app experience</span>
        </div>
      </div>
      <div class="pwa-banner-actions">
        <button type="button" class="btn btn-primary btn-sm" onclick="triggerPwaInstall()">
          <i class="fa-solid fa-download"></i> Install Now
        </button>
        <button type="button" class="btn-close-pwa-banner" onclick="hidePwaFloatingBanner(true)" aria-label="Dismiss">&times;</button>
      </div>
    `;
    document.body.appendChild(banner);
  }

  setTimeout(() => {
    if (banner) banner.classList.add('active');
  }, 1200);
}

function hidePwaFloatingBanner(permanentlyInSession = false) {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.classList.remove('active');
    setTimeout(() => banner.remove(), 400);
  }
  if (permanentlyInSession) {
    sessionStorage.setItem('srr_pwa_banner_dismissed', 'true');
  }
}

// 8. iOS Safari Add-To-Home-Screen Instructions Modal
function showIosInstallModal() {
  let modal = document.getElementById('modal-ios-install');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-ios-install';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-dialog peach-glass" style="max-width: 440px; text-align: center; padding: 24px;">
        <div style="font-size: 40px; color: var(--logo-orange); margin-bottom: 10px;">
          <i class="fa-brands fa-apple"></i>
        </div>
        <h3 style="font-size: 18px; font-weight: 800; color: var(--logo-navy); margin-bottom: 8px;">Install on iPhone / iPad</h3>
        <p style="font-size: 13px; color: #475569; line-height: 1.5; margin-bottom: 18px;">
          Install Shree RR Trading Company directly onto your iOS home screen for instant full-screen access.
        </p>
        <div style="background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 8px; padding: 12px; text-align: left; font-size: 13px; color: #1E293B; display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="background: var(--logo-orange); color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">1</span>
            <span>Tap the <strong>Share</strong> icon <i class="fa-solid fa-arrow-up-from-bracket text-primary"></i> at the bottom of Safari.</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="background: var(--logo-orange); color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">2</span>
            <span>Scroll down and tap <strong>Add to Home Screen</strong> <i class="fa-regular fa-square-plus text-success"></i>.</span>
          </div>
        </div>
        <button type="button" class="btn btn-primary w-100" onclick="document.getElementById('modal-ios-install').remove()">
          Got It
        </button>
      </div>
    `;
    document.body.appendChild(modal);
  }
}

// 9. Online / Offline Connectivity Notifications
window.addEventListener('online', () => {
  showPwaToast('🌐 Back online! Live data synchronizing.', 'success');
  document.body.classList.remove('is-offline');
});

window.addEventListener('offline', () => {
  showPwaToast('📡 You are offline. Running on local cached data.', 'warning');
  document.body.classList.add('is-offline');
});

// 10. General PWA Toast Helper
function showPwaToast(msg, type = 'success') {
  let toast = document.getElementById('pwa-global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'pwa-global-toast';
    toast.className = 'pwa-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `pwa-toast pwa-toast-${type} active`;
  setTimeout(() => {
    toast.classList.remove('active');
  }, 4000);
}

// Global Exports
window.triggerPwaInstall = triggerPwaInstall;
window.hidePwaFloatingBanner = hidePwaFloatingBanner;
