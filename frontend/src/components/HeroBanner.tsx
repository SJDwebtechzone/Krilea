import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroBanner({
  title = (
    <>
      Jewellery
      <br />
      for every chapter
      <br />
      of you
    </>
  ),
  button = "Shop Collection",
  image = "/home/hero/krilea-hero.jpg",
  eyebrow = "Kriléa / timeless yours",
  to = "/silver-collection",
}: {
  title?: ReactNode;
  subtitle?: string;
  button?: string;
  image?: string;
  eyebrow?: string;
  to?: string;
}) {
  const [slide, setSlide] = useState(0);
  const isWideBanner =
    image.includes("about") ||
    image.includes("silver") ||
    image.includes("fashion") ||
    image.includes("fassion") ||
    image.includes("contect") ||
    image.includes("contact");

  return (
    <section className="relative w-full bg-emerald-deep text-cream">
      <div
        className={`relative w-full ${
          isWideBanner
            ? "aspect-[2170/725]"
            : "aspect-[1600/912]"
        }`}
      >
        <img
          src={image}
          alt="Kriléa jewellery collection hero"
          className="absolute inset-0 h-full w-full object-contain md:object-cover"
        />

        <div className="relative mx-auto flex h-full max-w-7xl items-center px-6 py-6 sm:px-8 sm:py-10 lg:px-12">
          <div className="reveal max-w-xs sm:max-w-md lg:max-w-lg drop-shadow-md">
            {eyebrow && (
              <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-champagne sm:mb-3 sm:text-[10px] sm:tracking-[0.28em]">
                {eyebrow}
              </p>
            )}
            {title && (
              <h1 className="font-display text-xl leading-tight text-cream sm:text-3xl md:text-4xl lg:text-5xl">
                {title}
              </h1>
            )}
            {button && (
              <Button
                asChild
                className="mt-3 h-8 rounded-sm bg-champagne px-4 text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-deep shadow-md shadow-black/10 hover:bg-champagne-soft sm:mt-6 sm:h-11 sm:px-6 sm:text-[10px] sm:tracking-[0.16em]"
              >
                <Link to={to}>
                  {button}
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {!isWideBanner && (
          <div className="absolute bottom-4 left-6 hidden items-center gap-3 sm:flex lg:left-12">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSlide((value) => (value + 2) % 3)}
              aria-label="Previous slide"
              className="h-8 w-8 text-cream hover:bg-cream/10 hover:text-champagne sm:h-10 sm:w-10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {[0, 1, 2].map((item) => (
                <button
                  key={item}
                  aria-label={`Go to slide ${item + 1}`}
                  onClick={() => setSlide(item)}
                  className={`h-1.5 rounded-full transition-all ${
                    item === slide ? "w-6 bg-champagne sm:w-8" : "w-1.5 bg-cream/50"
                  }`}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSlide((value) => (value + 1) % 3)}
              aria-label="Next slide"
              className="h-8 w-8 text-cream hover:bg-cream/10 hover:text-champagne sm:h-10 sm:w-10"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

export default HeroBanner;
