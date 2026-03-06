'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function OAuthDiagnosticsPage() {
  const [checks, setChecks] = useState({
    appwriteConnection: 'checking',
    githubOAuthEnabled: 'checking',
    googleOAuthEnabled: 'checking',
    env: 'checking',
    redirectUrl: 'checking',
    googleRedirectUrl: 'checking',
  });

  useEffect(() => {
    const runDiagnostics = async () => {
      // Check environment variables
      const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
      const googleId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;

      setChecks(prev => ({
        ...prev,
        env: (clientId && googleId) ? 'success' : 'error',
        redirectUrl: 'warning', // No longer strictly dependent on appUrl being set in env
        googleRedirectUrl: 'warning',
      }));

      // Check Appwrite connection
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT + '/health');
        setChecks(prev => ({
          ...prev,
          appwriteConnection: response.ok ? 'success' : 'error',
        }));
      } catch (e) {
        setChecks(prev => ({
          ...prev,
          appwriteConnection: 'error',
        }));
      }

      // Note about GitHub/Google OAuth in Appwrite
      setChecks(prev => ({
        ...prev,
        githubOAuthEnabled: 'warning', // User needs to check manually
        googleOAuthEnabled: 'warning',
      }));
    };

    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'checking':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF6] text-[#1A1A1A] py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-[#1A1A1A]/10 p-8 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight mb-2">OAuth Diagnostics</h1>
          <p className="text-[#1A1A1A]/60 mb-8">Check if your GitHub or Google OAuth setup is configured correctly</p>

          <div className="space-y-6 mb-8">
            {/* Environment Variables */}
            <div className="border border-[#1A1A1A]/10 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                {getStatusIcon(checks.env)}
                <h3 className="font-semibold">Environment Variables</h3>
              </div>
              <div className="text-sm text-[#1A1A1A]/70 ml-8 space-y-1">
                <p>✓ NEXT_PUBLIC_GITHUB_CLIENT_ID: {process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID ? 'Set' : 'Not set'}</p>
                <p>✓ NEXT_PUBLIC_GOOGLE_CLIENT_ID: {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'Set' : 'Not set'}</p>
                <p>✓ NEXT_PUBLIC_APP_URL: {process.env.NEXT_PUBLIC_APP_URL || 'Not set'}</p>
                <p>✓ GITHUB_OAUTH_CLIENT_SECRET: {process.env.GITHUB_OAUTH_CLIENT_SECRET ? 'Set' : 'Not set'}</p>
                <p>✓ GOOGLE_OAUTH_CLIENT_SECRET: {process.env.GOOGLE_OAUTH_CLIENT_SECRET ? 'Set' : 'Not set'}</p>
              </div>
            </div>

            {/* Appwrite Connection */}
            <div className="border border-[#1A1A1A]/10 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                {getStatusIcon(checks.appwriteConnection)}
                <h3 className="font-semibold">Appwrite Connection</h3>
              </div>
              <div className="text-sm text-[#1A1A1A]/70 ml-8">
                {checks.appwriteConnection === 'success' && 'Connected to Appwrite successfully'}
                {checks.appwriteConnection === 'error' && 'Failed to connect to Appwrite'}
                {checks.appwriteConnection === 'checking' && 'Checking connection...'}
              </div>
            </div>

            {/* GitHub OAuth Configuration */}
            <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
              <div className="flex items-center gap-3 mb-3">
                {getStatusIcon(checks.githubOAuthEnabled)}
                <h3 className="font-semibold">GitHub OAuth Configuration</h3>
              </div>
              <div className="text-sm text-[#1A1A1A]/70 ml-8 space-y-3">
                <p><strong>Need to verify manually in Appwrite Console:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Go to Appwrite Console → Your Project</li>
                  <li>Navigate to Settings → OAuth Providers (or Auth)</li>
                  <li>Find GitHub and/or Google and verify they're enabled</li>
                  <li>Confirm Client ID and Secret are entered correctly</li>
                </ol>
              </div>
            </div>

            {/* Redirect URL */}
            <div className="border border-[#1A1A1A]/10 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                {getStatusIcon(checks.redirectUrl)}
                <h3 className="font-semibold">GitHub Callback URL</h3>
              </div>
              <div className="text-sm text-[#1A1A1A]/70 ml-8 space-y-2">
                <p>Your OAuth callback URL should be:</p>
                <code className="block bg-gray-100 p-2 rounded mt-2 font-mono text-xs">
                  {(typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')}/auth/github-callback
                </code>
              </div>
            </div>

            {/* Google Callback URL */}
            <div className="border border-[#1A1A1A]/10 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-3 mb-3">
                {getStatusIcon(checks.googleOAuthEnabled)}
                <h3 className="font-semibold">Google Callback URL</h3>
              </div>
              <div className="text-sm text-[#1A1A1A]/70 ml-8 space-y-2">
                <p>Your Google OAuth callback URL should be:</p>
                <code className="block bg-gray-100 p-2 rounded mt-2 font-mono text-xs">
                  {(typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')}/auth/google-callback
                </code>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h4 className="font-semibold text-blue-900 mb-3">Next Steps:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>If any checks show errors, fix them first</li>
              <li>
                Follow the{' '}
                <Link href="/GITHUB_OAUTH_SETUP.md" className="text-[#FF7D29] font-semibold hover:underline">
                  GitHub OAuth Setup Guide
                </Link>
              </li>
              <li>After configuring in Appwrite, refresh this page</li>
              <li>Try clicking "Continue with GitHub" on the login page</li>
            </ol>
          </div>

          {/* Links */}
          <div className="flex gap-4">
            <Link href="/login" className="flex-1">
              <button className="w-full h-12 bg-[#FF7D29] text-white font-bold rounded-xl hover:bg-[#FF7D29]/90 transition-colors">
                Back to Login
              </button>
            </Link>
            <Link href="/" className="flex-1">
              <button className="w-full h-12 bg-white text-[#1A1A1A] font-bold rounded-xl border-2 border-[#1A1A1A]/10 hover:bg-gray-50 transition-colors">
                Back Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
