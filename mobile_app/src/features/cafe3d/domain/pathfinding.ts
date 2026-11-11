import type { WaypointGraph } from './types.ts';

export class PurePathfinding {
  private graph: WaypointGraph;
  private nodeMap = new Map<string, [number, number, number]>();
  private adjacency = new Map<string, string[]>();

  constructor(graph: WaypointGraph) {
    this.graph = graph;
    this.buildGraph();
  }

  private buildGraph(): void {
    for (const node of this.graph.nodes) {
      this.nodeMap.set(node.id, node.pos);
      this.adjacency.set(node.id, []);
    }

    for (const [a, b] of this.graph.edges) {
      this.adjacency.get(a)?.push(b);
      this.adjacency.get(b)?.push(a);
    }
  }

  public findNearestNode(pos: [number, number, number]): string {
    let nearestId = this.graph.nodes[0]?.id || '';
    let minDist = Infinity;

    for (const node of this.graph.nodes) {
      const dx = node.pos[0] - pos[0];
      const dy = node.pos[1] - pos[1];
      const dz = node.pos[2] - pos[2];
      const dist = dx * dx + dy * dy + dz * dz;
      if (dist < minDist) {
        minDist = dist;
        nearestId = node.id;
      }
    }

    return nearestId;
  }

  public findPath(startId: string, targetId: string): [number, number, number][] {
    if (!this.nodeMap.has(startId) || !this.nodeMap.has(targetId)) {
      return [];
    }

    if (startId === targetId) {
      return [this.nodeMap.get(targetId)!];
    }

    const openSet = new Set<string>([startId]);
    const cameFrom = new Map<string, string>();

    const gScore = new Map<string, number>();
    gScore.set(startId, 0);

    const fScore = new Map<string, number>();
    fScore.set(startId, this.heuristic(startId, targetId));

    while (openSet.size > 0) {
      // Tìm node có fScore thấp nhất
      let current = '';
      let lowestF = Infinity;
      for (const node of openSet) {
        const score = fScore.get(node) ?? Infinity;
        if (score < lowestF) {
          lowestF = score;
          current = node;
        }
      }

      if (current === targetId) {
        return this.reconstructPath(cameFrom, current);
      }

      openSet.delete(current);
      const neighbors = this.adjacency.get(current) || [];

      for (const neighbor of neighbors) {
        const d = this.dist(current, neighbor);
        const tentativeG = (gScore.get(current) ?? Infinity) + d;

        if (tentativeG < (gScore.get(neighbor) ?? Infinity)) {
          cameFrom.set(neighbor, current);
          gScore.set(neighbor, tentativeG);
          fScore.set(neighbor, tentativeG + this.heuristic(neighbor, targetId));
          openSet.add(neighbor);
        }
      }
    }

    return [];
  }

  private heuristic(aId: string, bId: string): number {
    return this.dist(aId, bId);
  }

  private dist(aId: string, bId: string): number {
    const a = this.nodeMap.get(aId)!;
    const b = this.nodeMap.get(bId)!;
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    const dz = a[2] - b[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  private reconstructPath(cameFrom: Map<string, string>, current: string): [number, number, number][] {
    const totalPath: [number, number, number][] = [this.nodeMap.get(current)!];
    while (cameFrom.has(current)) {
      current = cameFrom.get(current)!;
      totalPath.unshift(this.nodeMap.get(current)!);
    }
    return totalPath;
  }
}
