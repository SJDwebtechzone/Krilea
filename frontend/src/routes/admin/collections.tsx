import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Plus, Edit2, Trash2, CheckCircle2, XCircle, Loader2, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/collections")({
  head: () => ({
    meta: [{ title: "Collections Management | Kriléa Admin" }],
  }),
  component: AdminCollectionsPage,
});

function AdminCollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const data = await api.get<any[]>("/collections?includeInactive=true");
      setCollections(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setBannerUrl("");
    setIsActive(true);
    setShowModal(true);
  };

  const handleOpenEdit = (col: any) => {
    setEditingId(col.id);
    setName(col.name);
    setSlug(col.slug);
    setDescription(col.description || "");
    setBannerUrl(col.banner_url || "");
    setIsActive(col.is_active ?? true);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name,
        slug: slug || undefined,
        description: description || undefined,
        bannerUrl: bannerUrl || undefined,
        isActive,
      };

      if (editingId) {
        await api.put(`/collections/${editingId}`, payload);
        toast.success("Collection updated.");
      } else {
        await api.post("/collections", payload);
        toast.success("Collection created.");
      }
      setShowModal(false);
      loadCollections();
    } catch (err: any) {
      toast.error(err.message || "Failed to save collection");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete collection "${name}"?`)) return;
    try {
      await api.delete(`/collections/${id}`);
      toast.success("Collection deleted.");
      loadCollections();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete collection");
    }
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-champagne/30 pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#8a7147] font-semibold">Edits & Themes</span>
          <h1 className="text-3xl font-serif text-emerald-deep mt-1">Collections ({collections.length})</h1>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-emerald-deep text-champagne hover:bg-emerald-950 font-semibold text-xs uppercase tracking-wider flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Collection
        </Button>
      </div>

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
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4">Products Count</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {collections.map((col) => (
                  <tr key={col.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 font-serif font-semibold text-emerald-deep text-sm">{col.name}</td>
                    <td className="py-3 px-4 font-mono text-neutral-500">{col.slug}</td>
                    <td className="py-3 px-4">{col.product_count || 0} pieces</td>
                    <td className="py-3 px-4">
                      {col.is_active ? (
                        <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="text-[11px] text-neutral-400 font-medium flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Button
                        onClick={() => handleOpenEdit(col)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-neutral-600 hover:text-emerald-deep"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(col.id, col.name)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-neutral-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-champagne/40 shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-champagne/20 pb-3">
              <h2 className="text-xl font-serif text-emerald-deep">{editingId ? "Edit Collection" : "New Collection"}</h2>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <Label className="text-xs">Collection Name *</Label>
                <Input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Slug</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. silver-collection" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="colActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <Label htmlFor="colActive" className="cursor-pointer">Active / Published</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="bg-emerald-deep text-champagne font-semibold">
                  {saving ? "Saving..." : "Save Collection"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
