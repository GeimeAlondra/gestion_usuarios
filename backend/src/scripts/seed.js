const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/user');
const Role = require('../models/role');

async function seed() {
  await connectDB();

  // --- Roles ---
  const roles = [
    { name: 'Admin', description: 'Acceso total al sistema. Puede gestionar usuarios y contenido.' },
    { name: 'Editor', description: 'Puede crear y editar contenido, sin acceso a gestión de usuarios.' },
    { name: 'Viewer', description: 'Solo puede visualizar contenido. Sin permisos de escritura.' },
  ];

  for (const role of roles) {
    const exists = await Role.findOne({ name: role.name });
    if (!exists) {
      await Role.create(role);
      console.log(`Rol creado: ${role.name}`);
    } else {
      console.log(`Rol ya existe: ${role.name}`);
    }
  }

  // --- Admin ---
  const existing = await User.findOne({ role: 'Admin' });

  if (existing) {
    console.log('Ya existe un usuario Admin:', existing.email);
  } else {
    await User.create({
      name: 'Administrador',
      email: 'admin@admin.com',
      password: 'Admin1234!',
      role: 'Admin',
    });
    console.log('Admin creado: admin@admin.com / Admin1234!');
  }

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});