import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card.jsx';
import { Input, Select } from '@/components/ui/Input.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { Avatar } from '@/components/ui/Avatar.jsx';
import { Empty } from '@/components/ui/Empty.jsx';
import { Skeleton } from '@/components/ui/Skeleton.jsx';
import { formatNumber } from '@/lib/utils';

export default function Influencers() {
  const [enums, setEnums] = useState({ platforms: [], niches: [] });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ q: '', niche: '', platform: '', minFollowers: '', maxFollowers: '' });

  useEffect(() => { api.get('/users/enums').then((r) => setEnums(r.data)); }, []);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && p.set(k, v));
    return p.toString();
  }, [filters]);

  useEffect(() => {
    setLoading(true);
    api.get(`/users/influencers?${qs}`)
      .then((r) => setItems(r.data.items))
      .finally(() => setLoading(false));
  }, [qs]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Find influencers</h1>
        <p className="text-sm text-muted">Search by niche, platform, audience size — invite the right creators.</p>
      </header>

      <Card>
        <div className="grid gap-3 md:grid-cols-5">
          <div className="relative md:col-span-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <Input className="pl-9" placeholder="Search by name..."
              value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
          </div>
          <Select value={filters.niche} onChange={(e) => setFilters({ ...filters, niche: e.target.value })}>
            <option value="">All niches</option>
            {enums.niches.map((n) => <option key={n} value={n}>{n}</option>)}
          </Select>
          <Select value={filters.platform} onChange={(e) => setFilters({ ...filters, platform: e.target.value })}>
            <option value="">All platforms</option>
            {enums.platforms.map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
          <div className="flex gap-2">
            <Input type="number" placeholder="Min followers" value={filters.minFollowers}
              onChange={(e) => setFilters({ ...filters, minFollowers: e.target.value })} />
            <Input type="number" placeholder="Max followers" value={filters.maxFollowers}
              onChange={(e) => setFilters({ ...filters, maxFollowers: e.target.value })} />
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      ) : items.length === 0 ? (
        <Empty title="No influencers found" description="Try widening filters." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((u) => (
            <Link key={u._id} to={`/influencers/${u._id}`}>
              <Card className="h-full transition hover:border-brand-500/40">
                <div className="flex items-center gap-3">
                  <Avatar name={u.name} src={u.avatarUrl} size={48} />
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{u.name}</div>
                    <div className="text-xs text-muted">{u.influencerProfile?.location || '—'}</div>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-muted">{u.influencerProfile?.bio || 'No bio yet.'}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {(u.influencerProfile?.niches || []).slice(0, 4).map((n) => (
                    <Badge key={n} tone="muted">{n}</Badge>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                  <span className="text-muted">Total followers</span>
                  <span className="font-semibold text-brand-300">
                    {formatNumber(u.influencerProfile?.totalFollowers || 0)}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
