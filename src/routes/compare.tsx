import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, Plus, Minus, Trophy } from "lucide-react";
import { useBasket } from "@/lib/local-storage-hooks";
import { getProduct } from "@/data/products";
import { basketTotals } from "@/lib/compare";
import { getPlatform } from "@/data/platforms";
import { Button } from "@/components/ui/button";
import { PlatformChip } from "@/components/PlatformChip";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Basket compare — find the cheapest app | QuickCompare India" },
      { name: "description", content: "Add items to your basket and see which quick-commerce app gives the cheapest total." },
      { property: "og:title", content: "Basket compare — QuickCompare India" },
      { property: "og:description", content: "Find the cheapest app for your entire grocery basket." },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const [basket, setBasket] = useBasket();
  const totals = basketTotals(basket, getProduct);
  const eligible = totals.filter((t) => t.subtotal > 0).sort((a, b) => a.total - b.total);
  const winner = eligible[0];

  const changeQty = (id: string, delta: number) => {
    setBasket(basket.flatMap((b) => {
      if (b.productId !== id) return [b];
      const q = b.qty + delta;
      return q <= 0 ? [] : [{ ...b, qty: q }];
    }));
  };
  const remove = (id: string) => setBasket(basket.filter((b) => b.productId !== id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Basket compare</h1>
      <p className="mt-1 text-sm text-muted-foreground">See which app gives you the cheapest total for your entire basket — delivery included.</p>

      {basket.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">Your basket is empty.</p>
          <Link to="/search" className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">Browse products</Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {basket.map((b) => {
              const p = getProduct(b.productId);
              if (!p) return null;
              return (
                <div key={b.productId} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-secondary/60 text-3xl">{p.image}</div>
                  <div className="flex-1">
                    <Link to="/product/$id" params={{ id: p.id }} className="font-semibold hover:text-primary">{p.name}</Link>
                    <div className="text-xs text-muted-foreground">{p.brand} · {p.prices[0]?.packSize}</div>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg border border-border px-1">
                    <Button variant="ghost" size="icon" onClick={() => changeQty(b.productId, -1)}><Minus className="h-4 w-4" /></Button>
                    <span className="w-6 text-center text-sm font-semibold">{b.qty}</span>
                    <Button variant="ghost" size="icon" onClick={() => changeQty(b.productId, +1)}><Plus className="h-4 w-4" /></Button>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(b.productId)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                </div>
              );
            })}
          </div>

          <aside className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Totals by platform</h2>
            {[...totals].sort((a, b) => a.total - b.total).map((t) => {
              const pl = getPlatform(t.platformId)!;
              const isWinner = winner && t.platformId === winner.platformId;
              return (
                <div key={t.platformId} className={`rounded-2xl border p-4 ${isWinner ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                  <div className="flex items-center justify-between">
                    <PlatformChip platformId={t.platformId} />
                    {isWinner && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        <Trophy className="h-3 w-3" /> Cheapest
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <div className="text-2xl font-bold tabular-nums">₹{t.total}</div>
                      <div className="text-[11px] text-muted-foreground">
                        ₹{t.subtotal} + ₹{t.deliveryFee} delivery
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-muted-foreground">
                      <div>{t.available} item{t.available !== 1 && "s"} available</div>
                      {t.unavailable > 0 && <div className="text-destructive">{t.unavailable} missing</div>}
                      <div>~{pl.avgEtaMin} min</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </aside>
        </div>
      )}
    </div>
  );
}