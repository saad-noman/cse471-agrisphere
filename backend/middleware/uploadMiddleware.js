const multer = require('multer');
const path = require('path');
const fs = require('fs');

const generalUploadDir = path.join(__dirname, '../uploads');
const diseaseCaseUploadDir = path.join(__dirname, '../uploads/disease-cases');

fs.mkdirSync(generalUploadDir, { recursive: true });
fs.mkdirSync(diseaseCaseUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, generalUploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const diseaseCaseStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, diseaseCaseUploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

const diseaseUpload = multer({
  storage: diseaseCaseStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

upload.upload = upload;
upload.diseaseUpload = diseaseUpload;

module.exports = upload;
module.exports.upload = upload;
module.exports.diseaseUpload = diseaseUpload;
