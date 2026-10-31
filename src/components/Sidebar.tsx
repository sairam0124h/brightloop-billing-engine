"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
  { href: "/admin/invoices", label: "Invoices" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/billing", label: "Billing" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/plans", label: "Plans" },
  { href: "/admin/taxes", label: "Taxes" },
  { href: "/admin/discounts", label: "Discounts" },
  { href: "/admin/staff", label: "Staff" },
];

const portalNavItems = [
  { href: "/portal/subscriptions", label: "My Subscriptions" },
  { href: "/portal/invoices", label: "My Invoices" },
  { href: "/portal/billing-dates", label: "Billing Dates" },
];

function SidebarNav() {
  const pathname = usePathname();
  const isPortal = pathname.startsWith("/portal");
  const items = isPortal ? portalNavItems : adminNavItems;

  return (
    <aside className="w-56 shrink-0 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 py-4 px-3 min-h-[calc(100vh-65px)]">
      <nav className="space-y-0.5">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block px-3 py-2 rounded-md text-sm transition-colors",
              pathname === item.href || pathname.startsWith(item.href + "/")
                ? "bg-zinc-100 dark:bg-zinc-800 font-medium text-foreground"
                : "text-muted-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export function Sidebar() {
  return (
    <Suspense fallback={<aside className="w-56 shrink-0 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 py-4 px-3" />}>
      <SidebarNav />
    </Suspense>
  );
}
