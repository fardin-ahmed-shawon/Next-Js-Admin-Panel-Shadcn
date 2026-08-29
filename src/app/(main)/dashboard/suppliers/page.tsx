"use client";

import * as React from "react";
import { Building2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { fetchClient } from "@/lib/fetch-client";
import { AddSupplierDialog } from "./_components/add-supplier-dialog";
import { SuppliersStats } from "./_components/suppliers-stats";
import { SuppliersTable, type SupplierItem } from "./_components/suppliers-table";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = React.useState<SupplierItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalRecords, setTotalRecords] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  // Debounce search
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchSuppliers = React.useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: "15",
        search: debouncedSearch,
      });

      const res = await fetchClient(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}suppliers?${queryParams.toString()}`
      );
      const data = await res.json();

      if (res.ok && data.success) {
        setSuppliers(data.data.data || []);
        setTotalPages(data.data.last_page || 1);
        setTotalRecords(data.data.total || 0);
      } else {
        toast.error(data.message || "Failed to load suppliers.");
      }
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      toast.error("Failed to load suppliers.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  React.useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Aggregate stats
  const stats = React.useMemo(() => {
    const totalLots = suppliers.reduce((sum, s) => sum + (s.inventory_lots_count || 0), 0);
    const totalUnits = suppliers.reduce((sum, s) => sum + Number(s.total_procured_qty || 0), 0);
    const activeLots = suppliers.filter((s) => Number(s.total_remaining_qty || 0) > 0).length;
    return {
      totalSuppliers: totalRecords,
      totalLotsSupplied: totalLots,
      totalUnitsSupplied: totalUnits,
      activeLotsCount: activeLots,
    };
  }, [suppliers, totalRecords]);

  // Add Supplier
  const handleAddSupplier = async (formData: { name: string }) => {
    try {
      const res = await fetchClient(`${process.env.NEXT_PUBLIC_API_BASE_URL}suppliers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || "Supplier created successfully.");
        fetchSuppliers();
        return true;
      } else {
        toast.error(data.message || "Failed to create supplier.");
        return false;
      }
    } catch (err) {
      console.error("Error creating supplier:", err);
      toast.error("Failed to create supplier.");
      return false;
    }
  };

  // Update Supplier
  const handleUpdateSupplier = async (id: number, formData: { name: string }) => {
    try {
      const res = await fetchClient(`${process.env.NEXT_PUBLIC_API_BASE_URL}suppliers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || "Supplier updated successfully.");
        fetchSuppliers();
        return true;
      } else {
        toast.error(data.message || "Failed to update supplier.");
        return false;
      }
    } catch (err) {
      console.error("Error updating supplier:", err);
      toast.error("Failed to update supplier.");
      return false;
    }
  };

  // Delete Supplier
  const handleDeleteSupplier = async (id: number) => {
    try {
      const res = await fetchClient(`${process.env.NEXT_PUBLIC_API_BASE_URL}suppliers/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || "Supplier deleted successfully.");
        fetchSuppliers();
      } else {
        toast.error(data.message || "Failed to delete supplier.");
      }
    } catch (err) {
      console.error("Error deleting supplier:", err);
      toast.error("Failed to delete supplier.");
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-semibold text-3xl tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground text-sm">
            Manage vendors, procurement sources, and supplier relationships for inventory replenishment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
            <PlusCircle className="size-4" />
            Add Supplier
          </Button>
          <AddSupplierDialog
            open={isAddOpen}
            onOpenChange={setIsAddOpen}
            onAddSupplier={handleAddSupplier}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <SuppliersStats
        totalSuppliers={stats.totalSuppliers}
        totalLotsSupplied={stats.totalLotsSupplied}
        totalUnitsSupplied={stats.totalUnitsSupplied}
        activeLotsCount={stats.activeLotsCount}
      />

      {/* Table */}
      <SuppliersTable
        data={suppliers}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalRecords={totalRecords}
        onPageChange={setPage}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onDeleteSupplier={handleDeleteSupplier}
        onUpdateSupplier={handleUpdateSupplier}
      />
    </div>
  );
}
