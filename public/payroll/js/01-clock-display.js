// 1. Clock Display
function initClock() {
  const clockEl = document.getElementById('live-clock-display');
  const update = () => {
    const now = new Date();
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    }
  };
  update();
  setInterval(update, 1000);
}

