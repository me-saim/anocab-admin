const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all blogs
router.get('/', (req, res) => {
  const { type, status, search } = req.query;
  let query = 'SELECT b.*, a.username as created_by_name FROM blogs b LEFT JOIN admins a ON b.created_by = a.id WHERE 1=1';
  const params = [];

  if (type) {
    query += ' AND b.type = ?';
    params.push(type);
  }
  if (status !== undefined) {
    query += ' AND b.status = ?';
    params.push(status);
  }
  if (search) {
    query += ' AND (b.title LIKE ? OR b.description LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  query += ' ORDER BY b.created_at DESC';

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get blog by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT b.*, a.username as created_by_name FROM blogs b LEFT JOIN admins a ON b.created_by = a.id WHERE b.id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json(results[0]);
  });
});

// Create blog
router.post('/', (req, res) => {
  const { title, description, img, type = 1, status = 1, created_by } = req.body;
  const query = 'INSERT INTO blogs (title, description, img, type, status, created_by) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [title, description, img, type, status, created_by], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: results.insertId, message: 'Blog created successfully' });
  });
});

// Update blog
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, img, type, status } = req.body;
  const query = 'UPDATE blogs SET title = ?, description = ?, img = ?, type = ?, status = ? WHERE id = ?';
  db.query(query, [title, description, img, type, status, id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Blog updated successfully' });
  });
});

// Delete blog
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM blogs WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Blog deleted successfully' });
  });
});

module.exports = router;
