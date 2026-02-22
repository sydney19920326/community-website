// Members page functionality
const currentUser = getCurrentUser();

// Update navigation based on login status
if (currentUser) {
    document.getElementById('username-display').textContent = currentUser.username;
    document.getElementById('logout-btn').classList.remove('hidden');
    document.getElementById('login-link').classList.add('hidden');

    // Show admin link if admin
    if (currentUser.role === 'admin') {
        const navLinks = document.getElementById('nav-links');
        const adminLink = document.createElement('a');
        adminLink.href = 'admin.html';
        adminLink.textContent = 'Admin';
        navLinks.insertBefore(adminLink, document.getElementById('dashboard-link'));
    }
} else {
    document.getElementById('dashboard-link').classList.add('hidden');
}

// Load and display members
let currentFilter = 'all';

function loadMembers(filter = 'all') {
    currentFilter = filter;
    const users = getUsers();
    const container = document.getElementById('members-container');

    // Filter users
    let filteredUsers = users;
    if (filter !== 'all') {
        filteredUsers = users.filter(u => u.role === filter);
    }

    // Update counts
    document.getElementById('count-all').textContent = users.length;
    document.getElementById('count-admin').textContent = users.filter(u => u.role === 'admin').length;
    document.getElementById('count-user').textContent = users.filter(u => u.role === 'user').length;

    // Update active filter button
    document.querySelectorAll('.filter-bar .btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });

    if (filteredUsers.length === 0) {
        container.innerHTML = '<div class="text-center text-muted" style="grid-column: 1 / -1;">Keine Mitglieder gefunden</div>';
        return;
    }

    container.innerHTML = filteredUsers.map(user => {
        const displayName = getDisplayName(user);
        const initials = getAvatarInitials(user);
        const avatarColor = getAvatarColor(user.id);
        const bio = user.profile && user.profile.bio ? user.profile.bio : 'Noch keine Beschreibung vorhanden.';
        const bioPreview = bio.length > 100 ? bio.substring(0, 100) + '...' : bio;

        return `
      <div class="member-card" onclick="window.location.href='profile.html?id=${user.id}'">
        <div class="avatar avatar-lg" style="background: ${avatarColor};">
          ${user.profile && user.profile.avatarUrl ?
                `<img src="${user.profile.avatarUrl}" alt="${displayName}">` :
                initials
            }
        </div>
        
        <div style="width: 100%;">
          <h3 class="member-card-name">${escapeHtml(displayName)}</h3>
          <p class="member-card-username">@${escapeHtml(user.username)}</p>
          
          <div style="margin: var(--spacing-sm) 0;">
            <span class="badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}">
              ${user.role === 'admin' ? 'Admin' : 'Mitglied'}
            </span>
          </div>
          
          <p class="member-card-bio">${escapeHtml(bioPreview)}</p>
        </div>
        
        <button class="btn btn-secondary btn-sm" style="width: 100%;">
          Profil ansehen
        </button>
      </div>
    `;
    }).join('');
}

// Filter button handlers
document.querySelectorAll('.filter-bar .btn').forEach(btn => {
    btn.addEventListener('click', () => {
        loadMembers(btn.dataset.filter);
    });
});

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load members on page load
loadMembers();
