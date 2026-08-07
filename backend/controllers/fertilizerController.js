const Crop = require('../models/Crop');
const Fertilizer = require('../models/Fertilizer');
const FertilizerRecord = require('../models/FertilizerRecord');


// POST /api/crops/:cropId/fertilizers
const createFertilizerRecord = async (req, res) => {
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

    const record = await FertilizerRecord.create({
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


// GET /api/crops/:cropId/fertilizers
const getFertilizerRecords = async (req, res) => {
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

    const records = await FertilizerRecord.find({
      crop: crop._id,
    })
      .populate('fertilizer')
      .sort({
        applicationDate: -1,
      })

    res.json(records);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// GET /api/fertilizers/:id
const getFertilizerRecord = async (req, res) => {
  try {
    const record = await FertilizerRecord.findById(req.params.id)
      .populate('crop')
      .populate('fertilizer');

    if (!record) {
      return res.status(404).json({
        message: 'Fertilizer record not found',
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


// PUT /api/fertilizers/:id
const updateFertilizerRecord = async (req, res) => {
  try {
    const record = await FertilizerRecord.findById(req.params.id)
      .populate('crop')
      .populate('fertilizer');

    if (!record) {
      return res.status(404).json({
        message: 'Fertilizer record not found',
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


// DELETE /api/fertilizers/:id
const deleteFertilizerRecord = async (req, res) => {
  try {
    const record = await FertilizerRecord.findById(req.params.id)
      .populate('crop')
      .populate('fertilizer');

    if (!record) {
      return res.status(404).json({
        message: 'Fertilizer record not found',
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
      message: 'Fertilizer record deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const getFertilizers = async (req, res) => {
  try {
    const fertilizers = await Fertilizer.find().sort({ name: 1 });

    res.json(fertilizers);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const createFertilizer = async (req, res) => {
  try {
    const { name, category, description } = req.body;

    const exists = await Fertilizer.findOne({ name });

    if (exists) {
      return res.status(400).json({
        message: 'Fertilizer already exists',
      });
    }

    const fertilizer = await Fertilizer.create({
      name,
      category,
      description,
    });

    res.status(201).json(fertilizer);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const getFertilizer = async (req, res) => {
  try {
    const fertilizer = await Fertilizer.findById(req.params.id);

    if (!fertilizer) {
      return res.status(404).json({
        message: 'Fertilizer not found',
      });
    }

    res.json(fertilizer);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const updateFertilizer = async (req, res) => {
  try {
    const fertilizer = await Fertilizer.findById(req.params.id);

    if (!fertilizer) {
      return res.status(404).json({
        message: 'Fertilizer not found',
      });
    }

    Object.assign(fertilizer, req.body);

    await fertilizer.save();

    res.json(fertilizer);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const deleteFertilizer = async (req, res) => {
  try {
    const fertilizer = await Fertilizer.findById(req.params.id);

    if (!fertilizer) {
      return res.status(404).json({
        message: 'Fertilizer not found',
      });
    }

    await fertilizer.deleteOne();

    res.json({
      message: 'Fertilizer deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  // Fertilizer catalog
  getFertilizers,
  createFertilizer,
  getFertilizer,
  updateFertilizer,
  deleteFertilizer,

  // Fertilizer records
  createFertilizerRecord,
  getFertilizerRecords,
  getFertilizerRecord,
  updateFertilizerRecord,
  deleteFertilizerRecord,
};
