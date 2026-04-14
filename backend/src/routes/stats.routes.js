const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const { getStats } = require('../controllers/stats.controller');

router.get('/', protect, authorize('Admin'), getStats);

module.exports = router;