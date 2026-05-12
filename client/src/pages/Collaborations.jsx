import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { Avatar } from '@/components/ui/Avatar.jsx';
import { Empty } from '@/components/ui/Empty.jsx';
import { Skeleton } from '@/components/ui/Skeleton.jsx';
import { STATUS_LABEL, formatDate } from '@/lib/utils';

export default function Collaborations() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/collaborations').then((r) => setItems(r.data.items)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Collaborations</h1>
        <p className="text-sm text-muted">Active and past partnerships with deliverables and chat.</p>
      </header>

      {loading ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : items.length === 0 ? (
        <Empty title="No collaborations yet" description="Once an application is accepted, a collab will appear here." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((c) => {
            const counterpart = user.role === 'brand' ? c.influencer : c.brand;
            return (
              <Link key={c._id} to={`/collaborations/${c._id}`}>
                <Card className="h-full transition hover:border-brand-500/40">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={counterpart?.name} src={counterpart?.avatarUrl} size={40} />
                      <div>
                        <div className="font-semibold">{c.campaign?.title}</div>
                        <div className="text-xs text-muted">with {counterpart?.name}</div>
                      </div>
                    </div>
                    <Badge status={c.status}>{STATUS_LABEL[c.status]}</Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted">
                    <span>Started {formatDate(c.createdAt)}</span>
                    {c.agreedRate ? <span>Rate: ${c.agreedRate}</span> : null}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
