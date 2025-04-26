/**
 * Utility functions for the application
 */

// Show loading spinner
function showLoading(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
      </div>
    `;
  }
}

// Show error message
function showError(containerId, message) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <div class="alert alert-danger">${message}</div>
    `;
  }
}

// Format date
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Format time
function formatTime(dateString) {
  const options = { hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleTimeString(undefined, options);
}

// Format date and time
function formatDateTime(dateString) {
  return `${formatDate(dateString)} at ${formatTime(dateString)}`;
}

// Show alert/toast message
function showAlert(message, type = 'success', duration = 3000) {
  // Remove any existing alerts
  const existingAlerts = document.querySelectorAll('.alert-toast');
  existingAlerts.forEach(alert => alert.remove());
  
  // Create new alert
  const alert = document.createElement('div');
  alert.className = `alert-toast alert-${type} fade-in`;
  alert.innerHTML = message;
  
  // Style the alert
  alert.style.position = 'fixed';
  alert.style.top = '20px';
  alert.style.right = '20px';
  alert.style.zIndex = '1000';
  alert.style.padding = '12px 24px';
  alert.style.borderRadius = '4px';
  alert.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  
  // Add to body
  document.body.appendChild(alert);
  
  // Remove after duration
  setTimeout(() => {
    alert.style.opacity = '0';
    alert.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
      alert.remove();
    }, 300);
  }, duration);
}

// Validate form
function validateForm(formData, fields) {
  const errors = {};
  
  fields.forEach(field => {
    const value = formData.get(field.name);
    
    // Required check
    if (field.required && (!value || value.trim() === '')) {
      errors[field.name] = `${field.label} is required`;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors[field.name] = 'Please enter a valid email address';
      }
    }
    
    // Password validation
    if (field.type === 'password' && value && field.minLength) {
      if (value.length < field.minLength) {
        errors[field.name] = `Password must be at least ${field.minLength} characters`;
      }
    }
    
    // Password confirmation
    if (field.name === 'passwordConfirm') {
      if (value !== formData.get('password')) {
        errors[field.name] = 'Passwords do not match';
      }
    }
    
    // Phone validation
    if (field.type === 'tel' && value) {
      const phoneRegex = /^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
      if (!phoneRegex.test(value)) {
        errors[field.name] = 'Please enter a valid phone number';
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// API request helper
async function fetchAPI(endpoint, method = 'GET', data = null, token = null) {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
      method,
      headers
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`/api${endpoint}`, options);
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || 'Something went wrong');
    }
    
    return responseData;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Create and show modal
function showModal(options) {
  // Remove any existing modals
  closeAllModals();
  
  // Create modal element
  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'modal-backdrop';
  modalBackdrop.id = 'modalBackdrop';
  
  const modalHtml = `
    <div class="modal" id="modal">
      <div class="modal-header">
        <div class="modal-title">${options.title}</div>
        <button class="modal-close" id="modalClose">&times;</button>
      </div>
      <div class="modal-body">
        ${options.content}
      </div>
      <div class="modal-footer">
        ${options.footer}
      </div>
    </div>
  `;
  
  modalBackdrop.innerHTML = modalHtml;
  
  // Add to body
  document.body.appendChild(modalBackdrop);
  
  // Add close event
  document.getElementById('modalClose').addEventListener('click', closeAllModals);
  
  // Show modal with animation
  setTimeout(() => {
    modalBackdrop.classList.add('show');
  }, 10);
  
  // Return modal element for further manipulation
  return {
    backdrop: modalBackdrop,
    modal: document.getElementById('modal'),
    close: closeAllModals
  };
}

// Close all modals
function closeAllModals() {
  const modalBackdrop = document.getElementById('modalBackdrop');
  if (modalBackdrop) {
    modalBackdrop.classList.remove('show');
    
    setTimeout(() => {
      modalBackdrop.remove();
    }, 300);
  }
}

// Format status with badge
function formatStatus(status) {
  const statusMap = {
    'Pending': 'badge-pending',
    'Processing': 'badge-processing',
    'Completed': 'badge-completed',
    'Rejected': 'badge-rejected'
  };
  
  return `<span class="badge ${statusMap[status] || 'badge-secondary'}">${status}</span>`;
}

// Redirect to page
function redirectTo(page) {
  window.location.href = page;
}

// Export all utils
window.utils = {
  showLoading,
  showError,
  formatDate,
  formatTime,
  formatDateTime,
  showAlert,
  validateForm,
  fetchAPI,
  showModal,
  closeAllModals,
  formatStatus,
  redirectTo
};