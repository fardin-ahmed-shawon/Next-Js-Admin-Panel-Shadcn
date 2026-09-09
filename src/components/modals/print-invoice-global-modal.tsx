"use client";

import { useModularFeatures } from "@/hooks/useModularFeatures";
import { usePrintModal } from "@/hooks/usePrintModal";
import { PrintInvoiceModal } from "./print-invoice-modal";

export function PrintInvoiceGlobalModal() {
  const { open, orderIds, type, onSuccess, closeModal } = usePrintModal();

  const { features } = useModularFeatures();
  if (!features?.["orders_invoice_" + type]) return null;

  return (
    <PrintInvoiceModal open={open} onOpenChange={closeModal} orderIds={orderIds} type={type} onSuccess={onSuccess} />
  );
}
