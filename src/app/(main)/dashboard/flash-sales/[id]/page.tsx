"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import { AddProductDialog } from "./_components/add-product-dialog";
import { FlashSaleProductsTable } from "./_components/flash-sale-products-table";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
const FLASH_SALE_API_URL = "flash-sales";

const getFlashSaleUrl = (path: string = "") => {
  let baseUrl = API_BASE_URL;
  if (!baseUrl.endsWith("/")) {
    baseUrl += "/";
  }
  const fullPath = path ? `${FLASH_SALE_API_URL}/${path}` : FLASH_SALE_API_URL;
  return `${baseUrl}${fullPath}`.replace(/([^:]\/)\/+/g, "$1");
};

export default function FlashSaleProductsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [flashSale, setFlashSale] = useState<any>(null);

  useEffect(() => {
    const fetchFlashSale = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        
        const response = await fetch(getFlashSaleUrl(id), {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load flash sale details");
        }

        const data = await response.json();
        setFlashSale(data);
      } catch (error) {
        toast.error("Failed to load flash sale details");
      }
    };

    if (id) {
      fetchFlashSale();
    }
  }, [id]);

  const handleProductAdded = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleProductDeleted = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/flash-sales")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1 flex-1">
          <h1 className="text-3xl tracking-tight">
            {flashSale ? `Manage Products: ${flashSale.title}` : "Loading Flash Sale..."}
          </h1>
          <p className="text-muted-foreground text-sm">
            Add and manage products for this flash sale.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AddProductDialog flashSaleId={id} onProductAdded={handleProductAdded} />
        </div>
      </div>

      <FlashSaleProductsTable 
        flashSaleId={id} 
        refreshTrigger={refreshTrigger} 
        onProductDeleted={handleProductDeleted} 
      />
    </div>
  );
}
