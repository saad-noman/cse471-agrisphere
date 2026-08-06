const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  listOrganizations,
  getMyOrganizations,
  getOrganization,
  createOrganization,
  deleteOrganization,
} = require('../controllers/organizationController');

// Order matters: '/mine' must come before '/:id' or it would be treated as an id.
router.get('/mine', protect, authorize('organization_owner'), getMyOrganizations);
router.get('/:id', getOrganization);
router.get('/', listOrganizations);
router.post('/', protect, authorize('organization_owner'), createOrganization);
router.delete('/:id', protect, authorize('organization_owner'), deleteOrganization);

module.exports = router;
