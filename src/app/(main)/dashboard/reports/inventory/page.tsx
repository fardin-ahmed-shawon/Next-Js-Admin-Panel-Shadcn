import { Hourglass } from "lucide-react";

export default function InventoryReportComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
      <div className="p-4 rounded-full bg-primary/10 text-primary">
        <Hourglass className="size-10 animate-pulse" />
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Inventory Report</h1>
        <p className="text-muted-foreground text-sm max-w-sm">
          This report is currently under development and will be available soon.
        </p>
      </div>
    </div>
  );
}
