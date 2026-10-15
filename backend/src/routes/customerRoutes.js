const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Customer self-management
router.get('/me/profile', verifyToken, customerController.getMyProfile);
router.put('/me/profile', verifyToken, customerController.updateMyProfile);
router.get('/me/bookings', verifyToken, customerController.getMyBookings);
router.get('/me/history', verifyToken, customerController.getMyRentalHistory);

// Admin / Manager / Agent management
router.get('/', verifyToken, requireRole('Admin', 'Manager', 'Agent'), customerController.getAll);
router.get('/:id', verifyToken, requireRole('Admin', 'Manager', 'Agent'), customerController.getById);
router.post('/', verifyToken, requireRole('Admin', 'Manager', 'Agent'), customerController.create);
router.put('/:id', verifyToken, requireRole('Admin', 'Manager', 'Agent'), customerController.update);

module.exports = router;
