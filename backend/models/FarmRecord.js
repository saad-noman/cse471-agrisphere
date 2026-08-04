const mongoose = require('mongoose');

const farmRecordSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cropType: { type: String },
    season: { type: String },
    yieldAmount: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FarmRecord', farmRecordSchema);
