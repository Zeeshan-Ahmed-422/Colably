import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Megaphone, FileText, Users, Handshake,
  PlusCircle, Search, ShieldCheck, UserCog, UserCircle2, Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth.jsx';
import { cn } from '@/lib/utils';

const SECTIONS_BY_ROLE = {
  brand: [
    {
      title: 'Workspace',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/campaigns/mine', label: 'My Campaigns', icon: Megaphone },
        { to: '/campaigns/new', label: 'Post a Campaign', icon: PlusCircle, highlight: true },
      ],
    },
    {
      title: 'Discovery',
      items: [
        { to: '/influencers', label: 'Find Influencers', icon: Search },
      ],
    },
    {
      title: 'Pipeline',
      items: [
        { to: '/applications', label: 'Applications', icon: FileText },
        { to: '/collaborations', label: 'Collaborations', icon: Handshake },
      ],
    },
    {
      title: 'Account',
      items: [
        { to: '/profile', label: 'Profile', icon: UserCircle2 },
      ],
    },
  ],
  influencer: [
    {
      title: 'Workspace',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/campaigns', label: 'Browse Campaigns', icon: Megaphone, highlight: true },
      ],
    },
    {
      title: 'Pipeline',
      items: [
        { to: '/applications', label: 'My Applications', icon: FileText },
        { to: '/collaborations', label: 'Collaborations', icon: Handshake },
      ],
    },
    {
      title: 'Account',
      items: [
        { to: '/profile', label: 'Profile', icon: UserCircle2 },
      ],
    },
  ],
  admin: [
    {
      title: 'Overview',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/admin', label: 'Admin Console', icon: ShieldCheck, highlight: true },
      ],
    },
    {
      title: 'Moderation',
      items: [
        { to: '/admin/users', label: 'Users', icon: UserCog },
        { to: '/admin/campaigns', label: 'Campaigns', icon: Megaphone },
      ],
    },
    {
      title: 'Explore',
      items: [
        { to: '/campaigns', label: 'All Campaigns', icon: Search },
        { to: '/influencers', label: 'Influencers', icon: Users },
      ],
    },
    {
      title: 'Account',
      items: [
        { to: '/profile', label: 'Profile', icon: UserCircle2 },
      ],
    },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;
  const sections = SECTIONS_BY_ROLE[user.role] || [];

  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-60 shrink-0 flex-col self-start lg:flex">
      <nav className="glass flex flex-1 flex-col gap-4 overflow-y-auto rounded-2xl p-3">
        {sections.map((s) => (
          <div key={s.title}>
            <div className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
              {s.title}
            </div>
            <ul className="space-y-0.5">
              {s.items.map(({ to, label, icon: Icon, highlight }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
                        isActive
                          ? 'bg-brand-500/15 text-brand-200 ring-1 ring-brand-500/30'
                          : 'text-fg/80 hover:bg-panel2 hover:text-fg',
                        highlight && !isActive && 'text-brand-300'
                      )
                    }
                  >
                    <Icon size={16} />
                    <span className="flex-1">{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Pro tip footer */}
        <div className="mt-auto rounded-xl border border-brand-500/30 bg-brand-500/5 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-brand-200">
            <Sparkles size={12} /> Pro tip
          </div>
          <p className="text-[11px] leading-relaxed text-muted">
            {user.role === 'brand' && 'Use the deliverables template on a campaign — it auto-generates the checklist on every accepted collab.'}
            {user.role === 'influencer' && 'Add more handles to your profile — brands filter by total followers and engagement rate.'}
            {user.role === 'admin' && 'Flagged campaigns get hidden from the public list automatically. Unflag to restore.'}
          </p>
        </div>
      </nav>
    </aside>
  );
}
