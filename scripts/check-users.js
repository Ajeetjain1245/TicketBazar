import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const users = await mongoose.connection.collection('users').find({}).toArray();
    console.log('Users in DB:', users.map(u => ({ email: u.email })));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
};

checkUsers();
