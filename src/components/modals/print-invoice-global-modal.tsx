"use client";

import { usePrintModal } from "@/hooks/usePrintModal";
import { PrintInvoiceModal } from "./print-invoice-modal";

export function PrintInvoiceGlobalModal() {
  const { open, orderIds, type, onSuccess, closeModal } = usePrintModal();

  return (
    <PrintInvoiceModal
      open={open}
      onOpenChange={closeModal}
      orderIds={orderIds}
      type={type}
      onSuccess={onSuccess}
    />
  );
}
