/**
 * Engineering Maturity Benchmarking Engine
 * 
 * This module defines "Industry Standards" for different tech stacks
 * and calculates comparative grades/percentiles for repositories.
 */

export type TechStack = 'Next.js' | 'React' | 'Python' | 'Rust' | 'TypeScript' | 'Generic';

export interface BenchmarkResult {
    grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
    percentile: number;
    stackAverage: number;
    eliteStatus: boolean;
    competitiveInsight: string;
}

interface StackThresholds {
    complexity: number;      // Higher is better (less complex)
    documentation: number;
    modularity: number;
    testCoverage: number;
}

const STANDARDS: Record<TechStack, StackThresholds> = {
    'Next.js': {
        complexity: 75,
        documentation: 80,
        modularity: 70,
        testCoverage: 60
    },
    'TypeScript': {
        complexity: 70,
        documentation: 75,
        modularity: 75,
        testCoverage: 65
    },
    'Python': {
        complexity: 80,
        documentation: 85,
        modularity: 65,
        testCoverage: 70
    },
    'Rust': {
        complexity: 65,
        documentation: 90,
        modularity: 85,
        testCoverage: 80
    },
    'React': {
        complexity: 70,
        documentation: 75,
        modularity: 70,
        testCoverage: 55
    },
    'Generic': {
        complexity: 70,
        documentation: 70,
        modularity: 70,
        testCoverage: 50
    }
};

export function calculateMarketGrade(
    stack: TechStack,
    metrics: { complexity: number; documentation: number; modularity: number; testCoverage: number }
): BenchmarkResult {
    const threshold = STANDARDS[stack] || STANDARDS.Generic;
    
    // Weighting: Modularity and Complexity are weighted higher for architecture
    const score = (
        metrics.complexity * 0.3 +
        metrics.modularity * 0.3 +
        metrics.documentation * 0.2 +
        metrics.testCoverage * 0.2
    );

    const stackAvg = (
        threshold.complexity * 0.3 +
        threshold.modularity * 0.3 +
        threshold.documentation * 0.2 +
        threshold.testCoverage * 0.2
    );

    // Calculate Percentile (Heuristic)
    // If you are exactly at average, you are 50th percentile.
    // If you are 20 points above, you are 95th.
    const diff = score - stackAvg;
    let percentile = 50 + (diff * 2.25);
    percentile = Math.max(1, Math.min(99, Math.round(percentile)));

    // Assign Grade
    let grade: BenchmarkResult['grade'] = 'C';
    if (percentile >= 98) grade = 'A+';
    else if (percentile >= 90) grade = 'A';
    else if (percentile >= 80) grade = 'B+';
    else if (percentile >= 65) grade = 'B';
    else if (percentile >= 40) grade = 'C';
    else if (percentile >= 20) grade = 'D';
    else grade = 'F';

    const eliteStatus = percentile >= 95;

    // Generate insight
    let competitiveInsight = "";
    if (eliteStatus) {
        competitiveInsight = `Elite Engineering: This project ranks in the top 5% of ${stack} codebases globally.`;
    } else if (percentile > 70) {
        competitiveInsight = `Strong Architecture: You are outperforming ${percentile}% of ${stack} projects in modularity.`;
    } else if (percentile < 30) {
        competitiveInsight = `Critical Debt: This project is in the bottom 30% for maintainability relative to ${stack} standards.`;
    } else {
        competitiveInsight = `Standard Maturity: Following most ${stack} best practices, with room for modular optimization.`;
    }

    return {
        grade,
        percentile,
        stackAverage: Math.round(stackAvg),
        eliteStatus,
        competitiveInsight
    };
}
