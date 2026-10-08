import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "@/lib/api";
import { Users, Search, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({
    meta: [{ title: "Customers Management | Kriléa Admin" }],
  }),
  component: AdminCustomersPage,
});

function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await api.get<{ customers: any[] }>(`/admin/customers?limit=50${search ? `&search=${search}` : ""}`);
      setCustomers(data.customers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6">
      <div className="border-b border-champagne/30 pb-6">
        <span className="text-xs uppercase tracking-[0.2em] text-[#8a7147] font-semibold">Clientele</span>
        <h1 className="text-3xl font-serif text-emerald-deep mt-1">Customers ({customers.length})</h1>
      </div>

      <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-champagne/30 shadow-sm max-w-sm">
        <Search className="h-4 w-4 text-neutral-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loadCustomers()}
          placeholder="Search by name, email or username..."
          className="w-full text-xs outline-none bg-transparent"
        />
      </div>

      <div className="bg-white rounded-2xl border border-champagne/30 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-deep" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fcfaf7] border-b border-champagne/20 text-neutral-600 uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Client Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Orders Count</th>
                  <th className="py-3.5 px-4">Lifetime Spend</th>
                  <th className="py-3.5 px-4">Registered On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 font-serif font-semibold text-emerald-deep text-sm">
                      {c.first_name} {c.last_name || ""}
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-600">{c.email}</td>
                    <td className="py-3 px-4 text-neutral-500">{c.phone || "—"}</td>
                    <td className="py-3 px-4 font-semibold">{c.total_orders} orders</td>
                    <td className="py-3 px-4 font-bold text-emerald-deep">
                      ₹{parseFloat(c.lifetime_spend || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-neutral-400">
                      {new Date(c.created_at).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
