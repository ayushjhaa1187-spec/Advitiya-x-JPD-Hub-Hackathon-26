// Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    loadLinks();
});

// Create Short Link
function createLink(e) {
    e.preventDefault();
    
    const longUrl = document.getElementById('longUrl').value;
    const customSlug = document.getElementById('customSlug').value || null;
    const description = document.getElementById('description').value || null;
    const category = document.getElementById('category').value || null;
    const expiryDate = document.getElementById('expiryDate').value || null;

    const linkData = {
        longUrl,
        customSlug,
        description,
        category,
        expiryDate
    };

    fetch(`${API_BASE_URL}/links/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(linkData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showMessage('✅ Link created successfully!', 'success');
            document.getElementById('createLinkForm').reset();
            loadLinks();
            loadDashboardData();
        } else {
            showMessage('❌ Error: ' + (data.message || 'Failed to create link'), 'error');
        }
    })
    .catch(err => {
        console.error('Error:', err);
        showMessage('❌ Error creating link: ' + err.message, 'error');
    });
}

// Load all links
function loadLinks() {
    fetch(`${API_BASE_URL}/links`)
    .then(res => res.json())
    .then(data => {
        const linksList = document.getElementById('linksList');
        
        if (!data.links || data.links.length === 0) {
            linksList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-link"></i>
                    <p>No short links created yet. Start by creating one above!</p>
                </div>
            `;
            return;
        }

        linksList.innerHTML = data.links.map(link => `
            <div class="link-item">
                <div class="link-info">
                    <h4>${link.description || 'Untitled Link'}</h4>
                    <p>Original: <a href="${link.longUrl}" target="_blank" class="short-link">${link.longUrl.substring(0, 50)}...</a></p>
                    <p>Short: <a href="https://short.link/${link.shortCode}" target="_blank" class="short-link">short.link/${link.shortCode}</a></p>
                    ${link.category ? `<p>Category: <strong>${link.category}</strong></p>` : ''}
                </div>
                <div class="link-stats">
                    <div class="stat">
                        <div class="stat-value">${link.clicks || 0}</div>
                        <div class="stat-label">Clicks</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${new Date(link.createdAt).toLocaleDateString()}</div>
                        <div class="stat-label">Created</div>
                    </div>
                </div>
                <div class="link-actions">
                    <button class="btn-action" onclick="showQRCode('${link.shortCode}')">
                        <i class="fas fa-qrcode"></i> QR
                    </button>
                    <button class="btn-action" onclick="copyLink('${link.shortCode}')">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteLink('${link._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    })
    .catch(err => {
        console.error('Error loading links:', err);
        document.getElementById('linksList').innerHTML = '<p>Error loading links</p>';
    });
}

// Load Dashboard Data
function loadDashboardData() {
    fetch(`${API_BASE_URL}/stats`)
    .then(res => res.json())
    .then(data => {
        if (data.stats) {
            document.getElementById('totalLinks').textContent = data.stats.totalLinks || 0;
            document.getElementById('totalClicks').textContent = data.stats.totalClicks || 0;
            document.getElementById('clicksToday').textContent = data.stats.clicksToday || 0;
        }
    })
    .catch(err => console.error('Error loading stats:', err));
}

// Show QR Code
function showQRCode(shortCode) {
    const qrImage = document.getElementById('qrImage');
    const modalShortLink = document.getElementById('modalShortLink');
    const shortUrl = `https://short.link/${shortCode}`;
    
    // Using QR Server API (free, no authentication needed)
    qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shortUrl)}`;
    modalShortLink.textContent = `Short Link: ${shortUrl}`;
    
    document.getElementById('qrModal').classList.add('active');
}

// Close Modal
function closeModal() {
    document.getElementById('qrModal').classList.remove('active');
}

// Copy Link to Clipboard
function copyLink(shortCode) {
    const shortUrl = `https://short.link/${shortCode}`;
    navigator.clipboard.writeText(shortUrl).then(() => {
        showMessage('✅ Link copied to clipboard!', 'success');
    }).catch(err => {
        showMessage('❌ Failed to copy link', 'error');
    });
}

// Delete Link
function deleteLink(linkId) {
    if (!confirm('Are you sure you want to delete this link? This action cannot be undone.')) {
        return;
    }

    fetch(`${API_BASE_URL}/links/${linkId}`, {
        method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showMessage('✅ Link deleted successfully!', 'success');
            loadLinks();
            loadDashboardData();
        } else {
            showMessage('❌ Error deleting link', 'error');
        }
    })
    .catch(err => {
        console.error('Error:', err);
        showMessage('❌ Error deleting link', 'error');
    });
}

// Show Message
function showMessage(message, type) {
    const messageBox = document.getElementById('messageBox');
    const className = type === 'success' ? 'success-message' : 'error-message';
    
    messageBox.innerHTML = `<div class="${className}">${message}</div>`;
    messageBox.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 5000);
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        window.location.href = 'landing.html';
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('qrModal');
    if (e.target === modal) {
        closeModal();
    }
});

