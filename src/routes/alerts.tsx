import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Trash2, Check, AlertCircle } from "lucide-react";
import { useAlerts } from "@/lib/local-storage-hooks";
import { getProduct } from "@/data/products";
import { cheapestPrice } from "@/lib/compare";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Price drop alerts — QuickCompare India" },
      { name: "description", content: "Get notified when grocery prices drop on Zepto, Blinkit, Instamart and more." },
      { property: "og:title", content: "Price alerts — QuickCompare India" },
      { property: "og:description", content: "Track price drops on India's quick-commerce apps." },
    ],
  }),
  component: AlertsPage,
});

function AlertsPage() {
  const [alerts, setAlerts] = useAlerts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Bell className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My price alerts</h1>
          <p className="text-sm text-muted-foreground">Stored on this device. Sign in (coming soon) to sync across devices.</p>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">No alerts yet. Open any product page and tap "Set alert".</p>
          <Link to="/search" className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">Browse products</Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {alerts.map((a) => {
            const p = getProduct(a.productId);
            if (!p) return null;
            const low = cheapestPrice(p);
            const hit = low && low.price <= a.targetPrice;
            return (
              <div key={a.productId} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/60 text-2xl">{p.image}</div>
                <div className="flex-1">
                  <Link to="/product/$id" params={{ id: p.id }} className="font-semibold hover:text-primary">{p.name}</Link>
                  <div className="text-xs text-muted-foreground">Target: ₹{a.targetPrice} · Now: ₹{low?.price ?? "—"}</div>
                </div>
                <div>
                  {hit ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
                      <Check className="h-3 w-3" /> Target hit
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      <AlertCircle className="h-3 w-3" /> Watching
                    </span>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => setAlerts(alerts.filter((x) => x.productId !== a.productId))}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}