"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { formatINR } from "@/lib/money";

interface Invoice {
  id: string;
  subscriptionId: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  status: string;
  dueDate?: string;
  paidAt?: string;
  lines?: any[];
}

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/portal/invoices/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load invoice");
        return res.json();
      })
      .then((data) => setInvoice(data.invoice))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  if (!invoice) return <p>Invoice not found</p>;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoice {invoice.id.slice(0, 8)}</h1>
        <Link href="/portal/invoices" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to invoices
        </Link>
      </div>

      <Card className="space-y-6">
        <section>
          <h2 className="text-lg font-semibold mb-3">Invoice Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>Period: {new Date(invoice.periodStart).toLocaleDateString()} — {new Date(invoice.periodEnd).toLocaleDateString()}</div>
            <div>Status: {invoice.status}</div>
            <div>Amount: {formatINR(invoice.amount)}</div>
            <div>Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "—"}</div>
            <div>Paid: {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : "—"}</div>
          </div>
        </section>

        {invoice.lines && invoice.lines.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3">Line Items</h2>
            <div className="border rounded-md">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-zinc-50 dark:bg-zinc-900">
                    <th className="text-left p-3">Description</th>
                    <th className="text-right p-3">Qty</th>
                    <th className="text-right p-3">Unit Price</th>
                    <th className="text-right p-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lines.map((line, i) => (
                    <tr key={i} className="border-b last:border-b-0">
                      <td className="p-3">{line.description || line.name}</td>
                      <td className="p-3 text-right">{line.quantity}</td>
                      <td className="p-3 text-right">₹{(line.unitPrice / 100).toFixed(2)}</td>
                      <td className="p-3 text-right">₹{(line.amount / 100).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </Card>
    </div>
  );
}
