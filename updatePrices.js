import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Ticket } from './models/index.js';

dotenv.config();

const updatePrices = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB. Updating ticket prices to 10-15 INR...');
    
    const tickets = await Ticket.find({});
    let updated = 0;
    
    for (const ticket of tickets) {
      // Random price between 10 and 15
      const newPrice = Math.floor(Math.random() * (15 - 10 + 1)) + 10;
      ticket.resalePrice = newPrice;
      ticket.originalPrice = newPrice + Math.floor(Math.random() * 5); // Add a small discount
      await ticket.save();
      updated++;
    }
    
    console.log(`Successfully updated ${updated} tickets!`);
    process.exit(0);
  } catch (error) {
    console.error('Failed:', error);
    process.exit(1);
  }
};

updatePrices();
