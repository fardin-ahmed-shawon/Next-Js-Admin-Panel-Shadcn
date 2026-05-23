import { ParcelReportsStats } from "./_components/parcel-reports-stats";
import { ParcelReportsTable } from "./_components/parcel-reports-table";

export default function ParcelReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Parcel Reports</h1>
          <p className="text-muted-foreground text-sm">Manage all your courier orders and shipments across all providers.</p>
        </div>
      </div>

      <ParcelReportsStats />
      <ParcelReportsTable />
    </div>
  );
}
