"use client";

import * as React from "react";
import { ApiSetupDialog } from "./_components/api-setup-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useRedxSetup } from "@/hooks/useRedxSetup";
import { redxService } from "@/services/redx";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { RedxTable } from "./_components/redx-table";

export default function RedxPage() {
  const { data, isLoading, mutate } = useRedxSetup();
  const [isToggling, setIsToggling] = React.useState(false);

  const isActive = data?.status === "active";

  const handleToggle = async (checked: boolean) => {
    if (!data || !data.access_token || !data.store_id) {
      toast.error("Please configure RedX API Setup first before enabling.");
      return;
    }

    setIsToggling(true);
    const newStatus = checked ? "active" : "inactive";
    const toastId = toast.loading(`Updating RedX status to ${newStatus}...`);

    try {
      await redxService.saveSetup({
        access_token: data.access_token,
        store_id: data.store_id,
        status: newStatus,
      });

      toast.success(`RedX integration is now ${newStatus}.`, { id: toastId });
      mutate();
    } catch (err: any) {
      toast.error(err?.message || "Failed to toggle status.", { id: toastId });
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">RedX Courier</h1>
          <p className="text-muted-foreground text-sm">
            Manage your RedX courier orders, shipments, and API configuration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : (
            <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5 bg-card">
              <Switch
                id="redx-status-toggle"
                checked={isActive}
                onCheckedChange={handleToggle}
                disabled={isToggling}
              />
              <Label htmlFor="redx-status-toggle" className="text-sm font-medium cursor-pointer">
                {isActive ? "Active" : "Inactive"}
              </Label>
            </div>
          )}
          <ApiSetupDialog />
        </div>
      </div>

      <RedxTable />
    </div>
  );
}
