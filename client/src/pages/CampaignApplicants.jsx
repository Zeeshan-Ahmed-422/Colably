import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { Avatar } from '@/components/ui/Avatar.jsx';
import { Empty } from '@/components/ui/Empty.jsx';
import { Skeleton } from '@/components/ui/Skeleton.jsx';
import { formatNumber, STATUS_LABEL, timeAgo } from '@/lib/utils';

export default function CampaignApplicants() {
  const { id } = useParams();
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api
      .get(`/applications/campaign/${id}`)
      .then((r) => setItems(r.data.items))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, [id]);

  const setStatus = async (applicationId, status) => {
    try {
      const { data } = await api.patch(`/applications/${applicationId}/status`, { status });
      toast.success(`Marked as ${status}`);
      if (status === 'accepted' && data.collaboration) {
        nav(`/collaborations/${data.collaboration._id}`);
      } else {
        load();
      }
    } catch (err) {
      toast.error(err.displayMessage || 'Could not update');
    }
  };

  return (
    <div className="space-y-6">
      <Link to={`/campaigns/${id}`} className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
        <ArrowLeft size={14} /> Back to campaign
      </Link>
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Applicants</h1>
        <p className="text-sm text-muted">Review, shortlist, or accept influencers for this campaign.</p>
      </header>

      {loading ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : items.length === 0 ? (
        <Empty title="No applicants yet" description="Once influencers apply, they will appear here." />
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <Card key={a._id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={a.influencer?.name} src={a.influencer?.avatarUrl} size={44} />
                  <div className="min-w-0">
                    <Link to={`/influencers/${a.influencer?._id}`} className="font-semibold hover:underline">
                      {a.influencer?.name}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span>{formatNumber(a.influencer?.influencerProfile?.totalFollowers || 0)} followers</span>
                      <span>·</span>
                      <span>{(a.influencer?.influencerProfile?.niches || []).join(', ') || 'no niches'}</span>
                      <span>·</span>
                      <span>{a.kind}</span>
                      <span>·</span>
                      <span>{timeAgo(a.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge status={a.status}>{STATUS_LABEL[a.status]}</Badge>
                  {a.status === 'pending' && (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => setStatus(a._id, 'shortlisted')}>Shortlist</Button>
                      <Button size="sm" variant="success" onClick={() => setStatus(a._id, 'accepted')}>Accept</Button>
                      <Button size="sm" variant="danger" onClick={() => setStatus(a._id, 'rejected')}>Reject</Button>
                    </>
                  )}
                  {a.status === 'shortlisted' && (
                    <>
                      <Button size="sm" variant="success" onClick={() => setStatus(a._id, 'accepted')}>Accept</Button>
                      <Button size="sm" variant="danger" onClick={() => setStatus(a._id, 'rejected')}>Reject</Button>
                    </>
                  )}
                </div>
              </div>
              {a.message && (
                <p className="mt-3 rounded-xl border border-border bg-panel2/40 p-3 text-sm">{a.message}</p>
              )}
              {a.proposedRate && (
                <p className="mt-2 text-xs text-muted">Proposed rate: ${a.proposedRate}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
