"use client";

import * as React from "react";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InventoryStats } from "./_components/inventory-stats";
import { InventoryTable } from "./_components/inventory-table";
import { LowStockRulesModal } from "./_components/low-stock-rules-modal";
import useInventory from "@/hooks/useInventory";

export default function InventoryPage() {
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [sorting, setSorting] = React.useState<any>([]);
  const [rulesOpen, setRulesOpen] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, loading, mutate } = useInventory({
    page,
    per_page: perPage,
    search: debouncedSearch,
    status: statusFilter,
    sort_by: sorting?.[0]?.id,
    sort_order: sorting?.[0]?.desc ? "desc" : "asc",
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Inventory</h1>
          <p className="text-muted-foreground text-sm">Monitor stock levels and manage product inventory.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setRulesOpen(true)}
          className="h-9 gap-2 shadow-xs border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-amber-950/20"
        >
          <SlidersHorizontal className="size-4 text-amber-600" />
          <span>Low Stock Rules</span>
        </Button>
      </div>

      <InventoryStats
        summary={data?.summary}
        loading={loading}
        onOpenLowStockRules={() => setRulesOpen(true)}
        statusFilter={statusFilter}
        onSelectStatusFilter={setStatusFilter}
      />
      <InventoryTable
        records={data?.records}
        loading={loading}
        page={page}
        setPage={setPage}
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sorting={sorting}
        setSorting={setSorting}
        mutate={mutate}
      />

      <LowStockRulesModal
        open={rulesOpen}
        onOpenChange={setRulesOpen}
        currentRule={data?.summary?.low_stock_rule}
        onRulesSaved={mutate}
      />
    </div>
  );
}
