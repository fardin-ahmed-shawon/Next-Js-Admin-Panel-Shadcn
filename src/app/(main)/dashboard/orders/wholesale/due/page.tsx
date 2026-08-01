import type { Metadata } from "next";

import { DueStats } from "../../../accounts/due/_components/due-stats";
import { DueTable } from "../../../accounts/due/_components/due-table";

export const metadata: Metadata = {
  title: "Wholesale Due Collection",
  description: "Track and manage all outstanding wholesale invoice balances.",
};

export default function WholesaleDuePage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Wholesale Due Collection</h1>
          <p className="text-muted-foreground text-sm">Track and manage all outstanding wholesale invoice balances.</p>
        </div>
      </div>

      <DueStats source="Wholesale" />
      <DueTable source="Wholesale" />
    </div>
  );
}
