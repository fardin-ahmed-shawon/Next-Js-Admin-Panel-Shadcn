"use client";

import * as React from "react";
import { Briefcase, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEmployeeOrders, EmployeeOrder } from "@/hooks/useEmployeeOrders";
import { AssignOrdersTable } from "./_components/assign-orders-table";
import { AssignOrderDialog } from "./_components/assign-order-dialog";

export default function AssignOrdersPage() {
  const { data: assignments, isLoading, deleteAssignment } = useEmployeeOrders();
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingAssignment, setEditingAssignment] = React.useState<EmployeeOrder | null>(null);

  const handleCreateNew = () => {
    setEditingAssignment(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (assignment: EmployeeOrder) => {
    setEditingAssignment(assignment);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this assignment?")) {
      try {
        await deleteAssignment(id);
      } catch (err: any) {
        alert(err.message || "Failed to delete assignment");
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl tracking-tight flex items-center gap-2">
            Assign Orders
            {isLoading && <Loader2 className="size-5 animate-spin text-muted-foreground" />}
          </h1>
          <p className="text-muted-foreground text-sm">
            Delegate specific orders to your employees and manage assignments.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:items-end">
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 size-4" />
            Assign New Order
          </Button>
        </div>
      </div>

      <AssignOrdersTable 
        data={assignments} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />

      <AssignOrderDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        assignmentToEdit={editingAssignment}
      />
    </div>
  );
}
