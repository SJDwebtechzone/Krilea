import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [{ title: "Store Settings | Kriléa Admin" }],
  }),
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Admin Profile Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Admin Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadSettings();
    loadAdminProfile();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.get<{ map: Record<string, string> }>("/admin/settings");
      setSettingsMap(data.map || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminProfile = async () => {
    try {
      const res = await api.get<{ user: any }>("/auth/me");
      if (res.user) {
        setFirstName(res.user.firstName || "");
        setLastName(res.user.lastName || "");
        setEmail(res.user.email || "");
        setPhone(res.user.phone || "");
      }
    } catch (err) {
      console.error("Failed loading admin profile:", err);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettingsMap((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.put("/admin/settings", { settings: settingsMap });
      toast.success("Store configuration updated successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to update settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put("/auth/profile", { firstName, lastName, phone });
      toast.success("Admin profile details updated successfully.");
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
      toast.success("Admin password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-deep" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8">
      <div className="border-b border-champagne/30 pb-6">
        <span className="text-xs uppercase tracking-[0.2em] text-[#8a7147] font-semibold">
          System Administration
        </span>
        <h1 className="text-3xl font-serif text-emerald-deep mt-1">Admin Settings & Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Admin Profile & Security */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-champagne/30 shadow-sm space-y-6">
            <div className="border-b border-champagne/20 pb-4">
              <span className="text-xs uppercase tracking-wider text-champagne-gold font-semibold">
                Account Details
              </span>
              <h2 className="text-xl font-serif text-emerald-deep mt-1">Personal Information</h2>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">First Name *</Label>
                  <Input
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Last Name *</Label>
                  <Input
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Email Address (Read-only)</Label>
                <Input
                  disabled
                  value={email}
                  className="mt-1 bg-neutral-100 text-neutral-500 cursor-not-allowed"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Phone Number</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="mt-1"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-emerald-deep text-champagne hover:bg-emerald-950 font-semibold text-xs uppercase tracking-wider flex items-center gap-2"
                >
                  <Save className="h-4 w-4" /> {savingProfile ? "Saving..." : "Save Profile Details"}
                </Button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-champagne/30 shadow-sm space-y-6">
            <div className="border-b border-champagne/20 pb-4">
              <span className="text-xs uppercase tracking-wider text-champagne-gold font-semibold">
                Security
              </span>
              <h2 className="text-xl font-serif text-emerald-deep mt-1">Change Password</h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <Label className="text-xs font-semibold">Current Password *</Label>
                <Input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">New Password (min 8 characters) *</Label>
                <Input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new strong password"
                  className="mt-1"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={changingPassword}
                  className="bg-emerald-deep text-champagne hover:bg-emerald-950 font-semibold text-xs uppercase tracking-wider flex items-center gap-2"
                >
                  <Save className="h-4 w-4" /> {changingPassword ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Store Configuration */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-champagne/30 shadow-sm space-y-6 h-fit">
          <div className="border-b border-champagne/20 pb-4">
            <span className="text-xs uppercase tracking-wider text-champagne-gold font-semibold">
              Store Configuration
            </span>
            <h2 className="text-xl font-serif text-emerald-deep mt-1">General Settings</h2>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <Label className="text-xs font-semibold">Store Name</Label>
              <Input
                value={settingsMap.site_name || "Kriléa"}
                onChange={(e) => handleChange("site_name", e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Support Email</Label>
              <Input
                value={settingsMap.contact_email || "support@krilea.in"}
                onChange={(e) => handleChange("contact_email", e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Support Helpline Phone</Label>
              <Input
                value={settingsMap.contact_phone || "+91 93647 33735"}
                onChange={(e) => handleChange("contact_phone", e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Free Shipping Threshold (INR)</Label>
              <Input
                type="number"
                value={settingsMap.free_shipping_threshold || "999"}
                onChange={(e) => handleChange("free_shipping_threshold", e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">GST Rate (%) on Fine Jewellery</Label>
              <Input
                type="number"
                value={settingsMap.gst_rate || "3"}
                onChange={(e) => handleChange("gst_rate", e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Top Announcement Bar Text</Label>
              <Input
                value={settingsMap.announcement_bar || "Pan India shipping on all orders | 100% Certified 925 Sterling Silver"}
                onChange={(e) => handleChange("announcement_bar", e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="pt-4 border-t border-neutral-200">
              <Button
                type="submit"
                disabled={savingSettings}
                className="bg-emerald-deep text-champagne hover:bg-emerald-950 font-semibold text-xs uppercase tracking-wider flex items-center gap-2"
              >
                <Save className="h-4 w-4" /> {savingSettings ? "Saving..." : "Save Store Settings"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
