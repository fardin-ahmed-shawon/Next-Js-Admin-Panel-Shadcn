import useSWR, { mutate } from "swr";
import { fetchClient } from "@/lib/fetch-client";

export interface CrmRecipient {
  id: number;
  full_name: string;
  department: string | null;
  department_id: number | null;
  designation: string | null;
  designation_id: number | null;
  can_manage_team: boolean;
}

interface AssignmentOptions {
  can_assign: boolean;
  all_customers: boolean;
  data: CrmRecipient[];
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";

export function useCrmAssignments() {
  const { data, error } = useSWR<AssignmentOptions>(`${baseUrl}crm/assignments/options`, async (url: string) => {
    const response = await fetchClient(url);
    if (!response.ok) throw new Error("Unable to load CRM assignment options");
    return response.json();
  });
  return { options: data, error };
}

export async function assignCrmCustomers(customerIds: (string | number)[], userId: number | null, mode: "handover" | "assign") {
  const response = await fetchClient(`${baseUrl}crm/assignments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customer_ids: customerIds, user_id: userId, mode }),
  });
  const result = await response.json();
  if (!response.ok) {
    const validation = result.errors ? Object.values(result.errors).flat().join(" ") : "";
    throw new Error(validation || result.message || "Unable to assign customers");
  }
  await mutate((key) => typeof key === "string" && key.startsWith(baseUrl)
    && (key.includes("customers") || key.includes("crm/follow-ups") || key.includes("crm/sms/logs")));
  return result;
}
