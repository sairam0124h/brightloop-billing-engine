"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  active: boolean;
  createdAt: string;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [interval, setInterval] = useState("MONTHLY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadPlans() {
    const res = await fetch("/api/admin/plans");
    if (res.ok) {
      const data = await res.json();
      setPlans(data.plans);
    }
  }

  useEffect(() => {
    loadPlans();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    setLoading(true);
    try {
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price: parseInt(price), interval }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error?.message || "Failed to create plan");
        return;
      }

      setName("");
      setPrice("");
      await loadPlans();
    } catch {
      setError("Failed to create plan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Plan Management</h1>

      <Card className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price (in cents)</Label>
            <Input id="price" type="number" required value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interval">Interval</Label>
            <select id="interval" value={interval} onChange={(e) => setInterval(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2">
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Plan"}
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
                <th className="text-left pb-3">Price</th>
                <th className="text-left pb-3">Interval</th>
                <th className="text-left pb-3">Status</th>
                <th className="text-left pb-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-3">{p.name}</td>
                  <td className="py-3">${(p.price / 100).toFixed(2)}</td>
                  <td className="py-3">{p.interval}</td>
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
