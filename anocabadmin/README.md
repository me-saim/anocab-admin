# Anocab Admin Panel

Professional admin control panel for managing Anocab database.

## Features

- **Dashboard**: Overview statistics and recent activities
- **User Management**: Manage regular users, electricians, and dealers
- **Admin Management**: Manage admin accounts
- **Blog Management**: Manage news, blogs, and events
- **Catalog Management**: Manage catalog files
- **QR Code Management**: Create and manage QR codes
- **QR Scan History**: View QR scan records
- **Redeem Transactions**: Manage redemption requests
- **Payment Transactions**: View payment records
- **Calculator Data**: Manage calculator configuration data

## Setup Instructions

### Quick Start (Production - Combined Server)

1. Install all dependencies:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

2. Create a `.env` file in the `server/` directory:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=anocab
```

3. Build the React app:
```bash
npm run build
```

4. Start the combined server (serves both frontend and API):
```bash
npm run server
```

The application will be available at `http://localhost:5000`

### Development Mode

For development, you can run frontend and backend separately:

1. **Option 1: Separate servers (for development)**
   - Terminal 1 - Start React dev server:
     ```bash
     npm start
     ```
   - Terminal 2 - Start API server:
     ```bash
     npm run server:dev
     ```

2. **Option 2: Combined (production-like)**
   ```bash
   npm run build:server
   ```
   This builds React and starts the server serving both.

## Project Structure

```
anocabadmin/
├── server/                 # Backend API
│   ├── routes/             # API route handlers
│   ├── index.js            # Server entry point
│   └── package.json        # Server dependencies
├── src/
│   ├── components/         # Reusable components
│   │   └── Layout/         # Dashboard layout
│   ├── pages/              # Page components
│   │   ├── Dashboard/
│   │   ├── Users/
│   │   ├── Admins/
│   │   ├── Blogs/
│   │   ├── Catalog/
│   │   ├── QRCodes/
│   │   ├── QRScans/
│   │   ├── RedeemTransactions/
│   │   ├── PaymentTransactions/
│   │   ├── CalculatorData/
│   │   └── Login/
│   ├── services/           # API service functions
│   │   └── api.js
│   ├── App.js              # Main app component with routing
│   └── index.js            # React entry point
└── package.json            # Frontend dependencies
```

## API Endpoints

All API endpoints are prefixed with `/api`:

- `/api/admins` - Admin management
- `/api/users` - User management
- `/api/blogs` - Blog management
- `/api/catalog` - Catalog management
- `/api/qr-codes` - QR code management
- `/api/qr-scans` - QR scan history
- `/api/redeem-transactions` - Redeem transaction management
- `/api/payment-transactions` - Payment transaction management
- `/api/calculator-data` - Calculator data management
- `/api/dashboard` - Dashboard statistics

## Design

- **Color Scheme**: White background with black text for professional appearance
- **Layout**: Sidebar navigation with collapsible menu
- **Responsive**: Mobile-friendly design
- **Clean UI**: Minimalist and professional interface

## Notes

- Make sure your MySQL database is running and the `anocab` database is created
- Import the `anocab.sql` file into your database
- Default admin login credentials should be set in your database
- **Production**: The server runs on port 5000 and serves both frontend and API
- **Development**: Frontend runs on port 3000, API on port 5000 (separate servers)
- After building, the React app is served as static files from the Express server
- No CORS issues in production since everything is on the same server
