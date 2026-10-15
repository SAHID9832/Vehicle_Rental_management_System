const express = require('express');
const router = express.Router();
const dsaController = require('../controllers/dsaController');

// All DSA endpoints are open for educational and demonstration purposes
router.get('/linked-list', dsaController.getVehicleLinkedList);
router.get('/stack', dsaController.getRecentOperationsStack);
router.get('/queue', dsaController.getWaitingQueue);
router.get('/graph', dsaController.getBranchGraph);
router.post('/expression', dsaController.evaluateRentalExpression);
router.get('/bst', dsaController.getBSTVehicles);
router.post('/bfs', dsaController.runBFS);
router.post('/search', dsaController.searchVehicles);
router.post('/sort', dsaController.sortVehicles);
router.post('/greedy', dsaController.greedyRecommend);

module.exports = router;
