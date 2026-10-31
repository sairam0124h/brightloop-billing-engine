"use client";

import { useEffect, useState, use, Suspense } from "react";
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

function InvoiceContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/portal/invoices/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load invoice");
        return res.json();
      })
      .then((data) => setInvoice(data.invoice))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

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

      <Card className="space-y-6 p-6">
        <section>
          <h2 className="text-lg font-semibold mb-2">Invoice Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium">{invoice.status}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Amount</p>
              <p className="font-medium">{formatINR(invoice.amount)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Period</p>
              <p className="font-medium">
                {new Date(invoice.periodStart).toLocaleDateString()} – {new Date(invoice.periodEnd).toLocaleDateString()}
              </p>
            </div>
            {invoice.dueDate && (
              <div>
                <p className="text-muted-foreground">Due Date</p>
                <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </section>
      </Card>
    </div>
  );
}

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<p>Loading invoice...</p>}>
      <InvoiceContent params={params} />
    </Suspense>
  );
}
