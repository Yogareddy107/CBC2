import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://checkbeforecommit.vercel.app';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/dashboard/',
                    '/admin/',
                    '/api/',
                    '/auth/',
                    '/settings/',
                    '/team/',
                    '/pr-review/',
                    '/impact/',
                    '/oauth-diagnostics/',
                    '/oauth-test/',
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: [
                    '/',
                    '/login',
                    '/terms',
                    '/privacy',
                    '/cookies',
                    '/report/',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    };
}
