import useSWR from "swr";
import { fetchClient } from "@/lib/fetch-client";
import { useAuth } from "@/hooks/useAuth";
import { adminApiUrl, readAdminApiResponse } from "@/lib/admin-api";
import { canUseAllOrdersToggle } from "@/hooks/useRoles";
import type { ComparisonStatus } from "@/hooks/useCodChangeReports";

export type CourierAmount = number | string | null;
export interface SteadfastPayment {
  payment_id: string;
  amount: CourierAmount;
  method: string;
  due_bills: CourierAmount;
  paid_bills: CourierAmount;
  charges: CourierAmount;
  total: CourierAmount;
  status_label: string;
  created_at: string | null;
  ready_at: string | null;
  paid_at: string | null;
}
export interface SteadfastConsignment {
  consignment_id: string | number;
  invoice: string | null;
  tracking_code: string;
  tracking_link: string | null;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_email: string | null;
  alternative_phone: string | null;
  item_description: string | null;
  total_lot: number;
  cod_amount: CourierAmount;
  status: string;
  note: string | null;
  created_at: string | null;
  updated_at: string | null;
}
export interface SteadfastPaymentDetail extends SteadfastPayment {
  consignments: SteadfastConsignment[];
}
export interface SteadfastPaymentComparisonRow {
  consignment_id: string;
  merchant_order_id: string;
  order_id: number | null;
  collectable_amount: string | null;
  grand_total_amount: string | null;
  difference: string | null;
  status: ComparisonStatus;
  message: string | null;
  marked: boolean;
  adjusted_at: string | null;
}
interface SteadfastPaymentComparison {
  rows: SteadfastPaymentComparisonRow[];
  can_mark: boolean;
  can_adjust: boolean;
}
const fetcher = async ([url]: [string, number]) => {
  const response = await fetchClient(url, { cache: "no-store" });
  if (response.status === 404 && url.includes("/steadfast/payments/"))
    throw new Error("This payment was not found in Steadfast.");
  return readAdminApiResponse(response);
};

export function useSteadfastPayments() {
  const { user } = useAuth();
  const endpoint = process.env.NEXT_PUBLIC_API_STEADFAST_PAYMENTS_URL || "steadfast/payments";
  const canView = canUseAllOrdersToggle(user);

  const { data, error, isLoading, mutate, isValidating } = useSWR<{ data: { payments: SteadfastPayment[] } }>(
    user?.id && canView ? [adminApiUrl(endpoint), user.id] : null,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );

  return {
    data: data?.data.payments ?? [],
    canView,
    isValidating,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useSteadfastPayment(paymentId: string) {
  const { user } = useAuth();
  const canView = canUseAllOrdersToggle(user);
  const validId = /^SFC-\d{1,30}$/.test(paymentId);
  const { data, error, isLoading, mutate, isValidating } = useSWR<{
    data: { payment: SteadfastPaymentDetail; comparison: SteadfastPaymentComparison };
  }>(
    user?.id && canView && validId
      ? [adminApiUrl(`steadfast/payments/${encodeURIComponent(paymentId)}`), user.id]
      : null,
    fetcher,
    { revalidateOnFocus: false },
  );
  return {
    data: data?.data.payment,
    comparison: data?.data.comparison,
    error,
    isLoading,
    mutate,
    isValidating,
    canView,
    validId,
  };
}

export async function reconcileSteadfastPayment(
  paymentId: string,
  action: "cod-changes" | "accounts-adjustment",
  rows: SteadfastPaymentComparisonRow[],
): Promise<{ message: string }> {
  let processed = 0;
  let skipped = 0;
  for (let offset = 0; offset < rows.length; offset += 100) {
    try {
      const result = (await readAdminApiResponse(
        await fetchClient(adminApiUrl(`steadfast/payments/${encodeURIComponent(paymentId)}/${action}`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rows: rows
              .slice(offset, offset + 100)
              .map(({ consignment_id, merchant_order_id, collectable_amount, grand_total_amount }) => ({
                consignment_id,
                merchant_order_id,
                collectable_amount,
                grand_total_amount,
              })),
          }),
        }),
      )) as { data: { processed: number; skipped: number } };
      processed += result.data.processed;
      skipped += result.data.skipped;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to complete this action.";
      throw new Error(`${processed} orders completed, ${skipped} already completed orders skipped. ${message}`);
    }
  }
  return {
    message: `${processed} orders ${action === "accounts-adjustment" ? "adjusted" : "marked as COD Changed"}. ${skipped} already completed orders skipped.`,
  };
}
