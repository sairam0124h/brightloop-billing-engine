"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

interface Subscription {
  id: string;
  customerId: string;
  productId: string;
  planId: string;
  status: string;
  interval: string;
  createdAt: string;
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadSubscriptions() {
    const res = await fetch("/api/admin/subscriptions");
    if (res.ok) {
      const data = await res.json();
      setSubscriptions(data.subscriptions);
    }
  }

  useEffect(() => {
    loadSubscriptions();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Subscription Management</h1>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left pb-3">ID</th>
                <th className="text-left pb-3">Customer ID</th>
                <th className="text-left pb-3">Product ID</th>
                <th className="text-left pb-3">Plan ID</th>
                <th className="text-left pb-3">Status</th>
                <th className="text-left pb-3">Interval</th>
                <th className="text-left pb-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="py-3 font-mono text-sm">{s.id.slice(0, 8)}</td>
                  <td className="py-3">{s.customerId}</td>
                  <td className="py-3">{s.productId}</td>
                  <td className="py-3">{s.planId}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-purple-100 text-purple-800`}>{s.status}</span>
                  </td>
                  <td className="py-3">{s.interval}</td>
                  <td className="py-3 text-sm text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
