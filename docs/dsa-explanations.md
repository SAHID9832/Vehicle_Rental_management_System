# Data Structures and Algorithms (DSA) Explanations
## Student-Friendly Academic Guide — Vektor Rentals

---

### Phase 1: Linear Data Structures

#### 1A. Singly Linked List
- **Purpose in Vektor Rentals:** Stores vehicle records as dynamic, chained nodes. Unlike arrays, linked lists can insert or remove vehicle records at the head in $O(1)$ time without shifting elements in memory.
- **Node Anatomy:** Each `ListNode` contains `data` (vehicle object) and a `next` pointer pointing to the memory address of the subsequent node, terminating in `null`.
- **Operations:**
  - `insertAtHead(vehicle)`: Prepends a new vehicle node at the list start in $O(1)$ time.
  - `insertAtTail(vehicle)`: Traverses until `current.next == null` and attaches the new node in $O(n)$ time.
  - `deleteById(id)`: Relinks pointers to bypass and remove the matched node in $O(n)$ time.
- **Time Complexity:** Search: $O(n)$ | Insertion at Head: $O(1)$ | Insertion at Tail: $O(n)$ | Deletion: $O(n)$.
- **Space Complexity:** $O(n)$ for storing $n$ node pointers.

---

#### 1B. Stack Using Linked List (LIFO)
- **Purpose in Vektor Rentals:** Manages recent rental operations (pickups and returns). Because fleet operations require quick rollback or audit of the *most recent* action first, a **Last-In, First-Out (LIFO)** Stack is optimal.
- **Operations:**
  - `push(item)`: Inserts an operation at the top of the stack in $O(1)$ time.
  - `pop()`: Removes and returns the top operation in $O(1)$ time.
  - `peek()`: Inspects the current top operation without removing it in $O(1)$ time.
- **Time Complexity:** Push: $O(1)$ | Pop: $O(1)$ | Peek: $O(1)$.
- **Space Complexity:** $O(n)$.

---

#### 1C. Queue Using Linked List (FIFO)
- **Purpose in Vektor Rentals:** Manages the customer waitlist for vehicle categories that are currently fully booked. The customer who arrived first must be served first (**First-In, First-Out (FIFO)**).
- **Operations:**
  - `enqueue(customer)`: Adds the customer to the rear of the queue in $O(1)$ time.
  - `dequeue()`: Serves and removes the customer at the front in $O(1)$ time.
  - `peekFront()`: Checks which customer is next in line without removing them in $O(1)$ time.
- **Time Complexity:** Enqueue: $O(1)$ | Dequeue: $O(1)$ | Peek: $O(1)$.
- **Space Complexity:** $O(n)$.

---

#### 1D. Stack-Based Rental Cost Expression Evaluator
- **Purpose in Vektor Rentals:** Rental costs are computed as:
  $$\text{Rental Cost} = (\text{Rental Days} \times \text{Daily Rate}) - \text{Discount} + \text{Surcharges}$$
- **How It Works:**
  1. The infix expression `days * rate - discount + charges` is converted into Reverse Polish Notation (postfix) using Dijkstra's **Shunting-Yard algorithm**.
  2. The postfix string is scanned token-by-token using an evaluation stack:
     - When an operand (number) is seen, it is pushed onto the stack.
     - When an operator ($*, -, +$) is encountered, the top two operands are popped, evaluated, and the result is pushed back onto the stack.
  3. The final remaining number on the stack is the exact total rental tariff.
- **Time Complexity:** $O(n)$ where $n$ is the number of tokens in the arithmetic formula.
- **Space Complexity:** $O(n)$ for operator and operand stacks.

---

### Phase 2: Hierarchical and Graph Structures

#### 2A & 2B. Binary Tree & Traversals
- **Purpose in Vektor Rentals:** Organizes vehicle categories into an intuitive taxonomy:
  - Root: Fleet Root
  - Left Child: Sedans & Hatchbacks (Economy, Luxury)
  - Right Child: SUVs & Vans (Compact SUVs, 7-Seater MPVs)
- **Tree Traversals:**
  - **Preorder (Root → Left → Right):** Visits parent category before subcategories. Useful for serializing category trees.
  - **Inorder (Left → Root → Right):** Visits left subtree, root, then right subtree.
  - **Postorder (Left → Right → Root):** Visits subcategories before parent. Useful for bottom-up cost rollups.
- **Time Complexity:** $O(n)$ to visit all $n$ category nodes.

---

#### 2C. Binary Search Tree (BST)
- **Purpose in Vektor Rentals:** Enables fast vehicle lookup by numeric key or vehicle identifier.
- **BST Rule:** For every node $N$, all keys in $N$'s left subtree are strictly smaller than $key(N)$, and all keys in $N$'s right subtree are strictly greater than $key(N)$.
- **Search Process:**
  1. Start at the root node.
  2. If the target key matches the current node's key, return the vehicle.
  3. If target key is smaller, traverse to the left child.
  4. If target key is larger, traverse to the right child.
- **Time Complexity:** Average Case: $O(\log n)$ | Worst Case: $O(n)$ (when tree is unbalanced).

---

#### 2D & 2E. Graph of Rental Locations & Breadth-First Search (BFS)
- **Purpose in Vektor Rentals:** Represents connected rental branches across Bengaluru (MG Road, Kempegowda Airport, Indiranagar, Whitefield, Electronic City).
- **Representation:** **Adjacency List** where each hub vertex stores a list of neighboring hubs and route distance weights in kilometers.
- **BFS Traversal using Custom Queue:**
  1. Select a starting hub (e.g., MG Road, Node 1).
  2. Mark the starting hub as visited and enqueue it.
  3. While the queue is not empty:
     - Dequeue the front hub.
     - Inspect all adjacent neighbor hubs.
     - If a neighbor has not yet been visited, mark it visited and enqueue it.
  4. BFS visits all hubs level-by-level (all direct neighbors at distance 1, then distance 2, etc.).
- **Time Complexity:** $O(V + E)$ where $V$ is number of branches and $E$ is number of connecting routes.
- **Space Complexity:** $O(V)$ for the visited set and queue.

---

### Phase 3: Searching and Sorting

#### 3A. Linear Search
- **Purpose in Vektor Rentals:** Checks each vehicle record one-by-one to find a match by vehicle name or ID.
- **Time Complexity:** Best Case: $O(1)$ | Worst Case: $O(n)$ | Average Case: $O(n)$.
- **Usage:** Used when searching over unsorted or freshly filtered vehicle lists.

---

#### 3B. Binary Search
- **Purpose in Vektor Rentals:** Locates a vehicle record in logarithmic time over a strictly sorted array of numeric keys or IDs.
- **Time Complexity:** Best Case: $O(1)$ | Worst Case: $O(\log n)$ | Average Case: $O(\log n)$.
- **Constraint:** Binary Search is **never** applied to unsorted data; the array is sorted before execution.

---

#### 3C. Merge Sort (from Scratch)
- **Purpose in Vektor Rentals:** Sorts the vehicle catalog by daily rental price in ascending or descending order.
- **Divide and Conquer Steps:**
  1. **Divide:** Recursively divide the vehicle array in half until sublists of size 1 are reached.
  2. **Conquer:** Recursively sort each sublist.
  3. **Merge:** Combine two sorted sublists by comparing their elements one by one into a merged sorted list.
- **Time Complexity:** $O(n \log n)$ across Best, Average, and Worst cases.
- **Space Complexity:** $O(n)$ auxiliary space for merge sublists.
- **Academic Rigor:** Built from scratch without calling JavaScript's native `sort()`.

---

### Phase 4: Algorithmic Problem Solving

#### 4A. Greedy Vehicle Recommendation
- **Purpose in Vektor Rentals:** Recommends the cheapest vehicle that satisfies a customer's criteria (budget, seating capacity, rental days, preferred hub).
- **Greedy Strategy:**
  1. Filter out all vehicles with `status != 'Available'`.
  2. Filter by minimum required seating capacity.
  3. Calculate estimated rental cost: $\text{Rental Days} \times \text{daily\_rate}$.
  4. Exclude vehicles exceeding the customer's total budget.
  5. **Greedy Choice:** Sort remaining candidates by cost ascending and select the minimum-cost vehicle.
- **Time Complexity:** $O(n \log n)$ for sorting the candidate list.
- **Optimality Note:** The greedy choice guarantees the lowest cost option under the specified constraints, but is locally optimal rather than universally optimal for multi-objective fleet optimization.
