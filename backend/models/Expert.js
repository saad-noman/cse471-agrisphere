const mongoose = require('mongoose');

const expertSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fullName: { type: String },
    profileImage: { type: String },
    specialization: { type: String },
    expertiseCategory: { type: String },
    qualification: { type: String },
    experience: { type: Number },
    organization: { type: String },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    consultationMode: { type: String, enum: ['online', 'offline', 'both'], default: 'both' },
    phone: { type: String },
    email: { type: String },
    district: { type: String },
    upazila: { type: String },
    address: { type: String },
    availabilityStatus: { type: String, enum: ['available', 'unavailable'], default: 'available' },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expert', expertSchema);
