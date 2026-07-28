"use client";

import { CreateOrderForm } from "./_components/create-order-form";
import { useModularFeatures } from "@/hooks/useModularFeatures";

export default function CreateOrderPage() {
  const { features } = useModularFeatures();

  if (features?.orders_manual_create === false || String(features?.orders_manual_create) === "0") {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <h2 className="text-2xl font-bold">Feature Disabled</h2>
        <p className="text-muted-foreground mt-2">The Manual Create Order feature is currently disabled.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <CreateOrderForm />
    </div>
  );
}
