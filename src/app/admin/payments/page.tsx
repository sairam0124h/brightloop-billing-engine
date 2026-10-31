"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/money";

interface PaymentItem {
  id: string;
  amount: number;
  method: string;
  paidAt: string;
  note: string | null;
  invoice: {
    number: number;
    total: number;
    subscription: {
      customer: { email: string; name: string | null };
    };
  };
  recordedBy: { email: string; name: string | null };
}

interface InvoiceOption {
  id: string;
  number: number;
  total: number;
  status: string;
  subscription: {
    customer: { email: string; name: string | null };
  };
  payments: Array<{ amount: number }>;
}

function PaymentsContent() {
  const searchParams = useSearchParams();
  const preselectedInvoiceId = searchParams.get("invoiceId") || "";

  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceOption[]>([]);
  const [invoiceId, setInvoiceId] = useState(preselectedInvoiceId);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("UPI");
  const [paidAt, setPaidAt] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    const [pRes, iRes] = await Promise.all([
      fetch("/api/payments"),
      fetch("/api/invoices?status=CONFIRMED"),
    ]);

    if (pRes.ok) {
      const pData = await pRes.json();
      setPayments(pData.data?.payments || []);
    }
    if (iRes.ok) {
      const iData = await iRes.json();
      setInvoices(iData.data?.invoices || []);
    }
  }, []);

  useEffect(() => {
    loadData();
    setPaidAt(new Date().toISOString().split("T")[0]);
  }, [loadData]);

  useEffect(() => {
    if (preselectedInvoiceId) {
      setInvoiceId(preselectedInvoiceId);
      const inv = invoices.find((i) => i.id === preselectedInvoiceId);
      if (inv) {
        const paidSoFar = inv.payments?.reduce((s, p) => s + p.amount, 0) || 0;
        const remaining = Math.max(0, inv.total - paidSoFar);
        setAmount((remaining / 100).toString());
      }
    }
  }, [preselectedInvoiceId, invoices]);

  async function handleInvoiceChange(selectedId: string) {
    setInvoiceId(selectedId);
    const inv = invoices.find((i) => i.id === selectedId);
    if (inv) {
      const paidSoFar = inv.payments?.reduce((s, p) => s + p.amount, 0) || 0;
      const remaining = Math.max(0, inv.total - paidSoFar);
      setAmount((remaining / 100).toString());
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId,
          method,
          amount: Math.round(Number(amount) * 100),
          paidAt: new Date(paidAt).toISOString(),
          note: note || undefined,
          idempotencyKey: "pay_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error?.message || "Failed to record payment");
        return;
      }

      setInvoiceId("");
      setAmount("");
      setNote("");
      await loadData();
    } catch {
      setError("Failed to record payment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payments</h1>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Record Payment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice">Invoice</Label>
              <select
                id="invoice"
                required
                value={invoiceId}
                onChange={(e) => handleInvoiceChange(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select Invoice...</option>
                {invoices.map((inv) => {
                  const paid = inv.payments?.reduce((s, p) => s + p.amount, 0) || 0;
                  const remaining = inv.total - paid;
                  return (
                    <option key={inv.id} value={inv.id}>
                      INV-{inv.number} (Due: {formatINR(remaining)}) - {inv.subscription?.customer?.email}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Method</Label>
              <select
                id="method"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CASH">Cash</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paidAt">Payment Date</Label>
              <Input
                id="paidAt"
                type="date"
                required
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Notes (optional)</Label>
            <Input
              id="note"
              placeholder="Transaction ID / reference"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Recording..." : "Record Payment"}
          </Button>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </form>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-zinc-50 dark:bg-zinc-900">
                <th className="text-left px-4 py-3 font-medium">Invoice #</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">Amount</th>
                <th className="text-left px-4 py-3 font-medium">Method</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Recorded By</th>
                <th className="text-left px-4 py-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    No payments recorded yet.
                  </td>
                </tr>
              )}
              {payments.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="px-4 py-3 font-mono font-medium">
                    INV-{p.invoice?.number}
                  </td>
                  <td className="px-4 py-3">
                    <div>{p.invoice?.subscription?.customer?.name || "Customer"}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.invoice?.subscription?.customer?.email}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-emerald-600">
                    {formatINR(p.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-medium">
                      {p.method}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(p.paidAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {p.recordedBy?.email}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {p.note || "—"}
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

export default function AdminPaymentsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading payments...</div>}>
      <PaymentsContent />
    </Suspense>
  );
}
