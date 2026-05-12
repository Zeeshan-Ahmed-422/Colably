import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, ExternalLink, Send } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth.jsx';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card.jsx';
import { Avatar } from '@/components/ui/Avatar.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Modal } from '@/components/ui/Modal.jsx';
import { Input, Textarea, Select } from '@/components/ui/Input.jsx';
import { Skeleton } from '@/components/ui/Skeleton.jsx';
import { formatNumber } from '@/lib/utils';

export default function InfluencerDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [open, setOpen] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [invite, setInvite] = useState({ campaignId: '', message: '', proposedRate: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get(`/users/${id}`).then((r) => setProfile(r.data.user));
  }, [id]);

  useEffect(() => {
    if (user.role === 'brand') {
      api.get('/campaigns?mine=true&limit=50').then((r) => setCampaigns(r.data.items.filter((c) => c.status === 'open')));
    }
  }, [user.role]);

  if (!profile) return <Skeleton className="h-72 rounded-2xl" />;

  const handles = profile.influencerProfile?.handles || [];
  const niches = profile.influencerProfile?.niches || [];

  const sendInvite = async () => {
    if (!invite.campaignId) {
      toast.error('Pick a campaign');
      return;
    }
    setSending(true);
    try {
      await api.post('/applications/invite', {
        campaignId: invite.campaignId,
        influencerId: id,
        message: invite.message,
        proposedRate: invite.proposedRate ? Number(invite.proposedRate) : undefined,
      });
      toast.success('Invitation sent');
      setOpen(false);
    } catch (err) {
      toast.error(err.displayMessage || 'Could not invite');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/influencers" className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
        <ArrowLeft size={14} /> Back
      </Link>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={profile.name} src={profile.avatarUrl} size={72} />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{profile.name}</h1>
              <div className="text-sm text-muted">{profile.influencerProfile?.location || '—'}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {niches.map((n) => <Badge key={n} tone="muted">{n}</Badge>)}
              </div>
            </div>
          </div>
          {user.role === 'brand' && (
            <Button onClick={() => setOpen(true)}><Send size={14} /> Invite to campaign</Button>
          )}
        </div>
        {profile.influencerProfile?.bio && (
          <p className="mt-4 text-sm text-fg/80">{profile.influencerProfile.bio}</p>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social handles</CardTitle>
          <span className="text-sm text-muted">
            Total reach: <span className="font-semibold text-brand-300">{formatNumber(profile.influencerProfile?.totalFollowers || 0)}</span>
          </span>
        </CardHeader>
        {handles.length === 0 ? (
          <p className="text-sm text-muted">No handles added yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {handles.map((h, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-panel2/40 p-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge tone="accent" className="capitalize">{h.platform}</Badge>
                    <span className="font-medium">{h.handle}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted">
                    {formatNumber(h.followers)} followers · {h.engagementRate}% engagement
                  </div>
                </div>
                <ExternalLink size={14} className="text-muted" />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Invite ${profile.name}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={sendInvite} loading={sending}>Send invitation</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select label="Campaign" value={invite.campaignId}
            onChange={(e) => setInvite({ ...invite, campaignId: e.target.value })}>
            <option value="">Pick an open campaign</option>
            {campaigns.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
          </Select>
          <Textarea label="Message" placeholder="Why you'd love to work with them..."
            value={invite.message} onChange={(e) => setInvite({ ...invite, message: e.target.value })} />
          <Input type="number" label="Proposed rate (USD)" placeholder="Optional"
            value={invite.proposedRate} onChange={(e) => setInvite({ ...invite, proposedRate: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
