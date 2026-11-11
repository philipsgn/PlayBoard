import * as THREE from 'three';

export interface GraphNode {
  id: string;
  position: [number, number, number];
  type: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
}

// Dữ liệu đồ thị đồng bộ từ WORLD_GRAPH.json (độc lập không phụ thuộc network)
export const WORLD_NODES: Record<string, GraphNode> = {
  node_home_door: { id: 'node_home_door', position: [-28.5, 0.0, 6.0], type: 'outdoor' },
  node_civic_sidewalk_1: { id: 'node_civic_sidewalk_1', position: [-24.0, 0.0, 6.0], type: 'sidewalk' },
  node_civic_clinic: { id: 'node_civic_clinic', position: [-22.0, 0.0, 2.0], type: 'sidewalk' },
  node_civic_repair: { id: 'node_civic_repair', position: [-20.0, 0.0, 7.0], type: 'sidewalk' },
  node_civic_academy: { id: 'node_civic_academy', position: [-25.0, 0.0, -4.0], type: 'sidewalk' },
  node_civic_crossing_west: { id: 'node_civic_crossing_west', position: [-14.0, 0.0, 5.0], type: 'street_crossing' },

  node_main_street_west: { id: 'node_main_street_west', position: [-8.0, 0.0, 5.0], type: 'street' },
  node_cafe_curb: { id: 'node_cafe_curb', position: [0.0, 0.0, 5.0], type: 'street' },
  node_cafe_porch_outside: { id: 'node_cafe_porch_outside', position: [0.0, 0.0, 2.5], type: 'porch' },
  node_cafe_door_exterior: { id: 'node_cafe_door_exterior', position: [0.0, 0.0, 1.3], type: 'door_threshold' },
  node_cafe_door_interior: { id: 'node_cafe_door_interior', position: [0.0, 0.0, 0.7], type: 'door_threshold' },
  node_cafe_lobby: { id: 'node_cafe_lobby', position: [0.0, 0.0, 0.0], type: 'indoor' },
  node_cafe_table_1: { id: 'node_cafe_table_1', position: [-2.0, 0.0, -0.8], type: 'indoor' },
  node_cafe_table_2: { id: 'node_cafe_table_2', position: [2.0, 0.0, -0.8], type: 'indoor' },
  node_cafe_counter_front: { id: 'node_cafe_counter_front', position: [0.0, 0.0, -1.4], type: 'indoor' },
  node_cafe_barista_pos: { id: 'node_cafe_barista_pos', position: [0.0, 0.0, -2.4], type: 'indoor' },
  node_cafe_espresso_station: { id: 'node_cafe_espresso_station', position: [-1.1, 0.0, -2.4], type: 'indoor' },
  node_cafe_grinder_station: { id: 'node_cafe_grinder_station', position: [-1.8, 0.0, -2.4], type: 'indoor' },
  node_cafe_safe_corner: { id: 'node_cafe_safe_corner', position: [2.2, 0.0, -2.8], type: 'indoor' },

  node_main_street_east: { id: 'node_main_street_east', position: [8.0, 0.0, 5.0], type: 'street' },
  node_downtown_crossing_east: { id: 'node_downtown_crossing_east', position: [14.0, 0.0, 5.0], type: 'street_crossing' },
  node_downtown_plaza: { id: 'node_downtown_plaza', position: [20.0, 0.0, 5.0], type: 'sidewalk' },
  node_downtown_start_gate: { id: 'node_downtown_start_gate', position: [20.0, 0.0, 8.0], type: 'sidewalk' },
  node_downtown_gold_shop: { id: 'node_downtown_gold_shop', position: [27.0, 0.0, 3.5], type: 'sidewalk' },
  node_downtown_bank_steps: { id: 'node_downtown_bank_steps', position: [30.5, 0.0, 0.0], type: 'porch' },
};

export const WORLD_EDGES: GraphEdge[] = [
  { from: 'node_home_door', to: 'node_civic_sidewalk_1', weight: 4.5 },
  { from: 'node_civic_sidewalk_1', to: 'node_civic_clinic', weight: 4.2 },
  { from: 'node_civic_sidewalk_1', to: 'node_civic_repair', weight: 4.1 },
  { from: 'node_civic_sidewalk_1', to: 'node_civic_academy', weight: 10.0 },
  { from: 'node_civic_sidewalk_1', to: 'node_civic_crossing_west', weight: 10.1 },
  { from: 'node_civic_crossing_west', to: 'node_main_street_west', weight: 6.0 },

  { from: 'node_main_street_west', to: 'node_cafe_curb', weight: 8.0 },
  { from: 'node_cafe_curb', to: 'node_cafe_porch_outside', weight: 2.5 },
  { from: 'node_cafe_porch_outside', to: 'node_cafe_door_exterior', weight: 1.2 },
  { from: 'node_cafe_door_exterior', to: 'node_cafe_door_interior', weight: 0.6 },
  { from: 'node_cafe_door_interior', to: 'node_cafe_lobby', weight: 0.7 },

  { from: 'node_cafe_lobby', to: 'node_cafe_table_1', weight: 2.2 },
  { from: 'node_cafe_lobby', to: 'node_cafe_table_2', weight: 2.2 },
  { from: 'node_cafe_lobby', to: 'node_cafe_counter_front', weight: 1.4 },
  { from: 'node_cafe_counter_front', to: 'node_cafe_barista_pos', weight: 1.2 },
  { from: 'node_cafe_barista_pos', to: 'node_cafe_espresso_station', weight: 1.1 },
  { from: 'node_cafe_barista_pos', to: 'node_cafe_grinder_station', weight: 1.8 },
  { from: 'node_cafe_barista_pos', to: 'node_cafe_safe_corner', weight: 2.3 },

  { from: 'node_cafe_curb', to: 'node_main_street_east', weight: 8.0 },
  { from: 'node_main_street_east', to: 'node_downtown_crossing_east', weight: 6.0 },
  { from: 'node_downtown_crossing_east', to: 'node_downtown_plaza', weight: 6.0 },
  { from: 'node_downtown_plaza', to: 'node_downtown_start_gate', weight: 3.0 },
  { from: 'node_downtown_plaza', to: 'node_downtown_gold_shop', weight: 7.1 },
  { from: 'node_downtown_plaza', to: 'node_downtown_bank_steps', weight: 10.5 },
];

export class Pathfinding {
  private adjacency = new Map<string, Array<{ to: string; weight: number }>>();

  constructor() {
    // Xây dựng bảng kề hai chiều (Undirected Graph)
    for (const edge of WORLD_EDGES) {
      if (!this.adjacency.has(edge.from)) this.adjacency.set(edge.from, []);
      if (!this.adjacency.has(edge.to)) this.adjacency.set(edge.to, []);
      this.adjacency.get(edge.from)!.push({ to: edge.to, weight: edge.weight });
      this.adjacency.get(edge.to)!.push({ to: edge.from, weight: edge.weight });
    }
  }

  // Tìm node gần nhất với một tọa độ Vector3 bất kỳ
  public findNearestNode(point: THREE.Vector3): string {
    let bestId = 'node_cafe_porch_outside';
    let bestDist = Infinity;

    for (const [id, node] of Object.entries(WORLD_NODES)) {
      const d = point.distanceTo(new THREE.Vector3(...node.position));
      if (d < bestDist) {
        bestDist = d;
        bestId = id;
      }
    }
    return bestId;
  }

  // Thuật toán A* tìm đường ngắn nhất giữa hai Waypoint
  public findPath(startId: string, goalId: string): THREE.Vector3[] {
    if (startId === goalId) {
      const n = WORLD_NODES[goalId];
      return n ? [new THREE.Vector3(...n.position)] : [];
    }

    const openSet = new Set<string>([startId]);
    const cameFrom = new Map<string, string>();

    const gScore = new Map<string, number>();
    gScore.set(startId, 0);

    const fScore = new Map<string, number>();
    fScore.set(startId, this.heuristic(startId, goalId));

    while (openSet.size > 0) {
      let current = '';
      let lowestF = Infinity;
      for (const id of openSet) {
        const f = fScore.get(id) ?? Infinity;
        if (f < lowestF) {
          lowestF = f;
          current = id;
        }
      }

      if (current === goalId) {
        return this.reconstructPath(cameFrom, current);
      }

      openSet.delete(current);
      const neighbors = this.adjacency.get(current) || [];

      for (const neighbor of neighbors) {
        const tentativeG = (gScore.get(current) ?? Infinity) + neighbor.weight;
        if (tentativeG < (gScore.get(neighbor.to) ?? Infinity)) {
          cameFrom.set(neighbor.to, current);
          gScore.set(neighbor.to, tentativeG);
          fScore.set(neighbor.to, tentativeG + this.heuristic(neighbor.to, goalId));
          openSet.add(neighbor.to);
        }
      }
    }

    // Nếu không tìm thấy đường đi (fallback trực tiếp đến đích)
    const goalNode = WORLD_NODES[goalId];
    return goalNode ? [new THREE.Vector3(...goalNode.position)] : [];
  }

  private heuristic(aId: string, bId: string): number {
    const a = WORLD_NODES[aId];
    const b = WORLD_NODES[bId];
    if (!a || !b) return 0;
    return Math.hypot(a.position[0] - b.position[0], a.position[2] - b.position[2]);
  }

  private reconstructPath(cameFrom: Map<string, string>, current: string): THREE.Vector3[] {
    const totalPath: THREE.Vector3[] = [new THREE.Vector3(...WORLD_NODES[current].position)];
    while (cameFrom.has(current)) {
      current = cameFrom.get(current)!;
      totalPath.unshift(new THREE.Vector3(...WORLD_NODES[current].position));
    }
    return totalPath;
  }
}
