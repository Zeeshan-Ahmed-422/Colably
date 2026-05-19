import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ShieldCheck, KeyRound, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Input } from '@/components/ui/Input.jsx';
import { cn } from '@/lib/utils';

export default function AdminAuth() {
  const [tab, setTab] = useState('signin');

  return (
    <div className="aurora flex min-h-screen items-center justify-center p-6">
      <div className="glass w-full max-w-md rounded-2xl p-8">
        <Link to="/" className="mb-6 flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-accent text-white shadow-glow">
            <Sparkles size={16} />
          </span>
          <span className="text-lg tracking-tight">Collably</span>
        </Link>

        <div className="mb-1 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/30">
            <ShieldCheck size={18} />
          </div>
          <h1 className="text-2xl font-bold">Admin access</h1>
        </div>
        <p className="text-sm text-muted">Sign in to the moderation console or create an admin account.</p>

        <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl border border-border bg-panel2/40 p-1">
          <TabButton active={tab === 'signin'} onClick={() => setTab('signin')}>Sign in</TabButton>
          <TabButton active={tab === 'register'} onClick={() => setTab('register')}>Register</TabButton>
        </div>

        <div className="mt-6">
          {tab === 'signin' ? <SignIn /> : <RegisterAdmin />}
        </div>

        <div className="mt-6 border-t border-border/60 pt-4 text-center text-xs text-muted">
          Not an admin? <Link to="/login" className="text-brand-300 hover:underline">Standard sign in</Link>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-lg px-3 py-2 text-sm font-medium transition',
        active
          ? 'bg-brand-500/20 text-brand-200 ring-1 ring-brand-500/30'
          : 'text-muted hover:text-fg'
      )}
    >
      {children}
    </button>
  );
}

function SignIn() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role !== 'admin') {
        toast.error('That account is not an admin. Use standard sign-in instead.');
        return;
      }
      toast.success('Welcome, admin.');
      nav('/admin', { replace: true });
    } catch (err) {
      toast.error(err.displayMessage || 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit} name="admin-login" autoComplete="on">
      <Input
        type="email" required label="Email" placeholder="admin@example.com"
        name="email" autoComplete="username"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <div className="relative">
        <Input
          type={showPw ? 'text' : 'password'} required label="Password" placeholder="••••••••"
          name="password" autoComplete="current-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
          type="button"
          onClick={() => setShowPw((v) => !v)}
          className="absolute right-3 top-9 text-muted hover:text-fg"
          tabIndex={-1}
        >
          {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      <Button type="submit" loading={loading} className="w-full" size="lg">Sign in as admin</Button>
    </form>
  );
}

function RegisterAdmin() {
  const { setUser } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', inviteCode: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register-admin', form);
      localStorage.setItem('icp_token', data.token);
      setUser(data.user);
      toast.success('Admin account created.');
      nav('/admin', { replace: true });
    } catch (err) {
      toast.error(err.displayMessage || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit} name="admin-register">
      <Input
        required label="Full name" placeholder="Jane Doe"
        name="name" autoComplete="name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <Input
        type="email" required label="Email" placeholder="admin@example.com"
        name="email" autoComplete="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <div className="relative">
        <Input
          type={showPw ? 'text' : 'password'} required minLength={6}
          label="Password" placeholder="At least 6 characters"
          name="new-password" autoComplete="new-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
          type="button"
          onClick={() => setShowPw((v) => !v)}
          className="absolute right-3 top-9 text-muted hover:text-fg"
          tabIndex={-1}
        >
          {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-fg/80">
          <KeyRound size={12} className="mr-1 inline" /> Admin invite code
        </label>
        <Input
          required placeholder="Enter the invite code"
          name="inviteCode" autoComplete="off"
          value={form.inviteCode}
          onChange={(e) => setForm({ ...form, inviteCode: e.target.value })}
        />
        <p className="text-[11px] text-muted">
          Required to create an admin account. Ask your platform owner for the current code.
        </p>
      </div>
      <Button type="submit" loading={loading} className="w-full" size="lg">Create admin account</Button>
    </form>
  );
}
