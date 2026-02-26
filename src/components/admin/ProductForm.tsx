import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload, X, ImagePlus } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: Category[];
  editingProduct?: any | null;
  onSaved: () => void;
  onCancel: () => void;
}

export default function ProductForm({ categories, editingProduct, onSaved, onCancel }: ProductFormProps) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: editingProduct?.name || "",
    description: editingProduct?.description || "",
    price: editingProduct ? String(editingProduct.price) : "",
    sale_price: editingProduct?.sale_price ? String(editingProduct.sale_price) : "",
    image_url: editingProduct?.image_url || "",
    stock: editingProduct ? String(editingProduct.stock) : "",
    featured: editingProduct?.featured || false,
    category_id: editingProduct?.category_id || "",
  });

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Please upload an image file" });
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    const { error } = await supabase.storage.from("product-images").upload(fileName, file);
    if (error) {
      toast({ variant: "destructive", title: "Upload failed", description: error.message });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
    setForm({ ...form, image_url: urlData.publicUrl });
    setUploading(false);
    toast({ title: "Image uploaded!" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast({ variant: "destructive", title: "Name and price are required" });
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      image_url: form.image_url,
      stock: parseInt(form.stock) || 0,
      featured: form.featured,
      category_id: form.category_id || null,
    };

    if (editingProduct) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
      if (error) { toast({ variant: "destructive", title: "Error", description: error.message }); setSaving(false); return; }
      toast({ title: "✅ Product updated!" });
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) { toast({ variant: "destructive", title: "Error", description: error.message }); setSaving(false); return; }
      toast({ title: "✅ Product added!" });
    }
    setSaving(false);
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Image Upload */}
      <div>
        <Label className="mb-2 block">Product Image</Label>
        <div className="flex items-start gap-4">
          <div className="w-28 h-28 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 flex items-center justify-center overflow-hidden shrink-0">
            {form.image_url ? (
              <div className="relative w-full h-full group">
                <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, image_url: "" })}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <ImagePlus className="h-8 w-8 text-muted-foreground/50" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <label className="cursor-pointer">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm font-medium">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "Uploading..." : "Upload Image"}
              </div>
            </label>
            <p className="text-xs text-muted-foreground">Or paste image URL below</p>
            <Input
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="text-xs"
            />
          </div>
        </div>
      </div>

      {/* Name */}
      <div>
        <Label>Product Name *</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Cotton T-Shirt" required />
      </div>

      {/* Description */}
      <div>
        <Label>Description</Label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your product..." rows={3} />
      </div>

      {/* Price Row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Price (Rs.) *</Label>
          <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="1500" required />
        </div>
        <div>
          <Label>Sale Price (Rs.)</Label>
          <Input type="number" step="0.01" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} placeholder="Optional" />
        </div>
      </div>

      {/* Stock & Category */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Stock Quantity</Label>
          <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="10" />
        </div>
        <div>
          <Label>Category</Label>
          <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Featured */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
        <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
        <div>
          <Label className="cursor-pointer">Featured Product</Label>
          <p className="text-xs text-muted-foreground">Show on homepage featured section</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {editingProduct ? "Update Product" : "Add Product"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
