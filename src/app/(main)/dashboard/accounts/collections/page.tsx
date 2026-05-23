import { Metadata } from "next";

import { CollectionsStats } from "./_components/collections-stats";
import { CollectionsTable } from "./_components/collections-table";

export const metadata: Metadata = {
  title: "Financial Collections",
  description: "Track all incoming payments, cash flow, and financial collections.",
};

export default function AccountsCollectionsPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Financial Collections</h1>
          <p className="text-muted-foreground text-sm">Track all incoming payments, cash flow, and financial collections.</p>
        </div>
      </div>

      <CollectionsStats />
      <CollectionsTable />
    </div>
  );
}
