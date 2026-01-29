const db = require('../db');

const pool = db.promise || db;

async function list({ approval_status, user_id } = {}) {
  let sql = `
    SELECT
      uk.*,
      u.m_number,
      u.first_name,
      u.last_name,
      a.username AS approved_by_name
    FROM user_kyc uk
    INNER JOIN users u ON uk.user_id = u.id
    LEFT JOIN admins a ON uk.approved_by = a.id
    WHERE 1=1
  `;
  const params = [];

  if (approval_status) {
    sql += ' AND uk.approval_status = ?';
    params.push(approval_status);
  }
  if (user_id) {
    sql += ' AND uk.user_id = ?';
    params.push(user_id);
  }

  sql += ' ORDER BY uk.updated_at DESC, uk.id DESC';

  const [rows] = await pool.query(sql, params);
  return rows;
}

async function getById(id) {
  const [rows] = await pool.query(
    `
      SELECT
        uk.*,
        u.m_number,
        u.first_name,
        u.last_name,
        a.username AS approved_by_name
      FROM user_kyc uk
      INNER JOIN users u ON uk.user_id = u.id
      LEFT JOIN admins a ON uk.approved_by = a.id
      WHERE uk.id = ?
      LIMIT 1
    `,
    [id]
  );
  return rows[0] || null;
}

async function getByUserId(userId) {
  const [rows] = await pool.query(
    `
      SELECT
        uk.*,
        u.m_number,
        u.first_name,
        u.last_name,
        a.username AS approved_by_name
      FROM user_kyc uk
      INNER JOIN users u ON uk.user_id = u.id
      LEFT JOIN admins a ON uk.approved_by = a.id
      WHERE uk.user_id = ?
      LIMIT 1
    `,
    [userId]
  );
  return rows[0] || null;
}

async function upsertForUser(user_id, data = {}) {
  const existing = await getByUserId(user_id);

  const payload = {
    ifsc_code: data.ifsc_code ?? null,
    account_number: data.account_number ?? null,
    account_holder_name: data.account_holder_name ?? null,
    bank_name: data.bank_name ?? null,
    aadhaar_number: data.aadhaar_number ?? null,
    pan_number: data.pan_number ?? null,
    upi_id: data.upi_id ?? null,
  };

  if (existing) {
    await pool.query(
      `
        UPDATE user_kyc
        SET
          ifsc_code = ?,
          account_number = ?,
          account_holder_name = ?,
          bank_name = ?,
          aadhaar_number = ?,
          pan_number = ?,
          upi_id = ?,
          updated_at = NOW()
        WHERE user_id = ?
      `,
      [
        payload.ifsc_code,
        payload.account_number,
        payload.account_holder_name,
        payload.bank_name,
        payload.aadhaar_number,
        payload.pan_number,
        payload.upi_id,
        user_id,
      ]
    );
    return await getByUserId(user_id);
  }

  const [result] = await pool.query(
    `
      INSERT INTO user_kyc
        (user_id, ifsc_code, account_number, account_holder_name, bank_name, aadhaar_number, pan_number, upi_id)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      user_id,
      payload.ifsc_code,
      payload.account_number,
      payload.account_holder_name,
      payload.bank_name,
      payload.aadhaar_number,
      payload.pan_number,
      payload.upi_id,
    ]
  );

  return await getById(result.insertId);
}

async function updateApproval(id, { approval_status, approved_by = null, admin_notes = null } = {}) {
  const approvedAt = approval_status === 'approved' || approval_status === 'rejected' ? 'NOW()' : 'NULL';
  await pool.query(
    `
      UPDATE user_kyc
      SET
        approval_status = ?,
        approved_by = ?,
        approved_at = ${approvedAt},
        admin_notes = ?,
        updated_at = NOW()
      WHERE id = ?
    `,
    [approval_status, approved_by, admin_notes, id]
  );
  return await getById(id);
}

module.exports = {
  list,
  getById,
  getByUserId,
  upsertForUser,
  updateApproval,
};

