'use client';

import { useState } from 'react';
import {
    Shield,
    Loader2,
    CheckCircle2,
    AlertCircle,
    User,
    Mail,
    Lock,
    Trash2,
    AlertTriangle,
    ChevronRight,
    Settings,
    Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { deleteAccountAndData, deleteAllAnalyses, updateProfileName, updateProfilePassword } from '@/app/dashboard/profile/actions';
import { cn } from '@/lib/utils';

interface ProfileFormProps {
    user: {
        $id: string;
        name: string;
        email: string;
    } | null;
}

export function ProfileForm({ user }: ProfileFormProps) {
    const [name, setName] = useState(user?.name || '');
    const [isUpdatingName, setIsUpdatingName] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [isDeletingAnalyses, setIsDeletingAnalyses] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [showDeleteAnalysesModal, setShowDeleteAnalysesModal] = useState(false);
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    if (!user) return null;

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

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {message && (
                <div className={cn(
                    "p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm",
                    message.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                        : 'bg-destructive/10 border-destructive/20 text-destructive'
                )}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                    <p className="text-sm font-bold">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column - Personal Info */}
                <Card className="md:col-span-2 border-border/40 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-border/10 pb-6">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold tracking-tight text-foreground">Personal Information</CardTitle>
                                <CardDescription className="text-xs">Update your identity and contact details.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-6">
                        <form onSubmit={handleUpdateName} className="space-y-6">
                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
                                        <User className="w-3 h-3" />
                                        Full Name
                                    </label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your Name"
                                        className="h-12 rounded-xl bg-white/50 border-border/30 shadow-none focus-visible:ring-primary/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
                                        <Mail className="w-3 h-3" />
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Input
                                            value={user.email}
                                            disabled
                                            className="h-12 rounded-xl bg-secondary/20 border-border/10 opacity-70 cursor-not-allowed pl-10"
                                        />
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground/50 italic flex items-center gap-1">
                                        <Shield className="w-3 h-3" />
                                        Email is verified and cannot be changed for security.
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={isUpdatingName || name === user.name}
                                className="h-12 px-8 font-bold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50"
                            >
                                {isUpdatingName ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving Changes...
                                    </>
                                ) : 'Save Identity Changes'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Right Column - Quick Actions / Status */}
                <div className="space-y-6">
                    <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden">
                        <CardHeader className="pb-3 border-b border-border/10">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-primary" />
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Account Status</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Verification</span>
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">Verified</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Joined</span>
                                <span className="text-xs font-bold text-foreground">Mar 2026</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden">
                        <CardHeader className="pb-3 border-b border-border/10">
                            <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-primary" />
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Security</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <p className="text-xs text-muted-foreground mb-4">Keep your account secure by rotating your password regularly.</p>
                            <Button
                                variant="outline"
                                className="w-full h-11 rounded-xl font-bold border-border/40 hover:bg-primary/5 hover:text-primary transition-all text-xs"
                                onClick={handleUpdatePassword}
                                disabled={isUpdatingPassword}
                            >
                                {isUpdatingPassword ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        Update Password
                                        <ChevronRight className="ml-2 w-4 h-4 opacity-30" />
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Bottom Section - Danger Zone */}
            <Card className="border-red-100 bg-red-50/10 shadow-sm overflow-hidden border">
                <CardHeader className="border-b border-red-100/50 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-100 text-red-600">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-red-700">Danger Zone</CardTitle>
                            <CardDescription className="text-xs text-red-600/70 text-bold font-bold uppercase tracking-widest pt-2">Irreversible Actions</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl border border-red-100 bg-white/50 space-y-4 hover:shadow-md transition-shadow">
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-red-700 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-red-500" />
                                Delete Repository Analysis Data
                            </p>
                            <p className="text-[11px] text-red-600/70 leading-relaxed font-bold">Permanently remove all of your saved repository analysis reports and history.</p>
                        </div>
                        <Button
                            variant="destructive"
                            className="w-full h-11 rounded-xl font-bold shadow-none hover:shadow-lg transition-all"
                            onClick={() => setShowDeleteAnalysesModal(true)}
                            disabled={isDeletingAnalyses}
                        >
                            {isDeletingAnalyses ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Deleting Data...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Purge Analysis History
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="p-6 rounded-2xl border border-red-100 bg-white/50 space-y-4 hover:shadow-md transition-shadow">
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-red-700 flex items-center gap-2">
                                <Trash2 className="w-4 h-4 text-red-500" />
                                Terminate Account Permanently
                            </p>
                            <p className="text-[11px] text-red-600/70 leading-relaxed font-bold">Irreversibly delete your account, subscriptions, and all data from our systems.</p>
                        </div>
                        <Button
                            variant="destructive"
                            className="w-full h-11 rounded-xl font-bold border-2 border-red-600 bg-transparent text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-none outline-none group"
                            onClick={() => setShowDeleteAccountModal(true)}
                            disabled={isDeletingAccount}
                        >
                            {isDeletingAccount ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Deleting Account...
                                </>
                            ) : (
                                <>
                                    Delete Account
                                    <ChevronRight className="ml-2 w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <ConfirmModal
                isOpen={showDeleteAnalysesModal}
                title="Purge Analysis History?"
                description="This will permanently delete all of your saved analyses. This action cannot be undone."
                confirmLabel="Confirm Purge"
                cancelLabel="Keep My Data"
                isLoading={isDeletingAnalyses}
                onClose={() => setShowDeleteAnalysesModal(false)}
                onConfirm={handleDeleteAllAnalyses}
            />

            <ConfirmModal
                isOpen={showDeleteAccountModal}
                title="Terminate Your Account?"
                description="This will permanently delete your account and all associated data. This action is irreversible."
                confirmLabel="Yes, Terminate Account"
                cancelLabel="Cancel Termination"
                isLoading={isDeletingAccount}
                onClose={() => setShowDeleteAccountModal(false)}
                onConfirm={handleDeleteAccount}
            />
        </div>
    );
}
