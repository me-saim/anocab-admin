# Setup Instructions

## Quick Start

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Database Setup

1. Make sure MySQL is running
2. Create the database (if not exists):
   ```sql
   CREATE DATABASE anocab;
   ```
3. Import the database schema:
   ```bash
   mysql -u root anocab < anocab.sql
   ```
   Or use phpMyAdmin to import `anocab.sql`

### 3. Configure Environment

Create `server/.env` file:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=anocab
```

**Note**: If your MySQL root user has no password, leave `DB_PASSWORD=` empty (or omit the line).

### 4. Create Default Admin User

Run the setup script to create a default admin:
```bash
cd server
npm run setup-admin
cd ..
```

This will create:
- **Username**: `admin`
- **Password**: `admin123`

**⚠️ IMPORTANT**: Change this password after first login!

### 5. Build and Start

```bash
# Build React app
npm run build

# Start the server (serves both frontend and API)
npm run server
```

### 6. Access the Application

Open your browser and go to: **http://localhost:5000**

Login with:
- Username: `admin`
- Password: `admin123`

## Alternative: Create Admin via SQL

If you prefer to create the admin directly in the database:

```sql
USE anocab;

INSERT INTO admins (username, email, password, first_name, last_name, role, status) 
VALUES ('admin', 'admin@anocab.com', 'admin123', 'Admin', 'User', 'admin', 1);
```

## Troubleshooting

### Database Connection Error
- Check if MySQL is running
- Verify database name is `anocab`
- Check `.env` file credentials
- Make sure database exists: `SHOW DATABASES;`

### Login Fails with "Invalid credentials"
- Make sure you've created an admin user (run `npm run setup-admin` in server folder)
- Check if admin exists: `SELECT * FROM admins;`
- Verify username and password match

### Port Already in Use
- Change `PORT` in `server/.env` to a different port (e.g., 5001)
- Or stop the process using port 5000
