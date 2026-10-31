"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/money";

interface Variant {
  id: string;
  attribute: string;
  value: string;
  extraPrice: number;
}

interface Product {
  id: string;
  name: string;
  type: string;
  salesPrice: number;
  costPrice: number;
  notes: string | null;
  variants: Variant[];
  createdAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [salesPrice, setSalesPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [varAttr, setVarAttr] = useState("");
  const [varVal, setVarVal] = useState("");
  const [varPrice, setVarPrice] = useState("");

  const loadProducts = useCallback(async () => {
    const res = await fetch("/api/products");
    if (res.ok) {
      const data = await res.json();
      setProducts(data.data.products);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          salesPrice: Math.round(Number(salesPrice) * 100),
          costPrice: Math.round(Number(costPrice) * 100),
          notes: notes || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error?.message || "Failed to create product");
        return;
      }
      setName(""); setSalesPrice(""); setCostPrice(""); setNotes("");
      await loadProducts();
    } catch {
      setError("Failed to create product");
    } finally {
      setLoading(false);
    }
  }

  async function addVariant(productId: string) {
    if (!varAttr || !varVal) return;
    const res = await fetch(`/api/products/${productId}/variants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attribute: varAttr,
        value: varVal,
        extraPrice: Math.round(Number(varPrice || 0) * 100),
      }),
    });
    if (res.ok) {
      setVarAttr(""); setVarVal(""); setVarPrice("");
      await loadProducts();
    }
  }

  async function deleteVariant(productId: string, variantId: string) {
    await fetch(`/api/products/${productId}/variants?variantId=${variantId}`, { method: "DELETE" });
    await loadProducts();
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    await loadProducts();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Products</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salesPrice">Sales Price (₹)</Label>
              <Input id="salesPrice" type="number" step="0.01" required value={salesPrice} onChange={(e) => setSalesPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="costPrice">Cost Price (₹)</Label>
              <Input id="costPrice" type="number" step="0.01" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
          <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Product"}</Button>
        </form>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </Card>

      <div className="space-y-3">
        {products.length === 0 && <p className="text-muted-foreground text-center py-8">No products yet.</p>}
        {products.map((p) => (
          <Card key={p.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Sales: {formatINR(p.salesPrice)} · Cost: {formatINR(p.costPrice)}
                  {p.variants.length > 0 && <span> · {p.variants.length} variant(s)</span>}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
                  {expandedId === p.id ? "Hide" : "Variants"}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteProduct(p.id)}>Delete</Button>
              </div>
            </div>

            {expandedId === p.id && (
              <div className="mt-4 border-t pt-4 space-y-3">
                {p.variants.map((v) => (
                  <div key={v.id} className="flex items-center gap-2">
                    <Badge variant="secondary">{v.attribute}: {v.value}</Badge>
                    <span className="text-sm text-muted-foreground">+{formatINR(v.extraPrice)}</span>
                    <Button variant="ghost" size="sm" onClick={() => deleteVariant(p.id, v.id)}>×</Button>
                  </div>
                ))}
                <div className="flex gap-2 items-end">
                  <div className="space-y-1">
                    <Label className="text-xs">Attribute</Label>
                    <Input placeholder="Brand" value={varAttr} onChange={(e) => setVarAttr(e.target.value)} className="h-8" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Value</Label>
                    <Input placeholder="Odoo" value={varVal} onChange={(e) => setVarVal(e.target.value)} className="h-8" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Extra (₹)</Label>
                    <Input type="number" step="0.01" placeholder="0" value={varPrice} onChange={(e) => setVarPrice(e.target.value)} className="h-8" />
                  </div>
                  <Button size="sm" onClick={() => addVariant(p.id)}>Add</Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
