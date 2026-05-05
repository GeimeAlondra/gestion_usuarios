const ActivityLog = require("../models/activityLog");

const LABELS = {
  CREATE_MANGA: "Creó un manga",
  UPDATE_MANGA: "Editó un manga",
  DELETE_MANGA: "Eliminó un manga",
  VIEW_MANGA: "Vio los detalles de un manga",
  CREATE_USER: "Creó un usuario",
  UPDATE_USER: "Editó un usuario",
  DELETE_USER: "Eliminó un usuario",
  LOGIN: "Inició sesión",
  LOGOUT: "Cerró sesión",
  UPDATE_PROFILE: "Actualizó su perfil",
};

// Historial de todos los usuarios
const getActivityLogs = async (req, res) => {
  try {
    const { userId, role, action, from, to, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (userId) filter.user = userId;
    if (role) filter.userRole = role;
    if (action) filter.action = action;

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to)
        filter.createdAt.$lte = new Date(
          new Date(to).setHours(23, 59, 59, 999),
        );
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await ActivityLog.countDocuments(filter);

    const logs = await ActivityLog.find(filter)
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const formatted = logs.map((log) => ({
      _id: log._id,
      user: log.user,
      userRole: log.userRole,
      action: log.action,
      actionLabel: LABELS[log.action] ?? log.action,
      entity: log.entity,
      entityId: log.entityId,
      entityName: log.entityName,
      details: log.details,
      ip: log.ip,
      createdAt: log.createdAt,
    }));

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
      logs: formatted,
    });
  } catch (error) {
    console.error("[getActivityLogs]", error);
    res
      .status(500)
      .json({ message: "Error al obtener el historial de actividad" });
  }
};

// Historial del usuario autenticado
const getMyActivity = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { user: req.user.id };
    const total = await ActivityLog.countDocuments(filter);

    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const formatted = logs.map((log) => ({
      _id: log._id,
      action: log.action,
      actionLabel: LABELS[log.action] ?? log.action,
      entity: log.entity,
      entityId: log.entityId,
      entityName: log.entityName,
      details: log.details,
      createdAt: log.createdAt,
    }));

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
      logs: formatted,
    });
  } catch (error) {
    console.error("[getMyActivity]", error);
    res.status(500).json({ message: "Error al obtener tu historial" });
  }
};

// Resumen de acciones agrupadas
const getActivitySummary = async (req, res) => {
  try {
    const summary = await ActivityLog.aggregate([
      {
        $group: {
          _id: "$action",
          count: { $sum: 1 },
          lastOccurrence: { $max: "$createdAt" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const byRole = await ActivityLog.aggregate([
      { $group: { _id: "$userRole", count: { $sum: 1 } } },
    ]);

    res.json({
      byAction: summary.map((s) => ({
        action: s._id,
        label: LABELS[s._id] ?? s._id,
        count: s.count,
        lastOccurrence: s.lastOccurrence,
      })),
      byRole: byRole.map((r) => ({ role: r._id, count: r.count })),
    });
  } catch (error) {
    console.error("[getActivitySummary]", error);
    res
      .status(500)
      .json({ message: "Error al obtener el resumen de actividad" });
  }
};

// Limpiar historial
const clearActivityLogs = async (req, res) => {
  try {
    const { before } = req.query; // borrar registros anteriores a una fecha
    const filter = {};
    if (before) filter.createdAt = { $lt: new Date(before) };

    const result = await ActivityLog.deleteMany(filter);
    res.json({
      message: `Se eliminaron ${result.deletedCount} registros del historial.`,
    });
  } catch (error) {
    console.error("[clearActivityLogs]", error);
    res.status(500).json({ message: "Error al limpiar el historial" });
  }
};

module.exports = {
  getActivityLogs,
  getMyActivity,
  getActivitySummary,
  clearActivityLogs,
};
