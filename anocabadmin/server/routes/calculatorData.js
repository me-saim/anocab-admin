const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all calculator data
router.get('/', (req, res) => {
  const { category, status, search } = req.query;
  let query = 'SELECT * FROM calculator_data WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (status !== undefined) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  query += ' ORDER BY category, name';

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get calculator data by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM calculator_data WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Calculator data not found' });
    }
    res.json(results[0]);
  });
});

// Create calculator data
router.post('/', (req, res) => {
  const { category, name, value, unit, description, status = 1 } = req.body;
  const query = 'INSERT INTO calculator_data (category, name, value, unit, description, status) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [category, name, value, unit, description, status], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: results.insertId, message: 'Calculator data created successfully' });
  });
});

// Update calculator data
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { category, name, value, unit, description, status } = req.body;
  const query = 'UPDATE calculator_data SET category = ?, name = ?, value = ?, unit = ?, description = ?, status = ? WHERE id = ?';
  db.query(query, [category, name, value, unit, description, status, id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Calculator data updated successfully' });
  });
});

// Delete calculator data
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM calculator_data WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Calculator data deleted successfully' });
  });
});

module.exports = router;
