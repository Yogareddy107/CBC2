import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { analyses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Verify the analysis exists
        const [analysis] = await db.select()
            .from(analyses)
            .where(eq(analyses.slug, slug))
            .limit(1);

        if (!analysis) {
            return new NextResponse('Not found', { status: 404 });
        }

        // SVG Badge format "Analyzed by CBC | Protected"
        const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="20">
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <mask id="a">
    <rect width="160" height="20" rx="3" fill="#fff"/>
  </mask>
  <g mask="url(#a)">
    <rect width="95" height="20" fill="#555"/>
    <rect x="95" width="65" height="20" fill="#FF7D29"/>
    <rect width="160" height="20" fill="url(#b)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="47.5" y="15" fill="#010101" fill-opacity=".3">Analyzed By</text>
    <text x="47.5" y="14">Analyzed By</text>
    <text x="126.5" y="15" fill="#010101" fill-opacity=".3">CBC</text>
    <text x="126.5" y="14">CBC</text>
  </g>
</svg>
        `.trim();

        return new NextResponse(svg, {
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600'
            }
        });
    } catch (error) {
        return new NextResponse('Internal Error', { status: 500 });
    }
}
