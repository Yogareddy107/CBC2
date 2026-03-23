'use client';

import { useState } from 'react';
import { Shield, Loader2, CheckCircle2, AlertCircle, Github, Gitlab, Globe, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { deleteAccountAndData, deleteAllAnalyses, updateProfileName, updateProfilePassword } from '@/app/dashboard/profile/actions';
import { supabase } from '@/lib/supabase-client';

interface ProfileFormProps {
    user: {
        $id: string;
        name: string;
        email: string;
        prefs?: any;
    };
}

export function ProfileForm({ user }: ProfileFormProps) {
    const [name, setName] = useState(user.name || '');
    const [isUpdatingName, setIsUpdatingName] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [isDeletingAnalyses, setIsDeletingAnalyses] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [showDeleteAnalysesModal, setShowDeleteAnalysesModal] = useState(false);
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleUpdateName = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingName(true);
        setMessage(null);

        try {
            const result = await updateProfileName(name);
            if (result.success) {
                setMessage({ type: 'success', text: 'Name updated successfully!' });
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to update name.' });
            }
        } catch (error: unknown) {
            console.error('Error updating name:', error);
            const message = error instanceof Error ? error.message : String(error);
            setMessage({ type: 'error', text: message || 'An unexpected error occurred.' });
        } finally {
            setIsUpdatingName(false);
        }
    };

    const handleUpdatePassword = async () => {
        setIsUpdatingPassword(true);
        setMessage(null);

        try {
            const oldPassword = window.prompt('Enter your current password:');
            if (!oldPassword) {
                setIsUpdatingPassword(false);
                return;
            }

            const newPassword = window.prompt('Enter your new password:');
            if (!newPassword) {
                setIsUpdatingPassword(false);
                return;
            }

            const result = await updateProfilePassword(newPassword, oldPassword);
            if (result.success) {
                setMessage({ type: 'success', text: 'Password updated successfully!' });
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to update password.' });
            }
        } catch (error: unknown) {
            console.error('Error updating password:', error);
            const message = error instanceof Error ? error.message : String(error);
            setMessage({ type: 'error', text: message || 'An unexpected error occurred.' });
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleDeleteAllAnalyses = async () => {
        setIsDeletingAnalyses(true);
        setMessage(null);

        try {
            const result = await deleteAllAnalyses();
            if (result.success) {
                setMessage({ type: 'success', text: 'All analyses deleted successfully.' });
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to delete analyses.' });
            }
        } catch (error: unknown) {
            console.error('Error deleting analyses:', error);
            const message = error instanceof Error ? error.message : String(error);
            setMessage({ type: 'error', text: message || 'An unexpected error occurred.' });
        } finally {
            setIsDeletingAnalyses(false);
            setShowDeleteAnalysesModal(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeletingAccount(true);
        setMessage(null);

        try {
            const result = await deleteAccountAndData();
            if (result.success) {
                setMessage({ type: 'success', text: 'Account deleted. Redirecting...' });
                window.location.href = '/';
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to delete account.' });
            }
        } catch (error: unknown) {
            console.error('Error deleting account:', error);
            const message = error instanceof Error ? error.message : String(error);
            setMessage({ type: 'error', text: message || 'An unexpected error occurred.' });
        } finally {
            setIsDeletingAccount(false);
            setShowDeleteAccountModal(false);
        }
    };
    const handleConnectProvider = async (provider: 'github' | 'gitlab' | 'bitbucket') => {
        setMessage(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard/profile`,
                    scopes: provider === 'github' ? 'repo read:user' : provider === 'gitlab' ? 'read_repository api' : 'repository'
                }
            });
            if (error) throw error;
        } catch (error: any) {
            console.error(`Error connecting ${provider}:`, error);
            setMessage({ type: 'error', text: `Failed to connect ${provider}.` });
        }
    };

    const isProviderConnected = (provider: string) => {
        return !!user.prefs?.[`${provider}_token`];
    };

    return (
        <div className="space-y-16">
            {message && (
                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-500 ${message.type === 'success'
                    ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-700'
                    : 'bg-destructive/5 border-destructive/10 text-destructive'
                    }`}>
                    <div className="flex items-center gap-3">
                        {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5" />}
                        <p className="text-sm font-bold tracking-tight">{message.text}</p>
                    </div>
                    <button onClick={() => setMessage(null)} className="text-xs opacity-50 hover:opacity-100 font-bold uppercase tracking-wider">Dismiss</button>
                </div>
            )}

            {/* Section: Identity */}
            <section className="space-y-8">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <Globe className="w-4 h-4" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Personal Identity</h2>
                </div>

                <form onSubmit={handleUpdateName} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2.5">
                        <label className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">Full Display Name</label>
                        <div className="relative group">
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your Name"
                                className="h-12 bg-slate-50/50 border-slate-200/60 rounded-xl focus-visible:ring-primary/20 focus-visible:bg-white transition-all font-medium"
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium ml-1">This is how you'll appear across team workspaces.</p>
                    </div>

                    <div className="space-y-2.5">
                        <label className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">Registered Email</label>
                        <Input
                            value={user.email}
                            disabled
                            className="h-12 bg-slate-100/30 border-slate-200/50 opacity-100 cursor-not-allowed text-slate-400 font-medium italic rounded-xl"
                        />
                        <p className="text-[10px] text-slate-400 font-medium ml-1">Email is locked to your primary authentication provider.</p>
                    </div>

                    <div className="md:col-span-2">
                        <Button
                            type="submit"
                            disabled={isUpdatingName || name === user.name}
                            className="h-12 px-10 font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-xl transition-all active:scale-95 disabled:opacity-30"
                        >
                            {isUpdatingName ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Synchronizing...
                                </>
                            ) : 'Update Identity'}
                        </Button>
                    </div>
                </form>
            </section>

            {/* Section: Infrastructure Connectivity */}
            <section className="space-y-8">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <Github className="w-4 h-4" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Infrastructure Connectivity</h2>
                </div>
                
                <p className="text-sm text-slate-500 font-medium max-w-xl">
                    Connect your version control providers to unlock private repository analysis and deep system-level insights.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { id: 'github', name: 'GitHub', icon: Github, color: 'hover:border-slate-900 active:bg-slate-50' },
                        { id: 'gitlab', name: 'GitLab', icon: Gitlab, color: 'hover:border-orange-500 active:bg-orange-50' },
                        { id: 'bitbucket', name: 'Bitbucket', icon: Globe, color: 'hover:border-blue-600 active:bg-blue-50' },
                    ].map((provider) => {
                        const connected = isProviderConnected(provider.id);
                        return (
                            <div key={provider.id} className={`p-6 rounded-3xl border border-slate-200/60 bg-white transition-all duration-300 flex flex-col items-center text-center gap-6 group ${provider.color} hover:shadow-xl hover:shadow-slate-200/20`}>
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110 ${connected ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                                    <provider.icon className="w-8 h-8" />
                                </div>
                                
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-900">{provider.name}</p>
                                    {connected ? (
                                        <div className="flex items-center gap-1.5 justify-center text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                            <Check className="w-3 h-3" />
                                            Active
                                        </div>
                                    ) : (
                                        <p className="text-[11px] text-slate-400 font-medium">Not Connected</p>
                                    )}
                                </div>

                                <Button
                                    variant={connected ? "outline" : "default"}
                                    size="sm"
                                    className={`w-full font-bold h-10 rounded-xl transition-all ${connected ? 'border-emerald-200 hover:bg-emerald-50 text-emerald-700' : 'shadow-md shadow-primary/10'}`}
                                    onClick={() => handleConnectProvider(provider.id as any)}
                                >
                                    {connected ? 'Re-verify' : 'Connect'}
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Section: Security */}
            <section className="space-y-8">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <Shield className="w-4 h-4" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Security Gateways</h2>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 rounded-3xl border border-slate-200/60 bg-slate-50/50 hover:bg-white transition-all gap-6">
                    <div className="space-y-1.5">
                        <p className="text-sm font-bold text-slate-900">Credential Management</p>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm">
                            Ensure your authentication protocol is up to date by rotating your password periodically.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="h-11 px-8 font-bold border-slate-200 bg-white hover:bg-slate-50 rounded-xl shadow-sm text-slate-700"
                        onClick={handleUpdatePassword}
                        disabled={isUpdatingPassword}
                    >
                        {isUpdatingPassword ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : 'Change Password'}
                    </Button>
                </div>
            </section>

            {/* Section: Danger Zone */}
            <section className="space-y-8">
                <div className="flex items-center gap-3 border-b border-red-50 pb-5">
                    <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-400">
                        <AlertCircle className="w-4 h-4" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-red-600">Danger Zone</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 rounded-3xl border border-red-100 bg-red-50/20 space-y-6">
                        <div className="space-y-1.5">
                            <p className="text-sm font-bold text-red-900">Purge Data History</p>
                            <p className="text-xs text-red-600/70 font-medium leading-relaxed">
                                Permanently wipe all analyzed reports and historical metadata. This cannot be reversed.
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            className="bg-red-500 hover:bg-red-600 font-bold h-11 px-8 rounded-xl shadow-lg shadow-red-200"
                            onClick={() => setShowDeleteAnalysesModal(true)}
                            disabled={isDeletingAnalyses}
                        >
                            {isDeletingAnalyses ? 'Purging...' : 'Purge All Data'}
                        </Button>
                    </div>

                    <div className="p-8 rounded-3xl border border-red-100 bg-red-50/20 space-y-6">
                        <div className="space-y-1.5">
                            <p className="text-sm font-bold text-red-900">Terminate Account</p>
                            <p className="text-xs text-red-600/70 font-medium leading-relaxed">
                                Fully decommission your account and scrub all PII from the system infrastructure.
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            className="bg-red-500 hover:bg-red-600 font-bold h-11 px-8 rounded-xl shadow-lg shadow-red-200"
                            onClick={() => setShowDeleteAccountModal(true)}
                            disabled={isDeletingAccount}
                        >
                            {isDeletingAccount ? 'Terminating...' : 'Terminate Account'}
                        </Button>
                    </div>
                </div>
            </section>

            <ConfirmModal
                isOpen={showDeleteAnalysesModal}
                title="Confirm Data Purge"
                description="Are you absolutely sure you want to purge your entire analysis history? This action is irreversible."
                confirmLabel="Confirm Purge"
                cancelLabel="Abort"
                isLoading={isDeletingAnalyses}
                onClose={() => setShowDeleteAnalysesModal(false)}
                onConfirm={handleDeleteAllAnalyses}
            />

            <ConfirmModal
                isOpen={showDeleteAccountModal}
                title="Confirm Termination"
                description="This will permanently delete your CheckBeforeCommit account. All data will be scrubbed from our systems."
                confirmLabel="Terminate Account"
                cancelLabel="Abort"
                isLoading={isDeletingAccount}
                onClose={() => setShowDeleteAccountModal(false)}
                onConfirm={handleDeleteAccount}
            />
        </div>
    );
}
