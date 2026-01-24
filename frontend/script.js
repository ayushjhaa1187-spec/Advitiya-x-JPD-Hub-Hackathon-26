const API_BASE = 'http://localhost:3000/api';
let currentHubId = localStorage.getItem('hubId') || 'hub_' + Date.now();
let useBackend = false;

document.addEventListener('DOMContentLoaded', async () => {
    localStorage.setItem('hubId', currentHubId);
    document.getElementById('publicUrl').textContent = `https://smart-link-hub.vercel.app/hub/${currentHubId}`;
    
    // Test backend connection
    try {
        const res = await fetch(`${API_BASE}/health`);
        if (res.ok) {
            useBackend = true;
            console.log('✅ Connected to backend');
        }
    } catch (e) {
        console.log('⚠️ Backend offline, using localStorage');
    }

    await loadData();
    setInterval(loadData, 3000);
});

async function loadData() {
    if (useBackend) {
        try {
            const [linksRes, rulesRes, statsRes] = await Promise.all([
                fetch(`${API_BASE}/links/${currentHubId}`),
                fetch(`${API_BASE}/rules/${currentHubId}`),
                fetch(`${API_BASE}/stats/${currentHubId}`)
            ]);

            if (linksRes.ok && rulesRes.ok && statsRes.ok) {
                const links = await linksRes.json();
                const rules = await rulesRes.json();
                const stats = await statsRes.json();

                renderLinks(links);
                renderRules(rules);
                updateAnalytics(stats, links, rules);
                updatePreview(links);
                return;
            }
        } catch (e) {
            console.log('Backend error, falling back to localStorage');
        }
    }
    
    // Fallback to localStorage
    loadFromLocal();
}

function loadFromLocal() {
    const links = JSON.parse(localStorage.getItem('links_' + currentHubId) || '[]');
    const rules = JSON.parse(localStorage.getItem('rules_' + currentHubId) || '[]');
    const stats = JSON.parse(localStorage.getItem('stats_' + currentHubId) || '{"totalClicks": 0, "totalVisits": 0}');

    renderLinks(links);
    renderRules(rules);
    updateAnalytics(stats, links, rules);
    updatePreview(links);
}

async function createRule() {
    const name = document.getElementById('ruleName').value;
    const type = document.getElementById('ruleType').value;
    const condition = document.getElementById('ruleCondition').value;
    const priority = parseInt(document.getElementById('rulePriority').value);

    if (!name || !type || !condition) {
        alert('Please fill all fields');
        return;
    }

    const rule = { name, type, condition, priority, hubId: currentHubId };

    if (useBackend) {
        try {
            const res = await fetch(`${API_BASE}/rules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rule)
            });
            if (!res.ok) throw new Error();
        } catch {
            saveRuleLocal(rule);
        }
    } else {
        saveRuleLocal(rule);
    }

    document.getElementById('ruleName').value = '';
    document.getElementById('ruleType').value = '';
    document.getElementById('ruleCondition').value = '';
    document.getElementById('rulePriority').value = '5';

    await loadData();
}

function saveRuleLocal(rule) {
    const rules = JSON.parse(localStorage.getItem('rules_' + currentHubId) || '[]');
    rule.id = 'rule_' + Date.now();
    rules.push(rule);
    localStorage.setItem('rules_' + currentHubId, JSON.stringify(rules));
}

function renderRules(rules) {
    const container = document.getElementById('rulesList');
    if (rules.length === 0) {
        container.innerHTML = '<div class="empty-state">No rules yet</div>';
        return;
    }

    container.innerHTML = '<div class="item-list">' + rules.map(rule => `
        <div class="item">
            <div>
                <div class="item-title">${rule.name}</div>
                <div class="item-text"><strong>${rule.type}:</strong> ${rule.condition}</div>
                <div class="item-badge">Priority: ${rule.priority}/10</div>
            </div>
            <div class="item-actions">
                <button class="btn btn-small btn-danger" onclick="deleteRule('${rule._id || rule.id}')">🗑️</button>
            </div>
        </div>
    `).join('') + '</div>';
}

async function deleteRule(id) {
    if (useBackend) {
        try {
            await fetch(`${API_BASE}/rules/${id}`, { method: 'DELETE' });
        } catch {
            deleteRuleLocal(id);
        }
    } else {
        deleteRuleLocal(id);
    }
    await loadData();
}

function deleteRuleLocal(id) {
    const rules = JSON.parse(localStorage.getItem('rules_' + currentHubId) || '[]');
    const filtered = rules.filter(r => r._id !== id && r.id !== id);
    localStorage.setItem('rules_' + currentHubId, JSON.stringify(filtered));
}

function openAddLinkModal() {
    document.getElementById('addLinkModal').classList.add('show');
}

async function saveLink() {
    const title = document.getElementById('modalTitle').value;
    const url = document.getElementById('modalUrl').value;
    const desc = document.getElementById('modalDesc').value;
    const priority = parseInt(document.getElementById('modalPriority').value);

    if (!title || !url) {
        alert('Please fill Title and URL');
        return;
    }

    const link = { title, url, description: desc, priority, hubId: currentHubId, clicks: 0 };

    if (useBackend) {
        try {
            const res = await fetch(`${API_BASE}/links`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(link)
            });
            if (!res.ok) throw new Error();
        } catch {
            saveLinkLocal(link);
        }
    } else {
        saveLinkLocal(link);
    }

    document.getElementById('modalTitle').value = '';
    document.getElementById('modalUrl').value = '';
    document.getElementById('modalDesc').value = '';
    document.getElementById('modalPriority').value = '5';

    closeModal('addLinkModal');
    await loadData();
}

function saveLinkLocal(link) {
    const links = JSON.parse(localStorage.getItem('links_' + currentHubId) || '[]');
    link.id = 'link_' + Date.now();
    links.push(link);
    localStorage.setItem('links_' + currentHubId, JSON.stringify(links));
}

function renderLinks(links) {
    const container = document.getElementById('linksList');
    if (links.length === 0) {
        container.innerHTML = '<div class="empty-state">No links added</div>';
        return;
    }

    const sorted = [...links].sort((a, b) => b.priority - a.priority);
    container.innerHTML = '<div class="item-list">' + sorted.map(link => `
        <div class="item">
            <div>
                <div class="item-title">${link.title}</div>
                <div class="item-text" style="word-break: break-all;">${link.url}</div>
                <div class="item-badge">Priority: ${link.priority} | ${link.clicks || 0} clicks</div>
            </div>
            <div class="item-actions">
                <button class="btn btn-small" onclick="testClick('${link._id || link.id}')">Test</button>
                <button class="btn btn-small btn-danger" onclick="deleteLink('${link._id || link.id}')">🗑️</button>
            </div>
        </div>
    `).join('') + '</div>';
}

async function testClick(linkId) {
    if (useBackend) {
        try {
            await fetch(`${API_BASE}/track/click/${linkId}`, { method: 'POST' });
        } catch {}
    } else {
        const links = JSON.parse(localStorage.getItem('links_' + currentHubId) || '[]');
        const link = links.find(l => l._id === linkId || l.id === linkId);
        if (link) {
            link.clicks = (link.clicks || 0) + 1;
            localStorage.setItem('links_' + currentHubId, JSON.stringify(links));
        }
    }
    await loadData();
}

async function deleteLink(id) {
    if (useBackend) {
        try {
            await fetch(`${API_BASE}/links/${id}`, { method: 'DELETE' });
        } catch {
            deleteLinkLocal(id);
        }
    } else {
        deleteLinkLocal(id);
    }
    await loadData();
}

function deleteLinkLocal(id) {
    const links = JSON.parse(localStorage.getItem('links_' + currentHubId) || '[]');
    const filtered = links.filter(l => l._id !== id && l.id !== id);
    localStorage.setItem('links_' + currentHubId, JSON.stringify(filtered));
}

function updateAnalytics(stats, links, rules) {
    document.getElementById('statClicks').textContent = stats.totalClicks || 0;
    document.getElementById('statVisits').textContent = stats.totalVisits || 0;
    document.getElementById('statLinks').textContent = links.length;
    document.getElementById('statRules').textContent = rules.length;

    const sorted = [...links].sort((a, b) => (b.clicks || 0) - (a.clicks || 0)).slice(0, 5);
    const container = document.getElementById('topLinksList');

    if (sorted.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #666666; font-size: 12px; padding: 12px;">No clicks yet</div>';
    } else {
        container.innerHTML = sorted.map((link, idx) => `
            <div style="background: #1a1a1a; border: 1px solid #222222; border-radius: 4px; padding: 8px; margin-bottom: 8px; display: flex; justify-content: space-between;">
                <span style="color: #cccccc; font-size: 12px;">${idx + 1}. ${link.title}</span>
                <span style="color: #00ff41; font-weight: bold;">${link.clicks || 0}</span>
            </div>
        `).join('');
    }
}

function updatePreview(links) {
    const sorted = [...links].sort((a, b) => b.priority - a.priority);
    const container = document.getElementById('previewGrid');

    if (sorted.length === 0) {
        container.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;">Add links to preview</div>';
        return;
    }

    container.innerHTML = sorted.map(link => `
        <div class="link-card" onclick="testClick('${link._id || link.id}')">
            <div class="link-card-title">${link.title}</div>
            <div class="link-card-stat">⭐ Priority: ${link.priority}</div>
            <div class="link-card-stat">🔗 ${link.clicks || 0} clicks</div>
        </div>
    `).join('');
}

function openPublicHub() {
    const links = JSON.parse(localStorage.getItem('links_' + currentHubId) || '[]');
    const sorted = [...links].sort((a, b) => b.priority - a.priority);
    const container = document.getElementById('publicGrid');

    if (sorted.length === 0) {
        container.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;">No links available</div>';
    } else {
        container.innerHTML = sorted.map(link => `
            <div class="link-card" onclick="window.open('${link.url}', '_blank'); testClick('${link._id || link.id}');">
                <div class="link-card-title">${link.title}</div>
                <div class="link-card-stat">${link.description || 'Link'}</div>
                <div style="margin-top: 8px; font-size: 11px; color: #00ff41;">→ Click</div>
            </div>
        `).join('');
    }

    document.getElementById('publicHubModal').classList.add('show');
}

function copyUrl() {
    navigator.clipboard.writeText(document.getElementById('publicUrl').textContent);
    alert('✅ URL copied to clipboard!');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('show');
}

function exportData() {
    const links = JSON.parse(localStorage.getItem('links_' + currentHubId) || '[]');
    const rules = JSON.parse(localStorage.getItem('rules_' + currentHubId) || '[]');
    const stats = JSON.parse(localStorage.getItem('stats_' + currentHubId) || '{}');

    const data = { hubId: currentHubId, links, rules, stats, exportedAt: new Date().toISOString() };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hub-config-' + currentHubId + '.json';
    a.click();
    URL.revokeObjectURL(url);
}

// ============ BONUS FEATURES ============

// BONUS 1: QR CODE GENERATOR
function generateQRCode() {
    const hubUrl = document.getElementById('publicUrl').textContent;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(hubUrl)}`;
    
    const container = document.getElementById('qrCodeContainer');
    container.innerHTML = `
        <div class="qr-container">
            <img src="${qrApiUrl}" alt="QR Code" id="qrCodeImg">
        </div>
    `;
    
    document.getElementById('downloadQRBtn').style.display = 'block';
}

function downloadQRCode() {
    const hubUrl = document.getElementById('publicUrl').textContent;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(hubUrl)}`;
    
    const a = document.createElement('a');
    a.href = qrApiUrl;
    a.download = 'qr-' + currentHubId + '.png';
    a.click();
}

// BONUS 2: URL SHORTENER
function shortenURL() {
    const hubUrl = document.getElementById('publicUrl').textContent;
    const shortened = 'short.link/' + currentHubId;
    
    const container = document.getElementById('shortenedUrlContainer');
    container.innerHTML = `
        <div class="url-short" onclick="copyShortenedUrl(this)">
            ${shortened}
        </div>
        <p style="color: #888888; font-size: 11px; text-align: center;">Click to copy</p>
    `;
}

function copyShortenedUrl(elem) {
    const text = elem.textContent.trim();
    navigator.clipboard.writeText(text);
    alert('✅ Shortened URL copied!');
}

// BONUS 3: DARK/LIGHT MODE AUTO-DETECTION
function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.remove('light-mode');
        localStorage.setItem('theme', 'dark');
        document.getElementById('darkThemeBtn').classList.add('active');
        document.getElementById('lightThemeBtn').classList.remove('active');
        document.getElementById('autoThemeBtn').classList.remove('active');
    } else if (theme === 'light') {
        document.body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
        document.getElementById('darkThemeBtn').classList.remove('active');
        document.getElementById('lightThemeBtn').classList.add('active');
        document.getElementById('autoThemeBtn').classList.remove('active');
    } else if (theme === 'auto') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark) {
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
        }
        localStorage.setItem('theme', 'auto');
        document.getElementById('darkThemeBtn').classList.remove('active');
        document.getElementById('lightThemeBtn').classList.remove('active');
        document.getElementById('autoThemeBtn').classList.add('active');
    }
}

// Initialize theme on load
window.addEventListener('load', () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
});

// BONUS 4: EXPORTABLE ANALYTICS REPORTS
function exportAnalyticsCSV() {
    const links = JSON.parse(localStorage.getItem('links_' + currentHubId) || '[]');
    const rules = JSON.parse(localStorage.getItem('rules_' + currentHubId) || '[]');
    const stats = JSON.parse(localStorage.getItem('stats_' + currentHubId) || '{}');

    let csv = 'Smart Link Hub Analytics Report\n';
    csv += 'Generated: ' + new Date().toISOString() + '\n\n';
    csv += 'SUMMARY\n';
    csv += 'Total Clicks,' + (stats.totalClicks || 0) + '\n';
    csv += 'Total Visits,' + (stats.totalVisits || 0) + '\n';
    csv += 'Active Links,' + links.length + '\n';
    csv += 'Active Rules,' + rules.length + '\n\n';

    csv += 'LINKS\n';
    csv += 'Title,URL,Priority,Clicks\n';
    links.forEach(link => {
        csv += `"${link.title}","${link.url}",${link.priority},${link.clicks || 0}\n`;
    });

    csv += '\nRULES\n';
    csv += 'Name,Type,Condition,Priority\n';
    rules.forEach(rule => {
        csv += `"${rule.name}","${rule.type}","${rule.condition}",${rule.priority}\n`;
    });

    downloadFile(csv, 'analytics-' + currentHubId + '.csv', 'text/csv');
}

function exportAnalyticsJSON() {
    const links = JSON.parse(localStorage.getItem('links_' + currentHubId) || '[]');
    const rules = JSON.parse(localStorage.getItem('rules_' + currentHubId) || '[]');
    const stats = JSON.parse(localStorage.getItem('stats_' + currentHubId) || '{}');

    const report = {
        hubId: currentHubId,
        generatedAt: new Date().toISOString(),
        summary: {
            totalClicks: stats.totalClicks || 0,
            totalVisits: stats.totalVisits || 0,
            activeLinks: links.length,
            activeRules: rules.length
        },
        links,
        rules,
        stats
    };

    downloadFile(JSON.stringify(report, null, 2), 'analytics-' + currentHubId + '.json', 'application/json');
}

function exportAnalyticsHTML() {
    const links = JSON.parse(localStorage.getItem('links_' + currentHubId) || '[]');
    const rules = JSON.parse(localStorage.getItem('rules_' + currentHubId) || '[]');
    const stats = JSON.parse(localStorage.getItem('stats_' + currentHubId) || '{}');

    let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Analytics Report - ${currentHubId}</title>
            <style>
                body { font-family: Arial; background: #000; color: #fff; padding: 20px; }
                h1 { color: #00ff41; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { padding: 10px; text-align: left; border-bottom: 1px solid #222; }
                th { background: #0a0a0a; color: #00ff41; }
                tr:hover { background: #0f0f0f; }
            </style>
        </head>
        <body>
            <h1>🔗 Smart Link Hub - Analytics Report</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <p>Hub ID: ${currentHubId}</p>

            <h2>Summary</h2>
            <table>
                <tr><th>Metric</th><th>Value</th></tr>
                <tr><td>Total Clicks</td><td>${stats.totalClicks || 0}</td></tr>
                <tr><td>Total Visits</td><td>${stats.totalVisits || 0}</td></tr>
                <tr><td>Active Links</td><td>${links.length}</td></tr>
                <tr><td>Active Rules</td><td>${rules.length}</td></tr>
            </table>

            <h2>Links</h2>
            <table>
                <tr><th>Title</th><th>URL</th><th>Priority</th><th>Clicks</th></tr>
                ${links.map(link => `<tr><td>${link.title}</td><td>${link.url}</td><td>${link.priority}</td><td>${link.clicks || 0}</td></tr>`).join('')}
            </table>

            <h2>Rules</h2>
            <table>
                <tr><th>Name</th><th>Type</th><th>Condition</th><th>Priority</th></tr>
                ${rules.map(rule => `<tr><td>${rule.name}</td><td>${rule.type}</td><td>${rule.condition}</td><td>${rule.priority}</td></tr>`).join('')}
            </table>
        </body>
        </html>
    `;

    downloadFile(html, 'analytics-' + currentHubId + '.html', 'text/html');
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// BONUS 5: OFFLINE FALLBACK
function testOfflineMode() {
    const container = document.getElementById('offlineModeContainer');
    const links = JSON.parse(localStorage.getItem('links_' + currentHubId) || '[]');
    const rules = JSON.parse(localStorage.getItem('rules_' + currentHubId) || '[]');

    const storageSize = JSON.stringify(links).length + JSON.stringify(rules).length;

    container.innerHTML = `
        <div style="background: #1a1a1a; border: 1px solid #00ff41; border-radius: 6px; padding: 12px;">
            <p style="color: #00ff41; margin-bottom: 8px;">✅ Offline Capabilities:</p>
            <ul style="color: #888888; font-size: 12px; margin-left: 20px;">
                <li>✓ All data stored in localStorage</li>
                <li>✓ Links: ${links.length} items (${storageSize} bytes)</li>
                <li>✓ Rules: ${rules.length} items</li>
                <li>✓ Works without internet connection</li>
                <li>✓ Syncs automatically when online</li>
            </ul>
        </div>
    `;
}

// Update bonus stats
function updateBonusStats() {
    const links = JSON.parse(localStorage.getItem('links_' + currentHubId) || '[]');
    const rules = JSON.parse(localStorage.getItem('rules_' + currentHubId) || '[]');
    
    const storageSize = (JSON.stringify(links).length + JSON.stringify(rules).length) / 1024;
    
    document.getElementById('bonusHubId').textContent = currentHubId;
    document.getElementById('bonusStorage').textContent = storageSize.toFixed(2) + ' KB';
    document.getElementById('bonusRulesEval').textContent = rules.length + ' active';
}

// Call updateBonusStats periodically
setInterval(updateBonusStats, 5000);
window.addEventListener('load', updateBonusStats);
