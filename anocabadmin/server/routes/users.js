const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all users with filters
router.get('/', (req, res) => {
  const { user_type, status, city, search } = req.query;
  let query = 'SELECT * FROM vw_user_details WHERE 1=1';
  const params = [];

  if (user_type) {
    query += ' AND user_type = ?';
    params.push(user_type);
  }
  if (status !== undefined) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (city) {
    query += ' AND city = ?';
    params.push(city);
  }
  if (search) {
    query += ' AND (first_name LIKE ? OR last_name LIKE ? OR m_number LIKE ? OR email LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  query += ' ORDER BY created_at DESC';

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get user by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM vw_user_details WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(results[0]);
  });
});

// Get user redeemable amount
router.get('/:id/redeemable', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM vw_user_redeemable_amount WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results[0] || { redeemable_amount: 0 });
  });
});

// Create user
router.post('/', (req, res) => {
  const userData = req.body;
  const fields = Object.keys(userData).join(', ');
  const values = Object.values(userData);
  const placeholders = values.map(() => '?').join(', ');
  
  const query = `INSERT INTO users (${fields}) VALUES (${placeholders})`;
  db.query(query, values, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: results.insertId, message: 'User created successfully' });
  });
});

// Update user
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const userData = req.body;
  const fields = Object.keys(userData).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(userData), id];
  
  const query = `UPDATE users SET ${fields} WHERE id = ?`;
  db.query(query, values, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'User updated successfully' });
  });
});

// Delete user
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM users WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'User deleted successfully' });
  });
});

// Get dealers by city
router.get('/dealers/by-city', (req, res) => {
  const { city } = req.query;
  let query = 'SELECT * FROM vw_dealers_by_city WHERE 1=1';
  const params = [];

  if (city) {
    query += ' AND city = ?';
    params.push(city);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get electricians by city
router.get('/electricians/by-city', (req, res) => {
  const { city } = req.query;
  let query = 'SELECT * FROM vw_electricians_by_city WHERE 1=1';
  const params = [];

  if (city) {
    query += ' AND city = ?';
    params.push(city);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

module.exports = router;
