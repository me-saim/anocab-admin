const pointValueSettingsModel = require('../models/pointValueSettingsModel');

function parsePositiveInt(value) {
  const n = Number.parseInt(String(value), 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function parsePositiveNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

exports.getActive = async (req, res) => {
  try {
    const setting = await pointValueSettingsModel.getActive();
    return res.json({ setting });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to fetch point value settings' });
  }
};

exports.update = async (req, res) => {
  try {
    const points = parsePositiveInt(req.body.points);
    const rupees = parsePositiveNumber(req.body.rupees);
    const createdBy = req.body.created_by !== undefined && req.body.created_by !== null
      ? parsePositiveInt(req.body.created_by)
      : null;

    if (points === null) {
      return res.status(400).json({ error: 'points must be a positive integer' });
    }
    if (rupees === null) {
      return res.status(400).json({ error: 'rupees must be a positive number' });
    }

    const setting = await pointValueSettingsModel.upsertActive({
      points,
      rupees,
      created_by: createdBy,
    });

    return res.json({ message: 'Point value settings updated successfully', setting });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to update point value settings' });
  }
};

