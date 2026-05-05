const ActivityLog = require("../models/activityLog");

/**
 * Registra una actividad en el historial
 * @param {Object} options
 * @param {string} options.userId       - ID del usuario que realizó la acción
 * @param {string} options.userRole     - Rol del usuario
 * @param {string} options.action       - Acción realizada
 * @param {string} options.entity       - Entidad afectada
 * @param {string} [options.entityId]   - ID de la entidad afectada
 * @param {string} [options.entityName] - Nombre legible de la entidad
 * @param {string} [options.details]    - Descripción adicional
 * @param {string} [options.ip]         - IP del cliente
 */
const logActivity = async ({
  userId,
  userRole,
  action,
  entity,
  entityId = null,
  entityName = null,
  details = null,
  ip = null,
}) => {
  try {
    await ActivityLog.create({
      user: userId,
      userRole,
      action,
      entity,
      entityId,
      entityName,
      details,
      ip,
    });
  } catch (err) {
    // No bloquear el flujo principal si el log falla
    console.error("[ActivityLog] Error registrando actividad:", err.message);
  }
};

module.exports = logActivity;
