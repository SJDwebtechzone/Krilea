import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [{ title: "Forgot Password | Kriléa Luxury Jewellery" }],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: email.trim().toLowerCase() });
      setSubmitted(true);
      toast.success("Password reset instructions sent.");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit password reset request");
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
          <span>VAULT RECOVERY</span>
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
                Forgot Password?
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-neutral-500 font-light">
                Enter your registered email to receive recovery instructions.
              </p>
            </div>
          </div>

          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-xs sm:text-sm text-neutral-700 font-medium leading-relaxed">
                If an account exists with <span className="font-semibold text-emerald-deep">{email}</span>, a secure password reset link has been dispatched to your inbox.
              </p>
              <Link
                to="/login"
                className="inline-block mt-4 text-xs font-semibold text-emerald-deep hover:text-[#8a7147] underline underline-offset-4 uppercase tracking-wider"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label
                  htmlFor="email"
                  className="text-[11px] uppercase tracking-[0.14em] text-neutral-700 font-semibold block mb-1.5"
                >
                  Registered Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                  <Input
                    id="email"
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="pl-10 bg-[#faf9f5] border-[#d8cfbe] text-neutral-900 placeholder:text-neutral-400 focus:border-[#8a7147] focus:ring-1 focus:ring-[#8a7147] rounded-xl h-11 text-sm"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-deep hover:bg-emerald-950 text-champagne font-semibold py-3.5 h-auto tracking-[0.16em] uppercase text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-4"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin text-champagne" /> : "Send Reset Link"}
              </Button>

              <div className="text-center pt-2">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-emerald-deep transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
                </Link>
              </div>
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
