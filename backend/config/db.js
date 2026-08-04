const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);


const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err);
  }
};

module.exports = connectDB;