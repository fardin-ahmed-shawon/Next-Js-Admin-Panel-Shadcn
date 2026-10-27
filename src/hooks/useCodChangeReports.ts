import useSWR from "swr";
import { useAuth } from "@/hooks/useAuth";
import { adminApiUrl, readAdminApiResponse } from "@/lib/admin-api";
import { fetchClient } from "@/lib/fetch-client";

export type ComparisonStatus = "matched" | "mismatch" | "not_found" | "invalid" | "duplicate_csv" | "ambiguous_order";
export const comparisonLabels: Record<ComparisonStatus, string> = {
  matched: "Matched",
  mismatch: "Amount mismatch",
  not_found: "Order not found",
  invalid: "Invalid row",
  duplicate_csv: "Duplicate CSV order",
  ambiguous_order: "Ambiguous system order",
};
export interface CodImport {
  id: number;
  filename: string;
  row_count: number;
  created_at: string;
  uploaded_by_name?: string;
}
export interface CodRow {
  id: number;
  row_number: number;
  merchant_order_id: string | null;
  collectable_amount: string | null;
  grand_total_amount: string | null;
  difference: string | null;
  order_date: string | null;
  adjusted_at: string | null;
  adjusted_by_name: string | null;
  previous_paid_amount: string | null;
  payment_id: number | null;
  status: ComparisonStatus;
  message: string | null;
  raw_data: Record<string, string> | string[];
}
interface Page<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}
interface HistoryResponse {
  data: Page<CodImport>;
}
interface ReportResponse {
  import: CodImport;
  can_adjust: boolean;
  data: Page<CodRow>;
  summary: {
    row_count: number;
    counts: Partial<Record<ComparisonStatus, number>>;
    totals: { collectable_total: string | null; system_total: string | null; net_difference: string | null };
  };
}
const fetcher = async ([url]: [string, number]) => readAdminApiResponse(await fetchClient(url));

export function useCodImports(page: number) {
  const user = useAuth((state) => state.user);
  return useSWR<HistoryResponse>(
    user ? [adminApiUrl(`cod-change-reports?page=${page}&per_page=10`), user.id] : null,
    fetcher,
  );
}

export function useCodReport(
  id: number | null,
  page: number,
  status: string,
  search: string,
  dates: { from: string; to: string },
) {
  const user = useAuth((state) => state.user);
  const query = new URLSearchParams({
    page: String(page),
    per_page: "50",
    status,
    search,
    start_date: dates.from,
    end_date: dates.to,
  });
  return useSWR<ReportResponse>(
    user && id ? [adminApiUrl(`cod-change-reports/${id}?${query}`), user.id] : null,
    fetcher,
  );
}

export async function adjustCodAccounts(importId: number, rowId: number): Promise<{ message: string }> {
  return readAdminApiResponse(
    await fetchClient(adminApiUrl(`cod-change-reports/${importId}/rows/${rowId}/accounts-adjustment`), {
      method: "POST",
    }),
  );
}

export async function uploadCodReport(
  file: File,
): Promise<{ data: { id: number; duplicate: boolean }; message: string }> {
  const body = new FormData();
  body.append("file", file);
  return readAdminApiResponse(await fetchClient(adminApiUrl("cod-change-reports"), { method: "POST", body }));
}
