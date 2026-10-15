# Phase-Wise Development and Implementation Report
## Vektor Rentals — Vehicle Rental Management System

---

### Development Phase 1: Environment, Database & Linear Data Structures
- **Project Scaffold:** Initialized React TypeScript frontend with Vite and Node.js Express backend.
- **MySQL 8.0 Architecture:** Designed normalized schema (`database/schema.sql`) and realistic Indian dataset (`database/seed.sql`) across 15 tables.
- **Linear Data Structures:**
  - `LinkedList.ts`: Custom Singly Linked List with head/tail insertion, deletion, and node visualization.
  - `Stack.ts`: Linked-list backed stack tracking recent operations (LIFO).
  - `Queue.ts`: Linked-list backed queue managing customer waitlists (FIFO).
  - Stack-based expression evaluator for arithmetic rental pricing.
- **Verification:** Database seeded with 18 vehicles, 10 customers, 5 hubs; auth tested and confirmed.

---

### Development Phase 2: Hierarchical and Graph Structures
- **Binary Tree (`BinaryTree.ts`):** Category hierarchy with Preorder, Inorder, and Postorder traversals.
- **Binary Search Tree (`BinaryTree.ts`):** Key-indexed vehicle lookup with logarithmic search complexity.
- **Branch Graph (`Graph.ts`):** Adjacency list representation of 5 Bengaluru hubs and 16 bidirectional routes.
- **Breadth-First Search (BFS):** Graph traversal level-by-level powered by the custom `Queue` class.
- **Verification:** Traversal orders and step-by-step queue operations verified.

---

### Development Phase 3: Searching and Sorting Algorithms
- **Linear Search (`searching.ts`):** Sequential vehicle lookup with comparison tracking in $O(n)$ time.
- **Binary Search (`searching.ts`):** Logarithmic lookup over sorted vehicle keys in $O(\log n)$ time.
- **Merge Sort (`mergeSort.ts`):** Built from scratch without built-in sorting. Integrated into the vehicle browsing interface for daily tariff sorting.
- **Verification:** Unit tests confirmed exact comparisons and ordering.

---

### Development Phase 4: Algorithmic Problem Solving & System Polish
- **Greedy Recommendation (`greedyRecommendation.ts`):** Multi-constraint vehicle matching prioritizing customer savings.
- **Customer Portal:** 10 responsive pages (Home, Browse, Details, Booking, Confirmation, My Bookings, History, Profile, Auth, Help).
- **Admin Portal:** 10 operational modules (Dashboard, Fleet, Customers, Bookings, Rentals, Hubs, Maintenance, Invoices, Settings, DSA Lab).
- **Interactive DSA Lab:** 4-tab dashboard suite with live execution, node visualizations, and complexity proofs.
- **Verification:** Automated test suite (12/12 passing), build test passed.
