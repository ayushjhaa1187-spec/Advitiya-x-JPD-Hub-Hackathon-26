const fs = require('fs').promises;
const path = require('path');

class OfflineService {
  constructor() {
    this.cacheDir = path.join(__dirname, '../../cache/static');
  }

  /**
   * Generate static HTML for offline access
   * @param {object} hub - Hub object with all links
   * @returns {Promise<string>} HTML content
   */
  async generateStaticHTML(hub) {
    try {
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${hub.title} - Link Hub</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #ffffff;
      color: #1f2937;
      line-height: 1.6;
    }
    
    body.dark-mode {
      background: #111827;
      color: #f3f4f6;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .header {
      text-align: center;
      margin-bottom: 3rem;
      border-bottom: 2px solid #22c55e;
      padding-bottom: 2rem;
    }
    
    .header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      color: #22c55e;
    }
    
    .header p {
      color: #6b7280;
      font-size: 1.1rem;
    }
    
    body.dark-mode .header p {
      color: #d1d5db;
    }
    
    .qr-section {
      text-align: center;
      margin: 2rem 0;
      padding: 1.5rem;
      background: #f9fafb;
      border-radius: 0.5rem;
    }
    
    body.dark-mode .qr-section {
      background: #1f2937;
    }
    
    .qr-section img {
      max-width: 200px;
      margin: 1rem 0;
    }
    
    .links-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .link-card {
      display: block;
      padding: 1.5rem;
      background: #f3f4f6;
      border-radius: 0.5rem;
      text-decoration: none;
      color: #1f2937;
      border-left: 4px solid #22c55e;
      transition: all 0.3s ease;
    }
    
    body.dark-mode .link-card {
      background: #1f2937;
      color: #f3f4f6;
    }
    
    .link-card:hover {
      transform: translateX(4px);
      background: #e5e7eb;
    }
    
    body.dark-mode .link-card:hover {
      background: #374151;
    }
    
    .link-card h3 {
      color: #22c55e;
      margin-bottom: 0.5rem;
      font-size: 1.1rem;
    }
    
    .link-card p {
      font-size: 0.9rem;
      opacity: 0.8;
      margin-bottom: 0.5rem;
    }
    
    .link-card .url {
      font-size: 0.85rem;
      word-break: break-all;
      color: #6b7280;
    }
    
    body.dark-mode .link-card .url {
      color: #9ca3af;
    }
    
    .footer {
      text-align: center;
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 0.9rem;
    }
    
    body.dark-mode .footer {
      border-top-color: #374151;
      color: #9ca3af;
    }
    
    .offline-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: #fef3c7;
      color: #92400e;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 500;
      margin-bottom: 1rem;
    }
    
    .theme-toggle {
      position: fixed;
      top: 1rem;
      right: 1rem;
      background: #22c55e;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      cursor: pointer;
      font-weight: 500;
    }
    
    .theme-toggle:hover {
      background: #16a34a;
    }
  </style>
</head>
<body>
  <button class="theme-toggle" onclick="toggleTheme()">🌙 Dark Mode</button>
  
  <div class="container">
    <div class="header">
      <h1>${hub.title}</h1>
      <p>${hub.description || 'Your Link Hub'}</p>
    </div>
    
    <div class="offline-badge">📡 Offline Mode</div>
    
    ${hub.qrCode ? `
    <div class="
