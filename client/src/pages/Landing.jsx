import { Link } from 'react-router-dom';
import { Sparkles, Megaphone, Users, Handshake, ShieldCheck, MessageSquare, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button.jsx';
import { Card } from '@/components/ui/Card.jsx';

const FEATURES = [
  { icon: Megaphone, title: 'Post campaigns', desc: 'Brands publish briefs with budget, niche, and required platforms.' },
  { icon: Users, title: 'Discover influencers', desc: 'Filter by niche, audience size, and platform — instantly.' },
  { icon: Handshake, title: 'Apply or invite', desc: 'Two-way workflow: influencers apply, brands invite.' },
  { icon: CheckCircle2, title: 'Deliverable tracking', desc: 'Checklist of deliverables, status, and proof submissions.' },
  { icon: MessageSquare, title: 'Real-time chat', desc: 'Socket.io DMs once a collaboration is active.' },
  { icon: ShieldCheck, title: 'Admin moderation', desc: 'Suspend users, flag campaigns, keep the platform safe.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <div className="aurora">
        <header className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-accent text-white shadow-glow">
              <Sparkles size={16} />
            </span>
            <span className="text-lg tracking-tight">Collably</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost">Sign in</Button></Link>
            <Link to="/register"><Button>Get started</Button></Link>
          </nav>
        </header>

        <section className="container py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-panel2/60 px-3 py-1 text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Built with PostgreSQL · Express · React · Node · Socket.io
          </span>
          <h1 className="mt-6 text-balance text-5xl font-bold tracking-tight md:text-6xl">
            Where brands and creators
            <span className="bg-gradient-to-r from-brand-400 via-accent to-brand-200 bg-clip-text text-transparent"> actually ship together.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-muted">
            Post campaigns, discover the right influencers, manage applications,
            track deliverables, and chat in real-time — all in one modular platform.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link to="/register">
              <Button size="lg" className="group">
                Create an account <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <Link to="/login"><Button size="lg" variant="outline">Sign in</Button></Link>
          </div>
        </section>
      </div>

      <section className="container pb-24">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="transition hover:border-brand-500/40">
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
                <Icon size={18} />
              </div>
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted">{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="container flex h-14 items-center justify-between text-xs text-muted">
          <span>© {new Date().getFullYear()} Collably — Abdullah Khan &amp; Zeeshan Ahmad</span>
          <span>MERN · Socket.io · Tailwind · JWT</span>
        </div>
      </footer>
    </div>
  );
}
