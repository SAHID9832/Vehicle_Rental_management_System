// ============================================================
// DSA Phase 2D/E - Graph (Adjacency List) + BFS
// Used for Bengaluru rental branch network
// BFS: Visit nodes level by level using Queue
// Time: BFS O(V + E) | Space: O(V)
// ============================================================

import { Queue } from './Queue';

export interface Branch {
  id: number;
  name: string;
  address: string;
  city: string;
}

export interface GraphEdge {
  to: number;
  distance_km: number;
  travel_time_mins: number;
}

export interface BFSStep {
  currentNode: number;
  nodeName: string;
  level: number;
  queueState: number[];
  visited: number[];
  action: string;
}

export interface BFSResult {
  visitOrder: Branch[];
  steps: BFSStep[];
  levels: Array<{ level: number; nodes: Branch[] }>;
  totalNodes: number;
}

export class Graph {
  private adjacencyList: Map<number, GraphEdge[]> = new Map();
  private nodes: Map<number, Branch> = new Map();

  addNode(branch: Branch): void {
    this.nodes.set(branch.id, branch);
    if (!this.adjacencyList.has(branch.id)) {
      this.adjacencyList.set(branch.id, []);
    }
  }

  addEdge(from: number, to: number, distance_km: number, travel_time_mins: number): void {
    if (!this.adjacencyList.has(from)) this.adjacencyList.set(from, []);
    if (!this.adjacencyList.has(to)) this.adjacencyList.set(to, []);
    
    this.adjacencyList.get(from)!.push({ to, distance_km, travel_time_mins });
    // Undirected graph - add reverse edge
    this.adjacencyList.get(to)!.push({ to: from, distance_km, travel_time_mins });
  }

  getNeighbors(nodeId: number): GraphEdge[] {
    return this.adjacencyList.get(nodeId) || [];
  }

  getNode(id: number): Branch | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): Branch[] {
    return Array.from(this.nodes.values());
  }

  getAdjacencyListDisplay(): Record<string, Array<{ name: string; distance: number; time: number }>> {
    const result: Record<string, Array<{ name: string; distance: number; time: number }>> = {};
    this.adjacencyList.forEach((edges, nodeId) => {
      const node = this.nodes.get(nodeId);
      if (node) {
        result[node.name] = edges.map(e => {
          const neighbor = this.nodes.get(e.to);
          return {
            name: neighbor?.name || `Node ${e.to}`,
            distance: e.distance_km,
            time: e.travel_time_mins,
          };
        });
      }
    });
    return result;
  }

  /**
   * BFS Traversal using custom Queue
   * Visits all reachable nodes level by level from startId
   */
  bfs(startId: number): BFSResult {
    const visited = new Set<number>();
    const queue = new Queue<number>();
    const visitOrder: Branch[] = [];
    const steps: BFSStep[] = [];
    const levelMap = new Map<number, number>(); // nodeId -> level
    const levels: Map<number, Branch[]> = new Map();

    if (!this.nodes.has(startId)) {
      return { visitOrder: [], steps: [], levels: [], totalNodes: 0 };
    }

    queue.enqueue(startId);
    visited.add(startId);
    levelMap.set(startId, 0);

    steps.push({
      currentNode: startId,
      nodeName: this.nodes.get(startId)!.name,
      level: 0,
      queueState: queue.display(),
      visited: Array.from(visited),
      action: `Start BFS at ${this.nodes.get(startId)!.name}. Enqueue it. Mark as visited.`,
    });

    while (!queue.isEmpty()) {
      const currentId = queue.dequeue()!;
      const currentNode = this.nodes.get(currentId)!;
      const currentLevel = levelMap.get(currentId)!;
      
      visitOrder.push(currentNode);
      
      if (!levels.has(currentLevel)) levels.set(currentLevel, []);
      levels.get(currentLevel)!.push(currentNode);

      steps.push({
        currentNode: currentId,
        nodeName: currentNode.name,
        level: currentLevel,
        queueState: queue.display(),
        visited: Array.from(visited),
        action: `Dequeue ${currentNode.name} (Level ${currentLevel}). Visit it.`,
      });

      const neighbors = this.getNeighbors(currentId);
      for (const edge of neighbors) {
        if (!visited.has(edge.to)) {
          visited.add(edge.to);
          queue.enqueue(edge.to);
          levelMap.set(edge.to, currentLevel + 1);

          const neighborNode = this.nodes.get(edge.to);
          steps.push({
            currentNode: edge.to,
            nodeName: neighborNode?.name || `Node ${edge.to}`,
            level: currentLevel + 1,
            queueState: queue.display(),
            visited: Array.from(visited),
            action: `Found unvisited neighbor ${neighborNode?.name}. Enqueue it at Level ${currentLevel + 1}.`,
          });
        }
      }
    }

    const levelsArray: BFSResult['levels'] = [];
    levels.forEach((nodes, level) => levelsArray.push({ level, nodes }));
    levelsArray.sort((a, b) => a.level - b.level);

    return {
      visitOrder,
      steps,
      levels: levelsArray,
      totalNodes: visitOrder.length,
    };
  }

  /** Build graph from API data */
  static fromAPIData(
    branches: Branch[],
    connections: Array<{ from_branch_id: number; to_branch_id: number; distance_km: number; travel_time_mins: number }>
  ): Graph {
    const graph = new Graph();
    branches.forEach(b => graph.addNode(b));
    const addedEdges = new Set<string>();
    connections.forEach(c => {
      const key1 = `${c.from_branch_id}-${c.to_branch_id}`;
      const key2 = `${c.to_branch_id}-${c.from_branch_id}`;
      if (!addedEdges.has(key1) && !addedEdges.has(key2)) {
        graph.addEdge(c.from_branch_id, c.to_branch_id, c.distance_km, c.travel_time_mins);
        addedEdges.add(key1);
      }
    });
    return graph;
  }
}
