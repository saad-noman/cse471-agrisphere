const Crop = require('../models/Crop');


// POST /api/crops
const createCrop = async (req, res) => {
  try {
    const crop = await Crop.create({
      ...req.body,
      farmer: req.user.id,
    });

    res.status(201).json(crop);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// GET /api/crops
const getMyCrops = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'farmer') {
      filter.farmer = req.user.id;
    }

    const crops = await Crop.find(filter)
      .sort({ createdAt: -1 });

    res.json(crops);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// GET /api/crops/:cropId
const getCrop = async (req, res) => {
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

    res.json(crop);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// PUT /api/crops/:cropId
const updateCrop = async (req, res) => {
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

    Object.assign(crop, req.body);

    await crop.save();

    res.json(crop);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// DELETE /api/crops/:cropId
const deleteCrop = async (req, res) => {
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

    await crop.deleteOne();

    res.json({
      message: 'Crop deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


module.exports = {
  createCrop,
  getMyCrops,
  getCrop,
  updateCrop,
  deleteCrop,
};
