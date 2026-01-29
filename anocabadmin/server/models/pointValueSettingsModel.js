const db = require('../db');

const pool = db.promise || db;

async function getActive() {
  const [rows] = await pool.query(
    'SELECT id, points, rupees, is_active, created_by, created_at, updated_at FROM point_value_settings WHERE is_active = 1 ORDER BY updated_at DESC, id DESC LIMIT 1'
  );
  return rows[0] || null;
}

async function upsertActive({ points, rupees, created_by = null }) {
  const current = await getActive();

  if (current) {
    await pool.query(
      'UPDATE point_value_settings SET points = ?, rupees = ?, created_by = ?, is_active = 1, updated_at = NOW() WHERE id = ?',
      [points, rupees, created_by, current.id]
    );
    return await getActive();
  }

  const [result] = await pool.query(
    'INSERT INTO point_value_settings (points, rupees, is_active, created_by) VALUES (?, ?, 1, ?)',
    [points, rupees, created_by]
  );

  const [rows] = await pool.query(
    'SELECT id, points, rupees, is_active, created_by, created_at, updated_at FROM point_value_settings WHERE id = ? LIMIT 1',
    [result.insertId]
  );
  return rows[0] || null;
}

module.exports = {
  getActive,
  upsertActive,
};

