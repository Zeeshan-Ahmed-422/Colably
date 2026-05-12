import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth.jsx';
import { getSocket } from '@/lib/socket';
import { Card, CardHeader, CardTitle } from './ui/Card.jsx';
import { Button } from './ui/Button.jsx';
import { Avatar } from './ui/Avatar.jsx';
import { cn, timeAgo } from '@/lib/utils';

export default function ChatPanel({ collaborationId, counterpartName }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typingPeer, setTypingPeer] = useState(false);
  const listRef = useRef(null);
  const typingTimer = useRef(null);

  // load history + join socket room
  useEffect(() => {
    let socket;
    let cancelled = false;

    (async () => {
      const { data } = await api.get(`/messages/by-collaboration/${collaborationId}`);
      if (cancelled) return;
      setMessages(data.items);
    })();

    socket = getSocket();
    socket.emit('collab:join', collaborationId, () => {});

    const onNew = (msg) => {
      if (msg.collaboration === collaborationId || msg.collaboration?._id === collaborationId) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    const onTyping = ({ userId, isTyping }) => {
      if (userId !== user._id) setTypingPeer(isTyping);
    };
    socket.on('message:new', onNew);
    socket.on('typing', onTyping);

    return () => {
      cancelled = true;
      socket?.emit('collab:leave', collaborationId);
      socket?.off('message:new', onNew);
      socket?.off('typing', onTyping);
    };
  }, [collaborationId, user._id]);

  // auto-scroll
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = (e) => {
    e?.preventDefault();
    const body = text.trim();
    if (!body) return;
    const socket = getSocket();
    socket.emit('message:send', { collaborationId, body }, (res) => {
      if (!res?.ok) {
        console.error(res?.error);
      }
    });
    setText('');
  };

  const onType = (v) => {
    setText(v);
    const socket = getSocket();
    socket.emit('typing', { collaborationId, isTyping: true });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('typing', { collaborationId, isTyping: false });
    }, 1200);
  };

  return (
    <Card className="flex h-[560px] flex-col">
      <CardHeader>
        <CardTitle>Chat with {counterpartName}</CardTitle>
        {typingPeer && <span className="text-xs text-muted">typing…</span>}
      </CardHeader>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto rounded-xl border border-border bg-bg/40 p-3"
      >
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted">Say hi — start the conversation.</p>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) => {
              const mine = m.sender?._id === user._id;
              return (
                <li key={m._id} className={cn('flex gap-2', mine && 'flex-row-reverse')}>
                  <Avatar name={m.sender?.name} src={m.sender?.avatarUrl} size={28} />
                  <div className={cn('max-w-[75%]', mine && 'text-right')}>
                    <div
                      className={cn(
                        'rounded-2xl px-3 py-2 text-sm',
                        mine
                          ? 'bg-brand-500/20 text-fg ring-1 ring-brand-500/30'
                          : 'bg-panel2/70 text-fg ring-1 ring-border'
                      )}
                    >
                      {m.body}
                    </div>
                    <div className="mt-1 text-[10px] text-muted">{timeAgo(m.createdAt)}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <form onSubmit={send} className="mt-3 flex gap-2">
        <input
          className="h-11 flex-1 rounded-xl border border-border bg-panel2/60 px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
          placeholder={`Message ${counterpartName}...`}
          value={text}
          onChange={(e) => onType(e.target.value)}
        />
        <Button type="submit" disabled={!text.trim()}>
          <Send size={14} /> Send
        </Button>
      </form>
    </Card>
  );
}
