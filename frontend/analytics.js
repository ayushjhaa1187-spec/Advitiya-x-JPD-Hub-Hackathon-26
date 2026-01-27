// Analytics.js - Complete CSV Export and Analytics Functionality
// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api'
    : 'https://your-backend-url.onrender.com/api'; // Update with your deployed backend URL

let analyticsChart = null;
let currentAnalyticsData = [];

// Initialize analytics page
document.addEventListener('DOMContentLoaded', async () => {
    await loadAnalytics();
    setupEventListeners();
});

function setupEventListeners() {
    // Export CSV button
    const exportBtn = document.getElementById('exportCsvBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
    }

    // Device filter
    const deviceFilter = document.getElementById('deviceFilter');
    if (deviceFilter) {
        deviceFilter.addEventListener('change', filterAnalytics);
    }

    // Date range filter
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');
    if (dateFrom) dateFrom.addEventListener('change', filterAnalytics);
    if (dateTo) dateTo.addEventListener('change', filterAnalytics);
}

// Load analytics data from API
async function loadAnalytics() {
    try {
        showLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
            window.location.href = '/frontend/login.html';
            return;
        }

        const response = await fetch(`${API_BASE_URL}/analytics`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/frontend/login.html';
            return;
        }

        if (!response.ok) {
            throw new Error('Failed to fetch analytics data');
        }

        const data = await response.json();
        currentAnalyticsData = data.analytics || [];
        
        displayAnalytics(currentAnalyticsData);
        updateStats(currentAnalyticsData);
        renderChart(currentAnalyticsData);
        
    } catch (error) {
        console.error('Error loading analytics:', error);
        showError('Failed to load analytics data. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Display analytics in table
function displayAnalytics(data) {
    const tbody = document.getElementById('analyticsTableBody');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No analytics data available</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${escapeHtml(item.short_code || 'N/A')}</td>
            <td><a href="${escapeHtml(item.original_url || '#')}" target="_blank" class="text-blue-600 hover:underline">${truncateUrl(item.original_url || 'N/A', 50)}</a></td>
            <td>${item.clicks || 0}</td>
            <td><span class="device-badge ${getDeviceClass(item.device_type)}">${escapeHtml(item.device_type || 'Unknown')}</span></td>
            <td>${escapeHtml(item.country || 'Unknown')}</td>
            <td>${formatDate(item.last_clicked)}</td>
        </tr>
    `).join('');
}

// Update statistics cards
function updateStats(data) {
    const totalClicks = data.reduce((sum, item) => sum + (item.clicks || 0), 0);
    const totalLinks = new Set(data.map(item => item.short_code)).size;
    const avgClicksPerLink = totalLinks > 0 ? (totalClicks / totalLinks).toFixed(1) : 0;
    
    // Count devices
    const deviceCounts = {};
    data.forEach(item => {
        const device = item.device_type || 'Unknown';
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });
    const topDevice = Object.keys(deviceCounts).sort((a, b) => deviceCounts[b] - deviceCounts[a])[0] || 'N/A';

    // Update DOM
    updateStatCard('totalClicks', totalClicks);
    updateStatCard('totalLinks', totalLinks);
    updateStatCard('avgClicks', avgClicksPerLink);
    updateStatCard('topDevice', topDevice);
}

function updateStatCard(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Render Chart.js chart
function renderChart(data) {
    const canvas = document.getElementById('analyticsChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart
    if (analyticsChart) {
        analyticsChart.destroy();
    }

    // Prepare data for chart
    const linkData = {};
    data.forEach(item => {
        const code = item.short_code || 'Unknown';
        linkData[code] = (linkData[code] || 0) + (item.clicks || 0);
    });

    const sortedLinks = Object.entries(linkData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Top 10 links

    analyticsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedLinks.map(([code]) => code),
            datasets: [{
                label: 'Clicks',
                data: sortedLinks.map(([, clicks]) => clicks),
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Top 10 Links by Clicks'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// Filter analytics based on device and date range
function filterAnalytics() {
    const deviceFilter = document.getElementById('deviceFilter')?.value || 'all';
    const dateFrom = document.getElementById('dateFrom')?.value;
    const dateTo = document.getElementById('dateTo')?.value;

    let filtered = [...currentAnalyticsData];

    // Filter by device
    if (deviceFilter !== 'all') {
        filtered = filtered.filter(item => 
            (item.device_type || 'Unknown').toLowerCase() === deviceFilter.toLowerCase()
        );
    }

    // Filter by date range
    if (dateFrom) {
        const fromDate = new Date(dateFrom);
        filtered = filtered.filter(item => {
            const itemDate = new Date(item.last_clicked);
            return itemDate >= fromDate;
        });
    }

    if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        filtered = filtered.filter(item => {
            const itemDate = new Date(item.last_clicked);
            return itemDate <= toDate;
        });
    }

    displayAnalytics(filtered);
    updateStats(filtered);
    renderChart(filtered);
}

// Export analytics to CSV
function exportToCSV() {
    try {
        if (currentAnalyticsData.length === 0) {
            showError('No data available to export');
            return;
        }

        // Prepare CSV data
        const headers = ['Short Code', 'Original URL', 'Clicks', 'Device Type', 'Country', 'Last Clicked'];
        const rows = currentAnalyticsData.map(item => [
            item.short_code || '',
            item.original_url || '',
            item.clicks || 0,
            item.device_type || 'Unknown',
            item.country || 'Unknown',
            formatDateForCSV(item.last_clicked)
        ]);

        // Create CSV content
        let csvContent = headers.join(',') + '\n';
        rows.forEach(row => {
            csvContent += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
        });

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `analytics_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        showSuccess('Analytics exported successfully!');
    } catch (error) {
        console.error('Error exporting CSV:', error);
        showError('Failed to export CSV. Please try again.');
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function truncateUrl(url, maxLength) {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
}

function getDeviceClass(deviceType) {
    const device = (deviceType || '').toLowerCase();
    if (device.includes('mobile')) return 'device-mobile';
    if (device.includes('tablet')) return 'device-tablet';
    return 'device-desktop';
}

function formatDate(dateString) {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateForCSV(dateString) {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toISOString();
}

function showLoading(show) {
    const loader = document.getElementById('loadingSpinner');
    if (loader) {
        loader.style.display = show ? 'flex' : 'none';
    }
}

function showError(message) {
    showNotification(message, 'error');
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        font-weight: 500;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .device-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        text-transform: capitalize;
    }
    
    .device-mobile {
        background: #dbeafe;
        color: #1e40af;
    }
    
    .device-tablet {
        background: #fce7f3;
        color: #9f1239;
    }
    
    .device-desktop {
        background: #dcfce7;
        color: #166534;
    }
`;
document.head.appendChild(style);
