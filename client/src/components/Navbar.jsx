import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Sparkles, Search, Bell, Settings } from 'lucide-react';
import { useAuth } from '@/lib/auth.jsx';
import { getSocket } from '@/lib/socket';
import { Avatar } from './ui/Avatar.jsx';
import { Badge } from './ui/Badge.jsx';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Listen for real-time message notifications via the existing chat socket
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    const onNotify = (n) => {
      setNotifs((prev) => [{ ...n, ts: Date.now() }, ...prev].slice(0, 8));
    };
    socket.on('message:notify', onNotify);
    return () => socket.off('message:notify', onNotify);
  }, [user]);

  // Close menus on outside click / escape
  useEffect(() => {
    if (!notifOpen && !userMenuOpen) return;
    const close = () => { setNotifOpen(false); setUserMenuOpen(false); };
    const onKey = (e) => e.key === 'Escape' && close();
    window.addEventListener('click', close);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [notifOpen, userMenuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-accent text-white shadow-glow">
            <Sparkles size={16} />
          </span>
          <span className="text-lg tracking-tight">Collably</span>
        </Link>

        {/* Quick search */}
        <button
          onClick={() => nav(user?.role === 'brand' ? '/influencers' : '/campaigns')}
          className="hidden flex-1 max-w-md items-center gap-2 rounded-xl border border-border bg-panel2/40 px-3 py-2 text-left text-sm text-muted hover:border-brand-500/40 hover:text-fg md:flex"
        >
          <Search size={14} />
          <span>Search {user?.role === 'brand' ? 'influencers' : 'campaigns'}…</span>
          <span className="ml-auto rounded-md border border-border bg-panel px-1.5 py-0.5 text-[10px]">⌘ K</span>
        </button>

        {user && (
          <div className="flex items-center gap-2">
            <Badge tone="brand" className="hidden capitalize sm:inline-flex">{user.role}</Badge>

            {/* Notifications */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => { setNotifOpen((v) => !v); setUserMenuOpen(false); }}
                className="relative rounded-lg p-2 text-muted hover:bg-panel2 hover:text-fg"
                title="Notifications"
              >
                <Bell size={18} />
                {notifs.length > 0 && (
                  <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                    {notifs.length > 9 ? '9+' : notifs.length}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="glass absolute right-0 mt-2 w-80 rounded-2xl p-2">
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-sm font-semibold">Notifications</span>
                    {notifs.length > 0 && (
                      <button onClick={() => setNotifs([])} className="text-xs text-muted hover:text-fg">Clear</button>
                    )}
                  </div>
                  {notifs.length === 0 ? (
                    <p className="px-2 py-6 text-center text-xs text-muted">You're all caught up.</p>
                  ) : (
                    <ul className="max-h-80 space-y-1 overflow-y-auto">
                      {notifs.map((n, i) => (
                        <li key={i}>
                          <Link
                            to={`/collaborations/${n.collaborationId}`}
                            onClick={() => setNotifOpen(false)}
                            className="block rounded-xl border border-transparent p-2 text-sm hover:border-border hover:bg-panel2"
                          >
                            <div className="font-medium">{n.from?.name}</div>
                            <div className="line-clamp-2 text-xs text-muted">{n.preview}</div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => { setUserMenuOpen((v) => !v); setNotifOpen(false); }}
                className="flex items-center gap-2 rounded-xl border border-transparent px-2 py-1 hover:border-border hover:bg-panel2"
              >
                <Avatar name={user.name} src={user.avatarUrl} size={32} />
                <div className="hidden text-left text-sm leading-tight sm:block">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-muted">{user.email}</div>
                </div>
              </button>
              {userMenuOpen && (
                <div className="glass absolute right-0 mt-2 w-56 rounded-2xl p-2">
                  <div className="border-b border-border/60 pb-2 mb-2 px-2">
                    <div className="font-medium text-sm">{user.name}</div>
                    <div className="text-xs text-muted truncate">{user.email}</div>
                  </div>
                  <MenuItem icon={Settings} onClick={() => { nav('/profile'); setUserMenuOpen(false); }}>Profile settings</MenuItem>
                  <MenuItem icon={LogOut} onClick={() => { logout(); nav('/'); }} danger>Sign out</MenuItem>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function MenuItem({ icon: Icon, children, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm',
        danger ? 'text-danger hover:bg-danger/10' : 'hover:bg-panel2'
      )}
    >
      <Icon size={14} />
      {children}
    </button>
  );
}
