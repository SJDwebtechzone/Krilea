import { useEffect, useState } from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { ImageOff, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/collections/$slug")({
  head: () => ({ meta: [{ title: "Collection | Kriléa" }] }),
  component: CollectionProductsPage,
});

function CollectionProductsPage() {
  const { slug } = useParams({ from: "/collections/$slug" });
  const [entity, setEntity] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState("created_desc");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCollection() {
      setLoading(true);
      setError(false);
      setNotFound(false);
      try {
        const requestOrMissing = async (path: string) => {
          try {
            return await api.get<any>(path);
          } catch (requestError: any) {
            if (requestError.status === 404) return null;
            throw requestError;
          }
        };

        const category = await requestOrMissing(`/categories/${encodeURIComponent(slug)}`);
        const collection = category ? null : await requestOrMissing(`/collections/${encodeURIComponent(slug)}`);
        const selected = category || collection;
        if (!selected || selected.is_active === false) {
          if (!cancelled) setNotFound(true);
          return;
        }

        const filterName = category ? "category" : "collection";
        const params = new URLSearchParams({
          [filterName]: selected.slug,
          page: String(page),
          limit: "24",
          sort,
        });
        if (inStockOnly) params.set("inStock", "true");
        const result = await api.get<{ products: any[]; pagination: { total: number; totalPages: number } }>(
          `/products?${params.toString()}`
        );

        if (!cancelled) {
          setEntity({ ...selected, kind: category ? "category" : "collection" });
          setProducts(result.products || []);
          setTotal(result.pagination.total);
          setTotalPages(result.pagination.totalPages);
        }
      } catch (loadError) {
        console.error("Failed loading collection products:", loadError);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadCollection();
    return () => { cancelled = true; };
  }, [slug, page, sort, inStockOnly]);

  return (
    <SiteLayout>
      <main className="min-h-[70vh] bg-cream px-5 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <header className="border-b border-champagne/35 pb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7147]">Kriléa collection</p>
            <h1 className="mt-2 font-display text-3xl text-emerald-deep sm:text-4xl">{entity?.name || "Collection"}</h1>
            {entity?.description && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600">{entity.description}</p>}
            <p className="mt-3 text-xs text-neutral-500">{total} {total === 1 ? "piece" : "pieces"}</p>
          </header>

          {!loading && !error && !notFound && (
            <div className="flex flex-wrap items-center justify-between gap-4 py-5">
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <input type="checkbox" checked={inStockOnly} onChange={(event) => { setPage(1); setInStockOnly(event.target.checked); }} />
                In stock
              </label>
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                Sort
                <select value={sort} onChange={(event) => { setPage(1); setSort(event.target.value); }} className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm">
                  <option value="created_desc">Newest</option>
                  <option value="price_asc">Price: low to high</option>
                  <option value="price_desc">Price: high to low</option>
                  <option value="name_asc">Name</option>
                </select>
              </label>
            </div>
          )}

          {loading ? (
            <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-neutral-600">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading products...
            </div>
          ) : error ? (
            <div className="py-20 text-center text-sm text-red-700">Unable to load products. Please try again.</div>
          ) : notFound ? (
            <div className="py-20 text-center text-sm text-neutral-600">Collection not found.</div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center text-neutral-600">
              <ImageOff className="h-8 w-8 text-neutral-400" />
              <p className="text-sm">No products found in this collection.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
                {products.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-4">
                  <button disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded border border-champagne px-4 py-2 text-sm disabled:opacity-40">Previous</button>
                  <span className="text-sm text-neutral-600">Page {page} of {totalPages}</span>
                  <button disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)} className="rounded border border-champagne px-4 py-2 text-sm disabled:opacity-40">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </SiteLayout>
  );
}