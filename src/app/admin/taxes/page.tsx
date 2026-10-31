"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Tax {
  id: string;
  name: string;
  rate: number;
  active: boolean;
  createdAt: string;
}

export default function TaxesPage() {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [name, setName] = useState("");
  const [rate, setRate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadTaxes() {
    const res = await fetch("/api/admin/taxes");
    if (res.ok) {
      const data = await res.json();
      setTaxes(data.taxes);
    }
  }

  useEffect(() => {
    loadTaxes();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    setLoading(true);
    try {
      const res = await fetch("/api/admin/taxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rate: parseFloat(rate) }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error?.message || "Failed to create tax");
        return;
      }

      setName("");
      setRate("");
      await loadTaxes();
    } catch {
      setError("Failed to create tax");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Tax Management</h1>

      <Card className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate">Rate (%)</Label>
            <Input id="rate" type="number" step="0.01" required value={rate} onChange={(e) => setRate(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Tax"}
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
                <th className="text-left pb-3">Rate</th>
                <th className="text-left pb-3">Status</th>
                <th className="text-left pb-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {taxes.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="py-3">{t.name}</td>
                  <td className="py-3">{t.rate}%</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${t.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{t.active ? "Active" : "Inactive"}</span>
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
