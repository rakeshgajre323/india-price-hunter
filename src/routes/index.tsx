import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Search, Bell, ShoppingBasket, Zap } from "lucide-react";
import { categories } from "@/data/categories";
import { platforms } from "@/data/platforms";
import { products } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { savingsPercent } from "@/lib/compare";

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

function Index() {
  const trending = [...products]
    .map((p) => ({ p, s: savingsPercent(p) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 8)
    .map((x) => x.p);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/8 via-background to-accent/10">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Zap className="h-3.5 w-3.5" fill="currentColor" />
              Quick-commerce price tracker for India
            </div>
            <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">
              Don't overpay on <span className="text-primary">10-minute</span> deliveries.
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground md:text-lg">
              QuickCompare checks Zepto, Blinkit, Instamart, Amazon Fresh, Flipkart Minutes and BB Now side by side so you can order from whichever app is cheapest right now.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/search" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
                <Search className="h-4 w-4" /> Search a product
              </Link>
              <Link to="/compare" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold hover:border-primary hover:text-primary">
                <ShoppingBasket className="h-4 w-4" /> Compare a basket
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span>6 platforms</span>
              <span>·</span>
              <span>{products.length}+ tracked SKUs</span>
              <span>·</span>
              <span>Pincode-aware</span>
              <span>·</span>
              <span>Price drop alerts</span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-xl shadow-primary/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Trending compare</div>
                  <div className="font-semibold">Amul Gold Milk · 1 L</div>
                </div>
                <span className="rounded-full bg-accent/20 px-2.5 py-1 text-xs font-semibold text-accent-foreground">Save 9%</span>
              </div>
              <div className="mt-4 space-y-2">
                {platforms.slice(0, 5).map((p, i) => {
                  const price = 65 + i * 2 + (i === 0 ? -2 : 0);
                  const cheapest = i === 0;
                  return (
                    <div key={p.id} className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${cheapest ? "border-primary/40 bg-primary/5" : "border-border"}`}>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="font-medium">{p.shortName}</span>
                        {cheapest && <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">Cheapest</span>}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold tabular-nums">₹{price}</div>
                        <div className="text-[10px] text-muted-foreground">{p.avgEtaMin} min</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Shop by category</h2>
            <p className="mt-1 text-sm text-muted-foreground">Compare prices across every quick-commerce app in seconds.</p>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} className="group rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-3 text-sm font-semibold group-hover:text-primary">{c.name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{c.description}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trending */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Biggest savings today</h2>
            <p className="mt-1 text-sm text-muted-foreground">Products with the widest price gap between platforms.</p>
          </div>
          <Link to="/search" className="text-sm font-medium text-primary hover:underline">View all <ArrowRight className="ml-0.5 inline h-3.5 w-3.5" /></Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {trending.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Platforms */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Apps we compare</h2>
        <p className="mt-1 text-sm text-muted-foreground">Six of India's biggest quick-commerce and grocery delivery apps.</p>
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
      <section className="border-t border-border bg-secondary/30">
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
