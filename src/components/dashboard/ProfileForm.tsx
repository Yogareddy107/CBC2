'use client';

import { useState } from 'react';
import { Shield, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { deleteAccountAndData, deleteAllAnalyses, updateProfileName, updateProfilePassword } from '@/app/dashboard/profile/actions';

interface ProfileFormProps {
    user: {
        $id: string;
        name: string;
        email: string;
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

    return (
        <div className="space-y-12">
            {message && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success'
                    ? 'bg-green-500/10 border-green-500/20 text-green-600'
                    : 'bg-destructive/10 border-destructive/20 text-destructive'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <p className="text-sm font-medium">{message.text}</p>
                </div>
            )}

            <section className="space-y-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 border-b border-border/20 pb-4">Personal Information</h2>
                <form onSubmit={handleUpdateName} className="grid gap-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Full Name</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Name"
                            className="max-w-md h-10 focus-visible:ring-primary/20"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Email Address</label>
                        <Input
                            value={user.email}
                            disabled
                            className="max-w-md h-10 bg-secondary/30 opacity-60 cursor-not-allowed"
                        />
                        <p className="text-[10px] text-muted-foreground/50 italic">Email cannot be changed directly for security reasons.</p>
                    </div>
                    <Button
                        type="submit"
                        disabled={isUpdatingName || name === user.name}
                        className="w-fit h-10 px-8 font-semibold transition-all active:scale-95"
                    >
                        {isUpdatingName ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : 'Save Changes'}
                    </Button>
                </form>
            </section>

            <section className="space-y-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 border-b border-border/20 pb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Security
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 rounded-2xl border border-border/20 bg-white shadow-sm">
                        <div className="space-y-1">
                            <p className="text-sm font-semibold">Password Management</p>
                            <p className="text-[11px] text-muted-foreground">Update your password to keep your account safe.</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="font-semibold"
                            onClick={handleUpdatePassword}
                            disabled={isUpdatingPassword}
                        >
                            {isUpdatingPassword ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : 'Update Password'}
                        </Button>
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 border-b border-border/20 pb-4">Danger Zone</h2>
                <div className="space-y-4">
                    <div className="flex flex-col gap-3 p-5 rounded-2xl border border-border/20 bg-white shadow-sm">
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-destructive">Delete all analyses</p>
                            <p className="text-[11px] text-muted-foreground">Permanently remove all of your saved analysis reports. This cannot be undone.</p>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="w-fit font-semibold"
                            onClick={() => setShowDeleteAnalysesModal(true)}
                            disabled={isDeletingAnalyses}
                        >
                            {isDeletingAnalyses ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete all analyses'
                            )}
                        </Button>
                    </div>

                    <div className="flex flex-col gap-3 p-5 rounded-2xl border border-border/20 bg-white shadow-sm">
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-destructive">Delete account</p>
                            <p className="text-[11px] text-muted-foreground">Permanently delete your account and all associated data (analyses, subscription info, etc.).</p>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="w-fit font-semibold"
                            onClick={() => setShowDeleteAccountModal(true)}
                            disabled={isDeletingAccount}
                        >
                            {isDeletingAccount ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete account'
                            )}
                        </Button>
                    </div>
                </div>
            </section>

            <ConfirmModal
                isOpen={showDeleteAnalysesModal}
                title="Delete all analyses"
                description="This will permanently delete all of your saved analyses. This action cannot be undone."
                confirmLabel="Delete all analyses"
                cancelLabel="Keep my analyses"
                isLoading={isDeletingAnalyses}
                onClose={() => setShowDeleteAnalysesModal(false)}
                onConfirm={handleDeleteAllAnalyses}
            />

            <ConfirmModal
                isOpen={showDeleteAccountModal}
                title="Delete account"
                description="This will permanently delete your account and all associated data (analyses, subscriptions, etc.). This action cannot be undone."
                confirmLabel="Delete account"
                cancelLabel="Keep my account"
                isLoading={isDeletingAccount}
                onClose={() => setShowDeleteAccountModal(false)}
                onConfirm={handleDeleteAccount}
            />
        </div>
    );
}
