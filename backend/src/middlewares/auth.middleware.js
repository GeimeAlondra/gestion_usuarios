const User = require('../models/user');
const { verifyToken } = require('../utils/jwt');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autorizado, token requerido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id).select('_id role isActive');
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    if (!user.isActive) {
      return res.status(401).json({ message: 'Cuenta desactivada' });
    }

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permisos para esta acción' });
    }
    next();
  };
};

module.exports = { protect, authorize };