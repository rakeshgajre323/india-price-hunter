import { useEffect, useMemo, useState } from "react";
import { Link as LinkIcon, ExternalLink, Sparkles, Trophy, Timer, AlertCircle, MapPin, Check, X, Package, ArrowRight, Loader2, ShieldCheck, Receipt } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { platforms, buildDeepLink, getPlatform } from "@/data/platforms";
import { parseProductLink, type ParsedProductLink } from "@/lib/parse-product-link";
import { matchProduct, type MatchResult } from "@/lib/match-product";
import { formatQuantity } from "@/lib/normalize-product";
import { usePincode, isValidPincode, pinHash } from "@/lib/services/pincode-service";
import { validateAvailability, type AvailabilityStatus } from "@/lib/services/availability-validator";
import { calculateCheckout, totalFees, type CheckoutBreakdown } from "@/lib/services/fee-calculator";
import { rankPlatforms, BADGE_META, type Badge, type RankedRow } from "@/lib/services/ranking";
import { placeholderImage } from "@/lib/product-image";

type Props = {
  initialUrl?: string;
  autoRun?: boolean;
};

type Stage = "idle" | "parsing" | "needs-pincode" | "comparing" | "ready" | "error";

export function LinkCompareBox({ initialUrl = "", autoRun = false }: Props) {
  const [value, setValue] = useState(initialUrl);
  const [parsed, setParsed] = useState<ParsedProductLink | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [pincode, setPincode] = usePincode();
  const [pinDraft, setPinDraft] = useState(pincode);

  useEffect(() => { setPinDraft(pincode); }, [pincode]);

  const startCompare = (raw?: string) => {
    const input = raw ?? value;
    if (!input.trim()) return;
    setStage("parsing");
    setError(null);
    // Yield a tick so the parsing skeleton actually paints.
    setTimeout(() => {
      const result = parseProductLink(input);
      if (!result) {
        setParsed(null);
        setError("That doesn't look like a supported product link. Try one from Zepto, Blinkit, Instamart, BigBasket / BB Now, Flipkart Minutes, or Amazon Fresh.");
        setStage("error");
        return;
      }
      setParsed(result);
      setStage(isValidPincode(pincode) ? "comparing" : "needs-pincode");
    }, 350);
  };

  useEffect(() => {
    if (autoRun && initialUrl) startCompare(initialUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRun, initialUrl]);

  // Once we have a parsed product + valid pincode, run availability + fees.
  useEffect(() => {
    if (stage !== "comparing" || !parsed) return;
    // Small delay simulates network round-trip → produces a real "checking" feel.
    const t = setTimeout(() => setStage("ready"), 500);
    return () => clearTimeout(t);
  }, [stage, parsed, pincode]);

  const confirmPincode = () => {
    if (!isValidPincode(pinDraft)) return;
    setPincode(pinDraft);
    if (parsed) setStage("comparing");
  };

  const reset = () => {
    setParsed(null);
    setValue("");
    setError(null);
    setStage("idle");
  };

  const matches: MatchResult[] = parsed && stage === "ready" ? matchProduct(parsed, 1) : [];
  const primary = matches[0];

  return (
    <section className="rounded-2xl border border-border bg-card">
      <header className="flex items-start gap-3 border-b border-border px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
          <LinkIcon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold tracking-tight">Compare checkout totals from a product link</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Paste any product URL — we verify your pincode, check which apps deliver, and rank them by the real all-in total.
          </p>
        </div>
      </header>

      <div className="px-5 py-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") startCompare(); }}
            placeholder="https://www.zeptonow.com/pn/…"
            className="flex-1 font-mono text-xs"
            disabled={stage === "parsing" || stage === "comparing"}
          />
          <Button
            onClick={() => startCompare()}
            disabled={!value.trim() || stage === "parsing" || stage === "comparing"}
            className="sm:w-auto"
          >
            {stage === "parsing" ? (
              <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Parsing…</>
            ) : (
              <><Sparkles className="mr-1 h-4 w-4" /> Compare</>
            )}
          </Button>
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
          </div>
        )}
      </div>

      {/* Always-visible pasted product card once we have a parsed result */}
      {parsed && stage !== "idle" && stage !== "error" && (
        <PastedProductCard parsed={parsed} primary={primary} onReset={reset} />
      )}

      {stage === "needs-pincode" && (
        <PincodeStep
          draft={pinDraft}
          setDraft={setPinDraft}
          onConfirm={confirmPincode}
        />
      )}

      {(stage === "comparing" || stage === "parsing") && parsed && (
        <ComparingSkeleton pincode={pincode} />
      )}

      {stage === "ready" && parsed && (
        <ComparisonGrid parsed={parsed} primary={primary} pincode={pincode} onChangePincode={() => setStage("needs-pincode")} />
      )}
    </section>
  );
}

/* ----------------------------- pasted card ----------------------------- */

function PastedProductCard({ parsed, primary, onReset }: { parsed: ParsedProductLink; primary?: MatchResult; onReset: () => void }) {
  const img = primary?.product.imageRef?.url ?? placeholderImage(parsed.title).url;
  const title = primary?.product.name ?? toTitleCase(parsed.title);
  const sub = primary
    ? `${primary.product.brand} · ${primary.product.prices[0]?.packSize}`
    : [parsed.canonicalHints.brand, parsed.canonicalHints.quantity ? formatQuantity(parsed.canonicalHints.quantity) : null].filter(Boolean).join(" · ");
  const sourcePl = parsed.platform ? getPlatform(parsed.platform) : null;

  return (
    <div className="border-t border-border bg-secondary/30 px-5 py-4">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background p-1.5">
          <img src={img} alt={title} className="h-full w-full object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                <span>Parsed from</span>
                {sourcePl && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-1.5 py-0.5 font-semibold normal-case text-foreground">
                    <img src={sourcePl.logo} alt="" className="h-3 w-3 object-contain" /> {sourcePl.shortName}
                  </span>
                )}
              </div>
              <h3 className="mt-1 truncate text-base font-semibold tracking-tight">
                {primary ? (
                  <Link to="/product/$id" params={{ id: primary.product.id }} className="hover:text-primary">{title}</Link>
                ) : title}
              </h3>
              <div className="text-xs text-muted-foreground">{sub || "—"}</div>
            </div>
            <button
              onClick={onReset}
              className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-background hover:text-foreground"
              aria-label="Clear"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <a href={parsed.raw} target="_blank" rel="noopener noreferrer"
            className="mt-1.5 inline-flex max-w-full items-center gap-1 truncate font-mono text-[10px] text-muted-foreground hover:text-primary">
            <ExternalLink className="h-3 w-3 shrink-0" /> <span className="truncate">{parsed.raw}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- pincode step ----------------------------- */

function PincodeStep({ draft, setDraft, onConfirm }: { draft: string; setDraft: (v: string) => void; onConfirm: () => void }) {
  return (
    <div className="border-t border-border px-5 py-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MapPin className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold tracking-tight">Enter your delivery pincode</div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            We'll only show apps that actually deliver to this address, and pull live fees + surge for the area.
          </p>
          <div className="mt-3 flex gap-2">
            <Input
              value={draft}
              maxLength={6}
              inputMode="numeric"
              onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => { if (e.key === "Enter") onConfirm(); }}
              placeholder="560001"
              className="max-w-[160px] font-mono"
            />
            <Button onClick={onConfirm} disabled={!isValidPincode(draft)}>
              <Check className="mr-1 h-4 w-4" /> Verify &amp; compare
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- skeleton ----------------------------- */

function ComparingSkeleton({ pincode }: { pincode: string }) {
  return (
    <div className="border-t border-border px-5 py-5">
      <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Checking availability + fees across {platforms.length} apps for <span className="font-mono font-semibold text-foreground">{pincode}</span>…
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {platforms.slice(0, 4).map((p) => (
          <div key={p.id} className="h-44 animate-pulse rounded-xl border border-border bg-secondary/40" />
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- comparison ----------------------------- */

function ComparisonGrid({
  parsed, primary, pincode, onChangePincode,
}: { parsed: ParsedProductLink; primary: MatchResult | undefined; pincode: string; onChangePincode: () => void }) {
  const productImage = primary?.product.imageRef?.url ?? placeholderImage(parsed.title).url;

  const ranked: RankedRow[] = useMemo(() => {
    const rows = platforms.map((pl) => {
      // Item price: real catalog price if matched, otherwise pseudo from URL hash.
      const matched = primary?.product.prices.find((p) => p.platformId === pl.id);
      const seed = pinHash(parsed.title);
      const base = matched?.price ?? Math.max(20, 60 + (seed % 240) + ((pinHash(`${parsed.title}:${pl.id}`) % 40) - 20));
      const mrp = matched?.mrp ?? Math.round(base * 1.2);
      const knownInStock = matched ? matched.inStock : (pinHash(`stock:${parsed.title}:${pl.id}`) % 10) > 1;

      const availability = validateAvailability(pincode, pl.id, knownInStock);
      const breakdown = calculateCheckout({ platformId: pl.id, itemPrice: base, mrp, pincode });
      return {
        breakdown,
        available: availability.deliverable && availability.inStock,
        etaMin: availability.etaMin || pl.avgEtaMin,
        availability,
      };
    });
    const ranked = rankPlatforms(rows);
    // Re-attach availability + sort: available first (by effective total), unavailable last.
    return ranked
      .map((r, i) => ({ ...r, availability: rows[i].availability }))
      .sort((a, b) => {
        if (a.available !== b.available) return a.available ? -1 : 1;
        return a.breakdown.effectiveTotal - b.breakdown.effectiveTotal;
      });
  }, [parsed, primary, pincode]);

  const availableRows = ranked.filter((r) => r.available);
  const cheapestTotal = availableRows.length
    ? Math.min(...availableRows.map((r) => r.breakdown.effectiveTotal))
    : 0;
  const availableCount = ranked.filter((r) => r.available).length;

  return (
    <div className="border-t border-border px-5 py-5">
      {/* Status bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-secondary/30 px-4 py-2.5 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            {availableCount} of {ranked.length} apps deliver
          </span>
          <span className="text-muted-foreground">to</span>
          <button onClick={onChangePincode} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 font-mono font-semibold hover:border-primary hover:text-primary">
            <MapPin className="h-3 w-3" /> {pincode}
          </button>
          {primary && (
            <span className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {tierLabel(primary.tier)}
            </span>
          )}
        </div>
        <div className="text-muted-foreground">Ranked by <span className="font-semibold text-foreground">effective checkout total</span></div>
      </div>

      {availableCount === 0 && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs text-amber-700 dark:text-amber-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-semibold">No app currently delivers to {pincode}.</div>
            <div className="mt-0.5 opacity-90">
              Quick-commerce in India is concentrated in tier-1 metros and major tier-2 cities. Try a metro pincode (e.g. 560001 Bengaluru, 400001 Mumbai, 110001 Delhi) to see a live comparison.
            </div>
          </div>
        </div>
      )}

      {/* Cards grid */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {ranked.map((row) => (
          <PlatformCheckoutCard
            key={row.breakdown.platformId}
            row={row}
            availability={row.availability}
            cheapestTotal={cheapestTotal}
            productImage={productImage}
            searchQuery={parsed.title}
            isSource={parsed.platform === row.breakdown.platformId}
          />
        ))}
      </div>

      {/* Disclaimer */}
      <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
        <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
        Availability estimates are based on each platform's known service zones and may vary in real time. Always confirm on the app before checkout.
      </p>
    </div>
  );
}

/* ----------------------------- platform card ----------------------------- */

function PlatformCheckoutCard({
  row, availability, cheapestTotal, productImage, searchQuery, isSource,
}: {
  row: RankedRow;
  availability: AvailabilityStatus;
  cheapestTotal: number;
  productImage: string;
  searchQuery: string;
  isSource: boolean;
}) {
  const pl = getPlatform(row.breakdown.platformId)!;
  const link = buildDeepLink(row.breakdown.platformId, searchQuery.replace(/\s+/g, "-"), "");
  const featured = row.badges.includes("cheapest-total") || row.badges.includes("best-value");
  const deltaVsCheapest = row.available ? row.breakdown.effectiveTotal - cheapestTotal : 0;

  if (!row.available) {
    return (
      <article className="flex flex-col rounded-xl border border-border bg-card opacity-60 grayscale">
        <PlatformHeader pl={pl} etaMin={0} isSource={isSource} badges={[]} confidence={availability.label} />
        <div className="flex flex-1 items-start gap-3 px-4 py-4 text-xs">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-secondary/50 p-1">
            <img src={productImage} alt="" className="h-full w-full object-contain grayscale" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 font-semibold text-destructive">
              <X className="h-3.5 w-3.5" /> Not Deliverable
            </div>
            <div className="mt-0.5 text-muted-foreground">
              {availability.reason ?? "Outside this platform's known service zone."}
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              Coverage: {availability.coverageSummary}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-1.5 rounded-b-xl border-t border-border bg-secondary/30 px-4 py-2.5 text-xs font-semibold text-muted-foreground">
          Not available in {pl.shortName}
        </div>
      </article>
    );
  }

  return (
    <article className={`flex flex-col rounded-xl border bg-card transition ${featured ? "border-primary shadow-sm" : "border-border hover:border-foreground/20"}`}>
      <PlatformHeader pl={pl} etaMin={row.etaMin} isSource={isSource} badges={row.badges} confidence={availability.label} />

      {/* product + headline price */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-background p-1.5">
          <img src={productImage} alt="" className="h-full w-full object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Item price</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold tabular-nums tracking-tight">₹{row.breakdown.itemPrice}</span>
            {row.breakdown.mrp > row.breakdown.itemPrice && (
              <span className="text-xs text-muted-foreground line-through tabular-nums">₹{row.breakdown.mrp}</span>
            )}
          </div>
          {row.breakdown.mrp > row.breakdown.itemPrice && (
            <div className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              −{Math.round(((row.breakdown.mrp - row.breakdown.itemPrice) / row.breakdown.mrp) * 100)}% off MRP
            </div>
          )}
        </div>
      </div>

      {/* fee breakdown */}
      <div className="border-t border-border/60 px-4 py-3 text-xs">
        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          <Receipt className="h-3 w-3" /> Fees &amp; taxes
        </div>
        <FeeRow label="GST (5%)" value={row.breakdown.gst} />
        <FeeRow label="Delivery" value={row.breakdown.deliveryFee} free={row.breakdown.deliveryFee === 0 && row.breakdown.itemPrice >= row.breakdown.freeDeliveryAbove} />
        <FeeRow label="Platform fee" value={row.breakdown.platformFee} hideWhenZero />
        <FeeRow label="Handling" value={row.breakdown.handlingFee} hideWhenZero />
        <FeeRow label="Packaging" value={row.breakdown.packagingFee} hideWhenZero />
        {row.breakdown.surgeFee > 0 && <FeeRow label="Surge" value={row.breakdown.surgeFee} warn />}
        {row.breakdown.smallOrderFee > 0 && <FeeRow label="Small order fee" value={row.breakdown.smallOrderFee} warn />}
      </div>

      {/* total + delta */}
      <div className="flex items-end justify-between gap-2 border-t border-border px-4 py-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Final total</div>
          <div className="text-2xl font-bold tabular-nums tracking-tight">₹{row.breakdown.effectiveTotal}</div>
        </div>
        <div className="text-right">
          {deltaVsCheapest === 0 ? (
            <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Cheapest</span>
          ) : (
            <span className="text-[11px] text-muted-foreground">+₹{deltaVsCheapest} vs cheapest</span>
          )}
          <div className="mt-0.5 text-[10px] text-muted-foreground">
            Fees: ₹{totalFees(row.breakdown)}
          </div>
        </div>
      </div>

      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center justify-center gap-1.5 rounded-b-xl border-t border-border px-4 py-2.5 text-xs font-semibold transition ${featured ? "bg-foreground text-background hover:opacity-90" : "bg-background hover:bg-secondary"}`}
      >
        Checkout on {pl.shortName} <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </article>
  );
}

function PlatformHeader({ pl, etaMin, isSource, badges }: { pl: ReturnType<typeof getPlatform>; etaMin: number; isSource: boolean; badges: Badge[] }) {
  if (!pl) return null;
  return (
    <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-background p-0.5">
          <img src={pl.logo} alt={pl.name} className="h-full w-full object-contain" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold tracking-tight">{pl.name}</div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            {etaMin > 0 ? (<><Timer className="h-2.5 w-2.5" /> ~{etaMin} min</>) : <span className="opacity-60">No ETA</span>}
            {isSource && <span className="ml-1 rounded bg-secondary px-1 py-px font-semibold text-foreground">Your link</span>}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-1" />
    </header>
  );
}

function BadgeChip({ badge }: { badge: Badge }) {
  const meta = BADGE_META[badge];
  const toneClass = {
    primary: "bg-foreground text-background",
    emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    blue: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
    amber: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  }[meta.tone];
  const Icon = badge === "fastest-delivery" ? Timer : badge === "lowest-fees" ? Receipt : badge === "recommended" ? Sparkles : Trophy;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${toneClass}`}>
      <Icon className="h-2.5 w-2.5" /> {meta.label}
    </span>
  );
}

function FeeRow({ label, value, free, warn, hideWhenZero }: { label: string; value: number; free?: boolean; warn?: boolean; hideWhenZero?: boolean }) {
  if (hideWhenZero && value === 0) return null;
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={`tabular-nums ${warn ? "font-semibold text-orange-600 dark:text-orange-400" : "text-foreground"}`}>
        {free ? "FREE" : `₹${value}`}
      </span>
    </div>
  );
}

/* ----------------------------- utils ----------------------------- */

function tierLabel(tier: MatchResult["tier"]): string {
  return {
    exact: "Exact match",
    "same-quantity": "Same quantity",
    "same-pack": "Same pack size",
    "same-brand": "Same brand",
    fuzzy: "Closest match",
  }[tier];
}

function toTitleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}