"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

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
      .then((data) => setSubscriptions(data.subscriptions))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Subscriptions</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-destructive">{error}</p>}
      {!loading && !error && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left pb-3">Product</th>
                  <th className="text-left pb-3">Plan</th>
                  <th className="text-left pb-3">Status</th>
                  <th className="text-left pb-3">Period</th>
                  <th className="text-left pb-3">Amount</th>
                  <th className="text-left pb-3">Due</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="border-t">
                    <td className="py-3">{sub.productName}</td>
                    <td className="py-3">{sub.planName}</td>
                    <td className="py-3">
                      <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 text-sm">
                      {new Date(sub.periodStart).toLocaleDateString()} — {new Date(sub.periodEnd).toLocaleDateString()}
                    </td>
                    <td className="py-3">{sub.amount ? `₹${(sub.amount / 100).toFixed(2)}` : "—"}</td>
                    <td className="py-3 text-sm">{sub.dueDate ? new Date(sub.dueDate).toLocaleDateString() : "—"}</td>
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
