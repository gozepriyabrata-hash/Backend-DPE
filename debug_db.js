const mongoose = require('mongoose');
const Order = require('./src/models/Order');
const User = require('./src/models/User');
require('dotenv').config();

async function checkOrders() {
  await mongoose.connect(process.env.MONGODB_URI);
  const orders = await Order.find().sort('-createdAt').limit(2);
  console.log('Latest Orders:', JSON.stringify(orders, null, 2));
  
  const user = await User.findOne();
  console.log('Sample User Address:', JSON.stringify(user.address, null, 2));
  
  await mongoose.connection.close();
}

checkOrders().catch(err => {
  console.error(err);
  process.exit(1);
});
