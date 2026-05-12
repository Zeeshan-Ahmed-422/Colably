import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card.jsx';
import { Input, Select } from '@/components/ui/Input.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { Empty } from '@/components/ui/Empty.jsx';
import { Skeleton } from '@/components/ui/Skeleton.jsx';
import { Avatar } from '@/components/ui/Avatar.jsx';
import { formatDate, STATUS_LABEL } from '@/lib/utils';

export default function Campaigns() {
  const [enums, setEnums] = useState({ platforms: [], niches: [] });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ platform: '', niche: '', minBudget: '', maxBudget: '', q: '' });

  useEffect(() => {
    api.get('/users/enums').then((r) => setEnums(r.data));
  }, []);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && p.set(k, v));
    return p.toString();
  }, [filters]);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/campaigns?${queryString}`)
      .then((r) => setItems(r.data.items))
      .finally(() => setLoading(false));
  }, [queryString]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Browse campaigns</h1>
        <p className="text-sm text-muted">Filter by platform, niche, or budget — apply to the ones that fit you.</p>
      </header>

      <Card>
        <div className="grid gap-3 md:grid-cols-5">
          <div className="relative md:col-span-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <Input
              placeholder="Search title / description..."
              className="pl-9"
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            />
          </div>
          <Select value={filters.platform} onChange={(e) => setFilters({ ...filters, platform: e.target.value })}>
            <option value="">All platforms</option>
            {enums.platforms.map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
          <Select value={filters.niche} onChange={(e) => setFilters({ ...filters, niche: e.target.value })}>
            <option value="">All niches</option>
            {enums.niches.map((n) => <option key={n} value={n}>{n}</option>)}
          </Select>
          <div className="flex gap-2">
            <Input type="number" placeholder="Min $" value={filters.minBudget}
              onChange={(e) => setFilters({ ...filters, minBudget: e.target.value })} />
            <Input type="number" placeholder="Max $" value={filters.maxBudget}
              onChange={(e) => setFilters({ ...filters, maxBudget: e.target.value })} />
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      ) : items.length === 0 ? (
        <Empty title="No campaigns match" description="Try widening your filters." />
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
                <p className="mt-2 line-clamp-3 text-sm text-muted">{c.description}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {(c.platforms || []).map((p) => <Badge key={p} tone="accent">{p}</Badge>)}
                  {(c.niches || []).slice(0, 3).map((n) => <Badge key={n} tone="muted">{n}</Badge>)}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted">
                  <div className="flex items-center gap-2">
                    <Avatar name={c.brand?.name} src={c.brand?.avatarUrl} size={20} />
                    <span className="truncate">{c.brand?.brandProfile?.companyName || c.brand?.name}</span>
                  </div>
                  <span>Due {formatDate(c.deadline)}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
