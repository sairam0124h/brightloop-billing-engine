"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/money";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface RecentInvoice {
  id: string;
  number: number;
  total: number;
  status: string;
  dueDate: string;
  createdAt: string;
  subscription: {
    customer: { email: string; name: string | null };
  };
}

interface MonthlyTrend {
  month: string;
  revenue: number;
}

interface DashboardData {
  activeSubscriptions: number;
  mrr: number;
  revenueCollected: number;
  overdueAmount: number;
  overdueCount: number;
  recentInvoices: RecentInvoice[];
  monthlyTrends: MonthlyTrend[];
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
        {
          label: "Active Subscriptions",
          value: String(data.activeSubscriptions),
          sub: "Currently generating MRR",
          accent: "text-blue-600 dark:text-blue-400",
        },
        {
          label: "Monthly Recurring Revenue",
          value: formatINR(data.mrr),
          sub: "Normalized monthly run-rate",
          accent: "text-emerald-600 dark:text-emerald-400",
        },
        {
          label: "Revenue Collected",
          value: formatINR(data.revenueCollected),
          sub: "Total payments settled",
          accent: "text-violet-600 dark:text-violet-400",
        },
        {
          label: `Overdue Invoices (${data.overdueCount})`,
          value: formatINR(data.overdueAmount),
          sub: "Requires collections follow-up",
          accent: "text-red-600 dark:text-red-400",
        },
      ]
    : [];

  const chartData = data?.monthlyTrends?.map((item) => ({
    month: item.month,
    revenue: Math.round(item.revenue / 100),
  })) || [];

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Finance & Billing Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time subscription metrics, cashflow analytics, and automated billing health.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/subscriptions">
            <Button size="sm">New Subscription</Button>
          </Link>
          <Link href="/admin/billing">
            <Button size="sm" variant="outline">Run Billing</Button>
          </Link>
          <Link href="/admin/payments">
            <Button size="sm" variant="outline">Record Payment</Button>
          </Link>
        </div>
      </div>

      {/* 4 KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3 mb-3" />
              <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Card key={card.label} className="p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.label}</p>
              <p className={`text-2xl font-bold mt-1.5 ${card.accent}`}>{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Chart & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Velocity Chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-base font-semibold">Revenue Collection Trajectory (₹)</h2>
              <p className="text-xs text-muted-foreground">Historical collections & projected revenue</p>
            </div>
            <Badge variant="outline">Monthly Trends</Badge>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString("en-IN")}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Invoices Table */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold">Recent Invoices</h2>
            <Link href="/admin/invoices" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {data?.recentInvoices && data.recentInvoices.length > 0 ? (
              data.recentInvoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between border-b pb-2.5 last:border-0 last:pb-0">
                  <div>
                    <div className="font-mono text-xs font-semibold">INV-{inv.number}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {inv.subscription?.customer?.email}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold">{formatINR(inv.total)}</div>
                    <span className={`inline-block text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded ${
                      inv.status === "PAID"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                        : inv.status === "CONFIRMED"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400"
                        : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">No recent invoices.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
