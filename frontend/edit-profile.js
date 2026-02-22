// Edit profile functionality
const user = requireAuth();

if (user) {
    document.getElementById('username-display').textContent = user.username;

    // Pre-fill form with current data
    if (user.profile) {
        document.getElementById('firstName').value = user.profile.firstName || '';
        document.getElementById('lastName').value = user.profile.lastName || '';
        document.getElementById('bio').value = user.profile.bio || '';
        document.getElementById('location').value = user.profile.location || '';
        document.getElementById('website').value = user.profile.website || '';
        document.getElementById('avatarUrl').value = user.profile.avatarUrl || '';

        // Social links
        if (user.profile.socialLinks) {
            document.getElementById('twitter').value = user.profile.socialLinks.twitter || '';
            document.getElementById('github').value = user.profile.socialLinks.github || '';
            document.getElementById('linkedin').value = user.profile.socialLinks.linkedin || '';
        }

        // Skills
        if (user.profile.skills && user.profile.skills.length > 0) {
            user.profile.skills.forEach(skill => addTag('skills', skill));
        }

        // Interests
        if (user.profile.interests && user.profile.interests.length > 0) {
            user.profile.interests.forEach(interest => addTag('interests', interest));
        }
    }

    updateAvatarPreview();
}

// Tag management
const skillsData = [];
const interestsData = [];

function addTag(type, value) {
    const container = document.getElementById(`${type}-container`);
    const input = document.getElementById(`${type}-input`);
    const data = type === 'skills' ? skillsData : interestsData;

    if (value && !data.includes(value)) {
        data.push(value);

        const tag = document.createElement('div');
        tag.className = 'tag-item';
        tag.innerHTML = `
      ${escapeHtml(value)}
      <span class="tag-remove" onclick="removeTag('${type}', '${escapeHtml(value)}')">×</span>
    `;

        container.insertBefore(tag, input);
    }
}

function removeTag(type, value) {
    const data = type === 'skills' ? skillsData : interestsData;
    const index = data.indexOf(value);
    if (index > -1) {
        data.splice(index, 1);
    }

    // Re-render tags
    const container = document.getElementById(`${type}-container`);
    const input = document.getElementById(`${type}-input`);

    // Remove all tags except input
    Array.from(container.children).forEach(child => {
        if (child !== input) {
            container.removeChild(child);
        }
    });

    // Re-add remaining tags
    data.forEach(item => addTag(type, item));
}

// Skills input handler
document.getElementById('skills-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const value = e.target.value.trim();
        if (value) {
            addTag('skills', value);
            e.target.value = '';
        }
    }
});

// Interests input handler
document.getElementById('interests-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const value = e.target.value.trim();
        if (value) {
            addTag('interests', value);
            e.target.value = '';
        }
    }
});

// Avatar preview
document.getElementById('avatarUrl').addEventListener('input', updateAvatarPreview);

function updateAvatarPreview() {
    const avatarUrl = document.getElementById('avatarUrl').value.trim();
    const preview = document.getElementById('avatar-preview-display');
    const initials = getAvatarInitials(user);
    const avatarColor = getAvatarColor(user.id);

    if (avatarUrl) {
        preview.style.background = avatarColor;
        preview.innerHTML = `<img src="${avatarUrl}" alt="Avatar" onerror="this.style.display='none'; this.parentElement.textContent='${initials}';">`;
    } else {
        preview.style.background = avatarColor;
        preview.textContent = initials;
    }
}

// Form submission
document.getElementById('edit-profile-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const profileData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        bio: document.getElementById('bio').value.trim(),
        location: document.getElementById('location').value.trim(),
        website: document.getElementById('website').value.trim(),
        avatarUrl: document.getElementById('avatarUrl').value.trim(),
        skills: skillsData,
        interests: interestsData,
        socialLinks: {
            twitter: document.getElementById('twitter').value.trim(),
            github: document.getElementById('github').value.trim(),
            linkedin: document.getElementById('linkedin').value.trim()
        }
    };

    // Validate URLs
    const urlFields = ['website', 'avatarUrl', 'twitter', 'github', 'linkedin'];
    for (const field of urlFields) {
        const value = field === 'twitter' || field === 'github' || field === 'linkedin'
            ? profileData.socialLinks[field]
            : profileData[field];

        if (value && !isValidUrl(value)) {
            showError(`Ungültige URL für ${field}`);
            return;
        }
    }

    // Update profile
    const success = updateUserProfile(user.id, profileData);

    if (success) {
        showSuccess('Profil erfolgreich aktualisiert! Du wirst weitergeleitet...');
        setTimeout(() => {
            window.location.href = `profile.html?id=${user.id}`;
        }, 1500);
    } else {
        showError('Fehler beim Aktualisieren des Profils');
    }
});

// Helper functions
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
