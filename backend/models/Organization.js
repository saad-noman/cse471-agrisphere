const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String },
    description: { type: String },
    location: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Organization', organizationSchema);
