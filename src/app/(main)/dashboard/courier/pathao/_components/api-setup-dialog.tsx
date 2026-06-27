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

import { usePathaoSetup } from "@/hooks/usePathaoSetup";
import { pathaoService } from "@/services/pathao";

export function ApiSetupDialog() {
  const [open, setOpen] = React.useState(false);
  const { data, isLoading, mutate } = usePathaoSetup();

  const [clientId, setClientId] = React.useState("");
  const [clientSecret, setClientSecret] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [grantType, setGrantType] = React.useState("password");
  const [storeId, setStoreId] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (data && open) {
      setClientId(data.client_id || "");
      setClientSecret(data.client_secret || "");
      setUsername(data.username || "");
      setPassword(data.password || "");
      setGrantType(data.grant_type || "password");
      setStoreId(data.store_id || "");
    }
  }, [data, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const toastId = toast.loading("Saving API setup...");

    try {
      await pathaoService.saveSetup({
        client_id: clientId,
        client_secret: clientSecret,
        username,
        password,
        grant_type: grantType,
        store_id: storeId,
      });

      toast.success("Pathao API Configuration Saved Successfully!", { id: toastId });
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
              <DialogTitle>Pathao API Setup</DialogTitle>
              <DialogDescription>Configure your Pathao courier API credentials here.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="clientId">Client ID</Label>
                <Input
                  id="clientId"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="Enter Client ID"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="clientSecret">Client Secret</Label>
                <Input
                  id="clientSecret"
                  type="password"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="Enter Client Secret"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Merchant Username (Email)</Label>
                <Input
                  id="username"
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="merchant@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Merchant Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="grantType">Grant Type</Label>
                <Input
                  id="grantType"
                  value={grantType}
                  onChange={(e) => setGrantType(e.target.value)}
                  placeholder="password"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="storeId">Default Store ID</Label>
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
