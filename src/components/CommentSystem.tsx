'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send, X, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addComment, getComments } from '@/app/team/actions';
import { cn } from '@/lib/utils';

export function CommentSystem({ 
    analysisId, 
    sectionId,
    isOpen,
    onClose
}: { 
    analysisId: string, 
    sectionId: string,
    isOpen: boolean,
    onClose: () => void
}) {
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadComments();
        }
    }, [isOpen]);

    const loadComments = async () => {
        setLoading(true);
        const res = await getComments(analysisId);
        if (res.success && res.comments) {
            // Filter comments for this section
            setComments(res.comments.filter((c: any) => c.section_id === sectionId));
        }
        setLoading(false);
    };

    const handleSend = async () => {
        if (!newComment.trim()) return;
        setSending(true);
        const res = await addComment(analysisId, sectionId, newComment);
        if (res.success) {
            setComments(prev => [res.comment, ...prev]);
            setNewComment('');
        }
        setSending(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 border-l border-border flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/10">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <h3 className="font-bold text-sm">Section Discussion</h3>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-md">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-xs text-muted-foreground">No comments yet. Start the conversation!</p>
                    </div>
                ) : (
                    comments.map((c) => (
                        <div key={c.id} className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="w-3 h-3 text-primary" />
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                                    {new Date(c.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="bg-secondary/5 p-3 rounded-xl border border-border/40">
                                <p className="text-xs font-medium text-foreground">{c.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 border-t border-border bg-white">
                <div className="relative">
                    <Input 
                        placeholder="Add a comment..." 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        className="pr-10 text-xs rounded-xl"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={sending || !newComment.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-primary hover:text-primary/80 disabled:opacity-30"
                    >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
