"use client";

import * as React from "react";

import { Settings } from "lucide-react";
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

export function ApiSetupDialog() {
  const [open, setOpen] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("API setup saved successfully.");
    setOpen(false);
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
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Steadfast API Setup</DialogTitle>
            <DialogDescription>Configure your Steadfast courier API credentials here.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="apiUrl">API URL</Label>
              <Input id="apiUrl" placeholder="https://portal.steadfast.com.bd/api/v1" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input id="apiKey" placeholder="Enter your API Key" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="secretKey">Secret Key</Label>
              <Input id="secretKey" type="password" placeholder="Enter your Secret Key" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
