const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all redeem transactions
router.get('/', (req, res) => {
  const { user_id, status, order_id } = req.query;
  let query = 'SELECT rt.*, u.m_number, u.first_name, u.last_name, a.username as processed_by_name FROM redeem_transactions rt LEFT JOIN users u ON rt.user_id = u.id LEFT JOIN admins a ON rt.processed_by = a.id WHERE 1=1';
  const params = [];

  if (user_id) {
    query += ' AND rt.user_id = ?';
    params.push(user_id);
  }
  if (status) {
    query += ' AND rt.status = ?';
    params.push(status);
  }
  if (order_id) {
    query += ' AND rt.order_id = ?';
    params.push(order_id);
  }

  query += ' ORDER BY rt.created_at DESC';

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get redeem transaction by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT rt.*, u.m_number, u.first_name, u.last_name, a.username as processed_by_name FROM redeem_transactions rt LEFT JOIN users u ON rt.user_id = u.id LEFT JOIN admins a ON rt.processed_by = a.id WHERE rt.id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Redeem transaction not found' });
    }
    res.json(results[0]);
  });
});

// Update redeem transaction status
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { status, payment_status, remarks, processed_by } = req.body;
  const query = 'UPDATE redeem_transactions SET status = ?, payment_status = ?, remarks = ?, processed_by = ?, processed_at = NOW() WHERE id = ?';
  db.query(query, [status, payment_status, remarks, processed_by, id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Redeem transaction updated successfully' });
  });
});

// Delete redeem transaction
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM redeem_transactions WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Redeem transaction deleted successfully' });
  });
});

module.exports = router;
