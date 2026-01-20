const express = require('express');
const router = express.Router();
const db = require('../db');

// Get dashboard statistics
router.get('/stats', (req, res) => {
  const queries = {
    totalUsers: 'SELECT COUNT(*) as count FROM users',
    activeUsers: 'SELECT COUNT(*) as count FROM users WHERE status = 0',
    totalAdmins: 'SELECT COUNT(*) as count FROM admins WHERE status = 1',
    totalBlogs: 'SELECT COUNT(*) as count FROM blogs',
    publishedBlogs: 'SELECT COUNT(*) as count FROM blogs WHERE status = 1',
    totalQRCodes: 'SELECT COUNT(*) as count FROM qr_codes',
    scannedQRCodes: 'SELECT COUNT(*) as count FROM qr_codes WHERE is_scanned = 1',
    totalRedeems: 'SELECT COUNT(*) as count FROM redeem_transactions',
    pendingRedeems: 'SELECT COUNT(*) as count FROM redeem_transactions WHERE status = "pending"',
    totalPayments: 'SELECT COUNT(*) as count FROM payment_transactions',
    totalPoints: 'SELECT SUM(points) as total FROM users',
    totalRedeemed: 'SELECT SUM(amount) as total FROM redeem_transactions WHERE status = "completed"',
    totalCatalogs: 'SELECT COUNT(*) as count FROM catalog WHERE status = 1'
  };

  const stats = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.keys(queries).forEach((key) => {
    db.query(queries[key], (err, results) => {
      if (!err && results.length > 0) {
        stats[key] = results[0].count || results[0].total || 0;
      } else {
        stats[key] = 0;
      }
      completed++;
      if (completed === total) {
        res.json(stats);
      }
    });
  });
});

// Get recent activities
router.get('/recent', (req, res) => {
  const query = `
    (SELECT 'user' as type, id, CONCAT(first_name, ' ', last_name) as name, created_at FROM users ORDER BY created_at DESC LIMIT 5)
    UNION ALL
    (SELECT 'blog' as type, id, title as name, created_at FROM blogs ORDER BY created_at DESC LIMIT 5)
    UNION ALL
    (SELECT 'redeem' as type, id, order_id as name, created_at FROM redeem_transactions ORDER BY created_at DESC LIMIT 5)
    ORDER BY created_at DESC LIMIT 10
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

module.exports = router;
