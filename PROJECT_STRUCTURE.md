# 📁 Vektor Rentals — Project Architecture & Directory Structure Guide

This document provides a clean, comprehensive map of the entire codebase, explaining each directory's role, architectural boundaries, and where specific features, algorithms, and components reside.

---

## 🏛️ High-Level Architectural Overview

The application follows a clean, decoupled **Full-Stack Client-Server & Data Architecture**:

```
Vehicle_Rental_management_System/
├── backend/               # Node.js + Express REST API Server
├── frontend/              # React 18 + Vite + TypeScript Client
├── database/              # MySQL Relational Schema, Triggers & Seed SQL
├── docs/                  # Academic Reports, Synopsis & DSA Lab Manuals
├── scripts/               # System Health Verification & Diagnostic Utilities
├── package.json           # Root workspace script coordinator
└── PROJECT_STRUCTURE.md   # Architectural & directory reference
```

---

## 📂 Detailed Folder-by-Folder Guide

### 1. `backend/` — Express Server & DSA Engine
The backend is structured into modular layers adhering to separation of concerns:

```
backend/
├── server.js              # Express app bootstrap, CORS, JSON limits, API router mounts
├── package.json           # Dependencies: mysql2, bcryptjs, jsonwebtoken, express, etc.
├── .env.example           # Database credentials, JWT secrets, port configuration
├── test/
│   └── dsa_and_booking.test.js  # 12 automated unit tests covering all 4 DSA phases + booking checks
└── src/
    ├── config/
    │   └── database.js    # MySQL connection pool with promise wrapper
    ├── controllers/       # HTTP Request & Response Handlers
    │   ├── authController.js        # JWT sign-in, registration, password hashing
    │   ├── bookingController.js     # Booking creation, status flow, overlap checks
    │   ├── branchController.js      # Hub branches and graph connections
    │   ├── customerController.js    # Customer profiles and rental records
    │   ├── dashboardController.js   # Analytics, fleet stats, revenue aggregation
    │   ├── dsaController.js         # API bridge delegating to backend/src/dsa/
    │   ├── invoiceController.js     # Billing, simulated UPI/Card payment
    │   ├── maintenanceController.js  # Fleet servicing logs
    │   ├── notificationController.js # Real-time user alerts
    │   ├── rentalController.js       # Vehicle pickup, return, odometer logging
    │   └── vehicleController.js      # Fleet inventory CRUD & availability engine
    ├── dsa/               # 🎯 PURE DSA ALGORITHM IMPLEMENTATIONS (Isolated from HTTP)
    │   ├── BinaryTree.js  # Phase 2A/2B Binary Tree (pre/in/postorder) & 2C BST by Key
    │   ├── Graph.js       # Phase 2D/2E Bengaluru Branch Graph & Queue-based BFS
    │   ├── Greedy.js      # Phase 4A Greedy Vehicle Allocator (min-cost greedy strategy)
    │   ├── LinkedList.js  # Phase 1A Singly Linked List (insert, delete, traverse)
    │   ├── MergeSort.js   # Phase 3C Custom Merge Sort O(n log n) by daily rental rate
    │   ├── Queue.js       # Phase 1C FIFO Waiting Queue using Linked List
    │   ├── Searching.js   # Phase 3A Linear Search O(n) & 3B Binary Search O(log n)
    │   ├── Stack.js       # Phase 1B LIFO Stack & 1D Shunting-Yard Expression Evaluator
    │   └── index.js       # Central export registry for all DSA classes & utilities
    ├── middleware/
    │   ├── auth.js        # JWT verification, optionalAuth, and requireRole guards
    │   ├── errorHandler.js # Centralized 500/400 exception handler
    │   └── validate.js    # Express-validator chains for bookings & customer forms
    ├── routes/            # REST API Route Declarations
    │   ├── authRoutes.js
    │   ├── bookingRoutes.js
    │   ├── branchRoutes.js
    │   ├── customerRoutes.js
    │   ├── dashboardRoutes.js
    │   ├── dsaRoutes.js
    │   ├── invoiceRoutes.js
    │   ├── maintenanceRoutes.js
    │   ├── notificationRoutes.js
    │   ├── rentalRoutes.js
    │   └── vehicleRoutes.js
    └── utils/
        ├── helpers.js     # Currency formatters, booking reference generators
        └── response.js    # Standardized JSON response envelope (success, error, paginated)
```

---

### 2. `frontend/` — React, TypeScript & Tailwind CSS Application
The frontend is structured by domain feature components, reusable UI primitives, DSA interactive labs, and dedicated customer/admin pages:

```
frontend/
├── index.html             # HTML5 entry with Inter font & viewport meta
├── vite.config.ts         # Vite configuration with React plugin & dev proxy
├── tsconfig.json          # TypeScript compiler rules
├── tailwind.config.js     # Design tokens (teal, navy, emerald, responsive breakpoints)
└── src/
    ├── App.tsx            # Main application layout, header, footer, toast provider
    ├── main.tsx           # React DOM root entry
    ├── routes.tsx         # Route configuration with role-based RouteGuard
    ├── types/
    │   └── index.ts       # Shared TypeScript interfaces (Vehicle, Booking, Customer, etc.)
    ├── utils/
    │   ├── formatters.ts  # Indian currency (INR), date formatting, license validators
    │   └── index.ts       # Re-export barrel
    ├── services/
    │   └── api.ts         # Centralized Axios client with JWT interceptors & typed API endpoints
    ├── context/
    │   └── AuthContext.tsx # Global authentication provider (user, token, login, logout)
    ├── hooks/             # Custom React Hooks
    │   ├── useDebounce.ts      # Debounce input for real-time search
    │   ├── useDocumentTitle.ts # Dynamic page titles
    │   └── index.ts            # Central hooks barrel
    ├── dsa/               # Frontend TypeScript DSA Classes (Client-side interactive execution)
    │   ├── BinaryTree.ts       # Phase 2 Trees & BST with comparisons
    │   ├── Graph.ts            # Phase 2 Bengaluru Graph & BFS trace
    │   ├── LinkedList.ts       # Phase 1 Singly Linked List
    │   ├── Queue.ts            # Phase 1 Waiting Queue
    │   ├── Stack.ts            # Phase 1 Operations Stack & Postfix Evaluator
    │   ├── searching.ts        # Phase 3 Linear vs. Binary search comparison
    │   ├── mergeSort.ts        # Phase 3 Merge Sort with divide & conquer pass logs
    │   └── greedyRecommendation.ts # Phase 4 Greedy allocation with step decisions
    ├── components/
    │   ├── common/        # Shared site-wide structural components
    │   │   ├── Navbar.tsx      # Responsive header with role-aware nav & active indicators
    │   │   ├── Footer.tsx      # Brand footer with links, locations & contacts
    │   │   └── RouteGuard.tsx  # Protects admin & customer authenticated routes
    │   ├── ui/            # 🎨 Reusable Design System Primitives
    │   │   ├── Badge.tsx          # Status tags (Available, Rented, Confirmed, etc.)
    │   │   ├── LoadingSpinner.tsx # Animated spinner with customizable size and label
    │   │   ├── EmptyState.tsx     # Clean empty message card with icon & CTA button
    │   │   ├── StatCard.tsx       # KPI metric card for admin dashboard
    │   │   ├── Modal.tsx          # Accessible dialog with backdrop and escape key support
    │   │   └── index.ts           # Central UI barrel export
    │   ├── booking/       # Booking Domain Components
    │   │   ├── BookingSummaryCard.tsx # Tariff, days, deposit, and total breakdown card
    │   │   └── index.ts
    │   ├── charts/        # Data Visualizations & Analytics
    │   │   ├── RevenueChart.tsx     # Monthly revenue bar chart (Recharts)
    │   │   ├── CategoryPieChart.tsx # Fleet category distribution donut chart (Recharts)
    │   │   └── index.ts
    │   └── dsa/           # 🧪 Modular Interactive DSA Laboratory Components
    │       ├── DSALabHeader.tsx        # Title banner & Phase 1-4 navigation tabs
    │       ├── Phase1LinearTab.tsx     # Linked List, Stack, Queue, Expression Evaluator
    │       ├── Phase2TreeGraphTab.tsx  # Binary Tree traversals, BST Key Search, Graph & BFS
    │       ├── Phase3SearchSortTab.tsx # Linear vs. Binary Search, Merge Sort trace
    │       ├── Phase4GreedyTab.tsx     # Greedy vehicle allocator with sliders & pseudocode
    │       └── index.ts                # Central DSA components barrel
    └── pages/
        ├── Home.tsx                   # Homepage with hero, prominent booking widget, featured cars
        ├── BrowseVehicles.tsx         # Fleet listing with filters and Merge Sort price ordering
        ├── VehicleDetails.tsx         # Vehicle specs, daily tariff, policies, booking CTA
        ├── BookingPage.tsx            # Multi-step reservation flow with real-time overlap validation
        ├── BookingConfirmation.tsx    # Confirmed booking reference voucher & print option
        ├── MyBookings.tsx             # Customer active & past reservations
        ├── RentalHistory.tsx          # Customer return logs and odometer records
        ├── CustomerProfile.tsx        # Customer contact details & driving license
        ├── LoginPage.tsx              # Quick login with 1-click Demo credentials
        ├── RegisterPage.tsx           # Customer onboarding registration form
        ├── HelpFaqPage.tsx            # FAQ & Customer support contact info
        └── admin/
            ├── AdminDashboard.tsx     # Fleet statistics, revenue metrics, Recharts graphs
            ├── AdminVehicles.tsx      # Vehicle fleet inventory management (Add, Edit, Delete)
            ├── AdminCustomers.tsx     # Registered customer directory
            ├── AdminBookings.tsx      # Reservation management & status approvals
            ├── AdminRentals.tsx       # Pickup dispatch, return check-in, odometer logs
            ├── AdminBranches.tsx      # Bengaluru hub branches & geographic connections
            ├── AdminMaintenance.tsx   # Vehicle servicing schedule & cost tracking
            ├── AdminInvoices.tsx      # Tax invoices & simulated payment handling
            └── AdminDSALab.tsx        # 🔬 Clean orchestrator for Interactive DSA Laboratory
```

---

### 3. `database/` — Relational MySQL Schema & Seed Data
```
database/
├── schema.sql  # 15 normalized tables, foreign keys, cascade rules, and overlap prevention triggers
└── seed.sql    # 18 Indian vehicles, 10 customers, 5 Bengaluru hubs, active rentals & invoices
```

---

### 4. `docs/` — Academic Project Deliverables & Manuals
```
docs/
├── PROJECT_SYNOPSIS.md   # MCA Capstone synopsis, objectives, system architecture, tech stack
└── DSA_LAB_MANUAL.md     # Comprehensive academic proofs, asymptotic complexities & algorithm traces
```

---

## 🚀 Running the Project

### Prerequisites
- **Node.js**: v18+ (tested on v24.11.0)
- **MySQL**: 8.0+ running on `localhost:3306`
- **Database initialized**:
  ```bash
  mysql -u root -p < database/schema.sql
  mysql -u root -p < database/seed.sql
  ```

### Verification & Health Check (1 Command)
From the project root:
```bash
npm run verify
```
This runs [`scripts/verify-all.js`](file:///d:/all%20project/Vehicle_Rental_management_System/scripts/verify-all.js), checking database connectivity, fleet counts, and executing all 12 backend DSA and booking test cases.

### Running Both Servers Concurrently
From the project root:
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`

Or run them individually:
```bash
npm run dev:backend   # Boots Express API on port 5000
npm run dev:frontend  # Boots Vite React on port 5173
```

### Pre-Configured Demo Credentials
| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@vektor.in` | `Admin@123` |
| **Customer** | `arjun@gmail.com` | `Password@123` |
