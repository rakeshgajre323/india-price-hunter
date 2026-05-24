import { Link } from "@tanstack/react-router";
import { Search, Bell, ShoppingBasket, ShoppingCart, User } from "lucide-react";
import { PincodeBar } from "./PincodeBar";

export function Header() {
  return (
    <header className="sticky top-3 z-40 px-3 sm:px-4">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 rounded-full border border-white/40 bg-white/30 px-3 pr-2 shadow-[0_10px_40px_-12px_rgba(15,23,42,0.18)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/25 dark:border-white/10 dark:bg-white/5 sm:px-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground bg-emerald-700 border-2 border-double">
            <ShoppingCart className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <div className="text-base font-bold tracking-tight">QuickCompare</div>
            <div className="text-[10px] text-muted-foreground -mt-0.5">India · quick commerce</div>
          </div>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
            <Link to="/search" className="rounded-full px-3 py-1.5 text-sm text-foreground/70 hover:bg-white/40 hover:text-foreground" activeProps={{ className: "rounded-full px-3 py-1.5 text-sm bg-white/50 text-foreground" }}>Search</Link>
            <Link to="/compare" className="rounded-full px-3 py-1.5 text-sm text-foreground/70 hover:bg-white/40 hover:text-foreground" activeProps={{ className: "rounded-full px-3 py-1.5 text-sm bg-white/50 text-foreground" }}>Basket compare</Link>
            <Link to="/deals" className="rounded-full px-3 py-1.5 text-sm text-foreground/70 hover:bg-white/40 hover:text-foreground" activeProps={{ className: "rounded-full px-3 py-1.5 text-sm bg-white/50 text-foreground" }}>Deals</Link>
            <Link to="/methodology" className="rounded-full px-3 py-1.5 text-sm text-foreground/70 hover:bg-white/40 hover:text-foreground" activeProps={{ className: "rounded-full px-3 py-1.5 text-sm bg-white/50 text-foreground" }}>Methodology</Link>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <PincodeBar />
            <Link to="/search" className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-white/40 hover:text-foreground md:hidden" aria-label="Search">
            <Search className="h-4 w-4" />
          </Link>
            <Link to="/alerts" className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-white/40 hover:text-foreground" aria-label="Alerts">
            <Bell className="h-4 w-4" />
          </Link>
            <Link to="/compare" className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-white/40 hover:text-foreground" aria-label="Basket">
            <ShoppingBasket className="h-4 w-4" />
          </Link>
          <Link
            to="/login"
              className="ml-1 hidden items-center gap-1.5 rounded-full border border-white/50 bg-white/40 px-3 py-1.5 text-xs font-semibold backdrop-blur hover:border-primary hover:text-primary sm:inline-flex"
          >
            <User className="h-3.5 w-3.5" /> Log in
          </Link>
          <Link
            to="/signup"
              className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}