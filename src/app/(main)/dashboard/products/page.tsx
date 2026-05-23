import Link from "next/link";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ProductsStats } from "./_components/products-stats";
import { ProductsTable } from "./_components/products-table";

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">All Products</h1>
          <p className="text-muted-foreground text-sm">Manage your product catalog.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link href="/dashboard/products/add">
              <Plus className="mr-2 size-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      <ProductsStats />
      <ProductsTable />
    </div>
  );
}
