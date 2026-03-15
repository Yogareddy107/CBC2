import { createSessionClient } from '@/lib/appwrite';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/dashboard/ProfileForm';
import { db } from '@/lib/db';
import { analyses as analysesTable } from '@/lib/db/schema';
import { count, eq } from 'drizzle-orm';
import { User, Activity, ShieldCheck } from 'lucide-react';

export default async function ProfilePage() {
    let user: { $id: string, email: string, name: string } | null = null;

    try {
        const { account } = await createSessionClient();
        const appwriteUser = await account.get();
        user = {
            $id: appwriteUser.$id,
            email: appwriteUser.email,
            name: appwriteUser.name,
        };
    } catch (e) {
        redirect('/login');
    }

    // Fetch some basic stats for the profile header
    let totalAnalyses = 0;
    try {
        const [result] = await db.select({ value: count() })
            .from(analysesTable)
            .where(eq(analysesTable.user_id, user.$id));
        totalAnalyses = result?.value || 0;
    } catch (e) {
        console.error("Error fetching stats:", e);
    }

    const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 space-y-8">
            {/* Professional Header Section */}
            <div className="relative overflow-hidden rounded-[32px] border border-border/20 bg-white shadow-sm">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
                
                <div className="p-8 md:p-12 flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                    {/* Avatar / Initials */}
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-3xl font-bold text-primary tracking-tighter">{initials}</span>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-6">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">{user.name || 'User'}</h1>
                            <p className="text-muted-foreground text-sm font-medium">{user.email}</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8 pt-2">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/30 border border-border/5">
                                <Activity className="w-4 h-4 text-primary" />
                                <div className="text-left">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Analyses</p>
                                    <p className="text-sm font-bold text-[#1A1A1A]">{totalAnalyses}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/30 border border-border/5">
                                <ShieldCheck className="w-4 h-4 text-primary" />
                                <div className="text-left">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Account Level</p>
                                    <p className="text-sm font-bold text-[#1A1A1A]">Developer</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <div className="space-y-10 rounded-[32px] border border-border/20 bg-white shadow-sm p-8 md:p-12">
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Security & Preferences</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
                        Manage your repository access tokens, security credentials, and personal information directly from this dashboard.
                    </p>
                </div>

                <ProfileForm user={user} />
            </div>
        </div>
    );
}
