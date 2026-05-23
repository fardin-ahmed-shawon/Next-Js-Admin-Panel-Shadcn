import * as React from "react";

import { Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import type { OrderRow } from "./orders-table";

interface ProductsModalProps {
  order: OrderRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductsModal({ order, open, onOpenChange }: ProductsModalProps) {
  if (!order) return null;

  // Generate dummy product details based on the images and order category
  const products = order.productImages.map((img, i) => {
    const price = Math.round(order.total / order.productImages.length);
    return {
      id: `PROD-${i + 1}`,
      image: img,
      name: `${order.category} - ${order.subCategory} Item ${i + 1}`,
      size: i % 2 === 0 ? "—" : "L",
      color: i % 2 === 0 ? "—" : "Black",
      qty: 1,
      price: price,
    };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] p-0 gap-0 overflow-hidden bg-background border-border/50 shadow-2xl">
        <DialogHeader className="px-4 py-3 border-b border-border/50 bg-background/95 backdrop-blur">
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Package className="size-4" />
            Ordered Products <span className="text-muted-foreground font-normal">— {order.id}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="w-full max-h-[60vh] overflow-y-auto p-3 bg-muted/20">
          <div className="flex flex-col gap-2.5">
            {products.map((prod, idx) => (
              <div
                key={idx}
                className="group relative flex flex-row items-stretch overflow-hidden rounded-lg border border-border/60 bg-card text-card-foreground shadow-sm"
              >
                {/* Image Section - Very small width */}
                <div className="relative w-[90px] h-[90px] shrink-0 overflow-hidden bg-muted">
                  <img src={prod.image} alt={prod.name} className="size-full object-cover" />
                </div>

                {/* Content Section - Compact and vertically centered */}
                <div className="flex flex-1 flex-col justify-center p-2.5 gap-1.5 relative">
                  <h4 className="font-semibold text-[13px] leading-tight line-clamp-2 pr-6">{prod.name}</h4>
                  <span className="absolute top-2.5 right-2.5 text-[11px] font-medium text-muted-foreground">
                    x{prod.qty}
                  </span>

                  <div className="flex flex-col gap-1.5 mt-1">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-muted-foreground w-8">Size:</span>
                      <Badge
                        variant="outline"
                        className="rounded bg-transparent border-border/50 px-1.5 font-normal h-4 text-[10px]"
                      >
                        {prod.size}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground w-8">Color:</span>
                        <Badge
                          variant="outline"
                          className="rounded bg-transparent border-border/50 px-1.5 font-normal h-4 text-[10px]"
                        >
                          {prod.color}
                        </Badge>
                      </div>
                      <span className="font-semibold text-[13px] text-foreground tracking-tight">৳{prod.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
