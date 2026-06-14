"use client";

import * as React from "react";
import { Archive } from "lucide-react";

import { InventoryStats } from "./_components/inventory-stats";
import { InventoryTable } from "./_components/inventory-table";
import useInventory from "@/hooks/useInventory";

export default function InventoryPage() {
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All");

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, loading } = useInventory({
    page,
    per_page: perPage,
    search: debouncedSearch,
    status: statusFilter,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Inventory</h1>
          <p className="text-muted-foreground text-sm">Monitor stock levels and manage product inventory.</p>
        </div>
      </div>

      <InventoryStats summary={data?.summary} loading={loading} />
      <InventoryTable 
        records={data?.records} 
        loading={loading}
        page={page}
        setPage={setPage}
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
    </div>
  );
}
