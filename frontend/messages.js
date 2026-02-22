// Check authentication
const currentUser = requireAuth();

if (currentUser) {
    document.getElementById('username-display').textContent = currentUser.username;
}

// Socket.io connection
const socket = io(window.location.origin);
let activeConversation = null;

// Connect user
socket.emit('user-online', currentUser.id);

// Load conversations
async function loadConversations() {
    try {
        const conversations = await MessagesAPI.getConversations();
        displayConversations(conversations);
    } catch (error) {
        console.error('Error loading conversations:', error);
        document.getElementById('conversations-list').innerHTML = `
            <div class="text-center text-muted">Fehler beim Laden der Konversationen</div>
        `;
    }
}

// Display conversations
function displayConversations(conversations) {
    const container = document.getElementById('conversations-list');

    if (conversations.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted">Keine Nachrichten</div>
        `;
        return;
    }

    container.innerHTML = conversations.map(conv => {
        const initials = conv.partnerUsername.charAt(0).toUpperCase();
        return `
            <div class="conversation-item" onclick="openConversation(${conv.partnerId}, '${escapeHtml(conv.partnerUsername)}', '${conv.partnerAvatar || ''}')">
                <div class="conversation-avatar">
                    ${conv.partnerAvatar ? `<img src="${conv.partnerAvatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : initials}
                </div>
                <div class="conversation-info">
                    <div class="conversation-name">${escapeHtml(conv.partnerUsername)}</div>
                    <div class="conversation-preview">${escapeHtml(conv.lastMessage || 'Keine Nachrichten')}</div>
                </div>
                ${conv.unreadCount > 0 ? `<div class="unread-badge">${conv.unreadCount}</div>` : ''}
            </div>
        `;
    }).join('');
}

// Open conversation
async function openConversation(userId, username, avatarUrl) {
    activeConversation = { userId, username, avatarUrl };

    // Mark conversation as active
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');

    try {
        const messages = await MessagesAPI.getMessages(userId);
        displayChat(userId, username, avatarUrl, messages);
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Display chat
function displayChat(userId, username, avatarUrl, messages) {
    const initials = username.charAt(0).toUpperCase();
    const chatContent = document.getElementById('chat-content');

    chatContent.className = 'chat-area';
    chatContent.innerHTML = `
        <div class="chat-header">
            <div class="conversation-avatar">
                ${avatarUrl ? `<img src="http://localhost:3000${avatarUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : initials}
            </div>
            <div>
                <div class="conversation-name">${escapeHtml(username)}</div>
                <div class="text-muted" style="font-size: 0.9rem;">Online</div>
            </div>
        </div>
        <div class="messages-container" id="messages-container">
            ${messages.map(msg => createMessageHTML(msg)).join('')}
        </div>
        <div class="message-input-area">
            <textarea id="message-input" class="form-input" placeholder="Nachricht schreiben..." rows="2"></textarea>
            <button onclick="sendMessage()" class="btn btn-primary">Senden</button>
        </div>
    `;

    // Scroll to bottom
    const messagesContainer = document.getElementById('messages-container');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Focus input
    document.getElementById('message-input').focus();

    // Enter to send
    document.getElementById('message-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

// Create message HTML
function createMessageHTML(message) {
    const isSent = message.senderId === currentUser.id;
    const time = formatDate(message.createdAt);
    const initials = isSent ? currentUser.username.charAt(0).toUpperCase() : message.senderUsername.charAt(0).toUpperCase();
    const avatarUrl = isSent ? currentUser.profile?.avatarUrl : message.senderAvatar;

    return `
        <div class="message ${isSent ? 'sent' : ''}">
            <div class="message-avatar">
                ${avatarUrl ? `<img src="http://localhost:3000${avatarUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : initials}
            </div>
            <div class="message-content">
                <div class="message-text">${escapeHtml(message.content)}</div>
                <div class="message-time">${time}</div>
            </div>
        </div>
    `;
}

// Send message
async function sendMessage() {
    const input = document.getElementById('message-input');
    const content = input.value.trim();

    if (!content || !activeConversation) return;

    try {
        const message = await MessagesAPI.send(activeConversation.userId, content);

        // Add message to UI
        const messagesContainer = document.getElementById('messages-container');
        messagesContainer.innerHTML += createMessageHTML(message);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Clear input
        input.value = '';

        // Emit socket event
        socket.emit('send-message', {
            recipientId: activeConversation.userId,
            message
        });

        // Reload conversations to update preview
        loadConversations();
    } catch (error) {
        console.error('Error sending message:', error);
        showError('Fehler beim Senden der Nachricht');
    }
}

// Listen for new messages
socket.on('new-message', (data) => {
    if (activeConversation && data.message.senderId === activeConversation.userId) {
        const messagesContainer = document.getElementById('messages-container');
        messagesContainer.innerHTML += createMessageHTML(data.message);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Reload conversations
    loadConversations();
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    AuthAPI.logout();
});

// Initialize
loadConversations();
