const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all admins
router.get('/', (req, res) => {
  const query = 'SELECT id, username, email, first_name, last_name, role, status, last_login, created_at FROM admins';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get admin by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT id, username, email, first_name, last_name, role, status, last_login, created_at FROM admins WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    res.json(results[0]);
  });
});

// Create admin
router.post('/', (req, res) => {
  const { username, email, password, first_name, last_name, role = 'admin', status = 1 } = req.body;
  const query = 'INSERT INTO admins (username, email, password, first_name, last_name, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [username, email, password, first_name, last_name, role, status], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: results.insertId, message: 'Admin created successfully' });
  });
});

// Update admin
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { username, email, first_name, last_name, role, status } = req.body;
  const query = 'UPDATE admins SET username = ?, email = ?, first_name = ?, last_name = ?, role = ?, status = ? WHERE id = ?';
  db.query(query, [username, email, first_name, last_name, role, status, id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Admin updated successfully' });
  });
});

// Delete admin
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM admins WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Admin deleted successfully' });
  });
});

// Admin login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Optimized query - only select necessary fields and check status
  const query = 'SELECT id, username, email, first_name, last_name, role, status FROM admins WHERE username = ? AND password = ? AND status = 1 LIMIT 1';
  
  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Login database error:', {
        message: err.message,
        code: err.code,
        errno: err.errno,
        sqlState: err.sqlState,
        sqlMessage: err.sqlMessage
      });
      
      // Return more specific error message
      if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
        return res.status(500).json({ error: 'Database connection error. Please check if MySQL is running.' });
      } else if (err.sqlMessage) {
        return res.status(500).json({ error: `Database error: ${err.sqlMessage}` });
      } else {
        return res.status(500).json({ error: err.message || 'Database error. Please try again.' });
      }
    }
    
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const admin = results[0];
    
    // Update last login asynchronously (non-blocking) - don't wait for it
    db.query('UPDATE admins SET last_login = NOW() WHERE id = ?', [admin.id], (updateErr) => {
      if (updateErr) {
        console.error('Error updating last login:', updateErr);
      }
    });
    
    // Return response immediately
    res.json({ admin, message: 'Login successful' });
  });
});

module.exports = router;
