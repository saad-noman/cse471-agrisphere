const mongoose = require('mongoose');

const diseaseCaseSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cropType: { type: String },
    symptoms: { type: String },
    imageUrl: { type: String },
    status: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DiseaseCase', diseaseCaseSchema);
