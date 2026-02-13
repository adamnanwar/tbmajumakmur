const express = require('express');
const router = express.Router();
const {
    adjustStock,
    getStockHistory,
} = require('../controllers/inventoryController');
const { authenticate, authorize } = require('../middleware/auth');

// Stock adjustment (Admin only)
router.post('/adjust', authenticate, authorize('ADMIN'), adjustStock);

// Stock movement history (All authenticated users)
router.get('/history', authenticate, getStockHistory);

module.exports = router;
