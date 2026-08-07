const express = require('express');

const router = express.Router();

const {
  submitDiseaseCase,
  searchTags,
  createTag,
  deleteTag,

  getDiseaseCases,
  getDiseaseCase,
  getDiseaseMatches,

  createDisease,
  getDiseases,
  getDisease,
  deleteDisease,
} = require('../controllers/diseaseController');

const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const upload = require('../middleware/uploadMiddleware');

// Search/select tags
router.get('/tags', protect, searchTags);
router.delete( '/tags/:tagId', protect, requireRole('expert'), deleteTag );

// Expert creates a new tag
router.post('/tags', protect, requireRole('expert'), createTag);

// Submit disease case
router.post('/', protect, upload.array('images', 5), submitDiseaseCase);

// Disease library
router.get('/library', protect, getDiseases);
router.get('/library/:id', protect, getDisease);
router.post('/library', protect, requireRole('expert'), createDisease);
router.delete('/library/:id', protect, requireRole('expert'), deleteDisease);

// List submitted disease cases
router.get('/', protect, getDiseaseCases);

// Disease matches
router.get('/:caseId/matches', protect, getDiseaseMatches);

// Get one submitted disease case
router.get('/:caseId', protect, getDiseaseCase);

module.exports = router;
