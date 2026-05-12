const ActivityLog = require("../models/activityLog");

const LABELS = {
  CREATE_MANGA: "Creó un manga",
  UPDATE_MANGA: "Editó un manga",
  DELETE_MANGA: "Eliminó un manga",
  VIEW_MANGA: "Vio los detalles de un manga",
  CREATE_USER: "Creó un usuario",
  UPDATE_USER: "Editó un usuario",
  DELETE_USER: "Eliminó un usuario",
  ADD_FAVORITE: "Agregó un manga a favoritos",
  REMOVE_FAVORITE: "Quitó un manga de favoritos",
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

const getEditorActivity = async (req, res) => {
  try {
    const { action, from, to, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = {
      $or: [
        { user: req.user.id },
        {
          userRole: "Editor",
          action: { $in: ["CREATE_MANGA", "UPDATE_MANGA"] },
        },
      ],
    };

    if (action) {
      const allowedActions = [
        "CREATE_MANGA",
        "UPDATE_MANGA",
        "VIEW_MANGA",
        "LOGIN",
        "LOGOUT",
        "UPDATE_PROFILE",
      ];

      if (allowedActions.includes(action)) {
        if (["CREATE_MANGA", "UPDATE_MANGA"].includes(action)) {
          filter.$or[0].action = action;
          filter.$or[1].action = action;
        } else {
          filter.$or = [{ user: req.user.id, action }];
        }
      }
    }

    if (from || to) {
      const dateFilter = {};
      if (from) dateFilter.$gte = new Date(from);
      if (to)
        dateFilter.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
      filter.$or.forEach((clause) => (clause.createdAt = dateFilter));
    }

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
    console.error("[getEditorActivity]", error);
    res
      .status(500)
      .json({ message: "Error al obtener el historial del editor" });
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
    const { before } = req.query;
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

// Limpiar logs de usuarios que ya no existen
const clearOrphanLogs = async (req, res) => {
  try {
    const User = require('../models/user');
    const existingUserIds = await User.find().distinct('_id');

    const result = await ActivityLog.deleteMany({
      user: { $nin: existingUserIds }
    });

    res.json({
      message: `Se eliminaron ${result.deletedCount} registros huérfanos.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('[clearOrphanLogs]', error);
    res.status(500).json({ message: 'Error al limpiar registros huérfanos' });
  }
};

module.exports = {
  getActivityLogs,
  getEditorActivity,
  getActivitySummary,
  clearActivityLogs,
  clearOrphanLogs
};