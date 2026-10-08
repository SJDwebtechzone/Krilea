import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Sign In | Kriléa Luxury Jewellery" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      toast.error("Please enter both your email/username and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await login(identifier.trim(), password);
      toast.success(`Welcome back, ${user.firstName}!`);
      if (user.role === "admin") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/account" });
      }
    } catch (err: any) {
      const msg = err.message || "Invalid credentials. Please check your username/email and password.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f2] flex flex-col justify-between selection:bg-champagne selection:text-emerald-deep font-sans">
      {/* Background Subtle Luxury Glows */}
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
                Welcome Back
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-neutral-500 font-light">
                Sign in to continue to your Kriléa account
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

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label
                htmlFor="identifier"
                className="text-[11px] uppercase tracking-[0.14em] text-neutral-700 font-semibold block mb-1.5"
              >
                Email Address or Username
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                <Input
                  id="identifier"
                  type="text"
                  required
                  autoFocus
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@krilea.in or username"
                  className="pl-10 bg-[#faf9f5] border-[#d8cfbe] text-neutral-900 placeholder:text-neutral-400 focus:border-[#8a7147] focus:ring-1 focus:ring-[#8a7147] rounded-xl h-11 text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label
                  htmlFor="password"
                  className="text-[11px] uppercase tracking-[0.14em] text-neutral-700 font-semibold"
                >
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#8a7147] hover:text-emerald-deep underline underline-offset-4"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-[#faf9f5] border-[#d8cfbe] text-neutral-900 placeholder:text-neutral-400 focus:border-[#8a7147] focus:ring-1 focus:ring-[#8a7147] rounded-xl h-11 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-3 text-neutral-400 hover:text-neutral-700 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 text-xs text-neutral-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#d8cfbe] bg-[#faf9f5] text-emerald-deep focus:ring-[#8a7147] h-3.5 w-3.5 accent-emerald-deep"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-deep hover:bg-emerald-950 text-champagne font-semibold py-3.5 h-auto tracking-[0.16em] uppercase text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-champagne" /> Signing In...
                </>
              ) : (
                <>
                  Login <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Switch to Register */}
          <div className="text-center pt-4 border-t border-[#f0e9dc]">
            <p className="text-xs text-neutral-600">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-emerald-deep hover:text-[#8a7147] underline underline-offset-4 ml-1">
                Create Account
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

