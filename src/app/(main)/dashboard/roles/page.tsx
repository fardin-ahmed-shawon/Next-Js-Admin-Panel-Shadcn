import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RolesGrid } from "./_components/roles-grid";
import { RolesStats } from "./_components/roles-stats";

export default function RolesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground text-sm">
            Manage system roles, permissions, and access controls.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/dashboard/roles/add">
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Add New Role
            </Button>
          </Link>
        </div>
      </div>

      <RolesStats />
      <RolesGrid />
    </div>
  );
}
