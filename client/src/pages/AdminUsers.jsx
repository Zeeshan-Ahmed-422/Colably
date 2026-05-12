import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { Avatar } from '@/components/ui/Avatar.jsx';
import { Input, Select } from '@/components/ui/Input.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Empty } from '@/components/ui/Empty.jsx';
import { Skeleton } from '@/components/ui/Skeleton.jsx';

export default function AdminUsers() {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ q: '', role: '', status: '' });
  const [loading, setLoading] = useState(true);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && p.set(k, v));
    return p.toString();
  }, [filters]);

  const load = () => {
    setLoading(true);
    api.get(`/admin/users?${qs}`).then((r) => setItems(r.data.items)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [qs]);

  const toggleStatus = async (u) => {
    const next = u.status === 'active' ? 'suspended' : 'active';
    try {
      await api.patch(`/admin/users/${u._id}/status`, { status: next });
      toast.success(`Marked ${next}`);
      load();
    } catch (err) {
      toast.error(err.displayMessage || 'Could not update');
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-sm text-muted">Search, suspend, or reactivate any account.</p>
      </header>

      <Card>
        <div className="grid gap-3 md:grid-cols-4">
          <Input placeholder="Search name or email..." value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
          <Select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
            <option value="">All roles</option>
            <option value="brand">Brand</option>
            <option value="influencer">Influencer</option>
            <option value="admin">Admin</option>
          </Select>
          <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </Select>
        </div>
      </Card>

      {loading ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : items.length === 0 ? (
        <Empty title="No users" />
      ) : (
        <div className="space-y-2">
          {items.map((u) => (
            <Card key={u._id}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={u.name} src={u.avatarUrl} size={40} />
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{u.name}</div>
                    <div className="text-xs text-muted">{u.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="brand" className="capitalize">{u.role}</Badge>
                  <Badge tone={u.status === 'active' ? 'success' : 'danger'}>{u.status}</Badge>
                  {u.role !== 'admin' && (
                    <Button size="sm" variant={u.status === 'active' ? 'danger' : 'success'} onClick={() => toggleStatus(u)}>
                      {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
