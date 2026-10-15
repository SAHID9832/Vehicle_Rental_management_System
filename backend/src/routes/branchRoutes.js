const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Graph & connection endpoints
router.get('/connections', branchController.getConnections);
router.post('/connections', verifyToken, requireRole('Admin', 'Manager'), branchController.addConnection);
router.delete('/connections/:id', verifyToken, requireRole('Admin', 'Manager'), branchController.removeConnection);

// Branch CRUD
router.get('/', branchController.getAll);
router.get('/:id', branchController.getById);
router.post('/', verifyToken, requireRole('Admin', 'Manager'), branchController.create);
router.put('/:id', verifyToken, requireRole('Admin', 'Manager'), branchController.update);
router.delete('/:id', verifyToken, requireRole('Admin'), branchController.remove);

module.exports = router;
