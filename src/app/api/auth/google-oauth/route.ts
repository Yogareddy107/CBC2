import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite';
import { OAuthProvider } from 'node-appwrite';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
    try {
        const { isLimited } = await rateLimit(request, { limit: 5, windowMs: 60 * 1000 });
        if (isLimited) {
            return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
        }
        const { account } = await createAdminClient();

        const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
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
