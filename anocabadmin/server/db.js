const mysql = require('mysql2');
require('dotenv').config();

// Database connection configuration
// Handle empty password - if DB_PASSWORD is empty string, don't include it
const password = process.env.DB_PASSWORD;
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  database: process.env.DB_NAME || 'anocab',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Only add password if it's provided and not empty
if (password && password.trim() !== '') {
  dbConfig.password = password;
}

// Use connection pool for better performance
const db = mysql.createPool(dbConfig);

// Test connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('\n❌ Database connection error:', err.message);
    console.error('\n📋 Please check your database configuration:');
    console.error(`   - Host: ${dbConfig.host}`);
    console.error(`   - User: ${dbConfig.user}`);
    console.error(`   - Database: ${dbConfig.database}`);
    console.error(`   - Password: ${dbConfig.password ? '***' : '(not set - no password)'}`);
    console.error('\n💡 Make sure:');
    console.error('   1. MySQL server is running');
    console.error('   2. Database "anocab" exists');
    console.error('   3. User credentials are correct in server/.env file');
    console.error('   4. If no password, leave DB_PASSWORD empty in .env\n');
  } else {
    console.log('✅ Connected to MySQL database:', dbConfig.database);
    connection.release();
  }
});

// Handle pool errors
db.on('error', (err) => {
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was closed.');
  } else if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('Database has too many connections.');
  } else if (err.code === 'ECONNREFUSED') {
    console.error('Database connection was refused.');
  }
});

// Use promise wrapper for async/await support
const promisePool = db.promise();

module.exports = db;
module.exports.promise = promisePool;
