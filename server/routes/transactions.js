const express = require('express');
const router = express.Router();
const {
    createTransaction,
    getAllTransactions,
    getTransactionById,
} = require('../controllers/transactionController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.post('/', authenticate, createTransaction);
router.get('/', authenticate, getAllTransactions);
router.get('/:id', authenticate, getTransactionById);

module.exports = router;
