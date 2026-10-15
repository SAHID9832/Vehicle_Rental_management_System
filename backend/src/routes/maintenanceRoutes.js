const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, requireRole('Admin', 'Manager', 'Agent'), maintenanceController.getAll);
router.post('/', verifyToken, requireRole('Admin', 'Manager', 'Agent'), maintenanceController.create);
router.put('/:id/complete', verifyToken, requireRole('Admin', 'Manager', 'Agent'), maintenanceController.complete);
router.put('/:id', verifyToken, requireRole('Admin', 'Manager', 'Agent'), maintenanceController.update);

module.exports = router;
