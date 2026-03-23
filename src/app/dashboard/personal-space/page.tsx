import { createSessionClient } from '@/lib/appwrite';
import { redirect } from 'next/navigation';
import { HookGenerator } from '@/components/dashboard/HookGenerator';
import { APIKeyManager } from '@/components/dashboard/APIKeyManager';
import { ShieldCheck, Key, Zap } from 'lucide-react';

export default async function PersonalSpacePage() {
    let user: { $id: string, email: string, name: string, prefs?: any } | null = null;

    try {
        const { account } = await createSessionClient();
        const appwriteUser = await account.get();
        const prefs = await account.getPrefs();
        user = {
            $id: appwriteUser.$id,
            email: appwriteUser.email,
            name: appwriteUser.name,
            prefs: prefs ? { ...prefs } : {},
        };
    } catch (e) {
        redirect('/login');
    }

    if (!user) return null;

    return (
        <div className="relative min-h-screen bg-slate-50/20">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] -z-10 rounded-full" />
            
            <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
                <header className="text-center space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="space-y-4">
                        <div className="flex justify-center mb-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary backdrop-blur-sm shadow-sm ring-1 ring-primary/5">
                                <Zap className="w-3.5 h-3.5" />
                                Pro Developer Tools
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] max-w-4xl mx-auto leading-tight">
                            Personal Space
                        </h1>
                        <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
                            Your professional workspace for local repository protection, IDE integrations, and advanced developer tools.
                        </p>
                    </div>
                </header>

                <div className="space-y-12">
                    {/* Integrated Tools Section */}
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Advanced Workflow</h2>
                                <p className="text-xs text-slate-400 font-medium italic">Local Repository Guard</p>
                            </div>
                        </div>
                        
                        <div className="p-1 md:p-8 rounded-[32px] border border-slate-200/60 bg-white shadow-xl shadow-slate-200/20 hover:border-primary/20 transition-colors">
                            <HookGenerator user={{ $id: user.$id, prefs: user.prefs }} />
                        </div>
                    </div>


                    {/* IDE Integration Section */}
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                                <Key className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900">IDE Integration</h2>
                                <p className="text-xs text-slate-400 font-medium italic">Extension & API Access</p>
                            </div>
                        </div>
                        
                        <div className="p-1 md:p-8 rounded-[32px] border border-slate-200/60 bg-white shadow-xl shadow-slate-200/20 hover:border-primary/20 transition-colors">
                            <APIKeyManager />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
