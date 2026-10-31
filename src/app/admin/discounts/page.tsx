"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/money";

interface Discount {
  id: string;
  name: string;
  code: string | null;
  type: "PERCENTAGE" | "AMOUNT";
  value: number;
  appliesTo: string;
  createdAt: string;
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "AMOUNT">("PERCENTAGE");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDiscounts = useCallback(async () => {
    const res = await fetch("/api/discounts");
    if (res.ok) {
      const data = await res.json();
      setDiscounts(data.data.discounts);
    }
  }, []);

  useEffect(() => {
    loadDiscounts();
  }, [loadDiscounts]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const numVal = parseFloat(value);
      const res = await fetch("/api/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          value: type === "PERCENTAGE" ? Math.round(numVal) : Math.round(numVal * 100),
          appliesTo: "ALL",
        }),
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Discounts</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name / Code</Label>
              <Input
                id="name"
                placeholder="WELCOME10"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as "PERCENTAGE" | "AMOUNT")}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="AMOUNT">Fixed Amount (₹)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">
                {type === "PERCENTAGE" ? "Percentage (e.g. 10)" : "Amount (e.g. 500)"}
              </Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Discount"}
          </Button>
        </form>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-zinc-50 dark:bg-zinc-900">
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Code</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Value</th>
                <th className="text-left px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {discounts.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    No discounts configured yet.
                  </td>
                </tr>
              )}
              {discounts.map((d) => (
                <tr key={d.id} className="border-b">
                  <td className="px-4 py-3 font-medium">{d.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{d.code || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{d.type}</Badge>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {d.type === "PERCENTAGE" ? `${d.value}%` : formatINR(d.value)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(d.createdAt).toLocaleDateString()}
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
