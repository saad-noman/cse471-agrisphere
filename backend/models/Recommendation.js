const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema(
  {
    cropType: { type: String },
    title: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recommendation', recommendationSchema);
