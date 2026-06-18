import type { Metadata } from "next";

import { RevenueDashboard } from "./_components/revenue-dashboard";

export const metadata: Metadata = {
  title: "Revenue",
  description: "Track all incoming payments, cash flow, and financial revenue.",
};

export default function AccountsRevenuePage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Revenue</h1>
          <p className="text-muted-foreground text-sm">
            Track all incoming payments, cash flow, and financial revenue.
          </p>
        </div>
      </div>

      <RevenueDashboard />
    </div>
  );
}
