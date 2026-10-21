# Vehicle Rental Management System Using Data Structures and Algorithms
## Comprehensive Academic Project Documentation (MCA Capstone)
**Platform Name:** Vektor Rentals  
**Author:** Master of Computer Applications (MCA) Project Team  
**Academic Year:** 2026  

---

## 1. Title
**Vehicle Rental Management System Using Data Structures and Algorithms (Vektor Rentals)**

---

## 2. Abstract
Modern mobility services like Uber, Rapido, and Namma Yatri require robust vehicle allocation, scheduling, search, and route mapping under strict business and consistency rules. Traditional academic management projects often reduce these systems to trivial CRUD databases. **Vektor Rentals** addresses this gap by bridging production full-stack engineering (React, Node.js, Express, MySQL 8.0) with authentic, foundational **Data Structures and Algorithms (DSA)**. The system implements a Singly Linked List for vehicle records, a custom Stack for recent LIFO operational logging, a Stack-based arithmetic expression evaluator for transparent rental pricing, a FIFO Queue for waitlisted customers, Binary Tree category traversals, a Binary Search Tree (BST) for logarithmic key lookups, an undirected weighted Graph representing Bengaluru rental hubs, a Breadth-First Search (BFS) graph traversal using the custom Queue, Linear and Binary Search routines, an in-house Merge Sort algorithm ($O(n \log n)$), and a Greedy Vehicle Allocation algorithm. All database queries use parameterized SQL in MySQL 8.0, and state changes persist across application restarts.

---

## 3. Introduction
Vehicle rental systems operate in dynamic urban markets where availability fluctuates hourly, customers have varying budgetary constraints, and logistical hubs must communicate efficiently. Vektor Rentals provides an end-to-end customer and administrative portal styled after modern Indian transportation applications. It couples a responsive customer booking engine with an administrative control center and a live, interactive **DSA Laboratory** that reveals the exact algorithms executing beneath the user interface.

---

## 4. Background
Transportation and fleet platforms manage thousands of concurrent requests. Behind the sleek interfaces of commercial ride-hailing and rental companies lie algorithmic engines handling route discovery, fleet sorting, and queue processing. In an academic computer science curriculum, students learn these algorithmic concepts theoretically; Vektor Rentals puts them into tangible practice by mapping each data structure and algorithm directly to a commercial rental operation.

---

## 5. Problem Statement
Commercial vehicle rental workflows suffer from several technical challenges:
1. **Double-Booking Vulnerability:** Naive systems check a static `status = 'Available'` flag rather than evaluating date-range intersections, allowing overlapping reservations.
2. **Opaque Pricing Calculations:** Customers face hidden fees without a clear computational breakdown of base tariffs, duration multipliers, and security deposits.
3. **Decoupled Academic Code:** Algorithmic demonstrations are frequently disconnected CLI scripts rather than integrated modules in a living web platform.
4. **Suboptimal Vehicle Discovery:** Without algorithmic sorting and greedy filtering, customers struggle to identify the most cost-effective vehicle fitting their exact seating and budget needs.

---

## 6. Objectives
1. Build a full-stack, responsive commercial-grade vehicle rental web application styled after Rapido, Uber, and Namma Yatri.
2. Implement four complete DSA phases in actual reusable JavaScript/TypeScript modules:
   - **Phase 1:** Singly Linked List, Stack (LIFO), Queue (FIFO), and Stack-based arithmetic expression evaluator.
   - **Phase 2:** Binary Tree (Preorder, Inorder, Postorder), Binary Search Tree (BST), and Branch Graph with Breadth-First Search (BFS).
   - **Phase 3:** Linear Search ($O(n)$), Binary Search ($O(\log n)$), and Merge Sort ($O(n \log n)$) from scratch.
   - **Phase 4:** Greedy Vehicle Allocation algorithm selecting the lowest-cost eligible vehicle.
3. Establish a normalized MySQL 8.0 database schema (15 tables) with referential integrity, indexes, and triggers preventing overlapping bookings.
4. Deliver an interactive **DSA Lab** within the Admin Portal allowing students and evaluators to trace execution steps, visualize nodes, and inspect time complexities.

---

## 7. Proposed System
Vektor Rentals consists of:
- **Customer Facing Application:** 10 responsive pages enabling vehicle browsing, live schedule selection, overlap validation, stack-based pricing estimates, customer registration, booking vouchers, and rental history.
- **Admin Operations Center:** 10 management modules covering fleet inventory CRUD, customer directory, booking confirmation, key handover dispatch, vehicle returns, hub graph management, maintenance logs, invoice ledger, and application settings.
- **Interactive DSA Lab:** A 4-tab laboratory rendering step-by-step visualizations of all data structures and algorithms using live database records.

---

## 8. System Workflow
```
Customer / Admin User
       │
       ▼
Input Validation (Client-Side & Express Middleware)
       │
       ▼
REST API Layer (Express.js on Node.js)
       │
       ▼
MySQL 8.0 Persistent Storage (Parameterized Queries)
       │
       ▼
DSA Modules (Linked List, Stack, Queue, BST, Graph, BFS, MergeSort, Greedy)
       │
       ▼
Business Logic (Overlap Prevention, Pricing Evaluation, Role Checks)
       │
       ▼
JSON API Response ──► React / Vite UI Render & DSA Trace Display
```

---

## 9. Module Description
1. **Authentication & Security:** JWT (HS256) bearer token authentication, bcrypt password hashing (cost factor 10), Role-Based Access Control (Admin, Manager, Agent, Customer).
2. **Fleet Management:** Vehicle registration, specifications, branch allocation, maintenance tracking, and soft deactivation.
3. **Booking Engine:** Validates date intervals, checks table intersections against active reservations, calculates duration in 24h cycles, and commits reservations.
4. **Rental & Handover:** Dispatches vehicle keys, logs pickup odometer readings and condition notes, tracks active trips, records vehicle returns, and generates tax invoices.
5. **Billing & Invoices:** Generates GST-compliant invoices (18% tax) with simulated payment processing (UPI, Card, NetBanking).
6. **Hub Network:** Manages Bengaluru hubs (MG Road, KIAL Airport, Whitefield, Electronic City, Indiranagar) and bidirectional graph edges.
7. **DSA Laboratory:** Visual, step-by-step algorithmic demonstrator with node diagrams and complexity proofs.

---

## 10. Database Design
Normalized relational schema comprising 15 tables in `vektor_rentals`:
- `roles` (Admin, Manager, Agent, Customer)
- `users` (Login credentials, password hashes, foreign key to roles)
- `customers` (Driving license, personal contact, address, city)
- `vehicle_categories` (Hatchback, Sedan, SUV, Motorcycle, Van, Electric)
- `branches` (Hub names, Bengaluru addresses, GPS coordinates)
- `branch_connections` (Weighted graph edges with distance in km and travel time)
- `vehicles` (Specs, rates in INR, seating, fuel, transmission, status)
- `bookings` (Date intervals, calculated tariffs, foreign keys to customer, vehicle, hubs)
- `rentals` (Odometer readings, vehicle condition notes, pickup/return times)
- `rental_history` (Historical archive of completed trips)
- `waiting_queue` (FIFO queue records for unavailable vehicle categories)
- `maintenance_records` (Service logs, workshop costs, scheduled dates)
- `invoices` (Subtotal, 18% GST tax amount, total amount, payment status)
- `payments` (Transaction IDs, simulated payment methods, timestamps)
- `notifications` (User alerts for booking confirmations and rental returns)

---

## 11. Data Structures and Algorithms Overview
| Phase | Data Structure / Algorithm | Application Context | Time Complexity | Space Complexity |
|---|---|---|---|---|
| 1A | Singly Linked List | Vehicle records storage & traversal | Insert Head: $O(1)$, Tail: $O(n)$, Search: $O(n)$ | $O(n)$ |
| 1B | Stack (Linked List based) | Recent rental & return operations (LIFO) | Push: $O(1)$, Pop: $O(1)$, Peek: $O(1)$ | $O(n)$ |
| 1C | Queue (Linked List based) | Customer waitlist for unavailable vehicles (FIFO) | Enqueue: $O(1)$, Dequeue: $O(1)$, Peek: $O(1)$ | $O(n)$ |
| 1D | Stack-based Expression Evaluator | Arithmetic rental tariff calculation: $(d \times r) - disc + extra$ | $O(n)$ tokens | $O(n)$ |
| 2A | Binary Tree | Vehicle category hierarchy visualization | Traverse: $O(n)$ | $O(n)$ |
| 2B | Tree Traversals | Preorder, Inorder, Postorder traversal order | $O(n)$ | $O(h)$ |
| 2C | Binary Search Tree (BST) | Vehicle ID / numeric key logarithmic lookup | Search: $O(\log n)$ avg, $O(n)$ worst | $O(n)$ |
| 2D | Graph (Adjacency List) | Bengaluru rental hub network representation | Storage: $O(V + E)$ | $O(V + E)$ |
| 2E | Breadth-First Search (BFS) | Level-by-level hub reachability using Queue | $O(V + E)$ | $O(V)$ |
| 3A | Linear Search | Sequential vehicle search by model or ID | $O(n)$ | $O(1)$ |
| 3B | Binary Search | Logarithmic search over sorted vehicle keys | $O(\log n)$ | $O(1)$ |
| 3C | Merge Sort (from scratch) | Sorts fleet by daily tariff ascending/descending | $O(n \log n)$ all cases | $O(n)$ |
| 4A | Greedy Vehicle Allocation | Selects cheapest eligible vehicle satisfying constraints | $O(n \log n)$ | $O(n)$ |

---

## 12. Phase 1 Implementation
- **Singly Linked List (`LinkedList.ts`):** Defined generic `ListNode<T>` with `insertAtHead`, `insertAtTail`, `deleteById`, `searchById`, and `traverse`. Connected to vehicle inventory node visualization.
- **Stack (`Stack.ts`):** Defined LIFO stack backed by nodes with `push`, `pop`, `peek`, and `display`. Applied to track the most recent vehicle pickups and returns.
- **Queue (`Queue.ts`):** Defined FIFO queue backed by nodes with `enqueue`, `dequeue`, `peekFront`, and `display`. Applied to customer waitlists.
- **Stack-based Expression Evaluator:** Implements Shunting-Yard infix-to-postfix conversion and stack evaluation. Computes:
  $$\text{Total} = (\text{Days} \times \text{DailyRate}) - \text{Discount} + \text{Surcharges}$$

---

## 13. Phase 2 Implementation
- **Binary Tree (`BinaryTree.ts`):** Organizes categories with root, left, and right child nodes. Implements recursive `preorder`, `inorder`, and `postorder` traversals.
- **Binary Search Tree (`BinaryTree.ts`):** Maintains BST ordering property ($key_{left} < key_{root} < key_{right}$). Provides search tracing with comparison counts and path history.
- **Graph & BFS (`Graph.ts`):** Models Bengaluru hubs as vertices and routes as edges with km weights. `bfs(startId)` uses the custom `Queue` to visit nodes level-by-level, recording every enqueue and dequeue step.

---

## 14. Phase 3 Implementation
- **Linear Search (`searching.ts`):** Evaluates vehicles sequentially, recording each comparison step until a substring or exact match is identified. Expected complexity: $O(n)$.
- **Binary Search (`searching.ts`):** Operates on an array strictly sorted by numeric key or vehicle ID. Tracks `low`, `mid`, `high`, halving the search space each pass in $O(\log n)$ comparisons.
- **Merge Sort (`mergeSort.ts`):** Handcrafted recursive divide-and-conquer implementation. Explicitly records divide steps, sublists, and merge steps. Used across vehicle browsing and the DSA Lab.

---

## 15. Phase 4 Implementation
- **Greedy Vehicle Recommendation (`greedyRecommendation.ts`):**
  1. Filters fleet by `status == 'Available'`.
  2. Filters by seating capacity ($\ge \text{minSeats}$).
  3. Computes estimated rental tariff: $\text{Days} \times \text{daily\_rate}$.
  4. Filters candidates within customer budget.
  5. **Greedy Choice:** Sorts eligible vehicles by estimated cost ascending and selects the cheapest vehicle, maximizing leftover customer savings.

---

## 16. Testing
An automated test suite (`backend/test/dsa_and_booking.test.js`) verifies all 12 core algorithmic and business logic requirements:
- Linked list insertion, deletion, and traversal.
- Stack push/pop and LIFO ordering.
- Queue enqueue/dequeue and FIFO ordering.
- Stack-based expression calculation.
- Binary tree traversals (pre/in/post).
- BST insertion and logarithmic key retrieval.
- Graph construction and BFS queue trace.
- Linear and Binary search comparison limits.
- Merge sort correctness across tariffs.
- Greedy vehicle recommendation.
- Overlapping booking range conflict detection ($t_1 \le \text{return} \land t_2 \ge \text{pickup}$).

**Result:** 12 tests passed, 0 failed.

---

## 17. Expected Outcomes
1. Complete commercial-grade vehicle rental website with intuitive booking flows.
2. Full administrative dashboard with live KPI metrics and fleet dispatch tools.
3. Interactive DSA Lab demonstrating all 4 phases with visual traces.
4. Total protection against double-booking and data inconsistencies.

---

## 18. Tools and Technologies
- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React, Recharts, React Router v7.
- **Backend:** Node.js v24, Express.js, MySQL2, Bcryptjs, JSON Web Tokens (JWT), Express-Validator.
- **Database:** MySQL 8.0.46 Community Server.
- **Testing:** Node.js Assert Test Runner.

---

## 19. Limitations
1. Payment gateway integration is explicitly simulated for academic demonstration.
2. SMS and Email notifications are logged to the database and simulated on-screen.
3. GPS coordinates represent fixed hub addresses rather than real-time vehicle telematics.

---

## 20. Future Enhancements
1. Integration with Razorpay / Stripe for real card and UPI collection.
2. Real-time GPS vehicle tracking using WebSockets and Leaflet maps.
3. Dijkstra's Algorithm for inter-hub shortest-path vehicle relocation.
4. Mobile application build using React Native.

---

## 21. References
1. Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2009). *Introduction to Algorithms* (3rd ed.). MIT Press.
2. MySQL 8.0 Reference Manual: Generated Columns, Triggers, and Foreign Key Constraints.
3. Rapido, Uber, and Namma Yatri UX Design Architecture & Fleet Operations.
