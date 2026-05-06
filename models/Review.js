import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  sellerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  buyerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  ticketId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Ticket', 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { 
    type: String, 
    maxlength: 500 
  }
}, { timestamps: true });

// Prevent multiple reviews per ticket per buyer
reviewSchema.index({ ticketId: 1, buyerId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
