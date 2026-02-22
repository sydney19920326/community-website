const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const db = new sqlite3.Database(path.join(__dirname, '..', 'database.sqlite'), (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        firstName TEXT,
        lastName TEXT,
        bio TEXT,
        location TEXT,
        website TEXT,
        avatarUrl TEXT,
        skills TEXT,
        interests TEXT,
        socialTwitter TEXT,
        socialGithub TEXT,
        socialLinkedin TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Posts table
    db.run(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        imageUrl TEXT,
        authorId INTEGER NOT NULL,
        status TEXT DEFAULT 'published',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (authorId) REFERENCES users(id)
      )
    `);

    // Messages table
    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        senderId INTEGER NOT NULL,
        recipientId INTEGER NOT NULL,
        content TEXT NOT NULL,
        read INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (senderId) REFERENCES users(id),
        FOREIGN KEY (recipientId) REFERENCES users(id)
      )
    `);

    // Forum topics table
    db.run(`
      CREATE TABLE IF NOT EXISTS forum_topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        authorId INTEGER NOT NULL,
        views INTEGER DEFAULT 0,
        pinned INTEGER DEFAULT 0,
        locked INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (authorId) REFERENCES users(id)
      )
    `);

    // Forum replies table
    db.run(`
      CREATE TABLE IF NOT EXISTS forum_replies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topicId INTEGER NOT NULL,
        authorId INTEGER NOT NULL,
        content TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (topicId) REFERENCES forum_topics(id),
        FOREIGN KEY (authorId) REFERENCES users(id)
      )
    `);

    console.log('Database tables initialized');
    seedUsers();
  });
}

function seedUsers() {
  db.get("SELECT count(*) as count FROM users", (err, row) => {
    if (err) return console.error(err.message);
    if (row.count === 0) {
      console.log('Seeding default users...');
      const bcrypt = require('bcryptjs');
      const adminPass = bcrypt.hashSync('admin123', 10);
      const userPass = bcrypt.hashSync('user123', 10);

      db.serialize(() => {
        db.run("INSERT INTO users (username, email, password, role) VALUES ('admin', 'admin@example.com', ?, 'admin')", [adminPass]);
        db.run("INSERT INTO users (username, email, password, role) VALUES ('user', 'user@example.com', ?, 'user')", [userPass]);
        console.log('Default users created.');
      });
    }
  });
}

module.exports = db;
