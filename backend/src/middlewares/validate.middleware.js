const { body, validationResult } = require('express-validator');

const registerRules = [
  body('name').notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().withMessage('El email no es válido'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const loginRules = [
  body('email').isEmail().withMessage('El email no es válido'),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
];

module.exports = { registerRules, loginRules, validate };