import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { api, API_BASE_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FileText, Download, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/invoices")({
  head: () => ({
    meta: [{ title: "Invoices Management | Kriléa Admin" }],
  }),
  component: AdminInvoicesPage,
});

function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = await api.get<{ invoices: any[] }>(`/admin/invoices?limit=50${search ? `&search=${search}` : ""}`);
      setInvoices(data.invoices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = (orderId: string, invoiceNumber: string) => {
    const token = localStorage.getItem("krilea_token");
    fetch(`${API_BASE_URL}/orders/${orderId}/invoice`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Invoice download failed");
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Invoice-${invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success("Invoice downloaded.");
      })
      .catch((err) => toast.error(err.message));
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6">
      <div className="border-b border-champagne/30 pb-6">
        <span className="text-xs uppercase tracking-[0.2em] text-[#8a7147] font-semibold">Accounting & Tax</span>
        <h1 className="text-3xl font-serif text-emerald-deep mt-1">Tax Invoices ({invoices.length})</h1>
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
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">GST Amount</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-deep">{inv.invoice_number}</td>
                    <td className="py-3 px-4 font-mono text-neutral-600">{inv.order_number}</td>
                    <td className="py-3 px-4">
                      {inv.customer_first_name} {inv.customer_last_name}
                      <span className="text-[10px] text-neutral-400 block">{inv.customer_email}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-900">
                      ₹{parseFloat(inv.total_amount).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      ₹{parseFloat(inv.tax_amount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-neutral-400">
                      {new Date(inv.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        onClick={() => handleDownloadInvoice(inv.order_id, inv.invoice_number)}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 border-champagne text-emerald-deep"
                      >
                        <Download className="h-3.5 w-3.5 mr-1" /> PDF
                      </Button>
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
