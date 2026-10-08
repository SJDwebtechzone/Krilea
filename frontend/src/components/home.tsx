import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { api, getAssetUrl } from "@/lib/api";
import { SiteLayout } from "@/components/SiteLayout";
import { HeroBanner } from "@/components/HeroBanner";
import { BenefitsStrip } from "@/components/BenefitsStrip";
import { SectionHeading } from "@/components/SectionHeading";
import { DatabaseCategoryGrid } from "@/components/DatabaseCategoryGrid";
import { ProductCard } from "@/components/ProductCard";

export function HomePage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get<any[]>("/collections")
      .then((data) => { if (!cancelled) setCollections(data || []); })
      .catch((error) => console.error("Failed loading collections:", error));
    api.get<any[]>("/products/bestsellers")
      .then((data) => { if (!cancelled) setProducts(data || []); })
      .catch((error) => {
        console.error("Failed loading products:", error);
        if (!cancelled) setProductsError(true);
      })
      .finally(() => { if (!cancelled) setProductsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <SiteLayout>
      <main>
        <HeroBanner image="/home/hero/krilea-hero.jpg" />
        <BenefitsStrip />

        {/* Featured database collections */}
        <section className="border-b border-champagne/30 bg-cream px-5 py-16 texture-paper sm:py-20">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Our signature lines"
              title="Explore the collections"
              subtitle="Handcrafted sterling silver essentials and contemporary fashion statements."
            />
            {collections.length > 0 && (
              <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
                {collections.map((collection) => (
                  <Link
                    key={collection.id}
                    to={`/collections/${collection.slug}` as any}
                    className="group relative flex flex-col overflow-hidden rounded-sm border border-champagne/40 bg-emerald-deep text-cream shadow-lg transition-all duration-300 hover:border-champagne hover:shadow-xl"
                  >
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-emerald-deep sm:aspect-[2170/725]">
                      {collection.banner_url && <img src={getAssetUrl(collection.banner_url)} alt={collection.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/90 via-emerald-deep/20 to-transparent" />
                    </div>
                    <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
                      <div>
                        <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-champagne">{collection.product_count} pieces</span>
                        <h3 className="mt-2 font-display text-2xl text-cream transition-colors group-hover:text-champagne sm:text-3xl">{collection.name}</h3>
                        {collection.description && <p className="mt-2 text-sm leading-relaxed text-cream/75">{collection.description}</p>}
                      </div>
                      <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-champagne">
                        <span>Shop collection</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Shop by Category */}
        <section className="bg-cream px-5 pb-8 pt-14 texture-paper sm:pb-10 sm:pt-16">
          <SectionHeading
            eyebrow="The Kriléa edit"
            title="Shop by category"
            subtitle="Discover pieces designed to become part of your everyday story."
          />
          <DatabaseCategoryGrid className="mt-12" />
        </section>

        {/* Bestsellers */}
        <section className="bg-cream px-5 pb-16 pt-6 texture-paper sm:pb-20 sm:pt-8">
          <SectionHeading
            eyebrow="Loved by our customers"
            title="Bestsellers"
            subtitle="The pieces everyone is adding to their story."
          />
          {productsLoading ? (
            <p className="py-10 text-center text-sm text-neutral-600">Loading products...</p>
          ) : productsError ? (
            <p className="py-10 text-center text-sm text-red-700">Unable to load products. Please try again.</p>
          ) : products.length === 0 ? (
            <p className="py-10 text-center text-sm text-neutral-600">No products available yet.</p>
          ) : (
            <div className="mx-auto mt-12 grid max-w-7xl grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
              {products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </section>
      </main>
    </SiteLayout>
  );
}

export default HomePage;
