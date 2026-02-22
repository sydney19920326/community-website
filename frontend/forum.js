// Check authentication
const currentUser = checkAuth();
updateNavigation();

// Hide create button for guests
const createBtn = document.querySelector('button[onclick="window.location.href=\'create-topic.html\'"]');
if (!currentUser && createBtn) {
    createBtn.style.display = 'none';
}

if (currentUser) {
    // Load unread messages count
    loadUnreadCount();
} // unread count only for logged in users

let currentCategory = 'all';

// Load topics
async function loadTopics(category = 'all') {
    currentCategory = category;

    try {
        const topics = await ForumAPI.getTopics(category === 'all' ? null : category);
        displayTopics(topics);
    } catch (error) {
        console.error('Error loading topics:', error);
        document.getElementById('topics-container').innerHTML = `
            <div class="card">
                <div class="text-center text-muted">Fehler beim Laden der Themen</div>
            </div>
        `;
    }
}

// Display topics
function displayTopics(topics) {
    const container = document.getElementById('topics-container');

    if (topics.length === 0) {
        container.innerHTML = `
            <div class="card">
                <div class="text-center text-muted">Keine Themen gefunden</div>
            </div>
        `;
        return;
    }

    container.innerHTML = topics.map(topic => {
        const isPinned = topic.pinned === 1;
        const isLocked = topic.locked === 1;
        const categoryColor = getCategoryColor(topic.category);

        return `
            <div class="card mb-1" style="cursor: pointer;" onclick="window.location.href='view-topic.html?id=${topic.id}'">
                <div style="display: flex; justify-content: space-between; align-items: start; gap: var(--spacing-md);">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-sm);">
                            ${isPinned ? '<span style="color: var(--primary);">📌</span>' : ''}
                            ${isLocked ? '<span style="color: var(--text-muted);">🔒</span>' : ''}
                            <span class="category-badge" style="background: ${categoryColor};">
                                ${escapeHtml(topic.category)}
                            </span>
                        </div>
                        <h3 class="card-title" style="margin-bottom: var(--spacing-sm);">
                            ${escapeHtml(topic.title)}
                        </h3>
                        <div class="post-meta" style="display: flex; align-items: center; gap: var(--spacing-md); flex-wrap: wrap;">
                            <span style="color: var(--text-secondary);">
                                von <strong>${escapeHtml(topic.authorName)}</strong>
                            </span>
                            <span style="color: var(--text-muted);">•</span>
                            <span style="color: var(--text-secondary);">
                                ${formatDate(topic.createdAt)}
                            </span>
                            <span style="color: var(--text-muted);">•</span>
                            <span style="color: var(--text-secondary);">
                                👁️ ${topic.views} Aufrufe
                            </span>
                            <span style="color: var(--text-muted);">•</span>
                            <span style="color: var(--text-secondary);">
                                💬 ${topic.replyCount} Antworten
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Category filter
document.querySelectorAll('.filter-bar button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-bar button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadTopics(btn.dataset.category);
    });
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    AuthAPI.logout();
});

// Load unread messages count
async function loadUnreadCount() {
    try {
        const data = await MessagesAPI.getUnreadCount();
        if (data.count > 0) {
            document.getElementById('unread-count').textContent = data.count;
            document.getElementById('unread-count').style.display = 'inline-block';
        }
    } catch (error) {
        console.error('Error loading unread count:', error);
    }
}

// Initialize
loadTopics();
loadUnreadCount();
