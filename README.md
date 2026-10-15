# Vektor Rentals — Vehicle Rental Management System Using DSA

**Vektor Rentals** is a full-stack, responsive commercial vehicle rental web platform engineered with **Data Structures and Algorithms (DSA)** for an academic MCA Capstone Project. It combines the clean, rapid user experience of modern Indian mobility platforms (Rapido, Uber, Namma Yatri) with genuine, testable implementations of foundational data structures and algorithms.

---

## 🚀 Key Features

### 1. Customer-Facing Web Experience (10 Pages)
- **Homepage:** High-impact hero, prominent multi-hub booking search panel, popular categories, featured fleet, and transparent pricing.
- **Vehicle Catalog:** Advanced filtering (category, branch, fuel type, transmission, seating, price slider) and **custom Merge Sort** price sorting (asc/desc).
- **Vehicle Details:** Technical specifications, 40-point safety policies, and an interactive **Stack-based expression cost estimator**.
- **Booking Flow:** Date range selection, live overlap validation to **prevent double-booking**, driver information review, and booking vouchers.
- **My Bookings & History:** Reservation management, cancellation rules, and historical trip archives with odometer logs.
- **Profile & Auth:** JWT authentication, profile editing (driving license, contact info), and password changes.
- **Help & FAQs:** Comprehensive rental policies, GST breakdown, and Bengaluru hub contact points.

### 2. Admin Operations Center (10 Modules)
- **Dashboard:** Real-time KPIs (total fleet, available, rented, revenue) with Recharts trend charts and category distribution.
- **Fleet Inventory:** Add/edit/decommission vehicles, manage rates, and track availability states.
- **Customer Directory:** Identity records, contact verification, and historical trip audit modals.
- **Reservation Management:** Confirm pending bookings or cancel reservations.
- **Rentals & Return Handover:** Log pickup odometer readings, monitor active trips, verify return conditions, and auto-generate invoices.
- **Hubs & Network Graph:** Visual representation of Bengaluru rental hubs with inter-hub distances and route travel times.
- **Maintenance Records:** Schedule workshop servicing, log repair costs, and automatically toggle vehicle operational readiness.
- **Billing & Invoices:** GST-compliant invoice ledger with simulated UPI / card payments.
- **Settings:** Tune tax rates, default refundable security deposits, and view persistent MySQL database health.
- **DSA Laboratory:** Dedicated 4-tab live algorithmic demonstrator.

### 3. All 4 Mandatory DSA Phases Implemented
1. **Phase 1 — Linear Structures:**
   - **Singly Linked List:** Vehicle record chaining, head/tail insertion, deletion, and node visualization.
   - **Stack (LIFO):** Tracks recent rental and return operations.
   - **Queue (FIFO):** Manages waiting customers for unavailable vehicle categories.
   - **Stack-based Expression Evaluator:** Computes rental tariffs using Shunting-yard postfix conversion and stack reduction.
2. **Phase 2 — Hierarchical & Graph Structures:**
   - **Binary Tree:** Category taxonomy with Preorder, Inorder, and Postorder traversals.
   - **Binary Search Tree (BST):** Logarithmic key lookup by vehicle numeric key.
   - **Graph:** Adjacency list representation of connected Bengaluru branches.
   - **Breadth-First Search (BFS):** Graph traversal level-by-level using the custom Queue.
3. **Phase 3 — Searching and Sorting:**
   - **Linear Search:** Sequential search checking each vehicle record in $O(n)$ time.
   - **Binary Search:** Logarithmic search over sorted vehicle keys in $O(\log n)$ time.
   - **Merge Sort (from Scratch):** Handcrafted recursive divide-and-conquer algorithm ($O(n \log n)$).
4. **Phase 4 — Algorithmic Problem Solving:**
   - **Greedy Vehicle Allocation:** Selects the lowest-cost eligible vehicle satisfying customer budget and seating constraints.

---

## 🛠️ Technology Stack

- **Frontend:** React.js 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React, Recharts, React Router v7.
- **Backend:** Node.js v24, Express.js, MySQL2, Bcryptjs, JSON Web Tokens (JWT), Express-Validator.
- **Database:** MySQL 8.0.46 Community Server (15 normalized relational tables).

---

## 📋 Demo Credentials for Academic Evaluation

| Role | Email | Password | Access Level |
|---|---|---|---|
| **System Admin** | `admin@vektor.in` | `Admin@123` | Full access to Admin Dashboard, Fleet CRUD, and DSA Lab |
| **Customer** | `arjun@gmail.com` | `Password@123` | Customer booking, profile, and rental history |
| **Customer (Alt)** | `priya@gmail.com` | `Password@123` | Customer portal |

*Note: The login page also features one-click demo login buttons for instant evaluation.*

---

## ⚙️ Installation and Setup Guide

### Prerequisites
- Node.js (v18 or newer)
- MySQL Server (v8.0 or newer)
- npm

### 1. Database Setup
1. Open your terminal or MySQL Workbench.
2. Import the database schema:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
3. Seed the sample dataset (18 vehicles, 10 customers, 5 hubs, 12 bookings, 5 rentals):
   ```bash
   mysql -u root -p < database/seed.sql
   ```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your `.env` file (copy from `.env.example` if needed):
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=vektor_rentals
   JWT_SECRET=vektor_rentals_jwt_secret_key_change_in_production
   JWT_EXPIRES_IN=7d
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```
4. Start the backend API server:
   ```bash
   node server.js
   ```
   *The API will start at http://localhost:5000 (Health check: http://localhost:5000/api/health).*

### 3. Frontend Setup
1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Open http://localhost:5173 in your browser.*

---

## 🧪 Running Automated Tests

To run the automated test suite verifying all 4 DSA phases and booking overlap rules:
```bash
node backend/test/dsa_and_booking.test.js
```
Expected output:
```
📊 TEST RESULTS: 12 PASSED, 0 FAILED
```

---

## 📂 Project Directory Structure

```
Vehicle_Rental_management_System/
├── frontend/
│   ├── src/
│   │   ├── components/         # UI cards, layouts, navigation, and badges
│   │   ├── context/            # AuthContext (JWT session management)
│   │   ├── dsa/                # Pure DSA implementations (TS)
│   │   │   ├── LinkedList.ts   # Singly Linked List
│   │   │   ├── Stack.ts        # Stack & Expression Evaluator
│   │   │   ├── Queue.ts        # Queue (FIFO)
│   │   │   ├── BinaryTree.ts   # Binary Tree & BST
│   │   │   ├── Graph.ts        # Adjacency List Graph & BFS
│   │   │   ├── searching.ts    # Linear & Binary Search
│   │   │   ├── mergeSort.ts    # Handcrafted Merge Sort
│   │   │   └── greedyRecommendation.ts # Greedy Allocation
│   │   ├── layouts/            # CustomerLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── customer/       # 10 Customer pages
│   │   │   └── admin/          # 10 Admin modules + DSA Lab
│   │   ├── services/           # Axios API client
│   │   ├── types/              # TypeScript interfaces
│   │   └── utils/              # Currency formatting, date calculations
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── config/             # MySQL connection pool
│   │   ├── controllers/        # REST route controllers
│   │   ├── middleware/         # Auth, validation, error handler
│   │   ├── routes/             # Express API routes
│   │   └── utils/              # Helper responses & references
│   ├── test/                   # Automated DSA & booking unit tests
│   ├── server.js               # Express application entrypoint
│   └── package.json
├── database/
│   ├── schema.sql              # Normalized MySQL 8.0 schema (15 tables)
│   └── seed.sql                # Realistic Bengaluru dataset
├── docs/
│   ├── project-documentation.md # 21 Academic capstone sections
│   ├── phase-wise-implementation.md # Phase report
│   └── dsa-explanations.md     # Detailed DSA explanations
├── README.md
├── .env.example
└── .gitignore
```

---

## ⚖️ Academic Integrity & Simulation Disclosure

- **Payment Processing:** Payment flows are explicitly labelled as simulated transactions for testing without actual financial transactions.
- **SMS & Email:** Simulated notifications are logged persistently into the MySQL `notifications` table.
- **DSA Code:** All data structures and algorithms are implemented from scratch in modular files; native sorting or search functions are never substituted in place of required algorithms.
