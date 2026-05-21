"use client";

import * as React from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsersTable } from "./_components/users-table";
import { UsersStats } from "./_components/users-stats";
import { AddUserDialog } from "./_components/add-user-dialog";

export default function UsersPage() {
  const [isAddOpen, setIsAddOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Users</h1>
          <p className="text-muted-foreground text-sm">
            Manage system users and their roles.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
            <PlusCircle className="h-4 w-4" />
            Add User
          </Button>
          <AddUserDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
        </div>
      </div>

      <UsersStats />
      <UsersTable />
    </div>
  );
}
