import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { getAssetUrl } from "@/lib/api";

interface Category {
  id?: string;
  name: string;
  slug?: string;
  image_url?: string | null;
  image?: string;
}

export function CategoryCard({
  category,
  to,
}: {
  category: Category;
  to?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const slug = category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const image = getAssetUrl(category.image_url || category.image);

  return (
    <Link
      to={(to || `/collections/${slug}`) as any}
      className="group relative flex flex-col overflow-hidden rounded-md border border-champagne/45 bg-cream-deep/70 p-2.5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-champagne hover:bg-cream-deep hover:shadow-lg"
    >
      {/* Upper Image Box with aperture styling */}
      <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-emerald-deep">
        {image && !imageFailed ? (
          <img
            src={image}
            alt={category.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-champagne/70">
            <Sparkles className="h-8 w-8" strokeWidth={1} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/70 via-emerald-deep/20 to-transparent opacity-90 transition-opacity group-hover:opacity-70" />
        <span className="absolute right-2.5 top-2.5 grid h-6 w-6 place-items-center rounded-full bg-emerald-deep/80 text-champagne backdrop-blur-sm transition-transform group-hover:scale-110 group-hover:bg-emerald-deep">
          <Sparkles className="h-3 w-3" />
        </span>
      </div>

      {/* Lower Label & Action Box */}
      <div className="flex items-center justify-between gap-2 px-1.5 pb-1 pt-3">
        <div className="min-w-0">
          <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-soft">
            Explore
          </span>
          <h3 className="truncate font-display text-base font-medium text-emerald-deep transition-colors group-hover:text-emerald sm:text-lg">
            {category.name}
          </h3>
        </div>
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-champagne/60 bg-champagne/20 text-emerald-deep transition-all duration-300 group-hover:border-champagne group-hover:bg-champagne group-hover:text-emerald-deep">
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

export default CategoryCard;
