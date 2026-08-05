const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String },
    category: { type: String },
    description: { type: String },
    link: { type: String },
    publishedDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);
