import { Clock, ExternalLink } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import type { Product } from "@/data/products";
import { cheapestPrice, discountPercent, unitPriceLabel } from "@/lib/compare";
import { PlatformChip } from "./PlatformChip";
import { buildRedirectHref } from "@/lib/affiliate";

export function PriceTable({ product }: { product: Product }) {
  const sourcePath = useRouterState({ select: (s) => s.location.pathname });
  const low = cheapestPrice(product);
  const sorted = [...product.prices].sort((a, b) => Number(b.inStock) - Number(a.inStock) || a.price - b.price);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="grid grid-cols-12 gap-2 border-b border-border bg-secondary/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <div className="col-span-4">Platform</div>
        <div className="col-span-2 text-right">Price</div>
        <div className="col-span-2 hidden text-right md:block">Unit</div>
        <div className="col-span-2 text-right">ETA</div>
        <div className="col-span-2 text-right">Action</div>
      </div>
      {sorted.map((entry) => {
        const isLow = low && entry.platformId === low.platformId;
        return (
          <div
            key={entry.platformId}
            className={`grid grid-cols-12 items-center gap-2 border-b border-border px-4 py-3 last:border-0 ${
              isLow ? "bg-primary/5" : ""
            } ${!entry.inStock ? "opacity-60" : ""}`}
          >
            <div className="col-span-4 flex items-center gap-2">
              <PlatformChip platformId={entry.platformId} />
              {isLow && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  Cheapest
                </span>
              )}
              {!entry.inStock && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Out of stock
                </span>
              )}
            </div>
            <div className="col-span-2 text-right">
              <div className="font-semibold tabular-nums">₹{entry.price}</div>
              {discountPercent(entry) > 0 && (
                <div className="text-[10px] text-muted-foreground tabular-nums">
                  <span className="line-through">₹{entry.mrp}</span>{" "}
                  <span className="text-primary">−{discountPercent(entry)}%</span>
                </div>
              )}
            </div>
            <div className="col-span-2 hidden text-right text-xs text-muted-foreground tabular-nums md:block">
              {unitPriceLabel(entry)}
            </div>
            <div className="col-span-2 flex flex-col items-end text-xs">
              <span className="inline-flex items-center gap-1 font-medium">
                <Clock className="h-3 w-3" />
                {entry.etaMin} min
              </span>
              <span className="text-[10px] text-muted-foreground">{entry.lastUpdatedMin}m ago</span>
            </div>
            <div className="col-span-2 text-right">
              <a
                href={buildRedirectHref(entry.platformId, product.id, {
                  slug: product.name,
                  sourcePath,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:border-primary hover:text-primary"
              >
                Open <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}