import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { api, getAssetUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Upload,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({
  head: () => ({
    meta: [{ title: "Products Management | Kriléa Admin" }],
  }),
  component: AdminProductsPage,
});

interface ProductFormData {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  productCode?: string;
  description: string;
  shortDescription?: string;
  categoryId?: string;
  collectionId?: string;
  material: string;
  color?: string;
  size?: string;
  weightGrams?: number;
  price: number;
  salePrice?: number;
  quantity: number;
  lowStockThreshold: number;
  length?: number;
  width?: number;
  height?: number;
  unit: string;
  sizeDescription?: string;
  imageUrls: string[];
  isFeatured: boolean;
  isBestSeller: boolean;
  isActive: boolean;
}

const defaultForm: ProductFormData = {
  name: "",
  slug: "",
  sku: "",
  description: "",
  shortDescription: "",
  categoryId: "",
  collectionId: "",
  material: "925 Sterling Silver",
  price: 999,
  salePrice: undefined,
  quantity: 20,
  lowStockThreshold: 5,
  unit: "mm",
  imageUrls: [],
  isFeatured: false,
  isBestSeller: false,
  isActive: true,
};

function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");

  useEffect(() => {
    loadProducts();
    loadCategoriesAndCollections();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (search) params.set("search", search);
      const data = await api.get<{ products: any[] }>(`/products/admin/all?${params.toString()}`);
      setProducts(data.products || []);
    } catch (err) {
      console.error("Failed loading products:", err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoriesAndCollections = async () => {
    try {
      const [cats, cols] = await Promise.all([
        api.get<any[]>("/categories?includeInactive=true"),
        api.get<any[]>("/collections?includeInactive=true"),
      ]);
      setCategories(cats || []);
      setCollections(cols || []);
    } catch (err) {
      console.error("Failed loading categories/collections:", err);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      ...defaultForm,
      categoryId: categories[0]?.id || "",
      collectionId: collections[0]?.id || "",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p: any) => {
    setEditingId(p.id);
    const existingImages = p.images?.map((i: any) => i.url) || [];
    setFormData({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      productCode: p.product_code || "",
      description: p.description || "",
      shortDescription: p.short_description || "",
      categoryId: p.category_id || "",
      collectionId: p.collection_id || "",
      material: p.material || "925 Sterling Silver",
      color: p.color || "",
      size: p.size || "",
      weightGrams: p.weight_grams ? parseFloat(p.weight_grams) : undefined,
      price: parseFloat(p.price),
      salePrice: p.sale_price ? parseFloat(p.sale_price) : undefined,
      quantity: p.quantity,
      lowStockThreshold: p.low_stock_threshold || 5,
      length: p.dimensions?.length,
      width: p.dimensions?.width,
      height: p.dimensions?.height,
      unit: p.dimensions?.unit || "mm",
      sizeDescription: p.dimensions?.sizeDescription || "",
      imageUrls: existingImages,
      isFeatured: !!p.is_featured,
      isBestSeller: !!p.is_best_seller,
      isActive: p.is_active ?? true,
    });
    setShowModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...formData,
      slug: formData.slug.trim() || undefined,
      categoryId: formData.categoryId || null,
      collectionId: formData.collectionId || null,
    };
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        toast.success("Product updated successfully.");
      } else {
        await api.post("/products", payload);
        toast.success("Product created successfully.");
      }
      setShowModal(false);
      await loadProducts();
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted.");
      await loadProducts();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product");
    }
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleAddImageUrl = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    const trimmed = imageUrlInput.trim();
    if (!trimmed) {
      toast.error("Please enter a valid image URL or path.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      imageUrls: [...prev.imageUrls, trimmed],
    }));
    setImageUrlInput("");
    toast.success("Image URL added.");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      if (files.length === 1) {
        const data = new FormData();
        data.append("image", files[0]);
        const res = await api.upload<{ url: string }>("/upload/single", data);
        if (res.url) {
          const fullUrl = getAssetUrl(res.url);
          setFormData((prev) => ({
            ...prev,
            imageUrls: [...prev.imageUrls, fullUrl],
          }));
          toast.success("Image uploaded successfully.");
        }
      } else {
        const data = new FormData();
        for (let i = 0; i < files.length; i++) {
          data.append("images", files[i]);
        }
        const res = await api.upload<Array<{ url: string }>>("/upload/multiple", data);
        if (Array.isArray(res)) {
          const urls = res.map((r) => getAssetUrl(r.url));
          setFormData((prev) => ({
            ...prev,
            imageUrls: [...prev.imageUrls, ...urls],
          }));
          toast.success(`${urls.length} images uploaded.`);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleRemoveImageUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, idx) => idx !== index),
    }));
    toast.info("Image removed.");
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-champagne/30 pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#8a7147] font-semibold">
            Catalogue Management
          </span>
          <h1 className="text-3xl font-serif text-emerald-deep mt-1">Products ({products.length})</h1>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-emerald-deep text-champagne hover:bg-emerald-950 font-semibold text-xs uppercase tracking-wider flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add New Piece
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-champagne/30 shadow-sm max-w-md">
        <Search className="h-4 w-4 text-neutral-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loadProducts()}
          placeholder="Search product by name, SKU or material..."
          className="w-full text-xs outline-none bg-transparent"
        />
        {search && (
          <button onClick={() => { setSearch(""); loadProducts(); }} className="text-neutral-400 hover:text-neutral-600">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-champagne/30 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-deep" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fcfaf7] border-b border-champagne/20 text-neutral-600 uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Collection</th>
                  <th className="py-3.5 px-4">Price (INR)</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {loadError ? (
                  <tr><td colSpan={8} className="py-10 text-center text-sm text-red-700">Unable to load products. Please try again.</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={8} className="py-10 text-center text-sm text-neutral-500">No products found.</td></tr>
                ) : products.map((p) => {
                  const primaryImg = p.images?.find((img: any) => img.isPrimary)?.url || p.images?.[0]?.url;
                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {primaryImg ? (
                            <img src={getAssetUrl(primaryImg)} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-neutral-200 shrink-0" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
                          ) : (
                            <div className="w-10 h-10 rounded-lg border border-neutral-200 shrink-0 grid place-items-center text-neutral-400"><Package className="h-4 w-4" /></div>
                          )}
                          <div>
                            <span className="font-serif font-medium text-emerald-deep block">{p.name}</span>
                            <span className="text-[11px] text-neutral-400">{p.material}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-600">{p.sku}</td>
                      <td className="py-3 px-4">{p.category_name || "—"}</td>
                      <td className="py-3 px-4">{p.collection_name || "—"}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-neutral-900">
                          ₹{parseFloat(p.sale_price || p.price).toLocaleString("en-IN")}
                        </span>
                        {p.sale_price && (
                          <span className="text-[10px] text-neutral-400 line-through ml-1.5">
                            ₹{parseFloat(p.price).toLocaleString("en-IN")}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                            p.quantity <= 0
                              ? "bg-red-100 text-red-800"
                              : p.quantity <= (p.low_stock_threshold || 5)
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {p.quantity} units
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {p.is_active ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                            <CheckCircle2 className="h-3 w-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400 font-medium">
                            <XCircle className="h-3 w-3" /> Draft
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Button
                          onClick={() => handleOpenEdit(p)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-neutral-600 hover:text-emerald-deep"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-neutral-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Creation / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-champagne/40 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-champagne/20 pb-4">
              <h2 className="text-2xl font-serif text-emerald-deep">
                {editingId ? "Edit Jewellery Piece" : "Add New Jewellery Piece"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6">
              {/* Row 1: Name & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Product Name *</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Emerald Charm Necklace"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">SKU (Stock Keeping Unit) *</Label>
                  <Input
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. KRL-ECN-01"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Row 2: Category & Collection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Category</Label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full mt-1 border border-neutral-300 rounded-lg p-2 text-xs bg-white"
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Collection</Label>
                  <select
                    value={formData.collectionId}
                    onChange={(e) => setFormData({ ...formData, collectionId: e.target.value })}
                    className="w-full mt-1 border border-neutral-300 rounded-lg p-2 text-xs bg-white"
                  >
                    <option value="">Select Collection...</option>
                    {collections.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Pricing & Quantity */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Base Price (INR) *</Label>
                  <Input
                    type="number"
                    required
                    min={1}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Sale Price (INR)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.salePrice ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salePrice: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    placeholder="Optional"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Stock Quantity *</Label>
                  <Input
                    type="number"
                    required
                    min={0}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 0 })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Low Stock Threshold</Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value, 10) || 5 })}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-xs font-semibold">Product Description *</Label>
                <Textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of craftsmanship, stones, and inspiration..."
                  className="mt-1"
                />
              </div>

              {/* Material & Sizing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Material / Metal *</Label>
                  <Input
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    placeholder="e.g. 925 Sterling Silver"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Weight (grams)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.weightGrams ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weightGrams: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    placeholder="e.g. 4.85"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Size / Length</Label>
                  <Input
                    value={formData.size || ""}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder="e.g. 18 inches / Free Size"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Images */}
              <div className="space-y-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-emerald-deep uppercase tracking-wider">
                    Product Images ({formData.imageUrls.length})
                  </Label>
                  <span className="text-[11px] text-neutral-500">First image is the primary cover</span>
                </div>

                {/* Direct File Upload */}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-emerald-deep text-champagne text-xs font-semibold rounded-lg cursor-pointer hover:bg-emerald-950 transition-colors shadow-sm">
                    {uploadingImage ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    <span>{uploadingImage ? "Uploading..." : "Upload from Device"}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={uploadingImage}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-neutral-400">or enter image URL / path below:</span>
                </div>

                {/* URL Input */}
                <div className="flex gap-2">
                  <Input
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddImageUrl(e);
                      }
                    }}
                    placeholder="https://... or /uploads/product-image.jpg"
                    className="text-xs bg-white"
                  />
                  <Button
                    type="button"
                    onClick={(e) => handleAddImageUrl(e)}
                    className="bg-emerald-deep hover:bg-emerald-950 text-champagne text-xs font-semibold shrink-0"
                  >
                    Add Image URL
                  </Button>
                </div>

                {/* Image Thumbnails */}
                {formData.imageUrls.length > 0 ? (
                  <div className="flex flex-wrap gap-3 pt-2">
                    {formData.imageUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-champagne/40 bg-white shadow-xs group"
                      >
                        <img src={getAssetUrl(url)} alt="" className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-emerald-deep/90 text-champagne text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                            Cover
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImageUrl(idx)}
                          className="absolute inset-0 bg-red-950/80 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="text-[9px] font-medium">Remove</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 italic pt-1">
                    No images added yet. Upload from device or paste a URL to add product imagery.
                  </p>
                )}
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  />
                  Featured Product
                </label>
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                  />
                  Bestseller Tag
                </label>
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Published (Active on Store)
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-deep text-champagne hover:bg-emerald-950 font-semibold text-xs uppercase tracking-wider"
                >
                  {saving ? "Saving Piece..." : "Save Jewellery Piece"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
