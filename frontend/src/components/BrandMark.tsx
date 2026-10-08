import { Link } from "@tanstack/react-router";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex shrink-0 items-center" aria-label="Kriléa home">
      <img
        src="/Logo.png"
        alt="KRILÉA - Timeless yours"
        className={`object-contain transition-transform group-hover:scale-105 ${
          compact ? "h-10 w-auto" : "h-14 w-auto sm:h-16 lg:h-18 max-h-20"
        }`}
      />
    </Link>
  );
}
