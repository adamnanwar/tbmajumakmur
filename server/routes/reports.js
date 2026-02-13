const express = require('express');
const router = express.Router();
const {
    getSalesReport,
    getInventoryReport,
} = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

// All report routes require authentication
router.get('/sales', authenticate, getSalesReport);
router.get('/inventory', authenticate, getInventoryReport);

module.exports = router;
