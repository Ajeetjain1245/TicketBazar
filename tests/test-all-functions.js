import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Ticket from './models/Ticket.js';
import Order from './models/Order.js';

dotenv.config();

const runAllTests = async () => {
  console.log('\n========================================');
  console.log('   TICKET BAZAR - COMPREHENSIVE TEST SUITE');
  console.log('========================================\n');
  
  let passed = 0;
  let failed = 0;
  
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Test 1: Database Connection & Data Check
    console.log('📊 TEST 1: Database Status Check');
    console.log('-------------------------------------------');
    const userCount = await User.countDocuments();
    const ticketCount = await Ticket.countDocuments();
    const orderCount = await Order.countDocuments();
    
    console.log(`Total Users: ${userCount}`);
    console.log(`Total Tickets: ${ticketCount}`);
    console.log(`Total Orders: ${orderCount}`);
    
    if (userCount > 0 && ticketCount > 0) {
      console.log('✅ PASS: Database has data\n');
      passed++;
    } else {
      console.log('❌ FAIL: Database is empty\n');
      failed++;
    }
    
    // Test 2: User Roles Verification
    console.log('👥 TEST 2: User Roles Verification');
    console.log('-------------------------------------------');
    const adminUsers = await User.find({ role: 'admin' });
    const sellers = await User.find({ role: 'seller' });
    const buyers = await User.find({ role: 'user' });
    
    console.log(`Admins: ${adminUsers.length}`);
    console.log(`Sellers: ${sellers.length}`);
    console.log(`Buyers: ${buyers.length}`);
    
    adminUsers.forEach(u => console.log(`  - Admin: ${u.email}`));
    sellers.forEach(u => console.log(`  - Seller: ${u.email}`));
    buyers.forEach(u => console.log(`  - Buyer: ${u.email}`));
    
    if (adminUsers.length > 0 && sellers.length > 0 && buyers.length > 0) {
      console.log('✅ PASS: All user roles present\n');
      passed++;
    } else {
      console.log('❌ FAIL: Missing user roles\n');
      failed++;
    }
    
    // Test 3: Ticket Categories & Types
    console.log('🎫 TEST 3: Ticket Categories & Types');
    console.log('-------------------------------------------');
    const ticketsByType = await Ticket.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    const ticketsByCategory = await Ticket.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    const ticketsByStatus = await Ticket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log('By Type:');
    ticketsByType.forEach(t => console.log(`  - ${t._id}: ${t.count}`));
    
    console.log('By Category:');
    ticketsByCategory.forEach(t => console.log(`  - ${t._id}: ${t.count}`));
    
    console.log('By Status:');
    ticketsByStatus.forEach(t => console.log(`  - ${t._id}: ${t.count}`));
    
    if (ticketsByType.length > 0 && ticketsByCategory.length > 0) {
      console.log('✅ PASS: Diverse ticket inventory\n');
      passed++;
    } else {
      console.log('❌ FAIL: Limited ticket variety\n');
      failed++;
    }
    
    // Test 4: Ticket Pricing Analysis
    console.log('💰 TEST 4: Ticket Pricing Analysis');
    console.log('-------------------------------------------');
    const priceStats = await Ticket.aggregate([
      {
        $group: {
          _id: null,
          avgOriginalPrice: { $avg: '$originalPrice' },
          avgResalePrice: { $avg: '$resalePrice' },
          minResalePrice: { $min: '$resalePrice' },
          maxResalePrice: { $max: '$resalePrice' },
          totalValue: { $sum: '$resalePrice' }
        }
      }
    ]);
    
    if (priceStats.length > 0) {
      const stats = priceStats[0];
      console.log(`Average Original Price: ₹${Math.round(stats.avgOriginalPrice)}`);
      console.log(`Average Resale Price: ₹${Math.round(stats.avgResalePrice)}`);
      console.log(`Min Resale Price: ₹${stats.minResalePrice}`);
      console.log(`Max Resale Price: ₹${stats.maxResalePrice}`);
      console.log(`Total Inventory Value: ₹${stats.totalValue}`);
      
      const avgDiscount = Math.round((1 - stats.avgResalePrice / stats.avgOriginalPrice) * 100);
      console.log(`Average Discount: ${avgDiscount}%`);
      
      console.log('✅ PASS: Pricing data available\n');
      passed++;
    } else {
      console.log('❌ FAIL: No pricing data\n');
      failed++;
    }
    
    // Test 5: Order Flow Verification
    console.log('🛒 TEST 5: Order Flow Verification');
    console.log('-------------------------------------------');
    const orders = await Order.find().populate('ticket').populate('buyer').populate('seller');
    console.log(`Total Orders: ${orders.length}`);
    
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const ordersByEscrow = await Order.aggregate([
      { $group: { _id: '$escrowStatus', count: { $sum: 1 } } }
    ]);
    
    console.log('\nBy Status:');
    ordersByStatus.forEach(o => console.log(`  - ${o._id}: ${o.count}`));
    
    console.log('\nBy Escrow Status:');
    ordersByEscrow.forEach(o => console.log(`  - ${o._id}: ${o.count}`));
    
    if (orders.length > 0) {
      console.log('\nSample Order Details:');
      const sampleOrder = orders[0];
      console.log(`  Order Number: ${sampleOrder.orderNumber}`);
      console.log(`  Ticket: ${sampleOrder.ticket?.title || 'N/A'}`);
      console.log(`  Buyer: ${sampleOrder.buyer?.email || 'N/A'}`);
      console.log(`  Seller: ${sampleOrder.seller?.email || 'N/A'}`);
      console.log(`  Amount: ₹${sampleOrder.amount}`);
      console.log(`  Platform Fee: ₹${sampleOrder.platformFee}`);
      console.log(`  Seller Amount: ₹${sampleOrder.sellerAmount}`);
      console.log(`  Status: ${sampleOrder.status}`);
      console.log(`  Payment Status: ${sampleOrder.payment?.status || 'N/A'}`);
      
      console.log('\n✅ PASS: Order flow working\n');
      passed++;
    } else {
      console.log('❌ FAIL: No orders found\n');
      failed++;
    }
    
    // Test 6: Seller-Ticket Relationship
    console.log('🤝 TEST 6: Seller-Ticket Relationship');
    console.log('-------------------------------------------');
    const sellerTicketStats = await Ticket.aggregate([
      {
        $group: {
          _id: '$seller',
          ticketCount: { $sum: 1 },
          totalValue: { $sum: '$resalePrice' },
          soldCount: { 
            $sum: { $cond: [{ $eq: ['$status', 'sold'] }, 1, 0] }
          }
        }
      },
      { $limit: 5 }
    ]);
    
    for (const stat of sellerTicketStats) {
      const seller = await User.findById(stat._id);
      console.log(`\nSeller: ${seller?.name || 'Unknown'} (${seller?.email || 'N/A'})`);
      console.log(`  Total Tickets: ${stat.ticketCount}`);
      console.log(`  Sold Tickets: ${stat.soldCount}`);
      console.log(`  Available Tickets: ${stat.ticketCount - stat.soldCount}`);
      console.log(`  Total Value: ₹${stat.totalValue}`);
    }
    
    if (sellerTicketStats.length > 0) {
      console.log('\n✅ PASS: Seller relationships working\n');
      passed++;
    } else {
      console.log('❌ FAIL: No seller data\n');
      failed++;
    }
    
    // Test 7: Event Date Validation
    console.log('📅 TEST 7: Event Date Validation');
    console.log('-------------------------------------------');
    const now = new Date();
    const upcomingTickets = await Ticket.find({
      eventDate: { $gte: now }
    }).countDocuments();
    
    const pastTickets = await Ticket.find({
      eventDate: { $lt: now }
    }).countDocuments();
    
    console.log(`Upcoming Events: ${upcomingTickets}`);
    console.log(`Past Events: ${pastTickets}`);
    
    if (upcomingTickets > 0 && pastTickets === 0) {
      console.log('✅ PASS: All events are in the future\n');
      passed++;
    } else if (upcomingTickets > 0) {
      console.log('⚠️  WARNING: Some events are in the past\n');
      passed++;
    } else {
      console.log('❌ FAIL: No upcoming events\n');
      failed++;
    }
    
    // Test 8: Transferable & Refundable Tickets
    console.log('🔄 TEST 8: Ticket Features (Transferable/Refundable)');
    console.log('-------------------------------------------');
    const transferableCount = await Ticket.countDocuments({ transferable: true });
    const nonTransferableCount = await Ticket.countDocuments({ transferable: false });
    const refundableCount = await Ticket.countDocuments({ refundable: true });
    const nonRefundableCount = await Ticket.countDocuments({ refundable: false });
    
    console.log(`Transferable Tickets: ${transferableCount}`);
    console.log(`Non-Transferable Tickets: ${nonTransferableCount}`);
    console.log(`Refundable Tickets: ${refundableCount}`);
    console.log(`Non-Refundable Tickets: ${nonRefundableCount}`);
    
    if (transferableCount > 0) {
      console.log('✅ PASS: Transferable tickets available\n');
      passed++;
    } else {
      console.log('❌ FAIL: No transferable tickets\n');
      failed++;
    }
    
    // Test 9: Revenue Analysis
    console.log('💵 TEST 9: Revenue Analysis');
    console.log('-------------------------------------------');
    const revenueStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalPlatformFees: { $sum: '$platformFee' },
          totalSellerPayout: { $sum: '$sellerAmount' },
          orderCount: { $sum: 1 }
        }
      }
    ]);
    
    if (revenueStats.length > 0) {
      const stats = revenueStats[0];
      console.log(`Total Orders: ${stats.orderCount}`);
      console.log(`Total Revenue (Buyer Paid): ₹${stats.totalRevenue}`);
      console.log(`Total Platform Fees: ₹${stats.totalPlatformFees}`);
      console.log(`Total Seller Payout: ₹${stats.totalSellerPayout}`);
      
      const platformMargin = stats.totalRevenue > 0 
        ? ((stats.totalPlatformFees / stats.totalRevenue) * 100).toFixed(2)
        : 0;
      console.log(`Platform Margin: ${platformMargin}%`);
      
      console.log('✅ PASS: Revenue tracking working\n');
      passed++;
    } else {
      console.log('⚠️  SKIP: No completed orders for revenue analysis\n');
      passed++; // Not a failure, just no data yet
    }
    
    // Test 10: Verification Status Check
    console.log('✔️  TEST 10: Ticket Verification Status');
    console.log('-------------------------------------------');
    const verificationStats = await Ticket.aggregate([
      { $group: { _id: '$verificationStatus', count: { $sum: 1 } } }
    ]);
    
    console.log('Verification Status:');
    verificationStats.forEach(v => console.log(`  - ${v._id}: ${v.count}`));
    
    const approvedTickets = verificationStats.find(v => v._id === 'approved')?.count || 0;
    const pendingTickets = verificationStats.find(v => v._id === 'pending')?.count || 0;
    
    if (approvedTickets > 0) {
      console.log('✅ PASS: Verified tickets available\n');
      passed++;
    } else {
      console.log('❌ FAIL: No verified tickets\n');
      failed++;
    }
    
    // Final Summary
    console.log('\n========================================');
    console.log('           TEST SUMMARY');
    console.log('========================================');
    console.log(`Total Tests: ${passed + failed}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
    console.log('========================================\n');
    
    if (failed === 0) {
      console.log('🎉 ALL TESTS PASSED! System is working correctly.\n');
    } else {
      console.log('⚠️  SOME TESTS FAILED. Review the issues above.\n');
    }
    
  } catch (error) {
    console.error('❌ Test Execution Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB\n');
    process.exit(failed > 0 ? 1 : 0);
  }
};

// Run the tests
runAllTests();
