import { SteadfastStats } from "./_components/steadfast-stats";
import { SteadfastTable } from "./_components/steadfast-table";
import { ApiSetupDialog } from "./_components/api-setup-dialog";

export default function SteadfastPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Steadfast Courier</h1>
          <p className="text-muted-foreground text-sm">Manage your Steadfast courier orders, shipments, and API configuration.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <ApiSetupDialog />
        </div>
      </div>

      <SteadfastStats />
      <SteadfastTable />
    </div>
  );
}
