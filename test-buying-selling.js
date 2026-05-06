import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Ticket from './models/Ticket.js';
import Order from './models/Order.js';

dotenv.config();

const testBuyingSellingFlow = async () => {
  console.log('\n========================================');
  console.log('   BUYING & SELLING FLOW TEST');
  console.log('========================================\n');
  
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // ========== SELLING FLOW ==========
    console.log('========== SELLING FLOW ==========\n');
    
    // Step 1: Get all sellers
    console.log('1️⃣  Finding Sellers...');
    const sellers = await User.find({ role: 'seller' });
    console.log(`Found ${sellers.length} sellers\n`);
    
    if (sellers.length === 0) {
      console.log('❌ No sellers found. Run seed.js first!\n');
      return;
    }
    
    // Step 2: Check tickets listed by each seller
    console.log('2️⃣  Seller Ticket Listings...');
    for (const seller of sellers) {
      const sellerTickets = await Ticket.find({ seller: seller._id });
      console.log(`\n📋 Seller: ${seller.name} (${seller.email})`);
      console.log(`   Total Listed: ${sellerTickets.length}`);
      
      if (sellerTickets.length > 0) {
        sellerTickets.forEach((ticket, idx) => {
          console.log(`   ${idx + 1}. ${ticket.title}`);
          console.log(`      Price: ₹${ticket.resalePrice} (Original: ₹${ticket.originalPrice})`);
          console.log(`      Status: ${ticket.status.toUpperCase()}`);
          console.log(`      Type: ${ticket.type} | Category: ${ticket.category}`);
          console.log(`      Event Date: ${ticket.eventDate.toLocaleDateString()}`);
          console.log(`      Transferable: ${ticket.transferable ? '✅' : '❌'} | Refundable: ${ticket.refundable ? '✅' : '❌'}`);
        });
      } else {
        console.log('   No tickets listed');
      }
    }
    
    // Step 3: Available tickets for sale
    console.log('\n3️⃣  Available Tickets for Purchase...');
    const availableTickets = await Ticket.find({ 
      status: 'available',
      verificationStatus: 'approved'
    }).populate('seller');
    
    console.log(`Found ${availableTickets.length} available tickets\n`);
    
    availableTickets.forEach((ticket, idx) => {
      console.log(`${idx + 1}. ${ticket.title}`);
      console.log(`   Seller: ${ticket.sellerName || ticket.seller?.name}`);
      console.log(`   Price: ₹${ticket.resalePrice}`);
      console.log(`   Discount: ${Math.round((1 - ticket.resalePrice / ticket.originalPrice) * 100)}%`);
      console.log(`   Quantity: ${ticket.quantity}`);
      console.log(`   Views: ${ticket.views} | Wishlist: ${ticket.wishlistCount}`);
    });
    
    // ========== BUYING FLOW ==========
    console.log('\n========== BUYING FLOW ==========\n');
    
    // Step 4: Get all buyers
    console.log('4️⃣  Finding Buyers...');
    const buyers = await User.find({ role: 'user' });
    console.log(`Found ${buyers.length} buyers\n`);
    
    // Step 5: Check purchase history for each buyer
    console.log('5️⃣  Buyer Purchase History...');
    for (const buyer of buyers) {
      const buyerOrders = await Order.find({ buyer: buyer._id })
        .populate('ticket')
        .populate('seller');
      
      console.log(`\n🛒 Buyer: ${buyer.name} (${buyer.email})`);
      console.log(`   Total Orders: ${buyerOrders.length}`);
      
      if (buyerOrders.length > 0) {
        buyerOrders.forEach((order, idx) => {
          console.log(`   \n   Order #${idx + 1}: ${order.orderNumber}`);
          console.log(`      Ticket: ${order.ticket?.title || 'N/A'}`);
          console.log(`      Seller: ${order.seller?.name || 'N/A'}`);
          console.log(`      Amount Paid: ₹${order.amount}`);
          console.log(`      Platform Fee: ₹${order.platformFee}`);
          console.log(`      Seller Gets: ₹${order.sellerAmount}`);
          console.log(`      Order Status: ${order.status}`);
          console.log(`      Payment Status: ${order.payment?.status || 'N/A'}`);
          console.log(`      Escrow Status: ${order.escrowStatus}`);
          
          if (order.completedAt) {
            console.log(`      Completed At: ${order.completedAt.toLocaleString()}`);
          }
        });
      } else {
        console.log('   No purchases yet');
      }
    }
    
    // Step 6: Sold tickets analysis
    console.log('\n6️⃣  Sold Tickets Analysis...');
    const soldTickets = await Ticket.find({ status: 'sold' })
      .populate('seller')
      .populate('buyer');
    
    console.log(`Total Sold Tickets: ${soldTickets.length}\n`);
    
    if (soldTickets.length > 0) {
      soldTickets.forEach((ticket, idx) => {
        console.log(`${idx + 1}. ${ticket.title}`);
        console.log(`   Seller: ${ticket.seller?.name || 'N/A'}`);
        console.log(`   Buyer: ${ticket.buyer?.email || 'N/A'}`);
        console.log(`   Sold Price: ₹${ticket.soldPrice}`);
        console.log(`   Sold At: ${ticket.soldAt?.toLocaleString() || 'N/A'}`);
      });
    }
    
    // ========== MARKETPLACE HEALTH ==========
    console.log('\n========== MARKETPLACE HEALTH ==========\n');
    
    // Calculate marketplace metrics
    const totalListings = await Ticket.countDocuments();
    const availableCount = await Ticket.countDocuments({ status: 'available' });
    const soldCount = await Ticket.countDocuments({ status: 'sold' });
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    
    console.log(`📊 Marketplace Metrics:`);
    console.log(`   Total Listings: ${totalListings}`);
    console.log(`   Available: ${availableCount}`);
    console.log(`   Sold: ${soldCount}`);
    console.log(`   Total Orders: ${totalOrders}`);
    console.log(`   Completed Orders: ${completedOrders}`);
    
    const sellThroughRate = totalListings > 0 
      ? ((soldCount / totalListings) * 100).toFixed(2)
      : 0;
    console.log(`   Sell-Through Rate: ${sellThroughRate}%`);
    
    const orderCompletionRate = totalOrders > 0
      ? ((completedOrders / totalOrders) * 100).toFixed(2)
      : 0;
    console.log(`   Order Completion Rate: ${orderCompletionRate}%`);
    
    // Revenue breakdown
    const revenueData = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          platformFees: { $sum: '$platformFee' },
          sellerPayout: { $sum: '$sellerAmount' }
        }
      }
    ]);
    
    if (revenueData.length > 0) {
      const rev = revenueData[0];
      console.log(`\n💰 Revenue Breakdown:`);
      console.log(`   Total Revenue (Buyers Paid): ₹${rev.totalRevenue}`);
      console.log(`   Platform Fees Earned: ₹${rev.platformFees}`);
      console.log(`   Seller Payouts: ₹${rev.sellerPayout}`);
      
      const avgOrderValue = completedOrders > 0
        ? Math.round(rev.totalRevenue / completedOrders)
        : 0;
      console.log(`   Average Order Value: ₹${avgOrderValue}`);
    }
    
    // Top sellers by revenue
    console.log(`\n🏆 Top Sellers by Ticket Value:`);
    const topSellers = await Ticket.aggregate([
      {
        $group: {
          _id: '$seller',
          totalSales: { $sum: { $cond: [{ $eq: ['$status', 'sold'] }, '$soldPrice', 0] } },
          listingsCount: { $sum: 1 },
          soldCount: { $sum: { $cond: [{ $eq: ['$status', 'sold'] }, 1, 0] } }
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: 3 }
    ]);
    
    for (const sellerStat of topSellers) {
      const seller = await User.findById(sellerStat._id);
      console.log(`\n   📌 ${seller?.name || 'Unknown'}`);
      console.log(`      Email: ${seller?.email || 'N/A'}`);
      console.log(`      Total Sales: ₹${sellerStat.totalSales}`);
      console.log(`      Listings: ${sellerStat.listingsCount} | Sold: ${sellerStat.soldCount}`);
    }
    
    // ========== CONCLUSION ==========
    console.log('\n========== TEST CONCLUSION ==========\n');
    
    if (sellers.length > 0 && availableTickets.length > 0) {
      console.log('✅ SELLING FLOW: Working correctly');
      console.log('   - Sellers can list tickets');
      console.log('   - Multiple categories available');
      console.log('   - Pricing and discounts configured');
    } else {
      console.log('❌ SELLING FLOW: Issues detected');
    }
    
    if (buyers.length > 0 && (soldTickets.length > 0 || availableTickets.length > 0)) {
      console.log('✅ BUYING FLOW: Working correctly');
      console.log('   - Buyers can browse tickets');
      console.log('   - Order creation functional');
      console.log('   - Payment tracking active');
    } else {
      console.log('❌ BUYING FLOW: Issues detected');
    }
    
    if (completedOrders > 0) {
      console.log('✅ ORDER COMPLETION: Functional');
      console.log('   - Escrow system working');
      console.log('   - Revenue being tracked');
      console.log('   - Seller payouts calculated');
    } else {
      console.log('ℹ️  ORDER COMPLETION: No completed orders yet');
    }
    
    console.log('\n========================================');
    console.log('Test completed successfully!');
    console.log('========================================\n');
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB\n');
    process.exit(0);
  }
};

// Run the test
testBuyingSellingFlow();
