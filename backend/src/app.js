require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const statsRoutes = require("./routes/stats.routes");
const usersRoutes = require("./routes/user.routes");
const mangaRoutes = require("./routes/manga.routes");
const activityRoutes = require("./routes/activity.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API de Gestión de Usuarios funcionando" });
});

app.use("/api/auth", authRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/mangas", mangaRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/genres", require("./routes/genre.routes"));

module.exports = app;
