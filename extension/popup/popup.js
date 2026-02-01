// popup.js
document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('app-list');
  const refreshBtn = document.getElementById('refresh');

  function loadApps() {
    list.innerHTML = ''; // Clear first
    chrome.storage.sync.get({ applications: [] }, (result) => {
      const apps = result.applications || [];
      if (apps.length === 0) {
        list.innerHTML = '<li>No applications saved yet.</li>';
      } else {
        // In popup.js, inside the loop where you create list items
        apps.forEach(app => {
            const li = document.createElement('li');

            // Convert UTC ISO string to local time (will use user's system timezone = IST)
            const localDate = new Date(app.date).toLocaleString('en-IN', {
                dateStyle: 'medium',    // 1 Feb 2026
                timeStyle: 'short'      // 4:35 am
            });

            li.textContent = `${app.company} - ${app.role} (${app.status}) • ${localDate}`;
            list.appendChild(li);
        });
      }
    });
  }

  loadApps();
  refreshBtn.addEventListener('click', loadApps);
});