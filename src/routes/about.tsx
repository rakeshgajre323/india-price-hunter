import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About QuickCompare India" },
      { name: "description", content: "QuickCompare is an independent price comparison site for India's quick-commerce apps." },
      { property: "og:title", content: "About QuickCompare India" },
      { property: "og:description", content: "Independent quick-commerce price tracker for India." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight">About QuickCompare</h1>
      <p className="mt-4 text-base text-muted-foreground">
        QuickCompare is an independent price comparison product for India's quick-commerce ecosystem.
        We aggregate listings across Zepto, Blinkit, Swiggy Instamart, Amazon Fresh, Flipkart Minutes and BB Now
        so shoppers can avoid overpaying on 10-minute deliveries.
      </p>

      <h2 className="mt-10 text-xl font-semibold">What we do</h2>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        <li>• Show the cheapest app for any product, in your pincode.</li>
        <li>• Compute the cheapest total across your entire basket, delivery included.</li>
        <li>• Track 30-day price history per app so you know if "deals" are really deals.</li>
        <li>• Let you set price-drop alerts on items you buy regularly.</li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold">Independence</h2>
      <p className="mt-3 text-sm text-muted-foreground">
        We are not owned by, affiliated with, or paid by any of the listed apps. When you tap "Open in app",
        we may earn an affiliate commission — this never changes the ranking or which platform wins a comparison.
      </p>

      <h2 className="mt-10 text-xl font-semibold">Demo notice</h2>
      <p className="mt-3 text-sm text-muted-foreground">
        Prices shown in this preview are realistic seed data and do not reflect live platform pricing.
        See <a href="/methodology" className="text-primary hover:underline">Methodology</a> for how live ingestion will work.
      </p>
    </div>
  );
}