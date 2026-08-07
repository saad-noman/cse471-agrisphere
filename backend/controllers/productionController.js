const Crop = require('../models/Crop');
const ProductionRecord = require('../models/ProductionRecord');


// POST /api/crops/:cropId/production
const createProductionRecord = async (req, res) => {
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

    const record = await ProductionRecord.create({
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


// GET /api/crops/:cropId/production
const getProductionRecords = async (req, res) => {
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

    const records = await ProductionRecord.find({
      crop: crop._id,
    }).sort({
      harvestDate: -1,
    });

    res.json(records);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// GET /api/production/:id
const getProductionRecord = async (req, res) => {
  try {
    const record = await ProductionRecord.findById(req.params.id)
      .populate('crop');

    if (!record) {
      return res.status(404).json({
        message: 'Production record not found',
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


// PUT /api/production/:id
const updateProductionRecord = async (req, res) => {
  try {
    const record = await ProductionRecord.findById(req.params.id)
      .populate('crop');

    if (!record) {
      return res.status(404).json({
        message: 'Production record not found',
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


// DELETE /api/production/:id
const deleteProductionRecord = async (req, res) => {
  try {
    const record = await ProductionRecord.findById(req.params.id)
      .populate('crop');

    if (!record) {
      return res.status(404).json({
        message: 'Production record not found',
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
      message: 'Production record deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


module.exports = {
  createProductionRecord,
  getProductionRecords,
  getProductionRecord,
  updateProductionRecord,
  deleteProductionRecord,
};
