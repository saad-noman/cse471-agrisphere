const Organization = require('../models/Organization');

// GET /api/organizations?search=name
// Public. Lists all organizations, optionally filtered by name (used for
// public browsing and for the "search organization" box on the expert profile form).
const listOrganizations = async (req, res) => {
  try {
    const filter = {};
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }

    const organizations = await Organization.find(filter).sort({ name: 1 });
    res.json(organizations);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

// GET /api/organizations/mine
// Organization owner only. Lists the organizations this owner has added.
const getMyOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find({ ownerId: req.user._id }).sort({ name: 1 });
    res.json(organizations);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

// GET /api/organizations/:id
// Public. Used by the organization details page.
const getOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    res.json(organization);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

// POST /api/organizations
// Organization owner only. Creates a new organization owned by the logged-in user.
const createOrganization = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Organization name is required' });
    }

    const organization = await Organization.create({
      ...req.body,
      ownerId: req.user._id,
    });

    res.status(201).json(organization);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

// DELETE /api/organizations/:id
// Organization owner only, and only for organizations they own.
const deleteOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    if (organization.ownerId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own organizations' });
    }

    await organization.deleteOne();
    res.json({ message: 'Organization deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

module.exports = {
  listOrganizations,
  getMyOrganizations,
  getOrganization,
  createOrganization,
  deleteOrganization,
};
