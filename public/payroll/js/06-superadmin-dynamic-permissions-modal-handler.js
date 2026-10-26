// 6. Superadmin Dynamic Permissions Modal Handler
function openUserAccessModal(userId) {
  const user = allUsers.find((u) => u.id === userId || u.empId === userId);
  if (!user) return;

  document.getElementById('access-user-id').value = user.id || user.empId;
  document.getElementById('access-user-name').textContent = user.name;
  document.getElementById('access-user-sub').textContent = `Emp ID: ${user.empId} | Trade: ${user.designation || user.rank || 'Staff'} | Site: ${user.location || 'ACC Chanda'}`;
  document.getElementById('access-user-role').value = user.role || 'Worker';
  document.getElementById('access-login-toggle').checked = (user.loginAllowed === true || user.loginEnabled === true);
  document.getElementById('access-user-password').value = user.password || `${user.empId}@123`;

  const perms = user.permissions || {};
  document.getElementById('perm-manage-users').checked = perms['hr.users.manage'] === true;
  document.getElementById('perm-mark-muster').checked = perms['attendance.muster.mark'] === true;
  document.getElementById('perm-manage-fleets').checked = perms['fleets.manage'] === true;
  document.getElementById('perm-view-salary').checked = perms['payroll.salary_structure.view'] === true;
  document.getElementById('perm-manage-payroll').checked = perms['payroll.manage_all'] === true;
  document.getElementById('perm-export-reports').checked = perms['reports.bank_deposit.export'] === true;
  document.getElementById('perm-appointment-letters').checked = perms['hr.appointment_letter.generate'] === true;
  document.getElementById('perm-field-expenses').checked = perms['expenses.field_claims.process'] === true;

  openModal('modal-user-access');
}

