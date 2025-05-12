const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

console.log(process.env.MONGODB_URI);
const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const adminData = {
      username: 'admin',
      password: 'admin123'  // This will be hashed automatically by the model
    };

    const existingAdmin = await Admin.findOne({ username: adminData.username });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const admin = new Admin(adminData);
    await admin.save();
    
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin(); 
