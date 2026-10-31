"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Tax {
  id: string;
  code: string;
  name: string;
  rate: number;
  isActive: boolean;
  createdAt: string;
}

export default function TaxesPage() {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [rate, setRate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadTaxes = useCallback(async () => {
    const res = await fetch("/api/taxes");
    if (res.ok) {
      const data = await res.json();
      setTaxes(data.data.taxes);
    }
  }, []);

  useEffect(() => {
    loadTaxes();
  }, [loadTaxes]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/taxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.toUpperCase().trim(),
          name,
          rate: parseFloat(rate),
          isActive: true,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error?.message || "Failed to create tax");
        return;
      }

      setCode("");
      setName("");
      setRate("");
      await loadTaxes();
    } catch {
      setError("Failed to create tax");
    } finally {
      setLoading(false);
    }
  }

  async function deleteTax(id: string) {
    if (!confirm("Delete this tax?")) return;
    await fetch(`/api/taxes/${id}`, { method: "DELETE" });
    await loadTaxes();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Taxes</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Tax Code</Label>
              <Input id="code" placeholder="GST_18" required value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="GST 18%" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Rate (%)</Label>
              <Input id="rate" type="number" step="0.01" placeholder="18" required value={rate} onChange={(e) => setRate(e.target.value)} />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Tax"}
          </Button>
        </form>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-zinc-50 dark:bg-zinc-900">
                <th className="text-left px-4 py-3 font-medium">Code</th>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Rate</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {taxes.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    No taxes configured yet.
                  </td>
                </tr>
              )}
              {taxes.map((t) => (
                <tr key={t.id} className="border-b">
                  <td className="px-4 py-3 font-mono font-medium">{t.code}</td>
                  <td className="px-4 py-3">{t.name}</td>
                  <td className="px-4 py-3 font-medium">{t.rate}%</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.isActive ? "default" : "secondary"}>
                      {t.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="destructive" size="sm" onClick={() => deleteTax(t.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
