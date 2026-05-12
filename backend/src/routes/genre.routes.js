const router = require("express").Router();
const Genre = require("../models/Genre");
const { protect, authorize } = require("../middlewares/auth.middleware");
const { createGenre } = require("../controllers/genre.controller");

// GET todos
router.get(
  "/",
  protect,
  authorize("Admin", "Editor", "Viewer"),
  async (req, res) => {
    const genres = await Genre.find({ isActive: true });
    res.json(genres);
  },
);

// POST crear
router.post("/", protect, authorize("Admin", "Editor"), createGenre);

// PUT editar
router.put("/:id", protect, authorize("Admin", "Editor"), async (req, res) => {
  try {
    const updatedGenre = await Genre.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
      },
      { new: true },
    );

    if (!updatedGenre) {
      return res.status(404).json({
        message: "Género no encontrado",
      });
    }

    res.json(updatedGenre);
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar género",
    });
  }
});

// DELETE eliminar
router.delete(
  "/:id",
  protect,
  authorize("Admin", "Editor"),
  async (req, res) => {
    try {
      const deletedGenre = await Genre.findByIdAndDelete(req.params.id);

      if (!deletedGenre) {
        return res.status(404).json({
          message: "Género no encontrado",
        });
      }

      res.json({
        message: "Género eliminado",
      });
    } catch (error) {
      res.status(500).json({
        message: "Error al eliminar género",
      });
    }
  },
);

module.exports = router;
