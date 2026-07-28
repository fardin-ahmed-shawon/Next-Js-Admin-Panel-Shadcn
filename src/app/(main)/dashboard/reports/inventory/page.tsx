import { useModularFeatures } from "@/hooks/useModularFeatures";
import { Hourglass } from "lucide-react";

export default function InventoryReportComingSoonPage() {
  const { features } = useModularFeatures();
  if (reports_inventor === false || String(features?.reports_inventor) === "0" || features?.reports_inventory === false || String(features?.reports_inventory) === "0") {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <h2 className="text-2xl font-bold">Feature Disabled</h2>
        <p className="text-muted-foreground mt-2">This report feature is currently disabled.</p>
      </div>
    );
  }
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
