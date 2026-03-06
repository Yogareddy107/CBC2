import { createSessionClient } from '@/lib/appwrite';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/dashboard/ProfileForm';
import { User } from 'lucide-react';

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

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 space-y-12 animate-in fade-in duration-500">
            {/* Hero Section */}
            <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFFDF6] via-white to-amber-50/30 border border-amber-100/20 p-8 md:p-12 text-center space-y-4 shadow-sm">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <User className="w-64 h-64 -rotate-12" />
                </div>

                <div className="space-y-2 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                        <User className="w-3 h-3" />
                        Personal Profile
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                        Account <span className="text-primary">Settings</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                        Manage your profile information, security preferences, and account data.
                    </p>
                </div>
            </header>

            <ProfileForm user={user} />
        </div>
    );
}
