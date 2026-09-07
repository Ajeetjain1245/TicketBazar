# Ticket Bazar - Quick Testing Guide

## 🚀 How to Run Tests

### 1. Comprehensive Test Suite (All Functions)
```bash
cd ticket-bazar/backend
npm run test
```
**What it tests:**
- Database connection and data
- User roles (admin, seller, buyer)
- Ticket categories and types
- Pricing analysis
- Order flow verification
- Seller-ticket relationships
- Event date validation
- Transferable/refundable features
- Revenue tracking
- Verification status

---

### 2. Buying & Selling Flow Test
```bash
cd ticket-bazar/backend
npm run test:flow
```
**What it tests:**
- Complete selling flow (listings by sellers)
- Complete buying flow (purchase history)
- Available tickets marketplace
- Sold tickets analysis
- Marketplace health metrics
- Revenue breakdown
- Top sellers performance

---

### 3. Check Users in Database
```bash
cd ticket-bazar/backend
npm run check:users
```
**Shows:** All users with their emails

---

### 4. Check User Passwords (Debug)
```bash
cd ticket-bazar/backend
npm run check:pwd
```
**Shows:** Users with password hashes (for debugging)

---

### 5. Re-seed Database (Reset Data)
```bash
cd ticket-bazar/backend
npm run seed
```
**Warning:** This will DELETE all existing data and create fresh demo data!

---

## 📊 Current Test Results Summary

### ✅ ALL TESTS PASSED (10/10)

**Database Stats:**
- 6 Users (1 admin, 2 sellers, 3 buyers)
- 10 Tickets (6 available, 3 sold, 1 reserved)
- 4 Orders (1 completed, 1 confirmed, 2 pending)

**Marketplace Health:**
- Total Revenue: ₹32,700
- Platform Fees: ₹1,635 (5% margin)
- Sell-Through Rate: 30%
- Order Completion Rate: 25%

---

## 👥 Demo Users for Testing

### Admin Account
- **Email:** admin@ticketbazar.com
- **Password:** admin123
- **Can:** List tickets, manage platform, view all orders

### Seller Accounts
1. **John Seller**
   - Email: seller@ticketbazar.com
   - Password: seller123
   - Listings: 3 tickets

2. **Mike Johnson**
   - Email: mike@example.com
   - Password: password123
   - Listings: 3 tickets

### Buyer Accounts
1. **Jane Buyer**
   - Email: buyer@ticketbazar.com
   - Password: Buy@Ticket2024
   - Purchases: 1 completed order

2. **Sarah Williams**
   - Email: sarah@example.com
   - Password: password123
   - Purchases: 1 pending order

3. **Adish Jain**
   - Email: adishjain9009@gmail.com
   - Password: *Your actual password*
   - Purchases: 2 orders (1 confirmed, 1 pending)

---

## 🎫 Sample Tickets Available

### Entertainment
- Coldplay Mumbai Concert - VIP Pass (₹12,000) - **SOLD**
- Ed Sheeran Bangalore Concert (₹5,500)
- Avengers: Secret Wars IMAX (₹900) - **SOLD**
- Comic Con Mumbai 2026 (₹2,800)
- Diljit Dosanjh Concert (₹3,500) - **SOLD**

### Sports
- IPL 2026 Final - CSK vs MI (₹6,500)
- FIFA World Cup 2026 - India vs Argentina (₹38,000)

### Travel
- Mumbai to Delhi Flight - Business Class (₹18,000)
- Bangalore to Goa Bus - Sleeper AC (₹1,800)
- Delhi to Mumbai Flight - Economy (₹5,500)

---

## 💰 Revenue Model

**Platform Fee:** 5% of transaction amount

**Example Transaction:**
- Ticket Price: ₹12,000
- Platform Fee: ₹600 (5%)
- Seller Receives: ₹11,400

**Total Platform Revenue:** ₹1,635 from 4 orders

---

## 🔍 Common Issues & Solutions

### Issue: Some events show as past dates
**Status:** ⚠️ Known issue
**Impact:** Low - only affects sold/expired tickets
**Fix:** Update seed.js to use future dates for all tickets

### Issue: Order completion rate is 25%
**Status:** ℹ️ Normal for demo data
**Reason:** Most orders are still in pending/confirmed state
**Fix:** Complete the pending orders through the dashboard

### Issue: Git ownership warning on Windows
**Solution:** 
```bash
git config --global --add safe.directory 'D:/All Project'
```

---

## 📝 Test Files Created

1. **test-all-functions.js** - Comprehensive test suite (10 tests)
2. **test-buying-selling.js** - Buying & selling flow test
3. **check-users.js** - View all users
4. **check-users-pwd.js** - View users with passwords
5. **TEST_RESULTS.md** - Detailed test results
6. **TESTING_GUIDE.md** - This file

---

## 🎯 Next Steps for Testing

### Manual Testing Through Frontend:
1. **Login as Seller** → List a new ticket
2. **Login as Buyer** → Browse tickets → Purchase one
3. **Login as Admin** → Verify order → Release escrow
4. **Check Dashboard** → View My Orders / My Tickets

### Automated Testing:
- Run `npm run test` before making changes
- Run `npm run test:flow` after database modifications
- Run `npm run seed` to reset to clean state

---

## 📞 Quick Reference

**Database:** MongoDB Atlas (Cluster0)
**Connection String:** `mongodb+srv://adishjain9009:Adish12@cluster0.ednet5f.mongodb.net/ticketbazar`

**Backend Port:** 5001
**Frontend Port:** 5173 (Vite)

**API Base URL:** `http://localhost:5001/api`

---

**Last Updated:** March 26, 2026
**Test Status:** ✅ All Automated Tests Passing
