"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

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

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadInvoices() {
    const res = await fetch("/api/admin/invoices");
    if (res.ok) {
      const data = await res.json();
      setInvoices(data.invoices);
    }
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Invoice Management</h1>

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
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${inv.status === "PAID" ? "bg-green-100 text-green-800" : inv.status === "CONFIRMED" ? "bg-purple-100 text-purple-800" : inv.status === "DRAFT" ? "bg-zinc-100 text-zinc-800" : "bg-red-100 text-red-800"}`}>{inv.status}</span>
                  </td>
                  <td className="py-3 text-sm">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}</td>
                  <td className="py-3 text-sm">{inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
