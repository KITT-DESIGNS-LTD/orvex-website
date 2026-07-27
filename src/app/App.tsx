import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  ChevronDown,
  Globe,
  LayoutDashboard,
  MessageCircle,
  Menu,
  Play,
  Shield,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react';
import shotDashboard from '../assets/crm-dashboard.png';
import shotPipeline from '../assets/crm-pipeline.png';
import shotClients from '../assets/crm-clients.png';
import shotChat from '../assets/crm-chat.png';
import shotAiContent from '../assets/crm-ai-content.png';
import heroAscii from '../assets/hero-ascii.txt?raw';
import johnCrmLogo from '../assets/johncrm.svg';

/* ---------------------------------- hooks --------------------------------- */

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function useInView<T extends HTMLElement>(threshold = 0.1) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, inView] as const;
}

/* ------------------------------- primitives ------------------------------- */

const GRID_BG: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(0deg, rgba(0,0,0,0.025) 0, rgba(0,0,0,0.025) 1px, transparent 1px, transparent 80px), repeating-linear-gradient(90deg, rgba(0,0,0,0.025) 0, rgba(0,0,0,0.025) 1px, transparent 1px, transparent 80px)',
};

function Reveal({
  children,
  delay = 0,
  className = '',
  threshold = 0.1,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  threshold?: number;
}) {
  const [ref, inView] = useInView<HTMLDivElement>(threshold);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out will-change-transform ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <div
      className={`font-mono text-[10px] tracking-[0.3em] uppercase ${
        light ? 'text-white/35' : 'text-black/35'
      }`}
    >
      {children}
    </div>
  );
}

function CornerBrackets() {
  const b = 'absolute w-[10px] h-[10px] border-black/40 pointer-events-none';
  return (
    <>
      <span className={`${b} -top-[3px] -left-[3px] border-t border-l`} />
      <span className={`${b} -top-[3px] -right-[3px] border-t border-r`} />
      <span className={`${b} -bottom-[3px] -left-[3px] border-b border-l`} />
      <span className={`${b} -bottom-[3px] -right-[3px] border-b border-r`} />
    </>
  );
}

/* ------------------------------ loading screen ----------------------------- */

const LOAD_STATUS = ['INITIALIZING', 'SYSTEM READY', 'LAUNCHING'];

function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const [filled, setFilled] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setFilled(true));
    const t1 = setTimeout(() => setPhase(1), 1200);
    const t2 = setTimeout(() => setPhase(2), 2500);
    const t3 = setTimeout(() => setFading(true), 3200);
    const t4 = setTimeout(onDone, 3700);
    return () => {
      cancelAnimationFrame(raf);
      [t1, t2, t3, t4].forEach(clearTimeout);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
      style={GRID_BG}
    >
      <img src={johnCrmLogo} alt="JOHN CRM" className="w-[min(23.125rem,78vw)]" />
      <div className="mt-10 h-px w-40 bg-black/8">
        <div
          className="h-px bg-black transition-all ease-linear"
          style={{ width: filled ? '100%' : '0%', transitionDuration: '1400ms' }}
        />
      </div>
      <div className="mt-4 font-mono text-[9px] tracking-[0.35em] uppercase text-black/25">
        {LOAD_STATUS[phase]}
      </div>
    </div>
  );
}

/* ----------------------------------- nav ----------------------------------- */

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Clients', href: '#clients' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#contact' },
];

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-16 transition-all duration-300 ${
        scrolled
          ? 'bg-white/97 backdrop-blur border-b border-black/6'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-full max-w-[85rem] items-center justify-between px-6 lg:px-10">
        <a href="#top" className="flex items-center" aria-label="JOHN CRM home">
          <img src={johnCrmLogo} alt="JOHN CRM" className="h-5 w-auto shrink-0" />
        </a>

        <nav className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="font-mono text-[11px] tracking-[0.25em] uppercase text-black/45 transition-colors hover:text-black"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-6 md:flex">
          <a
            href="#contact"
            className="font-mono text-[11px] tracking-[0.25em] uppercase text-black/60 transition-colors hover:text-black"
          >
            Contact Sales
          </a>
          <a
            href="https://app.orvex.live/g/login"
            className="font-mono text-[11px] tracking-[0.25em] uppercase text-black/60 transition-colors hover:text-black"
          >
            Login
          </a>
          <a
            href="#pricing"
            className="bg-black px-5 py-2.5 font-mono text-[11px] tracking-[0.25em] uppercase text-white transition-opacity hover:opacity-80"
          >
            Try for Free
          </a>
        </div>

        <button
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

{open && (
        <div className="absolute left-0 right-0 top-16 h-[calc(100dvh-4rem)] overflow-y-auto border-b border-black/6 bg-white md:hidden">
          <div className="flex flex-col px-6 py-6">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-black/5 py-4 font-mono text-[11px] tracking-[0.25em] uppercase text-black/60"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="border-b border-black/5 py-4 font-mono text-[11px] tracking-[0.25em] uppercase text-black/60"
            >
              Contact Sales
            </a>
            <a
              href="https://app.orvex.live/g/login"
              onClick={() => setOpen(false)}
              className="border-b border-black/5 py-4 font-mono text-[11px] tracking-[0.25em] uppercase text-black/60"
            >
              Login
            </a>
            <a
              href="#pricing"
              onClick={() => setOpen(false)}
              className="mt-6 bg-black px-5 py-4 text-center font-mono text-[11px] tracking-[0.25em] uppercase text-white"
            >
              Try for Free
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

/* ----------------------------- hero + dashboard ---------------------------- */

function HeroMockup() {
  return (
    <div className="relative mx-auto flex max-w-full justify-center overflow-hidden">
      <pre
        role="img"
        aria-label="ASCII art salesman holding a briefcase"
        className="m-0 w-max max-w-none whitespace-pre text-left text-[clamp(5px,0.55vw,7px)] leading-none tracking-normal text-black/75"
        style={{
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        }}
      >
        {heroAscii}
      </pre>
    </div>
  );
}

const HERO_STATS = [
  { value: '< 0 min', label: 'Avg Response' },
  { value: 'WhatsApp', label: 'Support' },
  { value: 'Custom API', label: 'Endpoints' },
  { value: 'Automate', label: 'Meetings' },
  { value: 'Embed Anywhere', label: 'Website & platform ready' },
];

function HeroStat({ stat }: { stat: (typeof HERO_STATS)[number] }) {
  return (
    <div>
      <div className="font-display text-[clamp(1.75rem,2.35vw,3rem)] font-black leading-none">
        {stat.value}
      </div>
      <div className="mt-2 font-mono text-xs tracking-[0.12em] uppercase text-black/55 lg:text-sm">
        {stat.label}
      </div>
    </div>
  );
}

function Hero() {
  const [statsRef, statsInView] = useInView<HTMLDivElement>(0.15);

  return (
    <section id="top" className="relative min-h-screen bg-[#F8F8F6] pt-16" style={GRID_BG}>
      <div className="mx-auto max-w-[85rem] px-6 pb-16 pt-14 lg:px-10 lg:pt-16">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-10">
          {/* left */}
          <div>
            <Reveal delay={100}>
              <h1
                className="font-display font-extrabold uppercase leading-[0.88] tracking-tight"
                style={{ fontSize: 'clamp(3.75rem, 8.5vw, 7rem)' }}
              >
                Your
                <br />
                Salesman
                <br />
                That Never
                <br />
                Sleeps
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-8 max-w-[22rem] text-[15px] leading-relaxed text-black/55">
                #1 AI Agent Platform for Automating messages. Manage your
                site, WhatsApp, WeChat, email and more in one place.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a
                  href="#pricing"
                  className="inline-flex items-center gap-3 bg-black px-8 py-4 font-mono text-[10px] tracking-[0.25em] uppercase text-white transition-opacity hover:opacity-80"
                >
                  Get Started <ArrowRight size={12} />
                </a>
                <a
                  href="#showcase"
                  className="inline-flex items-center gap-3 border border-black/15 px-8 py-4 font-mono text-[10px] tracking-[0.25em] uppercase text-black/70 transition-colors hover:border-black/40"
                >
                  <Play size={11} /> Watch Demo
                </a>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <div className="mt-8 font-mono text-[9px] tracking-[0.15em] uppercase text-black/30">
                No credit card required &middot; 30-day free trial &middot; Cancel anytime
              </div>
            </Reveal>
          </div>

          {/* right */}
          <Reveal delay={250} className="lg:pl-4">
            <HeroMockup />
          </Reveal>
        </div>

        {/* stats bar */}
        <div
          ref={statsRef}
          className={`mt-24 grid grid-cols-2 gap-10 border-t border-black/6 pt-12 transition-all duration-700 lg:grid-cols-5 ${
            statsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {HERO_STATS.map((s) => (
            <HeroStat key={s.label} stat={s} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- features -------------------------------- */

const FEATURES = [
  {
    icon: Zap,
    title: 'AI-Powered Outreach',
    body: 'AI drafts every reply and follow-up, grounded in your own playbooks and policy documents. Nothing sends until you approve — or flip low-risk replies to full autopilot.',
  },
  {
    icon: TrendingUp,
    title: 'Revenue Intelligence',
    body: 'Deal scoring, forecast rollups, and win-probability signals surfaced in real time — so you commit numbers you can actually hit.',
  },
  {
    icon: Users,
    title: 'Team Alignment',
    body: 'Shared pipelines, task routing, and activity timelines keep sales, marketing, and success working the same book of business.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    body: 'SSO, role-based access, and a full audit trail of every AI draft, approval, and send. Blacklisted phrases and mandatory disclaimers enforced automatically.',
  },
  {
    icon: Globe,
    title: 'Multi-Channel Reach',
    body: 'WhatsApp, WeChat, Telegram, Messenger, Instagram, email, and web chat — every conversation in one inbox, answered in the client’s language: English, Cantonese, or Mandarin.',
  },
  {
    icon: BarChart3,
    title: 'Pipeline Analytics',
    body: 'Stage conversion, cycle time, and rep performance broken down to the deal. No spreadsheet exports required.',
  },
];

function Features() {
  return (
    <section id="features" className="bg-white py-32">
      <div className="mx-auto max-w-[85rem] px-6 lg:px-10">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <SectionLabel>01 — Capabilities</SectionLabel>
              <h2 className="mt-4 font-display text-6xl font-black uppercase leading-[0.9] lg:text-7xl">
                Built for
                <br />
                Performance
              </h2>
            </div>
            <p className="max-w-xs pb-2 text-left text-[13px] leading-relaxed text-black/50 lg:text-right">
              Six modules. One system of record. Every conversation, deal, and
              number accounted for — nothing left in a spreadsheet.
            </p>
          </div>
        </Reveal>

        <Reveal delay={150} className="mt-16">
          <div className="grid gap-px bg-black/5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group bg-white p-10 transition-colors duration-300 hover:bg-[#F8F8F6]"
              >
                <div className="flex h-9 w-9 items-center justify-center border border-black/15 transition-colors duration-300 group-hover:border-black/40">
                  <f.icon size={15} strokeWidth={1.5} />
                </div>
                <h3 className="mt-6 font-display text-xl font-bold uppercase tracking-wide">
                  {f.title}
                </h3>
                <p className="mt-3 text-[13px] leading-relaxed text-black/50">{f.body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------- poster --------------------------------- */

const POSTER_GRID: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 60px)',
};

function Poster() {
  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center bg-black px-6 py-32 text-center"
      style={POSTER_GRID}
    >
      <Reveal>
        <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-white/28">
          The Operating System for Revenue
        </div>
      </Reveal>
      <Reveal delay={150}>
        <h2
          className="mt-10 font-display font-black uppercase leading-[0.85] text-white"
          style={{ fontSize: 'clamp(3.5rem, 13vw, 11rem)' }}
        >
          Close More.
          <br />
          Work Less.
          <br />
          Grow Fast.
        </h2>
      </Reveal>
      <Reveal delay={300}>
        <p className="mx-auto mt-10 max-w-md text-[15px] leading-relaxed text-white/50">
          Every conversation answered. Every deal tracked. Every number in one
          place. ORVEX runs your revenue engine around the clock.
        </p>
        <a
          href="#pricing"
          className="mt-10 inline-flex items-center gap-3 bg-white px-10 py-4 font-mono text-[10px] tracking-[0.25em] uppercase text-black transition-opacity hover:opacity-80"
        >
          Start Free Trial <ArrowRight size={12} />
        </a>
      </Reveal>
      <ChevronDown
        size={20}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 motion-safe:animate-bounce text-white opacity-20"
      />
    </section>
  );
}

/* --------------------------------- showcase -------------------------------- */

type Screen = {
  key: string;
  name: string;
  sub: string;
  path: string;
  icon: typeof LayoutDashboard;
  shot: string;
  alt: string;
};

const SCREENS: Screen[] = [
  {
    key: 'dashboard',
    name: 'Dashboard',
    sub: 'Every metric that matters, on one screen the moment you log in.',
    path: 'app.orvex.io/dashboard',
    icon: LayoutDashboard,
    shot: shotDashboard,
    alt: 'ORVEX dashboard with important messages, AI activity feed, and engagement chart',
  },
  {
    key: 'pipeline',
    name: 'Pipeline',
    sub: 'Drag clients through stages and watch the forecast update in real time.',
    path: 'app.orvex.io/pipeline',
    icon: BarChart3,
    shot: shotPipeline,
    alt: 'ORVEX kanban sales pipeline with clients distributed across stages',
  },
  {
    key: 'clients',
    name: 'Clients',
    sub: 'A living database of every relationship, enriched automatically.',
    path: 'app.orvex.io/clients',
    icon: Users,
    shot: shotClients,
    alt: 'ORVEX client list with tags, pipeline stage, and last-contact columns',
  },
  {
    key: 'inbox',
    name: 'AI Inbox',
    sub: 'WhatsApp, email, and web chat in one thread — AI replies on standby.',
    path: 'app.orvex.io/chat',
    icon: MessageCircle,
    shot: shotChat,
    alt: 'ORVEX unified inbox showing a WhatsApp conversation with AI assist enabled',
  },
  {
    key: 'campaigns',
    name: 'AI Campaigns',
    sub: 'AI writes a personalized draft for every client you select.',
    path: 'app.orvex.io/ai-content',
    icon: Bot,
    shot: shotAiContent,
    alt: 'ORVEX AI campaign composer with client segments and draft preview',
  },
];

function Showcase() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const onScroll = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const total = el.offsetHeight - window.innerHeight;
    if (total <= 0) return;
    const p = Math.min(1, Math.max(0, -rect.top / total));
    setProgress(p);
  }, []);

  useEffect(() => {
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [onScroll]);

  const n = SCREENS.length;
  const active = Math.min(n - 1, Math.floor(progress * n));
  const screen = SCREENS[active];
  // Snap to whole screens: never rest on a half-exposed screen; the slide
  // animates via the transform transition when `active` crosses a threshold.
  const translate = -(active * 100) / n;

  return (
    <section id="showcase" ref={wrapRef} style={{ height: `${n * 100}vh` }} className="bg-[#F8F8F6]">
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden px-6 pb-8 pt-24 lg:px-10">
        <div className="mx-auto flex w-full max-w-[85rem] flex-1 flex-col">
          {/* header */}
          <div className="mb-6 flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionLabel>02 — Product Tour</SectionLabel>
              <h2 className="mt-2 font-display text-5xl font-black uppercase leading-none lg:text-6xl">
                {screen.name}
              </h2>
              <p className="mt-2 max-w-md text-[13px] text-black/50">{screen.sub}</p>
            </div>
            <div className="flex items-center gap-2 pb-2">
              {SCREENS.map((s, i) => (
                <button
                  key={s.key}
                  aria-label={`Show ${s.name} screen`}
                  aria-current={i === active}
                  onClick={() => {
                    const el = wrapRef.current;
                    if (!el) return;
                    const top = el.getBoundingClientRect().top + window.scrollY;
                    const total = el.offsetHeight - window.innerHeight;
                    window.scrollTo({
                      top: top + (total * i) / (SCREENS.length - 1),
                      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
                    });
                  }}
                  className="group flex h-4 items-center border-0 bg-transparent p-0"
                >
                  <span
                    className={`h-0.5 transition-all duration-300 ${
                      i === active ? 'w-10 bg-black' : 'w-4 bg-black/15 group-hover:bg-black/30'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 font-mono text-[9px] tracking-[0.2em] text-black/30">
                0{active + 1} / 0{n}
              </span>
            </div>
          </div>

          {/* browser frame */}
          <div className="relative flex min-h-0 flex-1 flex-col border border-black/8 bg-white shadow-[0_8px_60px_rgba(0,0,0,0.05)]">
            <CornerBrackets />
            <div className="flex items-center gap-3 border-b border-black/6 bg-[#F4F4F2] px-4 py-2.5">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-2 w-2 rounded-full bg-black/12" />
                ))}
              </div>
              <div className="flex-1 border border-black/6 bg-white px-3 py-1 font-mono text-[9px] tracking-wider text-black/35">
                {screen.path}
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <div
                className="flex h-full transition-transform duration-500 ease-out will-change-transform motion-reduce:transition-none"
                style={{ width: `${n * 100}%`, transform: `translateX(${translate}%)` }}
              >
                {SCREENS.map((s) => (
                  <div key={s.key} className="h-full overflow-hidden" style={{ width: `${100 / n}%` }}>
                    <img
                      src={s.shot}
                      alt={s.alt}
                      className="h-full w-full object-cover object-left-top"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- reviews --------------------------------- */

const REVIEWS = [
  {
    quote:
      'Every channel lands in one inbox and the AI has a draft waiting before we even open the thread. We replaced three tools and our reps still got faster.',
    name: 'Marcus Webb',
    title: 'Partner, Summit Capital',
  },
  {
    quote:
      'We connected WhatsApp, email, and our website chat in an afternoon. By the end of the week the pipeline was cleaner than it had been in two years.',
    name: 'Priya Nandan',
    title: 'Head of Growth, BrightLabs',
  },
  {
    quote:
      'The forecast rollups are the first numbers I have ever trusted enough to take straight to the board. No massaging, no spreadsheet gymnastics — the pipeline is the report.',
    name: 'Daniel Osei',
    title: 'COO, Vertex Group',
  },
  {
    quote:
      'Our response time went from hours to minutes. Leads notice. We book nearly twice the meetings from the same traffic.',
    name: 'Sarah Lindström',
    title: 'Founder, ECME Ventures',
  },
  {
    quote:
      'ORVEX follows up when my team forgets. That alone paid for the subscription in the first month — we closed two deals that would have gone cold.',
    name: 'James Okafor',
    title: 'VP Sales, Nightline Corp',
  },
  {
    quote:
      'Our clients write in Cantonese, English, and Mandarin. ORVEX drafts the reply in all three — my team just reviews and hits approve.',
    name: 'Claire Beaumont',
    title: 'Managing Director, Propager',
  },
];

function TickMarks() {
  return (
    <div className="flex items-end gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="h-3 w-px bg-black/30" />
      ))}
    </div>
  );
}

function Reviews() {
  return (
    <section id="clients" className="bg-white py-32">
      <div className="mx-auto max-w-[85rem] px-6 lg:px-10">
        <Reveal>
          <SectionLabel>03 — Clients</SectionLabel>
          <h2 className="mt-4 font-display text-6xl font-black uppercase leading-[0.9] lg:text-7xl">
            What They
            <br />
            Say
          </h2>
        </Reveal>

        <Reveal delay={150} className="mt-16">
          <div className="columns-1 gap-px md:columns-2 lg:columns-3">
            {REVIEWS.map((r) => (
              <figure
                key={r.name}
                className="mb-px break-inside-avoid border-l-2 border-black/5 bg-[#F8F8F6] p-8 transition-colors duration-300 hover:border-black/25"
              >
                <TickMarks />
                <blockquote className="mt-5 text-[13px] leading-relaxed text-black/65">
                  &ldquo;{r.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6">
                  <div className="font-display text-base font-bold uppercase tracking-wide text-black/85">
                    {r.name}
                  </div>
                  <div className="mt-1 font-mono text-[9px] tracking-[0.2em] uppercase text-black/35">
                    {r.title}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------- pricing --------------------------------- */

type Plan = {
  name: string;
  monthly: number | null;
  annual: number | null;
  blurb: string;
  features: string[];
  cta: string;
  inverted?: boolean;
};

const PLANS: Plan[] = [
  {
    name: 'Starter',
    monthly: 59,
    annual: 49,
    blurb: 'For small teams getting their first pipeline in order.',
    features: [
      'Up to 1,000 contacts',
      'Shared inbox — email & web chat',
      'Pipeline board',
      'Basic analytics',
      '2 team seats',
      'Standard support',
    ],
    cta: 'Start Free Trial',
  },
  {
    name: 'Growth',
    monthly: 179,
    annual: 149,
    blurb: 'For teams ready to put follow-up on autopilot.',
    features: [
      'Everything in Starter',
      'All channels — WhatsApp, WeChat, Telegram & more',
      'AI drafts with approval queue',
      'Knowledge-base answers (RAG)',
      'Bulk campaigns & templates',
      '10 team seats',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    inverted: true,
  },
  {
    name: 'Enterprise',
    monthly: null,
    annual: null,
    blurb: 'For organizations with security and scale requirements.',
    features: [
      'Everything in Growth',
      'SSO / SAML',
      'Custom integrations',
      'Unlimited seats',
      'Dedicated CSM',
      '99.9% uptime SLA',
    ],
    cta: 'Contact Sales',
  },
];

function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="bg-[#F8F8F6] py-32">
      <div className="mx-auto max-w-[85rem] px-6 lg:px-10">
        <Reveal>
          <SectionLabel>04 — Pricing</SectionLabel>
          <h2 className="mt-4 font-display text-6xl font-black uppercase leading-[0.9] lg:text-7xl">
            Transparent
            <br />
            Pricing
          </h2>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-10 inline-flex border border-black/10 bg-white p-1">
            {(
              [
                { key: false, label: 'Monthly' },
                { key: true, label: 'Annual –17%' },
              ] as const
            ).map((t) => (
              <button
                key={t.label}
                onClick={() => setAnnual(t.key)}
                className={`px-5 py-2 font-mono text-[9px] tracking-[0.2em] uppercase transition-colors ${
                  annual === t.key ? 'bg-black text-white' : 'text-black/40 hover:text-black'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={200} className="mt-12">
          <div className="grid gap-px bg-black/6 lg:grid-cols-3">
            {PLANS.map((p) => {
              const price = annual ? p.annual : p.monthly;
              const inv = p.inverted;
              return (
                <div
                  key={p.name}
                  className={`relative flex flex-col p-10 ${
                    inv ? 'bg-black text-white' : 'border border-black/6 bg-white'
                  }`}
                >
                  {inv && (
                    <span className="absolute -top-3.5 left-8 border border-white/20 bg-black px-3 py-1.5 font-mono text-[8px] tracking-[0.25em] uppercase text-white">
                      Most Popular
                    </span>
                  )}
                  <div
                    className={`font-mono text-[9px] tracking-[0.3em] uppercase ${
                      inv ? 'text-white/40' : 'text-black/30'
                    }`}
                  >
                    {p.name}
                  </div>
                  <div className="mt-6 flex items-baseline gap-2">
                    {price !== null ? (
                      <>
                        <span className="font-display text-6xl font-black leading-none">
                          ${price}
                        </span>
                        <span
                          className={`font-mono text-[9px] tracking-[0.15em] uppercase ${
                            inv ? 'text-white/35' : 'text-black/30'
                          }`}
                        >
                          / mo
                        </span>
                      </>
                    ) : (
                      <span className="font-display text-6xl font-black uppercase leading-none">Custom</span>
                    )}
                  </div>
                  <p
                    className={`mt-4 text-[12px] leading-relaxed ${
                      inv ? 'text-white/45' : 'text-black/40'
                    }`}
                  >
                    {p.blurb}
                  </p>
                  <ul className="mb-10 mt-8 flex flex-col gap-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <Check
                          size={12}
                          strokeWidth={2.5}
                          className={`mt-0.5 shrink-0 ${inv ? 'text-white/70' : 'text-black/60'}`}
                        />
                        <span
                          className={`text-[12px] ${inv ? 'text-white/60' : 'text-black/55'}`}
                        >
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#contact"
                    className={`mt-auto block py-4 text-center font-mono text-[10px] tracking-[0.25em] uppercase transition-opacity hover:opacity-80 ${
                      inv
                        ? 'bg-white text-black'
                        : 'border border-black/15 text-black/70 hover:border-black/40'
                    }`}
                  >
                    {p.cta}
                  </a>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------- contact --------------------------------- */

const CONTACT_INFO = [
  { label: 'Response Time', value: '< 2 hours' },
  { label: 'Demo Duration', value: '30 minutes' },
  { label: 'Setup Time', value: 'Same day' },
  { label: 'Free Trial', value: '30 days' },
  { label: 'Channels Supported', value: '8+' },
];

function Contact() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="contact" className="bg-white py-32">
      <div className="mx-auto max-w-[85rem] px-6 lg:px-10">
        <div className="grid gap-16 lg:grid-cols-[2fr_3fr] lg:gap-14">
          <Reveal>
            <SectionLabel>05 — Contact</SectionLabel>
            <h2 className="mt-4 font-display text-6xl font-black uppercase leading-[0.9] lg:text-7xl">
              Let&apos;s
              <br />
              Talk
              <br />
              Revenue
            </h2>
            <p className="mt-8 max-w-sm text-[14px] leading-relaxed text-black/55">
              Tell us about your team and we&apos;ll show you exactly how ORVEX
              fits your pipeline. No slide decks — a live walkthrough on your
              own data.
            </p>
            <div className="mt-12 max-w-sm">
              {CONTACT_INFO.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between border-b border-black/6 py-4"
                >
                  <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-black/30">
                    {row.label}
                  </span>
                  <span className="font-display text-base font-bold uppercase">{row.value}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="border border-black/8 bg-[#FAFAF8] p-10">
              {submitted ? (
                <div className="flex min-h-[28rem] flex-col items-center justify-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center border border-black/15">
                    <Check size={18} strokeWidth={2.5} />
                  </div>
                  <div className="mt-6 font-display text-4xl font-black uppercase">Received</div>
                  <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-black/40">
                    We&apos;ll get back to you within two hours during business
                    days. Check your inbox for a confirmation.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                  className="flex flex-col gap-7"
                >
                  {(
                    [
                      { id: 'name', label: 'Full Name', placeholder: 'Jane Analyst', type: 'text', required: true },
                      { id: 'company', label: 'Company', placeholder: 'Acme Industries', type: 'text', required: true },
                      { id: 'email', label: 'Work Email', placeholder: 'jane@acme.com', type: 'email', required: true },
                    ] as const
                  ).map((f) => (
                    <label key={f.id} className="block">
                      <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-black/30">
                        {f.label}
                      </span>
                      <input
                        type={f.type}
                        required={f.required}
                        placeholder={f.placeholder}
                        className="mt-2 w-full border-b border-black/6 bg-transparent pb-4 text-[14px] outline-none transition-colors placeholder:text-black/15 focus:border-black/30"
                      />
                    </label>
                  ))}
                  <label className="block">
                    <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-black/30">
                      Team Size
                    </span>
                    <select
                      className="mt-2 w-full border-b border-black/6 bg-transparent pb-4 text-[14px] text-black/70 outline-none focus:border-black/30"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select team size
                      </option>
                      <option>1–5</option>
                      <option>6–20</option>
                      <option>21–100</option>
                      <option>100+</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-black/30">
                      Message (Optional)
                    </span>
                    <textarea
                      rows={3}
                      placeholder="What does your current pipeline look like?"
                      className="mt-2 w-full resize-none border-b border-black/6 bg-transparent pb-4 text-[14px] outline-none transition-colors placeholder:text-black/15 focus:border-black/30"
                    />
                  </label>
                  <button
                    type="submit"
                    className="mt-2 w-full bg-black py-5 font-mono text-[10px] tracking-[0.3em] uppercase text-white transition-opacity hover:opacity-80"
                  >
                    Book a Demo
                  </button>
                  <p className="text-center font-mono text-[8px] tracking-[0.15em] uppercase text-black/25">
                    By submitting you agree to our privacy policy
                  </p>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- footer --------------------------------- */

const FOOTER_LINKS = ['Privacy', 'Terms', 'Security', 'Status', 'Documentation'];

function Footer() {
  return (
    <footer className="border-t border-black/6 bg-[#F8F8F6]">
      <div className="mx-auto flex max-w-[85rem] flex-col items-start justify-between gap-8 px-6 py-14 md:flex-row md:items-center lg:px-10">
        <img src={johnCrmLogo} alt="JOHN CRM" className="h-5 w-auto" />
        <nav className="flex flex-wrap gap-x-8 gap-y-3">
          {FOOTER_LINKS.map((l) => (
            <a
              key={l}
              href="#top"
              className="font-mono text-[9px] tracking-[0.25em] uppercase text-black/35 transition-colors hover:text-black"
            >
              {l}
            </a>
          ))}
        </nav>
        <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-black/35">
          &copy; 2026 ORVEX Inc.
        </div>
      </div>
    </footer>
  );
}

/* ----------------------------------- app ----------------------------------- */

export default function App() {
  const [loading, setLoading] = useState(
    () => !prefersReducedMotion() && sessionStorage.getItem('orvex-visited') !== '1',
  );
  const handleDone = useCallback(() => {
    sessionStorage.setItem('orvex-visited', '1');
    setLoading(false);
  }, []);

  return (
    <>
      {loading && <LoadingScreen onDone={handleDone} />}
      <div className={`transition-opacity duration-700 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        <Nav />
        <main>
          <Hero />
          <Features />
          <Poster />
          <Showcase />
          <Reviews />
          <Pricing />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}
