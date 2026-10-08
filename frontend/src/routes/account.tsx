import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { api, API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Package,
  MapPin,
  Heart,
  Download,
  Trash2,
  Plus,
  ShieldAlert,
  LogOut,
  ShoppingBag,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [{ title: "My Account | Kriléa Luxury Jewellery" }],
  }),
  component: AccountPage,
});

interface Address {
  id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
}

function AccountPage() {
  const { user, isAuthenticated, isLoading: authLoading, logout, isAdmin, updateProfile } = useAuth();
  const { addItem } = useCart();
  const { items: wishlistItems, removeItem: removeWishlistItem, refreshWishlist } = useWishlist();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Profile Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // New Address State
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isDefault: false,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhone(user.phone || "");
      loadAccountData();
    }
  }, [user]);

  const loadAccountData = async () => {
    setLoadingData(true);
    try {
      const [ordersRes, addrsRes] = await Promise.all([
        api.get<{ orders: any[] }>("/orders/my-orders"),
        api.get<Address[]>("/users/addresses"),
      ]);
      setOrders(ordersRes.orders || []);
      setAddresses(addrsRes || []);
    } catch (err) {
      console.error("Failed loading account data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ firstName, lastName, phone });
      toast.success("Profile details updated successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }
    setChangingPassword(true);
    try {
      await api.put("/auth/change-password", { currentPassword, newPassword });
      toast.success("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/users/addresses", newAddress);
      toast.success("Address added successfully.");
      setShowAddAddress(false);
      setNewAddress({
        fullName: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        isDefault: false,
      });
      loadAccountData();
    } catch (err: any) {
      toast.error(err.message || "Failed to add address");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await api.delete(`/users/addresses/${id}`);
      toast.success("Address removed.");
      loadAccountData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete address");
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await api.patch(`/users/addresses/${id}/default`);
      toast.success("Default address updated.");
      loadAccountData();
    } catch (err: any) {
      toast.error(err.message || "Failed to set default address");
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

  if (authLoading || !user) {
    return (
      <SiteLayout>
        <div className="min-h-[70vh] flex items-center justify-center bg-ivory">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-deep" />
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="bg-ivory min-h-[90vh] py-10 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* User Header */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-champagne/30 shadow-md mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-deep text-champagne font-serif text-2xl flex items-center justify-center shadow-inner">
                {user.firstName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-serif text-emerald-deep">
                    {user.firstName} {user.lastName}
                  </h1>
                  {isAdmin && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                      Admin Staff
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link to="/admin">
                  <Button className="bg-emerald-deep text-champagne hover:bg-emerald-950 font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" /> Admin Portal
                  </Button>
                </Link>
              )}
              <Button
                onClick={() => logout()}
                variant="outline"
                className="border-neutral-300 text-neutral-700 hover:bg-red-50 hover:text-red-700 text-xs uppercase tracking-wider flex items-center gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </Button>
            </div>
          </div>

          {/* Account Tabs */}
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="bg-white p-1 rounded-2xl border border-champagne/30 shadow-sm grid grid-cols-2 md:grid-cols-4 max-w-2xl">
              <TabsTrigger
                value="orders"
                className="data-[state=active]:bg-emerald-deep data-[state=active]:text-champagne font-medium text-xs py-2.5 rounded-xl transition-all"
              >
                <Package className="h-3.5 w-3.5 mr-1.5" /> Orders ({orders.length})
              </TabsTrigger>
              <TabsTrigger
                value="wishlist"
                className="data-[state=active]:bg-emerald-deep data-[state=active]:text-champagne font-medium text-xs py-2.5 rounded-xl transition-all"
              >
                <Heart className="h-3.5 w-3.5 mr-1.5" /> Wishlist ({wishlistItems.length})
              </TabsTrigger>
              <TabsTrigger
                value="addresses"
                className="data-[state=active]:bg-emerald-deep data-[state=active]:text-champagne font-medium text-xs py-2.5 rounded-xl transition-all"
              >
                <MapPin className="h-3.5 w-3.5 mr-1.5" /> Addresses
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-emerald-deep data-[state=active]:text-champagne font-medium text-xs py-2.5 rounded-xl transition-all"
              >
                <User className="h-3.5 w-3.5 mr-1.5" /> Profile & Security
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              {loadingData ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-champagne/30">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-deep" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-champagne/30 p-6">
                  <Package className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                  <h3 className="text-lg font-serif text-emerald-deep">No Orders Yet</h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-6">
                    You haven't placed any jewellery orders yet. Explore our latest pieces.
                  </p>
                  <Link
                    to="/silver-collection"
                    className="bg-emerald-deep text-champagne hover:bg-emerald-950 font-semibold px-5 py-2.5 rounded text-xs uppercase tracking-wider inline-block"
                  >
                    Shop Jewellery
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white rounded-2xl p-6 border border-champagne/30 shadow-sm space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between border-b border-champagne/20 pb-4 gap-2">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-serif font-bold text-base text-emerald-deep">
                              {ord.order_number}
                            </span>
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
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            Placed on {new Date(ord.created_at).toLocaleDateString("en-IN", { dateStyle: "long" })}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <Button
                            onClick={() => handleDownloadInvoice(ord.id, ord.order_number)}
                            variant="outline"
                            size="sm"
                            className="border-champagne text-emerald-deep hover:bg-champagne/10 text-xs font-medium flex items-center gap-1.5"
                          >
                            <Download className="h-3.5 w-3.5" /> PDF Invoice
                          </Button>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-neutral-100 space-y-2">
                        {ord.items?.map((item: any) => (
                          <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.primaryImage || "/home/products/emerald-charm-necklace.jpg"}
                                alt={item.productName}
                                className="w-10 h-10 rounded object-cover border border-neutral-200"
                              />
                              <div>
                                <h4 className="font-serif font-medium text-neutral-800">{item.productName}</h4>
                                <span className="text-neutral-500">
                                  Qty: {item.quantity} • ₹{parseFloat(item.unitPrice).toLocaleString("en-IN")} each
                                </span>
                              </div>
                            </div>
                            <span className="font-semibold text-emerald-deep">
                              ₹{parseFloat(item.totalPrice).toLocaleString("en-IN")}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Order Footer */}
                      <div className="border-t border-champagne/15 pt-3 flex flex-wrap items-center justify-between text-xs">
                        <div className="text-neutral-500">
                          Payment: <span className="font-medium text-neutral-800 uppercase">{ord.payment_status}</span>
                        </div>
                        <div className="font-semibold text-sm text-emerald-deep">
                          Grand Total: ₹{parseFloat(ord.total_amount).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Wishlist Tab */}
            <TabsContent value="wishlist" className="space-y-6">
              {wishlistItems.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-champagne/30 p-6">
                  <Heart className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                  <h3 className="text-lg font-serif text-emerald-deep">Your Wishlist is Empty</h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-6">
                    Tap the heart icon on any piece you adore to save it here for later.
                  </p>
                  <Link
                    to="/silver-collection"
                    className="bg-emerald-deep text-champagne hover:bg-emerald-950 font-semibold px-5 py-2.5 rounded text-xs uppercase tracking-wider inline-block"
                  >
                    Browse Collections
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {wishlistItems.map((item) => (
                    <div
                      key={item.wishlist_item_id || item.product_id}
                      className="bg-white rounded-2xl border border-champagne/30 overflow-hidden shadow-sm flex flex-col justify-between"
                    >
                      <div className="relative aspect-square bg-neutral-100">
                        <img
                          src={item.primary_image || "/home/products/emerald-charm-necklace.jpg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeWishlistItem(item.product_id)}
                          className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur rounded-full text-neutral-500 hover:text-red-600 shadow-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <Link
                            to="/products/$slug"
                            params={{ slug: item.slug || item.product_id }}
                            className="font-serif text-emerald-deep font-medium text-sm hover:underline line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-semibold text-emerald-deep">
                              ₹{(item.sale_price || item.price).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>

                        <Button
                          onClick={() => {
                            addItem(item.product_id, 1, item);
                            removeWishlistItem(item.product_id);
                          }}
                          size="sm"
                          className="w-full bg-emerald-deep text-champagne hover:bg-emerald-950 text-xs font-semibold py-2"
                        >
                          <ShoppingBag className="h-3.5 w-3.5 mr-1" /> Move to Bag
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-serif text-emerald-deep">Your Saved Addresses</h3>
                <Button
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="bg-emerald-deep text-champagne hover:bg-emerald-950 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Add New Address
                </Button>
              </div>

              {showAddAddress && (
                <form
                  onSubmit={handleAddAddress}
                  className="bg-white p-6 rounded-2xl border border-champagne/30 shadow-md space-y-4 max-w-2xl"
                >
                  <h4 className="font-serif text-base text-emerald-deep font-semibold">New Address Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Full Name *</Label>
                      <Input
                        required
                        value={newAddress.fullName}
                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                        placeholder="Recipient's Name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Mobile Phone *</Label>
                      <Input
                        required
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Flat / House No / Street Address *</Label>
                    <Input
                      required
                      value={newAddress.addressLine1}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                      placeholder="Address Line 1"
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs">City *</Label>
                      <Input
                        required
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        placeholder="Chennai"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">State *</Label>
                      <Input
                        required
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        placeholder="Tamil Nadu"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">PIN Code *</Label>
                      <Input
                        required
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                        placeholder="600001"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={newAddress.isDefault}
                      onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                    />
                    <Label htmlFor="isDefault" className="text-xs cursor-pointer">
                      Set as default delivery address
                    </Label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="submit" className="bg-emerald-deep text-champagne text-xs font-semibold">
                      Save Address
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddAddress(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="bg-white p-6 rounded-2xl border border-champagne/30 shadow-sm flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-serif font-semibold text-emerald-deep text-base">{addr.full_name}</span>
                        {addr.is_default && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                            Default Address
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        {addr.address_line1}
                        {addr.address_line2 && `, ${addr.address_line2}`}
                        <br />
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-xs text-neutral-500 mt-2">Mobile: {addr.phone}</p>
                    </div>

                    <div className="border-t border-neutral-100 pt-3 flex items-center justify-between">
                      {!addr.is_default && (
                        <button
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="text-xs text-emerald-deep hover:underline font-medium"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-xs text-neutral-400 hover:text-red-600 flex items-center gap-1 ml-auto"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Profile & Security Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Info */}
                <form
                  onSubmit={handleUpdateProfile}
                  className="bg-white p-6 sm:p-8 rounded-2xl border border-champagne/30 shadow-sm space-y-4"
                >
                  <h3 className="text-lg font-serif text-emerald-deep border-b border-champagne/20 pb-2">
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">First Name</Label>
                      <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Last Name</Label>
                      <Input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Email Address (Read-only)</Label>
                    <Input value={user.email} disabled className="mt-1 bg-neutral-100 text-neutral-500" />
                  </div>

                  <div>
                    <Label className="text-xs">Phone Number</Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="mt-1"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={savingProfile}
                    className="bg-emerald-deep text-champagne hover:bg-emerald-950 text-xs uppercase tracking-wider font-semibold"
                  >
                    {savingProfile ? "Saving..." : "Save Profile Details"}
                  </Button>
                </form>

                {/* Password Change */}
                <form
                  onSubmit={handleChangePassword}
                  className="bg-white p-6 sm:p-8 rounded-2xl border border-champagne/30 shadow-sm space-y-4"
                >
                  <h3 className="text-lg font-serif text-emerald-deep border-b border-champagne/20 pb-2">
                    Change Password
                  </h3>

                  <div>
                    <Label className="text-xs">Current Password</Label>
                    <Input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">New Password (min 8 characters)</Label>
                    <Input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-1"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={changingPassword}
                    className="bg-emerald-deep text-champagne hover:bg-emerald-950 text-xs uppercase tracking-wider font-semibold"
                  >
                    {changingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SiteLayout>
  );
}
