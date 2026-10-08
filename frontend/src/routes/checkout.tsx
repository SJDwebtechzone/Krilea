import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  CreditCard,
  QrCode,
  Building2,
  Banknote,
  ShieldCheck,
  Truck,
  CheckCircle2,
  ArrowRight,
  Loader2,
  MapPin,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [{ title: "Secure Checkout | Kriléa Luxury Jewellery" }],
  }),
  component: CheckoutPage,
});

interface Address {
  id?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
}

function CheckoutPage() {
  const { user, isAuthenticated } = useAuth();
  const { items, subtotal, totalItems, clearCart } = useCart();
  const navigate = useNavigate();

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");

  const [addressForm, setAddressForm] = useState<Address>({
    fullName: user ? `${user.firstName} ${user.lastName || ""}`.trim() : "",
    phone: user?.phone || "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "",
    country: "India",
  });

  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | "cod">("upi");
  const [upiVpa, setUpiVpa] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved addresses for user
  useEffect(() => {
    if (isAuthenticated) {
      api
        .get<Address[]>("/users/addresses")
        .then((addrs) => {
          setSavedAddresses(addrs || []);
          if (addrs && addrs.length > 0) {
            const def = addrs.find((a) => a.isDefault) || addrs[0];
            setSelectedAddressId(def.id || "new");
            setAddressForm({
              fullName: def.fullName,
              phone: def.phone,
              addressLine1: def.addressLine1,
              addressLine2: def.addressLine2 || "",
              landmark: def.landmark || "",
              city: def.city,
              state: def.state,
              pincode: def.pincode,
              country: def.country || "India",
            });
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleAddressSelect = (addrId: string) => {
    setSelectedAddressId(addrId);
    if (addrId === "new") {
      setAddressForm({
        fullName: user ? `${user.firstName} ${user.lastName || ""}`.trim() : "",
        phone: user?.phone || "",
        addressLine1: "",
        addressLine2: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
      });
    } else {
      const selected = savedAddresses.find((a) => a.id === addrId);
      if (selected) {
        setAddressForm({
          fullName: selected.fullName,
          phone: selected.phone,
          addressLine1: selected.addressLine1,
          addressLine2: selected.addressLine2 || "",
          landmark: selected.landmark || "",
          city: selected.city,
          state: selected.state,
          pincode: selected.pincode,
          country: selected.country || "India",
        });
      }
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const shippingFee = subtotal >= 999 || totalItems === 0 ? 0 : 99;
  const taxAmount = Math.round(subtotal * 0.03 * 100) / 100;
  const grandTotal = Math.round((subtotal + shippingFee + taxAmount) * 100) / 100;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Your cart is empty");
      navigate({ to: "/cart" });
      return;
    }

    if (!addressForm.fullName || !addressForm.phone || !addressForm.addressLine1 || !addressForm.city || !addressForm.pincode) {
      toast.error("Please fill in all required shipping address fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. If not authenticated, prompt to sign in or redirect
      if (!isAuthenticated) {
        toast.info("Please sign in or register to complete your order.");
        navigate({ to: "/login" });
        setIsSubmitting(false);
        return;
      }

      // 2. Create order in PostgreSQL
      const orderPayload = {
        items: items.map((i) => ({
          productId: i.product_id,
          quantity: i.quantity,
        })),
        shippingAddress: addressForm,
        billingAddress: addressForm,
        paymentMethod,
        shippingAmount: shippingFee,
        customerNotes,
      };

      const orderResult = await api.post<{
        orderId: string;
        orderNumber: string;
        totalAmount: number;
        invoiceNumber: string;
      }>("/orders", orderPayload);

      // 3. Process payment if online
      if (paymentMethod !== "cod") {
        await api.post("/payments/process", {
          orderId: orderResult.orderId,
          paymentMethod,
          status: "paid",
          transactionId: `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        });
      }

      // 4. Clear local & server cart
      await clearCart();

      toast.success("Order placed successfully!");
      navigate({
        to: "/order-success/$orderId",
        params: { orderId: orderResult.orderId },
      });
    } catch (err: any) {
      console.error("Order creation error:", err);
      toast.error(err.message || "Failed to place order. Please check stock and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <div className="bg-ivory min-h-[90vh] py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 border-b border-champagne/30 pb-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif text-emerald-deep">Checkout</h1>
              <p className="text-xs uppercase tracking-[0.2em] text-[#8a7147] mt-1">
                Certified 925 Silver • Safe Delivery
              </p>
            </div>
            <Link to="/cart" className="text-xs text-neutral-600 hover:text-emerald-deep underline">
              Return to Bag
            </Link>
          </div>

          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left Column: Delivery & Payment Details */}
            <div className="lg:col-span-7 space-y-8">
              {/* Step 1: Shipping Address */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-champagne/30 shadow-sm space-y-6">
                <div className="flex items-center gap-2 text-emerald-deep border-b border-champagne/20 pb-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-deep text-champagne text-xs font-bold flex items-center justify-center">
                    1
                  </div>
                  <h2 className="text-xl font-serif">Shipping Address</h2>
                </div>

                {/* Saved addresses selector */}
                {savedAddresses.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                      Select Saved Address
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => handleAddressSelect(addr.id!)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            selectedAddressId === addr.id
                              ? "border-emerald-deep bg-[#f6f5ef] ring-1 ring-emerald-deep"
                              : "border-neutral-200 hover:border-champagne"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-xs text-emerald-deep">{addr.fullName}</span>
                            {addr.isDefault && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-600 line-clamp-2">
                            {addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="text-[11px] text-neutral-500 mt-1">Phone: {addr.phone}</p>
                        </div>
                      ))}

                      <div
                        onClick={() => handleAddressSelect("new")}
                        className={`p-3.5 rounded-xl border border-dashed cursor-pointer flex flex-col items-center justify-center text-center transition-all ${
                          selectedAddressId === "new"
                            ? "border-emerald-deep bg-[#f6f5ef]"
                            : "border-neutral-300 hover:border-champagne text-neutral-600"
                        }`}
                      >
                        <Plus className="h-4 w-4 mb-1 text-emerald-deep" />
                        <span className="text-xs font-medium">Deliver to Another Address</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Address Form */}
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName" className="text-xs uppercase tracking-wider text-neutral-700 font-semibold">
                        Full Name *
                      </Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        required
                        value={addressForm.fullName}
                        onChange={handleFormChange}
                        placeholder="e.g. Priya Sharma"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-xs uppercase tracking-wider text-neutral-700 font-semibold">
                        Mobile Number (For Delivery Updates) *
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        required
                        value={addressForm.phone}
                        onChange={handleFormChange}
                        placeholder="+91 98765 43210"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="addressLine1" className="text-xs uppercase tracking-wider text-neutral-700 font-semibold">
                      Flat / House No. / Street Address *
                    </Label>
                    <Input
                      id="addressLine1"
                      name="addressLine1"
                      required
                      value={addressForm.addressLine1}
                      onChange={handleFormChange}
                      placeholder="e.g. Flat 4B, Emerald Court, Anna Salai"
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-xs uppercase tracking-wider text-neutral-700 font-semibold">
                        City *
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        required
                        value={addressForm.city}
                        onChange={handleFormChange}
                        placeholder="Chennai"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-xs uppercase tracking-wider text-neutral-700 font-semibold">
                        State *
                      </Label>
                      <Input
                        id="state"
                        name="state"
                        required
                        value={addressForm.state}
                        onChange={handleFormChange}
                        placeholder="Tamil Nadu"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode" className="text-xs uppercase tracking-wider text-neutral-700 font-semibold">
                        PIN Code *
                      </Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        required
                        value={addressForm.pincode}
                        onChange={handleFormChange}
                        placeholder="600001"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="landmark" className="text-xs uppercase tracking-wider text-neutral-700 font-semibold">
                      Landmark (Optional)
                    </Label>
                    <Input
                      id="landmark"
                      name="landmark"
                      value={addressForm.landmark || ""}
                      onChange={handleFormChange}
                      placeholder="Near City Centre"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Payment Method */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-champagne/30 shadow-sm space-y-6">
                <div className="flex items-center gap-2 text-emerald-deep border-b border-champagne/20 pb-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-deep text-champagne text-xs font-bold flex items-center justify-center">
                    2
                  </div>
                  <h2 className="text-xl font-serif">Payment Method</h2>
                </div>

                <div className="space-y-3">
                  {/* UPI */}
                  <label
                    className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "upi"
                        ? "border-emerald-deep bg-[#f6f5ef] ring-1 ring-emerald-deep"
                        : "border-neutral-200 hover:border-champagne"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "upi"}
                      onChange={() => setPaymentMethod("upi")}
                      className="mt-1 text-emerald-deep"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-emerald-deep flex items-center gap-2">
                          <QrCode className="h-4 w-4 text-[#8a7147]" /> UPI (Google Pay, PhonePe, Paytm, BHIM)
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          Instant & Free
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1">
                        Pay instantly via any UPI App or QR code.
                      </p>
                      {paymentMethod === "upi" && (
                        <div className="mt-3 pt-3 border-t border-champagne/30">
                          <Input
                            placeholder="Enter UPI ID (e.g. name@okhdfcbank)"
                            value={upiVpa}
                            onChange={(e) => setUpiVpa(e.target.value)}
                            className="text-xs bg-white"
                          />
                        </div>
                      )}
                    </div>
                  </label>

                  {/* Card */}
                  <label
                    className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "card"
                        ? "border-emerald-deep bg-[#f6f5ef] ring-1 ring-emerald-deep"
                        : "border-neutral-200 hover:border-champagne"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="mt-1 text-emerald-deep"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-emerald-deep flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-[#8a7147]" /> Credit / Debit Card
                        </span>
                        <span className="text-xs text-neutral-500">Visa, Mastercard, RuPay</span>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1">
                        Encrypted 256-bit SSL transaction.
                      </p>
                    </div>
                  </label>

                  {/* Netbanking */}
                  <label
                    className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "netbanking"
                        ? "border-emerald-deep bg-[#f6f5ef] ring-1 ring-emerald-deep"
                        : "border-neutral-200 hover:border-champagne"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "netbanking"}
                      onChange={() => setPaymentMethod("netbanking")}
                      className="mt-1 text-emerald-deep"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-emerald-deep flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-[#8a7147]" /> Net Banking
                        </span>
                        <span className="text-xs text-neutral-500">All Major Indian Banks</span>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1">
                        HDFC, ICICI, SBI, Axis, Kotak and 50+ banks.
                      </p>
                    </div>
                  </label>

                  {/* COD */}
                  <label
                    className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "cod"
                        ? "border-emerald-deep bg-[#f6f5ef] ring-1 ring-emerald-deep"
                        : "border-neutral-200 hover:border-champagne"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="mt-1 text-emerald-deep"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-emerald-deep flex items-center gap-2">
                          <Banknote className="h-4 w-4 text-[#8a7147]" /> Cash on Delivery (COD)
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1">
                        Pay cash or UPI upon delivery at your doorstep.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Place Order */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-champagne/30 shadow-md space-y-6 sticky top-28">
                <h2 className="text-xl font-serif text-emerald-deep border-b border-champagne/20 pb-3">
                  Items in Your Order ({totalItems})
                </h2>

                {/* Compact Item list */}
                <div className="max-h-64 overflow-y-auto space-y-3 pr-2 divide-y divide-champagne/10">
                  {items.map((item) => (
                    <div key={item.cart_item_id || item.product_id} className="pt-3 first:pt-0 flex items-center gap-3">
                      <img
                        src={item.primary_image || "/home/products/emerald-charm-necklace.jpg"}
                        alt={item.name}
                        className="w-12 h-12 rounded object-cover border border-neutral-200 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/home/products/emerald-charm-necklace.jpg";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-serif text-emerald-deep truncate">{item.name}</h4>
                        <p className="text-[11px] text-neutral-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-deep">
                        ₹{(item.unit_price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals Breakdown */}
                <div className="border-t border-champagne/20 pt-4 space-y-2 text-xs text-neutral-700">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-emerald-deep">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (3%)</span>
                    <span className="font-semibold text-emerald-deep">₹{taxAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="font-semibold text-emerald-700">
                      {shippingFee === 0 ? "FREE" : `₹${shippingFee}`}
                    </span>
                  </div>
                  <div className="border-t border-champagne/30 pt-3 flex justify-between items-baseline text-emerald-deep">
                    <span className="text-sm font-semibold">Total Payable</span>
                    <span className="text-2xl font-serif font-bold">
                      ₹{grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Place Order CTA */}
                <Button
                  type="submit"
                  disabled={isSubmitting || items.length === 0}
                  className="w-full bg-emerald-deep text-champagne hover:bg-emerald-950 font-semibold py-4 h-auto uppercase tracking-wider text-xs shadow-lg flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Processing Order...
                    </>
                  ) : (
                    <>
                      Complete Order (₹{grandTotal.toLocaleString("en-IN")}) <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="text-[11px] text-neutral-500 space-y-1 text-center pt-2">
                  <p className="flex items-center justify-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" /> 100% Authentic 925 Sterling Silver
                  </p>
                  <p>Includes official GST Tax Invoice & Kriléa Warranty Card</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </SiteLayout>
  );
}
