"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/money";

interface Subscription {
  id: string;
  productName: string;
  planName: string;
  interval: string;
  status: string;
  periodStart: string;
  periodEnd: string;
  dueDate?: string;
  amount?: number;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/portal/subscriptions")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load subscriptions");
        return res.json();
      })
      .then((data) => setSubscriptions(data.data?.subscriptions || data.subscriptions || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const activeCount = subscriptions.filter((s) => s.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Subscriptions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your active services, plan renewal dates, and billing schedules.
          </p>
        </div>
        <Link href="/portal/invoices">
          <Button variant="outline" size="sm">
            View My Invoices
          </Button>
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase">Active Plans</p>
          <p className="text-2xl font-bold mt-1 text-emerald-600">{activeCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase">Total Subscribed</p>
          <p className="text-2xl font-bold mt-1">{subscriptions.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase">Account Status</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">Active</p>
        </Card>
      </div>

      {loading && <p className="text-sm text-muted-foreground py-4">Loading your subscriptions...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-zinc-50 dark:bg-zinc-900">
                  <th className="text-left px-4 py-3 font-medium">Service / Plan</th>
                  <th className="text-left px-4 py-3 font-medium">Billing Cycle</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Billing Period</th>
                  <th className="text-left px-4 py-3 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 font-medium">Next Due</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground text-sm">
                      No subscriptions found for your account. Contact support to activate a plan.
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b">
                      <td className="px-4 py-3">
                        <div className="font-semibold">{sub.planName}</div>
                        <div className="text-xs text-muted-foreground">{sub.productName}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{sub.interval}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          sub.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(sub.periodStart).toLocaleDateString()} — {new Date(sub.periodEnd).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {sub.amount ? formatINR(sub.amount) : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {sub.dueDate ? new Date(sub.dueDate).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
