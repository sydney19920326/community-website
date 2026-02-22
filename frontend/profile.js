// Profile page functionality
const urlParams = new URLSearchParams(window.location.search);
const userId = parseInt(urlParams.get('id'));
const username = urlParams.get('username');
const currentUser = getCurrentUser();

// Get user to display
let profileUser = null;
if (userId) {
    profileUser = getUserById(userId);
} else if (username) {
    profileUser = getUserByUsername(username);
} else if (currentUser) {
    profileUser = currentUser;
}

if (!profileUser) {
    document.getElementById('profile-container').innerHTML = `
    <div class="text-center">
      <p class="text-muted">Benutzer nicht gefunden</p>
      <a href="members.html" class="btn btn-secondary mt-1">Zurück zur Mitgliederübersicht</a>
    </div>
  `;
} else {
    displayProfile(profileUser);
}

function displayProfile(user) {
    const container = document.getElementById('profile-container');
    const displayName = getDisplayName(user);
    const initials = getAvatarInitials(user);
    const avatarColor = getAvatarColor(user.id);
    const isOwnProfile = currentUser && currentUser.id === user.id;

    // Get user's posts
    const userPosts = typeof getPosts === 'function' ? getPostsByAuthor(user.id) : [];
    const joinDate = new Date(user.createdAt);
    const joinDateFormatted = joinDate.toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' });

    let html = `
    <div class="profile-header">
      <div class="avatar avatar-xl" style="background: ${avatarColor};">
        ${user.profile && user.profile.avatarUrl ?
            `<img src="${user.profile.avatarUrl}" alt="${displayName}">` :
            initials
        }
      </div>
      
      <div class="profile-header-info">
        <h1 class="profile-name">${escapeHtml(displayName)}</h1>
        <p class="profile-username">@${escapeHtml(user.username)}</p>
        
        <div style="margin: var(--spacing-sm) 0;">
          <span class="badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}">
            ${user.role === 'admin' ? 'Administrator' : 'Mitglied'}
          </span>
        </div>
        
        ${user.profile && user.profile.bio ? `
          <p class="profile-bio">${escapeHtml(user.profile.bio)}</p>
        ` : ''}
        
        ${isOwnProfile ? `
          <a href="edit-profile.html" class="btn btn-primary" style="margin-top: var(--spacing-md);">
            Profil bearbeiten
          </a>
        ` : ''}
      </div>
    </div>
    
    <div class="profile-stats">
      <div class="profile-stat">
        <span class="profile-stat-value">${userPosts.length}</span>
        <span class="profile-stat-label">Beiträge</span>
      </div>
      <div class="profile-stat">
        <span class="profile-stat-value">${joinDateFormatted}</span>
        <span class="profile-stat-label">Mitglied seit</span>
      </div>
    </div>
    
    <div class="profile-info-grid">
  `;

    // Location
    if (user.profile && user.profile.location) {
        html += `
      <div class="profile-info-item">
        <div class="profile-info-label">📍 Standort</div>
        <div class="profile-info-value">${escapeHtml(user.profile.location)}</div>
      </div>
    `;
    }

    // Website
    if (user.profile && user.profile.website) {
        html += `
      <div class="profile-info-item">
        <div class="profile-info-label">🌐 Website</div>
        <div class="profile-info-value">
          <a href="${escapeHtml(user.profile.website)}" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(user.profile.website)}
          </a>
        </div>
      </div>
    `;
    }

    html += `</div>`;

    // Skills
    if (user.profile && user.profile.skills && user.profile.skills.length > 0) {
        html += `
      <div class="card mb-2">
        <div class="card-header">
          <h3 class="card-title" style="font-size: 1.2rem;">💪 Fähigkeiten</h3>
        </div>
        <div>
          ${user.profile.skills.map(skill => `
            <span class="skill-badge">${escapeHtml(skill)}</span>
          `).join('')}
        </div>
      </div>
    `;
    }

    // Interests
    if (user.profile && user.profile.interests && user.profile.interests.length > 0) {
        html += `
      <div class="card mb-2">
        <div class="card-header">
          <h3 class="card-title" style="font-size: 1.2rem;">❤️ Interessen</h3>
        </div>
        <div>
          ${user.profile.interests.map(interest => `
            <span class="interest-badge">${escapeHtml(interest)}</span>
          `).join('')}
        </div>
      </div>
    `;
    }

    // Social Links
    const hasSocialLinks = user.profile && user.profile.socialLinks &&
        (user.profile.socialLinks.twitter || user.profile.socialLinks.github || user.profile.socialLinks.linkedin);

    if (hasSocialLinks) {
        html += `
      <div class="card mb-2">
        <div class="card-header">
          <h3 class="card-title" style="font-size: 1.2rem;">🔗 Social Media</h3>
        </div>
        <div class="social-links">
    `;

        if (user.profile.socialLinks.twitter) {
            html += `<a href="${escapeHtml(user.profile.socialLinks.twitter)}" target="_blank" rel="noopener noreferrer" class="social-link">Twitter</a>`;
        }
        if (user.profile.socialLinks.github) {
            html += `<a href="${escapeHtml(user.profile.socialLinks.github)}" target="_blank" rel="noopener noreferrer" class="social-link">GitHub</a>`;
        }
        if (user.profile.socialLinks.linkedin) {
            html += `<a href="${escapeHtml(user.profile.socialLinks.linkedin)}" target="_blank" rel="noopener noreferrer" class="social-link">LinkedIn</a>`;
        }

        html += `
        </div>
      </div>
    `;
    }

    // User's posts
    if (userPosts.length > 0) {
        html += `
      <div class="profile-posts">
        <div class="profile-posts-header">
          <h3 class="profile-posts-title">Beiträge von ${escapeHtml(displayName)}</h3>
        </div>
        <div class="grid grid-2">
          ${userPosts.slice(0, 6).map(post => `
            <div class="post-card" onclick="window.location.href='view-post.html?id=${post.id}'">
              <div class="post-card-header">
                <span class="category-badge" style="background: ${getCategoryColor(post.category)};">
                  ${post.category}
                </span>
                <span class="post-date">${formatRelativeTime(post.createdAt)}</span>
              </div>
              <h3 class="post-title">${escapeHtml(post.title)}</h3>
              <p class="post-preview">${escapeHtml(truncateText(post.content))}</p>
            </div>
          `).join('')}
        </div>
        ${userPosts.length > 6 ? `
          <div class="text-center mt-2">
            <a href="posts.html" class="btn btn-secondary">Alle Beiträge ansehen</a>
          </div>
        ` : ''}
      </div>
    `;
    }

    container.innerHTML = html;
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
