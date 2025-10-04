import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Debug environment variables
    console.log('Environment check:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('PORT:', process.env.PORT);
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'NOT SET');
    
    // Fallback MongoDB URI for Render
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://user2:bakar123@cluster0.oxt2l.mongodb.net/resumerag?retryWrites=true&w=majority&appName=Cluster0';
    
    console.log('Using MongoDB URI:', mongoURI.substring(0, 30) + '...');
    
    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
