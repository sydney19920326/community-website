const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all posts
router.get('/', (req, res) => {
    const { category, authorId } = req.query;
    let query = `
    SELECT p.*, u.username as authorName 
    FROM posts p 
    JOIN users u ON p.authorId = u.id
    WHERE p.status = 'published'
  `;
    const params = [];

    if (category) {
        query += ' AND p.category = ?';
        params.push(category);
    }

    if (authorId) {
        query += ' AND p.authorId = ?';
        params.push(authorId);
    }

    query += ' ORDER BY p.createdAt DESC';

    db.all(query, params, (err, posts) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(posts);
    });
});

// Get post by ID
router.get('/:id', (req, res) => {
    db.get(
        'SELECT p.*, u.username as authorName FROM posts p JOIN users u ON p.authorId = u.id WHERE p.id = ?',
        [req.params.id],
        (err, post) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            res.json(post);
        }
    );
});

// Create post
router.post('/', auth, upload.single('postImage'), (req, res) => {
    const { title, content, category } = req.body;
    const imageUrl = req.file ? `/uploads/post-images/${req.file.filename}` : '';

    if (!title || !content || !category) {
        return res.status(400).json({ error: 'Title, content, and category are required' });
    }

    db.run(
        'INSERT INTO posts (title, content, category, imageUrl, authorId) VALUES (?, ?, ?, ?, ?)',
        [title, content, category, imageUrl, req.userId],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            db.get(
                'SELECT p.*, u.username as authorName FROM posts p JOIN users u ON p.authorId = u.id WHERE p.id = ?',
                [this.lastID],
                (err, post) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json(post);
                }
            );
        }
    );
});

// Update post
router.put('/:id', auth, upload.single('postImage'), (req, res) => {
    const { title, content, category } = req.body;
    const imageUrl = req.file ? `/uploads/post-images/${req.file.filename}` : req.body.imageUrl || '';

    db.get('SELECT * FROM posts WHERE id = ?', [req.params.id], (err, post) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if user is author or admin
        db.get('SELECT role FROM users WHERE id = ?', [req.userId], (err, user) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (post.authorId !== req.userId && user.role !== 'admin') {
                return res.status(403).json({ error: 'Not authorized' });
            }

            db.run(
                'UPDATE posts SET title = ?, content = ?, category = ?, imageUrl = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
                [title, content, category, imageUrl, req.params.id],
                function (err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    db.get(
                        'SELECT p.*, u.username as authorName FROM posts p JOIN users u ON p.authorId = u.id WHERE p.id = ?',
                        [req.params.id],
                        (err, updatedPost) => {
                            if (err) {
                                return res.status(500).json({ error: err.message });
                            }
                            res.json(updatedPost);
                        }
                    );
                }
            );
        });
    });
});

// Delete post
router.delete('/:id', auth, (req, res) => {
    db.get('SELECT * FROM posts WHERE id = ?', [req.params.id], (err, post) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if user is author or admin
        db.get('SELECT role FROM users WHERE id = ?', [req.userId], (err, user) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (post.authorId !== req.userId && user.role !== 'admin') {
                return res.status(403).json({ error: 'Not authorized' });
            }

            db.run('DELETE FROM posts WHERE id = ?', [req.params.id], function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: 'Post deleted successfully' });
            });
        });
    });
});

module.exports = router;
