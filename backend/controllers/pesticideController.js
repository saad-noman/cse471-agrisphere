const Crop = require('../models/Crop');
const Pesticide = require('../models/Pesticide');
const PesticideRecord = require('../models/PesticideRecord');

//
// ==========================================================
// PESTICIDE LOOKUP (CATALOG)
// ==========================================================
//

// GET /api/pesticides
const getPesticides = async (req, res) => {
  try {
    const pesticides = await Pesticide.find().sort({ name: 1 });

    res.json(pesticides);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// POST /api/pesticides
const createPesticide = async (req, res) => {
  try {
    const { name, category, description } = req.body;

    const exists = await Pesticide.findOne({ name });

    if (exists) {
      return res.status(400).json({
        message: 'Pesticide already exists',
      });
    }

    const pesticide = await Pesticide.create({
      name,
      category,
      description,
    });

    res.status(201).json(pesticide);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// GET /api/pesticides/:id
const getPesticide = async (req, res) => {
  try {
    const pesticide = await Pesticide.findById(req.params.id);

    if (!pesticide) {
      return res.status(404).json({
        message: 'Pesticide not found',
      });
    }

    res.json(pesticide);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// PUT /api/pesticides/:id
const updatePesticide = async (req, res) => {
  try {
    const pesticide = await Pesticide.findById(req.params.id);

    if (!pesticide) {
      return res.status(404).json({
        message: 'Pesticide not found',
      });
    }

    Object.assign(pesticide, req.body);

    await pesticide.save();

    res.json(pesticide);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// DELETE /api/pesticides/:id
const deletePesticide = async (req, res) => {
  try {
    const pesticide = await Pesticide.findById(req.params.id);

    if (!pesticide) {
      return res.status(404).json({
        message: 'Pesticide not found',
      });
    }

    await pesticide.deleteOne();

    res.json({
      message: 'Pesticide deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

//
// ==========================================================
// PESTICIDE APPLICATION RECORDS
// ==========================================================
//

// POST /api/crops/:cropId/pesticides
const createPesticideRecord = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.cropId);

    if (!crop) {
      return res.status(404).json({
        message: 'Crop not found',
      });
    }

    if (
      req.user.role === 'farmer' &&
      crop.farmer.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: 'Not authorized',
      });
    }

    const record = await PesticideRecord.create({
      crop: crop._id,
      ...req.body,
    });

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// GET /api/crops/:cropId/pesticides
const getPesticideRecords = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.cropId);

    if (!crop) {
      return res.status(404).json({
        message: 'Crop not found',
      });
    }

    if (
      req.user.role === 'farmer' &&
      crop.farmer.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: 'Not authorized',
      });
    }

    const records = await PesticideRecord.find({
      crop: crop._id,
    })
      .populate('pesticide')
      .sort({ applicationDate: -1 });

    res.json(records);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// GET /api/pesticide-records/:id
const getPesticideRecord = async (req, res) => {
  try {
    const record = await PesticideRecord.findById(req.params.id)
      .populate('crop')
      .populate('pesticide');

    if (!record) {
      return res.status(404).json({
        message: 'Pesticide record not found',
      });
    }

    if (
      req.user.role === 'farmer' &&
      record.crop.farmer.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: 'Not authorized',
      });
    }

    res.json(record);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// PUT /api/pesticide-records/:id
const updatePesticideRecord = async (req, res) => {
  try {
    const record = await PesticideRecord.findById(req.params.id)
      .populate('crop');

    if (!record) {
      return res.status(404).json({
        message: 'Pesticide record not found',
      });
    }

    if (
      req.user.role === 'farmer' &&
      record.crop.farmer.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: 'Not authorized',
      });
    }

    Object.assign(record, req.body);

    await record.save();

    res.json(record);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// DELETE /api/pesticide-records/:id
const deletePesticideRecord = async (req, res) => {
  try {
    const record = await PesticideRecord.findById(req.params.id)
      .populate('crop');

    if (!record) {
      return res.status(404).json({
        message: 'Pesticide record not found',
      });
    }

    if (
      req.user.role === 'farmer' &&
      record.crop.farmer.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: 'Not authorized',
      });
    }

    await record.deleteOne();

    res.json({
      message: 'Pesticide record deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  // Catalog
  getPesticides,
  createPesticide,
  getPesticide,
  updatePesticide,
  deletePesticide,

  // Records
  createPesticideRecord,
  getPesticideRecords,
  getPesticideRecord,
  updatePesticideRecord,
  deletePesticideRecord,
};
