const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Expert = require('../models/Expert');

// Best-effort delete of an uploaded file — a missing file is not an error here.
const deleteUploadedFile = (imagePath) => {
  if (!imagePath) return;
  fs.unlink(path.join('uploads', path.basename(imagePath)), () => {});
};

// GET /api/users/me
// Returns the logged-in user's profile. If the user is an expert, their
// Expert profile is included too, so the Edit Profile form can show it.
const getProfile = async (req, res) => {
  try {
    const user = req.user;
    let expert = null;

    if (user.role === 'expert') {
      expert = await Expert.findOne({ userId: user._id });
    }

    res.json({ user, expert });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

// PUT /api/users/me
// Updates the basic User fields, and — for experts — the linked Expert profile too.
const updateProfile = async (req, res) => {
  try {
    const { name, phone, district, upazila } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, district, upazila },
      { new: true }
    ).select('-password');

    let expert = null;

    if (user.role === 'expert') {
      const {
        specialization,
        expertiseCategory,
        qualification,
        experience,
        organization,
        organizationId,
        consultationMode,
        address,
        availabilityStatus,
      } = req.body;

      expert = await Expert.findOneAndUpdate(
        { userId: user._id },
        {
          fullName: name,
          phone,
          district,
          upazila,
          specialization,
          expertiseCategory,
          qualification,
          experience,
          organization,
          organizationId: organizationId || null,
          consultationMode,
          address,
          availabilityStatus,
        },
        { new: true, upsert: true }
      );
    }

    res.json({ user, expert });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

// POST /api/users/me/photo
// Saves the uploaded photo path as the user's profileImage (and the linked
// Expert profile's, if the user is an expert).
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No photo uploaded' });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: imagePath },
      { new: true }
    ).select('-password');

    if (user.role === 'expert') {
      await Expert.findOneAndUpdate({ userId: user._id }, { profileImage: imagePath });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

// DELETE /api/users/me/photo
// Clears the profileImage field (and the linked Expert's, if applicable) and removes the file.
const deleteProfilePhoto = async (req, res) => {
  try {
    deleteUploadedFile(req.user.profileImage);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: null },
      { new: true }
    ).select('-password');

    if (user.role === 'expert') {
      await Expert.findOneAndUpdate({ userId: user._id }, { profileImage: null });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

// DELETE /api/users/me
// Deletes the logged-in user's account, along with their linked Expert profile and photo, if any.
const deleteProfile = async (req, res) => {
  try {
    if (req.user.role === 'expert') {
      await Expert.findOneAndDelete({ userId: req.user._id });
    }

    deleteUploadedFile(req.user.profileImage);
    await User.findByIdAndDelete(req.user._id);

    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

module.exports = { getProfile, updateProfile, uploadProfilePhoto, deleteProfilePhoto, deleteProfile };
