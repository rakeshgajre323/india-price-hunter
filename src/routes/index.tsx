import { createFileRoute } from "@tanstack/react-router";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Search,
  Bell,
  ShoppingBasket,
  Sparkles,
  Mic,
  Chrome,
  Smartphone,
  Users,
  Wallet,
  ChevronRight,
  Zap,
  Timer,
  Tag,
  Truck,
  Percent,
  Gift,
  ShoppingCart,
} from "lucide-react";
import { categories } from "@/data/categories";
import { platforms } from "@/data/platforms";
import { products } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { LogoMarquee } from "@/components/LogoMarquee";
import { savingsPercent } from "@/lib/compare";
import { looksLikeUrl } from "@/lib/parse-product-link";
import shoppingBanner from "@/assets/shopping-banner.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QuickCompare India — Compare Zepto, Blinkit, Instamart prices" },
      { name: "description", content: "Find the cheapest quick-commerce app for groceries, snacks, dairy and household essentials. Live across 6 apps, pincode-aware." },
      { property: "og:title", content: "QuickCompare India" },
      { property: "og:description", content: "Compare prices across India's quick-commerce apps in one place." },
    ],
  }),
  component: Index,
});

const DEAL_TIERS = [49, 99, 149, 199, 299, 399, 499, 799];
const DISCOUNT_TIERS = [30, 40, 50, 60, 70];
const QUICK_LINKS = [
  "Zepto Price Tracker",
  "Blinkit Price Tracker",
  "Instamart Deals",
  "Cheapest Milk Today",
  "BigBasket Coupons",
  "Amazon Fresh",
];

function Index() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const trending = [...products]
    .map((p) => ({ p, s: savingsPercent(p) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 8)
    .map((x) => x.p);

  return (
    <div>
      {/* Hero — bold purple, centered search */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "#000000" }}
          aria-hidden
        />
        {/* radial rays */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-30 mix-blend-overlay"
          aria-hidden
          style={{
            background:
              "repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,0.18) 0deg 2deg, transparent 2deg 8deg)",
          }}
        />
        <div className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-white/10 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-14 text-center text-white md:pb-24 md:pt-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm ring-1 ring-white/20">
            <Sparkles className="h-3.5 w-3.5" />
            Price History &amp; Tracker
          </div>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Stop Switching Apps
            <br />
            <span className="text-emerald-300">to Compare Prices</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/85 font-sans md:text-base">
            Compare prices, delivery fees, and real offers across Blinkit, Zepto, Instamart, and more — instantly.
          </p>

          {/* Search bar */}
          <form
            role="search"
            action="/search"
            className="relative mx-auto mt-8 flex max-w-3xl items-center overflow-hidden rounded-full bg-white pl-5 pr-1.5 py-1.5 shadow-2xl ring-1 ring-black/5"
          >
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              name="q"
              type="search"
              placeholder="Paste any quick-commerce link to compare instantly"
              className="ml-3 h-11 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none font-mono border-2 border-double border-slate-50 shadow-sm rounded-md opacity-100"
            />
            <button
              type="button"
              aria-label="Voice search"
              className="mr-1 hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary md:inline-flex"
            >
              <Mic className="h-4 w-4" />
            </button>
            <button
              type="submit"
              className="inline-flex h-11 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-md transition hover:opacity-90"
            >
              <Search className="h-4 w-4" /> Search
            </button>
          </form>

          {/* Magic trick callout */}
          <div className="mx-auto mt-6 inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full bg-black/25 px-4 py-2 text-xs text-white/90 ring-1 ring-white/10 backdrop-blur-sm md:text-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span className="font-semibold">Magic Trick for Quick Commerce</span>
            <span className="hidden text-white/40 md:inline">•</span>
            <span className="text-white/80">Type</span>
            <code className="rounded-full bg-amber-300 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-950">
              quickcompare.in/
            </code>
            <span className="text-white/80">before ANY product link</span>
          </div>
        </div>

        {/* Quick-link chip bar */}
        <div className="relative border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {QUICK_LINKS.map((label) => (
              <Link
                key={label}
                to="/search"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white px-3.5 py-1.5 text-xs font-medium text-foreground shadow-sm hover:border-primary hover:text-primary"
              >
                <ArrowRight className="h-3 w-3" /> {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Promo banner */}
      <section className="mx-auto max-w-7xl px-4 pt-10">
        {/* Everyday essentials banner */}
        <div className="relative mb-6 overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/5">
          <img
            src={shoppingBanner}
            alt="Shop everyday essentials — laptops, groceries, vegetables and more"
            width={1920}
            height={800}
            loading="lazy"
            className="h-56 w-full object-cover md:h-80"
          />
          <div className="absolute inset-0 flex items-center bg-gradient-to-r from-purple-900/70 via-purple-900/20 to-transparent md:bg-gradient-to-l md:from-purple-900/0 md:via-purple-900/0 md:to-transparent">
            <div className="ml-auto max-w-md px-6 py-6 text-right md:px-12">
              <div className="text-xs font-bold uppercase tracking-widest text-white/90">
                Everyday essentials
              </div>
              <h2 className="mt-2 text-2xl font-extrabold leading-tight text-white drop-shadow-md md:text-4xl">
                Track Deals on Everything You Buy
              </h2>
              <p className="mt-2 text-sm text-white/90 md:text-base">
                Laptops, vegetables, groceries, footwear &amp; more — all in one place.
              </p>
              <Link
                to="/deals"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-purple-700 shadow-md transition hover:bg-amber-300 hover:text-amber-950"
              >
                Explore Deals <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 px-6 py-6 md:px-10 md:py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-amber-950/70">
                Festive month
              </div>
              <div className="mt-1 text-2xl font-extrabold text-amber-950 md:text-4xl">
                FLAT ₹350 OFF on Zepto
              </div>
              <div className="mt-1 text-sm font-semibold text-amber-950/80">
                USE CODE <span className="rounded-md bg-amber-950 px-2 py-0.5 font-mono text-amber-50">QCNEW</span>
              </div>
            </div>
            <Link
              to="/deals"
              className="inline-flex items-center gap-2 rounded-full bg-amber-950 px-5 py-3 text-sm font-bold text-amber-50 transition hover:bg-black"
            >
              Grab Deal <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div
            className="pointer-events-none absolute -bottom-10 -right-10 h-44 w-44 rounded-full bg-white/30 blur-2xl"
            aria-hidden
          />
        </div>
      </section>

      {/* Flash Sale strip */}
      <section className="mx-auto max-w-7xl px-4 pt-10">
        <div className="relative overflow-hidden rounded-3xl border border-rose-200 bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 px-6 py-6 text-white md:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur-sm">
                <Zap className="h-6 w-6" />
              </span>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-white/80">
                  Flash Sale · Live now
                </div>
                <div className="mt-0.5 text-xl font-extrabold md:text-2xl">
                  Up to 70% OFF on daily essentials
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 text-xs font-bold ring-1 ring-white/10">
                <Timer className="h-3.5 w-3.5" />
                Ends in 02h 14m
              </div>
              <Link
                to="/deals"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-50"
              >
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Shopper perks strip */}
      <section className="mx-auto max-w-7xl px-4 pt-10">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Truck, title: "Free Delivery", body: "On orders above ₹199" },
            { icon: Percent, title: "Lowest Price", body: "Guaranteed across 6 apps" },
            { icon: Gift, title: "Cashback Rewards", body: "Earn on every basket" },
            { icon: ShoppingCart, title: "Smart Basket", body: "One cart, cheapest split" },
          ].map((perk) => {
            const Icon = perk.icon;
            return (
              <div
                key={perk.title}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-sm font-bold">{perk.title}</div>
                  <div className="text-xs text-muted-foreground">{perk.body}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Hot Deals — tier grid */}
      <section className="mx-auto max-w-7xl px-4 pt-14">
        <SectionHeader title="Hot Deals" subtitle="Powered by Smart Basket Scanner" />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {DEAL_TIERS.map((t) => (
            <Link
              key={t}
              to="/search"
              className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-primary/10 p-5 text-center transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Deals under
              </div>
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 px-6 py-6 md:px-10 md:py-8 text-purple-600 bg-fuchsia-600">
                ₹{t}
              </div>
              <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-primary/10 blur-2xl transition group-hover:bg-primary/20" aria-hidden />
            </Link>
          ))}
        </div>
      </section>

      {/* Coupon strip */}
      <section className="mx-auto max-w-7xl px-4 pt-14">
        <SectionHeader title="Top Coupons & Offers" subtitle="Hand-picked codes that actually work" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { brand: "Zepto", off: "₹150 OFF", code: "ZEPNEW150", min: "Min. order ₹499", tone: "from-violet-500 to-fuchsia-500" },
            { brand: "Blinkit", off: "20% OFF", code: "BLINK20", min: "Up to ₹120 off", tone: "from-amber-500 to-orange-500" },
            { brand: "Instamart", off: "₹100 OFF", code: "INSTA100", min: "First 3 orders", tone: "from-emerald-500 to-teal-500" },
            { brand: "BigBasket", off: "15% OFF", code: "BBNEW15", min: "Min. order ₹999", tone: "from-rose-500 to-pink-500" },
            { brand: "Amazon Fresh", off: "₹200 OFF", code: "FRESH200", min: "Prime members", tone: "from-sky-500 to-blue-600" },
            { brand: "JioMart", off: "10% OFF", code: "JIO10", min: "All categories", tone: "from-indigo-500 to-purple-600" },
          ].map((c) => (
            <div
              key={c.code}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${c.tone}`} aria-hidden />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {c.brand}
                  </div>
                  <div className="mt-1 text-2xl font-extrabold text-foreground">{c.off}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{c.min}</div>
                </div>
                <Tag className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-dashed border-border bg-secondary/40 px-3 py-2">
                <code className="font-mono text-sm font-bold tracking-wider text-foreground">
                  {c.code}
                </code>
                <button
                  type="button"
                  className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground transition hover:opacity-90"
                >
                  Copy
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Best Discounts */}
      <section className="mx-auto max-w-7xl px-4 pt-14">
        <SectionHeader title="Best Discounts" subtitle="Minimum off across every app" />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {DISCOUNT_TIERS.map((t) => (
            <Link
              key={t}
              to="/search"
              className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-rose-50 via-card to-amber-50 p-5 text-center transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-lg hover:shadow-rose-200/50"
            >
              <div className="text-xs font-semibold uppercase tracking-widest text-rose-700/70">
                Min.
              </div>
              <div className="mt-1 text-3xl font-extrabold text-rose-700 tabular-nums md:text-4xl">
                {t}%
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-rose-700/70">
                off
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Shop by Categories — image-tag tiles */}
      <section className="mx-auto max-w-7xl px-4 pt-14">
        <SectionHeader title="Shop by Categories" subtitle="Cheapest pick across every quick-commerce app" />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c, i) => {
            const Icon = c.icon;
            const priceTags = ["Under ₹49", "Under ₹99", "Under ₹199", "Under ₹299", "Under ₹499", "Under ₹999"];
            return (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-secondary p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {priceTags[i % priceTags.length]}
                </div>
                <div className="mt-1 text-sm font-bold leading-tight text-foreground group-hover:text-primary">
                  {c.name}
                </div>
                <div className="mt-6 flex justify-end">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card shadow-sm ring-1 ring-border">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trending products */}
      <section className="mx-auto max-w-7xl px-4 pt-14">
        <div className="flex items-end justify-between gap-4">
          <SectionHeader title="Biggest savings today" subtitle="Widest price gap between apps right now." />
          <Link to="/search" className="hidden text-sm font-medium text-primary hover:underline sm:inline-flex">
            View more <ChevronRight className="ml-0.5 inline h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {trending.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Link
            to="/search"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:opacity-90"
          >
            View more <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Apps marquee */}
      <section className="mx-auto max-w-7xl px-4 pt-14">
        <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl">
          Apps we compare
        </h2>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Six of India&apos;s biggest quick-commerce and grocery delivery apps.
        </p>
      </section>
      <LogoMarquee />

      {/* Apps we compare — detail grid */}
      <section className="mx-auto max-w-7xl px-4 pt-14">
        <div className="mt-4 font-semibold text-zinc-950">
          <div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Apps we compare</h2>
            <p className="mt-1 text-sm text-muted-foreground">Live across India&apos;s biggest quick-commerce networks.</p>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {platforms.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-sm font-semibold">{p.name}</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">~{p.avgEtaMin} min delivery</div>
              <div className="text-xs text-muted-foreground">Free above ₹{p.freeDeliveryAbove}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mt-14 border-t border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">How it works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { icon: Search, title: "Search any product", body: "Tata Salt, Amul Milk, Maggi — find what you need across 6 apps in one place." },
              { icon: ShoppingBasket, title: "Compare your basket", body: "Add multiple items and see which app gives you the cheapest total, delivery included." },
              { icon: Bell, title: "Set price-drop alerts", body: "Save big on bulk staples by getting notified the moment prices dip." },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
      <div className="mx-auto mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
        <Sparkles className="h-3 w-3" />
        {subtitle}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Users;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-card/70 p-5 text-center backdrop-blur-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-3 text-2xl font-extrabold">{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function ExtensionCard({
  icon: Icon,
  title,
  cta,
}: {
  icon: typeof Chrome;
  title: string;
  cta: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-card/70 p-5 text-center backdrop-blur-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-3 text-sm font-semibold">{title}</div>
      <button
        type="button"
        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md transition hover:opacity-90"
      >
        {cta} <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}
