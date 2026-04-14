const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const { getUsers } = require('../controllers/users.controller');

router.get('/', protect, authorize('Admin'), getUsers);

module.exports = router;