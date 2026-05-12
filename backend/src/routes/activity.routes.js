const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const {
  getActivityLogs,
  getEditorActivity,
  getActivitySummary,
  clearActivityLogs,
  clearOrphanLogs,
} = require('../controllers/activity.controller');

// Historial del editor
router.get('/editor', protect, authorize('Editor'), getEditorActivity);

// Resumen para el dashboard (solo Admin)
router.get('/summary', protect, authorize('Admin'), getActivitySummary);

// Historial completo con filtros (solo Admin)
router.get('/', protect, authorize('Admin'), getActivityLogs);

// Limpiar historial (solo Admin)
router.delete('/', protect, authorize('Admin'), clearActivityLogs);

// Limpiar logs de usuarios eliminados (solo Admin)
router.delete('/orphans', protect, authorize('Admin'), clearOrphanLogs);

module.exports = router;