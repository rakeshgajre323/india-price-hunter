import { useState } from "react";
import { Link as LinkIcon, ExternalLink, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { platforms, buildDeepLink, getPlatform } from "@/data/platforms";
import { parseProductLink, findCatalogMatches, type ParsedLink } from "@/lib/parse-product-link";
import { PlatformChip } from "@/components/PlatformChip";

export function LinkCompareBox() {
  const [value, setValue] = useState("");
  const [parsed, setParsed] = useState<ParsedLink | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = () => {
    const result = parseProductLink(value);
    if (!result) {
      setError("Couldn't read that link. Paste a product URL from Zepto, Blinkit, Instamart, Flipkart Minutes, BB Now or Amazon Fresh.");
      setParsed(null);
      return;
    }
    setError(null);
    setParsed(result);
  };

  const matches = parsed ? findCatalogMatches(parsed.query) : [];

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        <LinkIcon className="h-4 w-4" /> Compare from a product link
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Paste any product link from Zepto, Blinkit, Instamart, Flipkart Minutes, BB Now or Amazon Fresh — we'll open the same product on every other app for a side-by-side price check.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleCompare(); }}
          placeholder="https://www.zeptonow.com/pn/amul-gold-milk/..."
          className="flex-1"
        />
        <Button onClick={handleCompare} className="sm:w-auto">
          <Sparkles className="mr-1 h-4 w-4" /> Compare
        </Button>
      </div>
      {error && <div className="mt-2 text-xs text-destructive">{error}</div>}

      {parsed && (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-border bg-background p-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>Detected:</span>
              {parsed.platformId && <PlatformChip platformId={parsed.platformId} size="sm" />}
              <span className="font-semibold text-foreground">"{parsed.query}"</span>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {platforms.map((pl) => {
                const isSource = pl.id === parsed.platformId;
                const url = buildDeepLink(pl.id, parsed.query.replace(/\s+/g, "-"), "");
                return (
                  <a
                    key={pl.id}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group flex items-center justify-between gap-2 rounded-lg border p-2 text-xs transition hover:border-primary ${isSource ? "border-primary/60 bg-primary/5" : "border-border bg-card"}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <PlatformChip platformId={pl.id} size="sm" />
                      <span className="truncate text-muted-foreground">~{pl.avgEtaMin} min · ₹{pl.deliveryFee} delivery</span>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
                  </a>
                );
              })}
            </div>
          </div>

          {matches.length > 0 && (
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Matched in our catalog</div>
              <div className="mt-2 space-y-2">
                {matches.map((p) => {
                  const sorted = [...p.prices].filter((pr) => pr.inStock).sort((a, b) => a.price - b.price);
                  const cheapest = sorted[0];
                  const cheapestPl = cheapest ? getPlatform(cheapest.platformId) : null;
                  return (
                    <Link
                      key={p.id}
                      to="/product/$id"
                      params={{ id: p.id }}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border p-2 text-sm hover:border-primary"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-2xl">{p.image}</span>
                        <div className="min-w-0">
                          <div className="truncate font-semibold">{p.name}</div>
                          <div className="truncate text-xs text-muted-foreground">{p.brand} · {p.prices[0]?.packSize}</div>
                        </div>
                      </div>
                      {cheapest && cheapestPl && (
                        <div className="text-right">
                          <div className="font-bold tabular-nums">₹{cheapest.price}</div>
                          <div className="text-[10px] text-muted-foreground">on {cheapestPl.shortName}</div>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}