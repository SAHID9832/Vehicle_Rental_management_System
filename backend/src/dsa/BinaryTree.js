/**
 * Phase 2A/2B: Binary Tree (Category Hierarchy & Traversals)
 * Phase 2C: Binary Search Tree (BST) for Logarithmic Vehicle Key Lookups
 */

class TreeNode {
  constructor(key, value, data = {}) {
    this.key = key;
    this.value = value;
    this.data = data;
    this.left = null;
    this.right = null;
  }
}

class BinaryTree {
  constructor() {
    this.root = null;
  }

  insert(val) {
    const node = val instanceof TreeNode ? val : new TreeNode(val.id ?? val.key ?? val, val.name ?? val.value ?? val, val);
    if (!this.root) {
      this.root = node;
      return node;
    }
    const queue = [this.root];
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current.left) {
        current.left = node;
        return node;
      } else {
        queue.push(current.left);
      }
      if (!current.right) {
        current.right = node;
        return node;
      } else {
        queue.push(current.right);
      }
    }
    return node;
  }

  preorder(node = this.root, result = []) {
    if (!node) return result;
    result.push({ key: node.key, value: node.value, ...node.data });
    this.preorder(node.left, result);
    this.preorder(node.right, result);
    return result;
  }

  inorder(node = this.root, result = []) {
    if (!node) return result;
    this.inorder(node.left, result);
    result.push({ key: node.key, value: node.value, ...node.data });
    this.inorder(node.right, result);
    return result;
  }

  postorder(node = this.root, result = []) {
    if (!node) return result;
    this.postorder(node.left, result);
    this.postorder(node.right, result);
    result.push({ key: node.key, value: node.value, ...node.data });
    return result;
  }
}

class BinarySearchTree extends BinaryTree {
  insert(key, value, data = {}) {
    const node = new TreeNode(key, value, data);
    if (!this.root) {
      this.root = node;
      return node;
    }

    let current = this.root;
    while (true) {
      if (key < current.key) {
        if (!current.left) {
          current.left = node;
          return node;
        }
        current = current.left;
      } else if (key > current.key) {
        if (!current.right) {
          current.right = node;
          return node;
        }
        current = current.right;
      } else {
        // Key exists, update value/data
        current.value = value;
        current.data = data;
        return current;
      }
    }
  }

  search(key) {
    let current = this.root;
    const comparisons = [];
    let steps = 0;

    while (current) {
      steps++;
      comparisons.push({
        step: steps,
        current_key: current.key,
        current_value: current.value,
      });

      if (key === current.key) {
        return {
          found: true,
          node: { key: current.key, value: current.value, ...current.data },
          steps,
          comparisons,
        };
      }
      if (key < current.key) {
        current = current.left;
      } else {
        current = current.right;
      }
    }

    return {
      found: false,
      node: null,
      steps,
      comparisons,
    };
  }

  static buildBalancedBST(items, keySelector = (x) => x.id) {
    const sorted = [...items].sort((a, b) => keySelector(a) - keySelector(b));

    const buildNode = (arr, start, end, depth = 0) => {
      if (start > end) return null;
      const mid = Math.floor((start + end) / 2);
      const item = arr[mid];
      return {
        key: keySelector(item),
        value: `${item.make || item.brand || ''} ${item.model || item.name || ''}`.trim(),
        daily_rate: item.daily_rate,
        status: item.status,
        depth,
        left: buildNode(arr, start, mid - 1, depth + 1),
        right: buildNode(arr, mid + 1, end, depth + 1),
      };
    };

    return buildNode(sorted, 0, sorted.length - 1);
  }
}

module.exports = {
  TreeNode,
  BinaryTree,
  BinarySearchTree,
};
