// Dashboard functionality
const user = requireAuth();

if (user) {
    // Display username in navbar
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) {
        usernameDisplay.textContent = user.username;
    }

    // Display profile information
    const profileUsername = document.getElementById('profile-username');
    if (profileUsername) {
        profileUsername.textContent = user.username;
    }

    const profileRole = document.getElementById('profile-role');
    if (profileRole) {
        const roleClass = user.role === 'admin' ? 'badge-admin' : 'badge-user';
        const roleText = user.role === 'admin' ? 'Administrator' : 'Benutzer';
        profileRole.innerHTML = `<span class="badge ${roleClass}">${roleText}</span>`;
    }

    const profileJoined = document.getElementById('profile-joined');
    if (profileJoined) {
        const joinDate = new Date(user.createdAt);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        profileJoined.textContent = joinDate.toLocaleDateString('de-DE', options);
    }

    // Load user's posts
    const userPosts = getPostsByAuthor(user.id);
    const postsCount = userPosts.length;

    // Update posts count in stats
    const userPostsCount = document.getElementById('user-posts-count');
    if (userPostsCount) {
        userPostsCount.textContent = postsCount;
    }

    // Update posts count in profile
    const profilePostsCount = document.getElementById('profile-posts-count');
    if (profilePostsCount) {
        profilePostsCount.textContent = `${postsCount} Beitrag${postsCount !== 1 ? 'e' : ''}`;
    }
}
