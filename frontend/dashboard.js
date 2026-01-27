// CHANGE THIS TO YOUR REAL BACKEND URL IN PRODUCTION
const API_BASE_URL = "https://advitiya.jpdlab.co.in/api";

document.addEventListener("DOMContentLoaded", () => {
  const statTotalLinks = document.getElementById("stat-total-links");
  const statTodayClicks = document.getElementById("stat-today-clicks");
  const statActiveRules = document.getElementById("stat-active-rules");

  const formAddLink = document.getElementById("form-add-link");
  const inputLinkUrl = document.getElementById("input-link-url");
  const inputLinkTitle = document.getElementById("input-link-title");

  const selectDeviceType = document.getElementById("select-device-type");
  const inputDateFrom = document.getElementById("input-date-from");
  const inputDateTo = document.getElementById("input-date-to");
  const btnSaveRule = document.getElementById("btn-save-rule");

  const tbodyLinks = document.getElementById("tbody-links");
  const btnGoogleSignup = document.getElementById("btn-google-signup");

  // 1) NAVBAR + BASIC DATA LOAD
  loadDashboardStats();
  loadLinks();

  // 6) SIGN UP WITH GOOGLE (FRONTEND PLACEHOLDER)
  if (btnGoogleSignup) {
    btnGoogleSignup.addEventListener("click", () => {
      alert("Google sign up is not fully wired yet – connect to backend OAuth endpoint here.");
      // Example for future:
      // window.location.href = `${API_BASE_URL}/auth/google`;
    });
  }

  // 1) ADD LINK BUTTON WORKING
  if (formAddLink) {
    formAddLink.addEventListener("submit", async (e) => {
      e.preventDefault();

      const payload = {
        url: inputLinkUrl.value.trim(),
        title: inputLinkTitle.value.trim() || null,
      };

      if (!payload.url) {
        alert("Please enter a valid URL.");
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/links`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error("Failed to add link");
        }

        inputLinkUrl.value = "";
        inputLinkTitle.value = "";
        await loadLinks();
        await loadDashboardStats();
      } catch (err) {
        console.error(err);
        alert("Could not add link. Check backend server.");
      }
    });
  }

  // 2) SAVE RULE BUTTON WORKING
  if (btnSaveRule) {
    btnSaveRule.addEventListener("click", async () => {
      const payload = {
        deviceType: selectDeviceType.value || null,
        activeFrom: inputDateFrom.value || null,
        activeTo: inputDateTo.value || null,
      };

      try {
        const res = await fetch(`${API_BASE_URL}/api/rules`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error("Failed to save rule");
        }

        alert("Rule saved successfully.");
        await loadDashboardStats();
      } catch (err) {
        console.error(err);
        alert("Could not save rule. Check backend server.");
      }
    });
  }

  // TABLE ACTION BUTTONS (EDIT / DELETE) – delegate
  if (tbodyLinks) {
    tbodyLinks.addEventListener("click", async (e) => {
      const target = e.target;

      if (target.matches(".btn-delete-link")) {
        const id = target.getAttribute("data-id");
        if (!id) return;

        if (!confirm("Delete this link?")) return;

        try {
          const res = await fetch(`${API_BASE_URL}/api/links/${id}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error("Failed to delete link");
          await loadLinks();
          await loadDashboardStats();
        } catch (err) {
          console.error(err);
          alert("Could not delete link.");
        }
      }

      // Extend here for ".btn-edit-link", etc.
    });
  }

  async function loadDashboardStats() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/links/stats`);
      if (!res.ok) throw new Error("Failed to load stats");
      const data = await res.json();

      statTotalLinks.textContent = data.totalLinks ?? 0;
      statTodayClicks.textContent = data.todayClicks ?? 0;
      statActiveRules.textContent = data.activeRules ?? 0;
    } catch (err) {
      console.error(err);
      // keep defaults
    }
  }

  async function loadLinks() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/links`);
      if (!res.ok) throw new Error("Failed to load links");
      const data = await res.json();

      tbodyLinks.innerHTML = "";

      data.links.forEach((link) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${link.title || "-"}</td>
          <td><a href="${link.url}" target="_blank">${link.url}</a></td>
          <td>${link.deviceType || "-"}</td>
          <td>${formatDateRange(link.activeFrom, link.activeTo)}</td>
          <td>${link.clicks ?? 0}</td>
          <td>
            <button class="btn secondary btn-delete-link" data-id="${link.id}">
              Delete
            </button>
          </td>
        `;
        tbodyLinks.appendChild(tr);
      });
    } catch (err) {
      console.error(err);
      tbodyLinks.innerHTML = "<tr><td colspan='6'>Could not load links.</td></tr>";
    }
  }

  function formatDateRange(from, to) {
    if (!from && !to) return "-";
    const fromText = from ? new Date(from).toLocaleDateString() : "...";
    const toText = to ? new Date(to).toLocaleDateString() : "...";
    return `${fromText} – ${toText}`;
  }

 // 3) TAB NAVIGATION - HOME, ANALYTICS, EXTRA FEATURES
 const btnHome = document.querySelector('button:contains("Home")');
 const btnAnalytics = document.querySelector('button:contains("Analytics")');
 const btnExtraFeatures = document.querySelector('button:contains("Extra Features")');
 const homeTabContent = document.getElementById('homeTab-content');

 // Show home tab by default
 function showTab(tabName) {
 const allTabs = document.querySelectorAll('[id$="-content"]');
 allTabs.forEach(tab => tab.style.display = 'none');
 const targetTab = document.getElementById(tabName + '-content');
 if (targetTab) targetTab.style.display = 'block';
 }

 // Home button handler
 document.querySelectorAll('button').forEach(btn => {
 if (btn.textContent.includes('Home')) {
 btn.addEventListener('click', () => showTab('homeTab'));
 }
 if (btn.textContent.includes('Analytics')) {
 btn.addEventListener('click', () => {
 showTab('analyticsTab');
 alert('Analytics page coming soon!');
 });
 }
 if (btn.textContent.includes('Extra Features')) {
 btn.addEventListener('click', () => alert('Extra features require premium - coming soon!'));
 }
 });

});
