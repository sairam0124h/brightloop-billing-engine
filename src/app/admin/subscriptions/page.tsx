"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/money";

interface Customer {
  id: string;
  email: string;
  name: string | null;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  billingInterval: string;
}

interface Product {
  id: string;
  name: string;
  salesPrice: number;
}

interface SubscriptionLine {
  id: string;
  productId: string | null;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

interface Subscription {
  id: string;
  number: number;
  customerId: string;
  customer: { id: string; email: string; name: string | null };
  planId: string;
  plan: { id: string; name: string; billingInterval: string };
  startDate: string;
  expiryDate: string | null;
  status: "DRAFT" | "QUOTATION" | "CONFIRMED" | "ACTIVE" | "PAUSED" | "CLOSED";
  paymentTerms: number;
  nextBillingDate: string | null;
  lines: SubscriptionLine[];
  createdAt: string;
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Form states
  const [formCustomer, setFormCustomer] = useState("");
  const [formPlan, setFormPlan] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formProduct, setFormProduct] = useState("");
  const [formQuantity, setFormQuantity] = useState("1");
  const [formPrice, setFormPrice] = useState("");

  const loadSubscriptions = useCallback(async () => {
    const url = selectedStatus === "ALL" ? "/api/subscriptions" : `/api/subscriptions?status=${selectedStatus}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setSubscriptions(data.data.subscriptions);
    }
  }, [selectedStatus]);

  useEffect(() => {
    loadSubscriptions();
    setFormStartDate(new Date().toISOString().split("T")[0]);
  }, [loadSubscriptions]);

  useEffect(() => {
    fetch("/api/customers").then((r) => r.json()).then((d) => setCustomers(d.data?.customers || []));
    fetch("/api/plans").then((r) => r.json()).then((d) => setPlans(d.data?.plans || []));
    fetch("/api/products").then((r) => r.json()).then((d) => setProducts(d.data?.products || []));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const selectedProd = products.find((p) => p.id === formProduct);
      const unitPrice = formPrice ? Math.round(Number(formPrice) * 100) : (selectedProd?.salesPrice || 0);

      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: formCustomer,
          planId: formPlan,
          startDate: new Date(formStartDate).toISOString(),
          paymentTerms: 15,
          lines: [
            {
              productId: formProduct || undefined,
              quantity: parseInt(formQuantity) || 1,
              unitPrice,
            },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error?.message || "Failed to create subscription");
        return;
      }

      setShowCreate(false);
      setFormCustomer("");
      setFormPlan("");
      setFormProduct("");
      setFormPrice("");
      await loadSubscriptions();
    } catch {
      setError("Failed to create subscription");
    } finally {
      setLoading(false);
    }
  }

  async function handleTransition(id: string, to: string) {
    setActionLoading(id + to);
    try {
      const res = await fetch(`/api/subscriptions/${id}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to }),
      });
      if (res.ok) {
        await loadSubscriptions();
      } else {
        const err = await res.json();
        alert(err.error?.message || "Transition failed");
      }
    } finally {
      setActionLoading(null);
    }
  }

  const statusColors: Record<string, string> = {
    DRAFT: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
    QUOTATION: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    CONFIRMED: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    ACTIVE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    PAUSED: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    CLOSED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <Button onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? "Cancel" : "New Subscription"}
        </Button>
      </div>

      {showCreate && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Create Subscription</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <select
                  id="customer"
                  required
                  value={formCustomer}
                  onChange={(e) => setFormCustomer(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select Customer...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name ? `${c.name} (${c.email})` : c.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan">Plan</Label>
                <select
                  id="plan"
                  required
                  value={formPlan}
                  onChange={(e) => setFormPlan(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select Plan...</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatINR(p.price)} / {p.billingInterval.toLowerCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  required
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="font-medium text-sm mb-3">Subscription Line Item</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Product</Label>
                  <select
                    id="product"
                    value={formProduct}
                    onChange={(e) => {
                      setFormProduct(e.target.value);
                      const prod = products.find((p) => p.id === e.target.value);
                      if (prod) setFormPrice((prod.salesPrice / 100).toString());
                    }}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select Product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({formatINR(p.salesPrice)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    required
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Unit Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Save Subscription"}
            </Button>
            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          </form>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["ALL", "DRAFT", "QUOTATION", "CONFIRMED", "ACTIVE", "PAUSED", "CLOSED"].map((s) => (
          <Button
            key={s}
            variant={selectedStatus === s ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStatus(s)}
          >
            {s}
          </Button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-zinc-50 dark:bg-zinc-900">
                <th className="text-left px-4 py-3 font-medium">Sub #</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">Plan</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Start Date</th>
                <th className="text-left px-4 py-3 font-medium">Next Billing</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    No subscriptions found.
                  </td>
                </tr>
              )}
              {subscriptions.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="px-4 py-3 font-mono font-medium">SUB-{s.number}</td>
                  <td className="px-4 py-3">
                    <div>{s.customer?.name || "Customer"}</div>
                    <div className="text-xs text-muted-foreground">{s.customer?.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{s.plan?.name}</div>
                    <div className="text-xs text-muted-foreground">{s.plan?.billingInterval}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[s.status] || ""}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(s.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.nextBillingDate ? new Date(s.nextBillingDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    {/* Status Flow Actions */}
                    {s.status === "DRAFT" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actionLoading === s.id + "QUOTATION"}
                        onClick={() => handleTransition(s.id, "QUOTATION")}
                      >
                        Quotation
                      </Button>
                    )}
                    {s.status === "QUOTATION" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionLoading === s.id + "CONFIRMED"}
                          onClick={() => handleTransition(s.id, "CONFIRMED")}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={actionLoading === s.id + "CLOSED"}
                          onClick={() => handleTransition(s.id, "CLOSED")}
                        >
                          Close
                        </Button>
                      </>
                    )}
                    {s.status === "CONFIRMED" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          disabled={actionLoading === s.id + "ACTIVE"}
                          onClick={() => handleTransition(s.id, "ACTIVE")}
                        >
                          Activate
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={actionLoading === s.id + "CLOSED"}
                          onClick={() => handleTransition(s.id, "CLOSED")}
                        >
                          Close
                        </Button>
                      </>
                    )}
                    {s.status === "ACTIVE" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionLoading === s.id + "PAUSED"}
                          onClick={() => handleTransition(s.id, "PAUSED")}
                        >
                          Pause
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={actionLoading === s.id + "CLOSED"}
                          onClick={() => handleTransition(s.id, "CLOSED")}
                        >
                          Close
                        </Button>
                      </>
                    )}
                    {s.status === "PAUSED" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionLoading === s.id + "ACTIVE"}
                          onClick={() => handleTransition(s.id, "ACTIVE")}
                        >
                          Resume
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={actionLoading === s.id + "CLOSED"}
                          onClick={() => handleTransition(s.id, "CLOSED")}
                        >
                          Close
                        </Button>
                      </>
                    )}
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
