# Community Website - Full Stack Application

Eine vollständige Community-Website mit Backend (Node.js/Express/SQLite) und Frontend (Vanilla HTML/CSS/JS).

## Features

✅ **Benutzer-Authentifizierung** - Register, Login mit JWT  
✅ **Erweiterte Profile** - Avatar-Upload, Skills, Interessen, Social Links  
✅ **Posts-System** - Erstellen, Bearbeiten, Löschen mit Bild-Upload  
✅ **Messaging-System** - Echtzeit-Chat mit Socket.io  
✅ **Forum** - Themen, Antworten, Kategorien, Admin-Moderation  
✅ **Mitgliedsbereich** - Alle Benutzer durchsuchen  

---

## Voraussetzungen

- **Node.js** (v16 oder höher) - [Download](https://nodejs.org/)
- **npm** (kommt mit Node.js)

---

## Installation

### 1. Node.js installieren

Falls noch nicht installiert:
1. Gehe zu https://nodejs.org/
2. Lade die LTS-Version herunter
3. Installiere Node.js (npm wird automatisch mitinstalliert)
4. Überprüfe die Installation:
   ```bash
   node --version
   npm --version
   ```

### 2. Dependencies installieren

```bash
cd C:\Users\Sydney\.gemini\antigravity\scratch\community-website
npm install
```

Dies installiert alle benötigten Pakete:
- express
- sqlite3
- bcryptjs
- jsonwebtoken
- multer
- socket.io
- cors
- dotenv

---

## Server starten

### Entwicklungsmodus (mit Auto-Reload):

```bash
npm run dev
```

### Produktionsmodus:

```bash
npm start
```

Der Server läuft auf: **http://localhost:3000**

---

## Verwendung

### 1. Server starten

```bash
npm run dev
```

Du solltest diese Ausgabe sehen:
```
╔═══════════════════════════════════════════╗
║   Community Website Backend Server       ║
║   Running on http://localhost:3000      ║
║   Database: SQLite                        ║
║   WebSocket: Enabled                      ║
╚═══════════════════════════════════════════╝
```

### 2. Website öffnen

Öffne deinen Browser und gehe zu:
```
http://localhost:3000
```

### 3. Registrieren

1. Klicke auf "Registrieren"
2. Erstelle einen Account
3. Du wirst automatisch eingeloggt

### 4. Features nutzen

**Profile bearbeiten:**
- Dashboard → "Profil bearbeiten"
- Avatar hochladen, Skills hinzufügen, etc.

**Posts erstellen:**
- "Neuen Beitrag erstellen"
- Optional: Bild hochladen

**Nachrichten senden:**
- "Mitglieder" → Profil öffnen → "Nachricht senden"
- Echtzeit-Chat

**Forum nutzen:**
- "Forum" → "Neues Thema erstellen"
- Antworten auf Themen

---

## Projektstruktur

```
community-website/
├── backend/                    # Backend-Code
│   ├── ...
├── frontend/                   # Frontend-Dateien
│   ├── login.html             # Login/Register (ehemals index.html)
│   ├── index.html             # Redirect zu posts.html
│   ├── posts.html             # Startseite (Beiträge)
│   ├── ...
├── database.sqlite
├── package.json
└── README.md
```

---

## API-Endpoints

### Authentication
- `POST /api/auth/register` - Registrieren
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Token verifizieren

### Users
- `GET /api/users` - Alle Benutzer
- `GET /api/users/:id` - Benutzer nach ID
- `PUT /api/users/profile` - Profil aktualisieren
- `POST /api/users/avatar` - Avatar hochladen

### Posts
- `GET /api/posts` - Alle Posts
- `GET /api/posts/:id` - Post nach ID
- `POST /api/posts` - Post erstellen
- `PUT /api/posts/:id` - Post aktualisieren
- `DELETE /api/posts/:id` - Post löschen

### Messages
- `GET /api/messages/conversations` - Konversationen
- `GET /api/messages/:userId` - Nachrichten mit User
- `POST /api/messages` - Nachricht senden
- `GET /api/messages/unread/count` - Ungelesene Nachrichten

### Forum
- `GET /api/forum/topics` - Alle Themen
- `GET /api/forum/topics/:id` - Thema nach ID
- `POST /api/forum/topics` - Thema erstellen
- `POST /api/forum/topics/:id/replies` - Antwort hinzufügen
- `PUT /api/forum/topics/:id` - Thema aktualisieren (Admin)
- `DELETE /api/forum/topics/:id` - Thema löschen (Admin)

---

## Datenbank

Die SQLite-Datenbank wird automatisch beim ersten Start erstellt.

**Tabellen:**
- `users` - Benutzer mit Profilen
- `posts` - Beiträge
- `messages` - Nachrichten
- `forum_topics` - Forum-Themen
- `forum_replies` - Forum-Antworten

**Datenbank zurücksetzen:**
```bash
# Lösche die Datei
rm database.sqlite

# Starte den Server neu (Datenbank wird neu erstellt)
npm run dev
```

---

## Technologie-Stack

**Backend:**
- Node.js + Express
- SQLite (Datenbank)
- bcryptjs (Password Hashing)
- jsonwebtoken (JWT Authentication)
- Multer (File Upload)
- Socket.io (Real-time Messaging)

**Frontend:**
- Vanilla HTML/CSS/JavaScript
- Socket.io Client
- Fetch API

---

## Entwicklung

### Nodemon (Auto-Reload)

Der Dev-Server verwendet Nodemon für automatisches Neuladen:
```bash
npm run dev
```

### Debugging

Logs werden in der Konsole angezeigt:
- Server-Start
- API-Requests
- Socket.io Connections
- Fehler

---

## Sicherheit

⚠️ **Wichtig für Produktion:**

1. **JWT Secret ändern:**
   - Bearbeite `.env`
   - Setze `JWT_SECRET` auf einen sicheren Wert

2. **HTTPS verwenden:**
   - Für Produktion SSL/TLS einrichten

3. **CORS konfigurieren:**
   - In `backend/server.js` CORS-Origin einschränken

4. **File Upload Limits:**
   - Bereits auf 5MB begrenzt
   - Bei Bedarf in `backend/middleware/upload.js` anpassen

5. **Input Validation:**
   - Bereits implementiert
   - Bei Bedarf erweitern

---

## Troubleshooting

### "npm: command not found"
- Node.js ist nicht installiert
- Installiere von https://nodejs.org/

### "Port 3000 already in use"
- Ein anderer Prozess nutzt Port 3000
- Ändere Port in `.env`: `PORT=3001`

### "Database locked"
- Datenbank wird von anderem Prozess verwendet
- Stoppe alle laufenden Server-Instanzen

### "Cannot find module"
- Dependencies nicht installiert
- Führe `npm install` aus

---

## Nächste Schritte

**Empfohlene Erweiterungen:**

1. **Email-Verifikation**
2. **Passwort zurücksetzen**
3. **Benachrichtigungen**
4. **Erweiterte Suche**
5. **Likes/Reactions**
6. **Kommentare für Posts**
7. **User-Rollen erweitern**
8. **Admin-Panel**

---

## Support

Bei Fragen oder Problemen:
1. Überprüfe die Konsolen-Logs
2. Stelle sicher, dass alle Dependencies installiert sind
3. Überprüfe die Datenbank-Datei

---

## Lizenz

MIT License - Frei verwendbar für eigene Projekte

---

**Viel Spaß mit deiner Community-Website! 🚀**
