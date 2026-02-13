const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// All user management routes require Admin access
router.get('/', authenticate, authorize('ADMIN'), getAllUsers);
router.get('/:id', authenticate, authorize('ADMIN'), getUserById);
router.post('/', authenticate, authorize('ADMIN'), createUser);
router.put('/:id', authenticate, authorize('ADMIN'), updateUser);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteUser);

module.exports = router;
