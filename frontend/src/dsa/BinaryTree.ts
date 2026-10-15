// ============================================================
// DSA Phase 2A/B - Binary Tree & Traversals
// Used for vehicle category hierarchy visualization
// ============================================================

export interface BTreeNode<T> {
  data: T;
  left: BTreeNode<T> | null;
  right: BTreeNode<T> | null;
  id: string;
}

export interface TraversalResult<T> {
  order: T[];
  steps: Array<{ node: T; action: string; path: string[] }>;
}

export class BinaryTree<T extends { name: string; id: string | number }> {
  root: BTreeNode<T> | null = null;

  private createNode(data: T): BTreeNode<T> {
    return { data, left: null, right: null, id: String(data.id) };
  }

  /** Insert level-by-level (BFS insertion for general binary tree) */
  insert(data: T): void {
    const newNode = this.createNode(data);
    if (!this.root) { this.root = newNode; return; }

    const queue: BTreeNode<T>[] = [this.root];
    while (queue.length) {
      const curr = queue.shift()!;
      if (!curr.left) { curr.left = newNode; return; }
      else queue.push(curr.left);
      if (!curr.right) { curr.right = newNode; return; }
      else queue.push(curr.right);
    }
  }

  /** Preorder: Root → Left → Right */
  preorder(node: BTreeNode<T> | null = this.root, path: string[] = []): TraversalResult<T> {
    const order: T[] = [];
    const steps: TraversalResult<T>['steps'] = [];

    const traverse = (n: BTreeNode<T> | null, p: string[]) => {
      if (!n) return;
      order.push(n.data);
      steps.push({ node: n.data, action: `Visit ${n.data.name} (Root)`, path: [...p, n.data.name] });
      traverse(n.left, [...p, n.data.name]);
      traverse(n.right, [...p, n.data.name]);
    };
    traverse(node, path);
    return { order, steps };
  }

  /** Inorder: Left → Root → Right */
  inorder(node: BTreeNode<T> | null = this.root, path: string[] = []): TraversalResult<T> {
    const order: T[] = [];
    const steps: TraversalResult<T>['steps'] = [];

    const traverse = (n: BTreeNode<T> | null, p: string[]) => {
      if (!n) return;
      traverse(n.left, [...p, n.data.name]);
      order.push(n.data);
      steps.push({ node: n.data, action: `Visit ${n.data.name} (Root)`, path: [...p, n.data.name] });
      traverse(n.right, [...p, n.data.name]);
    };
    traverse(node, path);
    return { order, steps };
  }

  /** Postorder: Left → Right → Root */
  postorder(node: BTreeNode<T> | null = this.root, path: string[] = []): TraversalResult<T> {
    const order: T[] = [];
    const steps: TraversalResult<T>['steps'] = [];

    const traverse = (n: BTreeNode<T> | null, p: string[]) => {
      if (!n) return;
      traverse(n.left, [...p, n.data.name]);
      traverse(n.right, [...p, n.data.name]);
      order.push(n.data);
      steps.push({ node: n.data, action: `Visit ${n.data.name} (Root)`, path: [...p, n.data.name] });
    };
    traverse(node, path);
    return { order, steps };
  }

  /** Get tree as nested structure for rendering */
  toJSON(): BTreeNode<T> | null { return this.root; }
}

// ============================================================
// DSA Phase 2C - Binary Search Tree (BST)
// Used for fast vehicle lookup by numeric key
// Time: Insert O(h), Search O(h), h = log n avg, n worst
// ============================================================

export interface BSTNode {
  key: number;
  vehicleId: string;
  name: string;
  left: BSTNode | null;
  right: BSTNode | null;
}

export interface BSTSearchResult {
  found: boolean;
  key: number;
  node: BSTNode | null;
  comparisons: number;
  path: number[];
}

export class BinarySearchTree {
  root: BSTNode | null = null;

  private createNode(key: number, vehicleId: string, name: string): BSTNode {
    return { key, vehicleId, name, left: null, right: null };
  }

  /** Insert — O(h) average O(log n) */
  insert(key: number, vehicleId: string, name: string): void {
    const newNode = this.createNode(key, vehicleId, name);
    if (!this.root) { this.root = newNode; return; }

    let current = this.root;
    while (true) {
      if (key < current.key) {
        if (!current.left) { current.left = newNode; return; }
        current = current.left;
      } else if (key > current.key) {
        if (!current.right) { current.right = newNode; return; }
        current = current.right;
      } else {
        return; // duplicate key — skip
      }
    }
  }

  /** Search — O(h) with comparison trace */
  search(key: number): BSTSearchResult {
    let current = this.root;
    let comparisons = 0;
    const path: number[] = [];

    while (current) {
      comparisons++;
      path.push(current.key);
      if (key === current.key) {
        return { found: true, key, node: current, comparisons, path };
      } else if (key < current.key) {
        current = current.left;
      } else {
        current = current.right;
      }
    }
    return { found: false, key, node: null, comparisons, path };
  }

  /** Inorder traversal — returns sorted array */
  inorderArray(): BSTNode[] {
    const result: BSTNode[] = [];
    const traverse = (node: BSTNode | null) => {
      if (!node) return;
      traverse(node.left);
      result.push(node);
      traverse(node.right);
    };
    traverse(this.root);
    return result;
  }

  /** Build BST from array of vehicles */
  static fromVehicles(vehicles: Array<{ vehicle_id: string; name: string; numeric_key?: number }>): BinarySearchTree {
    const bst = new BinarySearchTree();
    vehicles.forEach((v, i) => {
      // Extract numeric part from vehicle_id like "VK001" -> 1
      const key = v.numeric_key ?? (parseInt(v.vehicle_id.replace(/[^0-9]/g, '')) || i + 1);
      bst.insert(key, v.vehicle_id, v.name);
    });
    return bst;
  }
}
