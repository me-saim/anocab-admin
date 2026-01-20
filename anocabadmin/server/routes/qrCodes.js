const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all QR codes
router.get('/', (req, res) => {
  const { is_scanned, search } = req.query;
  let query = 'SELECT q.*, u.m_number as scanned_by_number, a.username as created_by_name FROM qr_codes q LEFT JOIN users u ON q.scanned_by = u.id LEFT JOIN admins a ON q.created_by = a.id WHERE 1=1';
  const params = [];

  if (is_scanned !== undefined) {
    query += ' AND q.is_scanned = ?';
    params.push(is_scanned);
  }
  if (search) {
    query += ' AND (q.code LIKE ? OR q.product LIKE ? OR q.details LIKE ?)';
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam);
  }

  query += ' ORDER BY q.created_at DESC';

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get QR code by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT q.*, u.m_number as scanned_by_number, a.username as created_by_name FROM qr_codes q LEFT JOIN users u ON q.scanned_by = u.id LEFT JOIN admins a ON q.created_by = a.id WHERE q.id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'QR code not found' });
    }
    res.json(results[0]);
  });
});

// Create QR code (single or bulk)
router.post('/', (req, res) => {
  const { product, details, points = 0, expires_at, created_by, quantity = 1 } = req.body;
  
  if (quantity <= 0 || quantity > 1000) {
    return res.status(400).json({ error: 'Quantity must be between 1 and 1000' });
  }

  const codes = [];
  const values = [];
  
  // Generate multiple unique QR codes
  for (let i = 0; i < quantity; i++) {
    const uniqueId = `QR-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    codes.push(uniqueId);
    values.push([uniqueId, product, details, points, expires_at || null, created_by]);
  }
  
  const query = 'INSERT INTO qr_codes (code, product, details, points, expires_at, created_by) VALUES ?';
  db.query(query, [values], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Fetch all created QR codes with their IDs
    const placeholders = codes.map(() => '?').join(',');
    const fetchQuery = `SELECT id, code FROM qr_codes WHERE code IN (${placeholders}) ORDER BY id DESC LIMIT ?`;
    db.query(fetchQuery, [...codes, quantity], (fetchErr, qrResults) => {
      if (fetchErr) {
        return res.status(500).json({ error: fetchErr.message });
      }
      res.status(201).json({ 
        count: quantity,
        codes: qrResults,
        message: `${quantity} QR code(s) created successfully` 
      });
    });
  });
});

// Update QR code
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { product, details, points, expires_at } = req.body;
  const query = 'UPDATE qr_codes SET product = ?, details = ?, points = ?, expires_at = ? WHERE id = ?';
  db.query(query, [product, details, points, expires_at || null, id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'QR code updated successfully' });
  });
});

// Delete QR code
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM qr_codes WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'QR code deleted successfully' });
  });
});

module.exports = router;
