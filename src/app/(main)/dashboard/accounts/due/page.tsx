import { Metadata } from "next";

import { DueStats } from "./_components/due-stats";
import { DueTable } from "./_components/due-table";

export const metadata: Metadata = {
  title: "Due Collection",
  description: "Track and manage all outstanding invoice balances.",
};

export default function DuePage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Due Collection</h1>
          <p className="text-muted-foreground text-sm">Track and manage all outstanding invoice balances.</p>
        </div>
      </div>

      <DueStats />
      <DueTable />
    </div>
  );
}
