const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    expert: { type: mongoose.Schema.Types.ObjectId, ref: 'Expert' },
    scheduledAt: { type: Date },
    status: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Consultation', consultationSchema);
