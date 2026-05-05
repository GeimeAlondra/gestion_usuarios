const User = require("../models/user");
const { generateToken } = require("../utils/jwt");
const logActivity = require("../utils/activityLogger");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "El email ya está registrado" });
    }

    const user = await User.create({ name, email, password, role: "Viewer" });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("[register]", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Cuenta desactivada" });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken({ id: user._id, role: user.role });

    await logActivity({
      userId: user._id,
      userRole: user.role,
      action: "LOGIN",
      entity: "session",
      entityName: user.email,
      details: `Inicio de sesión como ${user.role}`,
      ip: req.ip,
    });

    res.status(200).json({
      message: "Login exitoso",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[login]", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

const logout = async (req, res) => {
  await logActivity({
    userId: req.user.id,
    userRole: req.user.role,
    action: "LOGOUT",
    entity: "session",
    ip: req.ip,
  });

  console.log(`[logout] Usuario ${req.user.id} cerró sesión`);
  res.status(200).json({ message: "Sesión cerrada exitosamente" });
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });
    res.status(200).json(user);
  } catch (error) {
    console.error("[getProfile]", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user.id).select("+password");
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing)
        return res
          .status(409)
          .json({ message: "El correo ya está registrado por otro usuario" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (password && password.trim().length >= 6) user.password = password;

    await user.save();

    await logActivity({
      userId: user._id,
      userRole: user.role,
      action: "UPDATE_PROFILE",
      entity: "profile",
      entityId: String(user._id),
      entityName: user.name,
      details: "Actualizó su propio perfil",
      ip: req.ip,
    });

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
  } catch (error) {
    console.error("[updateProfile]", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = { register, login, logout, getProfile, updateProfile };
