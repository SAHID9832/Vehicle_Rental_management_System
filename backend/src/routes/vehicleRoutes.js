const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Public routes
router.get('/categories', vehicleController.getCategories);
router.get('/search/available', vehicleController.getAvailableForSearch);
router.get('/', vehicleController.getAll);
router.get('/:id/availability', vehicleController.checkAvailability);
router.get('/:id', vehicleController.getById);

// Protected routes (Admin, Manager, Agent)
router.post('/', verifyToken, requireRole('Admin', 'Manager', 'Agent'), vehicleController.create);
router.put('/:id', verifyToken, requireRole('Admin', 'Manager', 'Agent'), vehicleController.update);
router.delete('/:id', verifyToken, requireRole('Admin'), vehicleController.remove);

module.exports = router;
