const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.post('/start', verifyToken, requireRole('Admin', 'Manager', 'Agent'), rentalController.startRental);
router.get('/active', verifyToken, requireRole('Admin', 'Manager', 'Agent'), rentalController.getActive);
router.get('/overdue', verifyToken, requireRole('Admin', 'Manager', 'Agent'), rentalController.getOverdue);
router.get('/:id', verifyToken, rentalController.getById);
router.put('/:id/complete', verifyToken, requireRole('Admin', 'Manager', 'Agent'), rentalController.completeRental);

module.exports = router;
