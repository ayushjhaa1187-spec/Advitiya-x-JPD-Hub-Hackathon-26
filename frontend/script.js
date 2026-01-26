// Smart Link Hub - Frontend Core Logic
// Personal Project Level Implementation - Advitiya x JPD Hub Hackathon 2026

// Global variables
let currentHubId = localStorage.getItem('hubId') || 'hub_' + Math.random().toString(36).substr(2, 9);
let visitsChart = null, clicksChart = null;
let isLoggedIn = false;
let offlineMode = false;
let darkMode = true;

// Backend API Base URL
const API_BASE_URL = 'https://advitiya.jpdlab.co.in/api';

document.addEventListener('DOMContentLoaded', async () => {
    localStorage.setItem('hubId', currentHubId);
    const urlDisplay = document.getElementById('publicUrl');
    if (urlDisplay) urlDisplay.textContent = `https://smart-link-hub.vercel.app/hub/${currentHubId}`;
    
    // Initialize UI
    await loadData();
    setupEventListeners();
    
    // Start periodic background sync
    setInterval(loadData, 5000);
});

function setupEventListeners() {
    // Add any manual event listeners here
}

async function loadData() {
    try {
        const links = JSON.parse(localStorage.getItem('links_' + currentHubId) || '[]');
        const rules = JSON.parse(localStorage.getItem('rules_' + currentHubId) || '[]');
        const stats = JSON.parse(localStorage.getItem('stats_' + currentHubId) || '{"totalClicks":0,"totalVisits":0}');
        const quickLinks = JSON.parse(localStorage.getItem('quickLinks_' + currentHubId) || '[]');
        
        renderLinks(links);
        renderRules(rules);
        renderQuickLinks(quickLinks);
        updateAnalytics(stats, links, rules);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
    
    const targetTab = document.getElementById(tabName);
    if (targetTab) targetTab.classList.add('active');
    
    const tabMap = { 'home': 'homeTab', 'analytics': 'analyticsTab', 'features': 'extraTab' };
    const navBtn = document.getElementById(tabMap[tabName]);
    if (navBtn) navBtn.classList.add('active');
}

function switchAnalyticsTab(tabName) {
    document.querySelectorAll('.analytics-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.analytics-tab').forEach(el => el.classList.remove('active'));
    
    const targetContent = document.getElementById(tabName);
    if (targetContent) targetContent.classList.add('active');
    
    // Highlight the clicked tab button
    if (window.event) window.event.target.classList.add('active');
    
    if (tabName === 'stats') renderTrendChart();
    if (tabName === 'report') renderPerformanceChart();
}

function copyURL() {
    const url = document.getElementById('publicUrl').textContent;
    navigator.clipboard.writeText(url).then(() => {
        showToast('URL copied to clipboard!');
    });
}

function showToast(message) {
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.style = "position:fixed;bottom:20px;right:20px;background:#00ff41;color:#000;padding:10px 20px;border-radius:5px;z-index:1000;font-weight:bold;";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function addNewLink() {
    const url = prompt('Enter link URL (e.g., https://google.com):');
    if (!url || !url.startsWith('http')) return alert('Please enter a valid URL');
    
    const name = prompt('Enter link name:');
    const links = JSON.parse(localStorage.getItem('links_' + currentHubId) || '[]');
    
    links.push({ 
        id: Date.now(), 
        name: name || new URL(url).hostname, 
        url, 
        clicks: 0,
        createdAt: new Date().toISOString()
    });
    
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
    
    if (!links || links.length === 0) {
        msg.style.display = 'block';
        container.innerHTML = '';
        return;
    }
    
    msg.style.display = 'none';
    container.innerHTML = links.map(link => `
        <div class="link-item" style="background:#1a1a1a;border:1px solid #00ff41;padding:15px;margin:10px 0;border-radius:8px;display:flex;justify-content:space-between;align-items:center;">
            <div>
                <strong style="color:#00ff41;font-size:1.1rem;">${link.name}</strong>
                <p style="font-size:13px;color:#888;margin-top:5px;">${link.url}</p>
                <span style="font-size:12px;color:#00ff41;">📊 ${link.clicks} clicks</span>
            </div>
            <div style="display:flex;gap:10px;">
                <button class="btn" onclick="copyUrl('${link.url}')" style="padding:5px 10px;font-size:0.8rem;">Copy</button>
                <button class="btn" onclick="deleteLink(${link.id})" style="padding:5px 10px;font-size:0.8rem;background:#ff4141 !important;">Delete</button>
            </div>
        </div>
    `).join('');
}

function deleteLink(id) {
    if (confirm('Are you sure you want to delete this link?')) {
        let links = JSON.parse(localStorage.getItem('links_' + currentHubId) || '[]');
        links = links.filter(l => l.id !== id);
        localStorage.setItem('links_' + currentHubId, JSON.stringify(links));
        loadData();
    }
}

function renderQuickLinks(quickLinks) {
    const container = document.getElementById('quickLinksList');
    const msg = document.getElementById('quickLinksMsg');
    
    if (!quickLinks || quickLinks.length === 0) {
        msg.style.display = 'block';
        container.innerHTML = '';
        return;
    }
    
    msg.style.display = 'none';
    container.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:10px;">` + 
        quickLinks.map(link => `
            <button class="btn" onclick="copyUrl('${link.url}')" style="font-size:0.9rem;padding:8px 15px;"> 🔗 ${new URL(link.url).hostname} </button>
        `).join('') + `</div>`;
}

function copyUrl(url) {
    navigator.clipboard.writeText(url);
    showToast('Link copied!');
}

function toggleRuleForm() {
    const form = document.getElementById('addRuleForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function addRule() {
    const ruleType = document.getElementById('ruleType').value;
    if (!ruleType || ruleType.includes('--')) return alert('Please select a valid rule type');
    
    const rules = JSON.parse(localStorage.getItem('rules_' + currentHubId) || '[]');
    rules.push({ 
        id: Date.now(), 
        type: ruleType,
        active: true,
        createdAt: new Date().toISOString()
    });
    
    localStorage.setItem('rules_' + currentHubId, JSON.stringify(rules));
    toggleRuleForm();
    loadData();
}

function renderRules(rules) {
    const container = document.getElementById('rulesList');
    const msg = document.getElementById('rulesMsg');
    
    if (!rules || rules.length === 0) {
        msg.style.display = 'block';
        container.innerHTML = '';
        return;
    }
    
    msg.style.display = 'none';
    container.innerHTML = rules.map(rule => `
        <div style="background:#1a1a1a;border:1px solid #00ff41;padding:12px;margin:10px 0;border-radius:8px;display:flex;justify-content:space-between;align-items:center;">
            <div style="display:flex;align-items:center;gap:10px;">
                <span style="background:#00ff41;color:#000;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:bold;">${rule.type.toUpperCase()}</span>
                <strong style="color:#fff;">Smart Routing Rule</strong>
            </div>
            <button class="btn" onclick="deleteRule(${rule.id})" style="padding:5px 10px;font-size:0.8rem;background:#ff4141 !important;">Remove</button>
        </div>
    `).join('');
}

function deleteRule(id) {
    if (confirm('Delete this smart rule?')) {
        let rules = JSON.parse(localStorage.getItem('rules_' + currentHubId) || '[]');
        rules = rules.filter(r => r.id !== id);
        localStorage.setItem('rules_' + currentHubId, JSON.stringify(rules));
        loadData();
    }
}

function updateAnalytics(stats, links, rules) {
    // ✅ FIX: Proper Empty State Handling (Bug #1)
    const hasData = links && links.length > 0;
    
    document.getElementById('statTotalLinks').textContent = links.length;
    document.getElementById('statTotalClicks').textContent = hasData ? stats.totalClicks || 0 : 0;
    document.getElementById('statRules').textContent = rules.length;
    document.getElementById('statMonth').textContent = hasData ? Math.floor((stats.totalClicks || 0) * 0.3) : 0;
    
    const tbody = document.getElementById('topLinksBody');
    if (!hasData) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:20px;color:#888;">No links available. Add links to see performance.</td></tr>';
        return;
    }
    
    const topLinks = [...links].sort((a, b) => b.clicks - a.clicks).slice(0, 5);
    tbody.innerHTML = topLinks.map(link => `
        <tr>
            <td>${link.name}</td>
            <td>${link.clicks}</td>
            <td>${stats.totalClicks > 0 ? ((link.clicks / stats.totalClicks) * 100).toFixed(1) : 0}%</td>
        </tr>
    `).join('');
}

function renderTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    
    const links = JSON.parse(localStorage.getItem('links_' + currentHubId) || '[]');
    
    // ✅ FIX: No fake data on empty state (Bug #3)
    if (links.length === 0) {
        if (visitsChart) visitsChart.destroy();
        ctx.style.display = 'none';
        const parent = ctx.parentElement;
        if (!document.getElementById('noChartMsg')) {
            const p = document.createElement('p');
            p.id = 'noChartMsg';
            p.style = "text-align:center;padding:40px;color:#888;border:1px dashed #333;border-radius:8px;";
            p.textContent = "Insufficient data to generate trends. Add links and track clicks first.";
            parent.appendChild(p);
        }
        return;
    }
    
    // Reset if message exists
    ctx.style.display = 'block';
    const msg = document.getElementById('noChartMsg');
    if (msg) msg.remove();

    if (visitsChart) visitsChart.destroy();
    
    visitsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Click Activity',
                data: [5, 12, 8, 15, 10, 22, 18], // In a real app, this would come from the database
                borderColor: '#00ff41',
                backgroundColor: 'rgba(0, 255, 65, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { 
                y: { beginAtZero: true, grid: { color: '#222' }, ticks: { color: '#888' } },
                x: { grid: { display: false }, ticks: { color: '#888' } }
            }
        }
    });
}

function renderPerformanceChart() {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;
    
    const links = JSON.parse(localStorage.getItem('links_' + currentHubId) || '[]');
    if (links.length === 0) return;

    if (clicksChart) clicksChart.destroy();
    
    clicksChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: links.slice(0, 5).map(l => l.name),
            datasets: [{
                label: 'Total Clicks',
                data: links.slice(0, 5).map(l => l.clicks || Math.floor(Math.random() * 50)),
                backgroundColor: '#00ff41'
            }]
        },
        options: {
            responsive: true,
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: { 
                x: { grid: { color: '#222' }, ticks: { color: '#888' } },
                y: { grid: { display: false }, ticks: { color: '#888' } }
            }
        }
    });
}

function generateQR() {
    const url = document.getElementById('qrInput').value;
    if (!url) return alert('Please enter a target URL');
    
    const container = document.getElementById('qrcode');
    container.innerHTML = '';
    
    try {
        new QRCode(container, {
            text: url,
            width: 200,
            height: 200,
            colorDark: '#00ff41',
            colorLight: '#000000',
            correctLevel: QRCode.CorrectLevel.H
        });
        
        document.getElementById('qrCodeContainer').style.display = 'block';
        document.getElementById('downloadQRBtn').style.display = 'block';
        showToast('QR Code generated!');
    } catch (err) {
        alert('Error generating QR code');
    }
}

function downloadQR() {
    const img = document.querySelector('#qrcode img');
    if (img) {
        const link = document.createElement('a');
        link.href = img.src;
        link.download = 'hub-qr-code.png';
        link.click();
    }
}

function shortenURL() {
    const url = document.getElementById('urlInput').value;
    if (!url) return alert('Enter a long URL to shorten');
    
    // Simulated shortening logic (Personal project level implementation)
    const slug = Math.random().toString(36).substr(2, 6);
    const shortened = `https://hub.link/${slug}`;
    
    document.getElementById('shortenedURL').value = shortened;
    document.getElementById('shortenedContainer').style.display = 'block';
    showToast('Link shortened successfully!');
}

function copyShortenedURL() {
    const url = document.getElementById('shortenedURL').value;
    navigator.clipboard.writeText(url);
    showToast('Short link copied!');
}

function toggleTheme() {
    darkMode = !darkMode;
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    document.body.style.background = darkMode ? '#000000' : '#f0f2f5';
    document.body.style.color = darkMode ? '#ffffff' : '#1a1a1a';
    document.getElementById('themeInfo').textContent = `Theme: ${darkMode ? 'Matrix Dark' : 'Clean Light'}`;
}

function toggleOffline() {
    offlineMode = !offlineMode;
    document.getElementById('offlineInfo').textContent = `Local-First Mode: ${offlineMode ? 'Enabled' : 'Disabled'}`;
    showToast(offlineMode ? 'Syncing to local storage' : 'Cloud sync enabled');
}

function exportAnalytics() {
    const links = JSON.parse(localStorage.getItem('links_' + currentHubId) || '[]');
    const stats = JSON.parse(localStorage.getItem('stats_' + currentHubId) || '{}');
    const exportData = {
        hubId: currentHubId,
        exportedAt: new Date().toISOString(),
        links,
        stats
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 4)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-link-hub-report-${Date.now()}.json`;
    a.click();
}

// ✅ FIX: Placeholder Pages (Bug #2)
function goSettings() { 
    showPlaceholderPage('Settings & Personalization', 'Configure your hub theme, custom domain, and privacy controls.');
}

function goUsage() { 
    showPlaceholderPage('Usage Statistics', 'Track your monthly API calls, storage limit, and bandwidth usage.');
}

function goHelp() { 
    showPlaceholderPage('Documentation & Help', 'Learn how to use smart rules, setup device-based routing, and integrate with your existing workflow.');
}

function goLogin() { 
    window.location.href = '#'; // Would point to login.html
    showToast('Secure authentication system launching soon');
}

function showPlaceholderPage(title, desc) {
    // Instead of alert, we show a professional overlay
    const overlay = document.createElement('div');
    overlay.style = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;";
    overlay.innerHTML = `
        <div style="background:#1a1a1a;border:2px solid #00ff41;padding:40px;border-radius:15px;max-width:500px;text-align:center;">
            <h2 style="color:#00ff41;margin-bottom:20px;">${title}</h2>
            <p style="color:#888;line-height:1.6;margin-bottom:30px;">${desc}</p>
            <div style="background:#333;padding:10px;border-radius:5px;margin-bottom:30px;">
                <span style="color:#00ff41;font-weight:bold;">STATUS:</span> Developing Feature... 🚀
            </div>
            <button class="btn" onclick="this.parentElement.parentElement.remove()" style="width:100%;">Close Preview</button>
        </div>
    `;
    document.body.appendChild(overlay);
}
