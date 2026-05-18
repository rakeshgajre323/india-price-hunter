import { Link } from "@tanstack/react-router";
import type { Product } from "@/data/products";
import { cheapestPrice, savingsPercent, discountPercent } from "@/lib/compare";
import { PlatformChip } from "./PlatformChip";

export function ProductCard({ product }: { product: Product }) {
  const low = cheapestPrice(product);
  const savings = savingsPercent(product);
  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className="group flex flex-col rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex h-28 items-center justify-center rounded-xl bg-secondary/60 text-5xl">
        <span>{product.image}</span>
      </div>
      <div className="mt-3 flex-1">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{product.brand}</div>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">{product.name}</h3>
        <div className="mt-1 text-xs text-muted-foreground">{low?.packSize}</div>
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          <div className="text-[10px] text-muted-foreground">Cheapest at</div>
          {low ? <PlatformChip platformId={low.platformId} size="sm" /> : <span className="text-xs text-muted-foreground">Unavailable</span>}
        </div>
        <div className="text-right">
          {low ? (
            <>
              <div className="text-base font-bold tabular-nums">₹{low.price}</div>
              {discountPercent(low) > 0 && (
                <div className="text-[10px] text-muted-foreground line-through tabular-nums">₹{low.mrp}</div>
              )}
            </>
          ) : null}
        </div>
      </div>
      {savings > 5 && (
        <div className="mt-2 rounded-md bg-accent/15 px-2 py-1 text-[11px] font-medium text-accent-foreground">
          Save up to {savings}% by choosing the right app
        </div>
      )}
    </Link>
  );
}