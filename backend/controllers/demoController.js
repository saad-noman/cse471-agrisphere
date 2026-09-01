const User = require('../models/User');

exports.getDemo = (req, res) => {
  res.json({
    message: 'Hello from the backend!',
    name: req.user.name
  });
};
