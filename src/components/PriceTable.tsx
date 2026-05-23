import { Clock, ExternalLink } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import type { Product } from "@/data/products";
import { cheapestPrice, discountPercent, unitPriceLabel } from "@/lib/compare";
import { PlatformChip } from "./PlatformChip";
import { buildRedirectHref } from "@/lib/affiliate";
import { attributeClick } from "@/lib/click-events.functions";

export function PriceTable({ product }: { product: Product }) {
  const sourcePath = useRouterState({ select: (s) => s.location.pathname });
  const attribute = useServerFn(attributeClick);
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
              <OpenButton
                platformId={entry.platformId}
                productId={product.id}
                slug={product.name}
                sourcePath={sourcePath}
                price={entry.price}
                mrp={entry.mrp}
                onAttribute={(cid) =>
                  attribute({
                    data: {
                      correlationId: cid,
                      eventType: "affiliate_click",
                      platformId: entry.platformId,
                      productId: product.id,
                      sourcePath,
                    },
                  }).catch(() => {})
                }
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OpenButton({
  platformId,
  productId,
  slug,
  sourcePath,
  price,
  mrp,
  onAttribute,
}: {
  platformId: string;
  productId: string;
  slug: string;
  sourcePath: string;
  price: number;
  mrp: number;
  onAttribute: (correlationId: string) => void;
}) {
  // Generate a correlation id per click so the (anonymous) redirect row
  // and the (authenticated) attribution call can be joined server-side.
  const handleClick = () => {
    const cid =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    onAttribute(cid);
    const href = buildRedirectHref(platformId, productId, {
      slug,
      sourcePath,
      correlationId: cid,
      price,
      mrp,
    });
    window.open(href, "_blank", "noopener,noreferrer");
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:border-primary hover:text-primary"
    >
      Open <ExternalLink className="h-3 w-3" />
    </button>
  );
}