// launcher.js - JobSync Launcher Popup

document.addEventListener('DOMContentLoaded', () => {
  const openButton = document.getElementById('openDashboard');

  openButton.addEventListener('click', () => {
    const dashboardUrl = 'https://job-sync-radhika-bhasins-projects.vercel.app/'; // Change to deployed URL later

    chrome.tabs.create({ url: dashboardUrl }, (tab) => {
      if (chrome.runtime.lastError) {
        console.error("Tab create failed:", chrome.runtime.lastError.message);
        alert("Couldn't open dashboard. Make sure Vite is running (npm run dev) and try again.");
        return;
      }

      console.log("Dashboard opened in tab:", tab.id);
    });
  });
});