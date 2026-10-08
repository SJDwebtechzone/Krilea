import { useState, type FormEvent } from "react";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Newsletter({
  eyebrow = "Kriléa Signature Edit",
  quote = "“Jewellery is not just an adornment, it is the timeless poetry of who you are.”",
  subtitle = "Crafted with devotion, designed for eternity. Wear your story with unmatched elegance.",
  showSubscribe = true,
}: {
  eyebrow?: string;
  quote?: string;
  subtitle?: string;
  showSubscribe?: boolean;
  author?: string;
  buttonText?: string;
  buttonLink?: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="relative w-full overflow-hidden bg-emerald-deep text-cream">
      <div className="relative aspect-[16/9] w-full sm:aspect-[2170/725]">
        <img
          src="/all-pages.png"
          alt="Kriléa timeless jewellery edit"
          className="absolute inset-0 h-full w-full object-contain md:object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/90 via-emerald-deep/60 to-emerald-deep/30 md:bg-emerald-deep/45" />

        <div className="relative mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 py-8 text-center sm:py-12">
          {eyebrow && (
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-champagne sm:mb-3 sm:text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{eyebrow}</span>
              <Sparkles className="h-3.5 w-3.5" />
            </div>
          )}

          <h2 className="max-w-3xl font-display text-xl leading-tight text-cream drop-shadow-md sm:text-3xl md:text-4xl lg:text-5xl">
            {quote}
          </h2>

          {subtitle && (
            <p className="mx-auto mt-2 max-w-xl font-serif text-xs italic text-cream/85 sm:mt-4 sm:text-sm">
              {subtitle}
            </p>
          )}

          {showSubscribe && (
            <div className="mt-4 w-full max-w-md sm:mt-6">
              {submitted ? (
                <p className="mx-auto flex items-center justify-center gap-2 rounded-sm border border-champagne/60 bg-emerald-deep/80 px-4 py-3 text-xs font-medium text-champagne backdrop-blur-sm sm:text-sm">
                  <Check className="h-4 w-4" /> Thank you for joining the Kriléa circle.
                </p>
              ) : (
                <form
                  onSubmit={submit}
                  className="flex overflow-hidden rounded-sm border border-champagne/60 bg-emerald-deep/80 shadow-lg backdrop-blur-sm focus-within:border-champagne"
                >
                  <input
                    required
                    type="email"
                    placeholder="Enter your email address"
                    className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-xs text-cream outline-none placeholder:text-cream/50 sm:py-3 sm:text-sm"
                  />
                  <Button
                    type="submit"
                    className="h-auto rounded-none bg-champagne px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-deep transition-colors hover:bg-champagne-soft sm:text-xs"
                  >
                    Subscribe
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Newsletter;
