import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Megaphone, FileText, Handshake, Sparkles, ArrowUpRight, TrendingUp, TrendingDown,
  Activity, Users, DollarSign, CalendarClock, Zap,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth.jsx';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { Avatar } from '@/components/ui/Avatar.jsx';
import { Empty } from '@/components/ui/Empty.jsx';
import { Skeleton } from '@/components/ui/Skeleton.jsx';
import { formatDate, formatNumber, STATUS_LABEL, timeAgo } from '@/lib/utils';

const CHART_COLORS = ['#7c5cff', '#22d3ee', '#f59e0b', '#22c55e', '#ef4444', '#a78bfa'];

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    campaigns: [],
    applications: [],
    collaborations: [],
    adminStats: null,
  });

  useEffect(() => {
    (async () => {
      try {
        const calls = [];
        if (user.role === 'brand') {
          calls.push(api.get('/campaigns?mine=true&limit=50'));
          calls.push(api.get('/applications/mine'));
          calls.push(api.get('/collaborations'));
        } else if (user.role === 'influencer') {
          calls.push(api.get('/campaigns?limit=50'));
          calls.push(api.get('/applications/mine'));
          calls.push(api.get('/collaborations'));
        } else if (user.role === 'admin') {
          calls.push(api.get('/admin/stats'));
          calls.push(api.get('/admin/campaigns'));
        }
        const results = await Promise.all(calls);
        if (user.role === 'admin') {
          setData({
            adminStats: results[0].data,
            campaigns: results[1].data.items,
            applications: [],
            collaborations: [],
          });
        } else {
          setData({
            campaigns: results[0].data.items,
            applications: results[1].data.items,
            collaborations: results[2].data.items,
            adminStats: null,
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user.role]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <Greeting user={user} />
      {user.role === 'admin'
        ? <AdminView stats={data.adminStats} campaigns={data.campaigns} />
        : <RoleView data={data} role={user.role} />}
    </div>
  );
}

/* ============================================================== */
/* Greeting header                                                 */
/* ============================================================== */
function Greeting({ user }) {
  const h = new Date().getHours();
  const tod = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {tod}, {user.name.split(' ')[0]} <Sparkles size={20} className="inline text-brand-300" />
        </h1>
        <p className="text-sm text-muted">
          {user.role === 'brand' && 'A live snapshot of your campaigns, applicants, and collaborations.'}
          {user.role === 'influencer' && 'Track the campaigns you applied to and the work you’re actively shipping.'}
          {user.role === 'admin' && 'Platform-wide health, moderation queue, and user activity.'}
        </p>
      </div>
      {user.role === 'brand' && (
        <Link to="/campaigns/new">
          <Button>
            <Zap size={14} /> Post a campaign
          </Button>
        </Link>
      )}
      {user.role === 'influencer' && (
        <Link to="/campaigns">
          <Button>
            <Megaphone size={14} /> Browse campaigns
          </Button>
        </Link>
      )}
    </header>
  );
}

/* ============================================================== */
/* Brand + Influencer view                                         */
/* ============================================================== */
function RoleView({ data, role }) {
  const { campaigns, applications, collaborations } = data;

  // Derived metrics
  const totals = useMemo(() => computeTotals({ campaigns, applications, collaborations, role }), [campaigns, applications, collaborations, role]);
  const trend = useMemo(() => buildTrend(applications), [applications]);
  const statusBreakdown = useMemo(() => buildStatusBreakdown(applications), [applications]);
  const upcomingDeadlines = useMemo(() => buildUpcomingDeadlines(campaigns), [campaigns]);
  const activity = useMemo(() => buildActivityFeed({ applications, collaborations, role }), [applications, collaborations, role]);

  return (
    <>
      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={Megaphone}
          label={role === 'brand' ? 'Your campaigns' : 'Open campaigns'}
          value={totals.campaigns}
          delta={totals.campaignsDelta}
        />
        <Stat icon={FileText} label="Pending applications" value={totals.pending} delta={totals.pendingDelta} />
        <Stat icon={Handshake} label="Active collaborations" value={totals.active} delta={totals.activeDelta} />
        <Stat
          icon={role === 'brand' ? Users : DollarSign}
          label={role === 'brand' ? 'Audience reach' : 'Earned'}
          value={role === 'brand' ? formatNumber(totals.reach) : `$${totals.earned.toLocaleString()}`}
          sub={role === 'brand' ? 'sum of accepted creators’ followers' : 'sum of completed agreed rates'}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Applications · last 14 days</CardTitle>
              <p className="text-xs text-muted">{role === 'brand' ? 'Inbound applications across all your campaigns' : 'Applications you submitted'}</p>
            </div>
            <Badge tone={trend.delta >= 0 ? 'success' : 'danger'}>
              {trend.delta >= 0 ? '+' : ''}{trend.delta}%
            </Badge>
          </CardHeader>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c5cff" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#7c5cff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="label" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#0f1117', border: '1px solid #1f2937', borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Area type="monotone" dataKey="count" stroke="#7c5cff" strokeWidth={2} fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Status breakdown</CardTitle></CardHeader>
          {statusBreakdown.length === 0 ? (
            <div className="grid h-56 place-items-center text-sm text-muted">No data yet</div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {statusBreakdown.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Tooltip
                    contentStyle={{ background: '#0f1117', border: '1px solid #1f2937', borderRadius: 12, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Lower row: recent campaigns + activity feed + deadlines */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{role === 'brand' ? 'Recent campaigns' : 'Open campaigns to explore'}</CardTitle>
            <Link to={role === 'brand' ? '/campaigns/mine' : '/campaigns'}>
              <Button variant="ghost" size="sm">View all <ArrowUpRight size={14} /></Button>
            </Link>
          </CardHeader>
          {campaigns.length === 0 ? (
            <Empty
              title="No campaigns yet"
              description={role === 'brand' ? 'Post your first brief to start receiving applications.' : 'Nothing open right now — check back soon.'}
            />
          ) : (
            <ul className="space-y-2">
              {campaigns.slice(0, 5).map((c) => (
                <li key={c._id}>
                  <Link
                    to={`/campaigns/${c._id}`}
                    className="flex items-center justify-between rounded-xl border border-border bg-panel2/40 p-3 transition hover:border-brand-500/40"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">{c.title}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                        <span className="font-semibold text-brand-300">${c.budget}</span>
                        <span>·</span>
                        <span>{(c.platforms || []).slice(0, 2).join(', ') || '—'}</span>
                        <span>·</span>
                        <span>{formatDate(c.deadline)}</span>
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
            <CardTitle>Activity</CardTitle>
            <Activity size={14} className="text-muted" />
          </CardHeader>
          {activity.length === 0 ? (
            <p className="text-sm text-muted">Nothing here yet — applications and accepted collabs show up live.</p>
          ) : (
            <ul className="space-y-3">
              {activity.slice(0, 6).map((a, i) => (
                <li key={i} className="flex gap-3">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-400" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">{a.message}</div>
                    <div className="text-xs text-muted">{timeAgo(a.ts)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Deadlines & top niches */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming deadlines</CardTitle>
            <CalendarClock size={14} className="text-muted" />
          </CardHeader>
          {upcomingDeadlines.length === 0 ? (
            <p className="text-sm text-muted">No campaigns with deadlines in the next 30 days.</p>
          ) : (
            <ul className="space-y-2">
              {upcomingDeadlines.map((c) => {
                const days = Math.max(0, Math.ceil((new Date(c.deadline) - Date.now()) / (1000 * 60 * 60 * 24)));
                return (
                  <li key={c._id}>
                    <Link
                      to={`/campaigns/${c._id}`}
                      className="flex items-center justify-between rounded-xl border border-border bg-panel2/40 p-3 hover:border-brand-500/40"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{c.title}</div>
                        <div className="text-xs text-muted">Due {formatDate(c.deadline)}</div>
                      </div>
                      <Badge tone={days <= 3 ? 'danger' : days <= 7 ? 'warning' : 'muted'}>
                        {days === 0 ? 'Today' : `${days}d left`}
                      </Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <TopNichesCard campaigns={campaigns} />
      </div>
    </>
  );
}

/* ============================================================== */
/* Admin view                                                      */
/* ============================================================== */
function AdminView({ stats, campaigns }) {
  if (!stats) return null;
  // Stats tiles
  const tiles = [
    { icon: Users, label: 'Total users', value: stats.users, sub: `${stats.brands} brands · ${stats.influencers} influencers` },
    { icon: Megaphone, label: 'Campaigns', value: stats.campaigns, sub: `${stats.openCampaigns} open` },
    { icon: FileText, label: 'Applications', value: stats.applications },
    { icon: Handshake, label: 'Active collaborations', value: stats.activeCollabs, sub: `${stats.collaborations} total` },
  ];

  // Status breakdown from campaigns
  const statusData = useMemo(() => {
    const counts = {};
    campaigns.forEach((c) => { counts[c.status] = (counts[c.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: STATUS_LABEL[name] || name, value }));
  }, [campaigns]);

  // Campaigns created per day for the last 14 days
  const trendData = useMemo(() => buildCampaignTrend(campaigns), [campaigns]);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Stat key={t.label} icon={t.icon} label={t.label} value={t.value} sub={t.sub} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Campaigns posted · last 14 days</CardTitle>
            <Badge tone="brand">Live</Badge>
          </CardHeader>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="label" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(124,92,255,0.08)' }}
                  contentStyle={{ background: '#0f1117', border: '1px solid #1f2937', borderRadius: 12, fontSize: 12 }}
                />
                <Bar dataKey="count" fill="#7c5cff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Campaign status mix</CardTitle></CardHeader>
          {statusData.length === 0 ? (
            <div className="grid h-56 place-items-center text-sm text-muted">No campaigns yet</div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={75} paddingAngle={3}>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Tooltip contentStyle={{ background: '#0f1117', border: '1px solid #1f2937', borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest campaigns</CardTitle>
          <Link to="/admin/campaigns"><Button variant="ghost" size="sm">Moderate all <ArrowUpRight size={14} /></Button></Link>
        </CardHeader>
        {campaigns.length === 0 ? (
          <Empty title="No campaigns yet" />
        ) : (
          <ul className="space-y-2">
            {campaigns.slice(0, 5).map((c) => (
              <li key={c._id} className="flex items-center justify-between rounded-xl border border-border bg-panel2/40 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={c.brand?.name} src={c.brand?.avatarUrl} size={32} />
                  <div className="min-w-0">
                    <Link to={`/campaigns/${c._id}`} className="truncate font-medium hover:underline">{c.title}</Link>
                    <div className="text-xs text-muted">{c.brand?.name} · ${c.budget}</div>
                  </div>
                </div>
                <Badge status={c.status}>{STATUS_LABEL[c.status]}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

/* ============================================================== */
/* Sub-components                                                  */
/* ============================================================== */
function Stat({ icon: Icon, label, value, delta, sub }) {
  const positive = typeof delta === 'number' && delta >= 0;
  return (
    <Card className="group transition hover:border-brand-500/40">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-muted">{label}</div>
          <div className="mt-1 text-3xl font-bold tracking-tight">{value}</div>
          {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
          {typeof delta === 'number' && (
            <div className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${positive ? 'text-success' : 'text-danger'}`}>
              {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {positive ? '+' : ''}{delta}%
              <span className="text-muted font-normal"> vs last week</span>
            </div>
          )}
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500/30 to-accent/20 text-brand-200 ring-1 ring-brand-500/30 transition group-hover:scale-105">
          <Icon size={18} />
        </div>
      </div>
    </Card>
  );
}

function TopNichesCard({ campaigns }) {
  const niches = useMemo(() => {
    const counts = {};
    campaigns.forEach((c) => (c.niches || []).forEach((n) => { counts[n] = (counts[n] || 0) + 1; }));
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = sorted[0]?.[1] || 1;
    return sorted.map(([name, count]) => ({ name, count, pct: Math.round((count / max) * 100) }));
  }, [campaigns]);

  return (
    <Card>
      <CardHeader><CardTitle>Top niches</CardTitle></CardHeader>
      {niches.length === 0 ? (
        <p className="text-sm text-muted">No niche data yet.</p>
      ) : (
        <ul className="space-y-3">
          {niches.map((n) => (
            <li key={n.name}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="capitalize">{n.name}</span>
                <span className="text-muted">{n.count}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-panel2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent"
                  style={{ width: `${n.pct}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-56 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    </div>
  );
}

/* ============================================================== */
/* Pure helpers (no server calls)                                  */
/* ============================================================== */
function computeTotals({ campaigns, applications, collaborations, role }) {
  const pending = applications.filter((a) => ['pending', 'invited', 'shortlisted'].includes(a.status)).length;
  const active = collaborations.filter((c) => c.status === 'active').length;

  // Reach = sum of accepted influencers' total followers (for brand only)
  let reach = 0;
  if (role === 'brand') {
    collaborations.forEach((c) => {
      reach += c.influencer?.influencerProfile?.totalFollowers || 0;
    });
  }

  // Earned = sum of agreedRate of completed collabs (influencer)
  let earned = 0;
  if (role === 'influencer') {
    collaborations
      .filter((c) => c.status === 'completed')
      .forEach((c) => { earned += c.agreedRate || 0; });
  }

  // Week-over-week delta on applications (placeholder synthetic delta for demos)
  const recent = applications.filter((a) => Date.now() - new Date(a.createdAt).getTime() < 1000 * 60 * 60 * 24 * 7).length;
  const previous = applications.filter((a) => {
    const age = Date.now() - new Date(a.createdAt).getTime();
    return age >= 1000 * 60 * 60 * 24 * 7 && age < 1000 * 60 * 60 * 24 * 14;
  }).length;
  const pct = previous === 0 ? (recent > 0 ? 100 : 0) : Math.round(((recent - previous) / previous) * 100);

  return {
    campaigns: campaigns.length,
    pending,
    active,
    reach,
    earned,
    campaignsDelta: undefined,
    pendingDelta: pct,
    activeDelta: undefined,
  };
}

function buildTrend(applications) {
  // Aggregate by day for last 14 days
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      count: 0,
    });
  }
  const map = Object.fromEntries(days.map((d) => [d.key, d]));
  applications.forEach((a) => {
    const k = new Date(a.createdAt).toISOString().slice(0, 10);
    if (map[k]) map[k].count++;
  });
  const data = Object.values(map);
  // Week-over-week delta
  const recent = data.slice(7).reduce((s, d) => s + d.count, 0);
  const prev = data.slice(0, 7).reduce((s, d) => s + d.count, 0);
  const delta = prev === 0 ? (recent > 0 ? 100 : 0) : Math.round(((recent - prev) / prev) * 100);
  return { data, delta };
}

function buildCampaignTrend(campaigns) {
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      count: 0,
    });
  }
  const map = Object.fromEntries(days.map((d) => [d.key, d]));
  campaigns.forEach((c) => {
    const k = new Date(c.createdAt).toISOString().slice(0, 10);
    if (map[k]) map[k].count++;
  });
  return Object.values(map);
}

function buildStatusBreakdown(applications) {
  const counts = {};
  applications.forEach((a) => { counts[a.status] = (counts[a.status] || 0) + 1; });
  return Object.entries(counts).map(([k, v]) => ({ name: STATUS_LABEL[k] || k, value: v }));
}

function buildUpcomingDeadlines(campaigns) {
  const cutoff = Date.now() + 1000 * 60 * 60 * 24 * 30;
  return campaigns
    .filter((c) => c.deadline && new Date(c.deadline).getTime() <= cutoff && new Date(c.deadline).getTime() >= Date.now())
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);
}

function buildActivityFeed({ applications, collaborations, role }) {
  const items = [];
  applications.forEach((a) => {
    const counterpart = role === 'brand' ? a.influencer?.name : a.brand?.name;
    items.push({
      ts: a.updatedAt || a.createdAt,
      message: role === 'brand'
        ? `${counterpart} ${a.kind === 'application' ? 'applied to' : 'was invited to'} ${a.campaign?.title || 'a campaign'} · ${STATUS_LABEL[a.status]}`
        : `${a.kind === 'application' ? 'You applied to' : 'You were invited to'} ${a.campaign?.title || 'a campaign'} · ${STATUS_LABEL[a.status]}`,
    });
  });
  collaborations.forEach((c) => {
    const counterpart = role === 'brand' ? c.influencer?.name : c.brand?.name;
    items.push({
      ts: c.updatedAt || c.createdAt,
      message: `Collaboration with ${counterpart} on ${c.campaign?.title || 'a campaign'} is ${STATUS_LABEL[c.status]?.toLowerCase()}`,
    });
  });
  return items.sort((a, b) => new Date(b.ts) - new Date(a.ts));
}
