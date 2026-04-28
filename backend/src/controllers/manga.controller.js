const Manga = require('../models/manga');

/* ===============================
   Obtener todos los mangas
   Roles: Admin, Editor, Viewer
================================= */
const getMangas = async (req, res) => {
  try {
    const mangas = await Manga.find().sort({ createdAt: -1 });
    res.json(mangas);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo mangas' });
  }
};

/* ===============================
   Obtener un manga por ID
   Roles: Admin, Editor, Viewer
================================= */
const getMangaById = async (req, res) => {
  try {
    const manga = await Manga.findById(req.params.id);

    if (!manga) {
      return res.status(404).json({ message: 'Manga no encontrado' });
    }

    res.json(manga);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo manga' });
  }
};

/* ===============================
   Crear manga
   Roles: Admin, Editor
================================= */
const createManga = async (req, res) => {
  try {
    const manga = await Manga.create({
      ...req.body,
      createdBy: req.user.id // guarda quién lo creó
    });

    res.status(201).json(manga);
  } catch (error) {
    res.status(500).json({ message: 'Error creando manga' });
  }
};

/* ===============================
   Actualizar manga
   Roles: Admin, Editor
================================= */
const updateManga = async (req, res) => {
  try {
    const manga = await Manga.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!manga) {
      return res.status(404).json({ message: 'Manga no encontrado' });
    }

    res.json(manga);
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando manga' });
  }
};

/* ===============================
   Eliminar manga
   Roles: Admin solamente
================================= */
const deleteManga = async (req, res) => {
  try {
    const manga = await Manga.findByIdAndDelete(req.params.id);

    if (!manga) {
      return res.status(404).json({ message: 'Manga no encontrado' });
    }

    res.json({ message: 'Manga eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando manga' });
  }
};

module.exports = {
  getMangas,
  getMangaById,
  createManga,
  updateManga,
  deleteManga
};