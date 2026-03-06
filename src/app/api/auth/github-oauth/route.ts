import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite';
import { OAuthProvider } from 'node-appwrite';

export async function GET(request: NextRequest) {
    try {
        const { account } = await createAdminClient();

        const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
        const redirectUrl = `${origin}/auth/github-callback`;

        console.log('GitHub OAuth Request:', {
            provider: 'github',
            redirectUrl,
            success: `${redirectUrl}?success=true`,
            failure: `${redirectUrl}?failure=true`,
        });

        // Create OAuth token URL
        const loginUrl = await account.createOAuth2Token(
            OAuthProvider.Github,
            `${redirectUrl}?success=true`,
            `${redirectUrl}?failure=true`
        );

        console.log('GitHub OAuth URL Created:', loginUrl);
        return NextResponse.json({ url: loginUrl });
    } catch (error: any) {
        console.error('GitHub OAuth error:', {
            message: error.message,
            code: error.code,
            type: error.type,
            response: error.response,
        });
        return NextResponse.json(
            {
                error: error.message || 'Failed to initiate GitHub login',
                code: error.code,
                type: error.type
            },
            { status: 500 }
        );
    }
}
