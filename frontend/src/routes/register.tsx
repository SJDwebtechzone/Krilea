import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [{ title: "Create Account | Kriléa Luxury Jewellery" }],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.email.trim() || !formData.password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim() || undefined,
        username: formData.username.trim() || formData.email.split("@")[0],
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        password: formData.password,
      });

      toast.success(`Welcome to Kriléa, ${user.firstName}!`);
      navigate({ to: "/account" });
    } catch (err: any) {
      const msg = err.message || "Registration failed. Please check your details and try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f2] flex flex-col justify-between selection:bg-champagne selection:text-emerald-deep font-sans">
      {/* Background Subtle Luxury Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-gradient-to-b from-[#f3ede0] to-transparent pointer-events-none" />

      {/* Top Bar with Return Link */}
      <header className="relative z-10 w-full px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <Link
          to="/"
          className="text-xs uppercase tracking-[0.18em] font-medium text-emerald-deep/70 hover:text-emerald-deep transition-colors inline-flex items-center gap-1.5"
        >
          ← <span className="underline underline-offset-4">Return to Boutique</span>
        </Link>
        <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wider text-[#8a7147] bg-[#f2ecde] px-3 py-1 rounded-full border border-champagne/30">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-deep" />
          <span>256-BIT SSL ENCRYPTED</span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-10">
        <div className="w-full max-w-lg bg-white border border-[#e8dfcf] rounded-2xl shadow-xl shadow-stone-200/50 p-7 sm:p-10 space-y-6">
          
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
                Create Your Account
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-neutral-500 font-light">
                Join Krilea and discover our jewellery collections.
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-start gap-2 animate-in fade-in-50">
              <span className="font-semibold uppercase tracking-wider text-red-800">Error:</span>
              <span>{error}</span>
            </div>
          )}

          {/* Register Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <Label
                  htmlFor="firstName"
                  className="text-[11px] uppercase tracking-[0.14em] text-neutral-700 font-semibold block mb-1"
                >
                  First Name *
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Priya"
                    className="pl-10 bg-[#faf9f5] border-[#d8cfbe] text-neutral-900 placeholder:text-neutral-400 focus:border-[#8a7147] focus:ring-1 focus:ring-[#8a7147] rounded-xl h-10 text-sm"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="lastName"
                  className="text-[11px] uppercase tracking-[0.14em] text-neutral-700 font-semibold block mb-1"
                >
                  Last Name
                </Label>
                <div className="relative">
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Sharma"
                    className="bg-[#faf9f5] border-[#d8cfbe] text-neutral-900 placeholder:text-neutral-400 focus:border-[#8a7147] focus:ring-1 focus:ring-[#8a7147] rounded-xl h-10 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <Label
                  htmlFor="username"
                  className="text-[11px] uppercase tracking-[0.14em] text-neutral-700 font-semibold block mb-1"
                >
                  Username *
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="priya_krilea"
                    className="pl-10 bg-[#faf9f5] border-[#d8cfbe] text-neutral-900 placeholder:text-neutral-400 focus:border-[#8a7147] focus:ring-1 focus:ring-[#8a7147] rounded-xl h-10 text-sm"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="phone"
                  className="text-[11px] uppercase tracking-[0.14em] text-neutral-700 font-semibold block mb-1"
                >
                  Phone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="pl-10 bg-[#faf9f5] border-[#d8cfbe] text-neutral-900 placeholder:text-neutral-400 focus:border-[#8a7147] focus:ring-1 focus:ring-[#8a7147] rounded-xl h-10 text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label
                htmlFor="email"
                className="text-[11px] uppercase tracking-[0.14em] text-neutral-700 font-semibold block mb-1"
              >
                Email Address *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="priya@example.com"
                  className="pl-10 bg-[#faf9f5] border-[#d8cfbe] text-neutral-900 placeholder:text-neutral-400 focus:border-[#8a7147] focus:ring-1 focus:ring-[#8a7147] rounded-xl h-10 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <Label
                  htmlFor="password"
                  className="text-[11px] uppercase tracking-[0.14em] text-neutral-700 font-semibold block mb-1"
                >
                  Password (min 8) *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="pl-10 pr-9 bg-[#faf9f5] border-[#d8cfbe] text-neutral-900 placeholder:text-neutral-400 focus:border-[#8a7147] focus:ring-1 focus:ring-[#8a7147] rounded-xl h-10 text-sm"
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
                  className="text-[11px] uppercase tracking-[0.14em] text-neutral-700 font-semibold block mb-1"
                >
                  Confirm Password *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="pl-10 pr-9 bg-[#faf9f5] border-[#d8cfbe] text-neutral-900 placeholder:text-neutral-400 focus:border-[#8a7147] focus:ring-1 focus:ring-[#8a7147] rounded-xl h-10 text-sm"
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
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-deep hover:bg-emerald-950 text-champagne font-semibold py-3.5 h-auto tracking-[0.16em] uppercase text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-champagne" /> Creating Account...
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Switch to Login */}
          <div className="text-center pt-4 border-t border-[#f0e9dc]">
            <p className="text-xs text-neutral-600">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-emerald-deep hover:text-[#8a7147] underline underline-offset-4 ml-1">
                Login
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Standalone Minimalist Footer */}
      <footer className="relative z-10 w-full border-t border-[#ede5d8] py-4 text-center text-[11px] text-neutral-500 tracking-wider">
        <p>© {new Date().getFullYear()} Kriléa Luxury Jewellery. All rights reserved.</p>
      </footer>
    </div>
  );
}
