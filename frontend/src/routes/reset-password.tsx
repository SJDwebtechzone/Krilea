import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, CheckCircle2, ArrowLeft, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  head: () => ({
    meta: [{ title: "Set New Password | Kriléa Luxury Jewellery" }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid or missing reset token. Please request a new password reset link.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password. Link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f2] flex flex-col justify-between selection:bg-champagne selection:text-emerald-deep font-sans">
      {/* Background Subtle Luxury Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-gradient-to-b from-[#f3ede0] to-transparent pointer-events-none" />

      {/* Top Bar */}
      <header className="relative z-10 w-full px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <Link
          to="/login"
          className="text-xs uppercase tracking-[0.18em] font-medium text-emerald-deep/70 hover:text-emerald-deep transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> <span className="underline underline-offset-4">Back to Login</span>
        </Link>
        <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wider text-[#8a7147] bg-[#f2ecde] px-3 py-1 rounded-full border border-champagne/30">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-deep" />
          <span>VAULT SECURITY</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md bg-white border border-[#e8dfcf] rounded-2xl shadow-xl shadow-stone-200/50 p-7 sm:p-10 space-y-6">
          
          {/* Centered Logo */}
          <div className="text-center space-y-3">
            <Link to="/" className="inline-block group focus:outline-none">
              <img
                src="/Logo.png"
                alt="KRILÉA Luxury Jewellery"
                className="h-14 sm:h-16 w-auto mx-auto object-contain transition-transform group-hover:scale-105 duration-300"
              />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif text-emerald-deep tracking-tight font-medium">
                Set New Password
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-neutral-500 font-light">
                Please enter your new strong password below.
              </p>
            </div>
          </div>

          {success ? (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-sm text-neutral-700 font-medium">
                Your password has been securely updated in our database.
              </p>
              <Button
                onClick={() => navigate({ to: "/login" })}
                className="w-full bg-emerald-deep hover:bg-emerald-950 text-champagne uppercase tracking-[0.16em] text-xs font-semibold py-3.5 rounded-xl shadow-md mt-2"
              >
                Go to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label
                  htmlFor="password"
                  className="text-[11px] uppercase tracking-[0.14em] text-neutral-700 font-semibold block mb-1.5"
                >
                  New Password (min 8 chars)
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-9 bg-[#faf9f5] border-[#d8cfbe] text-neutral-900 placeholder:text-neutral-400 focus:border-[#8a7147] focus:ring-1 focus:ring-[#8a7147] rounded-xl h-11 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <Label
                  htmlFor="confirmPassword"
                  className="text-[11px] uppercase tracking-[0.14em] text-neutral-700 font-semibold block mb-1.5"
                >
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-9 bg-[#faf9f5] border-[#d8cfbe] text-neutral-900 placeholder:text-neutral-400 focus:border-[#8a7147] focus:ring-1 focus:ring-[#8a7147] rounded-xl h-11 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-700"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-deep hover:bg-emerald-950 text-champagne font-semibold py-3.5 h-auto uppercase tracking-[0.16em] text-xs rounded-xl shadow-md mt-4 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin text-champagne" /> : "Save New Password"}
              </Button>
            </form>
          )}
        </div>
      </main>

      {/* Standalone Minimalist Footer */}
      <footer className="relative z-10 w-full border-t border-[#ede5d8] py-4 text-center text-[11px] text-neutral-500 tracking-wider">
        <p>© {new Date().getFullYear()} Kriléa Luxury Jewellery. All rights reserved.</p>
      </footer>
    </div>
  );
}
