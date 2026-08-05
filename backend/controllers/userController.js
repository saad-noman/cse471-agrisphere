const User = require('../models/User');
const Expert = require('../models/Expert');

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

module.exports = { getProfile, updateProfile };
