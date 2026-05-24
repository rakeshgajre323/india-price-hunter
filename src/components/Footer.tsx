import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="flex min-h-screen flex-col text-slate-100 bg-black">
        <div>
          <div className="text-base font-bold">QuickCompare</div>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Compare prices across India's quick-commerce apps before you tap "order".
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Browse</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/search" className="hover:text-foreground">All products</Link></li>
            <li><Link to="/compare" className="hover:text-foreground">Basket compare</Link></li>
            <li><Link to="/deals" className="hover:text-foreground">Today's deals</Link></li>
            <li><Link to="/alerts" className="hover:text-foreground">Price alerts</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">About</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About us</Link></li>
            <li><Link to="/methodology" className="hover:text-foreground">Methodology</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Disclaimer</h4>
          <p className="mt-3 text-xs text-muted-foreground">
            Prices shown are indicative for demo purposes and may not reflect current platform pricing in your area.
            QuickCompare is not affiliated with any listed app.
          </p>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} QuickCompare India
      </div>
    </footer>
  );
}