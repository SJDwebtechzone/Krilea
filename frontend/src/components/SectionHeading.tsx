export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  light = false,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  light?: boolean;
  align?: "center" | "left";
}) {
  return (
    <div className={`${align === "center" ? "mx-auto text-center" : "text-left"} max-w-2xl`}>
      {eyebrow && (
        <div
          className={`mb-3 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] ${
            align === "center" ? "justify-center" : "justify-start"
          } ${light ? "text-champagne" : "text-emerald-soft"}`}
        >
          <span className="h-px w-8 bg-current" />
          {eyebrow}
          <span className="h-px w-8 bg-current" />
        </div>
      )}
      <h2 className={`font-display text-4xl leading-[0.95] sm:text-5xl ${light ? "text-cream" : "text-emerald-deep"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-sm leading-7 ${light ? "text-cream/65" : "text-foreground/65"}`}>{subtitle}</p>
      )}
    </div>
  );
}
