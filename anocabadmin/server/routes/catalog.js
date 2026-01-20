const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all catalogs
router.get('/', (req, res) => {
  const { status, search } = req.query;
  let query = 'SELECT c.*, a.username as created_by_name FROM catalog c LEFT JOIN admins a ON c.created_by = a.id WHERE 1=1';
  const params = [];

  if (status !== undefined) {
    query += ' AND c.status = ?';
    params.push(status);
  }
  if (search) {
    query += ' AND c.title LIKE ?';
    params.push(`%${search}%`);
  }

  query += ' ORDER BY c.created_at DESC';

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get catalog by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT c.*, a.username as created_by_name FROM catalog c LEFT JOIN admins a ON c.created_by = a.id WHERE c.id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Catalog not found' });
    }
    res.json(results[0]);
  });
});

// Create catalog
router.post('/', (req, res) => {
  const { title, link, file_type = 'pdf', file_size, status = 1, created_by } = req.body;
  const query = 'INSERT INTO catalog (title, link, file_type, file_size, status, created_by) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [title, link, file_type, file_size, status, created_by], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: results.insertId, message: 'Catalog created successfully' });
  });
});

// Update catalog
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, link, file_type, file_size, status } = req.body;
  const query = 'UPDATE catalog SET title = ?, link = ?, file_type = ?, file_size = ?, status = ? WHERE id = ?';
  db.query(query, [title, link, file_type, file_size, status, id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Catalog updated successfully' });
  });
});

// Delete catalog
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM catalog WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Catalog deleted successfully' });
  });
});

module.exports = router;
