import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { api } from "@/lib/api";
import {
  IndianRupee,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Admin Dashboard | Kriléa Management" }],
  }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    setLoading(true);
    try {
      const data = await api.get("/admin/dashboard");
      setStats(data);
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-deep" />
      </div>
    );
  }

  const kpi = stats?.kpi || {};
  const chartData = stats?.salesChart || [];
  const recentOrders = stats?.recentOrders || [];
  const lowStockAlerts = stats?.lowStockAlerts || [];
  const topProducts = stats?.topProducts || [];

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-champagne/30 pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#8a7147] font-semibold">
            Boutique Overview
          </span>
          <h1 className="text-3xl font-serif text-emerald-deep mt-1">Management Dashboard</h1>
        </div>
        <div className="text-xs text-neutral-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-champagne/30 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-deep">
            ₹{(kpi.totalRevenue || 0).toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> From completed online & delivered orders
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-2xl border border-champagne/30 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-[#fbf6ed] text-[#8a7147] flex items-center justify-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-deep">
            {kpi.totalOrders || 0}
          </div>
          <p className="text-[11px] text-neutral-500">
            {kpi.pendingOrders || 0} pending • {kpi.deliveredOrders || 0} delivered
          </p>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-6 rounded-2xl border border-champagne/30 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Registered Clients</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-deep">
            {kpi.totalCustomers || 0}
          </div>
          <p className="text-[11px] text-neutral-500">
            Kriléa Privé verified accounts
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-2xl border border-champagne/30 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Stock Health</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-deep">
            {kpi.totalProducts || 0} <span className="text-sm font-normal text-neutral-500">Products</span>
          </div>
          <p className="text-[11px] text-amber-700 font-medium">
            {kpi.lowStockCount || 0} items low in stock • {kpi.outOfStockCount || 0} out of stock
          </p>
        </div>
      </div>

      {/* Revenue Graph */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-champagne/30 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-serif text-emerald-deep">30-Day Revenue Performance</h3>
            <p className="text-xs text-neutral-500">Daily sales trajectory (INR)</p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0c3328" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0c3328" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0eee6" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#a3a3a3" />
              <YAxis tick={{ fontSize: 11 }} stroke="#a3a3a3" />
              <Tooltip
                formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0c3328"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2-Column Grid: Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-champagne/30 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-champagne/20 pb-3">
            <h3 className="text-lg font-serif text-emerald-deep">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs text-emerald-deep font-semibold hover:underline">
              View All Orders →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 text-neutral-500 font-semibold uppercase">
                <tr>
                  <th className="py-2.5">Order #</th>
                  <th className="py-2.5">Customer</th>
                  <th className="py-2.5">Amount</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentOrders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3 font-semibold text-emerald-deep">{ord.order_number}</td>
                    <td className="py-3">
                      <div className="font-medium text-neutral-800">{ord.customer_name}</div>
                      <div className="text-[10px] text-neutral-400">{ord.customer_email}</div>
                    </td>
                    <td className="py-3 font-semibold text-neutral-900">
                      ₹{parseFloat(ord.total_amount).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                          ord.order_status === "delivered"
                            ? "bg-emerald-100 text-emerald-800"
                            : ord.order_status === "shipped"
                            ? "bg-blue-100 text-blue-800"
                            : ord.order_status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {ord.order_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products & Low Stock */}
        <div className="lg:col-span-5 space-y-6">
          {/* Top Selling Products */}
          <div className="bg-white p-6 rounded-2xl border border-champagne/30 shadow-sm space-y-4">
            <h3 className="text-lg font-serif text-emerald-deep border-b border-champagne/20 pb-3">
              Top Selling Pieces
            </h3>
            <div className="space-y-3">
              {topProducts.map((prod: any) => (
                <div key={prod.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={prod.primary_image || "/home/products/emerald-charm-necklace.jpg"}
                      alt=""
                      className="w-10 h-10 rounded object-cover border border-neutral-200"
                    />
                    <div>
                      <h4 className="font-serif font-medium text-emerald-deep">{prod.name}</h4>
                      <p className="text-neutral-400">{prod.total_sold} units sold</p>
                    </div>
                  </div>
                  <span className="font-semibold text-neutral-800">
                    ₹{parseFloat(prod.price).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alerts */}
          {lowStockAlerts.length > 0 && (
            <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs uppercase tracking-wider">
                <AlertTriangle className="h-4 w-4 text-amber-600" /> Low Stock Alerts
              </div>
              <div className="divide-y divide-amber-200/50 space-y-2">
                {lowStockAlerts.map((prod: any) => (
                  <div key={prod.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-medium text-neutral-800 block">{prod.name}</span>
                      <span className="text-[10px] text-neutral-500">SKU: {prod.sku}</span>
                    </div>
                    <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                      {prod.quantity} Left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
