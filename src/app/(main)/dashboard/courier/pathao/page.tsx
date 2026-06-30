"use client";

import * as React from "react";
import { ApiSetupDialog } from "./_components/api-setup-dialog";
import { PathaoStats } from "./_components/pathao-stats";
import { PathaoTable } from "./_components/pathao-table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { usePathaoSetup } from "@/hooks/usePathaoSetup";
import { pathaoService } from "@/services/pathao";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function PathaoPage() {
  const { data, isLoading, mutate } = usePathaoSetup();
  const [isToggling, setIsToggling] = React.useState(false);

  const isActive = data?.status === "active";

  const handleToggle = async (checked: boolean) => {
    if (!data || !data.client_id || !data.client_secret || !data.username || !data.password || !data.store_id) {
      toast.error("Please configure Pathao API Setup first before enabling.");
      return;
    }

    setIsToggling(true);
    const newStatus = checked ? "active" : "inactive";
    const toastId = toast.loading(`Updating Pathao status to ${newStatus}...`);

    try {
      await pathaoService.saveSetup({
        client_id: data.client_id,
        client_secret: data.client_secret,
        username: data.username,
        password: data.password,
        grant_type: data.grant_type || "password",
        store_id: data.store_id,
        status: newStatus,
      });

      toast.success(`Pathao integration is now ${newStatus}.`, { id: toastId });
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
          <h1 className="text-3xl tracking-tight">Pathao Courier</h1>
          <p className="text-muted-foreground text-sm">
            Manage your Pathao courier orders, shipments, and API configuration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : (
            <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5 bg-card">
              <Switch
                id="pathao-status-toggle"
                checked={isActive}
                onCheckedChange={handleToggle}
                disabled={isToggling}
              />
              <Label htmlFor="pathao-status-toggle" className="text-sm font-medium cursor-pointer">
                {isActive ? "Active" : "Inactive"}
              </Label>
            </div>
          )}
          <ApiSetupDialog />
        </div>
      </div>

      <PathaoStats />
      <PathaoTable />
    </div>
  );
}
