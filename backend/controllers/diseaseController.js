const DiseaseCase = require('../models/DiseaseCase');
const Tag = require('../models/Tag');

// POST /api/diseases
const submitDiseaseCase = async (req, res) => {
  try {
    const {
      cropType,
      cropVariety,
      growthStage,
      cropAge,
      symptoms,
      farmingConditions,
      description,
    } = req.body;

    if (!cropType) {
      return res.status(400).json({
        message: 'Crop type is required',
      });
    }

    // multipart/form-data sends arrays as JSON strings
    let symptomTags = [];
    let conditionTags = [];

    try {
      symptomTags = symptoms ? JSON.parse(symptoms) : [];
      conditionTags = farmingConditions
        ? JSON.parse(farmingConditions)
        : [];
    } catch {
      return res.status(400).json({
        message: 'Symptoms and farming conditions must be valid JSON arrays',
      });
    }

    // Verify that supplied tags actually exist
    const tags = await Tag.find({
      _id: { $in: [...symptomTags, ...conditionTags] },
    });

    const existingTagIds = tags.map((tag) => tag._id.toString());

    const invalidSymptom = symptomTags.some(
      (id) => !existingTagIds.includes(id)
    );

    const invalidCondition = conditionTags.some(
      (id) => !existingTagIds.includes(id)
    );

    if (invalidSymptom || invalidCondition) {
      return res.status(400).json({
        message: 'One or more supplied tags do not exist',
      });
    }

    const images = (req.files || []).map(
      (file) => `/uploads/disease-cases/${file.filename}`
    );

    const diseaseCase = await DiseaseCase.create({
      farmer: req.user.id,

      crop: {
        type: cropType,
        variety: cropVariety,
        growthStage,
        age: cropAge,
      },

      symptoms: symptomTags,

      farmingConditions: conditionTags,

      images,

      description,

      status: 'pending',
    });

    const populatedCase = await DiseaseCase.findById(diseaseCase._id)
      .populate('farmer', 'name email')
      .populate('symptoms', 'name type')
      .populate('farmingConditions', 'name type');

    res.status(201).json({
      message: 'Disease case submitted successfully',
      diseaseCase: populatedCase,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: 'Failed to submit disease case',
      error: err.message,
    });
  }
};


// GET /api/diseases/tags
const searchTags = async (req, res) => {
  try {
    const { search = '', type } = req.query;

    const filter = {
      name: {
        $regex: search,
        $options: 'i',
      },
    };

    if (type) {
      filter.type = type;
    }

    const tags = await Tag.find(filter)
      .select('name type')
      .sort({ name: 1 })
      .limit(30);

    res.json(tags);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to search tags',
      error: err.message,
    });
  }
};


const createTag = async (req, res) => {
  try {
    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        message: 'Tag name and type are required',
      });
    }

    if (!['symptom', 'farming_condition'].includes(type)) {
      return res.status(400).json({
        message: 'Invalid tag type',
      });
    }

    const normalizedName = name.trim().toLowerCase();

    const existingTag = await Tag.findOne({
      name: normalizedName,
      type,
    });

    if (existingTag) {
      return res.status(409).json({
        message: 'This tag already exists',
        tag: existingTag,
      });
    }

    const tag = await Tag.create({
      name: normalizedName,
      type,
    });

    res.status(201).json({
      message: 'Tag created successfully',
      tag,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to create tag',
      error: err.message,
    });
  }
};

module.exports = {
  submitDiseaseCase,
  searchTags,
  createTag,
};
