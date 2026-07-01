"use client";

import * as React from "react";

import Link from "next/link";

import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUsers } from "@/hooks/useUsers";

import { AddUserDialog } from "../users/_components/add-user-dialog";
import { UsersStats } from "../users/_components/users-stats";
import { UsersTable } from "../users/_components/users-table";
import { RolesGrid } from "./_components/roles-grid";
import { RolesStats } from "./_components/roles-stats";

export default function RolesPage() {
  const [activeTab, setActiveTab] = React.useState("roles");
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const { users, loading: usersLoading, refetch: refetchUsers } = useUsers();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">View Roles & Users</h1>
          <p className="text-muted-foreground text-sm">
            {activeTab === "roles"
              ? "Manage system roles, permissions, and access controls."
              : "Manage system users and their roles."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === "roles" ? (
            <Link href="/dashboard/roles/add">
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Add New Role
              </Button>
            </Link>
          ) : (
            <>
              <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
                <PlusCircle className="h-4 w-4" />
                Add User
              </Button>
              <AddUserDialog open={isAddOpen} onOpenChange={setIsAddOpen} onSuccess={refetchUsers} />
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          <RolesStats />
          <RolesGrid />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UsersStats users={users} loading={usersLoading} />
          <UsersTable users={users} loading={usersLoading} refetch={refetchUsers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
