import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { analyses as analysesTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://checkbeforecommit.vercel.app';
    const lastModified = new Date();

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified,
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/login`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/cookies`,
            lastModified,
            changeFrequency: 'yearly',
            priority: 0.2,
        },
    ];

    // Dynamic pages — published analysis reports (completed only)
    let dynamicPages: MetadataRoute.Sitemap = [];
    try {
        const completedAnalyses = await db.select({
            id: analysesTable.id,
            created_at: analysesTable.created_at,
        })
        .from(analysesTable)
        .where(eq(analysesTable.status, 'completed'))
        .limit(500); // Cap for performance

        dynamicPages = completedAnalyses.map((a) => ({
            url: `${baseUrl}/report/${a.id}`,
            lastModified: a.created_at ? new Date(a.created_at) : lastModified,
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }));
    } catch {
        // DB unavailable at build time — just use static pages
    }

    return [...staticPages, ...dynamicPages];
}
