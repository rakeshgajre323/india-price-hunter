import { createFileRoute } from "@tanstack/react-router";
import { Tag } from "lucide-react";
import { products } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { cheapestPrice, discountPercent } from "@/lib/compare";

export const Route = createFileRoute("/deals")({
  head: () => ({
    meta: [
      { title: "Today's deals — QuickCompare India" },
      { name: "description", content: "Biggest discounts across Zepto, Blinkit, Instamart, Amazon Fresh and more, right now." },
      { property: "og:title", content: "Today's deals — QuickCompare India" },
      { property: "og:description", content: "Live quick-commerce discounts across India." },
    ],
  }),
  component: DealsPage,
});

function DealsPage() {
  const deals = [...products]
    .map((p) => ({ p, low: cheapestPrice(p) }))
    .filter((x) => x.low && discountPercent(x.low) > 0)
    .sort((a, b) => discountPercent(b.low!) - discountPercent(a.low!));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent-foreground">
          <Tag className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Today's deals</h1>
          <p className="text-sm text-muted-foreground">{deals.length} products discounted right now.</p>
        </div>
      </div>

      {/* Sponsored slot */}
      <div className="mt-8 rounded-2xl border border-dashed border-border bg-secondary/30 p-4 text-center text-xs text-muted-foreground">
        Sponsored deal slot · partner with QuickCompare to feature your offers here
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {deals.map(({ p }) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}