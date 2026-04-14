const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const { getUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/user.controller');

router.get('/', protect, authorize('Admin'), getUsers);
router.get('/:id', protect, authorize('Admin'), getUserById);
router.post('/', protect, authorize('Admin'), createUser);
router.put('/:id', protect, authorize('Admin'), updateUser);
router.delete('/:id', protect, authorize('Admin'), deleteUser);

module.exports = router