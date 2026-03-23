'use client';

import { useState } from 'react';
import { Plus, Loader2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

export function SystemCreator() {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCreate = async () => {
        if (!name) return;
        setLoading(true);
        try {
            const res = await fetch('/api/systems', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description })
            });
            if (res.ok) {
                setName('');
                setDescription('');
                setIsOpen(false);
                router.refresh();
            }
        } catch (err) {
            console.error("Failed to create system:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/20 hover:bg-indigo-50/50 hover:border-indigo-300 transition-all duration-300 group"
            >
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <Plus className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-indigo-500 group-hover:text-indigo-700 transition-colors">
                    Create New System
                </span>
            </button>
        );
    }

    return (
        <div className="p-8 rounded-2xl bg-white border border-indigo-100 shadow-xl shadow-indigo-500/5 animate-in zoom-in-95 duration-300 space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-900">New System</h3>
                    <p className="text-xs text-slate-500">Group multiple repositories into one architectural view.</p>
                </div>
            </div>

            <div className="space-y-4">
                <Input
                    placeholder="System Name (e.g. Payment Microservices)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500/20 text-sm font-medium"
                />
                <Input
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500/20 text-sm font-medium"
                />
            </div>

            <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl font-bold text-slate-500">
                    Cancel
                </Button>
                <Button
                    onClick={handleCreate}
                    disabled={!name || loading}
                    className="rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-8"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    Create System
                </Button>
            </div>
        </div>
    );
}
