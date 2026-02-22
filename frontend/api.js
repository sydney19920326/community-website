// API Configuration
const API_URL = '/api';

// Get token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Set token in localStorage
function setToken(token) {
    localStorage.setItem('token', token);
}

// Remove token from localStorage
function removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
}

// API Request Helper
async function apiRequest(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        ...options.headers
    };

    // Only add Content-Type if not FormData
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Request failed');
        }

        return response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Upload File
async function uploadFile(endpoint, file, fieldName = 'file', additionalData = {}) {
    const token = getToken();
    const formData = new FormData();
    formData.append(fieldName, file);

    // Add additional data
    Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
    });

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
        }

        return response.json();
    } catch (error) {
        console.error('Upload Error:', error);
        throw error;
    }
}

// Auth API
const AuthAPI = {
    async register(username, email, password) {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
        setToken(data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        return data;
    },

    async login(username, password) {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        setToken(data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        return data;
    },

    async verify() {
        const data = await apiRequest('/auth/verify');
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        return data.user;
    },

    logout() {
        removeToken();
        window.location.href = 'index.html';
    }
};

// Users API
const UsersAPI = {
    async getAll() {
        return apiRequest('/users');
    },

    async getById(id) {
        return apiRequest(`/users/${id}`);
    },

    async updateProfile(profileData) {
        const data = await apiRequest('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
        localStorage.setItem('currentUser', JSON.stringify(data));
        return data;
    },

    async uploadAvatar(file) {
        return uploadFile('/users/avatar', file, 'avatar');
    }
};

// Posts API
const PostsAPI = {
    async getAll(filters = {}) {
        const params = new URLSearchParams(filters);
        return apiRequest(`/posts?${params}`);
    },

    async getById(id) {
        return apiRequest(`/posts/${id}`);
    },

    async create(postData, imageFile = null) {
        if (imageFile) {
            return uploadFile('/posts', imageFile, 'postImage', postData);
        } else {
            return apiRequest('/posts', {
                method: 'POST',
                body: JSON.stringify(postData)
            });
        }
    },

    async update(id, postData, imageFile = null) {
        if (imageFile) {
            return uploadFile(`/posts/${id}`, imageFile, 'postImage', postData);
        } else {
            return apiRequest(`/posts/${id}`, {
                method: 'PUT',
                body: JSON.stringify(postData)
            });
        }
    },

    async delete(id) {
        return apiRequest(`/posts/${id}`, {
            method: 'DELETE'
        });
    }
};

// Messages API
const MessagesAPI = {
    async getConversations() {
        return apiRequest('/messages/conversations');
    },

    async getMessages(userId) {
        return apiRequest(`/messages/${userId}`);
    },

    async send(recipientId, content) {
        return apiRequest('/messages', {
            method: 'POST',
            body: JSON.stringify({ recipientId, content })
        });
    },

    async getUnreadCount() {
        return apiRequest('/messages/unread/count');
    }
};

// Forum API
const ForumAPI = {
    async getTopics(category = null) {
        const params = category ? `?category=${category}` : '';
        return apiRequest(`/forum/topics${params}`);
    },

    async getTopic(id) {
        return apiRequest(`/forum/topics/${id}`);
    },

    async createTopic(topicData) {
        return apiRequest('/forum/topics', {
            method: 'POST',
            body: JSON.stringify(topicData)
        });
    },

    async addReply(topicId, content) {
        return apiRequest(`/forum/topics/${topicId}/replies`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
    },

    async updateTopic(id, updates) {
        return apiRequest(`/forum/topics/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    },

    async deleteTopic(id) {
        return apiRequest(`/forum/topics/${id}`, {
            method: 'DELETE'
        });
    }
};
