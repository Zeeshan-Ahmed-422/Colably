import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Megaphone, FileText, Users, Handshake,
  PlusCircle, Search, ShieldCheck, UserCog, UserCircle2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth.jsx';
import { cn } from '@/lib/utils';

const COMMON = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile', label: 'Profile', icon: UserCircle2 },
];

const BY_ROLE = {
  brand: [
    { to: '/campaigns/mine', label: 'My Campaigns', icon: Megaphone },
    { to: '/campaigns/new', label: 'Post a Campaign', icon: PlusCircle },
    { to: '/influencers', label: 'Find Influencers', icon: Search },
    { to: '/applications', label: 'Applications', icon: FileText },
    { to: '/collaborations', label: 'Collaborations', icon: Handshake },
  ],
  influencer: [
    { to: '/campaigns', label: 'Browse Campaigns', icon: Megaphone },
    { to: '/applications', label: 'My Applications', icon: FileText },
    { to: '/collaborations', label: 'Collaborations', icon: Handshake },
  ],
  admin: [
    { to: '/admin', label: 'Admin Overview', icon: ShieldCheck },
    { to: '/admin/users', label: 'Manage Users', icon: UserCog },
    { to: '/admin/campaigns', label: 'Moderate Campaigns', icon: Megaphone },
    { to: '/campaigns', label: 'Browse Campaigns', icon: Search },
    { to: '/influencers', label: 'Influencers', icon: Users },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;
  const items = [...COMMON, ...(BY_ROLE[user.role] || [])];

  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-60 shrink-0 self-start lg:block">
      <nav className="glass flex flex-col gap-1 rounded-2xl p-2">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-brand-500/15 text-brand-200'
                  : 'text-fg/80 hover:bg-panel2 hover:text-fg'
              )
            }
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
