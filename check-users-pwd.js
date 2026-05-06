import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const checkUsersPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const users = await mongoose.connection.collection('users').find({}).toArray();
    console.log('Users in DB:');
    users.forEach(u => console.log(`${u.email} - pass: ${u.password.substring(0, 10)}`));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
};

checkUsersPassword();
