const Disease = require('../models/Disease');
const DiseaseCase = require('../models/DiseaseCase');
const Tag = require('../models/Tag');
const Notification = require('../models/Notification');

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

const getDiseaseMatches = async (req, res) => {
  try {
    const { caseId } = req.params;

    const diseaseCase = await DiseaseCase.findById(caseId)
      .populate('symptoms', 'name');

    if (!diseaseCase) {
      return res.status(404).json({
        message: 'Disease case not found',
      });
    }

    const diseases = await Disease.find()
      .populate('symptoms', 'name');

    const reportedSymptoms = new Set(
      diseaseCase.symptoms.map((symptom) => symptom._id.toString())
    );

    const matches = diseases.map((disease) => {
      const matchedSymptoms = disease.symptoms.filter((symptom) =>
        reportedSymptoms.has(symptom._id.toString())
      );

      const unmatchedSymptoms = disease.symptoms.filter(
        (symptom) => !reportedSymptoms.has(symptom._id.toString())
      );

      const totalDiseaseSymptoms = disease.symptoms.length;
      const matchedSymptomsCount = matchedSymptoms.length;

      const matchPercentage =
        totalDiseaseSymptoms > 0
          ? Math.round(
              (matchedSymptomsCount / totalDiseaseSymptoms) * 100
            )
          : 0;

      return {
        _id: disease._id,
        name: disease.name,
        description: disease.description,

        totalDiseaseSymptoms,
        matchedSymptomsCount,

        matchedSymptoms: matchedSymptoms.map((symptom) => ({
          _id: symptom._id,
          name: symptom.name,
        })),

        unmatchedSymptoms: unmatchedSymptoms.map((symptom) => ({
          _id: symptom._id,
          name: symptom.name,
        })),

        matchPercentage,
      };
    });

    // Only return diseases with at least one matching symptom
    const filteredMatches = matches
      .filter((match) => match.matchedSymptomsCount > 0)
      .sort((a, b) => {
        if (b.matchPercentage !== a.matchPercentage) {
          return b.matchPercentage - a.matchPercentage;
        }

        return b.matchedSymptomsCount - a.matchedSymptomsCount;
      });

    res.json(filteredMatches);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: 'Failed to find disease matches',
      error: err.message,
    });
  }
};

const createDisease = async (req, res) => {
  try {
    const { name, description, symptoms } = req.body;

    if (!name || !description || !Array.isArray(symptoms)) {
      return res.status(400).json({
        message: 'Name, description and symptoms are required',
      });
    }

    const existing = await Disease.findOne({ name });

    if (existing) {
      return res.status(409).json({
        message: 'Disease already exists',
      });
    }

    const tags = await Tag.find({
      _id: { $in: symptoms },
      type: 'symptom',
    });

    if (tags.length !== symptoms.length) {
      return res.status(400).json({
        message: 'One or more symptom tags are invalid',
      });
    }

    const disease = await Disease.create({
      name,
      description,
      symptoms,
    });

    const populated = await Disease.findById(disease._id)
      .populate('symptoms', 'name');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const getDiseases = async (req, res) => {
  try {
    const diseases = await Disease.find()
      .populate('symptoms', 'name')
      .sort({ name: 1 });

    res.json(diseases);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const getDisease = async (req, res) => {
  try {
    const disease = await Disease.findById(req.params.id)
      .populate('symptoms', 'name');

    if (!disease) {
      return res.status(404).json({
        message: 'Disease not found',
      });
    }

    res.json(disease);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const deleteDisease = async (req, res) => {
  try {
    const disease = await Disease.findById(req.params.id);

    if (!disease) {
      return res.status(404).json({
        message: 'Disease not found',
      });
    }

    await disease.deleteOne();

    res.json({
      message: 'Disease deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const getDiseaseCases = async (req, res) => {
  try {
    let filter = {};

    // Farmers only see their own cases
    if (req.user.role === 'farmer') {
      filter.farmer = req.user.id;
    }

    const cases = await DiseaseCase.find(filter)
      .select('crop status createdAt updatedAt')
      .sort({ createdAt: -1 });

    res.json(cases);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch disease cases',
      error: err.message,
    });
  }
};

const getDiseaseCase = async (req, res) => {
  try {
    const diseaseCase = await DiseaseCase.findById(req.params.caseId)
      .populate('symptoms', 'name')
      .populate('farmingConditions', 'name')
      .populate('farmer', 'name email');

    if (!diseaseCase) {
      return res.status(404).json({
        message: 'Disease case not found',
      });
    }

    // Farmers can only access their own cases
    if (
      req.user.role === 'farmer' &&
      diseaseCase.farmer._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: 'Not authorized',
      });
    }

    res.json(diseaseCase);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch disease case',
      error: err.message,
    });
  }
};

const submitDiagnosisReport = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { diseaseName, recommendation, additionalNotes } = req.body;

    if (!diseaseName || !recommendation) {
      return res.status(400).json({
        message: 'Disease name and recommendation are required',
      });
    }

    const diseaseCase = await DiseaseCase.findById(caseId);
    if (!diseaseCase) {
      return res.status(404).json({
        message: 'Disease case not found',
      });
    }

    diseaseCase.diagnosisReport = {
      expert: req.user.id,
      expertName: req.user.name || 'Agricultural Expert',
      diseaseName,
      recommendation,
      additionalNotes: additionalNotes || '',
      createdAt: new Date(),
    };

    diseaseCase.status = 'resolved';
    await diseaseCase.save();

    // Create a notification for the farmer
    await Notification.create({
      userId: diseaseCase.farmer,
      message: `An expert has provided a Crop Diagnosis Report for your ${diseaseCase.crop.type} case.`,
      link: '/diagnosis-history',
    });

    const populatedCase = await DiseaseCase.findById(caseId)
      .populate('symptoms', 'name')
      .populate('farmingConditions', 'name')
      .populate('farmer', 'name email');

    res.json({
      message: 'Diagnosis report submitted successfully',
      diseaseCase: populatedCase,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Failed to submit diagnosis report',
      error: err.message,
    });
  }
};

// DELETE /api/diseases/tags/:tagId
const deleteTag = async (req, res) => {
  try {
    const { tagId } = req.params;

    const tag = await Tag.findById(tagId);

    if (!tag) {
      return res.status(404).json({
        message: 'Tag not found',
      });
    }

    // Prevent deleting tags that are currently in use
    const inDiseaseCases = await DiseaseCase.exists({
      $or: [
        { symptoms: tagId },
        { farmingConditions: tagId },
      ],
    });

    const inDiseaseLibrary = await Disease.exists({
      symptoms: tagId,
    });

    if (inDiseaseCases || inDiseaseLibrary) {
      return res.status(400).json({
        message: 'Cannot delete tag because it is currently in use',
      });
    }

    await tag.deleteOne();

    res.json({
      message: 'Tag deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to delete tag',
      error: err.message,
    });
  }
};

module.exports = {
  submitDiseaseCase,
  searchTags,
  createTag,
  deleteTag,

  getDiseaseCases,
  getDiseaseCase,
  getDiseaseMatches,
  submitDiagnosisReport,

  createDisease,
  getDiseases,
  getDisease,
  deleteDisease,
};
