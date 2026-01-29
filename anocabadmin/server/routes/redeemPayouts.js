const express = require('express');
const router = express.Router();
const redeemPayoutsController = require('../controllers/redeemPayoutsController');

// GET /api/redeem-payouts?status=pending&user_id=1&redeem_transaction_id=10
router.get('/', redeemPayoutsController.getAll);

// POST /api/redeem-payouts (optional)
router.post('/', redeemPayoutsController.create);

// POST /api/redeem-payouts/mark-done
router.post('/mark-done', redeemPayoutsController.markDone);

// GET /api/redeem-payouts/:id
router.get('/:id', redeemPayoutsController.getById);

module.exports = router;

