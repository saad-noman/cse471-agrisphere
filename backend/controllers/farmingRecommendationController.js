const { spawn } = require('child_process');
const path = require('path');

const predictCrop = (req, res) => {
  try {
    const payload = req.body || {};

    const requiredFields = ['n', 'p', 'k', 'ph', 'temperature', 'humidity', 'moisture', 'rainfall'];
    const missingFields = requiredFields.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === '');

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'All crop input fields are required',
        missingFields,
      });
    }

    const input = requiredFields.map((field) => payload[field]);
    const pythonExecutable = process.env.PYTHON || process.env.PYTHON_PATH || 'python';
    const scriptPath = path.join(__dirname, '..', 'farmingrecommendationpredict.py');

    const pythonProcess = spawn(pythonExecutable, [scriptPath, ...input], {
      cwd: path.join(__dirname, '..'),
    });

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
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

      return res.json({ crop });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Crop prediction failed', error: error.message });
  }
};

module.exports = { predictCrop };