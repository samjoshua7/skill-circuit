const mongoose = require('mongoose');
const dns = require('dns');

// Force Node.js to use Google & Cloudflare DNS to resolve MongoDB Atlas SRV records.
// This overcomes ISP-level DNS failures that cause `querySrv ECONNREFUSED` errors.
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
