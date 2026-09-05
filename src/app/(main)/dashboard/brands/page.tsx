"use client";

import * as React from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddBrandDialog } from "./_components/add-brand-dialog";
import { BrandsStats } from "./_components/brands-stats";
import { BrandsTable } from "./_components/brands-table";
import { toast } from "sonner";
import { fetchClient } from "@/lib/fetch-client";
import { useBrands, getBrandsApiUrl } from "@/hooks/useBrands";

export default function BrandsPage() {
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const { brands, stats, loading, refreshBrands } = useBrands();

  // Add brand handler
  const handleAddBrand = async (formData: FormData) => {
    try {
      const url = getBrandsApiUrl();
      const response = await fetchClient(url, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message || "Brand added successfully");
        await refreshBrands();
        return true;
      } else {
        if (result.errors) {
          const errors = Object.values(result.errors).flat();
          toast.error(errors.join(", "));
        } else {
          toast.error(result.message || "Failed to add brand");
        }
        return false;
      }
    } catch (error) {
      console.error("Add brand error:", error);
      toast.error("Failed to add brand");
      return false;
    }
  };

  // Update brand handler
  const handleUpdateBrand = async (id: string, formData: FormData) => {
    try {
      const numericId = id.replace("BRD-", "");
      if (!formData.has("_method")) {
        formData.append("_method", "PUT");
      }
      const url = getBrandsApiUrl(numericId);
      const response = await fetchClient(url, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message || "Brand updated successfully");
        await refreshBrands();
        return true;
      } else {
        if (result.errors) {
          const errors = Object.values(result.errors).flat();
          toast.error(errors.join(", "));
        } else {
          toast.error(result.message || "Failed to update brand");
        }
        return false;
      }
    } catch (error) {
      console.error("Update brand error:", error);
      toast.error("Failed to update brand");
      return false;
    }
  };

  // Delete brand handler
  const handleDeleteBrand = async (id: string) => {
    try {
      const numericId = id.replace("BRD-", "");
      const url = getBrandsApiUrl(numericId);
      const response = await fetchClient(url, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message || "Brand deleted successfully");
        await refreshBrands();
      } else {
        toast.error(result.message || "Failed to delete brand");
      }
    } catch (error) {
      console.error("Delete brand error:", error);
      toast.error("Failed to delete brand");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight font-semibold">Brands</h1>
          <p className="text-muted-foreground text-sm">Manage all product brands and their status.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
            <PlusCircle className="h-4 w-4" />
            Add Brand
          </Button>
          <AddBrandDialog open={isAddOpen} onOpenChange={setIsAddOpen} onAddBrand={handleAddBrand} />
        </div>
      </div>

      <BrandsStats
        totalBrands={stats.total}
        newThisMonth={stats.newThisMonth}
        totalProducts={stats.totalProducts}
        topTier={stats.topTier}
      />

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px] rounded-xl border bg-card/50">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading brands...</p>
          </div>
        </div>
      ) : (
        <BrandsTable
          data={brands}
          onDelete={handleDeleteBrand}
          onUpdate={handleUpdateBrand}
          onRefresh={refreshBrands}
        />
      )}
    </div>
  );
}
