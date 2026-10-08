import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/SiteLayout";
import { HeroBanner } from "@/components/HeroBanner";
import { SectionHeading } from "@/components/SectionHeading";

export function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <SiteLayout>
      <main>
        <HeroBanner
          title={
            <>
              Contact us
              <br />
              <span className="text-champagne">We’re here to help</span>
            </>
          }
          subtitle="Questions • Assistance • A little help choosing"
          button="Send us a message"
          eyebrow="Get in touch"
          image="/contect/hero/contact-hero.png"
        />
        <section className="bg-cream px-5 py-20 texture-paper sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.7fr_1.1fr]">
            <div>
              <SectionHeading align="left" eyebrow="Our details" title="Get in touch" subtitle="We’re just a message away." />
              <div className="mt-10 grid gap-7">
                {[
                  ["Our store address", "123, Diamond Plaza, Anna Salai, Chennai – 600002"],
                  ["Call us", "+91 93647 33735 • Mon–Sat, 10 AM–6 PM"],
                  ["Email us", "support@krilea.in • We’ll respond within 24 hours."],
                  ["Chat on WhatsApp", "+91 93647 33735 • Quick support for your queries."],
                ].map(([title, text]) => (
                  <div key={title} className="border-b border-champagne/45 pb-5">
                    <h3 className="font-display text-2xl text-emerald-deep">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-foreground/65">{text}</p>
                  </div>
                ))}
              </div>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setSent(true);
              }}
              className="bg-emerald-deep p-6 text-cream shadow-xl shadow-emerald-deep/10 sm:p-9"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.23em] text-champagne">
                Send a message
              </p>
              <h2 className="mt-3 font-display text-4xl">We’d love to hear from you</h2>
              {sent ? (
                <div className="mt-8 border border-champagne/50 p-8 text-center">
                  <Check className="mx-auto h-8 w-8 text-champagne" />
                  <p className="mt-4 font-display text-2xl">Thank you for reaching out.</p>
                  <p className="mt-2 text-sm text-cream/60">Our team will be in touch shortly.</p>
                </div>
              ) : (
                <div className="mt-7 grid gap-4">
                  <input
                    required
                    placeholder="Your name *"
                    className="h-12 border border-champagne/45 bg-transparent px-4 text-sm text-cream outline-none placeholder:text-cream/50 focus:border-champagne"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Your email *"
                    className="h-12 border border-champagne/45 bg-transparent px-4 text-sm text-cream outline-none placeholder:text-cream/50 focus:border-champagne"
                  />
                  <input
                    placeholder="Phone number"
                    className="h-12 border border-champagne/45 bg-transparent px-4 text-sm text-cream outline-none placeholder:text-cream/50 focus:border-champagne"
                  />
                  <select className="h-12 border border-champagne/45 bg-emerald-deep px-4 text-sm text-cream/70 outline-none">
                    <option>Select subject</option>
                    <option>Order assistance</option>
                    <option>Product question</option>
                    <option>Partnership</option>
                  </select>
                  <textarea
                    required
                    placeholder="Your message *"
                    rows={5}
                    className="border border-champagne/45 bg-transparent px-4 py-3 text-sm text-cream outline-none placeholder:text-cream/50 focus:border-champagne"
                  />
                  <Button
                    type="submit"
                    className="h-12 rounded-sm bg-champagne text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-deep hover:bg-champagne-soft"
                  >
                    Send message <ArrowRight />
                  </Button>
                </div>
              )}
            </form>
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}

export default ContactPage;

