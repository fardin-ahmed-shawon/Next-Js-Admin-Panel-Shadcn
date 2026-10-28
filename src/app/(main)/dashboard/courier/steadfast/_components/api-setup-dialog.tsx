"use client";

import * as React from "react";

import { Loader2, Pencil, Settings } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useSteadfastSetup } from "@/hooks/useSteadfastSetup";
import { fetchClient } from "@/lib/fetch-client";

const RECOMMENDED_API_URL = "https://portal.packzy.com/api/v1/create_order";

export function ApiSetupDialog() {
  const [open, setOpen] = React.useState(false);
  const { data, isLoading, mutate } = useSteadfastSetup();

  const [apiUrl, setApiUrl] = React.useState(RECOMMENDED_API_URL);
  const [editingApiUrl, setEditingApiUrl] = React.useState(false);
  const [urlWarningOpen, setUrlWarningOpen] = React.useState(false);
  const [apiKey, setApiKey] = React.useState("");
  const [secretKey, setSecretKey] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setEditingApiUrl(false);
    setUrlWarningOpen(false);
  }, [open]);

  React.useEffect(() => {
    if (data && open) {
      setApiUrl(data.api_url || RECOMMENDED_API_URL);
      setApiKey(data.api_key || "");
      setSecretKey(data.secret_key || "");
    }
  }, [data, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const toastId = toast.loading("Saving API setup...");

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
      const endpoint = process.env.NEXT_PUBLIC_API_STEADFAST_SETUP_URL || "steadfast-setup";
      const res = await fetchClient(`${baseUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingApiUrl ? { api_url: apiUrl } : {}),
          api_key: apiKey,
          secret_key: secretKey,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save Steadfast setup");
      }

      toast.success("API setup saved successfully.", { id: toastId });
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
        <Button>
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
              <DialogTitle>Steadfast API Setup</DialogTitle>
              <DialogDescription>Configure your Steadfast courier API credentials here.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="apiUrl">API URL</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="apiUrl"
                    type="url"
                    value={apiUrl}
                    onChange={(event) => setApiUrl(event.target.value)}
                    readOnly={!editingApiUrl || isSaving}
                    className={!editingApiUrl ? "bg-muted" : undefined}
                    required
                  />
                  <AlertDialog open={urlWarningOpen} onOpenChange={setUrlWarningOpen}>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        aria-label="Edit API URL"
                        disabled={isSaving || editingApiUrl}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Change API URL?</AlertDialogTitle>
                        <AlertDialogDescription className="break-words">
                          We are recommending you to keep '{RECOMMENDED_API_URL}' this link as API URL according to our
                          system structure.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Current URL</AlertDialogCancel>
                        <AlertDialogAction onClick={() => setEditingApiUrl(true)}>Edit API URL</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API Key"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="secretKey">Secret Key</Label>
                <Input
                  id="secretKey"
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Enter your Secret Key"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
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
