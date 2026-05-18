import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import type { Product } from "@/data/products";
import { platforms } from "@/data/platforms";

export function PriceHistoryChart({ product }: { product: Product }) {
  const data = product.history.map((row) => ({
    date: row.date.slice(5),
    ...row.prices,
  }));

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">30-day price trend</h3>
          <p className="text-xs text-muted-foreground">Lower is better. Hover to inspect daily prices.</p>
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} interval={4} />
            <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} width={48} />
            <Tooltip
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
            {platforms.map((p) => (
              <Line
                key={p.id}
                type="monotone"
                dataKey={p.id}
                name={p.shortName}
                stroke={p.color}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}