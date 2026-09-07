# 🎫 Ticket Bazar

**Ticket Bazar** is a peer-to-peer (P2P) ticket resale marketplace and event discovery platform built with **React 18, Vite, Tailwind CSS, Express, MongoDB, and Socket.IO**. It features an **escrow-based buyer protection system**, **real-time chat with price negotiations**, and **multi-role management** (Buyer, Seller, Admin).

---

## 🚀 Key Features

- **P2P Ticket Marketplace**: Buy and sell verified tickets across Concerts, Sports, Movies, Travel (Flights/Buses), and Workshops.
- **Escrow & Buyer Protection**: Payments are held in escrow (`Pending` ➔ `Held` ➔ `Released`) until the buyer receives and verifies tickets.
- **Real-Time Chat & Negotiation**: Direct real-time messaging powered by Socket.IO with privacy filters for sensitive contact info.
- **Multi-Role Portals**:
  - **Buyer**: Browse, filter, purchase, track orders, and chat with sellers.
  - **Seller**: List tickets, manage active sales, view earnings, and release tickets.
  - **Admin**: Oversee platform metrics, manage users, review listings, and handle escrow dispute resolutions.
- **Modern Responsive UI**: Dark glassmorphism design, Framer Motion transitions, Tailwind CSS, and interactive UI components.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS, Headless UI, Framer Motion, Zustand, Socket.IO Client, Lucide React, React Hot Toast.
- **Backend**: Node.js (ES Modules), Express.js, MongoDB / Mongoose, Socket.IO.
- **Security & Cloud**: JWT, Helmet, Express Rate Limit, Cloudinary (Ticket uploads), Nodemailer (Email verification & notifications).

---

## 📂 Project Structure

```text
TicketBazar/
├── config/              # Database, Cloudinary, and Mail configurations
├── controllers/         # Express API controllers (Auth, Tickets, Orders, Admin, Chat)
├── middleware/          # JWT auth, error handler, and Multer upload middleware
├── models/              # Mongoose data models (User, Ticket, Order, Chat, Message, etc.)
├── routes/              # Express API route declarations
├── socket/              # Real-time Socket.IO event handlers
├── src/                 # React frontend application
│   ├── components/      # Reusable UI components (Navbar, EscrowStepper, TicketCard, etc.)
│   ├── context/         # Zustand global stores (authStore, socketStore)
│   ├── pages/           # Application views (Home, BrowseTickets, TicketDetails, Dashboard, Admin)
│   └── utils/           # Frontend helper utilities and API client
├── utils/               # Backend utilities (cronJobs, email templates, privacyFilter)
├── archive/             # Archived legacy prototype files (PHP, Flask, static HTML)
├── server.js            # Express & Socket.IO server entry point
└── package.json         # Unified dependency & script configuration
```

---

## ⚡ Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local instance or MongoDB Atlas URI)

### 2. Environment Setup
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```
Fill in your MongoDB URI, JWT secret, and optional Cloudinary / Razorpay keys.

### 3. Install Dependencies
```bash
npm install
```

### 4. Seed Demo Data (Optional)
To populate sample tickets, users, and orders:
```bash
npm run seed
```

### 5. Running the Application
Run both frontend and backend concurrently:
```bash
npm run dev:all
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 🧪 Testing & Verification
- Run all automated function tests:
  ```bash
  npm run test:all
  ```
- Build frontend for production:
  ```bash
  npm run build
  ```