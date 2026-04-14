const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/user');

async function seed() {
  await connectDB();

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