const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Get conversations
router.get('/conversations', auth, (req, res) => {
    const query = `
    SELECT DISTINCT
      CASE 
        WHEN m.senderId = ? THEN m.recipientId 
        ELSE m.senderId 
      END as partnerId,
      u.username as partnerUsername,
      u.avatarUrl as partnerAvatar,
      (SELECT content FROM messages 
       WHERE (senderId = ? AND recipientId = partnerId) 
          OR (senderId = partnerId AND recipientId = ?)
       ORDER BY createdAt DESC LIMIT 1) as lastMessage,
      (SELECT createdAt FROM messages 
       WHERE (senderId = ? AND recipientId = partnerId) 
          OR (senderId = partnerId AND recipientId = ?)
       ORDER BY createdAt DESC LIMIT 1) as lastMessageTime,
      (SELECT COUNT(*) FROM messages 
       WHERE senderId = partnerId AND recipientId = ? AND read = 0) as unreadCount
    FROM messages m
    JOIN users u ON u.id = CASE 
      WHEN m.senderId = ? THEN m.recipientId 
      ELSE m.senderId 
    END
    WHERE m.senderId = ? OR m.recipientId = ?
    ORDER BY lastMessageTime DESC
  `;

    db.all(query, [
        req.userId, req.userId, req.userId, req.userId, req.userId,
        req.userId, req.userId, req.userId, req.userId
    ], (err, conversations) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(conversations);
    });
});

// Get messages with specific user
router.get('/:userId', auth, (req, res) => {
    const query = `
    SELECT m.*, 
      s.username as senderUsername, s.avatarUrl as senderAvatar,
      r.username as recipientUsername, r.avatarUrl as recipientAvatar
    FROM messages m
    JOIN users s ON m.senderId = s.id
    JOIN users r ON m.recipientId = r.id
    WHERE (m.senderId = ? AND m.recipientId = ?)
       OR (m.senderId = ? AND m.recipientId = ?)
    ORDER BY m.createdAt ASC
  `;

    db.all(query, [req.userId, req.params.userId, req.params.userId, req.userId], (err, messages) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Mark messages as read
        db.run(
            'UPDATE messages SET read = 1 WHERE senderId = ? AND recipientId = ? AND read = 0',
            [req.params.userId, req.userId]
        );

        res.json(messages);
    });
});

// Send message
router.post('/', auth, (req, res) => {
    const { recipientId, content } = req.body;

    if (!recipientId || !content) {
        return res.status(400).json({ error: 'Recipient and content are required' });
    }

    db.run(
        'INSERT INTO messages (senderId, recipientId, content) VALUES (?, ?, ?)',
        [req.userId, recipientId, content],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            db.get(
                `SELECT m.*, 
          s.username as senderUsername, s.avatarUrl as senderAvatar,
          r.username as recipientUsername, r.avatarUrl as recipientAvatar
        FROM messages m
        JOIN users s ON m.senderId = s.id
        JOIN users r ON m.recipientId = r.id
        WHERE m.id = ?`,
                [this.lastID],
                (err, message) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json(message);
                }
            );
        }
    );
});

// Get unread count
router.get('/unread/count', auth, (req, res) => {
    db.get(
        'SELECT COUNT(*) as count FROM messages WHERE recipientId = ? AND read = 0',
        [req.userId],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ count: result.count });
        }
    );
});

module.exports = router;
