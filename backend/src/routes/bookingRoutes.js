const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.post('/', verifyToken, bookingController.create);
router.get('/my', verifyToken, bookingController.getMyBookings);
router.get('/', verifyToken, requireRole('Admin', 'Manager', 'Agent'), bookingController.getAll);
router.get('/:id', verifyToken, bookingController.getById);
router.put('/:id/confirm', verifyToken, requireRole('Admin', 'Manager', 'Agent'), bookingController.confirm);
router.put('/:id/cancel', verifyToken, bookingController.cancel);

module.exports = router;
