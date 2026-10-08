import { useState, useEffect } from "react";
import { createFileRoute, Outlet, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Layers,
  Sparkles,
  ShoppingBag,
  Users,
  MessageSquare,
  FileText,
  Mail,
  Settings,
  LogOut,
  ChevronRight,
  ExternalLink,
  Menu,
  X,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Portal | Kriléa Management" }],
  }),
  component: AdminLayout,
});

const adminNavItems = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Products", to: "/admin/products", icon: Package },
  { label: "Categories", to: "/admin/categories", icon: Layers },
  { label: "Collections", to: "/admin/collections", icon: Sparkles },
  { label: "Orders", to: "/admin/orders", icon: ShoppingBag },
  { label: "Customers", to: "/admin/customers", icon: Users },
  { label: "Reviews", to: "/admin/reviews", icon: MessageSquare },
  { label: "Invoices", to: "/admin/invoices", icon: FileText },
  { label: "Enquiries", to: "/admin/enquiries", icon: Mail },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

function AdminLayout() {
  const { user, isAuthenticated, isAdmin, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, isAdmin, isLoading]);

  if (isLoading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-deep" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5ee] flex flex-col md:flex-row font-sans text-neutral-800">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-emerald-deep px-4 py-3 text-cream flex items-center justify-between border-b border-champagne/30 sticky top-0 z-50">
        <BrandMark compact />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-cream hover:bg-emerald-900"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-emerald-deep text-cream transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-0 flex flex-col justify-between border-r border-champagne/20 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <BrandMark />
          </div>
          <div className="px-3 py-2 bg-emerald-950/60 rounded-xl border border-champagne/25 text-xs text-champagne-soft">
            <span className="text-[10px] uppercase font-bold tracking-wider text-champagne block">
              Staff Portal
            </span>
            <span className="font-semibold text-cream truncate block">{user.firstName} {user.lastName}</span>
          </div>

          {/* Nav list */}
          <nav className="space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.to === "/admin"
                  ? location.pathname === "/admin"
                  : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all ${
                    isActive
                      ? "bg-champagne text-emerald-deep font-bold shadow-md"
                      : "text-cream/80 hover:bg-emerald-900/60 hover:text-champagne"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className="h-3 w-3 ml-auto text-emerald-deep" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-champagne/20 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-champagne-soft hover:bg-emerald-900/60 hover:text-champagne transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View Live Storefront
          </Link>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-300 hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
