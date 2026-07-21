"use client";

import React, { useEffect, useState } from "react";
import { useAutoOrder } from "@/hooks/useAutoOrder";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchWrapper } from "@/utils/fetch-wrapper";
import { Trash2 } from "lucide-react";

export default function AutoOrderPage() {
  const {
    priorities,
    isAutoOrderEnabled,
    isLoading,
    fetchPriorities,
    toggleAutoOrder,
    addPriority,
    updatePriorityStatus,
    deletePriority
  } = useAutoOrder();

  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<"active" | "inactive">("active");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchPriorities();
    fetchUsers();
  }, [fetchPriorities]);

  const fetchUsers = async () => {
    try {
      const res = await fetchWrapper("/users");
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = async () => {
    if (!selectedUser) return;
    const success = await addPriority(Number(selectedUser), selectedStatus);
    if (success) {
      setIsDialogOpen(false);
      setSelectedUser("");
      setSelectedStatus("active");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Auto Order Distribution</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage the sequence of automatic order assignments to employees.</p>
        </div>
        <div className="flex items-center space-x-3 bg-secondary/20 p-3 rounded-lg">
          <span className="font-semibold text-sm">System {isAutoOrderEnabled ? "Enabled" : "Disabled"}</span>
          <Switch 
            checked={isAutoOrderEnabled} 
            onCheckedChange={toggleAutoOrder}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Priority Sequence List</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Employee</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Employee to Auto Order</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Employee</label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(u => (
                        <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Initial Status</label>
                  <Select value={selectedStatus} onValueChange={(v: any) => setSelectedStatus(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleAdd} disabled={!selectedUser}>Add to Queue</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Seq ID</TableHead>
              <TableHead>Employee Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {priorities.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">#{p.id}</TableCell>
                <TableCell>{p.user?.name}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={p.status === "active"}
                      onCheckedChange={(val) => updatePriorityStatus(p.id, val ? "active" : "inactive")}
                    />
                    <span className="text-sm capitalize">{p.status}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => deletePriority(p.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {priorities.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                  No employees added to the auto order distribution system yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
