"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface BillingDate {
  id: string;
  name: string;
  startDay: number;
  paymentTerms: number;
}

export default function BillingDatesPage() {
  const [dates, setDates] = useState<BillingDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/portal/billing-dates")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load billing dates");
        return res.json();
      })
      .then((data) => setDates(data.billingDates))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Billing Dates</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-destructive">{error}</p>}
      {!loading && !error && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left pb-3">Name</th>
                  <th className="text-left pb-3">Start Day</th>
                  <th className="text-left pb-3">Payment Terms (days)</th>
                </tr>
              </thead>
              <tbody>
                {dates.map((date) => (
                  <tr key={date.id} className="border-t">
                    <td className="py-3">{date.name}</td>
                    <td className="py-3">{date.startDay}</td>
                    <td className="py-3">{date.paymentTerms}</td>
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
