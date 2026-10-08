import { useState, useEffect } from "react";
import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Star,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Sparkles,
  Ruler,
  CheckCircle2,
  Plus,
  Minus,
  MessageSquare,
  Share2,
  Loader2,
  ImageOff,
} from "lucide-react";
import { toast } from "sonner";
import { getAssetUrl } from "@/lib/api";

export const Route = createFileRoute("/products/$slug")({
  head: () => ({
    meta: [{ title: "Jewellery Details | Kriléa Luxury Collections" }],
  }),
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { slug } = useParams({ from: "/products/$slug" });
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Review Form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (slug) {
      loadProduct();
    }
  }, [slug]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const data = await api.get<{ product: any; reviews: any[] }>(`/products/${slug}`);
      setProduct(data.product);
      setReviews(data.reviews || []);
      const primaryImg =
        data.product?.images?.find((img: any) => img.isPrimary)?.url ||
        data.product?.images?.[0]?.url ||
        "";
      setSelectedImage(primaryImg);
    } catch (err: any) {
      console.error("Failed loading product:", err);
      toast.error("Could not load product details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product.id, quantity, product);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please sign in to leave a review.");
      return;
    }
    if (!reviewText) {
      toast.error("Please write your review thoughts.");
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post("/reviews", {
        productId: product.id,
        rating: reviewRating,
        title: reviewTitle || undefined,
        reviewText,
      });
      toast.success("Thank you! Your review has been submitted.");
      setShowReviewForm(false);
      setReviewTitle("");
      setReviewText("");
      loadProduct();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: `Explore ${product?.name} on Kriléa`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <SiteLayout>
        <div className="min-h-[70vh] flex items-center justify-center bg-ivory">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-deep" />
        </div>
      </SiteLayout>
    );
  }

  if (!product) {
    return (
      <SiteLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center bg-ivory p-4 text-center">
          <h2 className="text-2xl font-serif text-emerald-deep mb-2">Product Not Found</h2>
          <p className="text-sm text-neutral-600 mb-6">The jewellery piece you are looking for may have been archived.</p>
          <Link
            to="/"
            className="bg-emerald-deep text-champagne font-semibold px-6 py-2.5 rounded text-xs uppercase tracking-wider"
          >
            Explore Collections
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const price = parseFloat(product.price);
  const salePrice = product.sale_price ? parseFloat(product.sale_price) : null;
  const isOutOfStock = product.quantity <= 0;

  return (
    <SiteLayout>
      <div className="bg-ivory min-h-screen py-10 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="text-xs text-neutral-500 mb-6 flex items-center gap-2">
            <Link to="/" className="hover:text-emerald-deep">Home</Link>
            <span>/</span>
            {(product.collection_slug || product.category_slug) && (
              <>
                <Link to={`/collections/${product.collection_slug || product.category_slug}` as any} className="hover:text-emerald-deep">
                  {product.collection_name || product.category_name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-emerald-deep font-medium truncate">{product.name}</span>
          </nav>

          {/* Product Hero Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            {/* Gallery Column */}
            <div className="lg:col-span-6 space-y-4">
              <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-champagne/40 shadow-md relative group">
                {selectedImage ? (
                  <img src={getAssetUrl(selectedImage)} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={() => setSelectedImage("")} />
                ) : (
                  <div className="grid h-full place-items-center text-neutral-400"><ImageOff className="h-10 w-10" /></div>
                )}
                {product.is_best_seller && (
                  <span className="absolute top-4 left-4 bg-emerald-deep text-champagne text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                    Bestseller
                  </span>
                )}
                <button
                  onClick={() => toggleWishlist(product.id, product)}
                  className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md shadow-md transition-colors ${
                    wishlisted ? "bg-red-50 text-red-600" : "bg-white/80 text-neutral-600 hover:text-emerald-deep"
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`h-5 w-5 ${wishlisted ? "fill-red-600" : ""}`} />
                </button>
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((img: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img.url)}
                      className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        selectedImage === img.url
                          ? "border-emerald-deep shadow-md ring-2 ring-emerald-deep/20"
                          : "border-neutral-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={getAssetUrl(img.url)}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Meta Column */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-[#8a7147] font-semibold">
                  {product.material || "925 Sterling Silver"}
                </span>
                <h1 className="text-3xl sm:text-4xl font-serif text-emerald-deep mt-1 leading-tight">
                  {product.name}
                </h1>
                <p className="text-xs text-neutral-500 mt-1">SKU: {product.sku}</p>

                {/* Rating summary */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(parseFloat(product.rating || 5))
                            ? "fill-amber-400 text-amber-400"
                            : "text-neutral-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-emerald-deep">
                    {parseFloat(product.rating || 5).toFixed(1)}
                  </span>
                  <span className="text-xs text-neutral-400">({product.review_count || 0} reviews)</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 py-2 border-y border-champagne/20">
                <span className="text-3xl font-serif font-bold text-emerald-deep">
                  ₹{(salePrice || price).toLocaleString("en-IN")}
                </span>
                {salePrice && (
                  <span className="text-lg text-neutral-400 line-through">
                    ₹{price.toLocaleString("en-IN")}
                  </span>
                )}
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium ml-auto">
                  Inclusive of all taxes
                </span>
              </div>

              {/* Description */}
              <div className="text-neutral-700 text-sm leading-relaxed space-y-2">
                <p>{product.description}</p>
              </div>

              {/* Dimensions & Specifications Table */}
              {(product.dimensions || product.weight_grams) && (
                <div className="bg-white p-4 rounded-2xl border border-champagne/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-deep uppercase tracking-wider">
                    <Ruler className="h-4 w-4 text-[#8a7147]" /> Specifications & Sizing
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600">
                    {product.weight_grams && (
                      <div>
                        <span className="text-neutral-400 block">Weight:</span>
                        <span className="font-medium text-emerald-deep">{product.weight_grams} g</span>
                      </div>
                    )}
                    {product.dimensions?.length && (
                      <div>
                        <span className="text-neutral-400 block">Dimensions:</span>
                        <span className="font-medium text-emerald-deep">
                          {product.dimensions.length} x {product.dimensions.width || 0} {product.dimensions.unit || "mm"}
                        </span>
                      </div>
                    )}
                    {product.size && (
                      <div>
                        <span className="text-neutral-400 block">Size / Length:</span>
                        <span className="font-medium text-emerald-deep">{product.size}</span>
                      </div>
                    )}
                    {product.dimensions?.sizeDescription && (
                      <div className="col-span-2">
                        <span className="text-neutral-400 block">Fit Details:</span>
                        <span className="font-medium text-emerald-deep">{product.dimensions.sizeDescription}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quantity & CTA */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-4">
                  <span className="text-xs uppercase tracking-wider font-semibold text-neutral-700">Quantity</span>
                  <div className="flex items-center border border-neutral-300 rounded-lg bg-white overflow-hidden">
                    <button
                      disabled={quantity <= 1 || isOutOfStock}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2.5 hover:bg-neutral-100 disabled:opacity-50 transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-4 py-1 text-sm font-semibold text-emerald-deep">{quantity}</span>
                    <button
                      disabled={quantity >= product.quantity || isOutOfStock}
                      onClick={() => setQuantity((q) => q + 1)}
                      className="p-2.5 hover:bg-neutral-100 disabled:opacity-50 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {isOutOfStock ? (
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                      Currently Out of Stock
                    </span>
                  ) : product.quantity <= (product.low_stock_threshold || 5) ? (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                      Only {product.quantity} pieces remaining
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> In Stock & Ready to Ship
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    disabled={isOutOfStock}
                    onClick={handleAddToCart}
                    className="flex-1 bg-emerald-deep text-champagne hover:bg-emerald-950 font-semibold py-4 h-auto uppercase tracking-wider text-xs shadow-lg flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="h-4 w-4" /> Add to Shopping Bag
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="border-champagne text-emerald-deep hover:bg-champagne/10 py-4 h-auto font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Share2 className="h-4 w-4" /> Share
                  </Button>
                </div>
              </div>

              {/* Guarantees */}
              <div className="border-t border-champagne/20 pt-6 grid grid-cols-3 gap-3 text-center">
                <div className="bg-white p-3 rounded-xl border border-champagne/30 flex flex-col items-center">
                  <ShieldCheck className="h-4 w-4 text-emerald-deep mb-1" />
                  <span className="text-[11px] font-semibold text-neutral-800">925 Silver Certified</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-champagne/30 flex flex-col items-center">
                  <Sparkles className="h-4 w-4 text-emerald-deep mb-1" />
                  <span className="text-[11px] font-semibold text-neutral-800">Anti-Tarnish Polish</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-champagne/30 flex flex-col items-center">
                  <Truck className="h-4 w-4 text-emerald-deep mb-1" />
                  <span className="text-[11px] font-semibold text-neutral-800">Free Insured Ship</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="mt-20 border-t border-champagne/30 pt-12 space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif text-emerald-deep">Customer Testimonials & Reviews</h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Real feedback from Kriléa patrons across India.
                </p>
              </div>

              <Button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-emerald-deep text-champagne hover:bg-emerald-950 font-semibold text-xs uppercase tracking-wider flex items-center gap-2"
              >
                <MessageSquare className="h-3.5 w-3.5" /> Write a Review
              </Button>
            </div>

            {/* Review Form Modal/Drawer */}
            {showReviewForm && (
              <form
                onSubmit={handleSubmitReview}
                className="bg-white p-6 sm:p-8 rounded-3xl border border-champagne/40 shadow-lg space-y-4 max-w-2xl mx-auto"
              >
                <h3 className="text-xl font-serif text-emerald-deep">Share Your Kriléa Experience</h3>

                {/* Rating selection */}
                <div>
                  <Label className="text-xs uppercase tracking-wider font-semibold">Overall Rating</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star className={`h-6 w-6 ${star <= reviewRating ? "fill-amber-400" : "text-neutral-300"}`} />
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-emerald-deep ml-2">{reviewRating} Stars</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs uppercase tracking-wider font-semibold">Review Headline</Label>
                  <Input
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Stunning craftsmanship, exceeded expectations!"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs uppercase tracking-wider font-semibold">Your Review Details *</Label>
                  <Textarea
                    required
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tell us about the shine, weight, packaging and how you style this piece..."
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={submittingReview}
                    className="bg-emerald-deep text-champagne font-semibold text-xs uppercase tracking-wider"
                  >
                    {submittingReview ? "Submitting..." : "Post Review"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowReviewForm(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-champagne/30 p-6">
                <Star className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                <h4 className="font-serif text-emerald-deep text-base">No reviews yet</h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Be the first to review this elegant creation and inspire fellow jewellery enthusiasts.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white p-6 rounded-2xl border border-champagne/30 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3.5 w-3.5 ${
                              s <= rev.rating ? "fill-amber-400" : "text-neutral-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-neutral-400">
                        {new Date(rev.created_at).toLocaleDateString("en-IN")}
                      </span>
                    </div>

                    {rev.title && (
                      <h4 className="font-serif font-bold text-sm text-emerald-deep">{rev.title}</h4>
                    )}

                    <p className="text-xs text-neutral-700 leading-relaxed">{rev.review_text}</p>

                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-deep">
                        {rev.first_name} {rev.last_name ? rev.last_name.charAt(0) + "." : ""}
                      </span>
                      {rev.is_verified_purchase && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Verified Buyer
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
