/**
 * Phase Ω-V — Universe Dependency Graph
 * Constructs a directed graph of universe dependencies and resolves load order
 */

export interface UniverseNode {
  id: string;
  dependencies: string[];
  dependents: string[];
}

export class UniverseGraph {
  private nodes: Map<string, UniverseNode> = new Map();

  /**
   * Add a universe to the graph
   */
  addUniverse(id: string, dependencies: string[] = []): void {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, { 
        id, 
        dependencies,
        dependents: []
      });
    }
    
    // Update dependents
    dependencies.forEach(depId => {
      if (!this.nodes.has(depId)) {
        this.nodes.set(depId, { id: depId, dependencies: [], dependents: [] });
      }
      const depNode = this.nodes.get(depId)!;
      if (!depNode.dependents.includes(id)) {
        depNode.dependents.push(id);
      }
    });
  }

  /**
   * Resolve load order using topological sort
   * Returns array of universe IDs in dependency order (dependencies first)
   */
  resolveOrder(): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: string[] = [];

    const visit = (id: string): void => {
      if (visited.has(id)) return;
      
      if (visiting.has(id)) {
        throw new Error(`Circular dependency detected at: ${id}`);
      }
      
      visiting.add(id);
      
      const node = this.nodes.get(id);
      if (!node) {
        throw new Error(`Universe not found in graph: ${id}`);
      }
      
      // Visit dependencies first
      node.dependencies.forEach(dep => visit(dep));
      
      visiting.delete(id);
      visited.add(id);
      result.push(id);
    };

    // Visit all nodes
    for (const id of this.nodes.keys()) {
      visit(id);
    }

    return result;
  }

  /**
   * Get all dependents of a universe (what depends on it)
   */
  getDependents(universeId: string): string[] {
    const node = this.nodes.get(universeId);
    return node ? node.dependents : [];
  }

  /**
   * Get all dependencies of a universe (what it depends on)
   */
  getDependencies(universeId: string): string[] {
    const node = this.nodes.get(universeId);
    return node ? node.dependencies : [];
  }

  /**
   * Check for circular dependencies
   */
  hasCircularDependencies(): boolean {
    try {
      this.resolveOrder();
      return false;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get graph statistics
   */
  getStats(): {
    totalNodes: number;
    totalEdges: number;
    orphanNodes: number;
    maxDepth: number;
  } {
    let totalEdges = 0;
    let orphanNodes = 0;
    
    this.nodes.forEach(node => {
      totalEdges += node.dependencies.length;
      if (node.dependencies.length === 0 && node.dependents.length === 0) {
        orphanNodes++;
      }
    });

    return {
      totalNodes: this.nodes.size,
      totalEdges,
      orphanNodes,
      maxDepth: this.calculateMaxDepth(),
    };
  }

  private calculateMaxDepth(): number {
    const depths = new Map<string, number>();
    
    const getDepth = (id: string): number => {
      if (depths.has(id)) return depths.get(id)!;
      
      const node = this.nodes.get(id);
      if (!node || node.dependencies.length === 0) {
        depths.set(id, 0);
        return 0;
      }
      
      const maxDep = Math.max(...node.dependencies.map(d => getDepth(d)));
      const depth = maxDep + 1;
      depths.set(id, depth);
      return depth;
    };

    let maxDepth = 0;
    this.nodes.forEach((_, id) => {
      maxDepth = Math.max(maxDepth, getDepth(id));
    });
    
    return maxDepth;
  }

  /**
   * Export graph to DOT format for visualization
   */
  toDOT(): string {
    let dot = 'digraph UniverseGraph {\n';
    dot += '  rankdir=LR;\n';
    dot += '  node [shape=box, style=rounded];\n\n';
    
    this.nodes.forEach((node, id) => {
      node.dependencies.forEach(dep => {
        dot += `  "${dep}" -> "${id}";\n`;
      });
    });
    
    dot += '}';
    return dot;
  }
}
