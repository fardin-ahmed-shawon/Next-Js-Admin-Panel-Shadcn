import { Metadata } from "next";

import { PaymentsStats } from "./_components/payments-stats";
import { PaymentsTable } from "./_components/payments-table";

export const metadata: Metadata = {
  title: "Payments",
  description: "Manage your payments and transactions.",
};

export default function PaymentsPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Payments</h1>
          <p className="text-muted-foreground text-sm">Manage your payments and transactions.</p>
        </div>
      </div>

      <PaymentsStats />
      <PaymentsTable />
    </div>
  );
}
