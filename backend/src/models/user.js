const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: 8,
    select: false,
  },
  role: {
    type: String,
    enum: ['Admin', 'Editor', 'Viewer'],
    default: 'Viewer',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: Date,
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manga',
  }],
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(
    this.password,
    parseInt(process.env.BCRYPT_ROUNDS) || 12
  );
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
}; 


module.exports = mongoose.model('User', userSchema);