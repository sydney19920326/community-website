// Authentication and User Management System
// Using localStorage for demo purposes

// Initialize default users
function initializeUsers() {
  const existingUsers = localStorage.getItem('community_users');
  if (!existingUsers) {
    const defaultUsers = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@community.de',
        password: 'admin123',
        role: 'admin',
        createdAt: new Date().toISOString(),
        profile: { firstName: 'Max', lastName: 'Administrator', bio: 'Admin & Moderator' }
      },
      {
        id: 2,
        username: 'user',
        email: 'user@community.de',
        password: 'user123',
        role: 'user',
        createdAt: new Date().toISOString(),
        profile: { firstName: 'Anna', lastName: 'Müller', bio: 'Community-Mitglied' }
      }
    ];
    localStorage.setItem('community_users', JSON.stringify(defaultUsers));
  }
}

// Global Auth State
const AuthState = {
  getCurrentUser: () => JSON.parse(localStorage.getItem('currentUser')),
  setCurrentUser: (user) => localStorage.setItem('currentUser', JSON.stringify(user)),
  logout: () => {
    localStorage.removeItem('currentUser');
    window.location.reload();
  },
  isLoggedIn: () => !!localStorage.getItem('currentUser'),
  isAdmin: () => {
    const user = AuthState.getCurrentUser();
    return user && user.role === 'admin';
  }
};

// UI Components - Modal Template
const LOGIN_MODAL_HTML = `
<div class="modal-overlay" id="login-modal">
  <div class="modal-container">
    <button class="modal-close" onclick="closeLoginModal()">&times;</button>
    <div class="modal-header">
      <h2 class="modal-title">Willkommen zurück</h2>
      <p class="modal-subtitle">Melde dich an, um fortzufahren</p>
    </div>
    <form id="modal-login-form">
      <div class="form-group">
        <label class="form-label">Benutzername</label>
        <input type="text" id="modal-username" class="form-input" placeholder="Dein Name" required>
      </div>
      <div class="form-group">
        <label class="form-label">Passwort</label>
        <input type="password" id="modal-password" class="form-input" placeholder="••••••••" required>
      </div>
      <div id="modal-error" class="alert alert-error hidden mb-1"></div>
      <button type="submit" class="btn btn-primary btn-block">Anmelden</button>
      <p class="text-center mt-2 text-muted" style="font-size: 0.9rem;">
        Noch kein Konto? <a href="register.html" style="color: var(--primary); font-weight: 600;">Jetzt registrieren</a>
      </p>
    </form>
  </div>
</div>
`;

// Dynamic Header Injection
function injectHeader() {
  const headerContainer = document.getElementById('global-header');
  if (!headerContainer) return;

  const user = AuthState.getCurrentUser();
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  const headerHTML = `
    <header class="global-header">
      <div class="container navbar-container">
        <a href="posts.html" class="nav-brand">
          <div class="nav-brand-logo">C</div>
          <span>Community</span>
        </a>
        
        <nav class="nav-menu">
          <a href="posts.html" class="nav-link ${currentPage === 'posts.html' ? 'active' : ''}">Beiträge</a>
          <a href="forum.html" class="nav-link ${currentPage === 'forum.html' ? 'active' : ''}">Forum</a>
          <a href="members.html" class="nav-link ${currentPage === 'members.html' ? 'active' : ''}">Mitglieder</a>
          ${user ? `<a href="dashboard.html" class="nav-link ${currentPage === 'dashboard.html' ? 'active' : ''}">Dashboard</a>` : ''}
          ${user && user.role === 'admin' ? `<a href="admin.html" class="nav-link ${currentPage === 'admin.html' ? 'active' : ''}">Admin</a>` : ''}
        </nav>

        <div class="nav-actions">
          ${user ? `
            <div class="user-menu">
              <div class="user-trigger" onclick="toggleUserDropdown()">
                <div class="avatar avatar-sm" style="background: ${getAvatarColor(user.id)}">
                  ${getAvatarInitials(user)}
                </div>
                <span style="font-weight: 600;">${user.username}</span>
              </div>
              <div class="user-dropdown" id="user-dropdown">
                <a href="profile.html" class="dropdown-item">Mein Profil</a>
                <a href="messages.html" class="dropdown-item">Nachrichten</a>
                <div class="dropdown-divider"></div>
                <button onclick="AuthState.logout()" class="dropdown-item" style="width: 100%; border: none; background: transparent; cursor: pointer; color: var(--error);">
                  Abmelden
                </button>
              </div>
            </div>
          ` : `
            <button onclick="openLoginModal()" class="btn btn-primary btn-sm">Anmelden</button>
          `}
        </div>
      </div>
    </header>
  `;

  headerContainer.innerHTML = headerHTML;

  // Inject Modal if not logged in
  if (!user && !document.getElementById('login-modal')) {
    document.body.insertAdjacentHTML('beforeend', LOGIN_MODAL_HTML);
    setupModalListeners();
  }
}

// Modal Logic
function openLoginModal() {
  document.getElementById('login-modal')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
  document.getElementById('login-modal')?.classList.remove('active');
  document.body.style.overflow = '';
}

function setupModalListeners() {
  const form = document.getElementById('modal-login-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('modal-username').value.trim();
      const password = document.getElementById('modal-password').value;

      const users = JSON.parse(localStorage.getItem('community_users') || '[]');
      const user = users.find(u => u.username === username && u.password === password);

      if (user) {
        AuthState.setCurrentUser(user);
        window.location.reload();
      } else {
        const errorEl = document.getElementById('modal-error');
        errorEl.textContent = 'Ungültige Zugangsdaten';
        errorEl.classList.remove('hidden');
      }
    });
  }

  // Close on overlay click
  document.getElementById('login-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'login-modal') closeLoginModal();
  });
}

function toggleUserDropdown() {
  document.getElementById('user-dropdown')?.classList.toggle('active');
}

// Global Helpers
function getAvatarInitials(user) {
  return user.username.charAt(0).toUpperCase();
}

function getAvatarColor(userId) {
  const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
  return colors[userId % colors.length];
}

// Scroll Effect
window.addEventListener('scroll', () => {
  const header = document.querySelector('.global-header');
  if (window.scrollY > 20) {
    header?.classList.add('scrolled');
  } else {
    header?.classList.remove('scrolled');
  }
});

// Close dropdown on outside click
window.addEventListener('click', (e) => {
  if (!e.target.closest('.user-menu')) {
    document.getElementById('user-dropdown')?.classList.remove('active');
  }
});

// Initialize everything
initializeUsers();
document.addEventListener('DOMContentLoaded', injectHeader);

// Legacy support for existing pages
function updateNavigation() { injectHeader(); }
function logout() { AuthState.logout(); }
function checkAuth() { return AuthState.getCurrentUser(); }

function getUsers() {
  return JSON.parse(localStorage.getItem('community_users') || '[]');
}

function saveUsers(users) {
  localStorage.setItem('community_users', JSON.stringify(users));
}

function getCurrentUser() {
  return AuthState.getCurrentUser();
}

function requireAuth() {
  const user = AuthState.getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return null;
  }
  return user;
}

function requireAdmin() {
  const user = AuthState.getCurrentUser();
  if (!user || user.role !== 'admin') {
    window.location.href = 'index.html';
    return null;
  }
  return user;
}

function getDisplayName(user) {
  if (!user) return 'Gast';
  if (user.profile && (user.profile.firstName || user.profile.lastName)) {
    return `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim();
  }
  return user.username;
}
function showSuccess(message, elementId = 'success-message') {
  const el = document.getElementById(elementId);
  if (el) {
    el.innerHTML = message;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 5000);
  } else {
    alert(message);
  }
}

function showError(message, elementId = 'error-message') {
  const el = document.getElementById(elementId);
  if (el) {
    el.innerHTML = message;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 5000);
  } else {
    alert('Error: ' + message);
  }
}
