const { spawn } = require('child_process');
const path = require('path');
const FarmingRecommendation = require('../models/FarmingRecommendation');

const predictCrop = (req, res) => {
  try {
    const payload = req.body || {};

    const requiredFields = ['n', 'p', 'k', 'ph', 'temperature', 'humidity', 'moisture', 'rainfall'];
    const missingFields = requiredFields.filter(
      (field) => payload[field] === undefined || payload[field] === null || payload[field] === ''
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'All crop input fields are required',
        missingFields,
      });
    }

    const input = requiredFields.map((field) => payload[field]);
    const pythonExecutable = process.env.PYTHON || process.env.PYTHON_PATH || 'python';
    const scriptPath = path.join(__dirname, '..', 'ml_models', 'farmingrecommendationpredict.py');

    const pythonProcess = spawn(pythonExecutable, [scriptPath, ...input], {
      cwd: path.join(__dirname, '..', 'ml_models'),
    });


    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', async (code) => {
      if (code !== 0) {
        return res.status(500).json({
          message: 'Crop prediction failed',
          error: stderr.trim() || 'The Python inference script exited with an error.',
        });
      }

      const crop = stdout.trim();
      if (!crop) {
        return res.status(500).json({
          message: 'Crop prediction failed',
          error: 'The inference script returned no prediction.',
        });
      }

      try {
        const savedRecord = await FarmingRecommendation.create({
          user: req.user._id,
          inputs: {
            n: Number(payload.n),
            p: Number(payload.p),
            k: Number(payload.k),
            ph: Number(payload.ph),
            temperature: Number(payload.temperature),
            humidity: Number(payload.humidity),
            moisture: Number(payload.moisture),
            rainfall: Number(payload.rainfall),
          },
          recommendedCrop: crop,
        });

        return res.json({ crop, record: savedRecord });
      } catch (saveError) {
        console.error('Failed to save prediction record to database:', saveError);
        return res.status(500).json({ message: 'Failed to save prediction record', error: saveError.message });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Crop prediction failed', error: error.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const history = await FarmingRecommendation.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);
    return res.json(history);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch recommendation history', error: error.message });
  }
};

const getHistoryById = async (req, res) => {
  try {
    const record = await FarmingRecommendation.findOne({ _id: req.params.id, user: req.user._id });
    if (!record) {
      return res.status(404).json({ message: 'Recommendation record not found' });
    }
    return res.json(record);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch record', error: error.message });
  }
};

const deleteHistory = async (req, res) => {
  try {
    if (req.user.role !== 'expert') {
      return res.status(403).json({ message: 'Forbidden: Farmers cannot delete recommendation records. Only experts can delete their own records.' });
    }

    const record = await FarmingRecommendation.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!record) {
      return res.status(404).json({ message: 'Recommendation record not found or unauthorized' });
    }
    return res.json({ message: 'Record deleted successfully', id: req.params.id });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete record', error: error.message });
  }
};

module.exports = {
  predictCrop,
  getHistory,
  getHistoryById,
  deleteHistory,

}