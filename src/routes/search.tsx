import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { ProductCard } from "@/components/ProductCard";
import { cheapestPrice } from "@/lib/compare";

type Sort = "savings" | "price-asc" | "price-desc";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search products — QuickCompare India" },
      { name: "description", content: "Search across Zepto, Blinkit, Instamart, Amazon Fresh, Flipkart Minutes and BB Now." },
      { property: "og:title", content: "Search — QuickCompare India" },
      { property: "og:description", content: "Find the cheapest app for any product." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("savings");

  const filtered = useMemo(() => {
    let list = products;
    if (cat) list = list.filter((p) => p.categorySlug === cat);
    if (q.trim()) {
      const term = q.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term));
    }
    if (inStockOnly) list = list.filter((p) => p.prices.some((pr) => pr.inStock));
    list = [...list];
    if (sort === "price-asc") list.sort((a, b) => (cheapestPrice(a)?.price ?? 0) - (cheapestPrice(b)?.price ?? 0));
    if (sort === "price-desc") list.sort((a, b) => (cheapestPrice(b)?.price ?? 0) - (cheapestPrice(a)?.price ?? 0));
    return list;
  }, [q, cat, inStockOnly, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Search products</h1>
      <p className="mt-1 text-sm text-muted-foreground">{products.length} SKUs across 6 platforms.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-5">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search milk, atta, soap…" className="pl-9" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</h3>
            <div className="mt-2 space-y-1">
              <button onClick={() => setCat("")} className={`block w-full rounded-md px-2 py-1.5 text-left text-sm ${cat === "" ? "bg-primary/10 font-semibold text-primary" : "hover:bg-secondary"}`}>All categories</button>
              {categories.map((c) => (
                <button key={c.slug} onClick={() => setCat(c.slug)} className={`block w-full rounded-md px-2 py-1.5 text-left text-sm ${cat === c.slug ? "bg-primary/10 font-semibold text-primary" : "hover:bg-secondary"}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Filters</h3>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="h-4 w-4 rounded border-border" />
              In stock only
            </label>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sort</h3>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="mt-2 w-full rounded-md border border-border bg-card px-2 py-1.5 text-sm">
              <option value="savings">Biggest savings</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>
        </aside>

        <div>
          <div className="mb-3 text-sm text-muted-foreground">{filtered.length} results</div>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
              No products match. <Link to="/search" className="text-primary hover:underline">Reset</Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}