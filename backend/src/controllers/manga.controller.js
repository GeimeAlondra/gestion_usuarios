const Manga = require("../models/manga");
const logActivity = require("../utils/activityLogger");
const User = require("../models/user");
const Genre = require("../models/Genre");

const getMangas = async (req, res) => {
  try {
    const mangas = await Manga.find()
      .populate("genres", "name")
      .populate("mainGenre", "name")
      .sort({ createdAt: -1 });
    res.json(mangas);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo mangas" });
  }
};

const getMangaById = async (req, res) => {
  try {
    const manga = await Manga.findById(req.params.id)
      .populate("genres", "name")
      .populate("mainGenre", "name");

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
    const { genres, mainGenre } = req.body;

    // validar que venga bien
    if (!Array.isArray(genres) || genres.length === 0 || !mainGenre) {
      return res.status(400).json({ message: "Géneros requeridos" });
    }

    // quitar duplicados
    const uniqueGenres = [...new Set(genres.map(String))];

    const foundGenres = await Genre.find({ _id: { $in: uniqueGenres } });

    if (foundGenres.length !== uniqueGenres.length) {
      return res.status(400).json({
        message: "Algunos géneros no existen",
      });
    }

    // validar que el principal esté dentro
    if (!uniqueGenres.includes(String(mainGenre))) {
      return res.status(400).json({
        message: "El género principal debe estar en la lista",
      });
    }

    const manga = await Manga.create({
      title: req.body.title,
      status: req.body.status,
      year: req.body.year,
      chapters: req.body.chapters,
      author: req.body.author,
      synopsis: req.body.synopsis,
      coverUrl: req.body.coverUrl,

      genres: uniqueGenres.sort(),
      mainGenre,
      createdBy: req.user.id,
    });

    await logActivity({
      userId: req.user.id,
      userRole: req.user.role,
      action: "CREATE_MANGA",
      entity: "manga",
      entityId: String(manga._id),
      entityName: manga.title,
      details: `Creó el manga "${manga.title}" (${manga.mainGenre}, ${manga.year})`,
      ip: req.ip,
    });

    res.status(201).json(manga);
  } catch (error) {
    res.status(500).json({ message: "Error creando manga" });
  }
};

const updateManga = async (req, res) => {
  try {
    const { genres, mainGenre } = req.body;

    // validar que venga bien
    if (!Array.isArray(genres) || genres.length === 0 || !mainGenre) {
      return res.status(400).json({ message: "Géneros requeridos" });
    }

    // quitar duplicados
    const uniqueGenres = [...new Set(genres.map(String))];

    const foundGenres = await Genre.find({ _id: { $in: uniqueGenres } });

    if (foundGenres.length !== uniqueGenres.length) {
      return res.status(400).json({
        message: "Algunos géneros no existen",
      });
    }

    // validar que el principal esté dentro
    if (!uniqueGenres.includes(String(mainGenre))) {
      return res.status(400).json({
        message: "El género principal debe estar en la lista",
      });
    }

    const oldManga = await Manga.findById(req.params.id);
    if (!oldManga) {
      return res.status(404).json({ message: "Manga no encontrado" });
    }

    const manga = await Manga.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        status: req.body.status,
        year: req.body.year,
        chapters: req.body.chapters,
        author: req.body.author,
        synopsis: req.body.synopsis,
        coverUrl: req.body.coverUrl,

        genres: uniqueGenres.sort(),
        mainGenre,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    const changes = [];
    if (req.body.title && req.body.title !== oldManga.title)
      changes.push(`título: "${oldManga.title}" → "${req.body.title}"`);
    if (req.body.status && req.body.status !== oldManga.status)
      changes.push(`estado: ${oldManga.status} → ${req.body.status}`);
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

const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const manga = await Manga.findById(id);
    if (!manga) return res.status(404).json({ message: "Manga no encontrado" });

    const user = await User.findById(userId);
    const isFav = user.favorites.some((fId) => fId.toString() === id);

    if (isFav) {
      user.favorites = user.favorites.filter((fId) => fId.toString() !== id);
    } else {
      user.favorites.push(id);
    }

    await user.save();

    await logActivity({
      userId,
      userRole: req.user.role,
      action: isFav ? "REMOVE_FAVORITE" : "ADD_FAVORITE",
      entity: "manga",
      entityId: String(manga._id),
      entityName: manga.title,
      details: isFav
        ? `Eliminó "${manga.title}" de favoritos`
        : `Agregó "${manga.title}" a favoritos`,
      ip: req.ip,
    });

    res.json({ isFavorite: !isFav, favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar favoritos" });
  }
};

const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "favorites",
      "title coverUrl mainGenre",
    );
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener favoritos" });
  }
};

module.exports = {
  getMangas,
  getMangaById,
  createManga,
  updateManga,
  deleteManga,
  toggleFavorite,
  getFavorites,
};
