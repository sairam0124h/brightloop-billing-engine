"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { cn } from "@/lib/utils";

function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 p-4">
      <nav className="space-y-1">
        <Link
          href="/admin/staff"
          className={cn(
            "block px-3 py-2 rounded-md transition-colors",
            pathname === "/admin/staff" || pathname.startsWith("/admin/staff/")
              ? "bg-zinc-100 dark:bg-zinc-800 font-medium text-foreground"
              : "text-muted-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900"
          )}
        >
          Staff
        </Link>
        <Link
          href="/admin/products"
          className={cn(
            "block px-3 py-2 rounded-md transition-colors",
            pathname === "/admin/products" || pathname.startsWith("/admin/products/")
              ? "bg-zinc-100 dark:bg-zinc-800 font-medium text-foreground"
              : "text-muted-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900"
          )}
        >
          Products
        </Link>
        <Link
          href="/admin/plans"
          className={cn(
            "block px-3 py-2 rounded-md transition-colors",
            pathname === "/admin/plans" || pathname.startsWith("/admin/plans/")
              ? "bg-zinc-100 dark:bg-zinc-800 font-medium text-foreground"
              : "text-muted-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900"
          )}
        >
          Plans
        </Link>
        <Link
          href="/admin/taxes"
          className={cn(
            "block px-3 py-2 rounded-md transition-colors",
            pathname === "/admin/taxes" || pathname.startsWith("/admin/taxes/")
              ? "bg-zinc-100 dark:bg-zinc-800 font-medium text-foreground"
              : "text-muted-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900"
          )}
        >
          Taxes
        </Link>
        <Link
          href="/admin/discounts"
          className={cn(
            "block px-3 py-2 rounded-md transition-colors",
            pathname === "/admin/discounts" || pathname.startsWith("/admin/discounts/")
              ? "bg-zinc-100 dark:bg-zinc-800 font-medium text-foreground"
              : "text-muted-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900"
          )}
        >
          Discounts
        </Link>
        <Link
          href="/admin/subscriptions"
          className={cn(
            "block px-3 py-2 rounded-md transition-colors",
            pathname === "/admin/subscriptions" || pathname.startsWith("/admin/subscriptions/")
              ? "bg-zinc-100 dark:bg-zinc-800 font-medium text-foreground"
              : "text-muted-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900"
          )}
        >
          Subscriptions
        </Link>
        <Link
          href="/admin/invoices"
          className={cn(
            "block px-3 py-2 rounded-md transition-colors",
            pathname === "/admin/invoices" || pathname.startsWith("/admin/invoices/")
              ? "bg-zinc-100 dark:bg-zinc-800 font-medium text-foreground"
              : "text-muted-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900"
          )}
        >
          Invoices
        </Link>
      </nav>
    </aside>
  );
}

export function Sidebar() {
  return (
    <Suspense fallback={<aside className="w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 p-4" />}>
      <SidebarNav />
    </Suspense>
  );
}
