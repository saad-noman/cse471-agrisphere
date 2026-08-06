const express = require('express');
const { predictCrop } = require('../controllers/farmingRecommendationController');

const router = express.Router();

router.post('/predict', predictCrop);

module.exports = router;
