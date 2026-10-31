"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Discount {
  id: string;
  name: string;
  type: "PERCENTAGE" | "AMOUNT";
  value: number;
  active: boolean;
  createdAt: string;
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("PERCENTAGE");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadDiscounts() {
    const res = await fetch("/api/admin/discounts");
    if (res.ok) {
      const data = await res.json();
      setDiscounts(data.discounts);
    }
  }

  useEffect(() => {
    loadDiscounts();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    setLoading(true);
    try {
      const res = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, value: parseFloat(value) }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error?.message || "Failed to create discount");
        return;
      }

      setName("");
      setValue("");
      await loadDiscounts();
    } catch {
      setError("Failed to create discount");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Discount Management</h1>

      <Card className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <select id="type" value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2">
              <option value="PERCENTAGE">Percentage</option>
              <option value="AMOUNT">Amount</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Value</Label>
            <Input id="value" type="number" step="0.01" required value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Discount"}
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
                <th className="text-left pb-3">Type</th>
                <th className="text-left pb-3">Value</th>
                <th className="text-left pb-3">Status</th>
                <th className="text-left pb-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="py-3">{d.name}</td>
                  <td className="py-3">{d.type}</td>
                  <td className="py-3">{d.type === "PERCENTAGE" ? `${d.value}%` : `$${(d.value / 100).toFixed(2)}`}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${d.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{d.active ? "Active" : "Inactive"}</span>
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">{new Date(d.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
