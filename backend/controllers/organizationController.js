const fs = require('fs');
const path = require('path');
const Organization = require('../models/Organization');


const deleteUploadedFile = (imagePath) => {
  if (!imagePath) return;
  fs.unlink(path.join('uploads', path.basename(imagePath)), () => {});
};

// GET /api/organizations?search=name&category=&district=&upazila=
// Public. Lists all organizations, optionally filtered by name search, category,
// district, and upazila (used for public browsing, the owner's "My Organizations"
// list, and the "search organization" box on the expert profile form).
const listOrganizations = async (req, res) => {
  try {
    const { search, category, district, upazila } = req.query;
    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }
    if (district) {
      filter.district = { $regex: district, $options: 'i' };
    }
    if (upazila) {
      filter.upazila = { $regex: upazila, $options: 'i' };
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
      photo: req.file ? `/uploads/${req.file.filename}` : undefined,
    });

    res.status(201).json(organization);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

// PUT /api/organizations/:id
// Organization owner only, and only for organizations they own.
// If a new photo is uploaded, it replaces the old one (old file is removed).
const updateOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    if (organization.ownerId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own organizations' });
    }

    const {
      name,
      category,
      description,
      address,
      district,
      upazila,
      contactNumber,
      email,
      website,
      openingHours,
      isConsultationCenter,
    } = req.body;

    Object.assign(organization, {
      name,
      category,
      description,
      address,
      district,
      upazila,
      contactNumber,
      email,
      website,
      openingHours,
      isConsultationCenter,
    });

    if (req.file) {
      deleteUploadedFile(organization.photo);
      organization.photo = `/uploads/${req.file.filename}`;
    }

    await organization.save();
    res.json(organization);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

// DELETE /api/organizations/:id/photo
// Organization owner only, and only for organizations they own.
const deleteOrganizationPhoto = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    if (organization.ownerId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own organizations' });
    }

    deleteUploadedFile(organization.photo);
    organization.photo = null;
    await organization.save();

    res.json(organization);
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

    deleteUploadedFile(organization.photo);
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
  updateOrganization,
  deleteOrganizationPhoto,
  deleteOrganization,
};
