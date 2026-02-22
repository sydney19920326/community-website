// Admin Dashboard functionality
const adminUser = requireAdmin();

if (adminUser) {
  // Show admin content
  document.getElementById('admin-content').style.display = 'block';

  // Display name in dashboard
  const adminName = document.getElementById('admin-name');
  if (adminName) {
    adminName.textContent = adminUser.username;
  }

  // Initial load
  updateStats();
  loadRecentUsers();

  // Tab switching
  setupSidebarNavigation();

  // Search listeners
  setupSearch();
}

// Sidebar navigation functionality
function setupSidebarNavigation() {
  const navItems = document.querySelectorAll('.admin-nav-item');
  const tabContents = document.querySelectorAll('.tab-content');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabName = item.dataset.tab;

      if (tabName === 'settings') {
        showSuccess('Einstellungen folgen in Kürze...');
        return;
      }

      showTab(tabName);
    });
  });
}

function showTab(tabName) {
  const navItems = document.querySelectorAll('.admin-nav-item');
  const tabContents = document.querySelectorAll('.tab-content');

  // Update sidebar active state
  navItems.forEach(i => i.classList.remove('active'));
  const activeItem = document.querySelector(`.admin-nav-item[data-tab="${tabName}"]`);
  if (activeItem) activeItem.classList.add('active');

  // Update visible content
  tabContents.forEach(content => content.classList.remove('active'));
  const targetTab = document.getElementById(`${tabName}-tab`);
  if (targetTab) targetTab.classList.add('active');

  // Load section specific data
  if (tabName === 'users') loadUsers();
  if (tabName === 'posts') loadPosts();
  if (tabName === 'overview') {
    updateStats();
    loadRecentUsers();
  }
}

function loadUsers() {
  const users = getUsers();
  const tbody = document.getElementById('users-table');
  const searchTerm = document.getElementById('user-search')?.value.toLowerCase() || '';

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm) ||
    user.email.toLowerCase().includes(searchTerm)
  );

  if (filteredUsers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Keine Benutzer gefunden ${searchTerm ? 'für "' + searchTerm + '"' : ''}</td></tr>`;
    return;
  }

  tbody.innerHTML = filteredUsers.map(user => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: var(--spacing-md);">
          <div class="avatar avatar-sm" style="background: ${getAvatarColor(user.id)}">
            ${getAvatarInitials(user)}
          </div>
          <span style="font-weight: 600; color: var(--text-primary);">${escapeHtml(user.username)}</span>
        </div>
      </td>
      <td>${escapeHtml(user.email)}</td>
      <td>
        <span class="status-badge ${user.role === 'admin' ? 'status-admin' : 'status-user'}">
          ${user.role === 'admin' ? 'Admin' : 'Benutzer'}
        </span>
      </td>
      <td style="font-size: 0.9rem; color: var(--text-muted);">${new Date(user.createdAt || Date.now()).toLocaleDateString('de-DE')}</td>
      <td>
        <div class="action-btn-group">
          ${user.role !== 'admin' ? `
            <button class="action-btn" title="Zu Admin befördern" onclick="promoteUser(${user.id})">🛡️</button>
          ` : user.id !== adminUser.id ? `
            <button class="action-btn" title="Zu Benutzer degradieren" onclick="demoteUser(${user.id})">👤</button>
          ` : ''}
          ${user.id !== adminUser.id ? `
            <button class="action-btn action-btn-danger" title="Löschen" onclick="deleteUser(${user.id})">🗑️</button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

function loadRecentUsers() {
  const users = getUsers().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5);
  const container = document.getElementById('recent-users-list');

  if (!container) return;

  container.innerHTML = users.map(user => `
    <tr>
      <td style="padding: var(--spacing-md) var(--spacing-lg);">
        <div style="display: flex; align-items: center; gap: var(--spacing-md);">
          <div class="avatar avatar-sm" style="background: ${getAvatarColor(user.id)}">
            ${getAvatarInitials(user)}
          </div>
          <div>
            <div style="font-weight: 600; color: var(--text-primary);">${escapeHtml(user.username)}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${user.email}</div>
          </div>
        </div>
      </td>
      <td style="text-align: right; padding-right: var(--spacing-lg);">
        <span class="status-badge ${user.role === 'admin' ? 'status-admin' : 'status-user'}">
          ${user.role === 'admin' ? 'Admin' : 'User'}
        </span>
      </td>
    </tr>
  `).join('');
}

function loadPosts() {
  const posts = getPosts();
  const tbody = document.getElementById('posts-table');

  if (posts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Keine Beiträge gefunden</td></tr>';
    return;
  }

  tbody.innerHTML = posts.map(post => `
    <tr>
      <td style="font-weight: 600; max-width: 300px;">
        <a href="view-post.html?id=${post.id}" style="color: var(--text-primary); text-decoration: none; border-bottom: 1px dashed var(--border);">
          ${escapeHtml(post.title)}
        </a>
      </td>
      <td>
        <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
          <span style="font-weight: 500;">${escapeHtml(post.authorName)}</span>
        </div>
      </td>
      <td>
        <span class="category-badge" style="background: ${getCategoryColor(post.category)}; opacity: 0.8;">
          ${post.category}
        </span>
      </td>
      <td style="color: var(--text-muted); font-size: 0.85rem;">
        ${formatRelativeTime(post.createdAt)}
      </td>
      <td>
        <div class="action-btn-group">
          <button class="action-btn" title="Bearbeiten" onclick="window.location.href='edit-post.html?id=${post.id}'">✏️</button>
          <button class="action-btn action-btn-danger" title="Löschen" onclick="deletePostAdmin(${post.id})">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function updateStats() {
  const users = getUsers();
  const posts = getPosts();
  const adminCount = users.filter(u => u.role === 'admin').length;

  document.getElementById('total-users').textContent = users.length;
  document.getElementById('total-posts').textContent = posts.length;
  document.getElementById('admin-count').textContent = adminCount;
}

function setupSearch() {
  const searchInput = document.getElementById('user-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => loadUsers());
  }
}

// User Actions
function promoteUser(userId) {
  const users = getUsers();
  const user = users.find(u => u.id === userId);

  if (user) {
    user.role = 'admin';
    saveUsers(users);
    showSuccess(`<strong>${user.username}</strong> wurde erfolgreich zum Administrator befördert.`);
    loadUsers();
    updateStats();
  }
}

function demoteUser(userId) {
  const users = getUsers();
  const user = users.find(u => u.id === userId);

  if (user) {
    user.role = 'user';
    saveUsers(users);
    showSuccess(`<strong>${user.username}</strong> ist nun wieder ein regulärer Benutzer.`);
    loadUsers();
    updateStats();
  }
}

function deleteUser(userId) {
  if (!confirm('Diesen Benutzer wirklich permanent löschen?')) return;

  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex !== -1) {
    const username = users[userIndex].username;
    users.splice(userIndex, 1);
    saveUsers(users);
    showSuccess(`Benutzer <strong>${username}</strong> wurde dauerhaft entfernt.`);
    loadUsers();
    updateStats();
  }
}

function deletePostAdmin(postId) {
  if (!confirm('Diesen Beitrag wirklich löschen?')) return;

  const deleted = deletePost(postId);
  if (deleted) {
    showPostsSuccess('Beitrag wurde erfolgreich gelöscht.');
    loadPosts();
    updateStats();
  } else {
    showPostsError('Etwas ist beim Löschen schiefgelaufen.');
  }
}

// UI Helpers
function showPostsSuccess(message) {
  const successEl = document.getElementById('posts-success-message');
  if (!successEl) return;
  successEl.innerHTML = message;
  successEl.classList.remove('hidden');
  setTimeout(() => successEl.classList.add('hidden'), 5000);
}

function showPostsError(message) {
  const errorEl = document.getElementById('posts-error-message');
  if (!errorEl) return;
  errorEl.innerHTML = message;
  errorEl.classList.remove('hidden');
  setTimeout(() => errorEl.classList.add('hidden'), 5000);
}

// Add user form handler
const addUserForm = document.getElementById('add-user-form');
if (addUserForm) {
  addUserForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('new-username').value.trim();
    const email = document.getElementById('new-email').value.trim();
    const password = document.getElementById('new-password').value;
    const role = document.getElementById('new-role').value;

    const users = getUsers();

    if (users.find(u => u.username === username)) {
      showError('Benutzername wird bereits verwendet.');
      return;
    }

    if (users.find(u => u.email === email)) {
      showError('E-Mail-Adresse ist bereits registriert.');
      return;
    }

    const newUser = {
      id: Math.max(...users.map(u => u.id), 0) + 1,
      username,
      email,
      password,
      role,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    showSuccess(`Benutzer <strong>${username}</strong> wurde erfolgreich angelegt.`);
    addUserForm.reset();
    loadUsers();
    updateStats();
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

