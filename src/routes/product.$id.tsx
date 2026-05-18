import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Plus, Minus, Check } from "lucide-react";
import { getProduct, products } from "@/data/products";
import { getCategory } from "@/data/categories";
import { cheapestPrice, savingsPercent } from "@/lib/compare";
import { PriceTable } from "@/components/PriceTable";
import { PriceHistoryChart } from "@/components/PriceHistoryChart";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAlerts, useBasket } from "@/lib/local-storage-hooks";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    const p = loaderData.product;
    const low = cheapestPrice(p);
    const title = `${p.name} (${low?.packSize}) — Best price ₹${low?.price ?? "—"} | QuickCompare`;
    const desc = `Compare ${p.name} prices across Zepto, Blinkit, Instamart and more. ${savingsPercent(p)}% savings available.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const cat = getCategory(product.categorySlug);
  const low = cheapestPrice(product);
  const savings = savingsPercent(product);

  const [alerts, setAlerts] = useAlerts();
  const [basket, setBasket] = useBasket();
  const [target, setTarget] = useState(low ? Math.round(low.price * 0.9).toString() : "");

  const inBasket = basket.find((b) => b.productId === product.id);
  const hasAlert = alerts.some((a) => a.productId === product.id);

  const addAlert = () => {
    const t = parseFloat(target);
    if (!t) return;
    setAlerts([...alerts.filter((a) => a.productId !== product.id), { productId: product.id, targetPrice: t, createdAt: Date.now() }]);
    toast.success(`Alert set at ₹${t}`);
  };

  const addToBasket = () => {
    if (inBasket) {
      setBasket(basket.map((b) => b.productId === product.id ? { ...b, qty: b.qty + 1 } : b));
    } else {
      setBasket([...basket, { productId: product.id, qty: 1 }]);
    }
    toast.success("Added to basket");
  };

  const removeFromBasket = () => {
    if (!inBasket) return;
    if (inBasket.qty <= 1) setBasket(basket.filter((b) => b.productId !== product.id));
    else setBasket(basket.map((b) => b.productId === product.id ? { ...b, qty: b.qty - 1 } : b));
  };

  const related = products.filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="text-xs text-muted-foreground">
        <Link to="/" className="hover:underline">Home</Link>
        {" · "}
        {cat && <Link to="/category/$slug" params={{ slug: cat.slug }} className="hover:underline">{cat.name}</Link>}
      </div>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_1.5fr]">
        {/* Left: image + actions */}
        <div>
          <div className="flex h-72 items-center justify-center rounded-3xl border border-border bg-card text-9xl">
            {product.image}
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold">Add to basket compare</h3>
            <p className="mt-1 text-xs text-muted-foreground">Build a list and see which app gives the cheapest total.</p>
            <div className="mt-3 flex items-center gap-2">
              {inBasket ? (
                <div className="flex flex-1 items-center justify-between rounded-lg border border-border px-3 py-2">
                  <Button variant="ghost" size="icon" onClick={removeFromBasket}><Minus className="h-4 w-4" /></Button>
                  <span className="text-sm font-semibold">{inBasket.qty} in basket</span>
                  <Button variant="ghost" size="icon" onClick={addToBasket}><Plus className="h-4 w-4" /></Button>
                </div>
              ) : (
                <Button onClick={addToBasket} className="flex-1"><Plus className="mr-1 h-4 w-4" />Add to basket</Button>
              )}
              <Link to="/compare" className="rounded-md border border-border px-3 py-2 text-sm hover:border-primary hover:text-primary">View basket</Link>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Price-drop alert</h3>
              {hasAlert && <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-primary"><Check className="h-3 w-3" /> Active</span>}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Notify me when any platform drops below:</p>
            <div className="mt-3 flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                <Input value={target} onChange={(e) => setTarget(e.target.value.replace(/\D/g, ""))} className="pl-7" inputMode="numeric" />
              </div>
              <Button onClick={addAlert} variant="secondary">Set alert</Button>
            </div>
          </div>
        </div>

        {/* Right: info + table + chart */}
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{product.brand}</div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>

          <div className="mt-4 flex flex-wrap items-end gap-4">
            {low && (
              <div>
                <div className="text-xs text-muted-foreground">Best price right now</div>
                <div className="text-4xl font-bold tabular-nums">₹{low.price}</div>
                <div className="text-xs text-muted-foreground">{low.packSize}</div>
              </div>
            )}
            {savings > 0 && (
              <div className="rounded-xl bg-accent/15 px-3 py-2 text-xs font-medium text-accent-foreground">
                Save up to <span className="font-bold">{savings}%</span> vs highest-priced app
              </div>
            )}
          </div>

          <div className="mt-6">
            <h2 className="mb-3 text-lg font-semibold">Live price compare</h2>
            <PriceTable product={product} />
            <p className="mt-2 text-[11px] text-muted-foreground">Prices indicative for demo purposes. Refreshed every 15–30 minutes in production.</p>
          </div>

          <div className="mt-8">
            <PriceHistoryChart product={product} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="text-xl font-bold tracking-tight">More from {cat?.name}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}