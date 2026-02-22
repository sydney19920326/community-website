// Posts Data Management System
// Using localStorage for demo purposes

// Post categories
const POST_CATEGORIES = {
    NEWS: 'News',
    ANNOUNCEMENT: 'Ankündigung',
    DISCUSSION: 'Diskussion',
    TUTORIAL: 'Tutorial'
};

// Initialize posts if not exists
function initializePosts() {
    if (!localStorage.getItem('posts')) {
        const demoPosts = [
            {
                id: 1,
                title: 'Willkommen in unserer Community!',
                content: 'Hallo zusammen! Wir freuen uns, euch in unserer wachsenden Community begrüßen zu dürfen. Hier könnt ihr euch austauschen, Fragen stellen und neue Freunde finden.',
                category: POST_CATEGORIES.ANNOUNCEMENT,
                authorId: 1,
                authorName: 'admin',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                updatedAt: new Date(Date.now() - 86400000).toISOString(),
                status: 'published',
                imageUrl: ''
            },
            {
                id: 2,
                title: 'Tipps für neue Mitglieder',
                content: 'Als neues Mitglied gibt es einige Dinge, die ihr wissen solltet: 1. Seid respektvoll, 2. Nutzt die Suchfunktion, 3. Stellt Fragen, 4. Teilt euer Wissen!',
                category: POST_CATEGORIES.TUTORIAL,
                authorId: 2,
                authorName: 'user',
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                updatedAt: new Date(Date.now() - 172800000).toISOString(),
                status: 'published',
                imageUrl: ''
            },
            {
                id: 3,
                title: 'Community-Richtlinien',
                content: 'Bitte beachtet unsere Community-Richtlinien: Seid respektvoll, bleibt beim Thema, keine Spam-Posts, und habt Spaß! Bei Fragen wendet euch an die Administratoren.',
                category: POST_CATEGORIES.NEWS,
                authorId: 1,
                authorName: 'admin',
                createdAt: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
                updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
                status: 'published'
            }
        ];
        localStorage.setItem('posts', JSON.stringify(demoPosts));
    }
}

// Get all posts
function getPosts() {
    const posts = localStorage.getItem('posts');
    return posts ? JSON.parse(posts) : [];
}

// Save posts
function savePosts(posts) {
    localStorage.setItem('posts', JSON.stringify(posts));
}

// Get single post by ID
function getPostById(postId) {
    const posts = getPosts();
    return posts.find(p => p.id === parseInt(postId));
}

// Get posts by author
function getPostsByAuthor(authorId) {
    const posts = getPosts();
    return posts.filter(p => p.authorId === authorId);
}

// Get posts by category
function getPostsByCategory(category) {
    const posts = getPosts();
    if (!category || category === 'all') return posts;
    return posts.filter(p => p.category === category);
}

// Create new post
function createPost(title, content, category, author, imageUrl = '') {
    const posts = getPosts();
    const newPost = {
        id: Math.max(...posts.map(p => p.id), 0) + 1,
        title: title.trim(),
        content: content.trim(),
        category,
        authorId: author.id,
        authorName: author.username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'published',
        imageUrl: imageUrl.trim()
    };

    posts.unshift(newPost); // Add to beginning
    savePosts(posts);
    return newPost;
}

// Update post
function updatePost(postId, title, content, category, imageUrl = '') {
    const posts = getPosts();
    const postIndex = posts.findIndex(p => p.id === parseInt(postId));

    if (postIndex !== -1) {
        posts[postIndex].title = title.trim();
        posts[postIndex].content = content.trim();
        posts[postIndex].category = category;
        posts[postIndex].imageUrl = imageUrl.trim();
        posts[postIndex].updatedAt = new Date().toISOString();
        savePosts(posts);
        return posts[postIndex];
    }
    return null;
}


// Delete post
function deletePost(postId) {
    const posts = getPosts();
    const filteredPosts = posts.filter(p => p.id !== parseInt(postId));
    savePosts(filteredPosts);
    return filteredPosts.length < posts.length;
}

// Check if user can edit post
function canEditPost(post, user) {
    if (!user || !post) return false;
    return user.role === 'admin' || post.authorId === user.id;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('de-DE', options);
}

// Format relative time
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'gerade eben';
    if (diffMins < 60) return `vor ${diffMins} Minute${diffMins > 1 ? 'n' : ''}`;
    if (diffHours < 24) return `vor ${diffHours} Stunde${diffHours > 1 ? 'n' : ''}`;
    if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;

    return formatDate(dateString);
}

// Get category color
function getCategoryColor(category) {
    const colors = {
        [POST_CATEGORIES.NEWS]: 'var(--secondary)',
        [POST_CATEGORIES.ANNOUNCEMENT]: 'var(--primary)',
        [POST_CATEGORIES.DISCUSSION]: 'var(--accent)',
        [POST_CATEGORIES.TUTORIAL]: 'var(--success)'
    };
    return colors[category] || 'var(--text-muted)';
}

// Truncate text
function truncateText(text, maxLength = 150) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

// Initialize posts on load
initializePosts();
