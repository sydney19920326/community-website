const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Get all topics
router.get('/topics', (req, res) => {
    const { category } = req.query;
    let query = `
    SELECT t.*, u.username as authorName, u.avatarUrl as authorAvatar,
      (SELECT COUNT(*) FROM forum_replies WHERE topicId = t.id) as replyCount
    FROM forum_topics t
    JOIN users u ON t.authorId = u.id
  `;
    const params = [];

    if (category && category !== 'all') {
        query += ' WHERE t.category = ?';
        params.push(category);
    }

    query += ' ORDER BY t.pinned DESC, t.updatedAt DESC';

    db.all(query, params, (err, topics) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(topics);
    });
});

// Get topic by ID
router.get('/topics/:id', (req, res) => {
    db.get(
        `SELECT t.*, u.username as authorName, u.avatarUrl as authorAvatar
    FROM forum_topics t
    JOIN users u ON t.authorId = u.id
    WHERE t.id = ?`,
        [req.params.id],
        (err, topic) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!topic) {
                return res.status(404).json({ error: 'Topic not found' });
            }

            // Increment views
            db.run('UPDATE forum_topics SET views = views + 1 WHERE id = ?', [req.params.id]);

            // Get replies
            db.all(
                `SELECT r.*, u.username as authorName, u.avatarUrl as authorAvatar
        FROM forum_replies r
        JOIN users u ON r.authorId = u.id
        WHERE r.topicId = ?
        ORDER BY r.createdAt ASC`,
                [req.params.id],
                (err, replies) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    topic.replies = replies;
                    res.json(topic);
                }
            );
        }
    );
});

// Create topic
router.post('/topics', auth, (req, res) => {
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
        return res.status(400).json({ error: 'Title, content, and category are required' });
    }

    db.run(
        'INSERT INTO forum_topics (title, content, category, authorId) VALUES (?, ?, ?, ?)',
        [title, content, category, req.userId],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            db.get(
                `SELECT t.*, u.username as authorName, u.avatarUrl as authorAvatar
        FROM forum_topics t
        JOIN users u ON t.authorId = u.id
        WHERE t.id = ?`,
                [this.lastID],
                (err, topic) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json(topic);
                }
            );
        }
    );
});

// Add reply
router.post('/topics/:id/replies', auth, (req, res) => {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ error: 'Content is required' });
    }

    // Check if topic exists and is not locked
    db.get('SELECT * FROM forum_topics WHERE id = ?', [req.params.id], (err, topic) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        if (topic.locked) {
            return res.status(403).json({ error: 'Topic is locked' });
        }

        db.run(
            'INSERT INTO forum_replies (topicId, authorId, content) VALUES (?, ?, ?)',
            [req.params.id, req.userId, content],
            function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                // Update topic updatedAt
                db.run('UPDATE forum_topics SET updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id]);

                db.get(
                    `SELECT r.*, u.username as authorName, u.avatarUrl as authorAvatar
          FROM forum_replies r
          JOIN users u ON r.authorId = u.id
          WHERE r.id = ?`,
                    [this.lastID],
                    (err, reply) => {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }
                        res.json(reply);
                    }
                );
            }
        );
    });
});

// Update topic (admin only)
router.put('/topics/:id', auth, (req, res) => {
    const { pinned, locked } = req.body;

    // Check if user is admin
    db.get('SELECT role FROM users WHERE id = ?', [req.userId], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        db.run(
            'UPDATE forum_topics SET pinned = ?, locked = ? WHERE id = ?',
            [pinned ? 1 : 0, locked ? 1 : 0, req.params.id],
            function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: 'Topic updated successfully' });
            }
        );
    });
});

// Delete topic (admin only)
router.delete('/topics/:id', auth, (req, res) => {
    // Check if user is admin
    db.get('SELECT role FROM users WHERE id = ?', [req.userId], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        // Delete replies first
        db.run('DELETE FROM forum_replies WHERE topicId = ?', [req.params.id], (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Delete topic
            db.run('DELETE FROM forum_topics WHERE id = ?', [req.params.id], function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: 'Topic deleted successfully' });
            });
        });
    });
});

module.exports = router;
