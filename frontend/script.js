const API_BASE = 'http://localhost:3000/api';
let currentHubId = localStorage.getItem('hubId') || 'hub_' + Date.now();
let qrCodeInstance = null;
let visitsChart = null, clicksChart = null;
let isLoggedIn = false;

document.addEventListener('DOMContentLoaded', async () => {
  localStorage.setItem('hubId', currentHubId);
  const urlDisplay = document.getElementById('publicUrl');
  if (urlDisplay) urlDisplay.textContent = `https://smart-link-hub.vercel.app/hub/${currentHubId}`;
  
  await loadData();
  setInterval(loadData, 5000);
});

async function loadData() {
  const links = JSON.parse(localStorage.getItem('links_' + currentHubId) || '[]');
  const rules = JSON.parse(localStorage.getItem('rules_' + currentHubId) || '[]');
  const stats = JSON.parse(localStorage.getItem('stats_' + currentHubId) || '{"totalClicks":0,"totalVisits":0}');
  const quickLinks = JSON.parse(localStorage.getItem('quickLinks_' + currentHubId) || '[]');

  renderLinks(links);
  renderRules(rules);
  renderQuickLinks(quickLinks);
  updateAnalytics(stats);
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  const tab = document.getElementById(tabName + 'Tab');
  const content = document.getElementById(tabName + 'Tab-content');
  
  if (tab) tab.classList.add('active');
  if (content) content.classList.add('active');
  
  if (tabName === 'analytics') {
    setTimeout(renderAllCharts, 100);
  }
}

function renderAllCharts() {
  const ctx1 = document.getElementById('visitsChart');
  const ctx2 = document.getElementById('clicksChart');
  if (!ctx1 || !ctx2) return;

  if (visitsChart) visitsChart.destroy();
  if (clicksChart) clicksChart.destroy();

  const chartConfig = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: { legend: { display: false } },
    scales: { x: { display: false }, y: { display: false } }
  };

  visitsChart = new Chart(ctx1, {
    type: 'line',
    data: {
      labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      datasets: [{
        label: 'Visits',
        data: [10, 20, 15, 30, 25, 40, 35],
        borderColor: '#00ff41',
        backgroundColor: 'rgba(0,255,65,0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: chartConfig
  });

  clicksChart = new Chart(ctx2, {
    type: 'line',
    data: {
      labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      datasets: [{
        label: 'Clicks',
        data: [8, 15, 12, 25, 20, 35, 30],
        borderColor: '#00ff41',
        backgroundColor: 'rgba(0,255,65,0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: chartConfig
  });
}

function toggleAuth() {
  if (isLoggedIn) {
    isLoggedIn = false;
    localStorage.removeItem('userLoggedIn');
    document.getElementById('authBtn').textContent = 'Login';
    alert('✅ Logged out successfully');
  } else {
    showLoginModal();
  }
}

function showLoginModal() {
  const html = `
    <div id="authModal" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:1000;">
      <div style="background:#1a1a1a;border:2px solid #00ff41;border-radius:8px;padding:30px;text-align:center;color:#fff;">
        <h2>Login with</h2>
        <button onclick="loginWith('Google')" style="background:#00ff41;color:#000;border:none;padding:10px 20px;margin:10px;border-radius:4px;cursor:pointer;font-weight:bold;">🔐 Google</button>
        <button onclick="loginWith('GitHub')" style="background:#00ff41;color:#000;border:none;padding:10px 20px;margin:10px;border-radius:4px;cursor:pointer;font-weight:bold;">🐙 GitHub</button>
        <button onclick="closeModal()" style="background:#666;color:#fff;border:none;padding:10px 20px;margin:10px;border-radius:4px;cursor:pointer;">Cancel</button>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

function loginWith(provider) {
  isLoggedIn = true;
  localStorage.setItem('userLoggedIn', 'true');
  alert('✅ Logged in with ' + provider);
  closeModal();
  document.getElementById('authBtn').textContent = '👤 Logout';
}

function closeModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.remove();
}

function generateQRCode() {
  const url = document.getElementById('publicUrl').textContent;
  const container = document.getElementById('qrCodeContainer');
  const btn = document.getElementById('genQRBtn');
  const downloadBtn = document.getElementById('downloadQRBtn');

  if (container.style.display === 'block') {
    container.style.display = 'none';
    container.innerHTML = '';
    if (btn) btn.textContent = 'Generate QR Code';
    if (downloadBtn) downloadBtn.style.display = 'none';
    return;
  }

  container.innerHTML = '';
  qrCodeInstance = new QRCode(container, { text: url, width: 200, height: 200 });
  container.style.display = 'block';
  if (btn) btn.textContent = 'Close QR Code';
  if (downloadBtn) downloadBtn.style.display = 'block';
}

function downloadQRCode() {
  const canvas = document.querySelector('#qrCodeContainer canvas');
  if (canvas) {
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = 'qrcode.png';
    link.click();
  }
}

function copyUrl() {
  const url = document.getElementById('publicUrl').textContent;
  navigator.clipboard.writeText(url).then(() => {
    alert('✅ URL copied to clipboard!');
  });
}

function showRuleOptions() {
  const type = document.getElementById('ruleType').value;
  document.getElementById('deviceTypeDiv').style.display = type === 'device' ? 'block' : 'none';
  document.getElementById('locationDiv').style.display = type === 'location' ? 'block' : 'none';
  document.getElementById('timeDiv').style.display = type === 'time' ? 'block' : 'none';
}

function addRule() {
  const type = document.getElementById('ruleType').value;
  if (!type) return alert('Select rule type');
  
  let value = '';
  if (type === 'device') value = document.getElementById('deviceType').value;
  if (type === 'location') value = document.getElementById('locationInput').value;
  if (type === 'time') value = `${document.getElementById('startTime').value}-${document.getElementById('endTime').value}`;
  
  const rules = JSON.parse(localStorage.getItem('rules_' + currentHubId) || '[]');
  rules.push({ id: Date.now(), type, value });
  localStorage.setItem('rules_' + currentHubId, JSON.stringify(rules));
  loadData();
}

function renderRules(rules) {
  const container = document.getElementById('rulesList');
  if (!container) return;
  container.innerHTML = rules.length ? '' : '<div class="empty-state">No rules yet</div>';
  rules.forEach(r => {
    const div = document.createElement('div');
    div.style = 'background:#1a1a1a; padding:10px; margin-bottom:5px; border-radius:4px; display:flex; justify-content:space-between; align-items:center;';
    div.innerHTML = `<span>${r.type}: ${r.value}</span> <button onclick="deleteRule(${r.id})" style="background:#ff4444; border:none; color:#fff; padding:5px 10px; border-radius:4px; cursor:pointer;">Delete</button>`;
    container.appendChild(div);
  });
}

function deleteRule(id) {
  let rules = JSON.parse(localStorage.getItem('rules_' + currentHubId) || '[]');
  rules = rules.filter(r => r.id !== id);
  localStorage.setItem('rules_' + currentHubId, JSON.stringify(rules));
  loadData();
}

function renderLinks(links) {
  const container = document.getElementById('linksList');
  if (!container) return;
  container.innerHTML = links.length ? '' : '<div class="empty-state">No links added</div>';
  links.forEach(l => {
    const div = document.createElement('div');
    div.className = 'link-card';
    div.innerHTML = `<div class="link-card-title">${l.title || l.url}</div><div style="font-size:12px; color:#888;">${l.url}</div>`;
    container.appendChild(div);
  });
}

function renderQuickLinks(qls) {
  const container = document.getElementById('quickLinksContainer');
  if (!container) return;
  container.innerHTML = qls.length ? '' : '<div class="empty-state">No quick links yet</div>';
  qls.forEach(q => {
    const div = document.createElement('div');
    div.className = 'quick-link';
    div.innerHTML = `<div class="quick-link-icon">🔗</div><div class="quick-link-name">${q.name}</div>`;
    container.appendChild(div);
  });
}

function addQuickLink() {
  const name = prompt('Enter link name:');
  const url = prompt('Enter URL:');
  if (name && url) {
    const qls = JSON.parse(localStorage.getItem('quickLinks_' + currentHubId) || '[]');
    qls.push({ name, url });
    localStorage.setItem('quickLinks_' + currentHubId, JSON.stringify(qls));
    loadData();
  }
}

function openAddLinkModal() {
  const url = prompt('Enter Destination URL:');
  const title = prompt('Enter Title:');
  if (url) {
    const links = JSON.parse(localStorage.getItem('links_' + currentHubId) || '[]');
    links.push({ url, title });
    localStorage.setItem('links_' + currentHubId, JSON.stringify(links));
    loadData();
  }
}

function updateAnalytics(stats) {
  document.getElementById('statClicks').textContent = stats.totalClicks || 0;
  document.getElementById('statVisits').textContent = stats.totalVisits || 0;
}

function exportReport(format) {
  const data = {
    hubId: currentHubId,
    links: JSON.parse(localStorage.getItem('links_' + currentHubId) || '[]'),
    rules: JSON.parse(localStorage.getItem('rules_' + currentHubId) || '[]'),
    stats: JSON.parse(localStorage.getItem('stats_' + currentHubId) || '{}')
  };
  
  if (format === 'json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics.json';
    a.click();
  } else if (format === 'csv') {
    let csv = 'Type,ID,Value
';
    data.links.forEach(l => csv += `Link,${l.url},${l.title}
`);
    data.rules.forEach(r => csv += `Rule,${r.type},${r.value}
`);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics.csv';
    a.click();
  } else {
    alert('Exporting ' + format + '...');
  }
}

function openSettings() { alert('⚙️ Settings opened'); }
function openUsageStats() { alert('📊 Usage stats opened'); }
function openHelp() { alert('❓ Help opened'); }
