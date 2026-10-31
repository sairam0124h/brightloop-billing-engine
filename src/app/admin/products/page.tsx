"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Product {
  id: string;
  name: string;
  description: string;
  active: boolean;
  createdAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadProducts() {
    const res = await fetch("/api/admin/products");
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description || undefined }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error?.message || "Failed to create product");
        return;
      }

      setName("");
      setDescription("");
      await loadProducts();
    } catch {
      setError("Failed to create product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Product Management</h1>

      <Card className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Product"}
          </Button>
        </form>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left pb-3">Name</th>
                <th className="text-left pb-3">Description</th>
                <th className="text-left pb-3">Status</th>
                <th className="text-left pb-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-3">{p.name}</td>
                  <td className="py-3">{p.description || "-"}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${p.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{p.active ? "Active" : "Inactive"}</span>
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
