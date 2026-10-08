import { Check, Package, Sparkles, Truck } from "lucide-react";

export function BenefitsStrip() {
  const items = [
    { icon: Sparkles, title: "Premium quality", text: "Tarnish resistant" },
    { icon: Check, title: "Trendy & timeless", text: "Made to be loved" },
    { icon: Truck, title: "Pan India shipping", text: "To your doorstep" },
    { icon: Package, title: "Beautiful packaging", text: "For every occasion" },
  ];
  return (
    <section className="border-b border-champagne/30 bg-cream-deep texture-paper">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-champagne/35 sm:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="flex min-h-24 flex-col items-center justify-center gap-1.5 px-3 py-4 text-center lg:py-5"
          >
            <Icon className="h-5 w-5 text-champagne lg:h-6 lg:w-6" strokeWidth={1.5} />
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-deep lg:text-base lg:tracking-[0.08em]">
              {title}
            </p>
            <p className="text-xs font-medium text-foreground/75 lg:text-sm">
              {text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default BenefitsStrip;
