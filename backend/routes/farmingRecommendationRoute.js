const express = require('express');
const {
  predictCrop,
  getHistory,
  getHistoryById,
  deleteHistory,
} = require('../controllers/farmingRecommendationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/predict', protect, predictCrop);
router.get('/history', protect, getHistory);
router.get('/history/:id', protect, getHistoryById);
router.delete('/history/:id', protect, authorize('expert'), deleteHistory);

module.exports = router;



