function toggleRuleConfig() {
  const ruleType = document.getElementById('ruleType').value;
  const panels = {
      time: document.getElementById('config-time'),
      location: document.getElementById('config-location'),
      device: document.getElementById('config-device')
  };

  Object.values(panels).forEach(panel => panel.classList.add('hidden'));

  if (ruleType !== 'none' && panels[ruleType]) {
      panels[ruleType].classList.remove('hidden');
  }
}
// ============================================
// ERROR DISPLAY & VALIDATION MANAGEMENT
// ============================================

class ErrorManager {
  constructor(containerId = 'error-container') {
    this.containerId = containerId;
    this.errors = [];
    this.ensureContainer();
  }

  // Create error container if it doesn't exist
  ensureContainer() {
    let container = document.getElementById(this.containerId);
    
    if (!container) {
      container = document.createElement('div');
      container.id = this.containerId;
      container.className = 'error-container';
      
      // Insert at top of main content
      const mainContent = document.querySelector('main') || 
                         document.querySelector('.dashboard') ||
                         document.body;
      mainContent.insertBefore(container, mainContent.firstChild);
    }
    
    return container;
  }

  // Add error message
  addError(message) {
    if (!this.errors.includes(message)) {
      this.errors.push(message);
    }
    this.render();
  }

  // Add multiple errors
  addErrors(errorArray) {
    this.errors = [...this.errors, ...errorArray];
    this.render();
  }

  // Remove specific error
  removeError(message) {
    this.errors = this.errors.filter(err => err !== message);
    this.render();
  }

  // Clear all errors
  clearErrors() {
    this.errors = [];
    this.render();
  }

  // Render error display
  render() {
    const container = this.ensureContainer();
    
    // If no errors, hide container
    if (this.errors.length === 0) {
      container.innerHTML = '';
      container.style.display = 'none';
      return;
    }

    // Show container
    container.style.display = 'block';

    // Build HTML
    const errorHTML = `
      <div class="validation-errors">
        <div class="error-header">
          <svg class="error-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h4>Please fix the following errors:</h4>
          <button class="error-dismiss" onclick="errorManager.clearErrors()">✕</button>
        </div>
        <ul class="error-list">
          ${this.errors.map(err => `
            <li class="error-item">
              <span class="error-bullet">✗</span>
              <span class="error-text">${err}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;

    container.innerHTML = errorHTML;
  }
}

// Initialize error manager globally
const errorManager = new ErrorManager('error-container');
