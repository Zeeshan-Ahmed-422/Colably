import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Megaphone, FileText, Handshake, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Skeleton } from '@/components/ui/Skeleton.jsx';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get('/admin/stats').then((r) => setStats(r.data)); }, []);

  if (!stats) return <Skeleton className="h-40 rounded-2xl" />;

  const tiles = [
    { icon: Users, label: 'Users', value: stats.users, sub: `${stats.brands} brands · ${stats.influencers} influencers` },
    { icon: Megaphone, label: 'Campaigns', value: stats.campaigns, sub: `${stats.openCampaigns} open` },
    { icon: FileText, label: 'Applications', value: stats.applications },
    { icon: Handshake, label: 'Collaborations', value: stats.collaborations, sub: `${stats.activeCollabs} active` },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <ShieldCheck className="text-brand-300" /> Admin overview
        </h1>
        <p className="text-sm text-muted">Snapshot of platform activity.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted">{t.label}</div>
                <div className="mt-1 text-3xl font-bold tracking-tight">{t.value}</div>
                {t.sub && <div className="mt-1 text-xs text-muted">{t.sub}</div>}
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
                <t.icon size={18} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Quick actions</CardTitle></CardHeader>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/users"><Button variant="secondary"><Users size={14} /> Manage users</Button></Link>
          <Link to="/admin/campaigns"><Button variant="secondary"><Megaphone size={14} /> Moderate campaigns</Button></Link>
        </div>
      </Card>
    </div>
  );
}
