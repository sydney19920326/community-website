const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all users
router.get('/', (req, res) => {
    db.all('SELECT id, username, email, role, firstName, lastName, bio, location, avatarUrl, skills, interests, createdAt FROM users', [], (err, users) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const formattedUsers = users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            profile: {
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                bio: user.bio || '',
                location: user.location || '',
                avatarUrl: user.avatarUrl || '',
                skills: user.skills ? JSON.parse(user.skills) : [],
                interests: user.interests ? JSON.parse(user.interests) : []
            },
            createdAt: user.createdAt
        }));

        res.json(formattedUsers);
    });
});

// Get user by ID
router.get('/:id', (req, res) => {
    db.get('SELECT * FROM users WHERE id = ?', [req.params.id], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
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
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            profile,
            createdAt: user.createdAt
        });
    });
});

// Update profile
router.put('/profile', auth, (req, res) => {
    const { firstName, lastName, bio, location, website, skills, interests, socialLinks } = req.body;

    db.run(
        `UPDATE users SET 
      firstName = ?, 
      lastName = ?, 
      bio = ?, 
      location = ?, 
      website = ?,
      skills = ?,
      interests = ?,
      socialTwitter = ?,
      socialGithub = ?,
      socialLinkedin = ?
    WHERE id = ?`,
        [
            firstName || '',
            lastName || '',
            bio || '',
            location || '',
            website || '',
            JSON.stringify(skills || []),
            JSON.stringify(interests || []),
            socialLinks?.twitter || '',
            socialLinks?.github || '',
            socialLinks?.linkedin || '',
            req.userId
        ],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            db.get('SELECT * FROM users WHERE id = ?', [req.userId], (err, user) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
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
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    profile,
                    createdAt: user.createdAt
                });
            });
        }
    );
});

// Upload avatar
router.post('/avatar', auth, upload.single('avatar'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    db.run('UPDATE users SET avatarUrl = ? WHERE id = ?', [avatarUrl, req.userId], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({ avatarUrl });
    });
});

module.exports = router;
