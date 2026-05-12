import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { Empty } from '@/components/ui/Empty.jsx';
import { Skeleton } from '@/components/ui/Skeleton.jsx';
import { STATUS_LABEL, timeAgo } from '@/lib/utils';

export default function Applications() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api.get('/applications/mine').then((r) => setItems(r.data.items)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const respond = async (id, status) => {
    try {
      await api.patch(`/applications/${id}/status`, { status });
      toast.success(`Marked as ${status}`);
      load();
    } catch (err) {
      toast.error(err.displayMessage || 'Could not update');
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          {user.role === 'brand' ? 'Applications received' : 'My applications'}
        </h1>
        <p className="text-sm text-muted">
          {user.role === 'brand'
            ? 'Applications across all of your campaigns.'
            : 'Track campaigns you applied to or were invited to.'}
        </p>
      </header>

      {loading ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : items.length === 0 ? (
        <Empty title="Nothing here yet" />
      ) : (
        <div className="space-y-3">
          {items.map((a) => {
            const counterpart = user.role === 'brand' ? a.influencer : a.brand;
            return (
              <Card key={a._id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <Link to={`/campaigns/${a.campaign?._id}`} className="font-semibold hover:underline">
                      {a.campaign?.title}
                    </Link>
                    <div className="text-xs text-muted">
                      {a.kind === 'invitation' ? 'Invited by ' : 'With '}{counterpart?.name}
                      {' · '}{timeAgo(a.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge status={a.status}>{STATUS_LABEL[a.status]}</Badge>
                    {user.role === 'influencer' && a.status === 'invited' && (
                      <>
                        <Button size="sm" variant="success" onClick={() => respond(a._id, 'accepted')}>Accept</Button>
                        <Button size="sm" variant="danger" onClick={() => respond(a._id, 'declined')}>Decline</Button>
                      </>
                    )}
                    {user.role === 'influencer' && a.status === 'pending' && (
                      <Button size="sm" variant="ghost" onClick={() => respond(a._id, 'withdrawn')}>Withdraw</Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
