const db = require('./db');
require('dotenv').config();

// Create default admin user
const defaultAdmin = {
  username: 'admin',
  email: 'admin@anocab.com',
  password: 'admin123', // Change this password after first login!
  first_name: 'Admin',
  last_name: 'User',
  role: 'admin',
  status: 1
};

console.log('Creating default admin user...');

const query = 'INSERT INTO admins (username, email, password, first_name, last_name, role, status) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE username = username';

db.query(query, [
  defaultAdmin.username,
  defaultAdmin.email,
  defaultAdmin.password,
  defaultAdmin.first_name,
  defaultAdmin.last_name,
  defaultAdmin.role,
  defaultAdmin.status
], (err, results) => {
  if (err) {
    console.error('❌ Error creating admin:', err.message);
    process.exit(1);
  } else {
    if (results.affectedRows > 0) {
      console.log('✅ Default admin user created successfully!');
      console.log('\n📋 Login credentials:');
      console.log(`   Username: ${defaultAdmin.username}`);
      console.log(`   Password: ${defaultAdmin.password}`);
      console.log('\n⚠️  IMPORTANT: Change this password after first login!');
    } else {
      console.log('ℹ️  Admin user already exists. No changes made.');
    }
    process.exit(0);
  }
});
