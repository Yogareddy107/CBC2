import { Client, Account, OAuthProvider, ID } from 'appwrite';
import { supabase } from './supabase-client';


export const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);
export { ID };



export async function signInWithGitHubClient() {

  const origin = typeof window !== 'undefined'
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_APP_URL || 'https://checkbeforecommit.vercel.app');
  
  await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${origin}/api/auth/callback?next=/dashboard`,
    },
  });
}

export async function signInWithGoogleClient() {
  const origin = typeof window !== 'undefined'
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_APP_URL || 'https://checkbeforecommit.vercel.app');
  const redirectUrl = `${origin}/auth/google-callback`;
  const failureUrl = `${origin}/login?error=${encodeURIComponent('Google authentication was cancelled.')}`;

  try {
    // This will redirect the browser automatically to Google
    // No need to return anything - the browser will navigate away
    await account.createOAuth2Session(OAuthProvider.Google, redirectUrl, failureUrl);
  } catch (error: any) {
    console.error('Google OAuth init error:', error);
    throw new Error(error.message || 'Failed to initiate Google login');
  }
}
