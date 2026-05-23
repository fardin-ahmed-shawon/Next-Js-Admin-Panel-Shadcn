"use client";

import * as React from "react";

import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

import { AddBlockDialog } from "./_components/add-block-dialog";
import { BlocklistStats } from "./_components/blocklist-stats";
import { BlocklistTable } from "./_components/blocklist-table";

export default function BlocklistPage() {
  const [isAddOpen, setIsAddOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Blocklist</h1>
          <p className="text-muted-foreground text-sm">Manage blocked IPs and phone numbers.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
            <PlusCircle className="h-4 w-4" />
            Add Block
          </Button>
          <AddBlockDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
        </div>
      </div>

      <BlocklistStats />
      <BlocklistTable />
    </div>
  );
}
