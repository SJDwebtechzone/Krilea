import { useState, useRef, useEffect, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  ShieldCheck,
  ChevronDown,
  User,
  Package,
  KeyRound,
  LogOut,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { navItems } from "@/data/krilea";
import { BrandMark } from "@/components/BrandMark";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { api } from "@/lib/api";

function IconButton({
  label,
  children,
  onClick,
  className = "",
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      onClick={onClick}
      className={`text-cream hover:bg-cream/10 hover:text-champagne relative ${className}`}
    >
      {children}
    </Button>
  );
}

export function AnnouncementBar() {
  return (
    <div className="hidden bg-emerald-deep px-5 py-2 text-[10px] font-medium uppercase tracking-[0.16em] text-champagne-soft sm:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-5">
          <span>Free shipping on orders above ₹999</span>
          <span className="text-champagne/40">|</span>
          <span>Secure payments</span>
          <span className="text-champagne/40">|</span>
          <span>Easy returns</span>
        </div>
        <div className="flex items-center gap-5">
          <Link to="/account" className="hover:text-champagne transition-colors">Track order</Link>
          <Link to="/contact" className="hover:text-champagne transition-colors">Help</Link>
          <Link to="/account" className="hover:text-champagne transition-colors flex items-center gap-1">♡ Wishlist</Link>
        </div>
      </div>
    </div>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const fixedNavItems = navItems.filter((item) => item.to !== "/silver-collection" && item.to !== "/fashion-collection");
  const navLinks = [
    ...fixedNavItems.slice(0, -1),
    ...collections.map((collection) => ({ label: collection.name, to: `/collections/${collection.slug}` })),
    ...fixedNavItems.slice(-1),
  ];

  useEffect(() => {
    let cancelled = false;
    api.get<any[]>("/collections")
      .then((data) => { if (!cancelled) setCollections(data || []); })
      .catch((error) => console.error("Failed loading navigation collections:", error));
    return () => { cancelled = true; };
  }, []);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setUserMenuOpen(false);
    setOpen(false);
    logout();
    navigate({ to: "/" });
  };

  const displayName = user?.firstName || user?.username || "Account";

  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-40 border-b border-champagne/35 bg-emerald-deep/95 text-cream backdrop-blur-md">
        <div className="mx-auto flex min-h-[84px] max-w-7xl items-center justify-between gap-4 px-5 py-2 lg:px-8">
          <BrandMark />

          {/* Desktop Navigation Links */}
          <nav className="hidden min-w-0 items-center justify-center gap-6 lg:flex xl:gap-8">
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to as any}
                className={`relative whitespace-nowrap text-sm sm:text-[15px] font-medium tracking-wide transition-colors hover:text-champagne ${
                  location.pathname === item.to
                    ? "text-champagne font-semibold after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:bg-champagne"
                    : "text-cream/90"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Action Icons & Auth State */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <IconButton label="Search" onClick={() => setSearchOpen((value) => !value)}>
              <Search className="h-5 w-5" />
            </IconButton>

            {/* Hide Customer Cart & Wishlist icons for Admin users */}
            {!isAdmin && (
              <>
                <IconButton label="Wishlist" onClick={() => navigate({ to: isAuthenticated ? "/account" : "/login" })}>
                  <Heart className="h-5 w-5" />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-champagne text-[10px] font-bold text-emerald-deep">
                      {wishlistItems.length}
                    </span>
                  )}
                </IconButton>

                <IconButton label="Shopping bag" onClick={() => navigate({ to: "/cart" })}>
                  <ShoppingBag className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-champagne text-[10px] font-bold text-emerald-deep">
                      {totalItems}
                    </span>
                  )}
                </IconButton>
              </>
            )}

            {/* Authentication Button / User Profile Dropdown */}
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-champagne/50 bg-champagne/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-champagne hover:bg-champagne hover:text-emerald-deep transition-all shadow-sm"
              >
                <UserRound className="h-3.5 w-3.5" />
                <span>Login</span>
              </Link>
            ) : (
              <div className="relative hidden sm:block" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-champagne/40 bg-emerald-950/60 px-3.5 py-1.5 text-xs font-medium text-cream hover:border-champagne hover:text-champagne transition-all shadow-sm"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-champagne/20 text-[10px] font-bold text-champagne">
                    {isAdmin ? <ShieldCheck className="h-3.5 w-3.5" /> : displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate font-semibold tracking-wide">
                    {displayName}
                  </span>
                  <ChevronDown className={`h-3 w-3 text-champagne transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl border border-champagne/30 bg-[#0b241e] p-2 text-cream shadow-2xl backdrop-blur-xl z-50 animate-in fade-in-50 zoom-in-95">
                    {isAdmin ? (
                      <div className="space-y-1 text-xs">
                        <div className="px-3 py-2 border-b border-champagne/15 mb-1">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-champagne">
                            Admin Portal
                          </p>
                          <p className="text-xs font-semibold text-cream truncate">
                            {displayName}
                          </p>
                          <p className="text-[11px] text-cream/70 truncate">
                            {user?.email}
                          </p>
                        </div>

                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-champagne hover:bg-champagne/15 transition-colors font-semibold"
                        >
                          <ShieldCheck className="h-4 w-4" /> Admin Portal
                        </Link>

                        <div className="border-t border-champagne/15 my-1" />

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-red-300 hover:bg-red-950/40 hover:text-red-200 transition-colors font-medium"
                        >
                          <LogOut className="h-4 w-4" /> Logout
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-0.5 text-xs">
                        <div className="px-3 py-2 border-b border-champagne/15 mb-1">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-champagne">
                            Kriléa Member
                          </p>
                          <p className="text-xs font-medium text-cream/80 truncate">
                            {user?.email}
                          </p>
                        </div>

                        <Link
                          to="/account"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-cream/90 hover:bg-cream/10 hover:text-champagne transition-colors"
                        >
                          <User className="h-4 w-4 text-champagne/70" /> My Profile
                        </Link>
                        <Link
                          to="/account"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-cream/90 hover:bg-cream/10 hover:text-champagne transition-colors"
                        >
                          <Package className="h-4 w-4 text-champagne/70" /> My Orders
                        </Link>
                        <Link
                          to="/account"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-cream/90 hover:bg-cream/10 hover:text-champagne transition-colors"
                        >
                          <Heart className="h-4 w-4 text-champagne/70" /> Wishlist ({wishlistItems.length})
                        </Link>
                        <Link
                          to="/cart"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-cream/90 hover:bg-cream/10 hover:text-champagne transition-colors"
                        >
                          <ShoppingBag className="h-4 w-4 text-champagne/70" /> Cart ({totalItems})
                        </Link>

                        <Link
                          to="/account"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-cream/90 hover:bg-cream/10 hover:text-champagne transition-colors"
                        >
                          <KeyRound className="h-4 w-4 text-champagne/70" /> Change Password
                        </Link>

                        <div className="border-t border-champagne/15 my-1" />

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-red-300 hover:bg-red-950/40 hover:text-red-200 transition-colors"
                        >
                          <LogOut className="h-4 w-4" /> Logout
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <Button
              variant="ghost"
              size="icon"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((value) => !value)}
              className="text-cream hover:bg-cream/10 hover:text-champagne lg:hidden"
            >
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Search Drawer */}
        {searchOpen && (
          <div className="border-t border-champagne/25 bg-emerald-deep px-5 py-4">
            <div className="mx-auto flex max-w-2xl items-center gap-3 border-b border-champagne/50 pb-2">
              <Search className="h-4 w-4 text-champagne" />
              <input
                autoFocus
                className="w-full bg-transparent text-sm text-cream outline-none placeholder:text-cream/45"
                placeholder="Search necklaces, rings, earrings..."
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                className="text-cream hover:text-champagne"
              >
                <X />
              </Button>
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {open && (
          <nav className="border-t border-champagne/25 bg-emerald-deep px-5 py-4 lg:hidden">
            <div className="grid gap-1">
              {navLinks.map((item) => (
                <Link
                  onClick={() => setOpen(false)}
                  key={item.to}
                  to={item.to as any}
                  className="border-b border-cream/10 py-3 text-base font-medium text-cream/90 hover:text-champagne"
                >
                  {item.label}
                </Link>
              ))}

              <div className="pt-4 flex flex-col gap-2">
                {!isAuthenticated ? (
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 w-full bg-champagne text-emerald-deep py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wider"
                  >
                    <UserRound className="h-4 w-4" /> Login / Register
                  </Link>
                ) : (
                  <>
                    <div className="p-3 bg-emerald-950 rounded-lg border border-champagne/30 text-xs text-champagne flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-semibold text-cream">{displayName}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-champagne">
                        {user?.role}
                      </span>
                    </div>

                    {isAdmin ? (
                      <Link
                        to="/admin"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 py-2 text-sm text-champagne font-medium"
                      >
                        <ShieldCheck className="h-4 w-4" /> Admin Dashboard
                      </Link>
                    ) : (
                      <Link
                        to="/account"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 py-2 text-sm text-cream/90 hover:text-champagne"
                      >
                        <User className="h-4 w-4 text-champagne" /> My Profile & Orders
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-2 py-2 text-sm text-red-300 hover:text-red-200"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
