const mongoose = require('mongoose');

const expertSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    specialization: { type: String },
    location: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expert', expertSchema);
