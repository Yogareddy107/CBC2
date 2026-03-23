/**
 * Dependency graph engine for identifying file-level relationships.
 */

export interface DependencyNode {
    file: string;
    dependencies: string[];
    dependents: string[];
    couplingScore: number;
    isHub: boolean; // High degree of dependents
    isLeaf: boolean; // No dependencies
    isExternal?: boolean;
    clusterId?: string;
}

export interface DependencyCluster {
    id: string;
    files: string[];
    type: 'core' | 'feature' | 'utility' | 'mixed';
}

/**
 * Basic dependency extractor using regex for fast performance.
 * Targeted at JS/TS (ESM/CJS), Python, and some other common languages.
 */
export function extractDependencies(path: string, content: string): string[] {
    const deps = new Set<string>();
    
    // JS/TS Imports: import { x } from 'y', import x from 'y', import 'y'
    const importRegex = /import\s+(?:(?:[\w\s{},*]+)\s+from\s+)?['"]([^'"]+)['"]/g;
    // JS/TS Dynamic Imports: import('y')
    const dynamicImportRegex = /import\(['"]([^'"]+)['"]\)/g;
    // CommonJS: require('y')
    const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
    // Python: import y, from y import x
    const pythonImportRegex = /^\s*(?:import\s+(\w+)|from\s+([\w.]+)\s+import)/gm;

    let match;
    while ((match = importRegex.exec(content)) !== null) deps.add(match[1]);
    while ((match = dynamicImportRegex.exec(content)) !== null) deps.add(match[1]);
    while ((match = requireRegex.exec(content)) !== null) deps.add(match[1]);
    
    while ((match = pythonImportRegex.exec(content)) !== null) {
        deps.add(match[1] || match[2]);
    }

    return Array.from(deps);
}

/**
 * Resolves dependency strings to absolute/relative file paths based on the tree.
 */
export function resolveDependency(baseFile: string, dep: string, tree: string[]): string | null {
    // 1. Ignore external packages (node_modules, etc.)
    if (!dep.startsWith('.') && !dep.startsWith('@/')) return null;

    // 2. Handle aliases (like '@/')
    let normalizedDep = dep;
    if (dep.startsWith('@/')) {
        normalizedDep = `src/${dep.slice(2)}`;
    } else if (dep.startsWith('./') || dep.startsWith('../')) {
        // Resolve relative path
        const parts = baseFile.split('/');
        parts.pop(); // Remove current filename
        const depParts = dep.split('/');
        for (const p of depParts) {
            if (p === '..') parts.pop();
            else if (p !== '.') parts.push(p);
        }
        normalizedDep = parts.join('/');
    }

    // 3. Find match in tree (with extensions)
    const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js'];
    for (const ext of extensions) {
        const candidate = `${normalizedDep}${ext}`;
        if (tree.includes(candidate)) return candidate;
    }

    return null;
}

/**
 * Builds the full dependency graph for the repository.
 * Note: This requires file contents which might be limited in the initial fetch.
 * We can build a partial graph with what we have.
 */
export function buildDependencyGraph(tree: string[], fileContents: Record<string, string>): Record<string, DependencyNode> {
    const graph: Record<string, DependencyNode> = {};

    // Initialize nodes
    for (const file of tree) {
        graph[file] = {
            file,
            dependencies: [],
            dependents: [],
            couplingScore: 0,
            isHub: false,
            isLeaf: true
        };
    }

    // Extract and resolve dependencies
    for (const [file, content] of Object.entries(fileContents)) {
        if (!graph[file]) continue;

        const rawDeps = extractDependencies(file, content);
        for (const rawDep of rawDeps) {
            const resolved = resolveDependency(file, rawDep, tree);
            if (resolved && graph[resolved]) {
                if (!graph[file].dependencies.includes(resolved)) {
                    graph[file].dependencies.push(resolved);
                }
                if (!graph[resolved].dependents.includes(file)) {
                    graph[resolved].dependents.push(file);
                }
            }
        }
    }

    // Calculate Coupling Score and identify hubs/leaves
    for (const file in graph) {
        const node = graph[file];
        node.couplingScore = node.dependencies.length + node.dependents.length;
        node.isHub = node.dependents.length > 5;
        node.isLeaf = node.dependencies.length === 0;
    }

    return graph;
}

/**
 * Detects strongly coupled clusters of files.
 * Simple version: groups files that are in the same directory and have internal dependencies.
 */
export function detectClusters(graph: Record<string, DependencyNode>): DependencyCluster[] {
    const clusters: DependencyCluster[] = [];
    const dirMap: Record<string, string[]> = {};

    for (const file of Object.keys(graph)) {
        const dir = file.split('/').slice(0, -1).join('/') || 'root';
        if (!dirMap[dir]) dirMap[dir] = [];
        dirMap[dir].push(file);
    }

    for (const [dir, files] of Object.entries(dirMap)) {
        if (files.length < 2) continue;

        // Check for internal coupling
        let internalLinks = 0;
        for (const file of files) {
            for (const dep of graph[file].dependencies) {
                if (files.includes(dep)) internalLinks++;
            }
        }

        if (internalLinks > 0) {
            clusters.push({
                id: dir,
                files,
                type: dir.includes('core') ? 'core' : dir.includes('utils') ? 'utility' : 'feature'
            });
        }
    }

    return clusters;
}

/**
 * Heuristic to detect potentially "dead" (unused) code.
 * A file is considered potentially dead if it has zero incoming dependencies (dependents)
 * and is not a known entry point.
 */
export function detectDeadCode(graph: Record<string, DependencyNode>, entryPoints: string[]): string[] {
    const deadFiles: string[] = [];

    for (const [file, node] of Object.entries(graph)) {
        // Skip entry points as they are intended to be root nodes
        if (entryPoints.includes(file)) continue;

        // Heuristic: if no one depends on it, it might be dead
        // Note: We only check files that we have content for, otherwise we don't know their dependents accurately.
        // However, in this simplified engine, we check all known files in the graph.
        if (node.dependents.length === 0) {
            // Ignore common non-code files or config files that might be used implicitly
            const ignorePatterns = [
                /\.d\.ts$/,
                /package\.json$/,
                /tsconfig\.json$/,
                /\.config\./,
                /README\.md$/,
                /\.env/
            ];

            if (!ignorePatterns.some(pattern => pattern.test(file))) {
                deadFiles.push(file);
            }
        }
    }

    return deadFiles;
}

/**
 * Calculates the recursive "Blast Radius" of a file change.
 * Finds all files that directly or indirectly depend on the target file.
 */
export function calculateBlastRadius(graph: Record<string, DependencyNode>, targetFile: string): { reach: number, affectedNodes: string[] } {
    const affected = new Set<string>();
    const queue = [targetFile];
    const visited = new Set<string>();
    visited.add(targetFile);
    
    while (queue.length > 0) {
        const current = queue.shift()!;
        const node = graph[current];
        if (!node) continue;
        
        for (const dependent of node.dependents) {
            if (!visited.has(dependent)) {
                visited.has(dependent); // wait, visited.add is better
                visited.add(dependent);
                affected.add(dependent);
                queue.push(dependent);
            }
        }
    }
    
    const affectedNodes = Array.from(affected);
    return { reach: affectedNodes.length, affectedNodes };
}

/**
 * Identifies the most impactful files in the repository based on their recursive reach.
 */
export function getMostImpactfulFiles(graph: Record<string, DependencyNode>): { file: string, reach: number }[] {
    const results: { file: string, reach: number }[] = [];
    
    for (const file in graph) {
        const result = calculateBlastRadius(graph, file);
        if (result.reach > 0) {
            results.push({ file, reach: result.reach });
        }
    }
    
    return results.sort((a, b) => b.reach - a.reach).slice(0, 5);
}
