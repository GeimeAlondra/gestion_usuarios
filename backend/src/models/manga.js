const mongoose = require("mongoose");

const mangaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "El título es requerido"],
      trim: true,
    },

    status: {
      type: String,
      enum: ["emision", "finalizado", "proximamente"],
      default: "emision",
    },

    genres: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Genre",
        required: true,
      },
    ],

    mainGenre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Genre",
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    chapters: {
      type: Number,
      default: 0,
    },

    author: {
      type: String,
      default: "Desconocido",
    },

    synopsis: {
      type: String,
    },

    coverUrl: {
      type: String,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Manga", mangaSchema);
