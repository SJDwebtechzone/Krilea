import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { api, API_BASE_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShoppingBag,
  Search,
  Download,
  Eye,
  CheckCircle2,
  Truck,
  RotateCcw,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [{ title: "Orders Management | Kriléa Admin" }],
  }),
  component: AdminOrdersPage,
});

function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [editingStatus, setEditingStatus] = useState("");
  const [editingPaymentStatus, setEditingPaymentStatus] = useState("");
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      let query = "/orders/admin/all?limit=50";
      if (statusFilter) query += `&status=${statusFilter}`;
      if (search) query += `&search=${search}`;
      const data = await api.get<{ orders: any[] }>(query);
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed loading admin orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOrder = async (orderId: string) => {
    try {
      const ord = await api.get(`/orders/${orderId}`);
      setSelectedOrder(ord);
      setEditingStatus(ord.order_status);
      setEditingPaymentStatus(ord.payment_status);
      setCourierName(ord.courier_name || "");
      setTrackingNumber(ord.tracking_number || "");
      setAdminNotes(ord.admin_notes || "");
    } catch (err: any) {
      toast.error(err.message || "Failed to load order details");
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      await api.put(`/orders/admin/${selectedOrder.id}/status`, {
        orderStatus: editingStatus,
        paymentStatus: editingPaymentStatus,
        courierName: courierName || undefined,
        trackingNumber: trackingNumber || undefined,
        adminNotes: adminNotes || undefined,
      });
      toast.success("Order status updated.");
      setSelectedOrder(null);
      loadOrders();
    } catch (err: any) {
      toast.error(err.message || "Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadInvoice = (orderId: string, orderNumber: string) => {
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
        a.download = `Invoice-${orderNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success("Invoice downloaded.");
      })
      .catch((err) => toast.error(err.message));
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-champagne/30 pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#8a7147] font-semibold">
            Sales & Fulfilment
          </span>
          <h1 className="text-3xl font-serif text-emerald-deep mt-1">Orders ({orders.length})</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-champagne/30 shadow-sm max-w-sm flex-1">
          <Search className="h-4 w-4 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadOrders()}
            placeholder="Search by Order # or Customer..."
            className="w-full text-xs outline-none bg-transparent"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-champagne/30 rounded-xl p-2.5 text-xs text-neutral-700 outline-none"
        >
          <option value="">All Statuses</option>
          <option value="placed">Placed (Pending)</option>
          <option value="processing">Processing (Workshop)</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
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
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-emerald-deep font-mono">
                      {ord.order_number}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-800">
                        {ord.customer_first_name} {ord.customer_last_name}
                      </div>
                      <div className="text-[10px] text-neutral-400">{ord.customer_email}</div>
                    </td>
                    <td className="py-3 px-4">{ord.item_count} items</td>
                    <td className="py-3 px-4 font-semibold text-neutral-900">
                      ₹{parseFloat(ord.total_amount).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                          ord.payment_status === "paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {ord.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-500">
                      {new Date(ord.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Button
                        onClick={() => handleOpenOrder(ord.id)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-emerald-deep hover:bg-emerald-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDownloadInvoice(ord.id, ord.order_number)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-neutral-600 hover:text-emerald-deep"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details & Status Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-champagne/40 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-champagne/20 pb-4">
              <div>
                <span className="text-xs text-neutral-500 uppercase font-semibold">Order Management</span>
                <h2 className="text-2xl font-serif text-emerald-deep">{selectedOrder.order_number}</h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Customer & Address Info */}
            <div className="bg-[#fcfaf7] p-4 rounded-xl border border-champagne/20 text-xs space-y-1">
              <span className="font-semibold text-emerald-deep block text-sm">Customer & Delivery</span>
              <p className="font-medium text-neutral-800">
                {selectedOrder.customer_first_name} {selectedOrder.customer_last_name} ({selectedOrder.customer_email})
              </p>
              <p className="text-neutral-600">
                {typeof selectedOrder.shipping_address === "string"
                  ? selectedOrder.shipping_address
                  : `${selectedOrder.shipping_address?.addressLine1 || ""}, ${selectedOrder.shipping_address?.city || ""} - ${selectedOrder.shipping_address?.pincode || ""}`}
              </p>
            </div>

            {/* Items List */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-700">Order Items</h4>
              <div className="divide-y divide-neutral-100 text-xs">
                {selectedOrder.items?.map((it: any) => (
                  <div key={it.id} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-serif font-medium text-emerald-deep">{it.productName}</span>
                      <span className="text-neutral-400 block text-[10px]">SKU: {it.sku} • Qty: {it.quantity}</span>
                    </div>
                    <span className="font-semibold text-neutral-800">
                      ₹{parseFloat(it.totalPrice).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Update Form */}
            <form onSubmit={handleUpdateStatus} className="border-t border-champagne/20 pt-4 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-700">Update Status & Tracking</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Order Status</Label>
                  <select
                    value={editingStatus}
                    onChange={(e) => setEditingStatus(e.target.value)}
                    className="w-full mt-1 border border-neutral-300 rounded-lg p-2 text-xs bg-white"
                  >
                    <option value="placed">Placed (Pending Review)</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing (Crafting/Packing)</option>
                    <option value="shipped">Shipped (Dispatched)</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled (Restore Inventory)</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Payment Status</Label>
                  <select
                    value={editingPaymentStatus}
                    onChange={(e) => setEditingPaymentStatus(e.target.value)}
                    className="w-full mt-1 border border-neutral-300 rounded-lg p-2 text-xs bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Courier / Logistics Partner</Label>
                  <Input
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    placeholder="e.g. BlueDart / Delhivery / DTDC"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Tracking AWB Number</Label>
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. BD987654321IN"
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-neutral-200">
                <Button
                  type="button"
                  onClick={() => handleDownloadInvoice(selectedOrder.id, selectedOrder.order_number)}
                  variant="outline"
                  className="text-xs border-champagne text-emerald-deep"
                >
                  <Download className="h-3.5 w-3.5 mr-1" /> Download Invoice
                </Button>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedOrder(null)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updating}
                    className="bg-emerald-deep text-champagne hover:bg-emerald-950 font-semibold text-xs uppercase tracking-wider"
                  >
                    {updating ? "Updating..." : "Save Order Changes"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
