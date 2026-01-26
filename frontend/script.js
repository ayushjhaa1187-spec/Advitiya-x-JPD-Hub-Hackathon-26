const API_BASE='http://localhost:3000/api';let currentHubId=localStorage.getItem('hubId')||'hub_'+Date.now();let useBackend=false;let qrCodeInstance=null;let visitsChart=null,clicksChart=null;let isLoggedIn=false;let chartsInitialized=false;document.addEventListener('DOMContentLoaded',async()=>{localStorage.setItem('hubId',currentHubId);const urlDisplay=document.getElementById('publicUrl');if(urlDisplay)urlDisplay.textContent=`https://smart-link-hub.vercel.app/hub/${currentHubId}`;await loadData();setInterval(loadData,5000);});async function loadData(){loadFromLocal();updateAnalytics();}function loadFromLocal(){const links=JSON.parse(localStorage.getItem('links_'+currentHubId)||'[]');const rules=JSON.parse(localStorage.getItem('rules_'+currentHubId)||'[]');const stats=JSON.parse(localStorage.getItem('stats_'+currentHubId)||'{"totalClicks":0,"totalVisits":0}');const quickLinks=JSON.parse(localStorage.getItem('quickLinks_'+currentHubId)||'[]');renderLinks(links);renderRules(rules);updateAnalytics(stats,links);}function switchTab(tabName){document.querySelectorAll('.tab-btn').forEach(btn=>btn.classList.remove('active'));document.querySelectorAll('.tab-content').forEach(content=>content.classList.remove('active'));const tab=document.getElementById(tabName+'Tab');const content=document.getElementById(tabName+'Tab-content');if(tab)tab.classList.add('active');if(content)content.classList.add('active');if(tabName==='analytics'){setTimeout(renderAllCharts,100);}}function renderAllCharts(){if(chartsInitialized)return;chartsInitialized=true;const ctx1=document.getElementById('visitsChart');const ctx2=document.getElementById('clicksChart');if(!ctx1||!ctx2)return;const chartConfig={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{display:false},y:{display:false}}};visitsChart=new Chart(ctx1,{type:'line',data:{labels:['M','T','W','T','F','S','S'],datasets:[{label:'Visits',data:[10,20,15,30,25,40,35],borderColor:'#00ff41',backgroundColor:'rgba(0,255,65,0.1)',tension:0.4}]},options:chartConfig});clicksChart=new Chart(ctx2,{type:'line',data:{labels:['M','T','W','T','F','S','S'],datasets:[{label:'Clicks',data:[8,15,12,25,20,35,30],borderColor:'#00ff41',backgroundColor:'rgba(0,255,65,0.1)',tension:0.4}]},options:chartConfig});}function toggleAuth(){if(isLoggedIn){isLoggedIn=false;const authBtn=document.getElementById('authBtn');if(authBtn)authBtn.textContent='Login';alert('Logged out successfully');}else{showLoginModal();}}function showLoginModal(){const html=`<div id="authModal" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:1000;"><div style="background:#1a1a1a;border:2px solid #00ff41;border-radius:8px;padding:30px;text-align:center;color:#fff;"><h2>Login with</h2><button onclick="loginWith('Google')" style="background:#00ff41;color:#000;border:none;padding:10px 20px;margin:10px;border-radius:4px;cursor:pointer;font-weight:bold;">Google</button><button onclick="loginWith('GitHub')" style="background:#00ff41;color:#000;border:none;padding:10px 20px;margin:10px;border-radius:4px;cursor:pointer;font-weight:bold;">GitHub</button><button onclick="closeModal()" style="background:#666;color:#fff;border:none;padding:10px 20px;margin:10px;border-radius:4px;cursor:pointer;">Cancel</button></div></div>`;document.body.insertAdjacentHTML('beforeend',html);}function loginWith(provider){isLoggedIn=true;alert('Logged in with '+provider);closeModal();const authBtn=document.getElementById('authBtn');if(authBtn)authBtn.textContent='Logout';}function closeModal(){const modal=document.getElementById('authModal');if(modal)modal.remove();}function generateQRCode(){const url=document.getElementById('publicUrl').textContent;const container=document.getElementById('qrCodeContainer');const btn=document.getElementById('genQRBtn');if(container.style.display==='block'){container.style.display='none';container.innerHTML='';qrCodeInstance=null;if(btn)btn.textContent='Generate QR Code';return;}container.innerHTML='';qrCodeInstance=new QRCode(container,{text:url,width:200,height:200,colorDark:'#000000',colorLight:'#ffffff'});container.style.display='block';if(btn)btn.textContent='Close QR Code';document.getElementById('downloadQRBtn').style.display='block';}function copyUrl(){const url=document.getElementById('publicUrl').textContent;const btn=document.querySelector('[onclick="copyUrl()"]');navigator.clipboard.writeText(url).then(()=>{if(btn){const originalText=btn.textContent;btn.textContent='Copied!';btn.style.borderColor='#00ff41';setTimeout(()=>{btn.textContent=originalText;btn.style.borderColor='';},2000);}});}function downloadQRCode(){const canvas=document.querySelector('#qrCodeContainer canvas');if(canvas){const link=document.createElement('a');link.href=canvas.toDataURL();link.download='qrcode.png';link.click();}}function renderLinks(links){}function renderRules(rules){}function updateAnalytics(stats,links){const clicksEl=document.getElementById('statClicks');const visitsEl=document.getElementById('statVisits');const conversionEl=document.getElementById('statConversion');const ctrEl=document.getElementById('statAvgCTR');if(clicksEl)clicksEl.textContent=(stats?.totalClicks||0);if(visitsEl)visitsEl.textContent=(stats?.totalVisits||0);if(conversionEl){const conversion=stats?.totalVisits>0?(stats.totalClicks/stats.totalVisits*100).toFixed(1):'0';conversionEl.textContent=conversion+'%';}if(ctrEl)ctrEl.textContent=(stats?.avgCTR||'0')+'%';}function openAddLinkModal(){}function addQuickLink(){}function openSettings(){}function openUsageStats(){}function openHelp(){}

// simple in-memory mirrors
let linksState = [];
let rulesState = [];
let quickLinksState = [];

// RENDERERS
function renderLinks(links) {
  linksState = links || [];
  const container = document.getElementById('linksList');
  if (!container) return;
  container.innerHTML = '';
  linksState.forEach((l, idx) => {
    const div = document.createElement('div');
    div.className = 'link-item';
    div.innerHTML = `
      <div class="link-main">
        <span class="link-title">${l.title || l.url}</span>
        <span class="link-url">${l.url}</span>
      </div>
      <div class="link-actions">
        <button onclick="editLink(${idx})">Edit</button>
        <button onclick="deleteLink(${idx})">Delete</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function renderRules(rules) {
  rulesState = rules || [];
  const container = document.getElementById('rulesList');
  if (!container) return;
  container.innerHTML = '';
  rulesState.forEach((r, idx) => {
    const info = r.type === 'device'
      ? `${r.type} → ${r.deviceType || 'any'}`
      : `${r.type} → ${r.target}`;
    const div = document.createElement('div');
    div.className = 'rule-item';
    div.innerHTML = `
      <div class="rule-main">
        <span class="rule-label">${info}</span>
      </div>
      <div class="rule-actions">
        <button onclick="editRule(${idx})">Edit</button>
        <button onclick="deleteRule(${idx})">Delete</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function renderQuickLinks(quickLinks) {
  quickLinksState = quickLinks || [];
  const container = document.getElementById('quickLinksList');
  if (!container) return;
  container.innerHTML = '';
  quickLinksState.forEach(q => {
    const a = document.createElement('a');
    a.href = q.url;
    a.target = '_blank';
    a.className = 'quick-link-pill';
    a.textContent = q.name;
    container.appendChild(a);
  });
}

// CRUD HELPERS (LOCALSTORAGE FOR NOW)
function getLinksLS() {
  return JSON.parse(localStorage.getItem('links_' + currentHubId) || '[]');
}
function setLinksLS(links) {
  localStorage.setItem('links_' + currentHubId, JSON.stringify(links));
}
function getRulesLS() {
  return JSON.parse(localStorage.getItem('rules_' + currentHubId) || '[]');
}
function setRulesLS(rules) {
  localStorage.setItem('rules_' + currentHubId, JSON.stringify(rules));
}
function getQuickLinksLS() {
  return JSON.parse(localStorage.getItem('quickLinks_' + currentHubId) || '[]');
}
function setQuickLinksLS(ql) {
  localStorage.setItem('quickLinks_' + currentHubId, JSON.stringify(ql));
}

// BUTTON ACTIONS
function openAddLinkModal() {
  const url = prompt('Destination URL');
  if (!url) return;
  const title = prompt('Title (optional)');
  const links = getLinksLS();
  links.push({ id: Date.now(), url, title });
  setLinksLS(links);
  renderLinks(links);
}

function addQuickLink() {
  const name = prompt('Quick link label');
  if (!name) return;
  const url = prompt('Quick link URL');
  if (!url) return;
  const quickLinks = getQuickLinksLS();
  quickLinks.push({ id: Date.now(), name, url });
  setQuickLinksLS(quickLinks);
  renderQuickLinks(quickLinks);
}

function openSettings() {
  alert('Settings panel (stub) – here you can configure hub name, theme, and custom domain.');
}

function openUsageStats() {
  alert('Usage stats (stub) – detailed charts and export are available on the Analytics page.');
}

function openHelp() {
  alert('Help & onboarding (stub) – walkthrough for creating rules and sharing your public hub.');
}

// LINK / RULE EDITING
function editLink(idx) {
  const links = getLinksLS();
  const link = links[idx];
  if (!link) return;
  const url = prompt('Update URL', link.url);
  if (!url) return;
  const title = prompt('Update Title', link.title || '');
  links[idx] = { ...link, url, title };
  setLinksLS(links);
  renderLinks(links);
}

function deleteLink(idx) {
  const links = getLinksLS();
  links.splice(idx, 1);
  setLinksLS(links);
  renderLinks(links);
}

function editRule(idx) {
  const rules = getRulesLS();
  const rule = rules[idx];
  if (!rule) return;
  const type = prompt('Rule type (geo/time/device)', rule.type);
  let updated = { ...rule, type };
  if (type === 'device') {
    const deviceType = prompt('Device type (desktop/mobile/tablet)', rule.deviceType || 'desktop');
    updated.deviceType = deviceType;
    updated.target = rule.target;
  } else {
    const target = prompt('Target URL / value', rule.target || '');
    updated.target = target;
    delete updated.deviceType;
  }
  rules[idx] = updated;
  setRulesLS(rules);
  renderRules(rules);
}

function deleteRule(idx) {
  const rules = getRulesLS();
  rules.splice(idx, 1);
  setRulesLS(rules);
  renderRules(rules);
}


const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cors());
app.use(express.json());

const limiter = rateLimit({ windowMs: 60000, max: 100 });
app.use('/api/', limiter);

// API Routes
app.post('/api/hubs', (req, res) => { /* Create hub */ });
app.get('/api/hubs/:id', (req, res) => { /* Get hub */ });
app.post('/api/hubs/:id/links', (req, res) => { /* Add link */ });
app.get('/api/hubs/:id/analytics', (req, res) => { /* Get analytics */ });

app.listen(3000, () => console.log('Server running on port 3000'));
