"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/money";

interface DashboardData {
  activeSubscriptions: number;
  mrr: number;
  revenueCollected: number;
  overdueAmount: number;
  overdueCount: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  const cards = data
    ? [
        { label: "Active Subscriptions", value: String(data.activeSubscriptions), accent: "text-blue-600" },
        { label: "Monthly Recurring Revenue", value: formatINR(data.mrr), accent: "text-emerald-600" },
        { label: "Revenue Collected", value: formatINR(data.revenueCollected), accent: "text-violet-600" },
        { label: `Overdue (${data.overdueCount})`, value: formatINR(data.overdueAmount), accent: "text-red-600" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3 mb-3" />
              <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
            </Card>
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Card key={card.label} className="p-6">
              <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
              <p className={`text-2xl font-bold ${card.accent}`}>{card.value}</p>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">Failed to load dashboard data.</p>
      )}
    </div>
  );
}

