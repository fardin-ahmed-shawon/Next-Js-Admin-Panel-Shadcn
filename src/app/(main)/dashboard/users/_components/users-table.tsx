"use client";

import * as React from "react";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  Search,
  Trash,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "@/hooks/useUsers";
import { useRoles } from "@/hooks/useRoles";
import { useAuth } from "@/hooks/useAuth";
import { EditUserDialog } from "./edit-user-dialog";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${process.env.NEXT_PUBLIC_API_USERS || "users"}`;

interface UsersTableProps {
  users: User[];
  loading: boolean;
  refetch: () => void;
}

export function UsersTable({ users, loading, refetch }: UsersTableProps) {
  const { user: currentUser } = useAuth();
  const { roles, loading: rolesLoading } = useRoles();
  const [activeRoleFilter, setActiveRoleFilter] = React.useState<string>("All Roles");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  // Edit State
  const [editUser, setEditUser] = React.useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to delete user.");
      }

      toast.success("User deleted successfully.");
      refetch();
    } catch (error) {
      toast.error("Failed to delete user.");
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <span className="font-medium">#{row.getValue("id")}</span>,
    },
    {
      accessorKey: "full_name",
      header: "Full Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      id: "role",
      accessorFn: (row) => row.role?.role_name || "Unknown",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return (
          <Badge variant={role === "Admin" ? "default" : role === "Manager" ? "secondary" : "outline"}>{role}</Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const user = row.original;

        const targetIsAdmin = user.role?.role_name === "Admin";
        const currentUserIsAdmin = currentUser?.role?.role_name === "Admin";
        const isSelf = currentUser?.id === user.id;

        const canEdit = !(targetIsAdmin && currentUserIsAdmin && !isSelf);
        const canDelete = !targetIsAdmin;

        return (
          <div className="flex items-center justify-end gap-2">
            {canEdit && (
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => {
                  setEditUser(user);
                  setIsEditOpen(true);
                }}
              >
                <Edit className="size-4" />
              </Button>
            )}

            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon-sm">
                    <Trash className="size-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete <strong>{user.full_name}</strong>? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => handleDelete(user.id)}
                    >
                      Yes, delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  const totalCount = table.getFilteredRowModel().rows.length;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-normal text-muted-foreground text-sm">All System Users</CardTitle>
          <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
            {loading ? <Skeleton className="h-6 w-24" /> : totalCount > 0 ? `${totalCount} users` : "No users"}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 px-0">
          {/* Top Filters Block */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-8 w-48 rounded-[min(var(--radius-md),12px)] pl-8"
                  placeholder="Search name or email..."
                  value={(table.getColumn("full_name")?.getFilterValue() as string) ?? ""}
                  onChange={(event) => {
                    table.getColumn("full_name")?.setFilterValue(event.target.value || undefined);
                    table.setPageIndex(0);
                  }}
                />
              </div>

              <ToggleGroup
                className="bg-muted p-0.75 text-muted-foreground **:data-[slot=toggle-group-item]:rounded-md **:data-[slot=toggle-group-item]:border **:data-[slot=toggle-group-item]:border-transparent **:data-[slot=toggle-group-item]:text-foreground/60 **:data-[slot=toggle-group-item]:hover:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:bg-background [&_[data-slot=toggle-group-item][data-state=on]]:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:shadow-sm dark:[&_[data-slot=toggle-group-item][data-state=on]]:border-input dark:[&_[data-slot=toggle-group-item][data-state=on]]:bg-input/30"
                onValueChange={(value) => {
                  if (!value) return;
                  setActiveRoleFilter(value);
                  table.getColumn("role")?.setFilterValue(value === "All Roles" ? undefined : value);
                  table.setPageIndex(0);
                }}
                size="sm"
                spacing={1}
                type="single"
                value={activeRoleFilter}
              >
                <ToggleGroupItem value="All Roles">All Roles</ToggleGroupItem>
                {rolesLoading ? (
                  <Skeleton className="h-6 w-16 mx-1" />
                ) : (
                  roles.map((role) => (
                    <ToggleGroupItem key={role.id} value={role.role_name}>
                      {role.role_name}
                    </ToggleGroupItem>
                  ))
                )}
              </ToggleGroup>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => table.getColumn("id")?.toggleSorting(table.getColumn("id")?.getIsSorted() === "asc")}
              >
                <ArrowUpDown />
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="border-y">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <TableRow key={i}>
                      {columns.map((_, idx) => (
                        <TableCell key={idx}>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-48">
                      <div className="flex flex-col items-center justify-center gap-2 text-center">
                        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                          <UserX className="size-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">No users found</p>
                        <p className="text-xs text-muted-foreground">Try adjusting your search or add a new user.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 pb-1">
            <div className="flex-1 text-sm text-muted-foreground">
              Showing {table.getFilteredRowModel().rows.length} user(s).
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <p className="hidden text-sm font-medium sm:block">Rows per page</p>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to last page</span>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditUserDialog open={isEditOpen} onOpenChange={setIsEditOpen} user={editUser} onSuccess={refetch} />
    </>
  );
}
