import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Input } from '@/components/ui/Input.jsx';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      const to = loc.state?.from?.pathname || '/dashboard';
      nav(to, { replace: true });
    } catch (err) {
      toast.error(err.displayMessage || 'Login failed');
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
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Sign in to continue your collaborations.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit} name="login" autoComplete="on">
          <Input
            type="email" required label="Email" placeholder="you@example.com"
            name="email" autoComplete="username"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            type="password" required label="Password" placeholder="••••••••"
            name="password" autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Button type="submit" loading={loading} className="w-full" size="lg">Sign in</Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          No account? <Link to="/register" className="text-brand-300 hover:underline">Create one</Link>
        </p>

        <div className="mt-8 rounded-xl border border-border/60 bg-panel2/40 p-3 text-xs text-muted">
          <p className="font-medium text-fg/80">Demo accounts (after seeding)</p>
          <ul className="mt-1 list-disc pl-4">
            <li>admin@icp.test / admin1234</li>
            <li>brand@icp.test / brand1234</li>
            <li>nora@icp.test / nora1234</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
