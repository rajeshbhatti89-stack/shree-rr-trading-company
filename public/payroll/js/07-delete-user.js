// 7. Delete User
async function deleteUser(userId, userName) {
  if (!confirm(`Are you sure you want to remove "${userName}" from the organisation?\nThis will permanently delete their employee record.`)) {
    return;
  }

  try {
    const res = await fetch(`/api/payroll/users/${userId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast(`Employee "${userName}" removed successfully.`);
      allUsers = allUsers.filter((u) => u.id !== userId && u.empId !== userId);
      renderUsersTable();
      renderMusterRollTable();
      renderTomorrowScheduleTable();
      renderAttendanceGlassCards();
      updateDashboardMetrics();
    }
  } catch (err) {
    allUsers = allUsers.filter((u) => u.id !== userId && u.empId !== userId);
    renderUsersTable();
    updateDashboardMetrics();
  }
}

