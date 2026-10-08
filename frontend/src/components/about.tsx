import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Globe, Gem, ShieldCheck, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/SiteLayout";
import { HeroBanner } from "@/components/HeroBanner";
import { SectionHeading } from "@/components/SectionHeading";
import { PlaceholderImage } from "@/components/PlaceholderImage";

function Value({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="text-center p-4 bg-white/70 rounded-xl border border-champagne/30 shadow-xs">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-champagne/15 text-[#8a7147] mb-2">
        {icon}
      </div>
      <h4 className="text-xs uppercase tracking-wider font-semibold text-emerald-deep">{title}</h4>
      <p className="mt-1 text-[11px] text-foreground/70">{text}</p>
    </div>
  );
}

function PromiseItem({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="bg-[#0b241e] p-6 text-center border border-champagne/25 rounded-xl space-y-2">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-champagne/15 text-champagne mb-3">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-cream tracking-wide">{title}</h3>
      <p className="text-xs leading-5 text-cream/70 font-light">{text}</p>
    </div>
  );
}

export function AboutPage() {
  return (
    <SiteLayout>
      <main>
        <HeroBanner
          title={
            <>
              About KRILÉA
              <br />
              <span className="text-champagne font-normal">Precious, and Timelessly Yours</span>
            </>
          }
          subtitle="Born from the harmony of grace, beauty and timeless elegance."
          button="Explore Collections"
          eyebrow="Our Essence"
          image="/about/hero/about-hero.png"
          to="/silver-collection"
        />

        {/* Core Brand Story */}
        <section className="bg-cream px-5 py-20 texture-paper sm:py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <PlaceholderImage
              src="/about/story/our-journey.jpg"
              alt="KRILÉA jewellery essence"
              className="aspect-[0.92] rounded-2xl shadow-lg border border-champagne/40"
            />
            <div className="space-y-6">
              <SectionHeading
                align="left"
                eyebrow="Our Story & Inspiration"
                title="The Essence of KRILÉA"
              />
              
              <div className="space-y-4 text-sm sm:text-[15px] leading-relaxed text-neutral-700 font-light">
                <p>
                  <strong className="text-emerald-deep font-semibold">KRILÉA</strong> is born from the harmony of grace, beauty and timeless elegance. Inspired by the essence of Krishna and Lalithambika, its colours represent depth, grace and radiance.
                </p>
                <p>
                  We create jewellery that celebrates the individuality and confidence of every woman. From elegant everyday pieces to statement designs, every creation is made to be treasured.
                </p>
                <p>
                  Our focus is on refined design, lasting shine and accessible luxury. With worldwide shipping, KRILÉA brings contemporary jewellery closer to women everywhere.
                </p>
              </div>

              {/* Signature Quote */}
              <div className="p-5 bg-white/80 border-l-4 border-champagne rounded-r-xl shadow-sm">
                <p className="font-serif text-lg sm:text-xl text-emerald-deep italic">
                  “KRILÉA — precious, and Timelessly Yours.”
                </p>
              </div>

              {/* Pillars Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <Value icon={<Sparkles className="h-4 w-4" />} title="Depth & Grace" text="Inspired essence" />
                <Value icon={<Gem className="h-4 w-4" />} title="Lasting Shine" text="Refined design" />
                <Value icon={<Globe className="h-4 w-4" />} title="Worldwide" text="Global shipping" />
                <Value icon={<Heart className="h-4 w-4" />} title="Accessible" text="Everyday luxury" />
              </div>
            </div>
          </div>
        </section>

        {/* The KRILÉA Promise */}
        <section className="bg-emerald-deep px-5 py-20 texture-emerald sm:py-24 text-cream">
          <div className="mx-auto max-w-7xl space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs uppercase tracking-[0.22em] text-champagne font-semibold block mb-2">
                Our Commitment
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-cream">
                Refined Design, Enduring Beauty
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-cream/70 font-light">
                Every piece is crafted to celebrate your individuality, from quiet moments to life's grandest occasions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <PromiseItem
                icon={<Gem className="h-5 w-5" />}
                title="Refined Design"
                text="Meticulously detailed pieces crafted for effortless sophistication."
              />
              <PromiseItem
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Lasting Shine"
                text="Tarnish-resistant finishes engineered for everyday longevity."
              />
              <PromiseItem
                icon={<Globe className="h-5 w-5" />}
                title="Worldwide Shipping"
                text="Delivering contemporary elegance to women across the globe."
              />
              <PromiseItem
                icon={<Sparkles className="h-5 w-5" />}
                title="Accessible Luxury"
                text="Exceptional craftsmanship offered at genuine value."
              />
            </div>

            <div className="text-center pt-4">
              <Button
                asChild
                className="bg-champagne hover:bg-champagne-soft text-emerald-deep font-semibold uppercase tracking-[0.16em] text-xs px-8 py-3 rounded-full shadow-md"
              >
                <Link to="/silver-collection">
                  Discover Our Creations <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Brand Values */}
        <section className="bg-cream px-5 py-20 texture-paper sm:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
            <div className="order-2 lg:order-1 space-y-6">
              <SectionHeading align="left" eyebrow="Our Heritage" title="Radiance in Every Detail" />
              <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700 font-light">
                Inspired by the divine beauty of Krishna and Lalithambika, our collections blend cultural reverence with contemporary silhouettes, creating jewellery that moves with your personal story.
              </p>
              <div className="grid grid-cols-2 gap-4 border-t border-champagne/40 pt-4 text-xs font-medium text-emerald-deep uppercase tracking-wider">
                <div className="p-3 bg-white/60 rounded-lg border border-champagne/30">✦ Depth & Grace</div>
                <div className="p-3 bg-white/60 rounded-lg border border-champagne/30">✦ Radiance & Purity</div>
                <div className="p-3 bg-white/60 rounded-lg border border-champagne/30">✦ Everyday Elegance</div>
                <div className="p-3 bg-white/60 rounded-lg border border-champagne/30">✦ Statement Design</div>
              </div>
            </div>
            <PlaceholderImage
              src="/about/values/our-values.jpg"
              alt="KRILÉA craftsmanship and heritage"
              className="order-1 aspect-[1.15] rounded-2xl shadow-lg border border-champagne/40 lg:order-2"
            />
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}

export default AboutPage;
