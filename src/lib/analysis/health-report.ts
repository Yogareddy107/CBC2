/**
 * Engineering health and onboarding intelligence generation.
 * This pulls data from architecture mapping and dependency analysis.
 */

import { ArchitectureMapping } from "./analysis-engine";
import { DependencyNode } from "./dependency-graph";

export interface HealthReport {
    score: number;
    hotspots: string[];
    deadCodeCount: number;
    riskIndicators: {
        coupling: 'Low' | 'Med' | 'High';
        testCoverage: 'None' | 'Low' | 'High';
        maintainability: number;
        refactorSafety: number; // 0-100 percentage
    };
    impactfulFiles: { file: string; reach: number }[];
}

export interface OnboardingIntelligence {
    readingOrder: string[];
    estimatedTime: string;
    keyModules: { file: string; reason: string }[];
}

/**
 * Calculates a technical health score (0-100).
 */
export function calculateHealth(
    tree: string[],
    mapping: ArchitectureMapping,
    graph: Record<string, DependencyNode>,
    deadFiles: string[] = []
): HealthReport {
    let score = 100;
    const hotspots: string[] = [];

    // 1. Penalize for missing tests
    const hasTests = tree.some(p => p.includes('test') || p.includes('__tests__') || p.includes('.test.') || p.includes('.spec.'));
    if (!hasTests) score -= 30;

    // 2. Penalize for high coupling
    const coupledFiles = Object.values(graph)
        .filter(n => n.couplingScore > 10)
        .sort((a, b) => b.couplingScore - a.couplingScore);
    
    if (coupledFiles.length > 0) {
        score -= Math.min(20, coupledFiles.length * 2);
        hotspots.push(...coupledFiles.slice(0, 3).map(n => n.file));
    }

    // 3. Penalize for missing documentation
    const hasDocs = tree.some(p => p.toLowerCase().includes('readme') || p.toLowerCase().includes('docs/'));
    if (!hasDocs) score -= 15;

    // 4. Penalize for Dead Code
    if (deadFiles.length > 0) {
        // Only penalize if we have a reasonable amount of file contents (heuristic)
        // For now, simple penalty
        score -= Math.min(10, deadFiles.length * 1);
        if (deadFiles.length > 0 && hotspots.length < 5) {
             hotspots.push(...deadFiles.slice(0, 2).map(f => `Potentially Unused: ${f}`));
        }
    }

    // 5. Complexity Hotspots (Heuristic: files with high coupling + large size if we knew it)
    // Here we just use coupling + certain path patterns
    const complexFiles = Object.values(graph)
        .filter(n => n.dependencies.length > 5 || n.dependents.length > 5)
        .map(n => n.file);
    
    for (const f of complexFiles) {
        if (!hotspots.includes(f)) hotspots.push(f);
    }

    // 6. Impactful Files (Blast Radius)
    const { getMostImpactfulFiles } = require("./dependency-graph");
    const impactfulFiles = getMostImpactfulFiles(graph);

    // 7. Refactor Safety Percentage
    // Starts at 100, drops based on coupling hubs and dead code
    let safety = 100;
    const avgCoupling = Object.values(graph).reduce((acc, n) => acc + n.couplingScore, 0) / (Object.values(graph).length || 1);
    safety -= Math.min(40, avgCoupling * 5); // Average coupling penalty
    safety -= Math.min(20, (impactfulFiles[0]?.reach || 0) * 2); // Max reach penalty
    if (!hasTests) safety -= 20;

    return {
        score: Math.max(0, score),
        hotspots: hotspots.slice(0, 5),
        deadCodeCount: deadFiles.length,
        riskIndicators: {
            coupling: coupledFiles.length > 5 ? 'High' : (coupledFiles.length > 2 ? 'Med' : 'Low'),
            testCoverage: hasTests ? (tree.filter(p => p.includes('test')).length > 5 ? 'High' : 'Low') : 'None',
            maintainability: Math.floor(score / 10),
            refactorSafety: Math.max(0, Math.min(100, Math.round(safety)))
        },
        impactfulFiles: impactfulFiles
    };
}

/**
 * Generates onboarding intelligence.
 */
export function generateOnboarding(
    tree: string[],
    entryPoints: { file: string; type: string }[],
    graph: Record<string, DependencyNode>
): OnboardingIntelligence {
    const readingOrder: string[] = [];
    const keyModules: { file: string; reason: string }[] = [];

    // Start with entry points
    if (entryPoints.length > 0) {
        readingOrder.push(...entryPoints.map(e => e.file));
        keyModules.push({
            file: entryPoints[0].file,
            reason: "Initial entry point and execution start"
        });
    }

    // Find "Hub" modules (high dependents)
    const hubs = Object.values(graph)
        .sort((a, b) => b.dependents.length - a.dependents.length)
        .slice(0, 3);
    
    for (const hub of hubs) {
        if (!readingOrder.includes(hub.file)) {
            readingOrder.push(hub.file);
            keyModules.push({
                file: hub.file,
                reason: `Central hub: imported by ${hub.dependents.length} other modules`
            });
        }
    }

    // Estimate Time
    const fileCount = tree.length;
    let days = 0.5 + (fileCount / 200);
    if (!tree.some(p => p.includes('test'))) days += 1;
    if (!tree.some(p => p.toLowerCase().includes('readme'))) days += 1;

    return {
        readingOrder: readingOrder.slice(0, 5),
        estimatedTime: `${days.toFixed(1)} days`,
        keyModules: keyModules.slice(0, 3)
    };
}
