"use client";

import { CreateOrderForm } from "../create/_components/create-order-form";
import { useModularFeatures } from "@/hooks/useModularFeatures";

export default function WholesaleCreateOrderPage() {
  const { features } = useModularFeatures();

  if (features?.orders_wholesale_create === false || String(features?.orders_wholesale_create) === "0") {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <h2 className="text-2xl font-bold">Feature Disabled</h2>
        <p className="text-muted-foreground mt-2">The Wholesale Create Order feature is currently disabled.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <CreateOrderForm isWholesale />
    </div>
  );
}
