import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/samadhansetu', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✓ MongoDB Connected Successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`! MongoDB Connection Notice: Could not connect to MongoDB at ${process.env.MONGODB_URI}`);
    console.warn(`  To connect: either start local MongoDB or provide a free MongoDB Atlas URI in backend/.env`);
    return false;
  }
};
