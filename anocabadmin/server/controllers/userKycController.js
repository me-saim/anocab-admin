const userKycModel = require('../models/userKycModel');

function parsePositiveInt(value) {
  const n = Number.parseInt(String(value), 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function normalizeApprovalStatus(value) {
  const v = String(value || '').trim().toLowerCase();
  if (v === 'pending' || v === 'approved' || v === 'rejected') return v;
  return null;
}

exports.getAll = async (req, res) => {
  try {
    const approval_status = req.query.approval_status ? normalizeApprovalStatus(req.query.approval_status) : null;
    const user_id = req.query.user_id ? parsePositiveInt(req.query.user_id) : null;

    if (req.query.approval_status && !approval_status) {
      return res.status(400).json({ error: 'approval_status must be pending, approved, or rejected' });
    }
    if (req.query.user_id && user_id === null) {
      return res.status(400).json({ error: 'user_id must be a positive integer' });
    }

    const rows = await userKycModel.list({
      approval_status: approval_status || undefined,
      user_id: user_id || undefined,
    });
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to fetch KYC records' });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid id' });

    const row = await userKycModel.getById(id);
    if (!row) return res.status(404).json({ error: 'KYC record not found' });
    return res.json(row);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to fetch KYC record' });
  }
};

exports.getByUserId = async (req, res) => {
  try {
    const userId = parsePositiveInt(req.params.userId);
    if (userId === null) return res.status(400).json({ error: 'Invalid userId' });

    const row = await userKycModel.getByUserId(userId);
    if (!row) return res.status(404).json({ error: 'KYC record not found' });
    return res.json(row);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to fetch user KYC' });
  }
};

// For admin/internal use: create or update KYC details for a user
exports.upsertForUser = async (req, res) => {
  try {
    const user_id = parsePositiveInt(req.body.user_id);
    if (user_id === null) return res.status(400).json({ error: 'user_id must be a positive integer' });

    const saved = await userKycModel.upsertForUser(user_id, req.body || {});
    return res.json({ message: 'KYC saved successfully', kyc: saved });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to save KYC' });
  }
};

// Approve/Reject (admin)
exports.updateApproval = async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid id' });

    const approval_status = normalizeApprovalStatus(req.body.approval_status);
    if (!approval_status) {
      return res.status(400).json({ error: 'approval_status must be pending, approved, or rejected' });
    }

    const approved_by = req.body.approved_by !== undefined && req.body.approved_by !== null
      ? parsePositiveInt(req.body.approved_by)
      : null;
    if (req.body.approved_by !== undefined && req.body.approved_by !== null && approved_by === null) {
      return res.status(400).json({ error: 'approved_by must be a positive integer' });
    }

    const admin_notes = req.body.admin_notes !== undefined ? String(req.body.admin_notes || '') : null;

    const updated = await userKycModel.updateApproval(id, {
      approval_status,
      approved_by,
      admin_notes,
    });

    if (!updated) return res.status(404).json({ error: 'KYC record not found' });
    return res.json({ message: 'KYC approval updated', kyc: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to update KYC approval' });
  }
};

