import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { Input, Select } from '@/components/ui/Input.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Avatar } from '@/components/ui/Avatar.jsx';
import { Empty } from '@/components/ui/Empty.jsx';
import { Skeleton } from '@/components/ui/Skeleton.jsx';
import { STATUS_LABEL, formatDate } from '@/lib/utils';

export default function AdminCampaigns() {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ q: '', status: '' });
  const [loading, setLoading] = useState(true);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && p.set(k, v));
    return p.toString();
  }, [filters]);

  const load = () => {
    setLoading(true);
    api.get(`/admin/campaigns?${qs}`).then((r) => setItems(r.data.items)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [qs]);

  const moderate = async (id, action) => {
    let reason;
    if (action === 'flag') {
      reason = prompt('Reason for flagging?') || '';
    }
    try {
      await api.patch(`/admin/campaigns/${id}/moderate`, { action, reason });
      toast.success(`Action: ${action}`);
      load();
    } catch (err) {
      toast.error(err.displayMessage || 'Could not moderate');
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Moderate campaigns</h1>
        <p className="text-sm text-muted">Flag, unflag, or close campaigns that violate policy.</p>
      </header>

      <Card>
        <div className="grid gap-3 md:grid-cols-3">
          <Input placeholder="Search title / description..." value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
          <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="flagged">Flagged</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </Select>
        </div>
      </Card>

      {loading ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : items.length === 0 ? (
        <Empty title="No campaigns" />
      ) : (
        <div className="space-y-2">
          {items.map((c) => (
            <Card key={c._id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <Link to={`/campaigns/${c._id}`} className="truncate text-base font-semibold hover:underline">{c.title}</Link>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                    <Avatar name={c.brand?.name} src={c.brand?.avatarUrl} size={20} />
                    <span>{c.brand?.name}</span>
                    <span>·</span>
                    <span>${c.budget}</span>
                    <span>·</span>
                    <span>Due {formatDate(c.deadline)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={c.status}>{STATUS_LABEL[c.status]}</Badge>
                  {c.status !== 'flagged' ? (
                    <Button size="sm" variant="danger" onClick={() => moderate(c._id, 'flag')}>Flag</Button>
                  ) : (
                    <Button size="sm" variant="success" onClick={() => moderate(c._id, 'unflag')}>Unflag</Button>
                  )}
                  {c.status !== 'closed' && (
                    <Button size="sm" variant="secondary" onClick={() => moderate(c._id, 'close')}>Close</Button>
                  )}
                </div>
              </div>
              {c.moderation?.flagged && c.moderation?.reason && (
                <p className="mt-2 rounded-xl border border-danger/30 bg-danger/10 p-2 text-xs text-danger">
                  Flagged: {c.moderation.reason}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
