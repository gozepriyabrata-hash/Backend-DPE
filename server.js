require('dotenv').config();
const app = require('./src/app');
const connectDB = async () => {
  try {
    const mongoose = require('mongoose');
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(` Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(` Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer();
