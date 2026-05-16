import { CustomersStats } from "./_components/customers-stats";
import { CustomersTable } from "./_components/customers-table";

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">All Customers</h1>
          <p className="text-muted-foreground text-sm">Manage your customer base and track engagement.</p>
        </div>
      </div>

      <CustomersStats />
      <CustomersTable />
    </div>
  );
}
