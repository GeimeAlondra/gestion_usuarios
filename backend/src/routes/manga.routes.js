const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware");

const {
  getMangas,
  getMangaById,
  createManga,
  updateManga,
  deleteManga,
  toggleFavorite,
  getFavorites,
} = require("../controllers/manga.controller");

const { protect, authorize } = require("../middlewares/auth.middleware");

// Subir portada a Cloudinary
router.post(
  "/upload-cover",
  protect,
  authorize("Admin", "Editor"),
  upload.single("cover"),
  (req, res) => {
    if (!req.file)
      return res.status(400).json({ message: "No se recibió ningún archivo" });
    res.json({ url: req.file.path }); // Cloudinary devuelve la URL en req.file.path
  },
);

router.get(
  "/me/favorites",
  protect,
  authorize("Viewer"),
  getFavorites,
);

router.get("/", protect, authorize("Admin", "Editor", "Viewer"), getMangas);

router.get(
  "/:id",
  protect,
  authorize("Admin", "Editor", "Viewer"),
  getMangaById,
);

router.post("/", protect, authorize("Admin", "Editor"), createManga);

router.put("/:id", protect, authorize("Admin", "Editor"), updateManga);

router.delete("/:id", protect, authorize("Admin"), deleteManga);

router.post(
  "/:id/favorite",
  protect,
  authorize("Viewer"),
  toggleFavorite,
);

module.exports = router;
