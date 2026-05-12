import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth.jsx';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card.jsx';
import { Input, Textarea, Select } from '@/components/ui/Input.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Avatar } from '@/components/ui/Avatar.jsx';
import { Badge } from '@/components/ui/Badge.jsx';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [brandProfile, setBrand] = useState(user.brandProfile || {});
  const [influencerProfile, setInf] = useState(
    user.influencerProfile || { bio: '', niches: [], location: '', handles: [] }
  );
  const [enums, setEnums] = useState({ platforms: [], niches: [] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/users/enums').then((r) => setEnums(r.data));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const payload = { name, avatarUrl };
      if (user.role === 'brand') payload.brandProfile = brandProfile;
      if (user.role === 'influencer') payload.influencerProfile = influencerProfile;
      const { data } = await api.put('/users/me/profile', payload);
      setUser(data.user);
      toast.success('Profile saved');
    } catch (err) {
      toast.error(err.displayMessage || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const toggleNiche = (n) => {
    const has = influencerProfile.niches?.includes(n);
    setInf({
      ...influencerProfile,
      niches: has
        ? influencerProfile.niches.filter((x) => x !== n)
        : [...(influencerProfile.niches || []), n],
    });
  };

  const updateHandle = (i, patch) => {
    const next = [...(influencerProfile.handles || [])];
    next[i] = { ...next[i], ...patch };
    setInf({ ...influencerProfile, handles: next });
  };

  const addHandle = () =>
    setInf({
      ...influencerProfile,
      handles: [
        ...(influencerProfile.handles || []),
        { platform: enums.platforms[0] || 'instagram', handle: '', followers: 0, engagementRate: 0 },
      ],
    });

  const removeHandle = (i) =>
    setInf({
      ...influencerProfile,
      handles: (influencerProfile.handles || []).filter((_, idx) => idx !== i),
    });

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <Avatar name={user.name} src={avatarUrl} size={64} />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
          <div className="flex items-center gap-2 text-sm text-muted">
            <Badge tone="brand" className="capitalize">{user.role}</Badge>
            <span>{user.email}</span>
          </div>
        </div>
      </header>

      <Card>
        <CardHeader><CardTitle>Account</CardTitle></CardHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Display name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Avatar URL" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
        </div>
      </Card>

      {user.role === 'brand' && (
        <Card>
          <CardHeader><CardTitle>Brand profile</CardTitle></CardHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Company name" value={brandProfile.companyName || ''}
              onChange={(e) => setBrand({ ...brandProfile, companyName: e.target.value })} />
            <Input label="Website" value={brandProfile.website || ''}
              onChange={(e) => setBrand({ ...brandProfile, website: e.target.value })} />
            <Input label="Industry" value={brandProfile.industry || ''}
              onChange={(e) => setBrand({ ...brandProfile, industry: e.target.value })} />
            <Textarea label="Description" value={brandProfile.description || ''}
              onChange={(e) => setBrand({ ...brandProfile, description: e.target.value })} />
          </div>
        </Card>
      )}

      {user.role === 'influencer' && (
        <>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Influencer profile</CardTitle>
                <CardDescription>Pick niches and add your social handles — brands search on these.</CardDescription>
              </div>
            </CardHeader>
            <div className="grid gap-4">
              <Textarea label="Bio" value={influencerProfile.bio || ''}
                onChange={(e) => setInf({ ...influencerProfile, bio: e.target.value })} />
              <Input label="Location" value={influencerProfile.location || ''}
                onChange={(e) => setInf({ ...influencerProfile, location: e.target.value })} />
              <div>
                <label className="mb-2 block text-sm font-medium text-fg/80">Niches</label>
                <div className="flex flex-wrap gap-2">
                  {enums.niches.map((n) => {
                    const active = influencerProfile.niches?.includes(n);
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => toggleNiche(n)}
                        className={
                          'rounded-full border px-3 py-1 text-xs capitalize transition ' +
                          (active
                            ? 'border-brand-500/60 bg-brand-500/15 text-brand-200'
                            : 'border-border bg-panel2/40 text-muted hover:text-fg')
                        }
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social handles</CardTitle>
              <Button size="sm" variant="secondary" onClick={addHandle}><Plus size={14} /> Add</Button>
            </CardHeader>
            <div className="space-y-3">
              {(influencerProfile.handles || []).length === 0 && (
                <p className="text-sm text-muted">No handles yet — add one to start showing up in search.</p>
              )}
              {(influencerProfile.handles || []).map((h, i) => (
                <div key={i} className="grid items-end gap-3 rounded-xl border border-border bg-panel2/40 p-3 sm:grid-cols-5">
                  <Select label="Platform" value={h.platform} onChange={(e) => updateHandle(i, { platform: e.target.value })}>
                    {enums.platforms.map((p) => <option key={p} value={p}>{p}</option>)}
                  </Select>
                  <Input label="Handle" value={h.handle} onChange={(e) => updateHandle(i, { handle: e.target.value })} />
                  <Input type="number" label="Followers" value={h.followers}
                    onChange={(e) => updateHandle(i, { followers: Number(e.target.value) })} />
                  <Input type="number" step="0.1" label="Engagement %" value={h.engagementRate}
                    onChange={(e) => updateHandle(i, { engagementRate: Number(e.target.value) })} />
                  <Button variant="danger" size="md" onClick={() => removeHandle(i)} title="Remove">
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      <div className="flex justify-end">
        <Button onClick={save} loading={saving} size="lg">Save changes</Button>
      </div>
    </div>
  );
}
