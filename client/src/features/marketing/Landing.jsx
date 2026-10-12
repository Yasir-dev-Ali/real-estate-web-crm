import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  Check,
  ChevronRight,
  ClipboardList,
  Home,
  Menu,
  Users,
  Wallet,
  X,
} from "lucide-react";

const PRODUCTS = [
  {
    number: "01",
    icon: Users,
    title: "Relationships, remembered",
    description:
      "Keep every lead, conversation and next step in one calm, searchable place. No more important details lost between viewings.",
    tag: "Leads & follow-ups",
  },
  {
    number: "02",
    icon: Building2,
    title: "Every listing in its place",
    description:
      "Bring property details, availability and viewing history together, so your team always knows what is ready to show.",
    tag: "Property portfolio",
  },
  {
    number: "03",
    icon: ClipboardList,
    title: "A clearer path to close",
    description:
      "See each deal move from first interest to handover, with bookings and the details your team needs along the way.",
    tag: "Deals & bookings",
  },
  {
    number: "04",
    icon: Wallet,
    title: "Know what the work is worth",
    description:
      "Track commissions, team activity and your pipeline with a shared view of the numbers behind every transaction.",
    tag: "Commissions & insights",
  },
];

const STEPS = [
  ["01", "Bring the details together", "Add your people, properties and opportunities to one private brokerage workspace."],
  ["02", "Keep everyone in step", "Coordinate viewings, follow-ups and deal progress without losing the personal touch."],
  ["03", "Move confidently to handover", "See what is moving, what needs attention and what your team has accomplished."],
];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="min-h-screen overflow-hidden bg-paper-50 text-ink-900">
      <header className="relative z-20 border-b border-paper-200/80 bg-paper-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <a href="#top" onClick={closeMenu} className="flex items-center gap-3" aria-label="Aurelia home">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink-900 text-brass-400">
              <Home size={18} />
            </span>
            <span>
              <span className="block font-serif text-xl leading-none">Aurelia</span>
              <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.24em] text-ink-500">Realty OS</span>
            </span>
          </a>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-paper-200 text-ink-800 md:hidden"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            <a className="text-sm text-ink-500 transition hover:text-ink-900" href="#about">About</a>
            <a className="text-sm text-ink-500 transition hover:text-ink-900" href="#products">Products</a>
            <a className="text-sm text-ink-500 transition hover:text-ink-900" href="#how-it-works">How it works</a>
            <Link className="text-sm font-semibold text-ink-800 transition hover:text-clay-500" to="/login">Sign in</Link>
            <Link className="btn-primary !rounded-full !px-5 !py-2.5" to="/register">
              Get started <ArrowUpRight size={15} />
            </Link>
          </nav>
        </div>
        {menuOpen && (
          <nav className="absolute left-0 right-0 top-full border-b border-paper-200 bg-paper-50 px-5 py-4 shadow-card md:hidden" aria-label="Mobile navigation">
            <div className="mx-auto grid max-w-7xl gap-1">
              <a onClick={closeMenu} className="rounded-lg px-3 py-3 text-sm hover:bg-paper-100" href="#about">About Aurelia</a>
              <a onClick={closeMenu} className="rounded-lg px-3 py-3 text-sm hover:bg-paper-100" href="#products">Products</a>
              <a onClick={closeMenu} className="rounded-lg px-3 py-3 text-sm hover:bg-paper-100" href="#how-it-works">How it works</a>
              <Link onClick={closeMenu} className="rounded-lg px-3 py-3 text-sm hover:bg-paper-100" to="/login">Sign in</Link>
              <Link onClick={closeMenu} className="btn-primary mt-2 w-full" to="/register">Create your workspace <ArrowRight size={16} /></Link>
            </div>
          </nav>
        )}
      </header>

      <main>
        <section id="top" className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:px-12 lg:pb-24 lg:pt-20">
          <div className="relative z-10">
            <p className="mb-6 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-clay-500">
              <span className="h-px w-8 bg-clay-500" /> A more considered way to work
            </p>
            <h1 className="max-w-2xl font-serif text-[clamp(3.2rem,7vw,6.15rem)] leading-[0.98] tracking-[-0.055em] text-ink-900">
              Good property work, <span className="text-clay-500">better connected.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-ink-500 sm:text-lg sm:leading-8">
              Aurelia brings your brokerage’s people, properties and deals into one thoughtful workspace — made for the way real estate moves in Pakistan and beyond.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="btn-primary !rounded-full !px-6 !py-3">
                Create your workspace <ArrowRight size={16} />
              </Link>
              <a href="#products" className="btn-ghost !rounded-full !px-6 !py-3">
                Explore the platform <ArrowDown size={15} />
              </a>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-paper-200 pt-5 text-xs text-ink-500">
              <span className="inline-flex items-center gap-2"><Check size={14} className="text-sage-500" /> One private team workspace</span>
              <span className="inline-flex items-center gap-2"><Check size={14} className="text-sage-500" /> Built for modern brokerages</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[620px] lg:ml-auto">
            <div className="absolute -right-5 -top-5 h-32 w-32 rounded-full bg-brass-200/50 blur-2xl sm:-right-8 sm:-top-8" />
            <div className="relative min-h-[390px] overflow-hidden rounded-[2rem] bg-ink-800 sm:min-h-[520px]">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85"
                alt="Warm, modern home framed by greenery"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/75 via-ink-950/5 to-ink-950/10" />
              <div className="absolute left-5 top-5 rounded-full border border-white/25 bg-ink-950/25 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur sm:left-7 sm:top-7">
                A clearer view of the whole house
              </div>
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/60 bg-paper-50/95 p-4 shadow-card backdrop-blur sm:bottom-7 sm:left-7 sm:right-auto sm:w-[min(90%,390px)] sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-500">Your brokerage, in view</p>
                    <p className="mt-1 font-serif text-xl text-ink-900">The week, well in hand.</p>
                  </div>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sage-100 text-sage-500"><BarChart3 size={18} /></span>
                </div>
                <div className="mt-4 grid grid-cols-3 divide-x divide-paper-200 border-y border-paper-200 py-3">
                  <div className="pr-2"><p className="font-serif text-xl sm:text-2xl">24</p><p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-ink-500 sm:text-[10px]">Active leads</p></div>
                  <div className="px-2"><p className="font-serif text-xl sm:text-2xl">08</p><p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-ink-500 sm:text-[10px]">Viewings</p></div>
                  <div className="pl-2"><p className="font-serif text-xl sm:text-2xl">12</p><p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-ink-500 sm:text-[10px]">Live listings</p></div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-ink-500">Everything moving together</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-sage-500"><span className="h-1.5 w-1.5 rounded-full bg-sage-500" /> On track</span>
                </div>
              </div>
              <p className="absolute bottom-8 right-7 hidden max-w-32 text-right font-serif text-2xl leading-tight text-white drop-shadow sm:block">Places hold stories. Keep yours moving.</p>
            </div>
            <div className="absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-2xl border border-paper-200 bg-white p-3 shadow-card sm:flex lg:-left-8">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-clay-100 text-clay-500"><Check size={18} /></span>
              <span><span className="block text-xs font-semibold text-ink-900">A handover, made clearer</span><span className="mt-0.5 block text-[10px] text-ink-500">From first hello to keys in hand</span></span>
            </div>
          </div>
        </section>

        <section id="about" className="scroll-mt-8 bg-ink-900 text-paper-50">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20 lg:px-12 lg:py-24">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brass-400">A little about us</p>
              <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.03em] sm:text-5xl">Built around the people behind every place.</h2>
            </div>
            <div className="lg:pt-2">
              <p className="max-w-2xl text-base leading-8 text-ink-300 sm:text-lg">
                Real estate runs on trust, timing and a thousand thoughtful details. Aurelia gives brokerages one private place to hold all of them — so teams can spend less time chasing updates and more time looking after people.
              </p>
              <div className="mt-8 grid gap-6 border-t border-white/10 pt-6 sm:grid-cols-2">
                <div><p className="font-serif text-2xl text-paper-50">Made for your market</p><p className="mt-2 text-sm leading-6 text-ink-300">Designed for brokerage teams working across Pakistan and serving clients at home and abroad.</p></div>
                <div><p className="font-serif text-2xl text-paper-50">Private by design</p><p className="mt-2 text-sm leading-6 text-ink-300">A dedicated workspace keeps your brokerage’s people, activity and operations together.</p></div>
              </div>
            </div>
          </div>
        </section>

        <section id="products" className="scroll-mt-8 mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-clay-500">One connected platform</p>
              <h2 className="mt-3 max-w-2xl font-serif text-4xl leading-tight tracking-[-0.035em] sm:text-5xl">Everything your team needs to keep good work moving.</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-ink-500">Less scattered admin. More room for the conversations and decisions that make a difference.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
            {PRODUCTS.map(({ number, icon: Icon, title, description, tag }) => (
              <article key={number} className="group flex min-h-[280px] flex-col rounded-2xl border border-paper-200 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-brass-400 hover:shadow-card sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-paper-100 text-ink-800 transition group-hover:bg-ink-900 group-hover:text-brass-400"><Icon size={19} /></span>
                  <span className="font-serif text-sm text-ink-300">{number}</span>
                </div>
                <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.15em] text-clay-500">{tag}</p>
                <h3 className="mt-2 font-serif text-2xl leading-tight">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink-500">{description}</p>
                <a href="#how-it-works" className="mt-auto inline-flex items-center gap-1 pt-5 text-xs font-semibold text-ink-800 transition group-hover:text-clay-500">
                  See how it fits <ChevronRight size={14} />
                </a>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-8 border-y border-paper-200 bg-paper-100">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-12 lg:py-24">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-clay-500">A smoother way through</p>
              <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.035em] sm:text-5xl">From first hello to keys in hand.</h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-ink-500">The work behind a great property experience should feel connected, not complicated. Aurelia helps your team keep the whole journey in view.</p>
              <Link to="/register" className="btn-primary mt-7 !rounded-full !px-6">Start with Aurelia <ArrowRight size={16} /></Link>
            </div>
            <div className="divide-y divide-paper-200 rounded-2xl border border-paper-200 bg-paper-50 px-5 sm:px-7">
              {STEPS.map(([number, title, description]) => (
                <div key={number} className="grid gap-3 py-6 sm:grid-cols-[52px_1fr] sm:gap-5 sm:py-7">
                  <span className="font-serif text-lg text-clay-500">{number}</span>
                  <div><h3 className="font-serif text-2xl">{title}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-ink-500">{description}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
          <div className="relative overflow-hidden rounded-[2rem] bg-ink-900 px-6 py-12 text-center text-paper-50 sm:px-12 sm:py-16">
            <div className="absolute -right-16 -top-28 h-64 w-64 rounded-full border border-white/10" />
            <div className="absolute -bottom-44 -left-8 h-72 w-72 rounded-full border border-white/10" />
            <p className="relative text-[11px] font-semibold uppercase tracking-[0.2em] text-brass-400">A good place to begin</p>
            <h2 className="relative mx-auto mt-4 max-w-3xl font-serif text-4xl leading-tight tracking-[-0.035em] sm:text-5xl">Make room for the work that moves your business forward.</h2>
            <p className="relative mx-auto mt-4 max-w-xl text-sm leading-7 text-ink-300">Bring your brokerage together with one secure workspace for relationships, listings and deals.</p>
            <Link to="/register" className="btn mt-7 !rounded-full !bg-brass-400 !px-6 !py-3 !text-ink-900 hover:!bg-paper-50">
              Create your workspace <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-paper-200 bg-paper-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <a href="#top" className="flex items-center gap-3" aria-label="Aurelia, back to top">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink-900 text-brass-400"><Home size={16} /></span>
            <span><span className="block font-serif text-lg leading-none">Aurelia</span><span className="mt-1 block text-[9px] uppercase tracking-[0.2em] text-ink-500">Realty OS</span></span>
          </a>
          <p className="text-xs text-ink-500">Thoughtfully made for the people who bring places to life.</p>
          <div className="flex items-center gap-5 text-xs font-medium text-ink-500">
            <a className="hover:text-ink-900" href="#about">About</a>
            <a className="hover:text-ink-900" href="#products">Products</a>
            <Link className="hover:text-ink-900" to="/login">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
