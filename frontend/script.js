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
// ============================================
// VALIDATION FUNCTIONS
// ============================================

// Validate time rule
function validateTimeRule(rule) {
  const errors = [];

  // Check hours are valid (0-23)
  if (rule.startHour < 0 || rule.startHour > 23) {
    errors.push('Start hour must be between 0 (midnight) and 23 (11 PM)');
  }

  if (rule.endHour < 0 || rule.endHour > 23) {
    errors.push('End hour must be between 0 and 23');
  }

  // Check end is after start
  if (rule.startHour >= rule.endHour) {
    errors.push('End hour must be after start hour');
  }

  // Check at least one day selected
  if (!rule.daysOfWeek || rule.daysOfWeek.length === 0) {
    errors.push('Select at least one day of week');
  }

  // Check days are valid (0-6)
  if (rule.daysOfWeek) {
    const invalidDays = rule.daysOfWeek.filter(d => d < 0 || d > 6);
    if (invalidDays.length > 0) {
      errors.push('Invalid day selection');
    }
  }

  return errors;
}

// Validate device rule
function validateDeviceRule(rule) {
  const errors = [];

  if (!rule.devices || rule.devices.length === 0) {
    errors.push('Select at least one device');
  }

  return errors;
}

// Validate location rule
function validateLocationRule(rule) {
  const errors = [];

  if (!rule.country) {
    errors.push('Select a country');
  }

  return errors;
}

// Validate performance rule
function validatePerformanceRule(rule) {
  const errors = [];

  if (!rule.percentile) {
    errors.push('Select a percentile');
  }

  const validPercentiles = ['top1', 'top5', 'top10', 'bottom5', 'bottom10'];
  if (rule.percentile && !validPercentiles.includes(rule.percentile)) {
    errors.push('Invalid percentile selection');
  }

  return errors;
}

// Master validation function
function validateRule(rule) {
  if (!rule.type) {
    return ['Rule type is required'];
  }

  switch (rule.type) {
    case 'time':
      return validateTimeRule(rule);
    case 'device':
      return validateDeviceRule(rule);
    case 'location':
      return validateLocationRule(rule);
    case 'performance':
      return validatePerformanceRule(rule);
    default:
      return ['Unknown rule type'];
  }
}

// Validate link form
function validateLinkForm(title, url) {
  const errors = [];

  if (!title || title.trim().length === 0) {
    errors.push('Link title is required');
  }

  if (title && title.trim().length < 3) {
    errors.push('Link title must be at least 3 characters');
  }

  if (!url || url.trim().length === 0) {
    errors.push('Destination URL is required');
  }

  if (url && !isValidURL(url)) {
    errors.push('Please enter a valid URL (must start with http:// or https://)');
  }

  return errors;
}

// Helper: Check if URL is valid
function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
