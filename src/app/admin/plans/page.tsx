"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/money";

interface Plan {
  id: string;
  name: string;
  price: number;
  billingInterval: string;
  minQuantity: number;
  autoClose: boolean;
  closable: boolean;
  pausable: boolean;
  renewable: boolean;
  createdAt: string;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [interval, setInterval] = useState("MONTHLY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadPlans = useCallback(async () => {
    const res = await fetch("/api/plans");
    if (res.ok) {
      const data = await res.json();
      setPlans(data.data.plans);
    }
  }, []);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Math.round(Number(price) * 100),
          billingInterval: interval,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error?.message || "Failed to create plan");
        return;
      }
      setName(""); setPrice("");
      await loadPlans();
    } catch {
      setError("Failed to create plan");
    } finally {
      setLoading(false);
    }
  }

  async function deletePlan(id: string) {
    if (!confirm("Delete this plan?")) return;
    await fetch(`/api/plans/${id}`, { method: "DELETE" });
    await loadPlans();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Plans</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input id="price" type="number" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interval">Interval</Label>
              <select id="interval" value={interval} onChange={(e) => setInterval(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          </div>
          <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Plan"}</Button>
        </form>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-zinc-50 dark:bg-zinc-900">
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Price</th>
                <th className="text-left px-4 py-3 font-medium">Interval</th>
                <th className="text-left px-4 py-3 font-medium">Features</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No plans yet.</td></tr>
              )}
              {plans.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">{formatINR(p.price)}</td>
                  <td className="px-4 py-3"><Badge variant="secondary">{p.billingInterval}</Badge></td>
                  <td className="px-4 py-3 space-x-1">
                    {p.pausable && <Badge variant="outline">Pausable</Badge>}
                    {p.closable && <Badge variant="outline">Closable</Badge>}
                    {p.renewable && <Badge variant="outline">Renewable</Badge>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="destructive" size="sm" onClick={() => deletePlan(p.id)}>Delete</Button>
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
