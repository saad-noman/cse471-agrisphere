const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Expert = require('../models/Expert');

const createToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// Roles a user is allowed to pick for themselves at sign-up.
// 'admin' is intentionally excluded — admin accounts are not self-registerable.
const PUBLIC_ROLES = ['farmer', 'expert', 'organization_owner'];

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, district, upazila, specialization } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    if (role && !PUBLIC_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid role selection' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'farmer',
      phone,
      district,
      upazila,
    });

    // Experts also get a linked Expert profile so they show up in expert search right away.
    // The rest of the expert-specific fields can be filled in later from the Edit Profile page.
    if (user.role === 'expert') {
      await Expert.create({
        userId: user._id,
        fullName: name,
        phone,
        email,
        district,
        upazila,
        specialization,
      });
    }

    const token = createToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = createToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

module.exports = { register, login };
