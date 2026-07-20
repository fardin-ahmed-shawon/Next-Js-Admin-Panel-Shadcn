"use client";

import { useParams } from "next/navigation";
import { EditOrderForm } from "../_components/edit-order-form";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) return null;

  return <EditOrderForm orderId={id} />;
}
