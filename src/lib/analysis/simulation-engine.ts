import { DependencyNode } from "./dependency-graph";
import { calculateHealth, HealthReport } from "./health-report";
import { ArchitectureMapping } from "./analysis-engine";

export type SimulationActionType = 'MOVE' | 'DELETE' | 'DECOMPOSE' | 'ISOLATE';

export interface SimulationAction {
    type: SimulationActionType;
    targetFile: string;
    params?: {
        parts?: number;       // For DECOMPOSE
        newPath?: string;     // For MOVE
        isolationLevel?: number; // 0-1 (For ISOLATE)
    };
}

export interface SimulationResult {
    originalScore: number;
    simulatedScore: number;
    scoreDelta: number;
    impactedHotspots: string[];
    newBlastRadius: number;
    summary: string;
}

/**
 * Simulates an architectural change and projects the health impact.
 */
export function simulateArchitecturalChange(
    originalGraph: Record<string, DependencyNode>,
    tree: string[],
    mapping: ArchitectureMapping,
    action: SimulationAction
): SimulationResult {
    // 1. Deep clone the graph to mutate it virtually
    const virtualGraph: Record<string, DependencyNode> = JSON.parse(JSON.stringify(originalGraph));
    const virtualTree = [...tree];
    
    const target = action.targetFile;
    if (!virtualGraph[target]) {
        throw new Error(`Target file ${target} not found in graph.`);
    }

    let summary = "";

    switch (action.type) {
        case 'DELETE':
            delete virtualGraph[target];
            // Remove all references to this node in other nodes
            Object.values(virtualGraph).forEach(node => {
                node.dependencies = node.dependencies.filter(d => d !== target);
                node.dependents = node.dependents.filter(d => d !== target);
                node.couplingScore = (node.dependencies.length + node.dependents.length);
            });
            summary = `Removed ${target} and its ${originalGraph[target].dependents.length} incoming connections.`;
            break;

        case 'DECOMPOSE':
            const parts = action.params?.parts || 2;
            const originalNode = virtualGraph[target];
            
            // Heuristic: Splitting a hub reduces the individual node's coupling and reach
            // We simulate this by replacing the hub with N smaller nodes with fraction of connections
            delete virtualGraph[target];
            for (let i = 1; i <= parts; i++) {
                const subNodeName = `${target} (Part ${i})`;
                virtualGraph[subNodeName] = {
                    file: subNodeName,
                    dependencies: originalNode.dependencies.slice(0, Math.ceil(originalNode.dependencies.length / parts)),
                    dependents: originalNode.dependents.slice(0, Math.ceil(originalNode.dependents.length / parts)),
                    couplingScore: Math.ceil(originalNode.couplingScore / parts),
                    isHub: false,
                    isLeaf: originalNode.dependencies.length === 0,
                    isExternal: false
                };
            }
            summary = `Decomposed monolithic hub ${target} into ${parts} specialized modules, reducing individual blast radius.`;
            break;

        case 'ISOLATE':
            // Simulates adding an interface/wrapper to reduce coupling
            const node = virtualGraph[target];
            const reduction = action.params?.isolationLevel || 0.5;
            node.couplingScore = Math.floor(node.couplingScore * (1 - reduction));
            summary = `Isolated ${target} behind a clean abstraction, reducing architectural friction by ${Math.round(reduction * 100)}%.`;
            break;

        case 'MOVE':
            const newPath = action.params?.newPath || 'src/core/new-location.ts';
            const movedNode = virtualGraph[target];
            delete virtualGraph[target];
            movedNode.file = newPath;
            virtualGraph[newPath] = movedNode;
            
            // Update all references
            Object.values(virtualGraph).forEach(n => {
                n.dependencies = n.dependencies.map(d => d === target ? newPath : d);
                n.dependents = n.dependents.map(d => d === target ? newPath : d);
            });
            summary = `Refactored ${target} to ${newPath} to improve domain alignment.`;
            break;
    }

    // 2. Run health check on mutated state
    const originalHealth = calculateHealth(tree, mapping, originalGraph);
    const simulatedHealth = calculateHealth(virtualTree, mapping, virtualGraph);

    return {
        originalScore: originalHealth.score,
        simulatedScore: simulatedHealth.score,
        scoreDelta: simulatedHealth.score - originalHealth.score,
        impactedHotspots: simulatedHealth.hotspots,
        newBlastRadius: simulatedHealth.impactfulFiles[0]?.reach || 0,
        summary
    };
}
