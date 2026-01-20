const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all QR scans
router.get('/', (req, res) => {
  const { user_id, qr_code_id } = req.query;
  let query = 'SELECT * FROM vw_qr_scan_history WHERE 1=1';
  const params = [];

  if (user_id) {
    query += ' AND user_id = ?';
    params.push(user_id);
  }
  if (qr_code_id) {
    query += ' AND qr_code_id = ?';
    params.push(qr_code_id);
  }

  query += ' ORDER BY scanned_at DESC';

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get QR scan by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM vw_qr_scan_history WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'QR scan not found' });
    }
    res.json(results[0]);
  });
});

module.exports = router;
