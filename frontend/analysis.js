const API_BASE_URL = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", () => {
  const filterDevice = document.getElementById("filter-device");
  const filterFrom = document.getElementById("filter-from");
  const filterTo = document.getElementById("filter-to");
  const btnApplyFilters = document.getElementById("btn-apply-filters");
  const btnRefreshStats = document.getElementById("btn-refresh-stats");
  const btnExportCsv = document.getElementById("btn-export-csv");
  const tbodyAnalysis = document.getElementById("tbody-analysis");
  const btnGoogleSignup = document.getElementById("btn-google-signup");

  if (btnGoogleSignup) {
    btnGoogleSignup.addEventListener("click", () => {
      alert("Google sign up is not fully wired yet – connect to backend OAuth endpoint here.");
    });
  }

  // initial load
  loadAnalysis();

  // 7) BUTTONS UNDER ANALYSIS
  if (btnApplyFilters) {
    btnApplyFilters.addEventListener("click", () => {
      loadAnalysis();
    });
  }

  if (btnRefreshStats) {
    btnRefreshStats.addEventListener("click", () => {
      loadAnalysis();
    });
  }

  if (btnExportCsv) {
    btnExportCsv.addEventListener("click", async () => {
      // Simple client-side CSV export
      const rows = Array.from(tbodyAnalysis.querySelectorAll("tr")).map((tr) =>
        Array.from(tr.querySelectorAll("td")).map((td) => `"${(td.textContent || "").trim()}"`)
      );
      if (!rows.length) {
        alert("No data to export.");
        return;
      }
      const csvContent = "Link,Device,Date,Clicks\n" + rows.map((r) => r.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "linkhub-analysis.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  async function loadAnalysis() {
    const params = new URLSearchParams();

    if (filterDevice.value) params.append("deviceType", filterDevice.value);
    if (filterFrom.value) params.append("from", filterFrom.value);
    if (filterTo.value) params.append("to", filterTo.value);

    try {
      const res = await fetch(`${API_BASE_URL}/api/links/analytics?` + params.toString());
      if (!res.ok) throw new Error("Failed to load analytics");
      const data = await res.json();

      tbodyAnalysis.innerHTML = "";

      data.items.forEach((item) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${item.title || item.url || "-"}</td>
          <td>${item.deviceType || "-"}</td>
          <td>${item.date ? new Date(item.date).toLocaleDateString() : "-"}</td>
          <td>${item.clicks ?? 0}</td>
        `;
        tbodyAnalysis.appendChild(tr);
      });
    } catch (err) {
      console.error(err);
      tbodyAnalysis.innerHTML = "<tr><td colspan='4'>Could not load analytics.</td></tr>";
    }
  }
});
