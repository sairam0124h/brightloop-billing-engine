"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/money";

interface Payment {
  id: string;
  amount: number;
  paidAt: string;
}

interface Invoice {
  id: string;
  number: number;
  subscriptionId: string;
  subscription: {
    number: number;
    customer: { id: string; email: string; name: string | null };
  };
  status: "DRAFT" | "CONFIRMED" | "PAID" | "CANCELLED";
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  subtotal: number;
  taxTotal: number;
  total: number;
  payments: Payment[];
  createdAt: string;
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [loading, setLoading] = useState(false);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    const url = selectedStatus === "ALL" ? "/api/invoices" : `/api/invoices?status=${selectedStatus}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setInvoices(data.data.invoices);
    }
    setLoading(false);
  }, [selectedStatus]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  async function handleTransition(id: string, to: string) {
    const res = await fetch(`/api/invoices/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to }),
    });
    if (res.ok) {
      await loadInvoices();
    } else {
      const err = await res.json();
      alert(err.error?.message || "Failed to update invoice");
    }
  }

  const statusColors: Record<string, string> = {
    DRAFT: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
    CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    PAID: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Link href="/admin/billing">
          <Button variant="outline">Run Billing</Button>
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {["ALL", "DRAFT", "CONFIRMED", "PAID", "CANCELLED"].map((s) => (
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
                <th className="text-left px-4 py-3 font-medium">Inv #</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">Period</th>
                <th className="text-left px-4 py-3 font-medium">Due Date</th>
                <th className="text-left px-4 py-3 font-medium">Total</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    {loading ? "Loading..." : "No invoices found."}
                  </td>
                </tr>
              )}
              {invoices.map((inv) => {
                const totalPaid = inv.payments?.reduce((acc, p) => acc + p.amount, 0) || 0;
                const isOverdue = inv.status === "CONFIRMED" && new Date(inv.dueDate) < new Date();

                return (
                  <tr key={inv.id} className="border-b">
                    <td className="px-4 py-3 font-mono font-medium">INV-{inv.number}</td>
                    <td className="px-4 py-3">
                      <div>{inv.subscription?.customer?.name || "Customer"}</div>
                      <div className="text-xs text-muted-foreground">{inv.subscription?.customer?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(inv.periodStart).toLocaleDateString()} – {new Date(inv.periodEnd).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className={isOverdue ? "text-red-600 font-semibold" : "text-muted-foreground"}>
                        {new Date(inv.dueDate).toLocaleDateString()}
                        {isOverdue && " (Overdue)"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      <div>{formatINR(inv.total)}</div>
                      {totalPaid > 0 && totalPaid < inv.total && (
                        <div className="text-xs text-emerald-600 font-normal">
                          Paid: {formatINR(totalPaid)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[inv.status] || ""}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      {inv.status === "DRAFT" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTransition(inv.id, "CONFIRMED")}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleTransition(inv.id, "CANCELLED")}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      {inv.status === "CONFIRMED" && (
                        <>
                          <Link href={`/admin/payments?invoiceId=${inv.id}`}>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                              Pay
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleTransition(inv.id, "CANCELLED")}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
