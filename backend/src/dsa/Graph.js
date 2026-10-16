/**
 * Phase 2D & 2E: Graph & Breadth-First Search (BFS)
 * Represents Bengaluru rental hubs network and discovers optimal paths/routes level-by-level using Queue.
 */

class Graph {
  constructor(isDirected = false) {
    this.isDirected = isDirected;
    this.adjacencyList = new Map();
    this.nodes = new Map();
  }

  addNode(id, data = {}) {
    if (!this.adjacencyList.has(id)) {
      this.adjacencyList.set(id, []);
      this.nodes.set(id, { id, ...data });
    }
  }

  addEdge(fromId, toId, weight = 1, metadata = {}) {
    this.addNode(fromId);
    this.addNode(toId);

    this.adjacencyList.get(fromId).push({
      nodeId: toId,
      weight,
      ...metadata,
    });

    if (!this.isDirected) {
      this.adjacencyList.get(toId).push({
        nodeId: fromId,
        weight,
        ...metadata,
      });
    }
  }

  bfs(startId) {
    if (!this.adjacencyList.has(startId)) return null;

    const visited = new Set();
    const queue = [startId];
    const traversalOrder = [];
    const steps = [];

    visited.add(startId);

    while (queue.length > 0) {
      const currentId = queue.shift();
      const currentNode = this.nodes.get(currentId);
      traversalOrder.push(currentId);

      const neighbors = this.adjacencyList.get(currentId) || [];
      const newNeighbors = [];

      for (const edge of neighbors) {
        if (!visited.has(edge.nodeId)) {
          visited.add(edge.nodeId);
          queue.push(edge.nodeId);
          newNeighbors.push(edge.nodeId);
        }
      }

      steps.push({
        step: traversalOrder.length,
        visited_node: currentId,
        node_name: currentNode ? currentNode.name || `Node ${currentId}` : `Node ${currentId}`,
        queue_after: [...queue],
        neighbors_discovered: newNeighbors,
      });
    }

    return {
      startId,
      traversalOrder,
      steps,
      totalVisited: traversalOrder.length,
    };
  }

  getAdjacencyObject() {
    const obj = {};
    for (const [key, edges] of this.adjacencyList.entries()) {
      obj[key] = edges.map((e) => ({
        id: e.nodeId,
        weight: e.weight,
        distance_km: e.distance_km || e.weight,
        travel_time_min: e.travel_time_min || e.travel_time_mins,
      }));
    }
    return obj;
  }
}

module.exports = {
  Graph,
};
