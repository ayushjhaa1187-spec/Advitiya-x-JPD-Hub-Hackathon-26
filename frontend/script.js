// Global variables
let currentHubId = localStorage.getItem('hubId') || 'hub_' + Date.now();
let visitsChart = null, clicksChart = null;
let isLoggedIn = false;
let offlineMode = false;
let darkMode = true;

document.addEventListener('DOMContentLoaded', async () => {
    localStorage.setItem('hubId', currentHubId);
    const urlDisplay = document.getElementById('publicUrl');
    if (urlDisplay) urlDisplay.textContent = 'https://smart-link-hub.vercel.app/hub/${currentHubId}';
    
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
    updateAnalytics(stats, links, rules);
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
    document.getElementById(tabName)?.classList.add('active');
    event.target.classList.add('active');
}

function switchAnalyticsTab(tabName) {
    document.querySelectorAll('.analytics-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.analytics-tab').forEach(el => el.classList.remove('active'));
    document.getElementById(tabName)?.classList.add('active');
    event.target.classList.add('active');
    if (tabName === 'stats') renderTrendChart();
    if (tabName === 'report') renderPerformanceChart();
}

function copyURL() {
    const url = document.getElementById('publicUrl').textContent;
    navigator.clipboard.writeText(url).then(() => alert('URL copied!'));
}

function addNewLink() {
    const url = prompt('Enter link URL:');
    if (!url) return;
    const name = prompt('Enter link name:');
    const links = JSON.parse(localStorage.getItem('links_' + currentHubId) || '[]');
    links.push({ id: Date.now(), name: name || url, url, clicks: 0 });
    localStorage.setItem('links_' + currentHubId, JSON.stringify(links));
    loadData();
}

function addQuickLink() {
    const url = prompt('Enter quick link URL:');
    if (!url) return;
    const quickLinks = JSON.parse(localStorage.getItem('quickLinks_' + currentHubId) || '[]');
    quickLinks.push({ id: Date.now(), url, clicks: 0 });
    localStorage.setItem('quickLinks_' + currentHubId, JSON.stringify(quickLinks));
    loadData();
}

function renderLinks(links) {
    const container = document.getElementById('linksList');
    const msg = document.getElementById('linksMsg');
    if (!links.length) {
        msg.style.display = 'block';
        container.innerHTML = '';
        return;
    }
    msg.style.display = 'none';
    container.innerHTML = links.map(link => `
        <div style="background:#1a1a1a;border:1px solid #00ff41;padding:10px;margin:10px 0;border-radius:5px;display:flex;justify-content:space-between;align-items:center;">
            <div>
                <strong style="color:#00ff41;">${link.name}</strong>
                <p style="font-size:12px;color:#888;">${link.url} - Clicks: ${link.clicks}</p>
            </div>
            <button class="btn" onclick="deleteLink(${link.id})" style="padding:5px 10px;font-size:0.9rem;">Delete</button>
        </div>
    `).join('');
}

function deleteLink(id) {
    if (confirm('Delete this link?')) {
        let links = JSON.parse(localStorage.getItem('links_' + currentHubId) || '[]');
        links = links.filter(l => l.id !== id);
        localStorage.setItem('links_' + currentHubId, JSON.stringify(links));
        loadData();
    }
}

function renderQuickLinks(quickLinks) {
    const container = document.getElementById('quickLinksList');
    const msg = document.getElementById('quickLinksMsg');
    if (!quickLinks.length) {
        msg.style.display = 'block';
        container.innerHTML = '';
        return;
    }
    msg.style.display = 'none';
    container.innerHTML = quickLinks.map(link => `
        <button class="btn" onclick="copyUrl('${link.url}')"> ${link.url.substring(0, 30)}... (${link.clicks} clicks)</button>
    `).join('');
}

function copyUrl(url) {
    navigator.clipboard.writeText(url);
    alert('Quick link copied!');
}

function toggleRuleForm() {
    const form = document.getElementById('addRuleForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function addRule() {
    const ruleType = document.getElementById('ruleType').value;
    if (!ruleType || ruleType === '-- Select Rule Type --') {
        alert('Please select a rule type');
        return;
    }
    const rules = JSON.parse(localStorage.getItem('rules_' + currentHubId) || '[]');
    rules.push({ id: Date.now(), type: ruleType });
    localStorage.setItem('rules_' + currentHubId, JSON.stringify(rules));
    loadData();
}

function renderRules(rules) {
    const container = document.getElementById('rulesList');
    const msg = document.getElementById('rulesMsg');
    if (!rules.length) {
        msg.style.display = 'block';
        container.innerHTML = '';
        return;
    }
    msg.style.display = 'none';
    container.innerHTML = rules.map(rule => `
        <div style="background:#1a1a1a;border:1px solid #00ff41;padding:10px;margin:10px 0;border-radius:5px;display:flex;justify-content:space-between;align-items:center;">
            <strong style="color:#00ff41;">${rule.type} Rule</strong>
            <button class="btn" onclick="deleteRule(${rule.id})" style="padding:5px 10px;font-size:0.9rem;">Delete</button>
        </div>
    `).join('');
}

function deleteRule(id) {
    if (confirm('Delete this rule?')) {
        let rules = JSON.parse(localStorage.getItem('rules_' + currentHubId) || '[]');
        rules = rules.filter(r => r.id !== id);
        localStorage.setItem('rules_' + currentHubId, JSON.stringify(rules));
        loadData();
    }
}

function updateAnalytics(stats, links, rules) {
    document.getElementById('statTotalLinks').textContent = links.length;
    document.getElementById('statTotalClicks').textContent = stats.totalClicks || 0;
    document.getElementById('statRules').textContent = rules.length;
    document.getElementById('statMonth').textContent = Math.floor((stats.totalClicks || 0) * 0.3);
    
    const topLinks = links.sort((a, b) => b.clicks - a.clicks).slice(0, 5);
    const tbody = document.getElementById('topLinksBody');
    tbody.innerHTML = topLinks.length ? topLinks.map(link => `
        <tr>
            <td>${link.name}</td>
            <td>${link.clicks}</td>
            <td>${((link.clicks / (stats.totalClicks || 1)) * 100).toFixed(2)}%</td>
        </tr>
    `).join('') : '<tr><td colspan="3">No data available</td></tr>';
}

function renderTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    
    if (window.trendChartInstance) window.trendChartInstance.destroy();
    
    window.trendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            datasets: [{
                label: 'Click Trends',
                data: [10, 20, 15, 30, 25, 35, 40],
                borderColor: '#00ff41',
                backgroundColor: 'rgba(0, 255, 65, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: '#00ff41' } } },
            scales: { y: { ticks: { color: '#00ff41' }, grid: { color: '#333' } }, x: { ticks: { color: '#00ff41' }, grid: { color: '#333' } } }
        }
    });
}

function renderPerformanceChart() {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;
    
    if (window.perfChartInstance) window.perfChartInstance.destroy();
    
    window.perfChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Link 1', 'Link 2', 'Link 3', 'Link 4'],
            datasets: [{
                label: 'Clicks',
                data: [120, 95, 78, 65],
                backgroundColor: '#00ff41'
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: '#00ff41' } } },
            scales: { y: { ticks: { color: '#00ff41' }, grid: { color: '#333' } }, x: { ticks: { color: '#00ff41' }, grid: { color: '#333' } } }
        }
    });
}

function generateQR() {
    const url = document.getElementById('qrInput').value;
    if (!url) return alert('Please enter a URL');
    
    const container = document.getElementById('qrcode');
    container.innerHTML = '';
    new QRCode(container, {
        text: url,
        width: 200,
        height: 200,
        colorDark: '#00ff41',
        colorLight: '#000000'
    });
    
    document.getElementById('qrCodeContainer').style.display = 'block';
    document.getElementById('downloadQRBtn').style.display = 'block';
}

function downloadQR() {
    const canvas = document.querySelector('#qrcode canvas');
    if (canvas) {
        const link = document.createElement('a');
        link.href = canvas.toDataURL();
        link.download = 'qrcode.png';
        link.click();
    }
}

function shortenURL() {
    const url = document.getElementById('urlInput').value;
    if (!url) return alert('Please enter a URL');
    
    const shortened = 'short.link/' + Math.random().toString(36).substr(2, 6);
    document.getElementById('shortenedURL').value = shortened;
    document.getElementById('shortenedContainer').style.display = 'block';
}

function copyShortenedURL() {
    const url = document.getElementById('shortenedURL').value;
    navigator.clipboard.writeText(url);
    alert('Shortened URL copied!');
}

function toggleTheme() {
    darkMode = !darkMode;
    document.body.style.background = darkMode ? '#000000' : '#ffffff';
    document.body.style.color = darkMode ? '#ffffff' : '#000000';
    document.getElementById('themeInfo').textContent = darkMode ? 'Current: Dark Mode' : 'Current: Light Mode';
}

function toggleOffline() {
    offlineMode = !offlineMode;
    document.getElementById('offlineInfo').textContent = offlineMode ? 'Offline mode: Enabled' : 'Offline mode: Disabled';
}

function exportAnalytics() {
    const links = JSON.parse(localStorage.getItem('links_' + currentHubId) || '[]');
    const stats = JSON.parse(localStorage.getItem('stats_' + currentHubId) || '{}');
    const data = { links, stats, exportDate: new Date().toLocaleString() };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics_report.json';
    a.click();
    URL.revokeObjectURL(url);
}

function goSettings() { alert('Settings page coming soon'); }
function goUsage() { alert('Usage stats page coming soon'); }
function goHelp() { alert('Help page coming soon'); }
function goLogin() { alert('Login page coming soon'); }
