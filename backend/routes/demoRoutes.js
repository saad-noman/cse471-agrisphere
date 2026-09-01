const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { getDemo } = require('../controllers/demoController');

router.get('/', protect, getDemo);

module.exports = router;
