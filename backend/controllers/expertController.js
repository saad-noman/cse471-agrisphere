const Expert = require('../models/Expert');

// GET /api/experts?search=&specialization=&district=&upazila=
// Public. Lists experts, optionally filtered by name/specialization search,
// specialization, district, and upazila.
const listExperts = async (req, res) => {
  try {
    const { search, specialization, district, upazila } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
      ];
    }
    if (specialization) {
      filter.specialization = { $regex: specialization, $options: 'i' };
    }
    if (district) {
      filter.district = { $regex: district, $options: 'i' };
    }
    if (upazila) {
      filter.upazila = { $regex: upazila, $options: 'i' };
    }

    const experts = await Expert.find(filter).sort({ fullName: 1 });
    res.json(experts);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

// GET /api/experts/:id
// Public. Used by the expert profile page.
const getExpert = async (req, res) => {
  try {
    const expert = await Expert.findById(req.params.id);
    if (!expert) {
      return res.status(404).json({ message: 'Expert not found' });
    }
    res.json(expert);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

module.exports = { listExperts, getExpert };
