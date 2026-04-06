const { Router } = require('express');
const { register, login, logout } = require('../controllers/auth.controller');
const { registerRules, loginRules, validate } = require('../middlewares/validate.middleware');
const { protect } = require('../middlewares/auth.middleware');

const router = Router();

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/logout', protect, logout);

module.exports = router;