const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

async function createAdmin() {
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    db.get("SELECT * FROM users WHERE username = 'admin'", (err, row) => {
        if (err) {
            console.error(err);
            return;
        }
        if (row) {
            console.log('Admin user already exists. Updating password and role...');
            // Force update password and role
            db.run("UPDATE users SET password = ?, role = 'admin' WHERE username = 'admin'", [hashedPassword], (err) => {
                if (err) console.error(err);
                else {
                    console.log('Admin updated successfully.');
                    console.log('Username: admin');
                    console.log('Password: password123');
                }
            });

        } else {
            db.run(
                "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
                ['admin', 'admin@example.com', hashedPassword, 'admin'],
                (err) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log('Admin user created successfully.');
                        console.log('Username: admin');
                        console.log('Password: password123');
                    }
                }
            );
        }
    });
}

createAdmin();
