import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CategoryCard } from "@/components/CategoryCard";

export function DatabaseCategoryGrid({ className = "" }: { className?: string }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get<any[]>("/categories")
      .then((data) => { if (!cancelled) setCategories(data || []); })
      .catch((requestError) => {
        console.error("Failed loading categories:", requestError);
        if (!cancelled) setError(true);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <p className="py-8 text-center text-sm text-neutral-600">Loading categories...</p>;
  if (error) return <p className="py-8 text-center text-sm text-red-700">Unable to load categories. Please try again.</p>;
  if (categories.length === 0) return <p className="py-8 text-center text-sm text-neutral-600">No categories available.</p>;

  return (
    <div className={`mx-auto grid max-w-7xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 ${className}`}>
      {categories.map((category) => <CategoryCard key={category.id} category={category} />)}
    </div>
  );
}