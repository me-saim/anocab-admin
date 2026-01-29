const express = require('express');
const router = express.Router();
const userKycController = require('../controllers/userKycController');

// GET /api/user-kyc?approval_status=pending&user_id=1
router.get('/', userKycController.getAll);

// GET /api/user-kyc/user/:userId
router.get('/user/:userId', userKycController.getByUserId);

// GET /api/user-kyc/:id
router.get('/:id', userKycController.getById);

// POST /api/user-kyc (upsert)
router.post('/', userKycController.upsertForUser);

// PUT /api/user-kyc/:id/approval
router.put('/:id/approval', userKycController.updateApproval);

module.exports = router;

