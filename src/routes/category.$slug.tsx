import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getCategory, categories } from "@/data/categories";
import { productsByCategory } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const cat = getCategory(params.slug);
    if (!cat) throw notFound();
    return { cat };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.cat.name} — Compare prices on QuickCompare India` },
          { name: "description", content: `${loaderData.cat.description}. Compare across Zepto, Blinkit, Instamart and more.` },
          { property: "og:title", content: `${loaderData.cat.name} — QuickCompare India` },
          { property: "og:description", content: loaderData.cat.description },
        ]
      : [],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { cat } = Route.useLoaderData();
  const items = productsByCategory(slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="text-xs text-muted-foreground">
        <Link to="/" className="hover:underline">Home</Link> · <span>Categories</span>
      </div>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">{cat.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{cat.description} · {items.length} products tracked</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((c) => (
          <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} className={`rounded-full border px-3 py-1 text-xs ${c.slug === slug ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}>
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}