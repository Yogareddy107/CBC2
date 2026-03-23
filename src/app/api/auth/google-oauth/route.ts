import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite';
import { OAuthProvider } from 'node-appwrite';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
    try {
        const ip = request.headers.get('x-forwarded-for') || 'anonymous';
        const { success } = rateLimit(`google-oauth-${ip}`, 5, 60 * 1000);
        if (!success) {
            return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
        }
        const { account } = await createAdminClient();

        const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
        const protocol = request.headers.get('x-forwarded-proto') || 'https';
        const fallbackOrigin = host ? `${protocol}://${host}` : request.nextUrl.origin;

        const appUrl = process.env.NEXT_PUBLIC_APP_URL;
        const origin = appUrl || fallbackOrigin;
        const redirectUrl = `${origin}/auth/google-callback`;

        console.log('Google OAuth Request:', {
            provider: 'google',
            redirectUrl,
            success: `${redirectUrl}?success=true`,
            failure: `${redirectUrl}?failure=true`,
        });

        // Create OAuth token URL
        const loginUrl = await account.createOAuth2Token(
            OAuthProvider.Google,
            `${redirectUrl}?success=true`,
            `${redirectUrl}?failure=true`
        );

        console.log('Google OAuth URL Created:', loginUrl);
        return NextResponse.json({ url: loginUrl });
    } catch (error: any) {
        console.error('Google OAuth error:', {
            message: error.message,
            code: error.code,
            type: error.type,
            response: error.response,
        });
        return NextResponse.json(
            {
                error: error.message || 'Failed to initiate Google login',
                code: error.code,
                type: error.type
            },
            { status: 500 }
        );
    }
}
