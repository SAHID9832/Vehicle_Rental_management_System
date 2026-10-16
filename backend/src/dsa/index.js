/**
 * Central DSA Registry (Backend)
 * Exports all 4 Phases of Data Structures & Algorithms.
 */

const { SinglyLinkedList, LinkedListNode } = require('./LinkedList');
const { Stack, StackNode, evaluateRentalCostExpression } = require('./Stack');
const { Queue, QueueNode } = require('./Queue');
const { BinaryTree, BinarySearchTree, TreeNode } = require('./BinaryTree');
const { Graph } = require('./Graph');
const { linearSearchVehicles, binarySearchVehicles } = require('./Searching');
const { mergeSortVehiclesByPrice } = require('./MergeSort');
const { greedyVehicleRecommendation } = require('./Greedy');

module.exports = {
  // Phase 1: Linear
  SinglyLinkedList,
  LinkedListNode,
  Stack,
  StackNode,
  Queue,
  QueueNode,
  evaluateRentalCostExpression,

  // Phase 2: Hierarchical & Graph
  BinaryTree,
  BinarySearchTree,
  TreeNode,
  Graph,

  // Phase 3: Searching & Sorting
  linearSearchVehicles,
  binarySearchVehicles,
  mergeSortVehiclesByPrice,

  // Phase 4: Optimization
  greedyVehicleRecommendation,
};
