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
import { prefersReducedMotion, useAsciiTextBulge } from '../lib/useAsciiTextBulge';

const heroAsciiWithoutBackgroundDots = heroAscii.replaceAll('.', ' ');

/* ---------------------------------- hooks --------------------------------- */

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

type LanguageCode = 'EN' | 'CN';
type HeaderSelectorOption<Code extends string = string> = { code: Code; label: string };

const NAV_LINKS = [
  { key: 'features', href: '#features' },
  { key: 'clients', href: '#clients' },
  { key: 'pricing', href: '#pricing' },
  { key: 'contact', href: '#contact' },
] as const;

const LANGUAGE_OPTIONS = [
  { code: 'EN', label: 'English' },
  { code: 'CN', label: '简体中文' },
] as const satisfies readonly HeaderSelectorOption<LanguageCode>[];

const CURRENCY_OPTIONS = [
  { code: 'USD', label: 'USD' },
  { code: 'CNY', label: 'CNY' },
  { code: 'HKD', label: 'HKD' },
  { code: 'EUR', label: 'EUR' },
  { code: 'AUD', label: 'AUD' },
] as const;

type CurrencyCode = (typeof CURRENCY_OPTIONS)[number]['code'];
type BillingCycle = 'monthly' | 'annual';
type PricedPlanKey = 'starter' | 'growth';
type CurrencyPriceBook = Record<PricedPlanKey, Record<BillingCycle, number>>;

const CURRENCY_PRICING: Record<
  CurrencyCode,
  { symbol: string; prices: CurrencyPriceBook }
> = {
  USD: {
    symbol: '$',
    prices: {
      starter: { monthly: 349, annual: 299 },
      growth: { monthly: 479, annual: 399 },
    },
  },
  CNY: {
    symbol: '¥',
    prices: {
      starter: { monthly: 2499, annual: 2099 },
      growth: { monthly: 3449, annual: 2849 },
    },
  },
  HKD: {
    symbol: 'HK$',
    prices: {
      starter: { monthly: 2729, annual: 2269 },
      growth: { monthly: 3749, annual: 3119 },
    },
  },
  EUR: {
    symbol: '€',
    prices: {
      starter: { monthly: 319, annual: 269 },
      growth: { monthly: 439, annual: 369 },
    },
  },
  AUD: {
    symbol: 'A$',
    prices: {
      starter: { monthly: 529, annual: 449 },
      growth: { monthly: 729, annual: 599 },
    },
  },
};

function formatCurrencyPrice(currency: CurrencyCode, price: number | null) {
  if (price === null) return null;
  return `${CURRENCY_PRICING[currency].symbol}${price.toLocaleString('en-US')}`;
}

type SiteCopy = {
  selectors: { language: string; currency: string };
  navigation: Record<(typeof NAV_LINKS)[number]['key'], string>;
  actions: { contactSales: string; login: string; tryForFree: string };
  hero: {
    title: readonly string[];
    description: string;
    primaryAction: string;
    secondaryAction: string;
    supportNote: string;
  };
};

const SITE_COPY: Record<LanguageCode, SiteCopy> = {
  EN: {
    selectors: { language: 'Language', currency: 'Currency' },
    navigation: { features: 'Features', clients: 'Clients', pricing: 'Pricing', contact: 'Contact' },
    actions: { contactSales: 'Contact Sales', login: 'Login', tryForFree: 'Try for Free' },
    hero: {
      title: ['THE', 'Assistant', 'That Never', 'Sleeps'],
      description:
        '#1 AI Agent Platform for Automating messages. Manage your site, WhatsApp, WeChat, email and more in one place.',
      primaryAction: 'Get Started',
      secondaryAction: 'Watch Demo',
      supportNote: 'No credit card required · 30-day free trial · Cancel anytime',
    },
  },
  CN: {
    selectors: { language: '语言', currency: '货币' },
    navigation: { features: '功能', clients: '客户', pricing: '定价', contact: '联系' },
    actions: { contactSales: '联系销售', login: '登录', tryForFree: '免费试用' },
    hero: {
      title: ['永不休眠的', '智能助手'],
      description: '领先的 AI 智能助手平台，自动处理消息。在一个地方管理您的网站、WhatsApp、微信、电子邮件等渠道。',
      primaryAction: '立即开始',
      secondaryAction: '观看演示',
      supportNote: '无需信用卡 · 30 天免费试用 · 随时取消',
    },
  },
};

function HeaderSelector<Code extends string>({
  id,
  label,
  options,
  value,
  onChange,
  fullWidth = false,
  ariaLabel,
}: {
  id: string;
  label: string;
  options: readonly HeaderSelectorOption<Code>[];
  value: Code;
  onChange: (option: Code) => void;
  fullWidth?: boolean;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  const openMenu = (initialIndex?: number) => {
    const selectedIndex = options.findIndex((option) => option.code === value);
    setActiveIndex(initialIndex ?? (selectedIndex === -1 ? 0 : selectedIndex));
    setOpen(true);
  };

  const selectOption = (option: Code) => {
    onChange(option);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const selectedOption = options.find((option) => option.code === value) ?? options[0];

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }

    if (!open && ['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      openMenu(event.key === 'ArrowUp' ? options.length - 1 : undefined);
      return;
    }

    if (!open) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) =>
        event.key === 'ArrowDown'
          ? (index + 1) % options.length
          : (index - 1 + options.length) % options.length,
      );
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setActiveIndex(event.key === 'Home' ? 0 : options.length - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectOption(options[activeIndex].code);
    }
  };

  return (
    <div ref={wrapperRef} className={`relative ${fullWidth ? 'w-full' : 'shrink-0'}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={`${id}-options`}
        aria-haspopup="menu"
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
        className={`flex items-center font-mono text-[10px] tracking-[0.2em] uppercase text-black/55 transition-colors hover:text-black ${
          fullWidth ? 'w-full justify-between py-4 text-left' : 'gap-1.5 py-2'
        }`}
      >
        <span>{fullWidth ? `${label}: ${selectedOption.code}` : selectedOption.code}</span>
        <ChevronDown
          size={13}
          strokeWidth={1.5}
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div
          id={`${id}-options`}
          role="menu"
          aria-label={`${label} options`}
          className={`absolute left-1/2 top-full z-[60] mt-2 -translate-x-1/2 border border-black/10 bg-white p-1 shadow-[0_12px_30px_rgba(0,0,0,0.08)] ${
            fullWidth ? 'w-full' : 'min-w-[9.5rem]'
          }`}
        >
          {options.map((option, index) => {
            const selected = option.code === value;
            const active = index === activeIndex;
            return (
              <button
                key={option.code}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(option.code)}
                className={`flex w-full items-center justify-between gap-3 whitespace-nowrap px-3 py-2.5 text-left font-mono text-[10px] tracking-[0.15em] uppercase transition-colors ${
                  active ? 'bg-black text-white' : 'text-black/65 hover:bg-black/5 hover:text-black'
                }`}
              >
                {option.label === option.code ? option.code : `${option.code} — ${option.label}`}
                {selected && <Check size={12} strokeWidth={2.5} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Nav({
  language,
  onLanguageChange,
  currency,
  onCurrencyChange,
}: {
  language: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const copy = SITE_COPY[language];

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
              key={l.key}
              href={l.href}
              className="font-mono text-[11px] tracking-[0.25em] uppercase text-black/45 transition-colors hover:text-black"
            >
              {copy.navigation[l.key]}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-6 md:flex">
          <HeaderSelector
            id="language"
            label={copy.selectors.language}
            ariaLabel={copy.selectors.language}
            options={LANGUAGE_OPTIONS}
            value={language}
            onChange={onLanguageChange}
          />
          <HeaderSelector
            id="currency"
            label={copy.selectors.currency}
            ariaLabel={copy.selectors.currency}
            options={CURRENCY_OPTIONS}
            value={currency}
            onChange={onCurrencyChange}
          />
          <a
            href="#contact"
            className="font-mono text-[11px] tracking-[0.25em] uppercase text-black/60 transition-colors hover:text-black"
          >
            {copy.actions.contactSales}
          </a>
          <a
            href="https://app.johncrm.com/"
            className="font-mono text-[11px] tracking-[0.25em] uppercase text-black/60 transition-colors hover:text-black"
          >
            {copy.actions.login}
          </a>
          <a
            href="#pricing"
            className="bg-black px-5 py-2.5 font-mono text-[11px] tracking-[0.25em] uppercase text-white transition-opacity hover:opacity-80"
          >
            {copy.actions.tryForFree}
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
                key={l.key}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-black/5 py-4 font-mono text-[11px] tracking-[0.25em] uppercase text-black/60"
              >
                {copy.navigation[l.key]}
              </a>
            ))}
            <div className="grid grid-cols-2 gap-x-6 border-b border-black/5">
              <HeaderSelector
                id="mobile-language"
                label={copy.selectors.language}
                ariaLabel={copy.selectors.language}
                options={LANGUAGE_OPTIONS}
                value={language}
                onChange={onLanguageChange}
                fullWidth
              />
              <HeaderSelector
                id="mobile-currency"
                label={copy.selectors.currency}
                ariaLabel={copy.selectors.currency}
                options={CURRENCY_OPTIONS}
                value={currency}
                onChange={onCurrencyChange}
                fullWidth
              />
            </div>
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="border-b border-black/5 py-4 font-mono text-[11px] tracking-[0.25em] uppercase text-black/60"
            >
              {copy.actions.contactSales}
            </a>
            <a
              href="https://app.johncrm.com/"
              onClick={() => setOpen(false)}
              className="border-b border-black/5 py-4 font-mono text-[11px] tracking-[0.25em] uppercase text-black/60"
            >
              {copy.actions.login}
            </a>
            <a
              href="#pricing"
              onClick={() => setOpen(false)}
              className="mt-6 bg-black px-5 py-4 text-center font-mono text-[11px] tracking-[0.25em] uppercase text-white"
            >
              {copy.actions.tryForFree}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

/* ----------------------------- hero + dashboard ---------------------------- */

function HeroMockup() {
  const { containerRef, preRef, children } = useAsciiTextBulge(
    heroAsciiWithoutBackgroundDots,
  );
  const asciiFont =
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

  return (
    <div className="relative mx-auto flex max-w-full justify-center overflow-hidden">
      <div
        ref={containerRef}
        data-radius="0.18"
        data-strength="0.45"
        className="relative -translate-y-10 w-max max-w-none lg:-translate-y-14"
      >
        <pre
          ref={preRef}
          role="img"
          aria-label="ASCII art salesman holding a briefcase"
          aria-description="Move your cursor over the artwork or focus it to magnify it with a lens effect."
          tabIndex={0}
          className="m-0 w-max max-w-none cursor-crosshair whitespace-pre text-left text-[clamp(5.5px,1.6vw,6.5px)] leading-none tracking-normal text-[#2A88AA] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#2A88AA]/50 focus-visible:outline-offset-4 lg:text-[clamp(7px,0.75vw,10px)]"
          style={{
            fontFamily: asciiFont,
          }}
        >
          {children}
        </pre>
      </div>
    </div>
  );
}

const HERO_STATS = [
  { value: 'Embed Anywhere', label: 'WEBSITE & APP READY' },
  { value: '< 0 min', label: 'Avg Response' },
  { value: 'Automate', label: 'Appointments' },
  { value: 'Custom API', label: 'Endpoints' },
  { value: 'Google Integrations', label: 'Calendar & Meets' },
];

const HERO_STATS_BY_LANGUAGE: Record<LanguageCode, readonly { value: string; label: string }[]> = {
  EN: HERO_STATS,
  CN: [
    { value: '随处嵌入', label: '网站与应用均可使用' },
    { value: '< 0 分钟', label: '平均响应' },
    { value: '自动化', label: '预约安排' },
    { value: '自定义 API', label: '接口端点' },
    { value: 'Google 集成', label: '日历与会议' },
  ],
};

function HeroStat({ stat }: { stat: { value: string; label: string } }) {
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

function Hero({ language }: { language: LanguageCode }) {
  const [statsRef, statsInView] = useInView<HTMLDivElement>(0.15);
  const copy = SITE_COPY[language];
  const stats = HERO_STATS_BY_LANGUAGE[language];

  return (
    <section id="top" className="relative min-h-screen bg-[#F8F8F6] pt-16" style={GRID_BG}>
      <div className="mx-auto max-w-[85rem] px-6 pb-16 pt-14 lg:px-10 lg:pt-16">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-10">
          {/* left */}
          <div>
            <Reveal delay={100}>
              <h1
                className="font-display font-extrabold uppercase leading-[0.88] tracking-tight"
                style={{ fontSize: language === 'CN' ? 'clamp(3.5rem, 6vw, 6.25rem)' : 'clamp(3.75rem, 8.5vw, 7rem)' }}
              >
                {copy.hero.title.map((line, index) => (
                  <span key={line}>
                    {line}
                    {index < copy.hero.title.length - 1 && <br />}
                  </span>
                ))}
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-8 max-w-[22rem] text-[15px] leading-relaxed text-black/55">
                {copy.hero.description}
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a
                  href="#pricing"
                  className="inline-flex items-center gap-3 bg-black px-8 py-4 font-mono text-[10px] tracking-[0.25em] uppercase text-white transition-opacity hover:opacity-80"
                >
                  {copy.hero.primaryAction} <ArrowRight size={12} />
                </a>
                {SHOWCASE_ENABLED && (
                  <a
                    href="#showcase"
                    className="inline-flex items-center gap-3 border border-black/15 px-8 py-4 font-mono text-[10px] tracking-[0.25em] uppercase text-black/70 transition-colors hover:border-black/40"
                  >
                    <Play size={11} /> {copy.hero.secondaryAction}
                  </a>
                )}
              </div>
            </Reveal>

            <Reveal delay={400}>
              <div className="mt-8 font-mono text-[9px] tracking-[0.15em] uppercase text-black/30">
                {copy.hero.supportNote}
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
          {stats.map((s) => (
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
          Smarter Service. More Human.
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
          Automated customer service that still feels human. AI handles routine
          conversations while your team stays close to every customer.
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
    path: 'app.johncrm.io/dashboard',
    icon: LayoutDashboard,
    shot: shotDashboard,
    alt: 'JOHN CRM dashboard with important messages, AI activity feed, and engagement chart',
  },
  {
    key: 'pipeline',
    name: 'Pipeline',
    sub: 'Drag clients through stages and watch the forecast update in real time.',
    path: 'app.johncrm.io/pipeline',
    icon: BarChart3,
    shot: shotPipeline,
    alt: 'JOHN CRM kanban sales pipeline with clients distributed across stages',
  },
  {
    key: 'clients',
    name: 'Clients',
    sub: 'A living database of every relationship, enriched automatically.',
    path: 'app.johncrm.io/clients',
    icon: Users,
    shot: shotClients,
    alt: 'JOHN CRM client list with tags, pipeline stage, and last-contact columns',
  },
  {
    key: 'inbox',
    name: 'AI Inbox',
    sub: 'WhatsApp, email, and web chat in one thread — AI replies on standby.',
    path: 'app.johncrm.io/chat',
    icon: MessageCircle,
    shot: shotChat,
    alt: 'JOHN CRM unified inbox showing a WhatsApp conversation with AI assist enabled',
  },
  {
    key: 'campaigns',
    name: 'AI Campaigns',
    sub: 'AI writes a personalized draft for every client you select.',
    path: 'app.johncrm.io/ai-content',
    icon: Bot,
    shot: shotAiContent,
    alt: 'JOHN CRM AI campaign composer with client segments and draft preview',
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
      'JOHN CRM follows up when my team forgets. That alone paid for the subscription in the first month — we closed two deals that would have gone cold.',
    name: 'James Okafor',
    title: 'VP Sales, Nightline Corp',
  },
  {
    quote:
      'Our clients write in Cantonese, English, and Mandarin. JOHN CRM drafts the reply in all three — my team just reviews and hits approve.',
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
  priceKey?: PricedPlanKey;
  blurb: string;
  features: string[];
  cta: string;
  inverted?: boolean;
};

const PLANS: Plan[] = [
  {
    name: 'Starter',
    priceKey: 'starter',
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
    priceKey: 'growth',
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
    name: 'Custom',
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

function Pricing({ currency }: { currency: CurrencyCode }) {
  const [annual, setAnnual] = useState(true);
  const pricing = CURRENCY_PRICING[currency];

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
              const price = p.priceKey ? pricing.prices[p.priceKey][annual ? 'annual' : 'monthly'] : null;
              const formattedPrice = formatCurrencyPrice(currency, price);
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
                    {formattedPrice !== null ? (
                      <>
                        <span className="font-display text-6xl font-black leading-none">
                          {formattedPrice}
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
                      <span className="font-display text-6xl font-black uppercase leading-none">Enterprise</span>
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

const TEAM_SIZE_OPTIONS = ['1–5', '6–20', '21–100', '100+'] as const;

function TeamSizeCombobox() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  const openMenu = () => {
    const selectedIndex = TEAM_SIZE_OPTIONS.findIndex((option) => option === value);
    setActiveIndex(selectedIndex === -1 ? 0 : selectedIndex);
    setOpen(true);
  };

  const selectOption = (option: (typeof TEAM_SIZE_OPTIONS)[number]) => {
    setValue(option);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }

    if (!open && ['Enter', ' ', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      openMenu();
      return;
    }

    if (!open) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) =>
        event.key === 'ArrowDown'
          ? (index + 1) % TEAM_SIZE_OPTIONS.length
          : (index - 1 + TEAM_SIZE_OPTIONS.length) % TEAM_SIZE_OPTIONS.length,
      );
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setActiveIndex(event.key === 'Home' ? 0 : TEAM_SIZE_OPTIONS.length - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectOption(TEAM_SIZE_OPTIONS[activeIndex]);
    }
  };

  return (
    <div ref={wrapperRef} className="relative mt-2">
      <input type="hidden" name="teamSize" value={value} />
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls="team-size-options"
        aria-haspopup="listbox"
        aria-labelledby="team-size-label"
        aria-activedescendant={open ? `team-size-option-${activeIndex}` : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
        className={`flex w-full items-center justify-between border bg-white/60 px-4 py-3.5 text-left text-[14px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
          open ? 'border-black/35' : 'border-black/10 hover:border-black/30'
        }`}
      >
        <span className={value ? 'text-black/75' : 'text-black/35'}>
          {value || 'Select team size'}
        </span>
        <ChevronDown
          size={15}
          strokeWidth={1.5}
          className={`shrink-0 text-black/50 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div
          id="team-size-options"
          role="listbox"
          aria-label="Team size options"
          className="absolute inset-x-0 top-full z-20 mt-2 border border-black/10 bg-white p-1 shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
        >
          {TEAM_SIZE_OPTIONS.map((option, index) => {
            const selected = option === value;
            const active = index === activeIndex;
            return (
              <button
                key={option}
                id={`team-size-option-${index}`}
                type="button"
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(option)}
                className={`flex w-full items-center justify-between px-3 py-3 text-left text-[13px] transition-colors ${
                  active ? 'bg-black text-white' : 'text-black/65 hover:bg-black/5 hover:text-black'
                }`}
              >
                {option}
                {selected && <Check size={13} strokeWidth={2.5} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
              Tell us about your team and we&apos;ll show you exactly how JOHN CRM
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
                  <div className="block">
                    <span
                      id="team-size-label"
                      className="font-mono text-[9px] tracking-[0.25em] uppercase text-black/30"
                    >
                      Team Size
                    </span>
                    <TeamSizeCombobox />
                  </div>
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
                    By submitting you agree to our{' '}
                    <a
                      href="/privacy-policy"
                      className="underline decoration-black/20 underline-offset-2 transition-colors hover:text-black"
                    >
                      privacy policy
                    </a>
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

const FOOTER_LINKS = [
  { label: 'Privacy', href: '/privacy-policy' },
  { label: 'Terms', href: '#top' },
  { label: 'Security', href: '#top' },
  { label: 'Status', href: '#top' },
  { label: 'Documentation', href: '#top' },
] as const;

function Footer() {
  return (
    <footer className="border-t border-black/6 bg-[#F8F8F6]">
      <div className="mx-auto flex max-w-[85rem] flex-col items-start justify-between gap-8 px-6 py-14 md:flex-row md:items-center lg:px-10">
        <img src={johnCrmLogo} alt="JOHN CRM" className="h-5 w-auto" />
        <nav className="flex flex-wrap gap-x-8 gap-y-3">
          {FOOTER_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              aria-label={l.label === 'Privacy' ? 'Privacy Policy' : l.label}
              className="font-mono text-[9px] tracking-[0.25em] uppercase text-black/35 transition-colors hover:text-black"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-black/35">
          &copy; 2026 KITT DESIGNS LTD
        </div>
      </div>
    </footer>
  );
}

/* ----------------------------- privacy policy ------------------------------ */

const PRIVACY_CONTACT_EMAIL = 'biz.johncrm@gmail.com';
const PRIVACY_ADDRESS = 'Flat C, 4/F, Room 9, Ka Ming Court, 688-690 Castle Peak Road, Kowloon, Hong Kong';

const PRIVACY_NAV = [
  ['who-we-are', 'Who we are'],
  ['roles', 'Our roles'],
  ['data-we-collect', 'Data we collect'],
  ['how-we-use-data', 'How we use data'],
  ['ai-processing', 'AI processing'],
  ['support-access', 'Support access'],
  ['subprocessors', 'Data sharing'],
  ['international-transfers', 'International transfers'],
  ['retention', 'Retention'],
  ['security', 'Security'],
  ['your-rights', 'Your rights'],
  ['children', 'Children'],
  ['changes', 'Changes'],
  ['contact', 'Contact'],
] as const;

function PrivacySection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8 border-t border-black/8 pt-10 first:border-t-0 first:pt-0">
      <h2 className="font-display text-3xl font-bold uppercase leading-none tracking-[-0.02em] text-black md:text-4xl">
        {title}
      </h2>
      <div className="mt-6 space-y-5 text-[15px] leading-7 text-black/65">{children}</div>
    </section>
  );
}

function PrivacyPolicyPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Privacy Policy — JOHN CRM';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-black">
      <header className="border-b border-black/8 bg-white">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6 lg:px-10">
          <a href="/" className="flex items-center" aria-label="JOHN CRM home">
            <img src={johnCrmLogo} alt="JOHN CRM" className="h-5 w-auto" />
          </a>
          <a
            href="/"
            className="group inline-flex items-center gap-3 font-mono text-[10px] tracking-[0.25em] uppercase text-black/45 transition-colors hover:text-black"
          >
            <span className="hidden sm:inline">Back to JOHN CRM</span>
            <ArrowRight size={14} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </header>

      <main id="top">
        <section className="border-b border-black/8 bg-white" style={GRID_BG}>
          <div className="mx-auto max-w-6xl px-6 py-24 lg:px-10 lg:py-32">
            <SectionLabel>Legal / Privacy Policy</SectionLabel>
            <div className="mt-8 max-w-4xl">
              <h1 className="font-display text-6xl font-black uppercase leading-[0.88] tracking-[-0.035em] text-black md:text-8xl">
                Privacy
                <br />
                Policy
              </h1>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-[10px] tracking-[0.2em] uppercase text-black/40">
                <span>JOHN CRM</span>
                <span aria-hidden="true">/</span>
                <span>Last updated: 3 August 2026</span>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-6xl gap-16 px-6 py-20 lg:grid-cols-[13rem_minmax(0,52rem)] lg:gap-24 lg:px-10 lg:py-28">
          <aside className="hidden lg:block">
            <div className="sticky top-10">
              <SectionLabel>On this page</SectionLabel>
              <nav className="mt-6 border-l border-black/10">
                {PRIVACY_NAV.map(([id, label]) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="block border-l border-transparent py-1.5 pl-4 font-mono text-[10px] tracking-[0.12em] uppercase text-black/40 transition-colors hover:border-black hover:text-black"
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <article className="min-w-0 space-y-14">
            <PrivacySection id="who-we-are" title="1. Who we are">
              <p>
                John CRM ("<strong>John CRM</strong>", "<strong>we</strong>", "<strong>us</strong>") is a customer relationship management platform for professional service businesses, including insurance and financial advisory practices, operated by KITT DESIGNS LTD, a company registered in Hong Kong ("<strong>the Service</strong>").
              </p>
              <p>
                This policy explains what personal data we collect, why we collect it, how we use and share it, and the choices available to you.
              </p>
              <p>
                <strong className="text-black">Contact:</strong>{' '}
                <a className="underline decoration-black/20 underline-offset-4 hover:text-black" href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>
                  {PRIVACY_CONTACT_EMAIL}
                </a>{' '}
                · {PRIVACY_ADDRESS}
              </p>
            </PrivacySection>

            <PrivacySection id="roles" title="2. Our two roles: controller and processor">
              <p>John CRM handles personal data in two distinct capacities:</p>
              <ul className="list-disc space-y-3 pl-5 marker:text-black/35">
                <li><strong className="text-black">As a data controller</strong> for <strong className="text-black">Account Data</strong> — information about you as a user of the Service (your login email, name, password hash, workspace settings, billing records, activity records). We decide how and why this data is processed.</li>
                <li><strong className="text-black">As a data processor</strong> for <strong className="text-black">Customer Content</strong> — the data that you and your organization enter into or route through the Service about <em>your</em> clients and contacts (names, phone numbers, messages, uploaded documents, policy details, and similar). For Customer Content, <strong className="text-black">you or your organization are the data controller</strong>, and we process it only to provide the Service under your instructions and our agreement with you. You are responsible for having a lawful basis (and, where required, consent) to collect and process your clients' data, and for responding to your clients' privacy requests.</li>
              </ul>
            </PrivacySection>

            <PrivacySection id="data-we-collect" title="3. Data we collect">
              <h3 className="pt-2 font-display text-2xl font-bold uppercase leading-none text-black">3.1 Account Data (you as a user)</h3>
              <ul className="list-disc space-y-3 pl-5 marker:text-black/35">
                <li><strong className="text-black">Registration details:</strong> email address, display name, password (stored as a salted bcrypt hash — we never store plaintext passwords), and preferred timezone and language.</li>
                <li><strong className="text-black">Google sign-in:</strong> if you sign in with Google, we receive your Google account email and basic profile identifiers.</li>
                <li><strong className="text-black">Organization data:</strong> organization name, legal/contact information, logo, membership and role records, and team assignments.</li>
                <li><strong className="text-black">Billing data:</strong> subscription and token-purchase records, invoices, and adjustments. Payment card details are collected and processed by <strong className="text-black">Stripe</strong> — we never see or store full card numbers.</li>
                <li><strong className="text-black">Connected account credentials:</strong> if you connect Gmail, Google Calendar, Telegram, Discord, WeChat, WhatsApp, or an AI provider key, we store the tokens/keys needed to operate that connection. These credentials are encrypted at rest (AES-256-GCM).</li>
                <li><strong className="text-black">Usage and activity records:</strong> authenticated requests to the Service (endpoint, timestamp, status, IP address, active workspace) are logged for security and administration. Request bodies — message text, passwords, tokens — are <strong className="text-black">never</strong> stored in these logs. Activity records are retained for a short rolling window (currently 14 days) before deletion.</li>
                <li><strong className="text-black">AI usage records:</strong> model used, token counts, and billing attribution for AI features.</li>
                <li><strong className="text-black">Support access records:</strong> if John CRM staff access your workspace in view-as mode (see section 6), the session is recorded in an append-only audit log, and an access log is visible to your organization's administrators.</li>
              </ul>
              <h3 className="pt-4 font-display text-2xl font-bold uppercase leading-none text-black">3.2 Customer Content (data about your clients, controlled by you)</h3>
              <ul className="list-disc space-y-3 pl-5 marker:text-black/35">
                <li><strong className="text-black">Client profiles:</strong> names, phone numbers, email addresses, dates of birth, addresses, timezones, tags, pipeline status, notes, and — where you use these features — insurance/MPF portfolio details.</li>
                <li><strong className="text-black">Messages and attachments:</strong> conversations sent and received through connected channels (WhatsApp, email, Telegram, WeChat, Discord, website chat widget), including images and files.</li>
                <li><strong className="text-black">Uploaded documents:</strong> policy PDFs and knowledge-base documents you upload, stored in private object storage and served only via short-lived signed URLs after an ownership check.</li>
                <li><strong className="text-black">Website chat visitor data:</strong> if you embed our chat widget, visitors' pre-chat form details (e.g. name, email) and messages are collected on your behalf.</li>
                <li><strong className="text-black">Consent records:</strong> opt-in/opt-out status for mass messaging, kept as a durable ledger so that contacts who decline are never messaged again.</li>
              </ul>
              <h3 className="pt-4 font-display text-2xl font-bold uppercase leading-none text-black">3.3 Cookies</h3>
              <p>We use strictly necessary session cookies to keep you logged in. We do not use advertising or cross-site tracking cookies.</p>
            </PrivacySection>

            <PrivacySection id="how-we-use-data" title="4. How we use data">
              <p>We use personal data to:</p>
              <ol className="list-decimal space-y-3 pl-5 marker:font-mono marker:text-[12px] marker:text-black/45">
                <li><strong className="text-black">Provide the Service</strong> — authentication, workspace management, message delivery and receipt, calendar scheduling, document storage and retrieval, and reporting.</li>
                <li><strong className="text-black">Provide AI features</strong> — classifying inbound messages, drafting and sending replies, extracting text from uploaded documents (OCR), generating embeddings for document search, and generating content you request. See section 5.</li>
                <li><strong className="text-black">Bill for the Service</strong> — processing subscriptions, token purchases, and usage-based accounting via Stripe.</li>
                <li><strong className="text-black">Secure and operate the Service</strong> — activity logging, fraud and abuse prevention, rate limiting, debugging, and platform monitoring (aggregate statistics).</li>
                <li><strong className="text-black">Support you</strong> — responding to support requests, including consent-gated view-as access (section 6).</li>
                <li><strong className="text-black">Comply with legal obligations</strong> — record-keeping, responding to lawful requests from authorities.</li>
              </ol>
              <p>We do <strong className="text-black">not</strong> sell personal data, and we do not use Customer Content for advertising.</p>
            </PrivacySection>

            <PrivacySection id="ai-processing" title="5. AI processing">
              <p>The Service includes AI features that process message content and documents:</p>
              <ul className="list-disc space-y-3 pl-5 marker:text-black/35">
                <li><strong className="text-black">Message classification and auto-replies:</strong> inbound client messages may be sent to third-party AI model providers to classify the message topic and, where enabled by you, to draft or send a reply. Replies can be reviewed, edited, held, or disabled per conversation by your agents.</li>
                <li><strong className="text-black">Document processing (OCR and retrieval):</strong> uploaded policy and knowledge-base documents may be processed by Google Cloud Document AI (OCR) and Google Vertex AI (embeddings) so their content can be retrieved to answer questions. Documents transiting Google Cloud Storage for OCR are deleted after processing, with a 1-day automatic deletion backstop.</li>
                <li><strong className="text-black">Model providers:</strong> depending on configuration, AI requests are routed to providers including OpenRouter, DeepSeek, Anthropic, and Google. If you supply your own API key ("bring your own key"), requests for that provider are made directly with your key.</li>
                <li><strong className="text-black">No training:</strong> we do not use your data to train AI models. Our arrangements with AI providers are limited to inference (generating a response).</li>
              </ul>
              <p>You are responsible for informing your clients, as required by applicable law, that AI-assisted responses may be used in your communications with them.</p>
            </PrivacySection>

            <PrivacySection id="support-access" title="6. Support access (view-as) and transparency">
              <p>John CRM support staff may, with a stated reason, access your workspace in a <strong className="text-black">read-only "view-as" mode</strong> to troubleshoot issues. Safeguards:</p>
              <ul className="list-disc space-y-3 pl-5 marker:text-black/35">
                <li>Your organization can <strong className="text-black">disable support access</strong> at any time in its settings; when disabled, new support sessions cannot start.</li>
                <li>View-as sessions are read-only (no changes can be made), time-limited (maximum 30 minutes), and every session is recorded in an append-only audit log.</li>
                <li>Your organization's administrators can see a log of John CRM staff access to your organization.</li>
              </ul>
            </PrivacySection>

            <PrivacySection id="subprocessors" title="7. Who we share data with (subprocessors)">
              <p>We share data only with service providers who help us operate the Service, under contracts restricting their use of the data:</p>
              <div className="overflow-x-auto border-y border-black/10">
                <table className="w-full min-w-[38rem] border-collapse text-left text-[13px] leading-6">
                  <thead>
                    <tr className="border-b border-black/10 font-mono text-[9px] tracking-[0.2em] uppercase text-black/40">
                      <th className="py-4 pr-5 font-medium">Provider</th>
                      <th className="py-4 pr-5 font-medium">Purpose</th>
                      <th className="py-4 font-medium">Location</th>
                    </tr>
                  </thead>
                  <tbody className="text-black/65">
                    {[
                      ['DigitalOcean', 'Application hosting and managed database', 'Singapore'],
                      ['DigitalOcean Spaces', 'Object storage for documents and attachments (private bucket)', 'Singapore'],
                      ['Google Cloud (Document AI, Vertex AI, Cloud Storage)', 'Document OCR, embeddings for search (transient staging)', 'United States'],
                      ['OpenRouter / DeepSeek / Anthropic / Google', 'AI inference (classification, drafting, verification)', 'United States'],
                      ['Stripe', 'Payment processing', 'United States / global'],
                      ['Google', 'OAuth sign-in, Gmail sending/receiving, Calendar (where you connect them)', 'Global'],
                      ['Cloudflare', 'Network security and content delivery', 'Global'],
                    ].map(([provider, purpose, location]) => (
                      <tr key={provider} className="border-b border-black/6 last:border-0">
                        <td className="py-4 pr-5 align-top font-medium text-black">{provider}</td>
                        <td className="py-4 pr-5 align-top">{purpose}</td>
                        <td className="py-4 align-top">{location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>Messages you send and receive through third-party channels (WhatsApp, Telegram, WeChat, Discord, email providers) are also processed by those platforms under <strong className="text-black">their own privacy policies</strong>; we do not control them.</p>
              <p>We may also disclose data where required by law, to protect the rights and safety of users, or in connection with a merger or acquisition (in which case this policy will continue to apply to previously collected data).</p>
            </PrivacySection>

            <PrivacySection id="international-transfers" title="8. International transfers">
              <p>Our primary infrastructure is in Singapore. AI and document processing involves transfers to providers in the United States as listed above. Where required by applicable law, we rely on appropriate safeguards (such as contractual data-protection commitments with our subprocessors) for these transfers.</p>
            </PrivacySection>

            <PrivacySection id="retention" title="9. Retention">
              <ul className="list-disc space-y-3 pl-5 marker:text-black/35">
                <li><strong className="text-black">Account Data:</strong> retained while your account is active and for a reasonable period afterwards for record-keeping, then deleted or anonymized.</li>
                <li><strong className="text-black">Customer Content:</strong> retained under your organization's control while your subscription is active. On verified account/organization deletion, Customer Content is deleted, subject to the exceptions below.</li>
                <li><strong className="text-black">Activity logs:</strong> rolling 14-day retention.</li>
                <li><strong className="text-black">Billing and audit records:</strong> retained as required for accounting, tax, and dispute-resolution obligations.</li>
                <li><strong className="text-black">Executed contracts</strong> (where the contract feature is used): retained for at least 7 years after termination, in line with record-keeping obligations.</li>
                <li><strong className="text-black">OCR staging data:</strong> deleted after processing (1-day automatic backstop).</li>
                <li><strong className="text-black">Backups:</strong> deleted data may persist in encrypted backups for a limited period before rotating out.</li>
              </ul>
            </PrivacySection>

            <PrivacySection id="security" title="10. Security">
              <p>Measures we apply include: encryption in transit (TLS); encryption at rest for stored credentials and API keys (AES-256-GCM with per-purpose keys); salted password hashing (bcrypt); private object storage reachable only through short-lived signed URLs after ownership checks; workspace-scoped data isolation enforced at the query layer; role-based access control; append-only, tamper-evident staff audit logging; and login rate limiting. No system is perfectly secure; we will notify affected customers of a personal data breach as required by applicable law.</p>
            </PrivacySection>

            <PrivacySection id="your-rights" title="11. Your rights">
              <p>Depending on your jurisdiction (including under the Hong Kong PDPO), you may have rights to access, correct, or delete personal data we hold about you, to object to or restrict certain processing, and to data portability.</p>
              <ul className="list-disc space-y-3 pl-5 marker:text-black/35">
                <li><strong className="text-black">Users:</strong> contact us at <a className="underline decoration-black/20 underline-offset-4 hover:text-black" href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>{PRIVACY_CONTACT_EMAIL}</a> to exercise rights over your Account Data.</li>
                <li><strong className="text-black">Clients of our customers:</strong> because your data is controlled by the business you interact with, please direct requests to that business. We will assist our customers in fulfilling such requests.</li>
              </ul>
              <p>We will respond within the timeframe required by applicable law. You may also have the right to lodge a complaint with your data protection authority (in Hong Kong, the Office of the Privacy Commissioner for Personal Data).</p>
            </PrivacySection>

            <PrivacySection id="children" title="12. Children">
              <p>The Service is a business tool and is not directed at children. We do not knowingly collect personal data from anyone under 18 as users of the Service.</p>
            </PrivacySection>

            <PrivacySection id="changes" title="13. Changes to this policy">
              <p>We may update this policy from time to time. Material changes will be notified to organization administrators by email or in-app notice before they take effect. The "Last updated" date at the top reflects the current version.</p>
            </PrivacySection>

            <PrivacySection id="contact" title="14. Contact">
              <div className="border-l-2 border-black pl-6 text-black">
                <p className="font-display text-2xl font-bold uppercase leading-none">KITT DESIGNS LTD</p>
                <p className="mt-4">{PRIVACY_ADDRESS}</p>
                <a className="mt-1 inline-block underline decoration-black/20 underline-offset-4 hover:text-black" href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>
                  {PRIVACY_CONTACT_EMAIL}
                </a>
              </div>
            </PrivacySection>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ----------------------------------- app ----------------------------------- */

const SHOWCASE_ENABLED = false;

export default function App() {
  if (typeof window !== 'undefined' && window.location.pathname.replace(/\/+$/, '') === '/privacy-policy') {
    return <PrivacyPolicyPage />;
  }

  const [loading, setLoading] = useState(
    () => !prefersReducedMotion() && sessionStorage.getItem('johncrm-visited') !== '1',
  );
  const [language, setLanguage] = useState<LanguageCode>('EN');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const handleDone = useCallback(() => {
    sessionStorage.setItem('johncrm-visited', '1');
    setLoading(false);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === 'CN' ? 'zh-CN' : 'en';
  }, [language]);

  return (
    <>
      {loading && <LoadingScreen onDone={handleDone} />}
      <div className={`transition-opacity duration-700 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        <Nav
          language={language}
          onLanguageChange={setLanguage}
          currency={currency}
          onCurrencyChange={setCurrency}
        />
        <main>
          <Hero language={language} />
          <Features />
          <Poster />
          {SHOWCASE_ENABLED && <Showcase />}
          <Reviews />
          <Pricing currency={currency} />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}
