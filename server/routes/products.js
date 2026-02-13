const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getLowStock,
    getSlowMoving,
} = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');

// Public/Authenticated routes
router.get('/', authenticate, getAllProducts);
router.get('/low-stock', authenticate, getLowStock);
router.get('/slow-moving', authenticate, getSlowMoving);
router.get('/:id', authenticate, getProductById);

// Admin-only routes
router.post('/', authenticate, authorize('ADMIN'), createProduct);
router.put('/:id', authenticate, authorize('ADMIN'), updateProduct);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteProduct);

module.exports = router;
