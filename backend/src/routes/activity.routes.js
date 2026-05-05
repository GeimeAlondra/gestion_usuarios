const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const {
  getActivityLogs,
  getMyActivity,
  getActivitySummary,
  clearActivityLogs,
} = require('../controllers/activity.controller');

// Historial propio (cualquier usuario autenticado)
router.get('/me', protect, getMyActivity);

// Resumen para el dashboard (solo Admin)
router.get('/summary', protect, authorize('Admin'), getActivitySummary);

// Historial completo con filtros (solo Admin)
router.get('/', protect, authorize('Admin'), getActivityLogs);

// Limpiar historial (solo Admin)
router.delete('/', protect, authorize('Admin'), clearActivityLogs);

module.exports = router;