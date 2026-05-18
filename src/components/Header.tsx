import { Link } from "@tanstack/react-router";
import { Search, Bell, ShoppingBasket, Zap } from "lucide-react";
import { PincodeBar } from "./PincodeBar";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Zap className="h-5 w-5" fill="currentColor" />
          </span>
          <div className="leading-tight">
            <div className="text-base font-bold tracking-tight">QuickCompare</div>
            <div className="text-[10px] text-muted-foreground -mt-0.5">India · quick commerce</div>
          </div>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          <Link to="/search" className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground" activeProps={{ className: "rounded-md px-3 py-2 text-sm bg-secondary text-foreground" }}>Search</Link>
          <Link to="/compare" className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground" activeProps={{ className: "rounded-md px-3 py-2 text-sm bg-secondary text-foreground" }}>Basket compare</Link>
          <Link to="/deals" className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground" activeProps={{ className: "rounded-md px-3 py-2 text-sm bg-secondary text-foreground" }}>Deals</Link>
          <Link to="/methodology" className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground" activeProps={{ className: "rounded-md px-3 py-2 text-sm bg-secondary text-foreground" }}>Methodology</Link>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <PincodeBar />
          <Link to="/search" className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground md:hidden" aria-label="Search">
            <Search className="h-4 w-4" />
          </Link>
          <Link to="/alerts" className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Alerts">
            <Bell className="h-4 w-4" />
          </Link>
          <Link to="/compare" className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Basket">
            <ShoppingBasket className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}