"use client";

import * as React from "react";
import { ApiSetupDialog } from "./_components/api-setup-dialog";
import { SteadfastStats } from "./_components/steadfast-stats";
import { SteadfastTable } from "./_components/steadfast-table";
import { ReturnsTable } from "./_components/returns-table";
import { PaymentsTable } from "./_components/payments-table";
import { ReturnedParcelsTable } from "./_components/returned-parcels-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSteadfastSetup } from "@/hooks/useSteadfastSetup";
import { fetchClient } from "@/lib/fetch-client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function SteadfastPage() {
  const { data, isLoading, mutate } = useSteadfastSetup();
  const [isToggling, setIsToggling] = React.useState(false);

  const isActive = data?.status === "active";

  const handleToggle = async (checked: boolean) => {
    if (!data || !data.api_url || !data.api_key || !data.secret_key) {
      toast.error("Please configure Steadfast API Setup first before enabling.");
      return;
    }

    setIsToggling(true);
    const newStatus = checked ? "active" : "inactive";
    const toastId = toast.loading(`Updating Steadfast status to ${newStatus}...`);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
      const endpoint = process.env.NEXT_PUBLIC_API_STEADFAST_SETUP_URL || "steadfast-setup";
      const res = await fetchClient(`${baseUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_url: data.api_url,
          api_key: data.api_key,
          secret_key: data.secret_key,
          status: newStatus,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      toast.success(`Steadfast integration is now ${newStatus}.`, { id: toastId });
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
          <h1 className="text-3xl tracking-tight">Steadfast Courier</h1>
          <p className="text-muted-foreground text-sm">
            Manage your Steadfast courier orders, shipments, and API configuration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : (
            <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5 bg-card">
              <Switch
                id="steadfast-status-toggle"
                checked={isActive}
                onCheckedChange={handleToggle}
                disabled={isToggling}
              />
              <Label htmlFor="steadfast-status-toggle" className="text-sm font-medium cursor-pointer">
                {isActive ? "Active" : "Inactive"}
              </Label>
            </div>
          )}
          <ApiSetupDialog />
        </div>
      </div>

      <SteadfastStats />

      <Tabs defaultValue="parcels" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="parcels">Parcels</TabsTrigger>
          <TabsTrigger value="returned-parcels">Returned Parcels</TabsTrigger>
          <TabsTrigger value="returns">Return Requests</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>
        <TabsContent value="parcels" className="mt-0">
          <SteadfastTable />
        </TabsContent>
        <TabsContent value="returned-parcels" className="mt-0">
          <ReturnedParcelsTable />
        </TabsContent>
        <TabsContent value="returns" className="mt-0">
          <ReturnsTable />
        </TabsContent>
        <TabsContent value="payments" className="mt-0">
          <PaymentsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
