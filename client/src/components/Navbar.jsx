import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth.jsx';
import { Avatar } from './ui/Avatar.jsx';
import { Badge } from './ui/Badge.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/70 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-accent text-white shadow-glow">
            <Sparkles size={16} />
          </span>
          <span className="text-lg tracking-tight">Collably</span>
        </Link>

        <div className="flex items-center gap-3">
          {user && (
            <>
              <Badge tone="brand" className="capitalize">{user.role}</Badge>
              <Link to="/profile" className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-panel2">
                <Avatar name={user.name} src={user.avatarUrl} size={32} />
                <div className="hidden text-sm leading-tight sm:block">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-muted">{user.email}</div>
                </div>
              </Link>
              <button
                onClick={() => { logout(); nav('/'); }}
                className="rounded-lg p-2 text-muted hover:bg-panel2 hover:text-fg"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
