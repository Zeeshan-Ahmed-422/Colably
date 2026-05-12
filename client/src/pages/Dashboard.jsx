import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, FileText, Handshake, Sparkles, ArrowUpRight } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth.jsx';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { Empty } from '@/components/ui/Empty.jsx';
import { Skeleton } from '@/components/ui/Skeleton.jsx';
import { formatDate, STATUS_LABEL } from '@/lib/utils';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ campaigns: [], applications: [], collaborations: [], adminStats: null });

  useEffect(() => {
    (async () => {
      try {
        const calls = [];
        if (user.role === 'brand') {
          calls.push(api.get('/campaigns?mine=true&limit=5'));
          calls.push(api.get('/applications/mine'));
          calls.push(api.get('/collaborations'));
        } else if (user.role === 'influencer') {
          calls.push(api.get('/campaigns?limit=5'));
          calls.push(api.get('/applications/mine'));
          calls.push(api.get('/collaborations'));
        } else if (user.role === 'admin') {
          calls.push(api.get('/admin/stats'));
        }
        const results = await Promise.all(calls);

        if (user.role === 'admin') {
          setData({ campaigns: [], applications: [], collaborations: [], adminStats: results[0].data });
        } else {
          setData({
            campaigns: results[0].data.items,
            applications: results[1].data.items,
            collaborations: results[2].data.items,
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user.role]);

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          {greeting()}, {user.name.split(' ')[0]} <Sparkles size={20} className="inline text-brand-300" />
        </h1>
        <p className="text-sm text-muted">
          {user.role === 'brand' && 'Manage campaigns, review applicants, and track collaborations.'}
          {user.role === 'influencer' && 'Find campaigns, manage applications, and deliver work.'}
          {user.role === 'admin' && 'Platform overview, moderation, and user management.'}
        </p>
      </header>

      {user.role === 'admin' ? <AdminCards stats={data.adminStats} /> : <Cards data={data} role={user.role} />}

      {user.role !== 'admin' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{user.role === 'brand' ? 'Your Recent Campaigns' : 'Open Campaigns'}</CardTitle>
              <Link to={user.role === 'brand' ? '/campaigns/mine' : '/campaigns'}>
                <Button variant="ghost" size="sm">View all <ArrowUpRight size={14} /></Button>
              </Link>
            </CardHeader>
            {data.campaigns.length === 0 ? (
              <Empty title="No campaigns yet" description={user.role === 'brand' ? 'Post your first campaign to get started.' : 'No open campaigns right now — check back soon.'} />
            ) : (
              <ul className="space-y-2">
                {data.campaigns.slice(0, 5).map((c) => (
                  <li key={c._id}>
                    <Link
                      to={`/campaigns/${c._id}`}
                      className="flex items-center justify-between rounded-xl border border-border bg-panel2/40 p-3 hover:border-brand-500/40"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">{c.title}</div>
                        <div className="text-xs text-muted">
                          ${c.budget} · {(c.platforms || []).join(', ') || '—'} · {formatDate(c.deadline)}
                        </div>
                      </div>
                      <Badge status={c.status}>{STATUS_LABEL[c.status]}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <Link to="/applications">
                <Button variant="ghost" size="sm">View all <ArrowUpRight size={14} /></Button>
              </Link>
            </CardHeader>
            {data.applications.length === 0 ? (
              <Empty title="No applications" description="Activity will appear here." />
            ) : (
              <ul className="space-y-2">
                {data.applications.slice(0, 5).map((a) => (
                  <li
                    key={a._id}
                    className="flex items-center justify-between rounded-xl border border-border bg-panel2/40 p-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">{a.campaign?.title || 'Campaign'}</div>
                      <div className="text-xs text-muted">
                        {user.role === 'brand' ? `from ${a.influencer?.name}` : `with ${a.brand?.name}`}
                        {' · '}{a.kind}
                      </div>
                    </div>
                    <Badge status={a.status}>{STATUS_LABEL[a.status]}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function Cards({ data, role }) {
  const activeCollabs = data.collaborations.filter((c) => c.status === 'active').length;
  const pending = data.applications.filter((a) => ['pending', 'invited', 'shortlisted'].includes(a.status)).length;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Stat icon={Megaphone} label={role === 'brand' ? 'Your Campaigns' : 'Open Campaigns'} value={data.campaigns.length} />
      <Stat icon={FileText} label="Pending Applications" value={pending} />
      <Stat icon={Handshake} label="Active Collaborations" value={activeCollabs} />
    </div>
  );
}

function AdminCards({ stats }) {
  if (!stats) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat icon={Megaphone} label="Open Campaigns" value={stats.openCampaigns} />
      <Stat icon={FileText} label="Total Applications" value={stats.applications} />
      <Stat icon={Handshake} label="Active Collabs" value={stats.activeCollabs} />
      <Stat icon={Sparkles} label="Users" value={stats.users} sub={`${stats.brands} brands · ${stats.influencers} influencers`} />
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-muted">{label}</div>
          <div className="mt-1 text-3xl font-bold tracking-tight">{value}</div>
          {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
          <Icon size={18} />
        </div>
      </div>
    </Card>
  );
}
