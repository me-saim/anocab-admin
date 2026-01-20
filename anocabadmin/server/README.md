# Anocab Admin API Server

Backend API server for the Anocab Admin Panel.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the following variables:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=anocab
```

**Important**: 
- If your MySQL user has **no password**, either:
  - Leave `DB_PASSWORD=` (empty, no quotes)
  - Or don't include the `DB_PASSWORD` line at all
- If your MySQL user has a password, set it: `DB_PASSWORD=your_actual_password`
- Do NOT use quotes around the password value

3. Make sure your MySQL database is running and the `anocab` database exists.

4. Import the `anocab.sql` file into your database.

5. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Routes

- `GET /api/health` - Health check
- `GET /api/admins` - Get all admins
- `POST /api/admins/login` - Admin login
- `GET /api/users` - Get all users (with filters)
- `GET /api/blogs` - Get all blogs
- `GET /api/catalog` - Get all catalogs
- `GET /api/qr-codes` - Get all QR codes
- `GET /api/qr-scans` - Get QR scan history
- `GET /api/redeem-transactions` - Get redeem transactions
- `GET /api/payment-transactions` - Get payment transactions
- `GET /api/calculator-data` - Get calculator data
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent` - Get recent activities

All routes support standard CRUD operations (GET, POST, PUT, DELETE) where applicable.
