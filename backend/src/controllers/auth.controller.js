const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'El email ya está registrado' });
    }

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('[register]', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Cuenta desactivada' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken({ id: user._id, role: user.role });

    res.status(200).json({
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[login]', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
const logout = (req, res) => {
  console.log(`[logout] Usuario ${req.user.id} cerró sesión`);
  res.status(200).json({ message: 'Sesión cerrada exitosamente' });
};

module.exports = { register, login, logout };