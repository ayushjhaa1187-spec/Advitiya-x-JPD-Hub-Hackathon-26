const API_BASE = 'http://localhost:3000/api';
let currentHubId = localStorage.getItem('hubId') || 'hub_' + Date.now();
let useBackend = false;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    localStorage.setItem('hubId', currentHubId);
    document.getElementById('publicUrl').textContent = `https://smart-link-hub.vercel.app/hub/${currentHubId}`;
    await loadData();
    setInterval(loadData, 5000); // Sync every 5s
    setTimeout(renderAllCharts, 1000); // Initial Chart Render
});

async function loadData() {
    loadFromLocal(); // Default to local for speed
    updateBonusStats();
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

// --- RULES LOGIC ---
async function createRule() {
    const name = document.getElementById('ruleName').value;
    const type = document.getElementById('ruleType').value;
    const condition = document.getElementById('ruleCondition').value;
    const priority = document.getElementById('rulePriority').value;
    const operator = document.getElementById('ruleOperator').value;

    if (!name || !type || !condition) return alert('Please fill all fields');
    
    // Validation Fixes
    if (type === 'Time-Based' && !/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(condition) && !/^(weekday|weekend)$/i.test(condition)) {
        return alert('Invalid time format (use HH:MM-HH:MM or weekday)');
    }

    const rule = { id: 'rule_' + Date.now(), name, type, condition, priority, operator };
    saveLocalItem('rules', rule);
    
    // Reset Form
    document.getElementById('ruleName').value = '';
    document.getElementById('ruleCondition').value = '';
    loadData();
}

function renderRules(rules) {
    const list = document.getElementById('rulesList');
    if (!rules.length) return list.innerHTML = '<div class="empty-state">No rules yet</div>';
    list.innerHTML = rules.map(r => `
        <div class="link-card" style="text-align:left">
            <div style="font-weight:bold; color:#00ff41">${r.name}</div>
            <div style="font-size:12px; color:#888">${r.type}: ${r.condition} (Pri: ${r.priority})</div>
            <button class="btn btn-small" style="margin-top:5px; border-color:red; color:red" onclick="deleteItem('rules', '${r.id}')">Delete</button>
        </div>
    `).join('');
}

// --- LINKS LOGIC ---
async function saveLink() {
    const title = document.getElementById('modalTitle').value;
    const url = document.getElementById('modalUrl').value;
    const priority = document.getElementById('modalPriority').value;
    const desc = document.getElementById('modalDesc').value;

    if (!title || !url) return alert('Title and URL required');

    const link = { id: 'link_' + Date.now(), title, url, priority, description: desc, clicks: 0 };
    saveLocalItem('links', link);
    closeModal('addLinkModal');
    loadData();
}

function renderLinks(links) {
    const list = document.getElementById('linksList');
    if (!links.length) return list.innerHTML = '<div class="empty-state">No links added</div>';
    list.innerHTML = links.sort((a,b) => b.priority - a.priority).map(l => `
        <div class="link-card" style="text-align:left; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <div style="font-weight:bold; color:#00ff41">${l.title}</div>
                <div style="font-size:11px; color:#888">${l.url}</div>
            </div>
            <div style="text-align:right">
                <div style="font-size:10px;">Pri: ${l.priority}</div>
                <div style="font-size:10px;">🖱️ ${l.clicks||0}</div>
                <button onclick="deleteItem('links', '${l.id}')" style="background:none; border:none; cursor:pointer;">🗑️</button>
            </div>
        </div>
    `).join('');
}

function updatePreview(links) {
    const grid = document.getElementById('previewGrid');
    if (!links.length) return grid.innerHTML = '<div class="empty-state">Add links</div>';
    grid.innerHTML = links.map(l => `<div class="link-card" onclick="trackClick('${l.id}')"><div class="link-card-title">${l.title}</div></div>`).join('');
}

// --- ANALYTICS & CHARTS ---
function updateAnalytics(stats, links, rules) {
    document.getElementById('statClicks').textContent = stats.totalClicks || 0;
    document.getElementById('statVisits').textContent = stats.totalVisits || 0;
    
    // Render Top Links List
    const top = [...links].sort((a,b) => (b.clicks||0) - (a.clicks||0)).slice(0,3);
    document.getElementById('topLinksList').innerHTML = top.map((l,i) => 
        `<div style="display:flex; justify-content:space-between; padding:5px; border-bottom:1px solid #333">
            <span>${i+1}. ${l.title}</span><span style="color:#00ff41">${l.clicks||0}</span>
        </div>`).join('');
}

function trackClick(id) {
    const links = JSON.parse(localStorage.getItem('links_' + currentHubId) || '[]');
    const link = links.find(l => l.id === id);
    if(link) {
        link.clicks = (link.clicks || 0) + 1;
        localStorage.setItem('links_' + currentHubId, JSON.stringify(links));
        
        // Update Total Stats
        const stats = JSON.parse(localStorage.getItem('stats_' + currentHubId) || '{"totalClicks":0}');
        stats.totalClicks++;
        localStorage.setItem('stats_' + currentHubId, JSON.stringify(stats));
        loadData();
    }
}

// Generic Helper for LocalStorage
function saveLocalItem(type, item) {
    const items = JSON.parse(localStorage.getItem(type + '_' + currentHubId) || '[]');
    items.push(item);
    localStorage.setItem(type + '_' + currentHubId, JSON.stringify(items));
}

function deleteItem(type, id) {
    const items = JSON.parse(localStorage.getItem(type + '_' + currentHubId) || '[]');
    const filtered = items.filter(i => i.id !== id);
    localStorage.setItem(type + '_' + currentHubId, JSON.stringify(filtered));
    loadData();
}

// --- CHART RENDERER ---
let visitsChart, clicksChart;
function renderAllCharts() {
    const ctx1 = document.getElementById('visitsChart');
    const ctx2 = document.getElementById('clicksChart');
    if(!ctx1 || !ctx2) return;

    if(visitsChart) visitsChart.destroy();
    visitsChart = new Chart(ctx1, {
        type: 'line', data: { labels: ['M','T','W','T','F','S','S'], datasets: [{ label: 'Visits', data: [10,20,15,30,25,40,35], borderColor: '#00ff41' }] },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
    });
}

// --- UTILS & MODALS ---
function openSettings() { document.getElementById('settingsModal').classList.add('show'); }
function openHelp() { document.getElementById('helpModal').classList.add('show'); }
function openAddLinkModal() { document.getElementById('addLinkModal').classList.add('show'); }
function openPublicHub() { 
    document.getElementById('publicHubModal').classList.add('show'); 
    document.getElementById('publicGrid').innerHTML = document.getElementById('previewGrid').innerHTML;
}
function closeModal(id) { document.getElementById(id).classList.remove('show'); }
function toggleAuth() { document.getElementById('authModal').classList.add('show'); }
function loginWith(provider) { alert('Logged in with ' + provider); closeModal('authModal'); document.getElementById('authBtn').textContent = 'Logout'; }

function saveCustomization() {
    const title = document.getElementById('hubTitle').value;
    if(title) document.querySelector('h1').textContent = '🔗 ' + title;
    closeModal('settingsModal');
}

function setTheme(mode) {
    if(mode === 'light') document.body.classList.add('light-mode');
    else document.body.classList.remove('light-mode');
}

function updateBonusStats() {
    const rules = JSON.parse(localStorage.getItem('rules_' + currentHubId) || '[]');
    document.getElementById('bonusRulesEval').textContent = rules.length;
}
