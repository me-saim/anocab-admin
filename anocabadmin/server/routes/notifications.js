const express = require('express');
const router = express.Router();
const db = require('../db');

const pool = db.promise || db;

function clampInt(value, { min, max, fallback }) {
  const n = Number.parseInt(String(value), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

router.get('/', async (req, res) => {
  try {
    const limit = clampInt(req.query.limit, { min: 1, max: 100, fallback: 20 });
    const perType = clampInt(req.query.per_type, { min: 1, max: 50, fallback: 10 });

    const [newUsers] = await pool.query(
      'SELECT id, first_name, last_name, m_number, created_at FROM users ORDER BY created_at DESC LIMIT ?',
      [perType]
    );

    const [redeemRequests] = await pool.query(
      `
        SELECT rt.id, rt.amount, rt.order_id, rt.status, rt.created_at,
               u.first_name, u.last_name, u.m_number
        FROM redeem_transactions rt
        INNER JOIN users u ON rt.user_id = u.id
        WHERE rt.status = 'pending'
        ORDER BY rt.created_at DESC
        LIMIT ?
      `,
      [perType]
    );

    const [kycPending] = await pool.query(
      `
        SELECT uk.id, uk.user_id, uk.approval_status, uk.created_at, uk.updated_at,
               u.first_name, u.last_name, u.m_number
        FROM user_kyc uk
        INNER JOIN users u ON uk.user_id = u.id
        WHERE uk.approval_status = 'pending'
        ORDER BY uk.updated_at DESC, uk.id DESC
        LIMIT ?
      `,
      [perType]
    );

    const [payoutsDone] = await pool.query(
      `
        SELECT rp.id, rp.amount, rp.status, rp.created_at,
               rt.order_id,
               u.first_name, u.last_name, u.m_number
        FROM redeem_payouts rp
        INNER JOIN redeem_transactions rt ON rp.redeem_transaction_id = rt.id
        INNER JOIN users u ON rp.user_id = u.id
        WHERE rp.status = 'done'
        ORDER BY rp.created_at DESC
        LIMIT ?
      `,
      [perType]
    );

    const items = [];

    for (const u of newUsers || []) {
      items.push({
        id: `user-${u.id}`,
        type: 'user_joined',
        title: 'New user joined',
        message: `${u.first_name || ''} ${u.last_name || ''}`.trim() + (u.m_number ? ` (${u.m_number})` : ''),
        created_at: u.created_at,
        link: '/users',
      });
    }

    for (const r of redeemRequests || []) {
      items.push({
        id: `redeem-${r.id}`,
        type: 'redeem_request',
        title: 'New redeem request',
        message: `${(r.first_name || '')} ${(r.last_name || '')}`.trim() + ` - ₹${Number(r.amount || 0).toFixed(2)} (${r.order_id})`,
        created_at: r.created_at,
        link: '/redeem-approvals',
      });
    }

    for (const k of kycPending || []) {
      const ts = k.updated_at || k.created_at;
      items.push({
        id: `kyc-${k.id}`,
        type: 'kyc_pending',
        title: 'KYC pending approval',
        message: `${(k.first_name || '')} ${(k.last_name || '')}`.trim() + (k.m_number ? ` (${k.m_number})` : ''),
        created_at: ts,
        link: '/kyc-approvals',
      });
    }

    for (const p of payoutsDone || []) {
      items.push({
        id: `payout-${p.id}`,
        type: 'redeem_paid',
        title: 'Redeem payout done',
        message: `${(p.first_name || '')} ${(p.last_name || '')}`.trim() + ` - ₹${Number(p.amount || 0).toFixed(2)} (${p.order_id})`,
        created_at: p.created_at,
        link: '/redeem-approvals',
      });
    }

    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const [countsRows] = await pool.query(
      `
        SELECT
          (SELECT COUNT(*) FROM redeem_transactions WHERE status = 'pending') AS pending_redeems,
          (SELECT COUNT(*) FROM user_kyc WHERE approval_status = 'pending') AS pending_kyc
      `
    );
    const counts = countsRows?.[0] || { pending_redeems: 0, pending_kyc: 0 };

    return res.json({
      counts,
      items: items.slice(0, limit),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to fetch notifications' });
  }
});

module.exports = router;

