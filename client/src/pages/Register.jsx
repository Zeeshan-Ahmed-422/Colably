import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Briefcase, Mic2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Input } from '@/components/ui/Input.jsx';
import { cn } from '@/lib/utils';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [role, setRole] = useState('influencer');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...form, role });
      toast.success('Account created!');
      nav('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.displayMessage || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aurora flex min-h-screen items-center justify-center p-6">
      <div className="glass w-full max-w-md rounded-2xl p-8">
        <Link to="/" className="mb-6 flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-accent text-white shadow-glow">
            <Sparkles size={16} />
          </span>
          <span className="text-lg tracking-tight">Collably</span>
        </Link>
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted">Pick a role to get started.</p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <RoleTile
            active={role === 'influencer'}
            onClick={() => setRole('influencer')}
            icon={Mic2} label="Influencer" desc="Find campaigns to join."
          />
          <RoleTile
            active={role === 'brand'}
            onClick={() => setRole('brand')}
            icon={Briefcase} label="Brand" desc="Post and manage briefs."
          />
        </div>

        <form className="mt-6 space-y-4" onSubmit={onSubmit} name="register" autoComplete="on">
          <Input
            required label="Full name" placeholder="Jane Doe"
            name="name" autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            type="email" required label="Email" placeholder="you@example.com"
            name="email" autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            type="password" required minLength={6} label="Password" placeholder="At least 6 characters"
            name="new-password" autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Button type="submit" loading={loading} className="w-full" size="lg">Create account</Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have one? <Link to="/login" className="text-brand-300 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

function RoleTile({ active, onClick, icon: Icon, label, desc }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-2xl border p-3 text-left transition',
        active
          ? 'border-brand-500/60 bg-brand-500/10'
          : 'border-border bg-panel2/40 hover:border-border/80'
      )}
    >
      <div className="mb-2 grid h-8 w-8 place-items-center rounded-lg bg-panel text-brand-300">
        <Icon size={16} />
      </div>
      <div className="text-sm font-semibold">{label}</div>
      <div className="text-xs text-muted">{desc}</div>
    </button>
  );
}
