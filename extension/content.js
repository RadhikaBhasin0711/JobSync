// content.js - JobSync Extension

console.log("[JobSync] content.js loaded successfully");

function isJobPage() {
  const url = window.location.href.toLowerCase();
  const title = document.title.toLowerCase();

  // Basic URL + title checks for job-related pages
  const jobIndicators = [
    /\/jobs\//, /\/viewjob/, /\/careers\//, /\/jobs/, /\/apply/, /\/job\//,
    /software engineer/i, /developer/i, /intern/i, /sde/i, /engineer/i
  ];

  const hasJobKeyword = jobIndicators.some(regex => regex.test(url) || regex.test(title));

  // DOM check for common job page elements
  const hasJobElements = !!document.querySelector(
    'h1, [class*="title" i], [class*="job" i], [data-test-id*="job"], .jobs-unified-top-card'
  );

  return hasJobKeyword || hasJobElements;
}

function extractJobData() {
  console.log("[JobSync] Starting extraction...");

  const data = {
    company: "Unknown Company",
    role: "Unknown Role",
    link: window.location.href,
    date: new Date().toISOString(),
    platform: "Other",
    status: "Applied",
    notes: ""
  };

  const url = window.location.href;

  // Platform detection
  if (url.includes("linkedin.com")) data.platform = "LinkedIn";
  else if (url.includes("indeed.com")) data.platform = "Indeed";

  // ── Role / Job Title ────────────────────────────────────────────────
  const titleSelectors = [
    'h1.jobs-unified-top-card__job-title',                // Most common 2025-2026
    'h1.top-card-layout__title',                          // Variant
    '[data-test-id="job-title"]',                         // Data attr
    '.job-details-jobs-unified-top-card__job-title h1',   // Nested
    'h1.t-24.t-bold',                                     // Style-based fallback
    'h1'                                                  // Ultimate fallback
  ];

  let roleEl = null;
  for (const sel of titleSelectors) {
    roleEl = document.querySelector(sel);
    if (roleEl && roleEl.textContent.trim()) {
      console.log(`[JobSync] Found role with selector: ${sel}`);
      break;
    }
  }

  if (roleEl) {
    data.role = roleEl.textContent.trim().replace(/\s+/g, ' ');  // Clean extra spaces
  } else {
    // Fallback to document.title (e.g., "Software Engineer - Valzo Soft Solutions | LinkedIn")
    const titleFromPage = document.title.split(' - ')[0]?.trim() || document.title.split('|')[0]?.trim();
    if (titleFromPage) {
      data.role = titleFromPage;
      console.log("[JobSync] Role from document.title fallback:", data.role);
    }
  }

  // ── Company Name ────────────────────────────────────────────────────
  const companySelectors = [
    '.job-details-jobs-unified-top-card__company-name a',                  // Exact match from your screenshot
    '.jobs-unified-top-card__company-name a',                              // Without "job-details-" prefix (fallback)
    'div.job-details-jobs-unified-top-card__company-name a',               // Full container + link
    'a[aria-label*="logo"]',                                               // Uses aria-label containing "logo" (very stable)
    'a[data-tracking-control-name*="topcard-org-name"]',                  // Tracking attr (often reliable)
    'a[data-tracking-control-name*="public_jobs_topcard-org-name"]',      // Variant
    '.jobs-unified-top-card__company-name span',                           // If in span
    '.topcard__org-name-link'                                              // Older fallback
  ];

  let companyEl = null;
  for (const sel of companySelectors) {
    companyEl = document.querySelector(sel);
    if (companyEl && companyEl.textContent.trim()) {
      console.log(`[JobSync] Found company with selector: ${sel} → ${companyEl.textContent.trim()}`);
      break;
    }
  }

  if (companyEl) {
    data.company = companyEl.textContent.trim().replace(/\s+/g, ' ');
  } else {
    console.log("[JobSync] No direct selector matched – fallback to title or aria");

    // Fallback 1: aria-label on logo link often has "CompanyName logo"
    const logoLink = document.querySelector('a[aria-label*="logo"]');
    if (logoLink) {
      const aria = logoLink.getAttribute('aria-label') || '';
      const companyFromAria = aria.replace(/ logo$/i, '').trim();
      if (companyFromAria && companyFromAria !== 'logo') {
        data.company = companyFromAria;
        console.log("[JobSync] Company from aria-label:", data.company);
      }
    }

    // Fallback 2: Parse document.title (e.g., "FULL STACK DEVELOPER - Wipro | LinkedIn")
    if (data.company === "Unknown Company" && document.title.includes(" - ")) {
      const parts = document.title.split(" - ");
      if (parts.length >= 2) {
        let potential = parts[1].split(" | ")[0]?.trim();
        if (potential && !potential.includes("LinkedIn") && potential.length > 2) {
          data.company = potential;
          console.log("[JobSync] Company from document.title:", data.company);
        }
      }
    }
  }

  console.log("[JobSync] Extraction complete:", data);
  return data;
}

// ── Main logic: detect page & inject button ─────────────────────────────
if (isJobPage()) {
  console.log("[JobSync] Job page detected → injecting Save button");

  const btn = document.createElement("button");
  btn.innerText = "Save Application";
  btn.style.position = "fixed";
  btn.style.bottom = "30px";
  btn.style.right = "30px";
  btn.style.zIndex = "99999";
  btn.style.padding = "14px 24px";
  btn.style.background = "#0a66c2";
  btn.style.color = "white";
  btn.style.border = "none";
  btn.style.borderRadius = "8px";
  btn.style.fontSize = "16px";
  btn.style.fontWeight = "600";
  btn.style.cursor = "pointer";
  btn.style.boxShadow = "0 4px 14px rgba(0,0,0,0.25)";
  btn.style.transition = "all 0.2s";

  btn.onmouseover = () => { btn.style.background = "#084c9e"; };
  btn.onmouseout  = () => { btn.style.background = "#0a66c2"; };

  btn.onclick = () => {
    console.log("[JobSync] Save button clicked!");

    // Critical check: is the extension context still valid?
    if (!chrome?.runtime?.id) {
      console.error("[JobSync] Extension context invalidated - reload page needed");
      alert("Extension was updated or reloaded. Please refresh this page (Ctrl+R) and try saving again.");
      return;
    }

    try {
      const jobData = extractJobData();

      chrome.storage.sync.get({ applications: [] }, (result) => {
        if (chrome.runtime.lastError) {
          console.error("[JobSync] Storage get failed:", chrome.runtime.lastError.message);
          alert("Storage access failed. Refresh page and try again.");
          return;
        }

        console.log("[JobSync] Current storage:", result);

        const apps = result.applications || [];

        // Duplicate check
        const exists = apps.some(app => app.link === jobData.link);
        if (exists) {
          console.log("[JobSync] Duplicate found");
          alert("This application is already saved!");
          return;
        }

        // Ask for status
        const status = prompt("Set initial status:", "Applied") || "Applied";
        jobData.status = status;

        const updatedApps = [...apps, jobData];
        console.log("[JobSync] Saving new list with", updatedApps.length, "applications");

        chrome.storage.sync.set({ applications: updatedApps }, () => {
          if (chrome.runtime.lastError) {
            console.error("[JobSync] Storage set failed:", chrome.runtime.lastError.message);
            alert("Failed to save. Check console.");
            return;
          }

          console.log("[JobSync] Save successful!");
          alert(`Saved!\n${jobData.role} at ${jobData.company}\nStatus: ${status}`);
        });
      });

    } catch (err) {
      console.error("[JobSync] Error during save:", err);
      console.error("[JobSync] Stack:", err.stack);
      alert("Error saving application. Check console (F12) for details.");
    }
  };

  document.body.appendChild(btn);
  console.log("[JobSync] Floating button added to page");
} else {
  console.log("[JobSync] Not a job page – no button added");
}