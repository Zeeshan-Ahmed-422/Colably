import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Empty } from '@/components/ui/Empty.jsx';
import { Skeleton } from '@/components/ui/Skeleton.jsx';
import { formatDate, STATUS_LABEL } from '@/lib/utils';

export default function MyCampaigns() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/campaigns?mine=true&limit=100')
      .then((r) => setItems(r.data.items))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My campaigns</h1>
          <p className="text-sm text-muted">All the briefs you have published.</p>
        </div>
        <Link to="/campaigns/new"><Button><Plus size={14} /> New campaign</Button></Link>
      </header>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      ) : items.length === 0 ? (
        <Empty title="No campaigns yet" description="Get started by posting your first brief."
          action={<Link to="/campaigns/new"><Button>Post a campaign</Button></Link>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <Link key={c._id} to={`/campaigns/${c._id}`}>
              <Card className="h-full transition hover:border-brand-500/40">
                <div className="mb-3 flex items-center justify-between">
                  <Badge status={c.status}>{STATUS_LABEL[c.status]}</Badge>
                  <span className="text-sm font-semibold text-brand-300">${c.budget}</span>
                </div>
                <h3 className="line-clamp-2 text-base font-semibold">{c.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted">{c.description}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {(c.platforms || []).map((p) => <Badge key={p} tone="accent">{p}</Badge>)}
                </div>
                <div className="mt-3 text-xs text-muted">Due {formatDate(c.deadline)}</div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
