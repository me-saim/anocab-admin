const redeemPayoutsModel = require('../models/redeemPayoutsModel');

function parsePositiveInt(value) {
  const n = Number.parseInt(String(value), 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function normalizePayoutStatus(value) {
  const v = String(value || '').trim().toLowerCase();
  if (v === 'pending' || v === 'done' || v === 'failed' || v === 'cancelled') return v;
  return null;
}

function normalizePayoutMethod(value) {
  const v = String(value || '').trim().toLowerCase();
  if (v === 'bank' || v === 'upi' || v === 'cash' || v === 'other') return v;
  return null;
}

exports.getAll = async (req, res) => {
  try {
    const status = req.query.status ? normalizePayoutStatus(req.query.status) : null;
    const user_id = req.query.user_id ? parsePositiveInt(req.query.user_id) : null;
    const redeem_transaction_id = req.query.redeem_transaction_id ? parsePositiveInt(req.query.redeem_transaction_id) : null;

    if (req.query.status && !status) {
      return res.status(400).json({ error: 'status must be pending, done, failed, or cancelled' });
    }
    if (req.query.user_id && user_id === null) {
      return res.status(400).json({ error: 'user_id must be a positive integer' });
    }
    if (req.query.redeem_transaction_id && redeem_transaction_id === null) {
      return res.status(400).json({ error: 'redeem_transaction_id must be a positive integer' });
    }

    const rows = await redeemPayoutsModel.list({
      status: status || undefined,
      user_id: user_id || undefined,
      redeem_transaction_id: redeem_transaction_id || undefined,
    });
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to fetch redeem payouts' });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid id' });

    const row = await redeemPayoutsModel.getById(id);
    if (!row) return res.status(404).json({ error: 'Redeem payout not found' });
    return res.json(row);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to fetch redeem payout' });
  }
};

// Optional: create a payout record (usually pending)
exports.create = async (req, res) => {
  try {
    const redeem_transaction_id = parsePositiveInt(req.body.redeem_transaction_id);
    const user_id = parsePositiveInt(req.body.user_id);
    const amount = Number(req.body.amount);

    if (redeem_transaction_id === null) return res.status(400).json({ error: 'redeem_transaction_id must be a positive integer' });
    if (user_id === null) return res.status(400).json({ error: 'user_id must be a positive integer' });
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'amount must be a positive number' });

    const payout_method = req.body.payout_method ? normalizePayoutMethod(req.body.payout_method) : 'bank';
    if (req.body.payout_method && !payout_method) {
      return res.status(400).json({ error: 'payout_method must be bank, upi, cash, or other' });
    }

    const status = req.body.status ? normalizePayoutStatus(req.body.status) : 'pending';
    if (req.body.status && !status) {
      return res.status(400).json({ error: 'status must be pending, done, failed, or cancelled' });
    }

    const processed_by = req.body.processed_by !== undefined && req.body.processed_by !== null
      ? parsePositiveInt(req.body.processed_by)
      : null;
    if (req.body.processed_by !== undefined && req.body.processed_by !== null && processed_by === null) {
      return res.status(400).json({ error: 'processed_by must be a positive integer' });
    }

    const payout_reference = req.body.payout_reference !== undefined ? String(req.body.payout_reference || '') : null;
    const admin_notes = req.body.admin_notes !== undefined ? String(req.body.admin_notes || '') : null;

    const payout = await redeemPayoutsModel.create({
      redeem_transaction_id,
      user_id,
      amount,
      payout_method,
      payout_reference,
      status,
      processed_by,
      processed_at: status === 'done' ? new Date() : null,
      admin_notes,
    });

    return res.json({ message: 'Redeem payout created', payout });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Payout already exists for this redeem transaction' });
    }
    return res.status(500).json({ error: err.message || 'Failed to create redeem payout' });
  }
};

// Admin action: pay and mark done (inserts redeem_payouts + sets redeem_transactions completed)
exports.markDone = async (req, res) => {
  try {
    const redeem_transaction_id = parsePositiveInt(req.body.redeem_transaction_id);
    if (redeem_transaction_id === null) {
      return res.status(400).json({ error: 'redeem_transaction_id must be a positive integer' });
    }

    const processed_by = req.body.processed_by !== undefined && req.body.processed_by !== null
      ? parsePositiveInt(req.body.processed_by)
      : null;
    if (req.body.processed_by !== undefined && req.body.processed_by !== null && processed_by === null) {
      return res.status(400).json({ error: 'processed_by must be a positive integer' });
    }

    const payout_method = req.body.payout_method ? normalizePayoutMethod(req.body.payout_method) : 'bank';
    if (req.body.payout_method && !payout_method) {
      return res.status(400).json({ error: 'payout_method must be bank, upi, cash, or other' });
    }

    const payout_reference = req.body.payout_reference !== undefined ? String(req.body.payout_reference || '') : null;
    const admin_notes = req.body.admin_notes !== undefined ? String(req.body.admin_notes || '') : null;

    const result = await redeemPayoutsModel.markDoneByRedeemTransactionId(redeem_transaction_id, {
      processed_by,
      payout_method,
      payout_reference,
      admin_notes,
    });

    if (result.error) {
      return res.status(result.code || 500).json({ error: result.error });
    }

    return res.json({ message: 'Redeem payout marked done', payout: result.payout });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to mark payout done' });
  }
};

