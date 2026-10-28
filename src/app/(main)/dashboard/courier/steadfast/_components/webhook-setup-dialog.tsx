"use client";

import { Webhook } from "lucide-react";
import { ApiIntegrationsTab } from "@/app/(main)/dashboard/settings/_components/api-integrations-tab";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";

export function WebhookSetupDialog() {
  const { user } = useAuth();
  if (user?.role?.role_name !== "Admin") return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Webhook className="mr-2 size-4" />
          Webhook Setup
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Steadfast Order Automation</DialogTitle>
          <DialogDescription>Configure the webhook for Steadfast delivery status updates.</DialogDescription>
        </DialogHeader>
        <ApiIntegrationsTab providerId="steadfast" />
      </DialogContent>
    </Dialog>
  );
}
