const db = require('../db');

const pool = db.promise || db;

async function list({ status, user_id, redeem_transaction_id } = {}) {
  let sql = `
    SELECT
      rp.*,
      u.m_number,
      u.first_name,
      u.last_name,
      a.username AS processed_by_name,
      rt.order_id AS redeem_order_id,
      rt.status AS redeem_status
    FROM redeem_payouts rp
    INNER JOIN users u ON rp.user_id = u.id
    INNER JOIN redeem_transactions rt ON rp.redeem_transaction_id = rt.id
    LEFT JOIN admins a ON rp.processed_by = a.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    sql += ' AND rp.status = ?';
    params.push(status);
  }
  if (user_id) {
    sql += ' AND rp.user_id = ?';
    params.push(user_id);
  }
  if (redeem_transaction_id) {
    sql += ' AND rp.redeem_transaction_id = ?';
    params.push(redeem_transaction_id);
  }

  sql += ' ORDER BY rp.created_at DESC, rp.id DESC';

  const [rows] = await pool.query(sql, params);
  return rows;
}

async function getById(id) {
  const [rows] = await pool.query(
    `
      SELECT
        rp.*,
        u.m_number,
        u.first_name,
        u.last_name,
        a.username AS processed_by_name,
        rt.order_id AS redeem_order_id,
        rt.status AS redeem_status
      FROM redeem_payouts rp
      INNER JOIN users u ON rp.user_id = u.id
      INNER JOIN redeem_transactions rt ON rp.redeem_transaction_id = rt.id
      LEFT JOIN admins a ON rp.processed_by = a.id
      WHERE rp.id = ?
      LIMIT 1
    `,
    [id]
  );
  return rows[0] || null;
}

async function create(payload) {
  const [result] = await pool.query(
    `
      INSERT INTO redeem_payouts
        (redeem_transaction_id, user_id, amount, payout_method, payout_reference, status, processed_by, processed_at, admin_notes)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.redeem_transaction_id,
      payload.user_id,
      payload.amount,
      payload.payout_method || 'bank',
      payload.payout_reference || null,
      payload.status || 'pending',
      payload.processed_by || null,
      payload.processed_at || null,
      payload.admin_notes || null,
    ]
  );
  return await getById(result.insertId);
}

// Atomically: insert payout (done) + mark redeem_transactions completed
async function markDoneByRedeemTransactionId(redeemTransactionId, { processed_by, payout_method, payout_reference, admin_notes } = {}) {
  const conn = await pool.getConnection();
  let released = false;
  try {
    await conn.beginTransaction();

    const [rtRows] = await conn.query(
      'SELECT id, user_id, amount, order_id, status, remarks FROM redeem_transactions WHERE id = ? LIMIT 1',
      [redeemTransactionId]
    );
    const rt = rtRows[0];
    if (!rt) {
      await conn.rollback();
      return { error: 'Redeem transaction not found', code: 404 };
    }

    // Insert payout row (unique on redeem_transaction_id)
    await conn.query(
      `
        INSERT INTO redeem_payouts
          (redeem_transaction_id, user_id, amount, payout_method, payout_reference, status, processed_by, processed_at, admin_notes)
        VALUES
          (?, ?, ?, ?, ?, 'done', ?, NOW(), ?)
      `,
      [
        rt.id,
        rt.user_id,
        rt.amount,
        payout_method || 'bank',
        payout_reference || null,
        processed_by || null,
        admin_notes || null,
      ]
    );

    const noteLine = admin_notes ? String(admin_notes) : '';
    const appended = noteLine ? `Payout note: ${noteLine}` : 'Payout done';

    await conn.query(
      `
        UPDATE redeem_transactions
        SET
          status = 'completed',
          processed_by = ?,
          processed_at = NOW(),
          remarks = CASE
            WHEN remarks IS NULL OR remarks = '' THEN ?
            ELSE CONCAT(remarks, '\n', ?)
          END,
          updated_at = NOW()
        WHERE id = ?
      `,
      [processed_by || null, appended, appended, rt.id]
    );

    await conn.commit();

    // Return payout row
    const [payoutRows] = await conn.query(
      'SELECT id FROM redeem_payouts WHERE redeem_transaction_id = ? LIMIT 1',
      [rt.id]
    );
    const payoutId = payoutRows?.[0]?.id;
    if (!payoutId) return { error: 'Payout created but could not be fetched', code: 500 };
    const payout = await getById(payoutId);
    return { payout };
  } catch (err) {
    try { await conn.rollback(); } catch {}
    // Duplicate entry for unique redeem_transaction_id
    if (err && err.code === 'ER_DUP_ENTRY') {
      return { error: 'Payout already exists for this redeem transaction', code: 409 };
    }
    return { error: err.message || 'Failed to mark payout done', code: 500 };
  } finally {
    if (!released) {
      try { conn.release(); } catch {}
      released = true;
    }
  }
}

module.exports = {
  list,
  getById,
  create,
  markDoneByRedeemTransactionId,
};

