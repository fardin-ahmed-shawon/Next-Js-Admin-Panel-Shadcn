"use client";

import * as React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { EditProductDialog } from "./edit-product-dialog";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
const FLASH_SALE_API_URL = "flash-sales";

const getFlashSaleUrl = (flashSaleId: string, path: string = "") => {
  let baseUrl = API_BASE_URL;
  if (!baseUrl.endsWith("/")) {
    baseUrl += "/";
  }
  const fullPath = path ? `${FLASH_SALE_API_URL}/${flashSaleId}/${path}` : `${FLASH_SALE_API_URL}/${flashSaleId}`;
  return `${baseUrl}${fullPath}`.replace(/([^:]\/)\/+/g, "$1");
};

interface FlashSaleProductsTableProps {
  flashSaleId: string;
  refreshTrigger: number;
  onProductDeleted?: () => void;
}

export function FlashSaleProductsTable({ flashSaleId, refreshTrigger, onProductDeleted }: FlashSaleProductsTableProps) {
  const [data, setData] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState<any>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      const response = await fetch(getFlashSaleUrl(flashSaleId, "products"), {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const result = await response.json();
      let parsedData = [];
      if (Array.isArray(result.data?.data)) parsedData = result.data.data;
      else if (Array.isArray(result.data)) parsedData = result.data;
      else if (Array.isArray(result)) parsedData = result;
      setData(parsedData);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, [flashSaleId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  const handleDelete = async () => {
    if (!productToDelete) return;
    
    setIsDeleting(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      const response = await fetch(getFlashSaleUrl(flashSaleId, `products/${productToDelete.id}`), {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      toast.success("Product removed from flash sale successfully");
      setDeleteDialogOpen(false);
      onProductDeleted?.();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to remove product from flash sale");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "product_id",
      header: "Product",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.product?.name || row.original.product?.title || `Product ID: ${row.getValue("product_id")}`}
        </div>
      ),
    },
    {
      accessorKey: "discount_type",
      header: "Discount Type",
      cell: ({ row }) => {
        const type = row.getValue("discount_type") as string;
        return <div className="capitalize">{type.replace("_", " ")}</div>;
      },
    },
    {
      accessorKey: "discount_amount",
      header: "Discount Amount",
      cell: ({ row }) => {
        const type = row.getValue("discount_type") as string;
        const amount = row.getValue("discount_amount") as string;
        
        if (type === "percent") {
          return <div>{amount}%</div>;
        } else if (type === "fixed_price") {
          return <div>${amount}</div>; // Format based on your currency
        }
        return <div>-${amount}</div>;
      },
    },
    {
      accessorKey: "quantity",
      header: "Quantity Limit",
      cell: ({ row }) => {
        const qty = row.getValue("quantity");
        return <div>{qty !== null ? qty : "Unlimited"}</div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const product = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedProduct(product);
                  setEditDialogOpen(true);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Product
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                onClick={() => {
                  setProductToDelete(product);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash className="mr-2 h-4 w-4" />
                Remove Product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flash Sale Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    {isLoading ? "Loading..." : "No products added to this flash sale yet."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>

        {selectedProduct && (
          <EditProductDialog
            flashSaleId={flashSaleId}
            flashSaleProduct={selectedProduct}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onProductUpdated={fetchData}
          />
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the product "{productToDelete?.product?.name || `ID: ${productToDelete?.product_id}`}" from the flash sale.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete();
                }}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Removing..." : "Remove"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
