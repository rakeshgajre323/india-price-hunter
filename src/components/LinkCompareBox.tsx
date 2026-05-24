import { useEffect, useState } from "react";
import { Link as LinkIcon, ExternalLink, Sparkles, Trophy, Timer, AlertCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { platforms, buildDeepLink, getPlatform } from "@/data/platforms";
import { parseProductLink, type ParsedProductLink } from "@/lib/parse-product-link";
import { matchProduct, effectivePrices, bestValue, fastestDelivery, type MatchResult, type EffectivePrice } from "@/lib/match-product";
import { formatQuantity } from "@/lib/normalize-product";
import { PlatformChip } from "@/components/PlatformChip";

type Props = {
  /** Optional initial URL — used when the homepage forwards a pasted link via ?url=. */
  initialUrl?: string;
  autoRun?: boolean;
};

export function LinkCompareBox({ initialUrl = "", autoRun = false }: Props) {
  const [value, setValue] = useState(initialUrl);
  const [parsed, setParsed] = useState<ParsedProductLink | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = (raw?: string) => {
    const result = parseProductLink(raw ?? value);
    if (!result) {
      setError("That doesn't look like a supported product link. Try one from Zepto, Blinkit, Instamart, BigBasket / BB Now, Flipkart Minutes, or Amazon Fresh.");
      setParsed(null);
      return;
    }
    setError(null);
    setParsed(result);
  };

  useEffect(() => {
    if (autoRun && initialUrl) handleCompare(initialUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRun, initialUrl]);

  const matches: MatchResult[] = parsed ? matchProduct(parsed, 1) : [];
  const primary = matches[0];

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        <LinkIcon className="h-4 w-4" /> Paste a product link
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Drop a product URL from Blinkit, Zepto, Instamart, BigBasket / BB Now, Flipkart Minutes, or Amazon Fresh — we'll match it to the same product on every other app and rank by the real final price (item + delivery + platform fee + handling).
      </p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleCompare(); }}
          placeholder="https://www.zeptonow.com/pn/amul-gold-milk/pvid/…"
          className="flex-1"
        />
        <Button onClick={() => handleCompare()} className="sm:w-auto">
          <Sparkles className="mr-1 h-4 w-4" /> Compare
        </Button>
      </div>
      {error && (
        <div className="mt-2 flex items-start gap-1.5 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
        </div>
      )}

      {parsed && <ParsedResult parsed={parsed} primary={primary} />}
    </div>
  );
}

function ParsedResult({ parsed, primary }: { parsed: ParsedProductLink; primary: MatchResult | undefined }) {
  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>Detected:</span>
        {parsed.platform && <PlatformChip platformId={parsed.platform} size="sm" />}
        <span className="font-semibold text-foreground">"{parsed.title}"</span>
        {parsed.canonicalHints.quantity && (
          <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px]">
            {formatQuantity(parsed.canonicalHints.quantity)}
          </span>
        )}
        {parsed.canonicalHints.brand && (
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px]">brand: {parsed.canonicalHints.brand}</span>
        )}
        {parsed.productId && (
          <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px]">id: {parsed.productId.slice(0, 12)}</span>
        )}
      </div>

      {primary ? <MatchedCompareTable parsed={parsed} match={primary} /> : <NoMatchDeepLinks parsed={parsed} />}
    </div>
  );
}

function MatchedCompareTable({ parsed, match }: { parsed: ParsedProductLink; match: MatchResult }) {
  const rows = effectivePrices(match.product).sort((a, b) => a.effectiveTotal - b.effectiveTotal);
  const best = bestValue(rows);
  const fastest = fastestDelivery(rows);

  const tierLabel: Record<MatchResult["tier"], string> = {
    exact: "Exact match",
    "same-quantity": "Same quantity",
    "same-pack": "Same pack size",
    "same-brand": "Same brand",
    fuzzy: "Closest match",
  };

  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link to="/product/$id" params={{ id: match.product.id }} className="flex items-center gap-3 hover:text-primary">
          <span className="text-2xl">{match.product.image}</span>
          <div>
            <div className="text-sm font-semibold">{match.product.name}</div>
            <div className="text-[11px] text-muted-foreground">{match.product.brand} · {match.product.prices[0]?.packSize}</div>
          </div>
        </Link>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
          {tierLabel[match.tier]}
        </span>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-y-1 text-xs">
          <thead className="text-[10px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-2 py-1 text-left">Platform</th>
              <th className="px-2 py-1 text-right">Price</th>
              <th className="px-2 py-1 text-right">Delivery</th>
              <th className="px-2 py-1 text-right">Platform fee</th>
              <th className="px-2 py-1 text-right">Handling</th>
              <th className="px-2 py-1 text-right">ETA</th>
              <th className="px-2 py-1 text-right">Final</th>
              <th className="px-2 py-1" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <CompareRow
                key={r.platformId}
                row={r}
                isBestValue={best?.platformId === r.platformId}
                isFastest={fastest?.platformId === r.platformId}
                isSource={parsed.platform === r.platformId}
                searchQuery={parsed.title}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CompareRow({
  row, isBestValue, isFastest, isSource, searchQuery,
}: {
  row: EffectivePrice;
  isBestValue: boolean;
  isFastest: boolean;
  isSource: boolean;
  searchQuery: string;
}) {
  const pl = getPlatform(row.platformId)!;
  const link = buildDeepLink(row.platformId, searchQuery.replace(/\s+/g, "-"), "");
  return (
    <tr className={`bg-card ${isBestValue ? "ring-2 ring-primary/40" : ""}`}>
      <td className="rounded-l-lg px-2 py-2">
        <div className="flex items-center gap-2">
          <PlatformChip platformId={row.platformId} size="sm" />
          {isSource && <span className="text-[9px] text-muted-foreground">(your link)</span>}
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {isBestValue && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-semibold text-primary-foreground">
              <Trophy className="h-2.5 w-2.5" /> Best value
            </span>
          )}
          {isFastest && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-500">
              <Timer className="h-2.5 w-2.5" /> Fastest
            </span>
          )}
        </div>
      </td>
      {row.inStock ? (
        <>
          <td className="px-2 py-2 text-right font-semibold tabular-nums">₹{row.price}</td>
          <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{row.deliveryFee ? `₹${row.deliveryFee}` : "Free"}</td>
          <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{row.platformFee ? `₹${row.platformFee}` : "—"}</td>
          <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{row.handlingFee ? `₹${row.handlingFee}` : "—"}</td>
          <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">~{row.etaMin}m</td>
          <td className="px-2 py-2 text-right font-bold tabular-nums">₹{row.effectiveTotal}</td>
        </>
      ) : (
        <td colSpan={6} className="px-2 py-2 text-right text-muted-foreground">Out of stock on {pl.shortName}</td>
      )}
      <td className="rounded-r-lg px-2 py-2 text-right">
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] font-semibold hover:border-primary hover:text-primary"
        >
          Open <ExternalLink className="h-3 w-3" />
        </a>
      </td>
    </tr>
  );
}

function NoMatchDeepLinks({ parsed }: { parsed: ParsedProductLink }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-background p-3">
      <div className="text-xs text-muted-foreground">
        We don't have this exact product in our catalog yet — opening the same search on every supported app so you can compare manually:
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {platforms.map((pl) => {
          const url = buildDeepLink(pl.id, parsed.title.replace(/\s+/g, "-"), "");
          return (
            <a
              key={pl.id}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center justify-between gap-2 rounded-lg border p-2 text-xs transition hover:border-primary ${parsed.platform === pl.id ? "border-primary/60 bg-primary/5" : "border-border bg-card"}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <PlatformChip platformId={pl.id} size="sm" />
                <span className="truncate text-muted-foreground">~{pl.avgEtaMin}m · ₹{pl.deliveryFee} delivery · ₹{pl.platformFee} fee</span>
              </div>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
            </a>
          );
        })}
      </div>
    </div>
  );
}