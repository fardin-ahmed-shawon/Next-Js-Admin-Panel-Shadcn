import { Metadata } from "next";

import { AccountsOverview } from "./_components/accounts-overview";

export const metadata: Metadata = {
  title: "Accounts Dashboard",
  description: "View comprehensive financial summaries and metrics.",
};

export default function AccountsPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Accounts Dashboard</h1>
          <p className="text-muted-foreground text-sm">View comprehensive financial summaries and metrics.</p>
        </div>
      </div>

      <AccountsOverview />
    </div>
  );
}
