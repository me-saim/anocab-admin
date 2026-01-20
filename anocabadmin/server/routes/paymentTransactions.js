const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all payment transactions
router.get('/', (req, res) => {
  const { user_id, status, order_id } = req.query;
  let query = 'SELECT pt.*, u.m_number, u.first_name, u.last_name FROM payment_transactions pt LEFT JOIN users u ON pt.user_id = u.id WHERE 1=1';
  const params = [];

  if (user_id) {
    query += ' AND pt.user_id = ?';
    params.push(user_id);
  }
  if (status) {
    query += ' AND pt.status = ?';
    params.push(status);
  }
  if (order_id) {
    query += ' AND pt.order_id = ?';
    params.push(order_id);
  }

  query += ' ORDER BY pt.created_at DESC';

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get payment transaction by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT pt.*, u.m_number, u.first_name, u.last_name FROM payment_transactions pt LEFT JOIN users u ON pt.user_id = u.id WHERE pt.id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Payment transaction not found' });
    }
    res.json(results[0]);
  });
});

// Update payment transaction
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { status, gateway_response, error_message } = req.body;
  const query = 'UPDATE payment_transactions SET status = ?, gateway_response = ?, error_message = ? WHERE id = ?';
  db.query(query, [status, gateway_response, error_message, id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Payment transaction updated successfully' });
  });
});

module.exports = router;
