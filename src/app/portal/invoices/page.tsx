"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface Invoice {
  id: string;
  subscriptionId: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  status: string;
  dueDate?: string;
  paidAt?: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/portal/invoices")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load invoices");
        return res.json();
      })
      .then((data) => setInvoices(data.invoices))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Invoices</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-destructive">{error}</p>}
      {!loading && !error && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left pb-3">Number</th>
                  <th className="text-left pb-3">Period</th>
                  <th className="text-left pb-3">Amount</th>
                  <th className="text-left pb-3">Status</th>
                  <th className="text-left pb-3">Due</th>
                  <th className="text-left pb-3">Paid</th>
                  <th className="text-left pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-t">
                    <td className="py-3 font-mono text-sm">INV-{inv.id.slice(0, 8)}</td>
                    <td className="py-3 text-sm">
                      {new Date(inv.periodStart).toLocaleDateString()} — {new Date(inv.periodEnd).toLocaleDateString()}
                    </td>
                    <td className="py-3">₹{(inv.amount / 100).toFixed(2)}</td>
                    <td className="py-3">
                      <span
                        className="inline-block px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800"
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 text-sm">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}</td>
                    <td className="py-3 text-sm">{inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : "—"}</td>
                    <td className="py-3">
                      <Link href={`/portal/invoices/${inv.id}`} className="text-blue-600 hover:underline text-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
