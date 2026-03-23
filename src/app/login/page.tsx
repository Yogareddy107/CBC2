'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Loader2, AlertCircle, Compass, Eye, EyeOff } from 'lucide-react';
import { signInWithEmail, signUpWithEmail } from '../auth/actions';
import { signInWithGoogleClient, signInWithGitHubClient } from '@/lib/appwrite-client';


function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mode, setMode] = useState<'signin' | 'signup'>(searchParams.get('mode') === 'signup' ? 'signup' : 'signin');
    const [forgotMode, setForgotMode] = useState(false);
    const [emailValue, setEmailValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const next = searchParams.get('next') || '/dashboard';
    const isLimitReached = searchParams.get('meta') === 'limit_reached';
    const authError = searchParams.get('error');

    useEffect(() => {
        if (isLimitReached) {
            setMode('signup');
        }

        // Display OAuth errors if present
        if (authError) {
            setError(decodeURIComponent(authError));
        }
    }, [isLimitReached, authError]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData(e.currentTarget);
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (mode === 'signup' && password !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        try {
            const res = (mode === 'signin'
                ? await signInWithEmail(formData)
                : await signUpWithEmail(formData)) as any;

            if (res?.error) {
                setError(res.error);
                setLoading(false);
            } else if (res?.success) {
                setSuccess(res.message || 'Success! Redirecting...');
                // if the user is an admin, go to admin dashboard regardless of `next`
                if (res.isAdmin) {
                    router.push('/admin');
                } else {
                    router.push(next);
                }
            }
        } catch (err: any) {
            if (err.message !== 'NEXT_REDIRECT') {
                setError(err.message || 'An unexpected error occurred.');
            }
            setLoading(false);
        }
    };


    const handleGoogleLogin = async () => {
        try {
            setError('');
            setLoading(true);

            const response = await fetch('/api/auth/google-oauth');
            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else if (data.error) {
                setError(data.error);
                setLoading(false);
            }
        } catch (err: any) {
            console.error('Google login error:', err);
            setError(err.message || 'Failed to initiate Google login');
            setLoading(false);
        }
    };

    const handleGitHubLogin = async () => {
        try {
            setError('');
            setLoading(true);
            await signInWithGitHubClient();
        } catch (err: any) {
            console.error('GitHub login error:', err);
            setError(err.message || 'Failed to initiate GitHub login');
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#FFFDF6] text-[#1A1A1A]">
            {/* Left Column: Organic Visual Asset */}
            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden border-r border-[#1A1A1A]/5"
                style={{
                    backgroundColor: '#F04B3E',
                    backgroundImage: `
                     radial-gradient(at 0% 0%, #FFB677 0px, transparent 50%),
                     radial-gradient(at 100% 0%, #F04B3E 0px, transparent 50%),
                     radial-gradient(at 50% 100%, #FF782D 0px, transparent 50%),
                     radial-gradient(at 100% 100%, #F04B3E 0px, transparent 50%),
                     radial-gradient(at 0% 100%, #FF782D 0px, transparent 50%)
                   `
                }}>
                {/* Subtle Text Overlays */}
                <div className="absolute inset-0 bg-white/5 opacity-40 mix-blend-overlay pointer-events-none" />

                <div className="relative z-10 p-16 max-w-xl space-y-12">
                    <div className="flex items-center gap-3 text-2xl font-bold tracking-tight text-white backdrop-blur-md bg-white/10 w-fit px-6 py-3 rounded-2xl border border-white/20 shadow-xl">
                        <Compass className="text-white w-6 h-6" />
                        Check<span className="text-black">Before</span>Commit
                    </div>
                    <div className="space-y-8">
                        <h2 className="text-5xl font-bold tracking-tight text-white leading-[1.1]">
                            Stop guessing. <br />
                            Start knowing.
                        </h2>
                        <p className="text-white/80 text-xl font-medium leading-relaxed max-w-md">
                            Helping engineers turn complex repositories into clear technical insights.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-8">
                        {[
                            { label: 'Instant Discovery', desc: 'Zero-setup repo analysis' },
                            { label: 'Deep Mapping', desc: 'Full structural intelligence' }
                        ].map((stat, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
                                <div className="text-white font-bold text-lg">{stat.label}</div>
                                <div className="text-white/60 text-xs font-medium uppercase tracking-wider">{stat.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Auth Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-12 bg-[#FFFDF6]">
                <div className="max-w-md w-full mx-auto space-y-10">
                    <div className="space-y-2 lg:hidden">
                        <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-[#1A1A1A]">
                            <Compass className="text-[#FF7D29] w-6 h-6" />
                            Check<span className="text-black">Before</span>Commit
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">
                            {mode === 'signin' ? 'Welcome back' : 'Get started for free'}
                        </h1>
                        <p className="text-[#1A1A1A]/60 text-md font-medium">
                            {mode === 'signin'
                                ? 'Log in to access your analysis dashboard.'
                                : 'Create an account to analyze your first repository.'}
                        </p>
                    </div>

                    {isLimitReached && (
                        <div className="p-4 rounded-2xl bg-[#FF7D29]/5 border border-[#FF7D29]/10 flex gap-3 text-sm text-[#FF7D29] animate-in fade-in slide-in-from-top-2 duration-500">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="leading-relaxed font-medium">
                                You’ve reached the free analysis limit.
                                <br />
                                <span className="font-bold opacity-80">Create an account to continue.</span>
                            </p>
                        </div>
                    )}

                    <div className="space-y-8" suppressHydrationWarning>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button
                                variant="outline"
                                className="flex items-center justify-center gap-3 w-full h-14 text-md font-bold border-[#1A1A1A]/5 hover:bg-white hover:border-[#1A1A1A]/10 bg-white shadow-sm transition-all rounded-2xl group"
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                suppressHydrationWarning
                            >
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M21.35 11.1h-9.36v2.92h5.54c-.24 1.28-1.4 3.75-5.54 3.75-3.33 0-6.04-2.76-6.04-6.17s2.71-6.17 6.04-6.17c1.9 0 3.17.81 3.9 1.5l2.65-2.56C17.3 3.15 14.58 2 11 2 5.48 2 1 6.48 1 12s4.48 10 10 10c5.77 0 9.95-4.04 9.95-9.77 0-.66-.07-1.17-.15-1.43z" />
                                </svg>
                                <span>Google</span>
                            </Button>

                            <Button
                                variant="outline"
                                className="flex items-center justify-center gap-3 w-full h-14 text-md font-bold border-[#1A1A1A]/5 hover:bg-white hover:border-[#1A1A1A]/10 bg-white shadow-sm transition-all rounded-2xl group"
                                onClick={handleGitHubLogin}
                                disabled={loading}
                                suppressHydrationWarning
                            >
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                </svg>
                                <span>GitHub</span>
                            </Button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-[#1A1A1A]/5" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                                <span className="bg-[#FFFDF6] px-4 text-[#1A1A1A]/30">Or use email</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
                            {error && (
                                <div className="space-y-3">
                                    <div className="p-4 text-sm rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center gap-3 font-medium" suppressHydrationWarning>
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        {error}
                                    </div>
                                </div>
                            )}
                            {success && (
                                <div className="p-4 text-sm rounded-2xl bg-green-50 border border-green-100 text-green-600 flex items-center gap-3 font-medium">
                                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                    {success}
                                </div>
                            )}

                            <div className="space-y-2" suppressHydrationWarning>
                                <Label htmlFor="email" className="text-[#1A1A1A]/60 font-bold text-xs uppercase tracking-wider ml-1">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    value={emailValue}
                                    onChange={(e) => setEmailValue(e.target.value)}
                                    className="h-12 bg-white border-[#1A1A1A]/10 focus:border-[#FF7D29] focus:ring-[#FF7D29]/20 transition-all rounded-xl shadow-sm"
                                    required
                                    suppressHydrationWarning
                                />
                            </div>
                            <div className="space-y-2" suppressHydrationWarning>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-[#1A1A1A]/60 font-bold text-xs uppercase tracking-wider ml-1">Password</Label>
                                    {mode === 'signin' && (
                                        <button type="button" onClick={() => setForgotMode(true)} className="text-xs font-bold text-[#FF7D29] hover:underline transition-all" suppressHydrationWarning>
                                            Forgot?
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className="h-12 bg-white border-[#1A1A1A]/10 focus:border-[#FF7D29] focus:ring-[#FF7D29]/20 transition-all rounded-xl shadow-sm pr-12"
                                        required
                                        suppressHydrationWarning
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(s => !s)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/50 hover:text-[#1A1A1A]"
                                        suppressHydrationWarning
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            {forgotMode && mode === 'signin' && (
                                <div className="p-6 rounded-2xl border border-[#FF7D29]/20 bg-[#FF7D29]/5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-[#1A1A1A]">Reset your password</p>
                                        <p className="text-xs text-[#1A1A1A]/60 font-medium">Enter your email and we'll send a recovery link.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            type="email"
                                            placeholder="name@company.com"
                                            value={emailValue}
                                            onChange={(e) => setEmailValue(e.target.value)}
                                            className="h-12 bg-white border-[#1A1A1A]/10 focus:border-[#FF7D29] focus:ring-[#FF7D29]/20 transition-all rounded-xl shadow-sm"
                                        />
                                        <Button
                                            onClick={async () => {
                                                if (!emailValue) return setError('Please enter your email');
                                                setLoading(true);
                                                setError('');
                                                setSuccess('');
                                                try {
                                                    const res = await fetch('/api/auth/recover', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            email: emailValue,
                                                            redirectUrl: window.location.origin + '/reset-password'
                                                        })
                                                    });
                                                    const data = await res.json();
                                                    if (data?.error) setError(data.error);
                                                    else setSuccess(data.message || 'If the email exists, a recovery link was sent.');
                                                } catch (e: any) {
                                                    setError('Failed to send recovery email');
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }}
                                            className="h-12 bg-[#FF7D29] text-white hover:bg-[#FF7D29]/90 font-bold px-6 rounded-xl"
                                            disabled={loading}
                                        >
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
                                        </Button>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            className="text-xs font-bold text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors"
                                            type="button"
                                            onClick={() => setForgotMode(false)}
                                        >
                                            Go back
                                        </button>
                                    </div>
                                </div>
                            )}
                            {mode === 'signup' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-300" suppressHydrationWarning>
                                    <Label htmlFor="confirmPassword" className="text-[#1A1A1A]/60 font-bold text-xs uppercase tracking-wider ml-1">Confirm Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            className="h-12 bg-white border-[#1A1A1A]/10 focus:border-[#FF7D29] focus:ring-[#FF7D29]/20 transition-all rounded-xl shadow-sm pr-12"
                                            required
                                            suppressHydrationWarning
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(s => !s)}
                                            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/50 hover:text-[#1A1A1A]"
                                            suppressHydrationWarning
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <Button type="submit" className="w-full h-14 text-md font-bold bg-[#FF7D29] text-white hover:bg-[#FF7D29]/90 shadow-lg shadow-[#FF7D29]/20 transition-all active:scale-[0.98] rounded-2xl" disabled={loading} suppressHydrationWarning>
                                {loading ? <Loader2 className="animate-spin" /> : mode === 'signin' ? 'Sign in' : 'Create free account'}
                            </Button>
                        </form>

                        <div className="text-center pt-2">
                            <span className="text-[#1A1A1A]/50 text-sm font-medium">
                                {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
                            </span>{' '}
                            <button
                                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                                className="text-[#FF7D29] font-bold text-sm hover:underline transition-all ml-1"
                                suppressHydrationWarning
                            >
                                {mode === 'signin' ? 'Sign up' : 'Log in'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center bg-[#FFFDF6]">
                <Loader2 className="animate-spin text-[#FF7D29] w-8 h-8" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}

