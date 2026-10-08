import { useEffect, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { api, API_BASE_URL } from "@/lib/api";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Download,
  Package,
  Truck,
  ArrowRight,
  ShieldCheck,
  Calendar,
  CreditCard,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/order-success/$orderId")({
  head: () => ({
    meta: [{ title: "Order Confirmed | Kriléa Luxury Jewellery" }],
  }),
  component: OrderSuccessPage,
});

function OrderSuccessPage() {
  const { orderId } = useParams({ from: "/order-success/$orderId" });
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      api
        .get(`/orders/${orderId}`)
        .then((data) => setOrder(data))
        .catch((err) => {
          console.error("Failed to load order:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  const handleDownloadInvoice = () => {
    const token = localStorage.getItem("krilea_token");
    const downloadUrl = `${API_BASE_URL}/orders/${orderId}/invoice`;

    fetch(downloadUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Invoice download failed");
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Invoice-${order?.order_number || "Krilea"}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success("Invoice downloaded successfully");
      })
      .catch((err) => {
        toast.error("Could not download invoice: " + err.message);
      });
  };

  if (loading) {
    return (
      <SiteLayout>
        <div className="min-h-[70vh] flex items-center justify-center bg-ivory">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-deep" />
        </div>
      </SiteLayout>
    );
  }

  const shippingAddr =
    typeof order?.shipping_address === "string"
      ? JSON.parse(order.shipping_address)
      : order?.shipping_address || {};

  return (
    <SiteLayout>
      <div className="bg-ivory min-h-[90vh] py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Card */}
          <div className="bg-white rounded-3xl border border-champagne/40 shadow-xl overflow-hidden text-center p-8 sm:p-12 mb-8">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-deep rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-100">
              <CheckCircle2 className="h-10 w-10 text-emerald-800" />
            </div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#8a7147] font-semibold">
              Kriléa Order Confirmed
            </span>
            <h1 className="mt-2 text-3xl sm:text-4xl font-serif text-emerald-deep">
              Thank You for Your Order!
            </h1>
            <p className="mt-3 text-neutral-600 text-sm max-w-lg mx-auto">
              Your order has been placed in our workshop and is being handcrafted and packed with our signature luxury packaging.
            </p>

            <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-4 bg-[#f8f7f2] py-3 px-6 rounded-2xl border border-champagne/30 text-xs text-neutral-700">
              <div>
                <span className="text-neutral-500 block">Order Number</span>
                <span className="font-semibold text-emerald-deep text-sm">{order?.order_number}</span>
              </div>
              <div className="h-8 w-px bg-champagne/30 hidden sm:block" />
              <div>
                <span className="text-neutral-500 block">Estimated Delivery</span>
                <span className="font-semibold text-emerald-deep text-sm">3 - 5 Business Days</span>
              </div>
              <div className="h-8 w-px bg-champagne/30 hidden sm:block" />
              <div>
                <span className="text-neutral-500 block">Payment</span>
                <span className="font-semibold text-emerald-800 text-sm capitalize">
                  {order?.payment_status === "paid" ? "Paid (Online)" : "Pending (COD)"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Button
                onClick={handleDownloadInvoice}
                className="bg-emerald-deep text-champagne hover:bg-emerald-950 font-semibold text-xs uppercase tracking-wider py-3 px-6 h-auto flex items-center gap-2 shadow-md"
              >
                <Download className="h-4 w-4" /> Download Official GST Invoice (PDF)
              </Button>
              <Link to="/account">
                <Button
                  variant="outline"
                  className="border-champagne text-emerald-deep hover:bg-champagne/10 font-semibold text-xs uppercase tracking-wider py-3 px-6 h-auto"
                >
                  View My Orders
                </Button>
              </Link>
            </div>
          </div>

          {/* Order Details & Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Items Card */}
            <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-champagne/30 shadow-sm space-y-4">
              <h3 className="text-lg font-serif text-emerald-deep border-b border-champagne/20 pb-2 flex items-center gap-2">
                <Package className="h-4 w-4 text-[#8a7147]" /> Items Ordered
              </h3>
              <div className="divide-y divide-champagne/15 space-y-3">
                {order?.items?.map((item: any) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.primaryImage || "/home/products/emerald-charm-necklace.jpg"}
                        alt={item.productName}
                        className="w-12 h-12 rounded object-cover border border-neutral-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/home/products/emerald-charm-necklace.jpg";
                        }}
                      />
                      <div>
                        <h4 className="text-xs font-serif text-emerald-deep font-medium">{item.productName}</h4>
                        <p className="text-[11px] text-neutral-500">
                          SKU: {item.sku} • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-deep">
                      ₹{parseFloat(item.totalPrice).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-champagne/20 pt-3 space-y-1.5 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{parseFloat(order?.subtotal || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (3%)</span>
                  <span>₹{parseFloat(order?.tax_amount || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{parseFloat(order?.shipping_amount || 0) === 0 ? "FREE" : `₹${order?.shipping_amount}`}</span>
                </div>
                <div className="border-t border-champagne/30 pt-2 flex justify-between font-semibold text-sm text-emerald-deep">
                  <span>Total Paid</span>
                  <span>₹{parseFloat(order?.total_amount || 0).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Shipping Card */}
            <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-champagne/30 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-serif text-emerald-deep border-b border-champagne/20 pb-2 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[#8a7147]" /> Shipping Details
                </h3>
                <div className="text-xs text-neutral-700 space-y-1 mt-3">
                  <p className="font-semibold text-emerald-deep">{shippingAddr.fullName || order?.customer_first_name}</p>
                  <p>{shippingAddr.addressLine1}</p>
                  {shippingAddr.addressLine2 && <p>{shippingAddr.addressLine2}</p>}
                  <p>
                    {shippingAddr.city}, {shippingAddr.state} - {shippingAddr.pincode}
                  </p>
                  <p className="text-neutral-500 pt-1">Phone: {shippingAddr.phone || order?.customer_phone}</p>
                  <p className="text-neutral-500">Email: {order?.customer_email}</p>
                </div>
              </div>

              <div className="bg-[#f8f7f2] p-4 rounded-xl border border-champagne/30 text-center">
                <ShieldCheck className="h-5 w-5 text-emerald-deep mx-auto mb-1" />
                <h4 className="text-xs font-semibold text-emerald-deep">6-Month Kriléa Guarantee</h4>
                <p className="text-[10px] text-neutral-500 mt-0.5">
                  Anti-tarnish warranty card and silver certificate enclosed inside box.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-emerald-deep hover:text-[#8a7147] transition-colors"
            >
              Continue Exploring Kriléa <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
