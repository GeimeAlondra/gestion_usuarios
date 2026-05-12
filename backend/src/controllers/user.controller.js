const User = require("../models/user");
const logActivity = require("../utils/activityLogger");
const ActivityLog = require('../models/activityLog');

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "El correo ya está registrado" });
    }

    const user = await User.create({ name, email, password, role });
    const { password: _pw, ...userData } = user.toObject();

    await logActivity({
      userId: req.user.id,
      userRole: req.user.role,
      action: "CREATE_USER",
      entity: "user",
      entityId: String(user._id),
      entityName: `${user.name} (${user.email})`,
      details: `Creó el usuario con rol ${user.role}`,
      ip: req.ip,
    });

    res.status(201).json(userData);
  } catch (error) {
    res.status(500).json({ message: "Error al crear el usuario" });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el usuario" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, isActive } = req.body;

    const user = await User.findById(id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res
          .status(409)
          .json({ message: "El correo ya está registrado" });
      }
    }

    const changes = [];
    if (name !== undefined && name !== user.name)
      changes.push(`nombre: "${user.name}" → "${name}"`);
    if (email !== undefined && email !== user.email)
      changes.push(`email: "${user.email}" → "${email}"`);
    if (role !== undefined && role !== user.role)
      changes.push(`rol: "${user.role}" → "${role}"`);
    if (isActive !== undefined && isActive !== user.isActive)
      changes.push(
        `estado: ${user.isActive ? "activo" : "inactivo"} → ${isActive ? "activo" : "inactivo"}`,
      );
    if (password && password.trim().length > 0)
      changes.push("contraseña actualizada");

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (password && password.trim().length > 0) user.password = password;

    await user.save();

    await logActivity({
      userId: req.user.id,
      userRole: req.user.role,
      action: "UPDATE_USER",
      entity: "user",
      entityId: String(user._id),
      entityName: `${user.name} (${user.email})`,
      details: changes.length ? changes.join(", ") : "Sin cambios detectados",
      ip: req.ip,
    });

    const { password: _pw, ...userData } = user.toObject();
    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el usuario" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({ message: 'No puedes eliminarte a ti mismo' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Borrar todos los registros de actividad del usuario antes de eliminarlo
    const ActivityLog = require('../models/activityLog');
    await ActivityLog.deleteMany({ user: user._id });  

    await User.findByIdAndDelete(id);

    await logActivity({
      userId: req.user.id,
      userRole: req.user.role,
      action: 'DELETE_USER',
      entity: 'user',
      entityId: String(user._id),
      entityName: `${user.name} (${user.email})`,
      details: `Eliminó al usuario con rol ${user.role}`,
      ip: req.ip,
    });

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el usuario' });
  }
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser };
