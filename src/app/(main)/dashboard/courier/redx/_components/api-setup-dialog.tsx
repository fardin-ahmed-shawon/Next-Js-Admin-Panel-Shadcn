"use client";

import * as React from "react";
import { Loader2, Settings } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useRedxSetup } from "@/hooks/useRedxSetup";
import { redxService } from "@/services/redx";

export function ApiSetupDialog() {
  const [open, setOpen] = React.useState(false);
  const { data, isLoading, mutate } = useRedxSetup();

  const [accessToken, setAccessToken] = React.useState("");
  const [storeId, setStoreId] = React.useState("");
  const [baseUrl, setBaseUrl] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (data && open) {
      setAccessToken(data.access_token || "");
      setStoreId(data.store_id || "");
      setBaseUrl(data.base_url || "");
    }
  }, [data, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const toastId = toast.loading("Saving API setup...");

    try {
      await redxService.saveSetup({
        access_token: accessToken,
        store_id: storeId,
        base_url: baseUrl,
      });

      toast.success("RedX API Configuration Saved Successfully!", { id: toastId });
      mutate();
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to save setup.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800">
          <Settings className="mr-2 size-4" />
          API Setup
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {isLoading && open ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>RedX API Setup</DialogTitle>
              <DialogDescription>Configure your RedX courier API credentials here.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="baseUrl">Live Base URL</Label>
                <Input
                  id="baseUrl"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="openapi.redx.com.bd/v1.0.0-beta"
                />
                <p className="text-xs text-muted-foreground">Used only in production mode. E.g. openapi.redx.com.bd/v1.0.0-beta</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="accessToken">Access Token</Label>
                <Input
                  id="accessToken"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Enter API Access Token"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="storeId">Pickup Store ID</Label>
                <Input
                  id="storeId"
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  placeholder="Enter Store ID"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800">
                {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
