import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "Methodology — QuickCompare India" },
      { name: "description", content: "How QuickCompare sources, refreshes and normalises quick-commerce price data." },
      { property: "og:title", content: "Methodology — QuickCompare India" },
      { property: "og:description", content: "How we collect and compare quick-commerce prices in India." },
    ],
  }),
  component: Methodology,
});

function Methodology() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight">Methodology</h1>
      <p className="mt-4 text-base text-muted-foreground">
        Transparency on where our data comes from and how often it refreshes.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Data sources</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>• <span className="font-medium text-foreground">Affiliate feeds</span> via Cuelinks, EarnKaro and Admitad where the platform exposes a product feed.</li>
          <li>• <span className="font-medium text-foreground">Public catalog pages</span> sampled via Apify/Bright Data — only for pricing intelligence, with attribution.</li>
          <li>• <span className="font-medium text-foreground">Direct partnerships</span> where platforms make pricing APIs available for comparison sites.</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Refresh frequency</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Top SKUs refresh every 15–30 minutes per major metro. Long-tail SKUs refresh every 2–6 hours.
          Every price card shows a "last updated X min ago" stamp so you can judge freshness.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Pincode awareness</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Quick-commerce inventories and prices vary by dark-store coverage. Prices and availability you see are scoped to your pincode.
          If a platform doesn't serve your pincode, it's hidden from the compare table.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Product matching</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          We match SKUs across platforms using brand, name, pack size and barcode where available. A small percentage of
          listings are not 1:1 (e.g. Amul Gold 1L vs Amul Taaza 1L). When pack sizes differ we show per-kg and per-litre unit prices so you can compare fairly.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Demo data notice</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          This MVP runs on curated seed data so the experience is fully usable without live integrations.
          Real ingestion adapters are stubbed and plug into the same UI without code changes.
        </p>
      </section>
    </div>
  );
}