const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads/disease-cases');

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG and WebP images are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 5,
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;


