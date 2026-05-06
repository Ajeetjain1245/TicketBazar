import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Ticket from './models/Ticket.js';
import Order from './models/Order.js';

dotenv.config();

// Export the seed function
export const seedDatabase = async (isManual = false) => {


// Demo Users
const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@ticketbazar.com',
    password: 'admin123',
    phone: '9876543210',
    role: 'admin',
    isVerified: true,
    isActive: true,
  },
  {
    name: 'John Seller',
    email: 'seller@ticketbazar.com',
    password: 'seller123',
    phone: '9876543211',
    role: 'seller',
    isVerified: true,
    isActive: true,
  },
  {
    name: 'Jane Buyer',
    email: 'buyer@ticketbazar.com',
    password: 'Buy@Ticket2024',
    phone: '9876543212',
    role: 'user',
    isVerified: true,
    isActive: true,
  },
  {
    name: 'Mike Johnson',
    email: 'mike@example.com',
    password: 'password123',
    phone: '9876543213',
    role: 'seller',
    isVerified: true,
    isActive: true,
  },
  {
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    password: 'password123',
    phone: '9876543214',
    role: 'user',
    isVerified: true,
    isActive: true,
  },
];

// Demo Tickets
const demoTickets = [
  {
    title: 'Coldplay Mumbai Concert - VIP Pass',
    description: 'VIP ticket for Coldplay Music of the Spheres World Tour at DY Patil Stadium, Mumbai. Includes premium seating and exclusive merchandise.',
    type: 'concert',
    category: 'entertainment',
    originalPrice: 15000,
    resalePrice: 12000,
    currency: 'INR',
    eventName: 'Coldplay Music of the Spheres World Tour',
    eventDate: new Date('2026-12-15T19:00:00'),
    eventTime: '7:00 PM',
    venue: 'DY Patil Stadium, Mumbai',
    seatNumber: 'A-12, A-13',
    seatClass: 'vip',
    quantity: 2,
    terms: 'Non-refundable. ID proof required at entry.',
    transferable: true,
    refundable: false,
    status: 'available',
    verificationStatus: 'approved',
    views: 245,
    wishlistCount: 18,
    images: [
      { url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80', publicId: 'coldplay_concert_1' }
    ],
  },
  {
    title: 'Mumbai to Delhi Flight - Business Class',
    description: 'Business class ticket on Air India flight from Mumbai to Delhi. Includes lounge access and priority boarding.',
    type: 'flight',
    category: 'travel',
    originalPrice: 25000,
    resalePrice: 18000,
    currency: 'INR',
    eventName: 'Air India AI-101',
    eventDate: new Date('2026-12-20T08:30:00'),
    eventTime: '8:30 AM',
    fromLocation: 'Mumbai (BOM)',
    toLocation: 'Delhi (DEL)',
    seatNumber: '2A',
    seatClass: 'business',
    quantity: 1,
    terms: 'Name change allowed with fee. Date change possible.',
    transferable: true,
    refundable: true,
    status: 'available',
    verificationStatus: 'approved',
    views: 189,
    wishlistCount: 12,
    images: [
      { url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80', publicId: 'flight_business_1' }
    ],
  },
  {
    title: 'IPL 2026 Final - CSK vs MI Premium Seats',
    description: 'Premium stand tickets for IPL 2026 Final between Chennai Super Kings and Mumbai Indians at Wankhede Stadium.',
    type: 'sports',
    category: 'sports',
    originalPrice: 8000,
    resalePrice: 6500,
    currency: 'INR',
    eventName: 'IPL 2026 Final - CSK vs MI',
    eventDate: new Date('2026-05-30T19:30:00'),
    eventTime: '7:30 PM',
    venue: 'Wankhede Stadium, Mumbai',
    seatNumber: 'Block C, Row 15, Seats 23-24',
    seatClass: 'premium',
    quantity: 2,
    terms: 'Physical ticket pickup required. ID mandatory.',
    transferable: true,
    refundable: false,
    status: 'available',
    verificationStatus: 'approved',
    views: 567,
    wishlistCount: 45,
    images: [
      { url: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80', publicId: 'ipl_cricket_1' }
    ],
  },
  {
    title: 'Avengers: Secret Wars - IMAX 3D Premiere',
    description: 'Opening day IMAX 3D tickets for Avengers: Secret Wars at PVR Phoenix, Mumbai. Best seats in the house!',
    type: 'movie',
    category: 'entertainment',
    originalPrice: 1200,
    resalePrice: 900,
    currency: 'INR',
    eventName: 'Avengers: Secret Wars',
    eventDate: new Date('2026-12-25T19:00:00'),
    eventTime: '7:00 PM',
    venue: 'PVR Phoenix, Lower Parel, Mumbai',
    seatNumber: 'J-12, J-13, J-14',
    seatClass: 'premium',
    quantity: 3,
    terms: 'No refunds. Show timing strictly enforced.',
    transferable: true,
    refundable: false,
    status: 'available',
    verificationStatus: 'approved',
    views: 423,
    wishlistCount: 32,
    images: [
      { url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80', publicId: 'avengers_movie_1' }
    ],
  },
  {
    title: 'Ed Sheeran Bangalore Concert - Gold Circle',
    description: 'Gold Circle standing tickets for Ed Sheeran Mathematics Tour in Bangalore. Close to stage experience!',
    type: 'concert',
    category: 'entertainment',
    originalPrice: 8000,
    resalePrice: 5500,
    currency: 'INR',
    eventName: 'Ed Sheeran Mathematics Tour',
    eventDate: new Date('2026-02-14T18:00:00'),
    eventTime: '6:00 PM',
    venue: 'Bangalore Palace Grounds',
    seatNumber: 'Gold Circle - General Standing',
    seatClass: 'general',
    quantity: 2,
    terms: 'Early entry included. No professional cameras allowed.',
    transferable: true,
    refundable: false,
    status: 'available',
    verificationStatus: 'approved',
    views: 312,
    wishlistCount: 28,
    images: [
      { url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80', publicId: 'edsheeran_concert_1' }
    ],
  },
  {
    title: 'Bangalore to Goa Bus - Sleeper AC',
    description: 'Volvo Sleeper AC bus ticket from Bangalore to Goa. Comfortable overnight journey with dinner included.',
    type: 'bus',
    category: 'travel',
    originalPrice: 2500,
    resalePrice: 1800,
    currency: 'INR',
    eventName: 'VRL Travels - Bangalore to Goa',
    eventDate: new Date('2026-12-28T21:00:00'),
    eventTime: '9:00 PM',
    fromLocation: 'Bangalore',
    toLocation: 'Goa',
    seatNumber: 'Lower Deck - 5A',
    seatClass: 'business',
    quantity: 1,
    terms: 'Boarding pass required. 30 mins early arrival.',
    transferable: true,
    refundable: true,
    status: 'available',
    verificationStatus: 'approved',
    views: 156,
    wishlistCount: 8,
    images: [
      { url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80', publicId: 'bus_travel_1' }
    ],
  },
  {
    title: 'FIFA World Cup 2026 - India vs Argentina',
    description: 'Group stage match tickets for FIFA World Cup 2026. Witness Messi\'s last World Cup appearance!',
    type: 'sports',
    category: 'sports',
    originalPrice: 45000,
    resalePrice: 38000,
    currency: 'INR',
    eventName: 'FIFA World Cup 2026 - Group Stage',
    eventDate: new Date('2026-06-20T15:00:00'),
    eventTime: '3:00 PM',
    venue: 'MetLife Stadium, New York',
    seatNumber: 'Section 112, Row 20',
    seatClass: 'general',
    quantity: 2,
    terms: 'International event. Passport required.',
    transferable: true,
    refundable: false,
    status: 'available',
    verificationStatus: 'approved',
    views: 892,
    wishlistCount: 67,
    images: [
      { url: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&q=80', publicId: 'fifa_worldcup_1' }
    ],
  },
  {
    title: 'Comic Con Mumbai 2026 - Weekend Pass',
    description: 'Full weekend pass for Comic Con Mumbai 2026. Meet celebrities, cosplay, and exclusive merchandise.',
    type: 'event',
    category: 'entertainment',
    originalPrice: 3500,
    resalePrice: 2800,
    currency: 'INR',
    eventName: 'Comic Con Mumbai 2026',
    eventDate: new Date('2026-02-20T10:00:00'),
    eventTime: '10:00 AM',
    venue: 'Bombay Exhibition Centre',
    seatNumber: 'Weekend Pass - General Entry',
    seatClass: 'general',
    quantity: 2,
    terms: 'Valid for all 3 days. Wristband provided at entry.',
    transferable: true,
    refundable: false,
    status: 'available',
    verificationStatus: 'approved',
    views: 234,
    wishlistCount: 19,
    images: [
      { url: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&q=80', publicId: 'comiccon_1' }
    ],
  },
  {
    title: 'Diljit Dosanjh Concert - Mumbai',
    description: 'Standing tickets for Diljit Dosanjh\'s Born to Shine World Tour in Mumbai. High energy Punjabi music night!',
    type: 'concert',
    category: 'entertainment',
    originalPrice: 5000,
    resalePrice: 3500,
    currency: 'INR',
    eventName: 'Diljit Dosanjh Born to Shine Tour',
    eventDate: new Date('2026-01-25T19:00:00'),
    eventTime: '7:00 PM',
    venue: 'Jio World Garden, Mumbai',
    seatNumber: 'Standing - Zone B',
    seatClass: 'general',
    quantity: 4,
    terms: 'Standing only. Arrive early for better spot.',
    transferable: true,
    refundable: false,
    status: 'sold',
    verificationStatus: 'approved',
    views: 678,
    wishlistCount: 0,
    images: [
      { url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80', publicId: 'diljit_concert_1' }
    ],
  },
  {
    title: 'Delhi to Mumbai Flight - Economy',
    description: 'SpiceJet economy ticket from Delhi to Mumbai. Flexible date changes allowed.',
    type: 'flight',
    category: 'travel',
    originalPrice: 8000,
    resalePrice: 5500,
    currency: 'INR',
    eventName: 'SpiceJet SG-154',
    eventDate: new Date('2026-12-22T14:00:00'),
    eventTime: '2:00 PM',
    fromLocation: 'Delhi (DEL)',
    toLocation: 'Mumbai (BOM)',
    seatNumber: '18F',
    seatClass: 'economy',
    quantity: 1,
    terms: 'Date change allowed with fee. Meal included.',
    transferable: true,
    refundable: true,
    status: 'available',
    verificationStatus: 'approved',
    views: 145,
    wishlistCount: 6,
    images: [
      { url: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=800&q=80', publicId: 'flight_economy_1' }
    ],
  },
];

  try {
    if (isManual) {
      console.log('Connecting to MongoDB (Manual Seed)...');
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ticketbazar', {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('Connected to MongoDB');
    }

    // Check if database is empty BEFORE touching anything
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('⚠️ Database already contains user data.');
      if (isManual) {
        console.log('Manual seeding skipped to prevent duplicate data.');
        console.log('If you want to re-seed, drop the database manually.');
      } else {
        console.log('Auto-seeding skipped. Database not empty.');
      }
      return; // Abort seeding completely!
    }

    // Database is confirmed empty, proceed with demo initialization
    console.log('Database is empty. Populating initial demo data...');


    // Create users
    console.log('Creating demo users...');
    const createdUsers = [];
    for (const userData of demoUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`Created user: ${user.name} (${user.email})`);
    }

    // Get seller users
    const sellers = createdUsers.filter(u => u.role === 'seller' || u.role === 'admin');
    const buyers = createdUsers.filter(u => u.role === 'user');

    // Create tickets
    console.log('Creating demo tickets...');
    const createdTickets = [];
    for (let i = 0; i < demoTickets.length; i++) {
      const ticketData = demoTickets[i];
      const seller = sellers[i % sellers.length];
      
      const ticket = await Ticket.create({
        ...ticketData,
        seller: seller._id,
        sellerName: seller.name,
        listingExpiresAt: new Date(ticketData.eventDate.getTime() - 24 * 60 * 60 * 1000), // 1 day before event
      });
      createdTickets.push(ticket);
      console.log(`Created ticket: ${ticket.title}`);
    }

    // Create some orders
    console.log('Creating demo orders...');
    const availableTickets = createdTickets.filter(t => t.status === 'available');
    
    // Helper function to generate order number
    const generateOrderNumber = () => {
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const random = Math.floor(10000 + Math.random() * 90000);
      return `TB-${dateStr}-${random}`;
    };
    
    // Create a completed order
    if (availableTickets.length > 0 && buyers.length > 0) {
      const ticket = availableTickets[0];
      const buyer = buyers[0];
      const platformFee = Math.round(ticket.resalePrice * 0.05); // 5% platform fee
      const sellerAmount = ticket.resalePrice - platformFee;
      
      const order = await Order.create({
        orderNumber: generateOrderNumber(),
        ticket: ticket._id,
        buyer: buyer._id,
        seller: ticket.seller,
        amount: ticket.resalePrice,
        platformFee: platformFee,
        sellerAmount: sellerAmount,
        currency: 'INR',
        payment: {
          razorpayOrderId: `order_${Date.now()}`,
          razorpayPaymentId: `pay_${Date.now()}`,
          razorpaySignature: 'demo_signature',
          status: 'completed',
          paidAt: new Date(),
        },
        escrowStatus: 'released',
        status: 'completed',
        transferStatus: 'completed',
        confirmedAt: new Date(),
        completedAt: new Date(),
        escrowReleasedAt: new Date(),
      });
      
      // Update ticket status
      ticket.status = 'sold';
      ticket.buyer = buyer._id;
      ticket.soldAt = new Date();
      ticket.soldPrice = ticket.resalePrice;
      await ticket.save();
      
      console.log(`Created order: ${order.orderNumber} (completed)`);
    }

    // Create a pending order
    if (availableTickets.length > 1 && buyers.length > 1) {
      const ticket = availableTickets[1];
      const buyer = buyers[1];
      const platformFee = Math.round(ticket.resalePrice * 0.05);
      const sellerAmount = ticket.resalePrice - platformFee;
      
      const order = await Order.create({
        orderNumber: generateOrderNumber(),
        ticket: ticket._id,
        buyer: buyer._id,
        seller: ticket.seller,
        amount: ticket.resalePrice,
        platformFee: platformFee,
        sellerAmount: sellerAmount,
        currency: 'INR',
        payment: {
          razorpayOrderId: `order_${Date.now()}_pending`,
          status: 'pending',
        },
        escrowStatus: 'pending',
        status: 'pending',
        transferStatus: 'pending',
      });
      
      console.log(`Created order: ${order.orderNumber} (pending)`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\nDemo Login Credentials:');
    console.log('------------------------');
    demoUsers.forEach(user => {
      console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    if (isManual) {
      await mongoose.disconnect();
      console.log('\nDisconnected from MongoDB');
    }
  }
};

// Check if file is being run directly via node seed.js
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase(true).then(() => process.exit(0)).catch(() => process.exit(1));
}
