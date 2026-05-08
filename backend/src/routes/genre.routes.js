const router = require('express').Router();
const Genre = require('../models/Genre');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { createGenre } = require('../controllers/genre.controller');

// GET todos
router.get('/', protect, authorize('Admin','Editor','Viewer'), async (req, res) => {
  const genres = await Genre.find({ isActive: true });
  res.json(genres);
});

// POST crear
router.post('/', protect, authorize('Admin','Editor'), createGenre);

module.exports = router;