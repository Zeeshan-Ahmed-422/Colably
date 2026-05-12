import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, CalendarDays, DollarSign, Pencil, Users } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth.jsx';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { Input, Textarea } from '@/components/ui/Input.jsx';
import { Modal } from '@/components/ui/Modal.jsx';
import { Avatar } from '@/components/ui/Avatar.jsx';
import { Skeleton } from '@/components/ui/Skeleton.jsx';
import { formatDate, STATUS_LABEL } from '@/lib/utils';

export default function CampaignDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);
  const [apply, setApply] = useState({ message: '', proposedRate: '' });
  const [submitting, setSubmitting] = useState(false);

  const refresh = () =>
    api.get(`/campaigns/${id}`).then((r) => setData(r.data));

  useEffect(() => { refresh(); }, [id]);

  if (!data) {
    return <Skeleton className="h-96 rounded-2xl" />;
  }

  const { campaign, myApplication } = data;
  const isOwner = user.role === 'brand' && campaign.brand?._id === user._id;
  const canApply = user.role === 'influencer' && campaign.status === 'open' && !myApplication;

  const submitApplication = async () => {
    setSubmitting(true);
    try {
      await api.post('/applications', {
        campaignId: campaign._id,
        message: apply.message,
        proposedRate: apply.proposedRate ? Number(apply.proposedRate) : undefined,
      });
      toast.success('Application submitted');
      setOpen(false);
      refresh();
    } catch (err) {
      toast.error(err.displayMessage || 'Could not apply');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCampaign = async () => {
    if (!confirm('Delete this campaign? This cannot be undone.')) return;
    try {
      await api.delete(`/campaigns/${campaign._id}`);
      toast.success('Campaign deleted');
      nav('/campaigns/mine');
    } catch (err) {
      toast.error(err.displayMessage || 'Could not delete');
    }
  };

  const toggleStatus = async () => {
    const next = campaign.status === 'open' ? 'closed' : 'open';
    try {
      await api.put(`/campaigns/${campaign._id}`, { status: next });
      toast.success(`Campaign ${next === 'open' ? 'reopened' : 'closed'}`);
      refresh();
    } catch (err) {
      toast.error(err.displayMessage || 'Could not update');
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/campaigns" className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
        <ArrowLeft size={14} /> Back
      </Link>

      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Badge status={campaign.status}>{STATUS_LABEL[campaign.status]}</Badge>
              {campaign.moderation?.flagged && <Badge tone="danger">Flagged</Badge>}
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight">{campaign.title}</h1>
            <p className="mt-2 whitespace-pre-wrap text-sm text-fg/80">{campaign.description}</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Meta icon={DollarSign} label="Budget" value={`$${campaign.budget} ${campaign.currency || 'USD'}`} />
              <Meta icon={CalendarDays} label="Deadline" value={formatDate(campaign.deadline)} />
              <Meta icon={Users} label="Min followers" value={campaign.minFollowers?.toLocaleString() || '—'} />
            </div>

            <div className="mt-4 flex flex-wrap gap-1">
              {(campaign.platforms || []).map((p) => <Badge key={p} tone="accent">{p}</Badge>)}
              {(campaign.niches || []).map((n) => <Badge key={n} tone="muted">{n}</Badge>)}
            </div>
          </div>

          <div className="hidden w-56 shrink-0 lg:block">
            <Card className="bg-panel2/40 p-4">
              <div className="text-xs uppercase tracking-wide text-muted">Posted by</div>
              <div className="mt-2 flex items-center gap-2">
                <Avatar name={campaign.brand?.name} src={campaign.brand?.avatarUrl} />
                <div>
                  <div className="font-medium">{campaign.brand?.brandProfile?.companyName || campaign.brand?.name}</div>
                  <div className="text-xs text-muted">{campaign.brand?.brandProfile?.industry || 'Brand'}</div>
                </div>
              </div>
              {campaign.brand?.brandProfile?.website && (
                <a href={campaign.brand.brandProfile.website} target="_blank" rel="noreferrer"
                  className="mt-3 block truncate text-xs text-brand-300 hover:underline">
                  {campaign.brand.brandProfile.website}
                </a>
              )}
            </Card>
          </div>
        </div>
      </Card>

      {campaign.deliverablesTemplate?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Expected deliverables</CardTitle></CardHeader>
          <ul className="space-y-2">
            {campaign.deliverablesTemplate.map((d, i) => (
              <li key={i} className="rounded-xl border border-border bg-panel2/40 px-3 py-2 text-sm">{d}</li>
            ))}
          </ul>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {canApply && <Button size="lg" onClick={() => setOpen(true)}>Apply to campaign</Button>}
        {myApplication && (
          <div className="flex items-center gap-2 rounded-xl border border-border bg-panel2/40 px-3 py-2 text-sm">
            <span className="text-muted">Your application:</span>
            <Badge status={myApplication.status}>{STATUS_LABEL[myApplication.status]}</Badge>
          </div>
        )}
        {isOwner && (
          <>
            <Link to={`/campaigns/${campaign._id}/applicants`}>
              <Button variant="secondary"><Users size={14} /> View applicants</Button>
            </Link>
            <Button variant="outline" onClick={toggleStatus}>
              <Pencil size={14} /> {campaign.status === 'open' ? 'Close' : 'Reopen'}
            </Button>
            <Button variant="danger" onClick={deleteCampaign}>Delete</Button>
          </>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Apply to "${campaign.title}"`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submitApplication} loading={submitting}>Submit</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Textarea
            label="Message to the brand"
            placeholder="Why are you a great fit?"
            value={apply.message}
            onChange={(e) => setApply({ ...apply, message: e.target.value })}
          />
          <Input
            type="number" label="Proposed rate (USD)" placeholder="Optional"
            value={apply.proposedRate}
            onChange={(e) => setApply({ ...apply, proposedRate: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
}

function Meta({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-panel2/40 p-3">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-panel text-brand-300">
        <Icon size={16} />
      </div>
      <div>
        <div className="text-xs text-muted">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
