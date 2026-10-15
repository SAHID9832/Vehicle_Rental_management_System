const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/stats', verifyToken, requireRole('Admin', 'Manager', 'Agent'), dashboardController.getStats);

module.exports = router;
