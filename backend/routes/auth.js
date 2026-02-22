const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user exists
        db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], async (err, user) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (user) {
                return res.status(400).json({ error: 'User already exists' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            db.run(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [username, email, hashedPassword],
                function (err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    // Generate token
                    const token = jwt.sign(
                        { userId: this.lastID },
                        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
                        { expiresIn: '7d' }
                    );

                    res.json({
                        token,
                        user: {
                            id: this.lastID,
                            username,
                            email,
                            role: 'user'
                        }
                    });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!user) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            // Verify password
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            // Generate token
            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET || 'your-secret-key-change-in-production',
                { expiresIn: '7d' }
            );

            // Parse skills and interests
            const profile = {
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                bio: user.bio || '',
                location: user.location || '',
                website: user.website || '',
                avatarUrl: user.avatarUrl || '',
                skills: user.skills ? JSON.parse(user.skills) : [],
                interests: user.interests ? JSON.parse(user.interests) : [],
                socialLinks: {
                    twitter: user.socialTwitter || '',
                    github: user.socialGithub || '',
                    linkedin: user.socialLinkedin || ''
                }
            };

            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    profile,
                    createdAt: user.createdAt
                }
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Verify token
router.get('/verify', (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');

        db.get('SELECT * FROM users WHERE id = ?', [decoded.userId], (err, user) => {
            if (err || !user) {
                return res.status(400).json({ error: 'Invalid token' });
            }

            const profile = {
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                bio: user.bio || '',
                location: user.location || '',
                website: user.website || '',
                avatarUrl: user.avatarUrl || '',
                skills: user.skills ? JSON.parse(user.skills) : [],
                interests: user.interests ? JSON.parse(user.interests) : [],
                socialLinks: {
                    twitter: user.socialTwitter || '',
                    github: user.socialGithub || '',
                    linkedin: user.socialLinkedin || ''
                }
            };

            res.json({
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    profile,
                    createdAt: user.createdAt
                }
            });
        });
    } catch (error) {
        res.status(400).json({ error: 'Invalid token' });
    }
});

module.exports = router;
