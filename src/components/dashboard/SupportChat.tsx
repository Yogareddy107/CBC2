'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, ChevronRight, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

type Conversation = {
  id: string;
  status: 'open' | 'resolved';
  created_at: string;
  lastMessage?: string;
  unread?: number;
};

type Message = {
  id: string;
  sender_type: 'user' | 'admin';
  message: string;
  status: 'unread' | 'read';
  created_at: string;
};

export function SupportChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) ?? conversations[0],
    [activeConversationId, conversations]
  );

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/support/conversations');
      const data = await res.json();
      const convos = data.conversations || [];
      setConversations(convos);
      if (!activeConversationId && convos.length > 0) {
        setActiveConversationId(convos[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeConversationId]);

  const fetchMessages = useCallback(
    async (conversationId: string) => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
        const data = await res.json();
        setMessages(data.messages || []);
        // After reading messages, refresh conversation list to update unread badge
        fetchConversations();
      } catch (err) {
        console.error('Failed to load messages', err);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchConversations]
  );

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => {
      fetchConversations();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    if (!activeConversationId) return;

    fetchMessages(activeConversationId);
    const messageInterval = setInterval(() => {
      fetchMessages(activeConversationId);
    }, 4000);

    return () => clearInterval(messageInterval);
  }, [activeConversationId, fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage() {
    if (!messageInput.trim()) return;

    setIsLoading(true);
    try {
      const payload: Record<string, unknown> = {
        sender: 'user',
        message: messageInput,
      };

      if (activeConversation?.id) {
        payload.conversationId = activeConversation.id;
      }

      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Unknown API error' }));
        console.error('[FRONTEND CHAT SEND] Error:', res.status, errData);
        throw new Error(`Failed to send message: ${errData.error || res.statusText}`);
      }

      const data = await res.json();
      if (data.conversationId) {
        await fetchConversations();
        setActiveConversationId(data.conversationId);
      }

      setMessageInput('');
      if (activeConversation?.id || data.conversationId) {
        await fetchMessages(data.conversationId ?? activeConversation.id);
      }
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleStartNewConversation = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/support/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello, I need help.' }),
      });
      const data = await res.json();
      if (data.conversationId) {
        await fetchConversations();
        setActiveConversationId(data.conversationId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="col-span-1 border-border/40 bg-card/60 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-border/10 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <MessageCircle className="w-5 h-5" />
            </div>
            <CardTitle className="text-lg font-bold">Conversations</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">Manager your active support sessions.</p>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-4">
            <Button
              size="sm"
              className="w-full h-10 rounded-xl font-bold gap-2 shadow-sm transition-all hover:shadow-md"
              onClick={handleStartNewConversation}
              disabled={isLoading}
            >
              <MessageCircle className="w-4 h-4" />
              New Conversation
            </Button>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {conversations.length === 0 && (
                <div className="text-sm text-muted-foreground">No conversations yet. Start a new chat.</div>
              )}
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => setActiveConversationId(conversation.id)}
                  className={cn(
                    "w-full text-left rounded-xl p-4 border transition-all duration-200 group relative overflow-hidden",
                    conversation.id === activeConversationId
                      ? 'border-primary/40 bg-primary/5 shadow-sm'
                      : 'border-border/10 bg-secondary/5 hover:bg-secondary/10 hover:border-border/30'
                  )}
                >
                  {conversation.id === activeConversationId && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  )}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold tracking-tight">Support Ticket</span>
                    {conversation.unread ? (
                      <Badge className="h-5 min-w-5 flex items-center justify-center p-0 text-[10px] bg-primary animate-pulse">{conversation.unread}</Badge>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mb-2 leading-relaxed">
                    {conversation.lastMessage ?? 'No messages yet'}
                  </p>
                  <div className="flex items-center gap-1.5 opacity-50">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <p className="text-[10px] font-medium uppercase tracking-wider">{new Date(conversation.created_at).toLocaleDateString()}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="col-span-2">
        <Card className="h-[600px] flex flex-col border-border/40 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/10 flex flex-row items-center justify-between py-4">
            <div>
              <CardTitle className="text-lg font-bold">Chat Session</CardTitle>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Agent Online</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <ScrollArea ref={scrollRef} className="h-full">
                <div className="p-6">
                  <div className="flex flex-col gap-3">
                    {messages.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center">No messages yet. Start the conversation by sending a message.</p>
                    )}
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "p-4 rounded-2xl max-w-[85%] border shadow-sm transition-all animate-in fade-in slide-in-from-bottom-1",
                          message.sender_type === 'user'
                            ? 'bg-primary/10 self-end border-primary/20 rounded-tr-none'
                            : 'bg-secondary/10 self-start border-border/20 rounded-tl-none'
                        )}
                      >
                        <p className="text-sm leading-relaxed text-foreground/90">{message.message}</p>
                        <div className="flex items-center gap-2 mt-2 opacity-50">
                          <p className="text-[10px] uppercase font-extrabold tracking-tighter">
                            {message.sender_type}
                          </p>
                          <span className="text-[10px]">•</span>
                          <p className="text-[10px] font-medium">
                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </div>

            <div className="p-4 border-t border-border/10 bg-secondary/5">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="h-12 rounded-xl bg-white/50 border-border/30 shadow-sm focus:ring-primary/20"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!messageInput.trim() || isLoading}
                  className="h-12 w-12 rounded-xl p-0 flex items-center justify-center shadow-sm hover:shadow-md active:scale-95 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
