const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userRole: {
    type: String,
    enum: ['Admin', 'Editor', 'Viewer'],
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  entity: {
    type: String,
    enum: ['manga', 'user', 'session', 'profile'],
    required: true,
  },
  entityId: {
    type: String,
    default: null,
  },
  entityName: {
    type: String,
    default: null,
  },
  details: {
    type: String,
    default: null,
  },
  ip: {
    type: String,
    default: null,
  },
}, { timestamps: true });

// Índices para queries rápidas
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ action: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);