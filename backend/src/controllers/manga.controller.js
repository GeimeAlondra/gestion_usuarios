const Manga = require("../models/manga");
const logActivity = require("../utils/activityLogger");

const getMangas = async (req, res) => {
  try {
    const mangas = await Manga.find().sort({ createdAt: -1 });
    res.json(mangas);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo mangas" });
  }
};

const getMangaById = async (req, res) => {
  try {
    const manga = await Manga.findById(req.params.id);

    if (!manga) {
      return res.status(404).json({ message: "Manga no encontrado" });
    }

    // Registrar que el usuario vio este manga
    await logActivity({
      userId: req.user.id,
      userRole: req.user.role,
      action: "VIEW_MANGA",
      entity: "manga",
      entityId: String(manga._id),
      entityName: manga.title,
      details: `Vio los detalles del manga "${manga.title}"`,
      ip: req.ip,
    });

    res.json(manga);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo manga" });
  }
};

const createManga = async (req, res) => {
  try {
    const manga = await Manga.create({
      ...req.body,
      createdBy: req.user.id,
    });

    await logActivity({
      userId: req.user.id,
      userRole: req.user.role,
      action: "CREATE_MANGA",
      entity: "manga",
      entityId: String(manga._id),
      entityName: manga.title,
      details: `Creó el manga "${manga.title}" (${manga.genre}, ${manga.year})`,
      ip: req.ip,
    });

    res.status(201).json(manga);
  } catch (error) {
    res.status(500).json({ message: "Error creando manga" });
  }
};

const updateManga = async (req, res) => {
  try {
    const oldManga = await Manga.findById(req.params.id);
    if (!oldManga) {
      return res.status(404).json({ message: "Manga no encontrado" });
    }

    const manga = await Manga.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    const changes = [];
    if (req.body.title && req.body.title !== oldManga.title)
      changes.push(`título: "${oldManga.title}" → "${req.body.title}"`);
    if (req.body.status && req.body.status !== oldManga.status)
      changes.push(`estado: ${oldManga.status} → ${req.body.status}`);
    if (req.body.genre && req.body.genre !== oldManga.genre)
      changes.push(`género: ${oldManga.genre} → ${req.body.genre}`);
    if (
      req.body.chapters !== undefined &&
      req.body.chapters !== oldManga.chapters
    )
      changes.push(`capítulos: ${oldManga.chapters} → ${req.body.chapters}`);

    await logActivity({
      userId: req.user.id,
      userRole: req.user.role,
      action: "UPDATE_MANGA",
      entity: "manga",
      entityId: String(manga._id),
      entityName: manga.title,
      details: changes.length ? changes.join(", ") : "Editó el manga",
      ip: req.ip,
    });

    res.json(manga);
  } catch (error) {
    res.status(500).json({ message: "Error actualizando manga" });
  }
};

const deleteManga = async (req, res) => {
  try {
    const manga = await Manga.findByIdAndDelete(req.params.id);

    if (!manga) {
      return res.status(404).json({ message: "Manga no encontrado" });
    }

    await logActivity({
      userId: req.user.id,
      userRole: req.user.role,
      action: "DELETE_MANGA",
      entity: "manga",
      entityId: String(manga._id),
      entityName: manga.title,
      details: `Eliminó el manga "${manga.title}"`,
      ip: req.ip,
    });

    res.json({ message: "Manga eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error eliminando manga" });
  }
};

module.exports = {getMangas, getMangaById, createManga, updateManga, deleteManga};
