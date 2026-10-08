import { Heart, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { getAssetUrl } from "@/lib/api";

interface StoreProduct {
  id: string;
  slug: string;
  name: string;
  price: string | number;
  sale_price?: string | number | null;
  quantity?: number;
  material?: string;
  images?: Array<{ url: string; isPrimary?: boolean }>;
  primary_image?: string | null;
}

export function ProductCard({ product }: { product: StoreProduct }) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const primaryImage =
    product.images?.find((image) => image.isPrimary)?.url ||
    product.images?.[0]?.url ||
    product.primary_image;
  const imageUrl = getAssetUrl(primaryImage);
  const price = Number(product.price);
  const salePrice = product.sale_price == null ? null : Number(product.sale_price);
  const wished = isInWishlist(product.id);
  const contextProduct = {
    ...product,
    salePrice: product.sale_price,
    images: primaryImage ? [{ url: primaryImage, isPrimary: true }] : [],
  };

  return (
    <article className="group relative min-w-0">
      <div className="relative aspect-[0.86] overflow-hidden rounded-sm bg-cream-deep">
        <a href={`/products/${encodeURIComponent(product.slug)}`} className="block h-full w-full" aria-label={`View ${product.name}`}>
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="grid h-full w-full place-items-center text-emerald-deep/40" aria-label="No product image">
              <ImageOff className="h-8 w-8" />
            </div>
          )}
        </a>
        <Button
          variant="ghost"
          size="icon"
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          onClick={() => void toggleWishlist(product.id, contextProduct)}
          className={`absolute right-2 top-2 rounded-full bg-cream/90 hover:bg-cream ${
            wished ? "text-champagne" : "text-emerald-deep"
          }`}
        >
          <Heart className="h-4 w-4" fill={wished ? "currentColor" : "none"} />
        </Button>
      </div>
      <div className="pt-4">
        <div className="flex items-start justify-between gap-2">
          <a href={`/products/${encodeURIComponent(product.slug)}`} className="font-display text-xl leading-tight text-emerald-deep hover:text-emerald">
            {product.name}
          </a>
          <div className="shrink-0 text-right text-sm font-semibold text-emerald-deep">
            <span>₹{(salePrice ?? price).toLocaleString("en-IN")}</span>
            {salePrice !== null && <span className="ml-1.5 text-xs font-normal text-neutral-400 line-through">₹{price.toLocaleString("en-IN")}</span>}
          </div>
        </div>
        <Button
          disabled={product.quantity !== undefined && product.quantity <= 0}
          onClick={() => void addItem(product.id, 1, contextProduct)}
          className="mt-4 h-9 w-full rounded-sm bg-emerald-deep text-[10px] font-bold uppercase tracking-[0.16em] text-cream hover:bg-emerald"
        >
          {product.quantity !== undefined && product.quantity <= 0 ? "Out of stock" : "Add to cart"}
        </Button>
      </div>
    </article>
  );
}
