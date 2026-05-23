import { PathaoStats } from "./_components/pathao-stats";
import { PathaoTable } from "./_components/pathao-table";
import { ApiSetupDialog } from "./_components/api-setup-dialog";

export default function PathaoPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Pathao Courier</h1>
          <p className="text-muted-foreground text-sm">Manage your Pathao courier orders, shipments, and API configuration.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <ApiSetupDialog />
        </div>
      </div>

      <PathaoStats />
      <PathaoTable />
    </div>
  );
}
