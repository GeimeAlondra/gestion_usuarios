const Genre = require("../models/Genre");

const createGenre = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Nombre requerido" });
    }

    const cleanName = name.trim();

    // evitar duplicados (case insensitive)
    const exists = await Genre.findOne({
      name: { $regex: `^${cleanName}$`, $options: "i" }
    });

    if (exists) {
      return res.status(400).json({ message: "El género ya existe" });
    }

    const genre = await Genre.create({ name: cleanName });

    res.status(201).json(genre);
  } catch (error) {
    res.status(500).json({ message: "Error creando género" });
  }
};

module.exports = { createGenre };