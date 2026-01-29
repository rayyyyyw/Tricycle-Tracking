import { useState, useEffect, useRef, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Send, MessageCircle, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: number;
  sender_id: number;
  sender_name: string;
  message: string;
  type: string;
  created_at: string;
}

interface BookingChatProps {
  bookingId: number;
  currentUserId: number;
  socketUrl: string;
  /** When true, render only messages + input (no card, no header). For use inside a parent card. */
  embedded?: boolean;
  /** Optional callback to render connection status (Live / Connecting / Can't connect). */
  onStatus?: (ctx: { connected: boolean; connectError: boolean }) => React.ReactNode;
  /** Optional callback when connection status changes (e.g. for parent to show Live in header). */
  onStatusChange?: (ctx: { connected: boolean; connectError: boolean }) => void;
}

export default function BookingChat({ bookingId, currentUserId, socketUrl, embedded = false, onStatus, onStatusChange }: BookingChatProps) {
  const [token, setToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connectError, setConnectError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [tokenRes, messagesRes] = await Promise.all([
          fetch(`/api/bookings/${bookingId}/chat-token`, { credentials: 'include' }),
          fetch(`/api/bookings/${bookingId}/messages`, { credentials: 'include' }),
        ]);
        if (cancelled) return;
        if (!tokenRes.ok || !messagesRes.ok) {
          setError('Could not load chat.');
          setLoading(false);
          return;
        }
        const [tokenJson, messagesJson] = await Promise.all([tokenRes.json(), messagesRes.json()]);
        if (cancelled) return;
        setToken(tokenJson.token ?? null);
        setMessages(Array.isArray(messagesJson.messages) ? messagesJson.messages : []);
      } catch (e) {
        if (!cancelled) {
          setError('Could not load chat.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [bookingId]);

  useEffect(() => {
    if (!token || !socketUrl) return;
    setConnectError(false);
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setConnectError(false);
      socket.emit('join_booking', { bookingId, token }, (ack: { ok?: boolean }) => {
        if (!ack?.ok) setError('Could not join chat.');
      });
    });

    socket.on('connect_error', () => {
      setConnected(false);
      setConnectError(true);
    });

    socket.on('disconnect', () => setConnected(false));
    socket.on('message', (msg: ChatMessage) => {
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [bookingId, token, socketUrl]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    onStatusChange?.({ connected, connectError });
  }, [connected, connectError, onStatusChange]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !token || !socketRef.current || sending) return;

    setSending(true);
    setInput('');

    socketRef.current.emit('message', { bookingId, text, token }, (ack: { ok?: boolean }) => {
      setSending(false);
      if (!ack?.ok) {
        setInput(text);
        setError('Failed to send.');
      }
    });
  };

  const statusNode = onStatus ? onStatus({ connected, connectError }) : null;

  if (loading) {
    return embedded ? (
      <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading chat…</span>
      </div>
    ) : (
      <div className="rounded-lg border border-emerald-200 dark:border-emerald-800/50 bg-white dark:bg-gray-800 p-4 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading chat…</span>
      </div>
    );
  }

  if (error && !token) {
    return embedded ? (
      <div className="py-6 text-center text-sm text-amber-600 dark:text-amber-400">{error}</div>
    ) : (
      <div className="rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 p-4 text-center text-sm text-amber-800 dark:text-amber-200">
        {error}
      </div>
    );
  }

  const messagesSection = (
    <div
      ref={listRef}
      className={`flex-1 overflow-y-auto p-3 space-y-2 ${embedded ? 'min-h-[180px] max-h-[280px]' : 'min-h-[160px] max-h-[240px]'}`}
    >
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No messages yet. Say hi!</p>
        ) : (
          messages.map((m) => {
            const isOwn = m.sender_id === currentUserId;
            return (
              <div
                key={m.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    isOwn
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-0.5">
                      {m.sender_name}
                    </p>
                  )}
                  <p className="break-words">{m.message}</p>
                </div>
              </div>
            );
          })
        )}
    </div>
  );

  const inputSection = (
    <div className={`flex flex-col gap-2 p-3 ${embedded ? '' : 'border-t border-emerald-200/50 dark:border-emerald-800/30'}`}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message…"
            className="flex-1 rounded-lg border border-emerald-200 dark:border-emerald-800/50 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            maxLength={1000}
          />
        <Button
          size="sm"
          onClick={handleSend}
          disabled={!input.trim() || sending || !connected || connectError}
          className="bg-emerald-500 hover:bg-emerald-600 text-white shrink-0"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
        </div>
        {!embedded && connectError && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400">
            Start the chat server to send messages: <code className="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40">npm run socket</code>
          </p>
        )}
        {embedded && connectError && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400">
            Start <code className="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40">npm run socket</code> to send messages.
          </p>
        )}
      </div>
  );

  if (embedded) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        {statusNode}
        {messagesSection}
        {inputSection}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-emerald-200 dark:border-emerald-800/50 bg-white dark:bg-gray-800 overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-emerald-200/50 dark:border-emerald-800/30 bg-emerald-50/30 dark:bg-emerald-950/20">
        <MessageCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Chat</span>
        {connected ? (
          <span className="ml-auto text-xs text-emerald-600 dark:text-emerald-400">Live</span>
        ) : connectError ? (
          <span className="ml-auto text-xs text-amber-600 dark:text-amber-400" title="Start the chat server: npm run socket">
            Can&apos;t connect
          </span>
        ) : (
          <span className="ml-auto text-xs text-amber-600 dark:text-amber-400">Connecting…</span>
        )}
      </div>
      {messagesSection}
      {inputSection}
    </div>
  );
}
