import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Star, CheckCircle2, XCircle, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reviews")({
  head: () => ({
    meta: [{ title: "Reviews Moderation | Kriléa Admin" }],
  }),
  component: AdminReviewsPage,
});

function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await api.get<{ reviews: any[] }>("/reviews/admin/all?limit=50");
      setReviews(data.reviews || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentApproval: boolean) => {
    try {
      await api.put(`/reviews/admin/${id}/status`, { isApproved: !currentApproval });
      toast.success(`Review ${!currentApproval ? "approved" : "hidden"}.`);
      loadReviews();
    } catch (err: any) {
      toast.error(err.message || "Failed to update review status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this review?")) return;
    try {
      await api.delete(`/reviews/admin/${id}`);
      toast.success("Review deleted.");
      loadReviews();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete review");
    }
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6">
      <div className="border-b border-champagne/30 pb-6">
        <span className="text-xs uppercase tracking-[0.2em] text-[#8a7147] font-semibold">Moderation</span>
        <h1 className="text-3xl font-serif text-emerald-deep mt-1">Product Reviews ({reviews.length})</h1>
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
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Review Content</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 font-serif font-semibold text-emerald-deep">
                      {rev.product_name}
                    </td>
                    <td className="py-3 px-4">
                      <div>{rev.first_name} {rev.last_name || ""}</div>
                      <div className="text-[10px] text-neutral-400">{rev.user_email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3.5 w-3.5 ${
                              s <= rev.rating ? "fill-amber-400" : "text-neutral-200"
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      {rev.title && <div className="font-semibold text-neutral-800 truncate">{rev.title}</div>}
                      <p className="text-neutral-600 line-clamp-2">{rev.review_text}</p>
                    </td>
                    <td className="py-3 px-4">
                      {rev.is_approved ? (
                        <span className="text-[11px] text-emerald-700 font-medium">Approved</span>
                      ) : (
                        <span className="text-[11px] text-amber-700 font-medium">Pending / Hidden</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Button
                        onClick={() => handleToggleStatus(rev.id, rev.is_approved)}
                        size="sm"
                        variant="outline"
                        className="text-[10px] h-7 px-2"
                      >
                        {rev.is_approved ? "Hide" : "Approve"}
                      </Button>
                      <Button
                        onClick={() => handleDelete(rev.id)}
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-neutral-400 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
