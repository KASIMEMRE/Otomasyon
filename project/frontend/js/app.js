/**
 * Main application file
 * Handles routing and page initialization
 */

// Application routes
const routes = {
  '/': 'login.html',
  '/index.html': 'login.html',
  '/login.html': { 
    init: initLoginPage,
    public: true 
  },
  '/register.html': { 
    init: initRegisterPage,
    public: true 
  },
  '/dashboard.html': { 
    init: initDashboardPage,
    public: false 
  },
  '/create-record.html': { 
    init: initCreateRecordPage,
    public: false 
  },
  '/my-records.html': { 
    init: initMyRecordsPage,
    public: false 
  },
  '/profile.html': { 
    init: initProfilePage,
    public: false 
  }
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  // Get current path
  const path = window.location.pathname;
  
  // If path is root or index, redirect to login
  if (path === '/' || path === '/index.html') {
    window.location.href = '/login.html';
    return;
  }
  
  // Find route
  const route = routes[path];
  
  if (!route) {
    // Route not found, redirect to login
    window.location.href = '/login.html';
    return;
  }
  
  // Check if authenticated for protected routes
  if (!route.public && !auth.isAuthenticated()) {
    window.location.href = '/login.html';
    return;
  }
  
  // Initialize page
  if (typeof route.init === 'function') {
    route.init();
  }
  
  // Initialize common elements
  initCommonElements();
});

// Initialize common elements across all pages
function initCommonElements() {
  // Add navigation if authenticated
  if (auth.isAuthenticated() && !window.location.pathname.includes('/admin/')) {
    const navbarContainer = document.createElement('div');
    navbarContainer.className = 'navbar';
    navbarContainer.innerHTML = `
      <div class="container navbar-container">
      <a href="/dashboard.html" class="navbar-brand">
        <i class="fas fa-cube"></i> İşçi Talep Sistemi
      </a>
      <ul class="navbar-nav">
        <li class="nav-item">
        <a href="/dashboard.html" class="nav-link ${window.location.pathname === '/dashboard.html' ? 'active' : ''}">
          <i class="fas fa-tachometer-alt"></i> Kontrol Paneli
        </a>
        </li>
        <li class="nav-item">
        <a href="/my-records.html" class="nav-link ${window.location.pathname === '/my-records.html' ? 'active' : ''}">
          <i class="fas fa-list"></i> Kayıtlarım
        </a>
        </li>
        <li class="nav-item">
        <a href="/create-record.html" class="nav-link ${window.location.pathname === '/create-record.html' ? 'active' : ''}">
          <i class="fas fa-plus-circle"></i> Yeni Kayıt
        </a>
        </li>
        <li class="nav-item">
        <a href="/profile.html" class="nav-link ${window.location.pathname === '/profile.html' ? 'active' : ''}">
          <i class="fas fa-user"></i> Profil
        </a>
        </li>
        <li class="nav-item">
        <a href="#" class="nav-link" id="logout">
          <i class="fas fa-sign-out-alt"></i> Çıkış Yap
        </a>
        </li>
      </ul>
      </div>
    `;
    
    // Insert navbar at the beginning of body
    document.body.insertBefore(navbarContainer, document.body.firstChild);
    
    // Add logout event listener
    document.getElementById('logout').addEventListener('click', (e) => {
      e.preventDefault();
      auth.logout();
    });
  }
}

// Login page
function initLoginPage() {
  // If already authenticated, redirect to dashboard
  if (auth.isAuthenticated()) {
    window.location.href = '/dashboard.html';
    return;
  }
  
  const appContainer = document.getElementById('app');
  appContainer.innerHTML = `
    <div class="auth-container">
      <div class="auth-form card">
        <div class="auth-logo">
          <i class="fas fa-cube" style="font-size: 3rem; color: var(--user-primary);"></i>
        </div>
        <h1 class="auth-title">Hesabınıza Giriş Yapın</h1>
        
        <div id="loginAlert"></div>
        
        <form id="loginForm">
          <div class="form-group">
            <label for="email" class="form-label">E-posta Adresi</label>
            <input type="email" id="email" name="email" class="form-control" required>
          </div>
          
          <div class="form-group">
            <label for="password" class="form-label">Şifre</label>
            <input type="password" id="password" name="password" class="form-control" required>
            <small class="form-text"><a href="#">Şifrenizi mi unuttunuz?</a></small>
          </div>
          
          <div class="form-group">
            <div class="form-check">
              <input type="checkbox" id="rememberMe" name="rememberMe" class="form-check-input">
              <label for="rememberMe" class="form-check-label">Beni hatırla</label>
            </div>
          </div>
          
          <div class="form-group">
            <button type="submit" class="btn btn-primary" style="width: 100%;">Giriş Yap</button>
          </div>
        </form>
        
        <div class="auth-footer">
          <p>Hesabınız yok mu? <a href="/register.html">Buradan kayıt olun</a></p>
        </div>
      </div>
    </div>
  `;
  
  // Handle form submission
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
      // Show loading state
      const submitButton = loginForm.querySelector('button[type="submit"]');
      submitButton.innerHTML = '<span class="spinner"></span> Logging in...';
      submitButton.disabled = true;
      
      await auth.login(email, password);
      
      // Redirect to dashboard
      window.location.href = '/dashboard.html';
    } catch (error) {
      // Show error
      const alertContainer = document.getElementById('loginAlert');
      alertContainer.innerHTML = `
        <div class="alert alert-danger">
          ${error.message || 'Invalid email or password'}
        </div>
      `;
      
      // Reset button
      submitButton.innerHTML = 'Login';
      submitButton.disabled = false;
    }
  });
}

// Register page
function initRegisterPage() {
  // If already authenticated, redirect to dashboard
  if (auth.isAuthenticated()) {
    window.location.href = '/dashboard.html';
    return;
  }
  
  const appContainer = document.getElementById('app');
  appContainer.innerHTML = `
    <div class="auth-container">
      <div class="auth-form card">
        <div class="auth-logo">
          <i class="fas fa-cube" style="font-size: 3rem; color: var(--user-primary);"></i>
        </div>
        <h1 class="auth-title">Hesap Oluştur</h1>
        
        <div id="registerAlert"></div>
        
        <form id="registerForm">
          <div class="row">
            <div class="col">
              <div class="form-group">
                <label for="firstName" class="form-label">Ad</label>
                <input type="text" id="firstName" name="firstName" class="form-control" required>
              </div>
            </div>
            <div class="col">
              <div class="form-group">
                <label for="lastName" class="form-label">Soyad</label>
                <input type="text" id="lastName" name="lastName" class="form-control" required>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="email" class="form-label">E-posta Adresi</label>
            <input type="email" id="email" name="email" class="form-control" required>
          </div>
          
          <div class="form-group">
            <label for="phone" class="form-label">Telefon Numarası (isteğe bağlı)</label>
            <input type="tel" id="phone" name="phone" class="form-control">
          </div>
          
          <div class="form-group">
            <label for="password" class="form-label">Şifre</label>
            <input type="password" id="password" name="password" class="form-control" required minlength="6">
            <small class="form-text">Şifre en az 6 karakter olmalıdır</small>
          </div>
          
          <div class="form-group">
            <label for="passwordConfirm" class="form-label">Şifreyi Onayla</label>
            <input type="password" id="passwordConfirm" name="passwordConfirm" class="form-control" required>
          </div>
          
          <div class="form-group">
            <button type="submit" class="btn btn-primary" style="width: 100%;">Kayıt Ol</button>
          </div>
        </form>
        
        <div class="auth-footer">
          <p>Zaten bir hesabınız var mı? <a href="/login.html">Buradan giriş yapın</a></p>
        </div>
      </div>
    </div>
  `;
  
  // Handle form submission
  const registerForm = document.getElementById('registerForm');
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(registerForm);
    
    // Validate form
    const validationFields = [
      { name: 'firstName', label: 'First Name', required: true },
      { name: 'lastName', label: 'Last Name', required: true },
      { name: 'email', label: 'Email', required: true, type: 'email' },
      { name: 'phone', label: 'Phone', required: false, type: 'tel' },
      { name: 'password', label: 'Password', required: true, type: 'password', minLength: 6 },
      { name: 'passwordConfirm', label: 'Confirm Password', required: true }
    ];
    
    const validation = utils.validateForm(formData, validationFields);
    
    if (!validation.isValid) {
      // Show validation errors
      const errorMessages = Object.values(validation.errors).join('<br>');
      document.getElementById('registerAlert').innerHTML = `
        <div class="alert alert-danger">
          ${errorMessages}
        </div>
      `;
      return;
    }
    
    // Define submitButton before the try/catch block
    const submitButton = registerForm.querySelector('button[type="submit"]');
    
    try {
      // Show loading state
      submitButton.innerHTML = '<span class="spinner"></span> Registering...';
      submitButton.disabled = true;
      
      const userData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password: formData.get('password')
      };
      
      await auth.register(userData);
      
      // Redirect to dashboard
      window.location.href = '/dashboard.html';
    } catch (error) {
      // Show error
      const alertContainer = document.getElementById('registerAlert');
      alertContainer.innerHTML = `
        <div class="alert alert-danger">
          ${error.message || 'Registration failed. Please try again.'}
        </div>
      `;
      
      // Reset button
      submitButton.innerHTML = 'Register';
      submitButton.disabled = false;
    }
  });
}

// Dashboard page
function initDashboardPage() {
  // Check if authenticated
  if (!auth.checkAuth()) return;
  
  const appContainer = document.getElementById('app');
  
  // Get user data
  const user = auth.getCurrentUser();
  
  appContainer.innerHTML = `
    <div class="container">
      <div class="row">
        <div class="col">
          <div class="card">
            <h2>Hoş geldiniz, ${user.firstName}!</h2>
            <p>Kayıtlarınızın özeti aşağıda yer almaktadır.</p>
          </div>
        </div>
      </div>
      
      <div id="recordStats" class="row">
        <div class="col">
          <div class="stats-card">
            <div class="stats-card-title">Toplam Kayıt</div>
            <div class="stats-card-value" id="totalRecords">-</div>
          </div>
        </div>
        <div class="col">
          <div class="stats-card">
            <div class="stats-card-title">Bekleyen</div>
            <div class="stats-card-value" id="pendingRecords">-</div>
          </div>
        </div>
        <div class="col">
          <div class="stats-card">
            <div class="stats-card-title">Tamamlanan</div>
            <div class="stats-card-value" id="completedRecords">-</div>
          </div>
        </div>
        <div class="col">
          <div class="stats-card">
            <div class="stats-card-title">İşleniyor</div>
            <div class="stats-card-value" id="processingRecords">-</div>
          </div>
        </div>
      </div>
      
      <div class="row">
        <div class="col">
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <h3>Son Kayıtlar</h3>
              <a href="/my-records.html" class="btn btn-outline">Tümünü Gör</a>
            </div>
            <div id="recentRecords">
              <div class="loading">
                <div class="spinner"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Load user records
  loadUserRecords();
}

// Load user records for dashboard
async function loadUserRecords() {
  try {
    const token = auth.getToken();
    const records = await utils.fetchAPI('/records', 'GET', null, token);
    
    // Update stats
    const totalRecords = records.length;
    const pendingRecords = records.filter(record => record.status === 'Pending').length;
    const processingRecords = records.filter(record => record.status === 'Processing').length;
    const completedRecords = records.filter(record => record.status === 'Completed').length;
    
    document.getElementById('totalRecords').textContent = totalRecords;
    document.getElementById('pendingRecords').textContent = pendingRecords;
    document.getElementById('completedRecords').textContent = completedRecords;
    document.getElementById('processingRecords').textContent = processingRecords;
    
    // Display recent records (up to 5)
    const recentRecords = records.slice(0, 5);
    const recentRecordsContainer = document.getElementById('recentRecords');
    
    if (recentRecords.length === 0) {
      recentRecordsContainer.innerHTML = `
        <div class="text-center py-3">
          <p>Henüz herhangi bir kayıt oluşturmadınız.</p>
          <a href="/create-record.html" class="btn btn-primary mt-2">İlk Kaydınızı Oluşturun</a>
        </div>
      `;
    } else {
      let recordsHtml = '';
      
      recentRecords.forEach(record => {
        recordsHtml += `
          <div class="record-card slide-in-up">
            <div class="record-title">${record.title}</div>
            <div class="record-meta">
              <span>Category: ${record.category}</span>
              <span>Date: ${utils.formatDate(record.date)}</span>
            </div>
            <div class="record-meta">
              <span>Status: ${utils.formatStatus(record.status)}</span>
              <span>Created: ${utils.formatDate(record.createdAt)}</span>
            </div>
            <div class="record-description">${record.description.substring(0, 100)}${record.description.length > 100 ? '...' : ''}</div>
            <div class="record-actions">
              <a href="/my-records.html?id=${record._id}" class="btn btn-outline">View Details</a>
            </div>
          </div>
        `;
      });
      
      recentRecordsContainer.innerHTML = recordsHtml;
    }
  } catch (error) {
    console.error('Error loading records:', error);
    document.getElementById('recentRecords').innerHTML = `
      <div class="alert alert-danger">
        Error loading records. Please try again.
      </div>
    `;
  }
}

// Create record page
function initCreateRecordPage() {
  // Check if authenticated
  if (!auth.checkAuth()) return;
  
  const appContainer = document.getElementById('app');
  
  appContainer.innerHTML = `
    <div class="container">
      <div class="row">
        <div class="col">
          <div class="card">
            <h2 class="mb-3">Yeni Kayıt Oluştur</h2>
            
            <div id="createRecordAlert"></div>
            
            <form id="createRecordForm">
              <div class="form-group">
                <label for="title" class="form-label">Başlık</label>
                <input type="text" id="title" name="title" class="form-control" required>
              </div>
              
              <div class="form-group">
                <label for="category" class="form-label">Kategori</label>
                <select id="category" name="category" class="form-select">
                  <option value="General">Genel</option>
                  <option value="Support">Destek</option>
                  <option value="Request">Talep</option>
                  <option value="Issue">Sorun</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="date" class="form-label">Tarih</label>
                <input type="date" id="date" name="date" class="form-control">
              </div>
              
              <div class="form-group">
                <label for="description" class="form-label">Açıklama</label>
                <textarea id="description" name="description" class="form-control" rows="5" required></textarea>
              </div>
              
              <div class="form-group">
                <button type="submit" class="btn btn-primary">Kayıt Oluştur</button>
                <a href="/dashboard.html" class="btn btn-outline">İptal</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Set default date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date').value = today;
  
  // Handle form submission
  const createRecordForm = document.getElementById('createRecordForm');
  createRecordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(createRecordForm);
    
    // Validate form
    const validationFields = [
      { name: 'title', label: 'Title', required: true },
      { name: 'description', label: 'Description', required: true }
    ];
    
    const validation = utils.validateForm(formData, validationFields);
    
    if (!validation.isValid) {
      // Show validation errors
      const errorMessages = Object.values(validation.errors).join('<br>');
      document.getElementById('createRecordAlert').innerHTML = `
        <div class="alert alert-danger">
          ${errorMessages}
        </div>
      `;
      return;
    }
    
    try {
      // Show loading state
      const submitButton = createRecordForm.querySelector('button[type="submit"]');
      submitButton.innerHTML = '<span class="spinner"></span> Creating...';
      submitButton.disabled = true;
      
      const recordData = {
        title: formData.get('title'),
        description: formData.get('description'),
        category: formData.get('category'),
        date: formData.get('date') || new Date().toISOString()
      };
      
      const token = auth.getToken();
      await utils.fetchAPI('/records', 'POST', recordData, token);
      
      // Show success message and redirect
      utils.showAlert('Record created successfully!', 'success');
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1000);
    } catch (error) {
      // Show error
      document.getElementById('createRecordAlert').innerHTML = `
        <div class="alert alert-danger">
          ${error.message || 'Failed to create record. Please try again.'}
        </div>
      `;
      
      // Reset button
      submitButton.innerHTML = 'Create Record';
      submitButton.disabled = false;
    }
  });
}

// My records page
function initMyRecordsPage() {
  // Check if authenticated
  if (!auth.checkAuth()) return;
  
  const appContainer = document.getElementById('app');
  
  // Check if we have a record ID in query params
  const urlParams = new URLSearchParams(window.location.search);
  const recordId = urlParams.get('id');
  
  if (recordId) {
    // Show single record view
    appContainer.innerHTML = `
      <div class="container">
      <div class="row">
        <div class="col">
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h2>Kayıt Detayları</h2>
          <a href="/my-records.html" class="btn btn-outline">
            <i class="fas fa-arrow-left"></i> Kayıtlara Geri Dön
          </a>
          </div>
          
          <div id="recordDetails">
          <div class="loading">
            <div class="spinner"></div>
          </div>
          </div>
        </div>
        </div>
      </div>
      </div>
    `;
    
    // Load record details
    loadRecordDetails(recordId);
  } else {
    // Show records list view
    appContainer.innerHTML = `
      <div class="container">
      <div class="row">
        <div class="col">
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h2>Kayıtlarım</h2>
          <a href="/create-record.html" class="btn btn-primary">
            <i class="fas fa-plus-circle"></i> Yeni Kayıt
          </a>
          </div>
          
          <div class="mb-3" style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <div>
            <label for="categoryFilter" class="form-label">Kategori:</label>
            <select id="categoryFilter" class="form-select">
            <option value="">Tüm Kategoriler</option>
            <option value="General">Genel</option>
            <option value="Support">Destek</option>
            <option value="Request">Talep</option>
            <option value="Issue">Sorun</option>
            </select>
          </div>
          
          <div>
            <label for="statusFilter" class="form-label">Durum:</label>
            <select id="statusFilter" class="form-select">
            <option value="">Tüm Durumlar</option>
            <option value="Pending">Beklemede</option>
            <option value="Processing">İşleniyor</option>
            <option value="Completed">Tamamlandı</option>
            <option value="Rejected">Reddedildi</option>
            </select>
          </div>
          
          <div>
            <label for="searchFilter" class="form-label">Ara:</label>
            <input type="text" id="searchFilter" class="form-control" placeholder="Başlıklarda ara...">
          </div>
          
          <div>
            <label for="dateFromFilter" class="form-label">Başlangıç:</label>
            <input type="date" id="dateFromFilter" class="form-control">
          </div>
          
          <div>
            <label for="dateToFilter" class="form-label">Bitiş:</label>
            <input type="date" id="dateToFilter" class="form-control">
          </div>
          
          <div style="display: flex; align-items: flex-end;">
            <button id="applyFilters" class="btn btn-primary">Filtreleri Uygula</button>
          </div>
          </div>
          
          <div id="recordsList">
          <div class="loading">
            <div class="spinner"></div>
          </div>
          </div>
        </div>
        </div>
      </div>
      </div>
    `;
    
    // Load records list
    loadRecordsList();
    
    // Add filter event listeners
    document.getElementById('applyFilters').addEventListener('click', () => {
      loadRecordsList();
    });
  }
}

// Load records list with filters
async function loadRecordsList() {
  try {
    const token = auth.getToken();
    
    // Get filter values
    const category = document.getElementById('categoryFilter').value;
    const status = document.getElementById('statusFilter').value;
    const searchTerm = document.getElementById('searchFilter').value;
    const dateFrom = document.getElementById('dateFromFilter').value;
    const dateTo = document.getElementById('dateToFilter').value;
    
    // Build query string
    let queryString = '';
    if (category) queryString += `&category=${category}`;
    if (status) queryString += `&status=${status}`;
    if (dateFrom) queryString += `&startDate=${dateFrom}`;
    if (dateTo) queryString += `&endDate=${dateTo}`;
    
    // Remove leading & if exists
    if (queryString.startsWith('&')) {
      queryString = queryString.substring(1);
    }
    
    // Fetch records with filters
    let records = await utils.fetchAPI(`/records${queryString ? '?' + queryString : ''}`, 'GET', null, token);
    
    // Apply client-side search filter if provided
    if (searchTerm) {
      records = records.filter(record => 
        record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    const recordsListContainer = document.getElementById('recordsList');
    
    if (records.length === 0) {
      recordsListContainer.innerHTML = `
        <div class="text-center py-3">
          <p>Hiç kayıt bulunamadı.</p>
          <a href="/create-record.html" class="btn btn-primary mt-2">Yeni Kayıt Oluştur</a>
        </div>
      `;
    } else {
      let recordsHtml = '';
      
      records.forEach(record => {
        recordsHtml += `
          <div class="record-card slide-in-up">
            <div class="record-title">${record.title}</div>
            <div class="record-meta">
              <span>Category: ${record.category}</span>
              <span>Date: ${utils.formatDate(record.date)}</span>
            </div>
            <div class="record-meta">
              <span>Status: ${utils.formatStatus(record.status)}</span>
              <span>Created: ${utils.formatDate(record.createdAt)}</span>
            </div>
            <div class="record-description">${record.description.substring(0, 150)}${record.description.length > 150 ? '...' : ''}</div>
            <div class="record-actions">
              <a href="/my-records.html?id=${record._id}" class="btn btn-outline">Ayrıntıları Görüntüle</a>
              <button class="btn btn-danger delete-record" data-id="${record._id}">Sil</button>
            </div>
          </div>
        `;
      });
      
      recordsListContainer.innerHTML = recordsHtml;
      
      // Add event listeners for delete buttons
      document.querySelectorAll('.delete-record').forEach(button => {
        button.addEventListener('click', (e) => {
          const recordId = e.target.dataset.id;
          showDeleteConfirmation(recordId);
        });
      });
    }
  } catch (error) {
    console.error('Error loading records:', error);
    document.getElementById('recordsList').innerHTML = `
      <div class="alert alert-danger">
        Kayıtlar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
      </div>
    `;
  }
}

// Load single record details
async function loadRecordDetails(recordId) {
  try {
    const token = auth.getToken();
    const record = await utils.fetchAPI(`/records/${recordId}`, 'GET', null, token);
    
    const recordDetailsContainer = document.getElementById('recordDetails');
    
    recordDetailsContainer.innerHTML = `
      <div class="record-card">
        <h3 class="record-title">${record.title}</h3>
        
        <div class="py-2" style="display: flex; gap: 2rem; flex-wrap: wrap;">
          <div>
            <strong>Kategori:</strong> ${record.category}
          </div>
          <div>
            <strong>Durum:</strong> ${utils.formatStatus(record.status)}
          </div>
          <div>
            <strong>Tarih:</strong> ${utils.formatDate(record.date)}
          </div>
          <div>
            <strong>Oluşturmak:</strong> ${utils.formatDateTime(record.createdAt)}
          </div>
          <div>
            <strong>Son Güncelleme:</strong> ${utils.formatDateTime(record.updatedAt)}
          </div>
        </div>
        
        <div class="mt-3">
          <h4>Description</h4>
          <p>${record.description}</p>
        </div>
        
        <div class="mt-3 record-actions">
          <button id="editRecordBtn" class="btn btn-primary">Kayıt Düzenle</button>
          <button id="deleteRecordBtn" class="btn btn-danger">Kayıt Düzenle</button>
        </div>
      </div>
    `;
    
    // Add event listeners
    document.getElementById('editRecordBtn').addEventListener('click', () => {
      showEditRecordForm(record);
    });
    
    document.getElementById('deleteRecordBtn').addEventListener('click', () => {
      showDeleteConfirmation(recordId);
    });
  } catch (error) {
    console.error('Error loading record details:', error);
    document.getElementById('recordDetails').innerHTML = `
      <div class="alert alert-danger">
        Kayıt detayları yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
      </div>
    `;
  }
}

// Show edit record form in modal
function showEditRecordForm(record) {
  const modalContent = `
    <form id="editRecordForm">
      <div class="form-group">
        <label for="editTitle" class="form-label">Başlık</label>
        <input type="text" id="editTitle" name="title" class="form-control" value="${record.title}" required>
      </div>
      
      <div class="form-group">
        <label for="editCategory" class="form-label">Kategori</label>
        <select id="editCategory" name="category" class="form-select">
          <option value="General" ${record.category === 'General' ? 'selected' : ''}>Genel</option>
          <option value="Support" ${record.category === 'Support' ? 'selected' : ''}>Destek</option>
          <option value="Request" ${record.category === 'Request' ? 'selected' : ''}>İstek</option>
          <option value="Issue" ${record.category === 'Issue' ? 'selected' : ''}>Problem</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="editDate" class="form-label">Tarih</label>
        <input type="date" id="editDate" name="date" class="form-control" value="${new Date(record.date).toISOString().split('T')[0]}">
      </div>
      
      <div class="form-group">
        <label for="editDescription" class="form-label">Açıklama</label>
        <textarea id="editDescription" name="description" class="form-control" rows="5" required>${record.description}</textarea>
      </div>
      
      <div id="editRecordAlert"></div>
    </form>
  `;
  
  const modalFooter = `
    <button type="button" class="btn btn-outline" id="cancelEditBtn">İptal</button>
    <button type="button" class="btn btn-primary" id="saveRecordBtn">Değişiklikleri Kaydet</button>
  `;
  
  const modal = utils.showModal({
    title: 'Edit Record',
    content: modalContent,
    footer: modalFooter
  });
  
  // Add event listeners
  document.getElementById('cancelEditBtn').addEventListener('click', () => {
    utils.closeAllModals();
  });
  
  document.getElementById('saveRecordBtn').addEventListener('click', async () => {
    try {
      const formData = new FormData(document.getElementById('editRecordForm'));
      
      // Validate form
      const validationFields = [
        { name: 'title', label: 'Title', required: true },
        { name: 'description', label: 'Description', required: true }
      ];
      
      const validation = utils.validateForm(formData, validationFields);
      
      if (!validation.isValid) {
        // Show validation errors
        const errorMessages = Object.values(validation.errors).join('<br>');
        document.getElementById('editRecordAlert').innerHTML = `
          <div class="alert alert-danger mt-3">
            ${errorMessages}
          </div>
        `;
        return;
      }
      
      // Show loading state
      const saveButton = document.getElementById('saveRecordBtn');
      saveButton.innerHTML = '<span class="spinner"></span> Saving...';
      saveButton.disabled = true;
      
      const recordData = {
        title: formData.get('title'),
        description: formData.get('description'),
        category: formData.get('category'),
        date: formData.get('date')
      };
      
      const token = auth.getToken();
      await utils.fetchAPI(`/records/${record._id}`, 'PUT', recordData, token);
      
      // Close modal and refresh data
      utils.closeAllModals();
      utils.showAlert('Record updated successfully!', 'success');
      loadRecordDetails(record._id);
    } catch (error) {
      // Show error
      document.getElementById('editRecordAlert').innerHTML = `
        <div class="alert alert-danger mt-3">
          ${error.message || 'Failed to update record. Please try again.'}
        </div>
      `;
      
      // Reset button
      saveButton.innerHTML = 'Save Changes';
      saveButton.disabled = false;
    }
  });
}

// Show delete confirmation modal
function showDeleteConfirmation(recordId) {
  const modalContent = `
    <div class="text-center">
      <div style="font-size: 4rem; color: var(--status-rejected);">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <h3 class="mt-3">Kayıtı Sil</h3>
      <p class="mt-2">Bu kaydı silmek istediğine emin misin?</p>
    </div>
  `;
  
  const modalFooter = `
    <button type="button" class="btn btn-outline" id="cancelDeleteBtn">İptal</button>
    <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Sil</button>
  `;
  
  const modal = utils.showModal({
    title: 'Confirm Delete',
    content: modalContent,
    footer: modalFooter
  });
  
  // Add event listeners
  document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
    utils.closeAllModals();
  });
  
  document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
    try {
      // Show loading state
      const deleteButton = document.getElementById('confirmDeleteBtn');
      deleteButton.innerHTML = '<span class="spinner"></span> Deleting...';
      deleteButton.disabled = true;
      
      const token = auth.getToken();
      await utils.fetchAPI(`/records/${recordId}`, 'DELETE', null, token);
      
      // Close modal and redirect/refresh
      utils.closeAllModals();
      utils.showAlert('Record deleted successfully!', 'success');
      
      // If we're on the record detail page, go back to list
      if (window.location.search.includes('id=')) {
        window.location.href = '/my-records.html';
      } else {
        // Otherwise just refresh the list
        loadRecordsList();
      }
    } catch (error) {
      // Show error in modal
      utils.showAlert('Failed to delete record. Please try again.', 'danger');
      
      // Reset button
      deleteButton.innerHTML = 'Delete';
      deleteButton.disabled = false;
    }
  });
}

// Profile page
function initProfilePage() {
  // Check if authenticated
  if (!auth.checkAuth()) return;
  
  const appContainer = document.getElementById('app');
  
  appContainer.innerHTML = `
    <div class="container">
      <div class="row">
        <div class="col">
          <div class="card">
            <h2 class="mb-3">Profilim</h2>
            
            <div id="profileAlert"></div>
            
            <div id="profileForm">
              <div class="loading">
                <div class="spinner"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Load profile data
  loadProfileData();
}

// Load profile data
async function loadProfileData() {
  try {
    const token = auth.getToken();
    const user = await utils.fetchAPI('/users/profile', 'GET', null, token);
    
    const profileFormContainer = document.getElementById('profileForm');
    
    profileFormContainer.innerHTML = `
      <form id="updateProfileForm">
        <div class="row">
          <div class="col">
            <div class="form-group">
              <label for="firstName" class="form-label">İsim</label>
              <input type="text" id="firstName" name="firstName" class="form-control" value="${user.firstName || ''}" required>
            </div>
          </div>
          <div class="col">
            <div class="form-group">
              <label for="lastName" class="form-label">Soyisim</label>
              <input type="text" id="lastName" name="lastName" class="form-control" value="${user.lastName || ''}" required>
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label for="email" class="form-label">E-mail Adres</label>
          <input type="email" id="email" name="email" class="form-control" value="${user.email || ''}" readonly>
          <small class="form-text">E-mail adresi değiştirilemez.</small>
        </div>
        
        <div class="form-group">
          <label for="phone" class="form-label">Telefon Numarası</label>
          <input type="tel" id="phone" name="phone" class="form-control" value="${user.phone || ''}">
        </div>
        
        <div class="mt-4">
          <h3>Şifreyi Değiştir</h3>
          <p class="text-muted">Güncel şifreni kullanmak istiyorsan boşluk bırak.</p>
          
          <div class="form-group">
            <label for="password" class="form-label">Yeni Şifre</label>
            <input type="password" id="password" name="password" class="form-control" minlength="6">
            <small class="form-text">Şifre en az 6 karakter olmalıdır.</small>
          </div>
          
          <div class="form-group">
            <label for="passwordConfirm" class="form-label">Yeni Şifreyi Onayla</label>
            <input type="password" id="passwordConfirm" name="passwordConfirm" class="form-control">
          </div>
        </div>
        
        <div class="form-group mt-4">
          <button type="submit" class="btn btn-primary">Profili Güncelle</button>
        </div>
      </form>
    `;
    
    // Handle form submission
    const updateProfileForm = document.getElementById('updateProfileForm');
    updateProfileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(updateProfileForm);
      
      // Check if passwords match if provided
      const password = formData.get('password');
      const passwordConfirm = formData.get('passwordConfirm');
      
      if (password && password !== passwordConfirm) {
        document.getElementById('profileAlert').innerHTML = `
          <div class="alert alert-danger">
            Şifre Eşleşmiyor.
          </div>
        `;
        return;
      }
      
      try {
        // Show loading state
        const submitButton = updateProfileForm.querySelector('button[type="submit"]');
        submitButton.innerHTML = '<span class="spinner"></span> Updating...';
        submitButton.disabled = true;
        
        const userData = {
          firstName: formData.get('firstName'),
          lastName: formData.get('lastName'),
          phone: formData.get('phone')
        };
        
        // Only include password if provided
        if (password) {
          userData.password = password;
        }
        
        await auth.updateProfile(userData);
        
        // Show success message
        document.getElementById('profileAlert').innerHTML = `
          <div class="alert alert-success">
            Profil Güncellemesi Başarılı.
          </div>
        `;
        
        // Reset button
        submitButton.innerHTML = 'Update Profile';
        submitButton.disabled = false;
        
        // Clear password fields
        document.getElementById('password').value = '';
        document.getElementById('passwordConfirm').value = '';
      } catch (error) {
        // Show error
        document.getElementById('profileAlert').innerHTML = `
          <div class="alert alert-danger">
            ${error.message || 'Failed to update profile. Please try again.'}
          </div>
        `;
        
        // Reset button
        submitButton.innerHTML = 'Update Profile';
        submitButton.disabled = false;
      }
    });
  } catch (error) {
    console.error('Error loading profile:', error);
    document.getElementById('profileForm').innerHTML = `
      <div class="alert alert-danger">
        Profil ile ilgili veriler yüklenemiyor. Lütfen tekrar deneyin.
      </div>
    `;
  }
}