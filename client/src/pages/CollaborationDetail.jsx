import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth.jsx';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Avatar } from '@/components/ui/Avatar.jsx';
import { Skeleton } from '@/components/ui/Skeleton.jsx';
import DeliverableList from '@/components/DeliverableList.jsx';
import ChatPanel from '@/components/ChatPanel.jsx';
import { STATUS_LABEL, formatDate } from '@/lib/utils';

export default function CollaborationDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);

  const refresh = () =>
    api.get(`/collaborations/${id}`).then((r) => setData(r.data));

  useEffect(() => { refresh(); }, [id]);

  if (!data) return <Skeleton className="h-96 rounded-2xl" />;
  const { collaboration: c, deliverables } = data;
  const isBrand = c.brand._id === user._id;
  const isInfluencer = c.influencer._id === user._id;
  const counterpart = isBrand ? c.influencer : c.brand;

  const complete = async () => {
    if (!confirm('Mark this collaboration as completed?')) return;
    try {
      await api.patch(`/collaborations/${c._id}/complete`, {});
      toast.success('Marked complete');
      refresh();
    } catch (err) {
      toast.error(err.displayMessage || 'Could not complete');
    }
  };

  const cancel = async () => {
    if (!confirm('Cancel this collaboration? This is rarely reversible.')) return;
    try {
      await api.patch(`/collaborations/${c._id}/cancel`, {});
      toast.success('Cancelled');
      refresh();
    } catch (err) {
      toast.error(err.displayMessage || 'Could not cancel');
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/collaborations" className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
        <ArrowLeft size={14} /> Back
      </Link>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={counterpart.name} src={counterpart.avatarUrl} size={56} />
            <div>
              <Link to={`/campaigns/${c.campaign?._id}`} className="text-sm text-muted hover:underline">
                {c.campaign?.title}
              </Link>
              <h1 className="text-2xl font-bold tracking-tight">with {counterpart.name}</h1>
              <div className="mt-2 flex items-center gap-2">
                <Badge status={c.status}>{STATUS_LABEL[c.status]}</Badge>
                {c.agreedRate && <span className="text-sm text-muted">Rate: ${c.agreedRate}</span>}
                <span className="text-sm text-muted">Started {formatDate(c.createdAt)}</span>
              </div>
            </div>
          </div>
          {c.status === 'active' && (
            <div className="flex gap-2">
              {isBrand && (
                <Button variant="success" onClick={complete}><CheckCircle2 size={14} /> Mark complete</Button>
              )}
              <Button variant="danger" onClick={cancel}><XCircle size={14} /> Cancel</Button>
            </div>
          )}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <DeliverableList
          collaboration={c}
          deliverables={deliverables}
          isBrand={isBrand}
          isInfluencer={isInfluencer}
          onChange={refresh}
        />
        <ChatPanel collaborationId={c._id} counterpartName={counterpart.name} />
      </div>
    </div>
  );
}
