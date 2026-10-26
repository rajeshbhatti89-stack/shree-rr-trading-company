/**
 * SHREE RR TRADING COMPANY - ENTERPRISE OPERATIONS, PAYROLL, VEHICLE AVAILABILITY & MTTR SUITE
 * Features:
 * 1. Vehicle Fleet Management & Bulk Upload (Excel/CSV)
 * 2. Delete All Vehicles option
 * 3. Vehicle Availability & Breakdown (B/D in Hours) Engine
 * 4. Automatic MTTR (Mean Time To Repair) & MTBF Reliability Calculator
 * 5. 1-Click Excel Exporters (MTTR Report, Tomorrow Schedule, Monthly Payroll, Bank NEFT)
 * 6. Attendance Glass View & Leave Balance Tracker
 * 7. Superadmin Role-Based Access Control (RBAC) & Feature Matrix
 */

// Global State
var currentUser = null;
var allUsers = [];
var allVehicles = [];
var allVehicleLogs = [];
var allAttendance = [];
var allRosters = [];
var allLeaves = [];
var allSalarySlips = [];
var parsedBulkEmployees = [];
var parsedBulkVehicles = [];
var currentActiveSlip = null;
var allInventory = [];
var allJobCards = [];
var allChallans = [];
var allVehiclePartConsumptions = [];
var currentActiveChallan = null;
var currentActiveJobCard = null;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initNavigation();
  initMobileSidebar();
  initAuth();
  initEventListeners();
  checkExistingSession();
  initOpeningWelcomePopup();
  initLeaveManagement();
  if (typeof initVehicleSubNav === 'function') initVehicleSubNav();
  if (typeof initInventoryManagement === 'function') initInventoryManagement();
  if (typeof initJobCardsManagement === 'function') initJobCardsManagement();
  if (typeof initChallansManagement === 'function') initChallansManagement();
  if (typeof initVehicleConsumptionAnalytics === 'function') initVehicleConsumptionAnalytics();
});

