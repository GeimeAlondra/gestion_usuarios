const User = require('../models/user');

const getStats = async (req, res) => {
  try {
    const [total, activos, adminCount, editorCount, viewerCount] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'Admin' }),
      User.countDocuments({ role: 'Editor' }),
      User.countDocuments({ role: 'Viewer' }),
    ]);

    res.json({
      total,
      activos,
      inactivos: total - activos,
      porRol: {
        Admin: adminCount,
        Editor: editorCount,
        Viewer: viewerCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};

module.exports = { getStats };