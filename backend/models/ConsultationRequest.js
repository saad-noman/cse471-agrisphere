const mongoose = require('mongoose');

const consultationRequestSchema = new mongoose.Schema(
  {
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    expertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expert' },
    subject: { type: String },
    description: { type: String },
    preferredDate: { type: Date },
    consultationType: { type: String, enum: ['online', 'offline'] },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ConsultationRequest', consultationRequestSchema);
