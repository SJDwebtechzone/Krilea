import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, Sparkles, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [{ title: "Shopping Bag | Kriléa Luxury Jewellery" }],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, totalItems, subtotal, total, updateQuantity, removeItem, clearCart, isLoading } = useCart();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      navigate({ to: "/admin" });
    }
  }, [isAdmin, authLoading]);

  const freeShippingThreshold = 999;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingFee = subtotal >= freeShippingThreshold || totalItems === 0 ? 0 : 99;
  const taxAmount = Math.round(subtotal * 0.03 * 100) / 100;
  const finalGrandTotal = Math.max(0, subtotal + shippingFee + taxAmount - appliedDiscount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === "KRILEA10") {
      const discount = Math.round(subtotal * 0.1);
      setAppliedDiscount(discount);
      toast.success("Coupon KRILEA10 applied! 10% discount added.");
    } else if (couponCode.toUpperCase() === "WELCOME100") {
      setAppliedDiscount(100);
      toast.success("Coupon WELCOME100 applied! ₹100 discount added.");
    } else {
      toast.error("Invalid coupon code. Try KRILEA10 or WELCOME100");
    }
  };

  return (
    <SiteLayout>
      <div className="bg-ivory min-h-[85vh] py-10 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between border-b border-champagne/30 pb-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif text-emerald-deep">Your Shopping Bag</h1>
              <p className="text-xs uppercase tracking-[0.2em] text-[#8a7147] mt-1">
                {totalItems} {totalItems === 1 ? "Exquisite Piece" : "Exquisite Pieces"}
              </p>
            </div>
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-neutral-500 hover:text-red-700 underline flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear Bag
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-champagne/30 shadow-sm max-w-2xl mx-auto p-8">
              <div className="w-16 h-16 rounded-full bg-[#f4ede1] text-emerald-deep flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-serif text-emerald-deep mb-2">Your Shopping Bag is Empty</h2>
              <p className="text-neutral-600 text-sm max-w-md mx-auto mb-8">
                Explore our fine sterling silver and artisan jewellery collections to find your timeless companion.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  to="/silver-collection"
                  className="bg-emerald-deep text-champagne hover:bg-emerald-950 font-semibold px-6 py-3 rounded text-xs uppercase tracking-wider transition-all"
                >
                  Explore Silver Collection
                </Link>
                <Link
                  to="/fashion-collection"
                  className="border border-champagne text-emerald-deep hover:bg-champagne/10 font-semibold px-6 py-3 rounded text-xs uppercase tracking-wider transition-all"
                >
                  Explore Fashion Edit
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Left Column: Cart Items */}
              <div className="lg:col-span-8 space-y-6">
                {/* Free shipping bar */}
                <div className="bg-white p-4 rounded-xl border border-champagne/30 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-deep mb-2">
                    <span className="flex items-center gap-1.5">
                      <Truck className="h-4 w-4 text-champagne" />
                      {remainingForFreeShipping === 0
                        ? "🎉 You have unlocked Free Pan India Delivery!"
                        : `Add ₹${remainingForFreeShipping.toLocaleString("en-IN")} more to unlock FREE Delivery`}
                    </span>
                    <span>{Math.round(progressToFreeShipping)}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#f0eee6] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-deep transition-all duration-500 rounded-full"
                      style={{ width: `${progressToFreeShipping}%` }}
                    />
                  </div>
                </div>

                {/* Items List */}
                <div className="bg-white rounded-2xl border border-champagne/30 shadow-sm divide-y divide-champagne/20">
                  {items.map((item) => (
                    <div key={item.cart_item_id || item.product_id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                        <img
                          src={item.primary_image || "/home/products/emerald-charm-necklace.jpg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/home/products/emerald-charm-necklace.jpg";
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link
                          to="/products/$slug"
                          params={{ slug: item.slug || item.product_id }}
                          className="text-base sm:text-lg font-serif text-emerald-deep hover:text-[#8a7147] transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-neutral-500 mt-0.5">SKU: {item.sku || "KRL-SLV-01"}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm font-semibold text-emerald-deep">
                            ₹{item.unit_price.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-white">
                        <button
                          onClick={() => updateQuantity(item.cart_item_id || item.product_id, item.quantity - 1)}
                          className="p-2 hover:bg-neutral-100 text-neutral-700 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 py-1 text-xs font-semibold text-emerald-deep min-w-[32px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cart_item_id || item.product_id, item.quantity + 1)}
                          className="p-2 hover:bg-neutral-100 text-neutral-700 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Total & Delete */}
                      <div className="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0">
                        <span className="text-base font-semibold text-emerald-deep">
                          ₹{(item.unit_price * item.quantity).toLocaleString("en-IN")}
                        </span>
                        <button
                          onClick={() => removeItem(item.cart_item_id || item.product_id)}
                          className="text-xs text-neutral-400 hover:text-red-600 transition-colors flex items-center gap-1 sm:mt-2"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Assurance Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white p-3.5 rounded-xl border border-champagne/30 text-center flex flex-col items-center">
                    <ShieldCheck className="h-5 w-5 text-emerald-deep mb-1" />
                    <span className="text-xs font-semibold text-neutral-800">100% Certified 925 Silver</span>
                    <span className="text-[10px] text-neutral-500">Hallmark Authenticity</span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-champagne/30 text-center flex flex-col items-center">
                    <Truck className="h-5 w-5 text-emerald-deep mb-1" />
                    <span className="text-xs font-semibold text-neutral-800">Tamper-Proof Box</span>
                    <span className="text-[10px] text-neutral-500">Safe Pan India Delivery</span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-champagne/30 text-center flex flex-col items-center">
                    <Sparkles className="h-5 w-5 text-emerald-deep mb-1" />
                    <span className="text-xs font-semibold text-neutral-800">Tarnish Resistant</span>
                    <span className="text-[10px] text-neutral-500">6-Month Anti-Tarnish Warranty</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-champagne/30 shadow-md space-y-6">
                  <h2 className="text-xl font-serif text-emerald-deep border-b border-champagne/20 pb-3">
                    Order Summary
                  </h2>

                  {/* Coupon Code Input */}
                  <form onSubmit={handleApplyCoupon} className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-neutral-600 font-semibold">
                      Promotional Code
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="e.g. KRILEA10"
                        className="text-xs uppercase"
                      />
                      <Button
                        type="submit"
                        variant="outline"
                        className="text-xs border-champagne text-emerald-deep hover:bg-champagne/10 font-semibold shrink-0"
                      >
                        Apply
                      </Button>
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      Try coupon <span className="font-semibold text-emerald-deep">KRILEA10</span> for 10% off.
                    </p>
                  </form>

                  {/* Pricing Breakdown */}
                  <div className="space-y-3 text-sm text-neutral-700 border-t border-champagne/20 pt-4">
                    <div className="flex justify-between">
                      <span>Bag Subtotal ({totalItems} items)</span>
                      <span className="font-medium text-emerald-deep">₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Estimated GST (3%)</span>
                      <span className="font-medium text-emerald-deep">₹{taxAmount.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Shipping Fee</span>
                      <span className="font-medium">
                        {shippingFee === 0 ? (
                          <span className="text-emerald-700 font-semibold">FREE</span>
                        ) : (
                          `₹${shippingFee}`
                        )}
                      </span>
                    </div>

                    {appliedDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Discount Applied</span>
                        <span>-₹{appliedDiscount.toLocaleString("en-IN")}</span>
                      </div>
                    )}

                    <div className="border-t border-champagne/30 pt-3 flex justify-between items-baseline text-emerald-deep">
                      <span className="text-base font-semibold">Grand Total</span>
                      <span className="text-2xl font-serif font-bold">
                        ₹{finalGrandTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Proceed to Checkout Button */}
                  <Button
                    onClick={() => navigate({ to: "/checkout" })}
                    className="w-full bg-emerald-deep text-champagne hover:bg-emerald-950 font-semibold py-4 h-auto uppercase tracking-wider text-xs shadow-lg flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout <ArrowRight className="h-4 w-4" />
                  </Button>

                  <p className="text-[11px] text-center text-neutral-500">
                    Taxes calculated based on current GST guidelines.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
