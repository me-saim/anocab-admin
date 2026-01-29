const express = require('express');
const router = express.Router();

const pointValueSettingsController = require('../controllers/pointValueSettingsController');

// Get active point-to-rupee conversion
router.get('/', pointValueSettingsController.getActive);

// Update active point-to-rupee conversion (edit, not create from UI)
router.put('/', pointValueSettingsController.update);

module.exports = router;

