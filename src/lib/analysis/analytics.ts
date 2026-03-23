import { db } from "@/lib/db";
import { analyses } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface TeamMetrics {
    averageSafetyScore: number;
    totalHotspots: number;
    riskDistribution: {
        low: number;
        medium: number;
        high: number;
        critical: number;
    };
    trends: {
        date: string;
        avgScore: number;
    }[];
}

export async function getTeamMetrics(userId: string): Promise<TeamMetrics> {
    // 1. Fetch completed analyses for the user
    const results = await db.select()
        .from(analyses)
        .where(eq(analyses.user_id, userId))
        .orderBy(desc(analyses.created_at))
        .limit(20);

    const completed = results.filter(r => r.status === 'completed' && r.result);

    if (completed.length === 0) {
        return {
            averageSafetyScore: 0,
            totalHotspots: 0,
            riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
            trends: []
        };
    }

    let totalScore = 0;
    let hotspotCount = 0;
    const distribution = { low: 0, medium: 0, high: 0, critical: 0 };

    completed.forEach(r => {
        const data = r.result as any;
        const report = data.healthReport || {};
        
        // Use Safety Score or fallback to Health Score
        const score = report.riskIndicators?.refactorSafety ?? report.score ?? 0;
        totalScore += score;

        // Count hotspots
        hotspotCount += (report.hotspots?.length || 0);

        // Map distribution based on overall score
        if (score > 80) distribution.low++;
        else if (score > 60) distribution.medium++;
        else if (score > 40) distribution.high++;
        else distribution.critical++;
    });

    // Calculate trends (grouped by date)
    const trendsRaw = completed.map(r => ({
        date: new Date(r.created_at!).toISOString().split('T')[0],
        score: (r.result as any).healthReport?.riskIndicators?.refactorSafety ?? (r.result as any).healthReport?.score ?? 0
    }));

    // Aggregate trends by date
    const trendsMap: Record<string, number[]> = {};
    trendsRaw.forEach(t => {
        if (!trendsMap[t.date]) trendsMap[t.date] = [];
        trendsMap[t.date].push(t.score);
    });

    const trends = Object.entries(trendsMap).map(([date, scores]) => ({
        date,
        avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    })).sort((a, b) => a.date.localeCompare(b.date));

    return {
        averageSafetyScore: Math.round(totalScore / completed.length),
        totalHotspots: hotspotCount,
        riskDistribution: distribution,
        trends
    };
}

export async function getOwnershipSummary(userId: string) {
    // This will group files by their "Module Purpose" or directory structure
    // effectively showing which 'domains' are most complex.
    const results = await db.select()
        .from(analyses)
        .where(eq(analyses.user_id, userId))
        .orderBy(desc(analyses.created_at))
        .limit(5);

    const completed = results.filter(r => r.status === 'completed' && r.result);
    
    const domainComplexity: Record<string, { totalReach: number, fileCount: number }> = {};

    completed.forEach(r => {
        const data = r.result as any;
        const graph = data.dependencyGraph || {};
        
        Object.values(graph).forEach((node: any) => {
            // Group by top-level folder (domain)
            const parts = node.file.split('/');
            const domain = parts.length > 1 ? parts[0] : 'root';
            
            if (!domainComplexity[domain]) {
                domainComplexity[domain] = { totalReach: 0, fileCount: 0 };
            }
            
            domainComplexity[domain].totalReach += node.couplingScore || 0;
            domainComplexity[domain].fileCount += 1;
        });
    });

    return Object.entries(domainComplexity).map(([domain, stats]) => ({
        domain,
        avgComplexity: Math.round(stats.totalReach / stats.fileCount),
        riskLevel: stats.totalReach / stats.fileCount > 15 ? 'High' : (stats.totalReach / stats.fileCount > 8 ? 'Medium' : 'Low')
    })).sort((a, b) => b.avgComplexity - a.avgComplexity);
}

// ==============================
// Codebase Health Timeline
// ==============================

export interface RepoHealthPoint {
    date: string;
    healthScore: number;
    maturity: string;
    refactorSafety: number;
    testCoverage: string;
    coupling: string;
}

export interface RepoTimeline {
    repoUrl: string;
    repoName: string;
    dataPoints: RepoHealthPoint[];
    currentHealth: number;
    trend: 'improving' | 'declining' | 'stable';
    driftWarning?: string;
}

export async function getHealthTimeline(userId: string): Promise<RepoTimeline[]> {
    const results = await db.select()
        .from(analyses)
        .where(eq(analyses.user_id, userId))
        .orderBy(desc(analyses.created_at))
        .limit(50);

    const completed = results.filter(r => r.status === 'completed' && r.result);

    // Group by repo URL
    const byRepo: Record<string, typeof completed> = {};
    completed.forEach(r => {
        const key = r.repo_url;
        if (!byRepo[key]) byRepo[key] = [];
        byRepo[key].push(r);
    });

    const timelines: RepoTimeline[] = [];

    for (const [repoUrl, repoAnalyses] of Object.entries(byRepo)) {
        // Sort oldest first
        const sorted = repoAnalyses.sort((a, b) => 
            new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        );

        const dataPoints: RepoHealthPoint[] = sorted.map(r => {
            const data = r.result as any;
            return {
                date: r.created_at || new Date().toISOString(),
                healthScore: data?.healthBreakdown?.score ?? data?.healthReport?.score ?? 0,
                maturity: data?.maturity?.rating ?? 'Unknown',
                refactorSafety: data?.riskAndDebt?.refactorSafety?.score ?? 0,
                testCoverage: data?.riskAndDebt?.testCoverage?.level ?? 'None',
                coupling: data?.riskAndDebt?.couplingRisk?.level ?? 'Unknown',
            };
        });

        const currentHealth = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].healthScore : 0;
        
        // Calculate trend
        let trend: 'improving' | 'declining' | 'stable' = 'stable';
        if (dataPoints.length >= 2) {
            const first = dataPoints[0].healthScore;
            const last = dataPoints[dataPoints.length - 1].healthScore;
            const diff = last - first;
            if (diff > 5) trend = 'improving';
            else if (diff < -5) trend = 'declining';
        }

        // Architecture drift detection
        let driftWarning: string | undefined;
        if (dataPoints.length >= 2) {
            const firstMaturity = dataPoints[0].maturity;
            const lastMaturity = dataPoints[dataPoints.length - 1].maturity;
            if (firstMaturity !== lastMaturity) {
                driftWarning = `Maturity shifted from "${firstMaturity}" to "${lastMaturity}"`;
            }
            const firstCoupling = dataPoints[0].coupling;
            const lastCoupling = dataPoints[dataPoints.length - 1].coupling;
            if (firstCoupling !== lastCoupling && lastCoupling === 'High') {
                driftWarning = (driftWarning ? driftWarning + '. ' : '') + `Coupling risk increased to ${lastCoupling}`;
            }
        }

        const repoName = repoUrl.split('/').pop() || repoUrl;

        timelines.push({ repoUrl, repoName, dataPoints, currentHealth, trend, driftWarning });
    }

    return timelines.sort((a, b) => b.dataPoints.length - a.dataPoints.length);
}

