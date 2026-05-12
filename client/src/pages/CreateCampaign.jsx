import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card.jsx';
import { Input, Textarea } from '@/components/ui/Input.jsx';
import { Button } from '@/components/ui/Button.jsx';

export default function CreateCampaign() {
  const nav = useNavigate();
  const [enums, setEnums] = useState({ platforms: [], niches: [] });
  const [form, setForm] = useState({
    title: '',
    description: '',
    budget: '',
    currency: 'USD',
    platforms: [],
    niches: [],
    minFollowers: 0,
    deadline: '',
  });
  const [deliverables, setDeliverables] = useState(['']);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/users/enums').then((r) => setEnums(r.data));
  }, []);

  const toggle = (key, val) => {
    const has = form[key].includes(val);
    setForm({ ...form, [key]: has ? form[key].filter((v) => v !== val) : [...form[key], val] });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.budget) {
      toast.error('Title, description, and budget are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        budget: Number(form.budget),
        minFollowers: Number(form.minFollowers) || 0,
        deliverablesTemplate: deliverables.map((d) => d.trim()).filter(Boolean),
        deadline: form.deadline || undefined,
      };
      const { data } = await api.post('/campaigns', payload);
      toast.success('Campaign posted');
      nav(`/campaigns/${data.campaign._id}`);
    } catch (err) {
      toast.error(err.displayMessage || 'Could not create');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Post a campaign</h1>
        <p className="text-sm text-muted">Define the brief — budget, platforms, niche, and expected deliverables.</p>
      </header>

      <Card>
        <CardHeader><CardTitle>Basics</CardTitle></CardHeader>
        <div className="grid gap-4">
          <Input required label="Title" placeholder="Summer Glow Launch"
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea required label="Description" placeholder="What is the campaign about? Who's the target audience?"
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid gap-4 md:grid-cols-3">
            <Input required type="number" label="Budget (USD)" placeholder="1500"
              value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
            <Input type="number" label="Min followers"
              value={form.minFollowers} onChange={(e) => setForm({ ...form, minFollowers: e.target.value })} />
            <Input type="date" label="Deadline"
              value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Platforms & niches</CardTitle></CardHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-fg/80">Platforms</label>
            <div className="flex flex-wrap gap-2">
              {enums.platforms.map((p) => (
                <Chip key={p} active={form.platforms.includes(p)} onClick={() => toggle('platforms', p)}>{p}</Chip>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-fg/80">Niches</label>
            <div className="flex flex-wrap gap-2">
              {enums.niches.map((n) => (
                <Chip key={n} active={form.niches.includes(n)} onClick={() => toggle('niches', n)}>{n}</Chip>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deliverables checklist</CardTitle>
          <Button type="button" size="sm" variant="secondary" onClick={() => setDeliverables([...deliverables, ''])}>
            <Plus size={14} /> Add
          </Button>
        </CardHeader>
        <div className="space-y-2">
          {deliverables.map((d, i) => (
            <div key={i} className="flex gap-2">
              <Input value={d} placeholder={`e.g. 1 Reel (30s+)`}
                onChange={(e) => {
                  const next = [...deliverables];
                  next[i] = e.target.value;
                  setDeliverables(next);
                }} />
              <Button type="button" variant="danger" onClick={() => setDeliverables(deliverables.filter((_, idx) => idx !== i))}>
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => nav(-1)}>Cancel</Button>
        <Button type="submit" loading={saving} size="lg">Publish campaign</Button>
      </div>
    </form>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'rounded-full border px-3 py-1 text-xs capitalize transition ' +
        (active
          ? 'border-brand-500/60 bg-brand-500/15 text-brand-200'
          : 'border-border bg-panel2/40 text-muted hover:text-fg')
      }
    >
      {children}
    </button>
  );
}
