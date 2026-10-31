"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BillingResult {
  created: number;
  skipped: number;
  failed: number;
  errors: Array<{ subscriptionId: string; message: string }>;
}

export default function AdminBillingPage() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<BillingResult | null>(null);
  const [error, setError] = useState("");

  async function handleRunBilling() {
    setRunning(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/billing/run", { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error?.message || "Billing run failed");
        return;
      }

      const data = await res.json();
      setResult(data.data);
    } catch {
      setError("Billing run failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Billing Automation</h1>

      <Card className="p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Scheduled Billing Run</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Scans all ACTIVE subscriptions whose next billing date has arrived (on or before today),
            generates unique invoices, advances the subscription schedule, and logs audit events.
            Duplicate runs for the same period are safely skipped.
          </p>
        </div>

        <div className="pt-2">
          <Button
            size="lg"
            className="bg-primary"
            disabled={running}
            onClick={handleRunBilling}
          >
            {running ? "Processing Subscriptions..." : "Run Billing Now"}
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </Card>

      {result && (
        <Card className="p-6 space-y-4 border-emerald-500/20 bg-emerald-500/5">
          <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">
            Billing Run Completed
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-background border">
              <p className="text-xs text-muted-foreground uppercase">Invoices Created</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{result.created}</p>
            </div>
            <div className="p-4 rounded-lg bg-background border">
              <p className="text-xs text-muted-foreground uppercase">Skipped (Already Billed)</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{result.skipped}</p>
            </div>
            <div className="p-4 rounded-lg bg-background border">
              <p className="text-xs text-muted-foreground uppercase">Failed</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{result.failed}</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="border border-red-300 dark:border-red-900 rounded p-4 bg-red-50 dark:bg-red-950/20">
              <p className="font-medium text-sm text-red-700 dark:text-red-400 mb-2">
                Errors Encountered:
              </p>
              <ul className="text-xs space-y-1 text-red-600 dark:text-red-300">
                {result.errors.map((e, idx) => (
                  <li key={idx}>
                    Sub {e.subscriptionId}: {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

