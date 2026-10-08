import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/enquiries")({
  head: () => ({
    meta: [{ title: "Contact Enquiries | Kriléa Admin" }],
  }),
  component: AdminEnquiriesPage,
});

function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnquiries();
  }, []);

  const loadEnquiries = async () => {
    setLoading(true);
    try {
      const data = await api.get<{ enquiries: any[] }>("/contact/admin/all?limit=50");
      setEnquiries(data.enquiries || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/contact/admin/${id}/status`, { status: newStatus });
      toast.success("Enquiry marked as " + newStatus);
      loadEnquiries();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6">
      <div className="border-b border-champagne/30 pb-6">
        <span className="text-xs uppercase tracking-[0.2em] text-[#8a7147] font-semibold">Support & Inquiries</span>
        <h1 className="text-3xl font-serif text-emerald-deep mt-1">Client Enquiries ({enquiries.length})</h1>
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
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Message</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-emerald-deep">{enq.full_name}</div>
                      <div className="text-[10px] text-neutral-400">{enq.email} {enq.phone && `• ${enq.phone}`}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-neutral-800">{enq.subject || "General Inquiry"}</td>
                    <td className="py-3 px-4 max-w-sm text-neutral-600">{enq.message}</td>
                    <td className="py-3 px-4 text-neutral-400">{new Date(enq.created_at).toLocaleDateString("en-IN")}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                          enq.status === "resolved"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {enq.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {enq.status !== "resolved" ? (
                        <Button
                          onClick={() => handleUpdateStatus(enq.id, "resolved")}
                          size="sm"
                          className="bg-emerald-deep text-champagne text-[10px] h-7 px-2"
                        >
                          Mark Resolved
                        </Button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 flex items-center justify-end gap-1 font-medium">
                          <CheckCircle2 className="h-3 w-3" /> Resolved
                        </span>
                      )}
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
