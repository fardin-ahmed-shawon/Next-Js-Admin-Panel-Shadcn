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
            <DialogTitle>Pathao API Setup</DialogTitle>
            <DialogDescription>Configure your Pathao courier API credentials here.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="clientId">Client ID</Label>
              <Input id="clientId" placeholder="11223344" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientSecret">Client Secret</Label>
              <Input id="clientSecret" type="password" placeholder="HJ235YHUJD" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="user56" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="grantType">Grant Type</Label>
              <Input id="grantType" defaultValue="password" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="storeId">Store ID</Label>
              <Input id="storeId" placeholder="Store ID" />
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
