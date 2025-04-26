/**
 * Admin Panel JavaScript
 * Handles all admin functionality
 */

// Admin routes
const adminRoutes = {
  '/admin/': { init: initAdminDashboard, title: 'Yönetici Cevap Paneli' },
  '/admin/index.html': { init: initAdminDashboard, title: 'Yönetim Paneli' },
  '/admin/login.html': { init: initAdminLogin, title: 'Yönetici Girişi', public: true },
  '/admin/users.html': { init: initUsersPage, title: 'Kullanıcı Yönetimi' },
  '/admin/records.html': { init: initRecordsPage, title: 'Kayıt Yönetimi' },
  '/admin/settings.html': { init: initSettingsPage, title: 'Sistem Ayarları' }
};

// Initialize admin application
document.addEventListener('DOMContentLoaded', () => {
  // Get current path
  const path = window.location.pathname;
  
  // Handle login page separately
  if (path === '/admin/login.html') {
    initAdminLogin();
    return;
  }
  
  // Check admin authentication except for public routes
  const route = adminRoutes[path];
  
  if (!route) {
    // Route not found, redirect to admin dashboard
    window.location.href = '/admin/login.html';
    return;
  }
  
  // Check if authenticated for protected routes
  if (!route.public && !auth.isAdmin()) {
    window.location.href = '/admin/login.html';
    return;
  }
  
  // Render admin layout
  renderAdminLayout(route.title);
  
  // Initialize page
  if (typeof route.init === 'function') {
    route.init();
  }
});

// Render admin layout with sidebar
function renderAdminLayout(pageTitle) {
  const adminApp = document.getElementById('adminApp');
  
  adminApp.innerHTML = `
    <div class="admin-layout">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo">
            <i class="fas fa-cogs"></i> Yönetim
          </div>
          <button class="sidebar-toggle" id="sidebarToggle">
            <i class="fas fa-bars"></i>
          </button>
        </div>
        
        <nav class="sidebar-menu">
          <div class="sidebar-menu-item ${pageTitle === 'Dashboard' ? 'active' : ''}" data-page="/admin/index.html">
            <i class="fas fa-tachometer-alt"></i> Yönetim Paneli
          </div>
          <div class="sidebar-menu-item ${pageTitle === 'User Management' ? 'active' : ''}" data-page="/admin/users.html">
            <i class="fas fa-users"></i> Kullanıcılar
          </div>
          <div class="sidebar-menu-item ${pageTitle === 'Records Management' ? 'active' : ''}" data-page="/admin/records.html">
            <i class="fas fa-clipboard-list"></i> Kayıtlar
          </div>
          <div class="sidebar-menu-item ${pageTitle === 'System Settings' ? 'active' : ''}" data-page="/admin/settings.html">
            <i class="fas fa-cog"></i> Ayarlar
          </div>
          <div class="sidebar-menu-item" id="adminLogout">
            <i class="fas fa-sign-out-alt"></i> Çıkış Yap
          </div>
        </nav>
      </aside>
      
      <main class="main-content" id="mainContent">
        <header class="header">
          <div class="header-title">
            ${pageTitle}
          </div>
          
          <div class="header-actions">
            <div class="user-dropdown">
              <button class="user-dropdown-toggle" id="userDropdownToggle">
                <i class="fas fa-user-circle" style="font-size: 1.5rem;"></i>
                <span id="adminName">Yönetici</span>
                <i class="fas fa-chevron-down"></i>
              </button>
              
              <div class="user-dropdown-menu" id="userDropdownMenu">
                <div class="user-dropdown-item" id="adminProfile">
                  <i class="fas fa-user"></i> Profil
                </div>
                <div class="user-dropdown-item" id="adminLogoutDropdown">
                  <i class="fas fa-sign-out-alt"></i> Çıkış Yap
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <div id="adminContent">
          <!-- Sayfa içeriği buraya yüklenecek -->
        </div>
      </main>
    </div>
  `;
  
  // Set admin name
  const user = auth.getCurrentUser();
  if (user) {
    document.getElementById('adminName').textContent = `${user.firstName} ${user.lastName}`;
  }
  
  // Add event listeners
  document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
  document.getElementById('userDropdownToggle').addEventListener('click', toggleUserDropdown);
  document.getElementById('adminLogout').addEventListener('click', () => logoutAdmin());
  document.getElementById('adminLogoutDropdown').addEventListener('click', () => logoutAdmin());
  
  // Add navigation events to sidebar items
  document.querySelectorAll('.sidebar-menu-item[data-page]').forEach(item => {
    item.addEventListener('click', () => {
      window.location.href = item.dataset.page;
    });
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('userDropdownMenu');
    const toggle = document.getElementById('userDropdownToggle');
    
    if (!toggle.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('show');
    }
  });
}

// Toggle sidebar for mobile
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('show');
}

// Toggle user dropdown
function toggleUserDropdown() {
  const dropdown = document.getElementById('userDropdownMenu');
  dropdown.classList.toggle('show');
}

// Logout admin
function logoutAdmin() {
  auth.logout('/admin/login.html');
}

// Admin login page
function initAdminLogin() {
  // If already authenticated as admin, redirect to dashboard
  if (auth.isAdmin()) {
    window.location.href = '/admin/index.html';
    return;
  }
  
  // Reset body classes for login page
  document.body.className = 'admin-login-page';
  
  const adminApp = document.getElementById('adminApp');
  adminApp.innerHTML = `
    <div class="auth-container">
      <div class="auth-form card">
        <div class="auth-logo">
          <i class="fas fa-cogs" style="font-size: 3rem; color: var(--admin-primary);"></i>
        </div>
        <h1 class="auth-title">Yönetici Girişi</h1>
        
        <div id="adminLoginAlert"></div>
        
        <form id="adminLoginForm">
          <div class="form-group">
            <label for="email" class="form-label">E-posta Adresi</label>
            <input type="email" id="email" name="email" class="form-control" required>
          </div>
          
          <div class="form-group">
            <label for="password" class="form-label">Şifre</label>
            <input type="password" id="password" name="password" class="form-control" required>
          </div>
          
          <div class="form-group">
            <button type="submit" class="btn btn-primary" style="width: 100%;">Yönetim Paneline Giriş Yap</button>
          </div>
        </form>
        
        <div class="auth-footer">
          <p><a href="/login.html">Kullanıcı Girişine Dön</a></p>
        </div>
      </div>
    </div>
  `;
  
  // Handle form submission
  const adminLoginForm = document.getElementById('adminLoginForm');
  adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
      // Show loading state
      const submitButton = adminLoginForm.querySelector('button[type="submit"]');
      submitButton.innerHTML = '<span class="spinner"></span> Logging in...';
      submitButton.disabled = true;
      
      await auth.adminLogin(email, password);
      
      // Redirect to admin dashboard
      window.location.href = '/admin/index.html';
    } catch (error) {
      // Show error
      const alertContainer = document.getElementById('adminLoginAlert');
      alertContainer.innerHTML = `
        <div class="alert alert-danger">
          ${error.message || 'Invalid admin credentials'}
        </div>
      `;
      
      // Reset button
      submitButton.innerHTML = 'Login to Admin Panel';
      submitButton.disabled = false;
    }
  });
}

// Admin dashboard page
function initAdminDashboard() {
  const adminContent = document.getElementById('adminContent');
  
  adminContent.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon users">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value" id="totalUsers">-</div>
          <div class="stat-label">Toplam Kullanıcılar</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon records">
          <i class="fas fa-clipboard-list"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value" id="totalRecords">-</div>
          <div class="stat-label">Toplam Kayıtlar</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon pending">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value" id="pendingRecords">-</div>
          <div class="stat-label">Bekleyen Kayıtlar</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon completed">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value" id="completedRecords">-</div>
          <div class="stat-label">Tamamlanan Kayıtlar</div>
        </div>
      </div>
    </div>
    
    <div class="row">
      <div class="col">
        <div class="chart-container">
          <div class="chart-header">
            <div class="chart-title">Kayıt Aktivitesi (Son 7 Gün)</div>
          </div>
          <div class="chart-body">
            <canvas id="recordsChart"></canvas>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row">
      <div class="col">
        <div class="chart-container">
          <div class="chart-header">
            <div class="chart-title">Duruma Göre Kayıtlar</div>
          </div>
          <div class="chart-body" style="height: 250px;">
            <canvas id="statusChart"></canvas>
          </div>
        </div>
      </div>
      
      <div class="col">
        <div class="chart-container">
          <div class="chart-header">
            <div class="chart-title">Son Etkinlikler</div>
          </div>
          <div id="recentActivity">
            <div class="loading">
              <div class="spinner"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Load dashboard data
  loadDashboardData();
}

// Load dashboard data
async function loadDashboardData() {
  try {
    const token = auth.getToken();
    const stats = await utils.fetchAPI('/admin/stats', 'GET', null, token);
    
    // Update stats
    document.getElementById('totalUsers').textContent = stats.totalUsers;
    document.getElementById('totalRecords').textContent = stats.totalRecords;
    document.getElementById('pendingRecords').textContent = stats.statusCounts.pending;
    document.getElementById('completedRecords').textContent = stats.statusCounts.completed;
    
    // Records activity chart
    const activityChartCtx = document.getElementById('recordsChart').getContext('2d');
    const activityChart = new Chart(activityChartCtx, {
      type: 'line',
      data: {
        labels: stats.last7Days.map(day => day.date),
        datasets: [{
          label: 'New Records',
          data: stats.last7Days.map(day => day.count),
          borderColor: '#4a90e2',
          backgroundColor: 'rgba(74, 144, 226, 0.1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false
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
    
    // Status chart
    const statusChartCtx = document.getElementById('statusChart').getContext('2d');
    const statusChart = new Chart(statusChartCtx, {
      type: 'doughnut',
      data: {
        labels: ['Pending', 'Processing', 'Completed', 'Rejected'],
        datasets: [{
          data: [
            stats.statusCounts.pending,
            stats.statusCounts.processing,
            stats.statusCounts.completed,
            stats.statusCounts.rejected
          ],
          backgroundColor: [
            '#fbbc05',
            '#4a90e2',
            '#34a853',
            '#ea4335'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          }
        },
        cutout: '70%'
      }
    });
    
    // Load recent activity
    loadRecentActivity();
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    utils.showAlert('Error loading dashboard data', 'danger');
  }
}

// Load recent activity
async function loadRecentActivity() {
  try {
    const token = auth.getToken();
    const records = await utils.fetchAPI('/admin/records?limit=5', 'GET', null, token);
    
    const activityContainer = document.getElementById('recentActivity');
    
    if (records.length === 0) {
      activityContainer.innerHTML = `
        <p class="text-center py-3">No recent activity</p>
      `;
      return;
    }
    
    let activityHtml = `
      <div class="activity-list">
    `;
    
    // Sort by created date, newest first
    records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Take only the 5 most recent
    const recentRecords = records.slice(0, 5);
    
    recentRecords.forEach(record => {
      activityHtml += `
        <div class="activity-item">
          <div class="activity-content">
            <div class="activity-title">
              <strong>${record.user.firstName} ${record.user.lastName}</strong> created a new record: <strong>${record.title}</strong>
            </div>
            <div class="activity-meta">
              <span>${utils.formatDateTime(record.createdAt)}</span>
              <span>${utils.formatStatus(record.status)}</span>
            </div>
          </div>
        </div>
      `;
    });
    
    activityHtml += `
      </div>
      <div class="text-center mt-3">
      <a href="/admin/records.html" class="btn btn-outline">Tüm Kayıtları Görüntüle</a>
      </div>
    `;
    
    activityContainer.innerHTML = activityHtml;
  } catch (error) {
    console.error('Error loading recent activity:', error);
    document.getElementById('recentActivity').innerHTML = `
      <div class="alert alert-danger">
        Error loading recent activity
      </div>
    `;
  }
}

// User management page
function initUsersPage() {
  const adminContent = document.getElementById('adminContent');
  
  adminContent.innerHTML = `
    <div class="table-filter">
      <div>
        <h3>Kullanıcı Yönetimi</h3>
      </div>
      <div class="filter-form">
        <div class="filter-group">
          <input type="text" id="userSearchInput" class="form-control" placeholder="Kullanıcıları ara...">
        </div>
        <div class="filter-group">
          <button id="searchUsersBtn" class="btn btn-primary">Ara</button>
        </div>
      </div>
    </div>
    
    <div class="card">
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Ad Soyad</th>
              <th>E-posta</th>
              <th>Telefon</th>
              <th>Rol</th>
              <th>Kayıt Tarihi</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody id="usersTableBody">
            <tr>
              <td colspan="6" class="text-center">
                <div class="spinner"></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  // Load users data
  loadUsers();
  
  // Add search event listener
  document.getElementById('searchUsersBtn').addEventListener('click', loadUsers);
  document.getElementById('userSearchInput').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      loadUsers();
    }
  });
}

// Load users data
async function loadUsers() {
  try {
    const token = auth.getToken();
    const users = await utils.fetchAPI('/admin/users', 'GET', null, token);
    
    const searchTerm = document.getElementById('userSearchInput').value.toLowerCase();
    
    // Filter users if search term provided
    const filteredUsers = searchTerm ? 
      users.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      ) : users;
    
    const tableBody = document.getElementById('usersTableBody');
    
    if (filteredUsers.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">Kullanıcı bulunamadı</td>
        </tr>
      `;
      return;
    }
    
    let tableHtml = '';
    
    filteredUsers.forEach(user => {
      tableHtml += `
        <tr>
          <td>${user.firstName} ${user.lastName}</td>
          <td>${user.email}</td>
          <td>${user.phone || 'N/A'}</td>
          <td>${user.isAdmin ? '<span class="badge badge-processing">Admin</span>' : '<span class="badge badge-pending">User</span>'}</td>
          <td>${utils.formatDate(user.createdAt)}</td>
          <td class="table-actions">
            <button class="btn btn-outline edit-user" data-id="${user._id}" title="Edit User">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger delete-user" data-id="${user._id}" title="Delete User">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });
    
    tableBody.innerHTML = tableHtml;
    
    // Add event listeners
    document.querySelectorAll('.edit-user').forEach(button => {
      button.addEventListener('click', (e) => {
        const userId = e.target.closest('.edit-user').dataset.id;
        editUser(userId);
      });
    });
    
    document.querySelectorAll('.delete-user').forEach(button => {
      button.addEventListener('click', (e) => {
        const userId = e.target.closest('.delete-user').dataset.id;
        deleteUser(userId);
      });
    });
  } catch (error) {
    console.error('Error loading users:', error);
    document.getElementById('usersTableBody').innerHTML = `
      <tr>
      <td colspan="6" class="text-center">
        <div class="alert alert-danger">Kullanıcılar yüklenirken bir hata oluştu</div>
      </td>
      </tr>
    `;
  }
}

// Edit user
async function editUser(userId) {
  try {
    const token = auth.getToken();
    const user = await utils.fetchAPI(`/admin/users/${userId}`, 'GET', null, token);
    
    const modalContent = `
      <form id="editUserForm">
      <div class="row">
        <div class="col">
        <div class="form-group">
          <label for="firstName" class="form-label">Ad</label>
          <input type="text" id="firstName" name="firstName" class="form-control" value="${user.firstName}" required>
        </div>
        </div>
        <div class="col">
        <div class="form-group">
          <label for="lastName" class="form-label">Soyad</label>
          <input type="text" id="lastName" name="lastName" class="form-control" value="${user.lastName}" required>
        </div>
        </div>
      </div>
      
      <div class="form-group">
        <label for="email" class="form-label">E-posta Adresi</label>
        <input type="email" id="email" name="email" class="form-control" value="${user.email}" required>
      </div>
      
      <div class="form-group">
        <label for="phone" class="form-label">Telefon Numarası</label>
        <input type="tel" id="phone" name="phone" class="form-control" value="${user.phone || ''}">
      </div>
      
      <div class="form-group">
        <div class="form-check">
        <input type="checkbox" id="isAdmin" name="isAdmin" class="form-check-input" ${user.isAdmin ? 'checked' : ''}>
        <label for="isAdmin" class="form-check-label">Yönetici Erişimi</label>
        </div>
      </div>
      
      <div id="editUserAlert"></div>
      </form>
    `;
    
    const modalFooter = `
      <button type="button" class="btn btn-outline" id="cancelEditBtn">İptal</button>
      <button type="button" class="btn btn-primary" id="saveUserBtn">Değişiklikleri Kaydet</button>
    `;
    
    const modal = utils.showModal({
      title: 'Edit User',
      content: modalContent,
      footer: modalFooter
    });
    
    // Add event listeners
    document.getElementById('cancelEditBtn').addEventListener('click', () => {
      utils.closeAllModals();
    });
    
    document.getElementById('saveUserBtn').addEventListener('click', async () => {
      const formData = new FormData(document.getElementById('editUserForm'));
      
      try {
        // Show loading state
        const saveButton = document.getElementById('saveUserBtn');
        saveButton.innerHTML = '<span class="spinner"></span> Saving...';
        saveButton.disabled = true;
        
        const userData = {
          firstName: formData.get('firstName'),
          lastName: formData.get('lastName'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          isAdmin: formData.get('isAdmin') === 'on'
        };
        
        await utils.fetchAPI(`/admin/users/${userId}`, 'PUT', userData, token);
        
        // Close modal and refresh users
        utils.closeAllModals();
        utils.showAlert('User updated successfully', 'success');
        loadUsers();
      } catch (error) {
        // Show error
        document.getElementById('editUserAlert').innerHTML = `
          <div class="alert alert-danger mt-3">
            ${error.message || 'Failed to update user'}
          </div>
        `;
        
        // Reset button
        saveButton.innerHTML = 'Save Changes';
        saveButton.disabled = false;
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    utils.showAlert('Error fetching user data', 'danger');
  }
}

// Delete user
function deleteUser(userId) {
  // Get current user to prevent self-deletion
  const currentUser = auth.getCurrentUser();
  
  if (userId === currentUser._id) {
    utils.showAlert('You cannot delete your own account', 'danger');
    return;
  }
  
  const modalContent = `
    <div class="delete-modal">
      <div class="delete-modal-icon">
        <i class="fas fa-user-times"></i>
      </div>
      <div class="delete-modal-title">Kullanıcıyı Sil</div>
      <div class="delete-modal-text">
        Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm kullanıcı verileri sistemden kaldırılacaktır.
      </div>
    </div>
  `;
  
  const modalFooter = `
    <button type="button" class="btn btn-outline" id="cancelDeleteBtn">İptal</button>
    <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Kullanıcıyı Sil</button>
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
      await utils.fetchAPI(`/admin/users/${userId}`, 'DELETE', null, token);
      
      // Close modal and refresh users
      utils.closeAllModals();
      utils.showAlert('User deleted successfully', 'success');
      loadUsers();
    } catch (error) {
      utils.showAlert(error.message || 'Failed to delete user', 'danger');
      
      // Reset button
      deleteButton.innerHTML = 'Delete User';
      deleteButton.disabled = false;
    }
  });
}

// Records management page
function initRecordsPage() {
  const adminContent = document.getElementById('adminContent');
  
  adminContent.innerHTML = `
    <div class="table-filter">
      <div>
        <h3>Kayıt Yönetimi</h3>
      </div>
      <div class="filter-form">
        <div class="filter-group">
          <label for="categoryFilter" class="filter-label">Kategori:</label>
          <select id="categoryFilter" class="form-select filter-control">
            <option value="">Tüm Kategoriler</option>
            <option value="General">Genel</option>
            <option value="Support">Destek</option>
            <option value="Request">Talep</option>
            <option value="Issue">Sorun</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="statusFilter" class="filter-label">Durum:</label>
          <select id="statusFilter" class="form-select filter-control">
            <option value="">Tüm Durumlar</option>
            <option value="Pending">Beklemede</option>
            <option value="Processing">İşleniyor</option>
            <option value="Completed">Tamamlandı</option>
            <option value="Rejected">Reddedildi</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="dateFromFilter" class="filter-label">Başlangıç:</label>
          <input type="date" id="dateFromFilter" class="form-control filter-control">
        </div>
        
        <div class="filter-group">
          <label for="dateToFilter" class="filter-label">Bitiş:</label>
          <input type="date" id="dateToFilter" class="form-control filter-control">
        </div>
        
        <div class="filter-group">
          <button id="applyFilters" class="btn btn-primary">Filtreleri Uygula</button>
        </div>
      </div>
    </div>
    
    <div class="card">
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Başlık</th>
              <th>Kullanıcı</th>
              <th>Kategori</th>
              <th>Durum</th>
              <th>Tarih</th>
              <th>Oluşturulma</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody id="recordsTableBody">
            <tr>
              <td colspan="7" class="text-center">
                <div class="spinner"></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  // Load records data
  loadRecordsAdmin();
  
  // Add filter event listener
  document.getElementById('applyFilters').addEventListener('click', loadRecordsAdmin);
}

// Load records data for admin
async function loadRecordsAdmin() {
  try {
    const token = auth.getToken();
    
    // Get filter values
    const category = document.getElementById('categoryFilter').value;
    const status = document.getElementById('statusFilter').value;
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
    const records = await utils.fetchAPI(`/admin/records${queryString ? '?' + queryString : ''}`, 'GET', null, token);
    
    const tableBody = document.getElementById('recordsTableBody');
    
    if (records.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">Kayıt bulunamadı</td>
        </tr>
      `;
      return;
    }
    
    let tableHtml = '';
    
    records.forEach(record => {
      tableHtml += `
        <tr>
          <td>${record.title}</td>
          <td>${record.user.firstName} ${record.user.lastName}</td>
          <td>${record.category}</td>
          <td>${utils.formatStatus(record.status)}</td>
          <td>${utils.formatDate(record.date)}</td>
          <td>${utils.formatDate(record.createdAt)}</td>
          <td class="table-actions">
            <button class="btn btn-outline view-record" data-id="${record._id}" title="View Record">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-primary update-status" data-id="${record._id}" title="Update Status">
              <i class="fas fa-exchange-alt"></i>
            </button>
            <button class="btn btn-danger delete-record" data-id="${record._id}" title="Delete Record">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });
    
    tableBody.innerHTML = tableHtml;
    
    // Add event listeners
    document.querySelectorAll('.view-record').forEach(button => {
      button.addEventListener('click', (e) => {
        const recordId = e.target.closest('.view-record').dataset.id;
        viewRecordDetails(recordId);
      });
    });
    
    document.querySelectorAll('.update-status').forEach(button => {
      button.addEventListener('click', (e) => {
        const recordId = e.target.closest('.update-status').dataset.id;
        updateRecordStatus(recordId);
      });
    });
    
    document.querySelectorAll('.delete-record').forEach(button => {
      button.addEventListener('click', (e) => {
        const recordId = e.target.closest('.delete-record').dataset.id;
        deleteRecord(recordId);
      });
    });
  } catch (error) {
    console.error('Error loading records:', error);
    document.getElementById('recordsTableBody').innerHTML = `
      <tr>
      <td colspan="7" class="text-center">
        <div class="alert alert-danger">Kayıtlar yüklenirken bir hata oluştu</div>
      </td>
      </tr>
    `;
  }
}

// View record details
async function viewRecordDetails(recordId) {
  try {
    const token = auth.getToken();
    const record = await utils.fetchAPI(`/records/${recordId}`, 'GET', null, token);
    
    const modalContent = `
      <div>
      <div class="mb-3">
        <strong>Başlık:</strong> ${record.title}
      </div>
      <div class="mb-3">
        <strong>Açıklama:</strong>
        <p>${record.description}</p>
      </div>
      <div class="mb-3">
        <strong>Kategori:</strong> ${record.category}
      </div>
      <div class="mb-3">
        <strong>Durum:</strong> ${utils.formatStatus(record.status)}
      </div>
      <div class="mb-3">
        <strong>Tarih:</strong> ${utils.formatDate(record.date)}
      </div>
      <div class="mb-3">
        <strong>Oluşturulma:</strong> ${utils.formatDateTime(record.createdAt)}
      </div>
      <div class="mb-3">
        <strong>Son Güncelleme:</strong> ${utils.formatDateTime(record.updatedAt)}
      </div>
      </div>
    `;
    
    const modalFooter = `
      <button type="button" class="btn btn-outline" id="closeModalBtn">Kapat</button>
      <button type="button" class="btn btn-primary" id="updateStatusBtn">Durumu Güncelle</button>
    `;
    
    const modal = utils.showModal({
      title: 'Record Details',
      content: modalContent,
      footer: modalFooter
    });
    
    // Add event listeners
    document.getElementById('closeModalBtn').addEventListener('click', () => {
      utils.closeAllModals();
    });
    
    document.getElementById('updateStatusBtn').addEventListener('click', () => {
      utils.closeAllModals();
      updateRecordStatus(recordId);
    });
  } catch (error) {
    console.error('Error fetching record:', error);
    utils.showAlert('Error fetching record details', 'danger');
  }
}

// Update record status
async function updateRecordStatus(recordId) {
  try {
    const token = auth.getToken();
    const record = await utils.fetchAPI(`/records/${recordId}`, 'GET', null, token);
    
    const modalContent = `
      <form id="updateStatusForm">
      <div class="form-group">
        <label for="status" class="form-label">Durum</label>
        <select id="status" name="status" class="form-select">
        <option value="Pending" ${record.status === 'Pending' ? 'selected' : ''}>Beklemede</option>
        <option value="Processing" ${record.status === 'Processing' ? 'selected' : ''}>İşleniyor</option>
        <option value="Completed" ${record.status === 'Completed' ? 'selected' : ''}>Tamamlandı</option>
        <option value="Rejected" ${record.status === 'Rejected' ? 'selected' : ''}>Reddedildi</option>
        </select>
      </div>
      
      <div id="updateStatusAlert"></div>
      </form>
    `;
    
    const modalFooter = `
      <button type="button" class="btn btn-outline" id="cancelUpdateBtn">İptal</button>
      <button type="button" class="btn btn-primary" id="saveStatusBtn">Durumu Güncelle</button>
    `;
    
    const modal = utils.showModal({
      title: 'Update Record Status',
      content: modalContent,
      footer: modalFooter
    });
    
    // Add event listeners
    document.getElementById('cancelUpdateBtn').addEventListener('click', () => {
      utils.closeAllModals();
    });
    
    document.getElementById('saveStatusBtn').addEventListener('click', async () => {
      try {
        // Show loading state
        const saveButton = document.getElementById('saveStatusBtn');
        saveButton.innerHTML = '<span class="spinner"></span> Updating...';
        saveButton.disabled = true;
        
        const status = document.getElementById('status').value;
        
        await utils.fetchAPI(`/admin/records/${recordId}/status`, 'PUT', { status }, token);
        
        // Close modal and refresh records
        utils.closeAllModals();
        utils.showAlert('Record status updated successfully', 'success');
        loadRecordsAdmin();
      } catch (error) {
        // Show error
        document.getElementById('updateStatusAlert').innerHTML = `
          <div class="alert alert-danger mt-3">
            ${error.message || 'Failed to update record status'}
          </div>
        `;
        
        // Reset button
        saveButton.innerHTML = 'Update Status';
        saveButton.disabled = false;
      }
    });
  } catch (error) {
    console.error('Error fetching record:', error);
    utils.showAlert('Error fetching record data', 'danger');
  }
}

// Delete record
function deleteRecord(recordId) {
  const modalContent = `
    <div class="delete-modal">
      <div class="delete-modal-icon">
        <i class="fas fa-clipboard-list"></i>
      </div>
      <div class="delete-modal-title">Kaydı Sil</div>
      <div class="delete-modal-text">
        Bu kaydı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
      </div>
    </div>
  `;
  
  const modalFooter = `
    <button type="button" class="btn btn-outline" id="cancelDeleteBtn">İptal</button>
    <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Kaydı Sil</button>
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
      
      // Close modal and refresh records
      utils.closeAllModals();
      utils.showAlert('Record deleted successfully', 'success');
      loadRecordsAdmin();
    } catch (error) {
      utils.showAlert(error.message || 'Failed to delete record', 'danger');
      
      // Reset button
      deleteButton.innerHTML = 'Delete Record';
      deleteButton.disabled = false;
    }
  });
}

// Settings page
function initSettingsPage() {
  const adminContent = document.getElementById('adminContent');
  
  adminContent.innerHTML = `
    <div class="row">
      <div class="col">
        <div class="card">
          <h3 class="mb-3">Sistem Ayarları</h3>
          
          <form id="settingsForm">
            <div class="form-group">
              <label for="siteName" class="form-label">Site Adı</label>
              <input type="text" id="siteName" name="siteName" class="form-control" value="Otomasyon Sistemi">
            </div>
            
            <div class="form-group">
              <label for="supportEmail" class="form-label">Destek E-posta</label>
              <input type="email" id="supportEmail" name="supportEmail" class="form-control" value="destek@ornek.com">
            </div>
            
            <div class="form-group">
              <label for="recordCategories" class="form-label">Kayıt Kategorileri (virgülle ayrılmış)</label>
              <input type="text" id="recordCategories" name="recordCategories" class="form-control" value="Genel,Destek,Talep,Sorun">
            </div>
            
            <h4 class="mt-4 mb-3">E-posta Ayarları</h4>
            
            <div class="form-group">
              <div class="form-check">
                <input type="checkbox" id="enableEmailNotifications" name="enableEmailNotifications" class="form-check-input" checked>
                <label for="enableEmailNotifications" class="form-check-label">E-posta Bildirimlerini Etkinleştir</label>
              </div>
            </div>
            
            <div class="form-group">
              <button type="submit" class="btn btn-primary">Ayarları Kaydet</button>
            </div>
          </form>
          
          <div id="settingsAlert"></div>
        </div>
      </div>
      
      <div class="col">
        <div class="card">
          <h3 class="mb-3">Kategoriler</h3>
          
          <div class="mb-3">
            <form id="categoryForm" class="d-flex">
              <div class="form-group" style="flex: 1; margin-right: 8px;">
                <input type="text" id="newCategory" name="newCategory" class="form-control" placeholder="Yeni kategori ekle...">
              </div>
              <button type="submit" class="btn btn-primary">Ekle</button>
            </form>
          </div>
          
          <div id="categoriesList">
            <div class="list-group">
              <div class="list-group-item">
                Genel
                <button class="btn btn-sm btn-danger float-right">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div class="list-group-item">
                Destek
                <button class="btn btn-sm btn-danger float-right">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div class="list-group-item">
                Talep
                <button class="btn btn-sm btn-danger float-right">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div class="list-group-item">
                Sorun
                <button class="btn btn-sm btn-danger float-right">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add form submission handlers
  document.getElementById('settingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    utils.showAlert('Settings saved successfully', 'success');
  });
  
  document.getElementById('categoryForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newCategory = document.getElementById('newCategory').value;
    if (newCategory) {
      const categoriesList = document.getElementById('categoriesList');
      const categoryItem = document.createElement('div');
      categoryItem.className = 'list-group-item';
      categoryItem.innerHTML = `
        ${newCategory}
        <button class="btn btn-sm btn-danger float-right">
          <i class="fas fa-times"></i>
        </button>
      `;
      categoriesList.querySelector('.list-group').appendChild(categoryItem);
      document.getElementById('newCategory').value = '';
      utils.showAlert('Category added successfully', 'success');
    }
  });
}