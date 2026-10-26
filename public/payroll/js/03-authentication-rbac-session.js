// 3. Authentication & RBAC Session
function initAuth() {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value.trim();
      const btn = document.getElementById('login-btn');

      try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';

        const res = await fetch('/api/payroll/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (data.success) {
          currentUser = data.user;
          sessionStorage.setItem('srr_payroll_user', JSON.stringify(currentUser));
          showPortal();
          showToast(`Welcome, ${currentUser.name}!`);

          if (currentUser.mustChangePassword) {
            promptFirstLoginPasswordChange();
          }
        } else {
          showToast(data.message || 'Invalid credentials. Please verify your login details.', 'error');
        }
      } catch (err) {
        console.error('Login error:', err);
        showToast('Login request failed. Check network connection.', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Sign In to Portal';
      }
    });
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('srr_payroll_user');
      currentUser = null;
      document.getElementById('app-container').classList.add('hidden');
      document.getElementById('login-container').classList.remove('hidden');
      document.getElementById('login-form').reset();
      showToast('Signed out successfully.');
    });
  }
}

function checkExistingSession() {
  const saved = sessionStorage.getItem('srr_payroll_user');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      showPortal();
    } catch (e) {
      sessionStorage.removeItem('srr_payroll_user');
    }
  }
}

function showPortal() {
  document.getElementById('login-container').classList.add('hidden');
  document.getElementById('app-container').classList.remove('hidden');

  if (currentUser) {
    document.getElementById('user-display-name').textContent = currentUser.name || 'Super Admin';
    document.getElementById('user-display-role').textContent = currentUser.role || 'Administrator';
    const initials = (currentUser.name || 'SA')
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    document.getElementById('user-avatar').textContent = initials;

    applyDynamicRBACPermissions();
  }

  loadAllData();
}

function applyDynamicRBACPermissions() {
  if (!currentUser) return;
  const isSuper = currentUser.role === 'Super Admin';
  const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'Super Admin';
  const perms = currentUser.permissions || {};

  const checkPerm = (permKey) => {
    if (isAdmin || isSuper || perms['*'] === true) return true;
    return perms[permKey] === true;
  };

  const isHO = currentUser.site && (currentUser.site === 'Headquarters / All Sites' || currentUser.site.toUpperCase() === 'HO');
  const canManageUsers = isAdmin || isHO || (perms['hr.users.manage'] === true);
  
  const toggleVisibility = (elementId, isVisible) => {
    const el = document.getElementById(elementId);
    if (el) {
      if (isVisible) el.classList.remove('hidden');
      else el.classList.add('hidden');
    }
  };

  toggleVisibility('nav-users', canManageUsers);
  
  const canGenerateLetters = isAdmin || isHO || (perms['hr.appointment_letter.generate'] === true);
  toggleVisibility('nav-letters', canGenerateLetters);
  toggleVisibility('btn-top-hr-letter', canGenerateLetters);
  toggleVisibility('btn-users-hr-letter', canGenerateLetters);

  toggleVisibility('btn-open-credit-leave-modal', canManageUsers);
  toggleVisibility('btn-open-leave-modal', canManageUsers);
  toggleVisibility('btn-open-leave-history-modal', canManageUsers);
  toggleVisibility('nav-attendance-glass', canManageUsers);
  toggleVisibility('dash-btn-leaves', canManageUsers);

  toggleVisibility('nav-vehicles', checkPerm('fleets.manage'));
  toggleVisibility('nav-compliance', checkPerm('fleets.manage') || checkPerm('compliance.manage'));
  toggleVisibility('nav-muster', checkPerm('attendance.muster.mark'));
  toggleVisibility('nav-tomorrow', checkPerm('attendance.muster.mark') || checkPerm('fleets.manage'));
  toggleVisibility('nav-payroll', checkPerm('payroll.salary_structure.view') || checkPerm('payroll.manage_all'));
  toggleVisibility('nav-reports', checkPerm('reports.bank_deposit.export'));
}

function promptFirstLoginPasswordChange() {
  const newPwd = prompt(`Security Notice: You are logging in with a temporary password.\nPlease enter your new permanent password:`);
  if (!newPwd || newPwd.length < 6) {
    alert('Password must be at least 6 characters. Please change it from your profile.');
    return;
  }

  fetch('/api/payroll/auth/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: currentUser.id || currentUser.empId, newPassword: newPwd })
  })
    .then((r) => r.json())
    .then((data) => {
      if (data.success) {
        showToast('Permanent password saved successfully.');
        currentUser.mustChangePassword = false;
        sessionStorage.setItem('srr_payroll_user', JSON.stringify(currentUser));
      }
    })
    .catch(() => {});
}

