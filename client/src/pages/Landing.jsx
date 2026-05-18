import { Link } from 'react-router-dom';
import {
  Sparkles, Megaphone, Users, Handshake, ShieldCheck, MessageSquare,
  CheckCircle2, ArrowRight, BarChart3, Zap, Globe, Star,
  PlayCircle, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { Avatar } from '@/components/ui/Avatar.jsx';

const FEATURES = [
  {
    icon: Megaphone,
    title: 'Campaign briefs in minutes',
    desc: 'Define budget, platform, niche, deliverables and audience targeting — published in under 60 seconds.',
  },
  {
    icon: Users,
    title: 'Discover the right creator',
    desc: 'Search 12 niches across 6 platforms. Filter by audience size, engagement rate, and location.',
  },
  {
    icon: Handshake,
    title: 'Two-sided workflow',
    desc: 'Creators apply to open briefs. Brands invite shortlisted talent. One inbox, both directions.',
  },
  {
    icon: CheckCircle2,
    title: 'Deliverable tracking',
    desc: 'Auto-generated checklist with submission, review, and approval — no more lost email threads.',
  },
  {
    icon: MessageSquare,
    title: 'Real-time messaging',
    desc: 'Encrypted Socket.io channels per collaboration. Typing indicators, read receipts, and delivery notifications.',
  },
  {
    icon: ShieldCheck,
    title: 'Trust & moderation',
    desc: 'Admin review queue, account suspension tools, and campaign flagging keep the marketplace clean.',
  },
];

const STATS = [
  { value: '12+', label: 'Creator niches' },
  { value: '6', label: 'Social platforms' },
  { value: '< 60s', label: 'Brief publish time' },
  { value: '100%', label: 'Transparent fees' },
];

const STEPS = [
  { num: '01', title: 'Post a brief', body: 'Brands describe what they need — budget, platforms, niche, deliverables.' },
  { num: '02', title: 'Match & negotiate', body: 'Creators apply, brands invite. Both sides see exactly the same details.' },
  { num: '03', title: 'Ship the work', body: 'Track deliverables, chat in real time, mark complete when paid.' },
];

const TESTIMONIALS = [
  {
    quote: '"We replaced three spreadsheets and a private Slack channel with Collably. Onboarded 14 creators in our first week."',
    author: 'Mira Sandhu',
    role: 'Brand Manager, Aura Skincare',
  },
  {
    quote: '"The deliverable checklist alone is worth it. I finally know what every brand expects before I shoot."',
    author: 'Daniyal Khan',
    role: 'Creator · 312k followers',
  },
  {
    quote: '"From posted brief to signed creator in under 48 hours. We used to take two weeks."',
    author: 'Lena Park',
    role: 'Head of Partnerships, NorthLab',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      {/* ===== Nav ===== */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-bg/70 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-accent text-white shadow-glow">
              <Sparkles size={16} />
            </span>
            <span className="text-lg tracking-tight">Collably</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
            <a href="#features" className="hover:text-fg">Features</a>
            <a href="#how-it-works" className="hover:text-fg">How it works</a>
            <a href="#testimonials" className="hover:text-fg">Customers</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost">Sign in</Button></Link>
            <Link to="/register">
              <Button className="group">Get started <ArrowRight size={14} className="transition group-hover:translate-x-0.5" /></Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="aurora relative">
        <div className="container relative grid items-center gap-12 py-20 md:grid-cols-2 md:py-28">
          <div>
            <Badge tone="brand" className="mb-6">
              <span className="mr-1 h-1.5 w-1.5 animate-pulse rounded-full bg-brand-300" />
              Now in private beta — invite-only access
            </Badge>
            <h1 className="text-balance text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Where brands and creators
              <span className="bg-gradient-to-r from-brand-400 via-accent to-brand-200 bg-clip-text text-transparent"> ship work that converts.</span>
            </h1>
            <p className="mt-6 max-w-xl text-balance text-lg text-muted">
              Stop juggling DMs, spreadsheets, and brand-safety nightmares. Collably is the operating system
              for influencer campaigns — from brief to deliverable, in one workspace.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/register">
                <Button size="lg" className="group">
                  Start free <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">
                  <PlayCircle size={16} /> See demo
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-4 text-sm text-muted">
              <div className="flex -space-x-2">
                {['Nora', 'Liam', 'Maya', 'Sam'].map((n) => (
                  <Avatar key={n} name={n} size={28} className="ring-2 ring-bg" />
                ))}
              </div>
              <span>
                <span className="font-semibold text-fg">2,400+ creators</span> already on the waitlist
              </span>
            </div>
          </div>

          {/* App preview mock */}
          <HeroPreview />
        </div>
      </section>

      {/* ===== Trust bar / stats ===== */}
      <section className="border-y border-border/60 bg-panel/40">
        <div className="container grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold tracking-tight md:text-4xl">{s.value}</div>
              <div className="mt-1 text-sm text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Features grid ===== */}
      <section id="features" className="container py-24">
        <div className="mx-auto max-w-2xl text-center">
          <Badge tone="accent">Built for both sides of the deal</Badge>
          <h2 className="mt-4 text-balance text-4xl font-bold tracking-tight">
            Everything you need to run a campaign — without the chaos.
          </h2>
          <p className="mt-4 text-muted">
            Brands get applicant tracking, deliverable approvals, and an admin moderation layer.
            Creators get a clean inbox, transparent rates, and proof-of-work submissions.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="group transition hover:border-brand-500/40 hover:shadow-glow">
              <div className="mb-4 inline-grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-500/30 to-accent/20 text-brand-200 ring-1 ring-brand-500/30 transition group-hover:scale-105">
                <Icon size={20} />
              </div>
              <h3 className="text-base font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm text-muted">{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section id="how-it-works" className="border-t border-border/60 bg-panel/30">
        <div className="container py-24">
          <div className="mx-auto max-w-2xl text-center">
            <Badge tone="brand">How it works</Badge>
            <h2 className="mt-4 text-balance text-4xl font-bold tracking-tight">From brief to paid in three moves.</h2>
          </div>
          <ol className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.num} className="relative">
                <Card className="h-full">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent text-lg font-bold text-white shadow-glow">
                      {s.num}
                    </div>
                    {i < STEPS.length - 1 && (
                      <ChevronRight size={20} className="hidden text-muted md:block" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted">{s.body}</p>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ===== Why now / value props ===== */}
      <section className="container py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <Badge tone="accent">Why now</Badge>
            <h2 className="mt-4 text-balance text-4xl font-bold tracking-tight">
              The creator economy is $250B. <br />The tooling is still in 2014.
            </h2>
            <p className="mt-4 text-muted">
              Brands run campaigns out of Google Sheets and DMs. Creators chase invoices in their inbox.
              Compliance teams have no audit trail. Collably is the system of record everyone agrees on.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                { icon: Zap, t: 'Faster cycles', d: 'Average brief-to-signed time drops from 11 days to 36 hours.' },
                { icon: BarChart3, t: 'Quantifiable results', d: 'Track reach, engagement, and conversion per collaboration.' },
                { icon: Globe, t: 'Global by default', d: 'Multi-currency support, 6 platforms, every major region.' },
              ].map(({ icon: I, t, d }) => (
                <li key={t} className="flex gap-3">
                  <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-500/15 text-brand-300">
                    <I size={16} />
                  </div>
                  <div>
                    <div className="font-medium">{t}</div>
                    <div className="text-sm text-muted">{d}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <DashboardPreviewMock />
        </div>
      </section>

      {/* ===== Testimonials ===== */}
      <section id="testimonials" className="border-y border-border/60 bg-panel/30">
        <div className="container py-24">
          <div className="mx-auto max-w-2xl text-center">
            <Badge tone="brand">Loved by both sides</Badge>
            <h2 className="mt-4 text-balance text-4xl font-bold tracking-tight">Trusted by brands and creators alike.</h2>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <Card key={t.author}>
                <div className="flex gap-0.5 text-warning">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" stroke="none" />)}
                </div>
                <p className="mt-4 text-sm leading-relaxed">{t.quote}</p>
                <div className="mt-5 flex items-center gap-3 border-t border-border/60 pt-4">
                  <Avatar name={t.author} size={36} />
                  <div className="text-sm">
                    <div className="font-medium">{t.author}</div>
                    <div className="text-xs text-muted">{t.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="container py-24">
        <Card className="aurora relative overflow-hidden text-center">
          <div className="relative">
            <h2 className="text-balance text-4xl font-bold tracking-tight">Ready to run a smarter campaign?</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              Create your free account today. No credit card. Full access to brand and creator workflows.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/register">
                <Button size="lg" className="group">
                  Create your free account <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Link to="/login"><Button size="lg" variant="outline">I have an account</Button></Link>
            </div>
          </div>
        </Card>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-border/60">
        <div className="container py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 font-semibold">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-accent text-white shadow-glow">
                  <Sparkles size={16} />
                </span>
                <span className="text-lg tracking-tight">Collably</span>
              </div>
              <p className="mt-3 max-w-sm text-sm text-muted">
                The operating system for influencer campaigns. Built for transparency, designed for speed.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li><a href="#features" className="hover:text-fg">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-fg">How it works</a></li>
                <li><Link to="/register" className="hover:text-fg">Get started</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Resources</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li><Link to="/login" className="hover:text-fg">Sign in</Link></li>
                <li><a href="#testimonials" className="hover:text-fg">Customers</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex items-center justify-between border-t border-border/60 pt-6 text-xs text-muted">
            <span>© {new Date().getFullYear()} Collably. All rights reserved.</span>
            <span>PostgreSQL · Express · React · Node · Socket.io</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* Mock product preview shown in the hero — pure CSS/JSX, no real data. */
function HeroPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-3xl bg-gradient-to-tr from-brand-500/20 via-transparent to-accent/20 blur-2xl" />
      <Card className="relative overflow-hidden">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted">Today's activity</div>
            <div className="text-lg font-semibold">Summer Glow Launch</div>
          </div>
          <Badge tone="brand">Open</Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Applications', val: '24', delta: '+8' },
            { label: 'Shortlisted', val: '7', delta: '+2' },
            { label: 'Accepted', val: '3', delta: '+1' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-panel2/60 p-3">
              <div className="text-2xl font-bold">{s.val}</div>
              <div className="text-[11px] text-muted">{s.label}</div>
              <div className="mt-1 text-[10px] font-medium text-success">{s.delta} today</div>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          {[
            { name: 'Nora Iqbal', meta: '120K · IG', status: 'Accepted', tone: 'success' },
            { name: 'Liam Chen', meta: '230K · YT', status: 'Shortlisted', tone: 'brand' },
            { name: 'Maya Rivera', meta: '102K · TT', status: 'Pending', tone: 'warning' },
          ].map((r) => (
            <div key={r.name} className="flex items-center justify-between rounded-lg border border-border bg-panel2/40 p-2">
              <div className="flex items-center gap-2">
                <Avatar name={r.name} size={28} />
                <div>
                  <div className="text-sm font-medium">{r.name}</div>
                  <div className="text-[10px] text-muted">{r.meta}</div>
                </div>
              </div>
              <Badge tone={r.tone}>{r.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* Secondary mock used in the "Why now" section. */
function DashboardPreviewMock() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-3xl bg-gradient-to-bl from-accent/10 via-transparent to-brand-500/20 blur-2xl" />
      <Card className="relative">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold">Applications · last 14 days</div>
          <Badge tone="success">+38%</Badge>
        </div>
        {/* Mini bar chart in pure divs */}
        <div className="flex h-32 items-end gap-1.5">
          {[18, 24, 19, 32, 28, 41, 36, 48, 44, 52, 47, 61, 58, 67].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-gradient-to-t from-brand-500/30 to-brand-400/80"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-xs">
          <div><div className="text-muted">Reach</div><div className="font-semibold">1.4M</div></div>
          <div><div className="text-muted">Engagement</div><div className="font-semibold">5.8%</div></div>
          <div><div className="text-muted">Active collabs</div><div className="font-semibold">12</div></div>
        </div>
      </Card>
    </div>
  );
}
