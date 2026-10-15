const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/my', verifyToken, invoiceController.getMyInvoices);
router.get('/', verifyToken, requireRole('Admin', 'Manager', 'Agent'), invoiceController.getAll);
router.get('/:id', verifyToken, invoiceController.getById);
router.post('/:id/pay', verifyToken, invoiceController.simulatePayment);
router.get('/:id/pdf', verifyToken, invoiceController.generatePDF);

module.exports = router;
