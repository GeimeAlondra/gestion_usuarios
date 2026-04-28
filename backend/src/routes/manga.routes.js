const express = require('express');
const router = express.Router();

const {
  getMangas,
  getMangaById,
  createManga,
  updateManga,
  deleteManga
} = require('../controllers/manga.controller');

const { protect, authorize } = require('../middlewares/auth.middleware');

/* ===============================
   Obtener todos los mangas
   Roles: Admin, Editor, Viewer
================================= */
router.get(
  '/',
  protect,
  authorize('Admin', 'Editor', 'Viewer'),
  getMangas
);

/* ===============================
   Obtener un manga por ID
   Roles: Admin, Editor, Viewer
================================= */
router.get(
  '/:id',
  protect,
  authorize('Admin', 'Editor', 'Viewer'),
  getMangaById
);

/* ===============================
   Crear manga
   Roles: Admin, Editor
================================= */
router.post(
  '/',
  protect,
  authorize('Admin', 'Editor'),
  createManga
);

/* ===============================
   Actualizar manga
   Roles: Admin, Editor
================================= */
router.put(
  '/:id',
  protect,
  authorize('Admin', 'Editor'),
  updateManga
);

/* ===============================
   Eliminar manga
   Roles: Admin solamente
================================= */
router.delete(
  '/:id',
  protect,
  authorize('Admin'),
  deleteManga
);

module.exports = router;