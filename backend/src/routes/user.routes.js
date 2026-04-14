const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const { getUsers, createUser } = require('../controllers/user.controller');

router.get('/', protect, authorize('Admin'), getUsers);
router.post('/', protect, authorize('Admin'), createUser);

module.exports = router