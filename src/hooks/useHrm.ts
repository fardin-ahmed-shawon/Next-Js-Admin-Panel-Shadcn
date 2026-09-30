import useSWR from "swr";
import { fetchClient } from "@/lib/fetch-client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
const HRM_BASE = `${API_BASE.replace(/\/$/, "")}/hrm`;

const fetcher = async (url: string) => {
  const res = await fetchClient(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to load data");
  }
  const json = await res.json();
  return json.data;
};

// ==========================================
// TYPES
// ==========================================

export interface Department {
  id: number;
  name: string;
  code?: string | null;
  parent_id?: number | null;
  manager_id?: number | null;
  description?: string | null;
  status: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
  employees_count?: number;
  designations?: Designation[];
  manager?: { id: number; full_name: string; email: string; phone: string } | null;
  children?: Department[];
  employees?: any[];
}

export interface Designation {
  id: number;
  department_id: number;
  title: string;
  name?: string;
  grade?: string | null;
  description?: string | null;
  status: "active" | "inactive";
  department?: Department;
}

export interface EmployeeProfile {
  id: number;
  user_id: number;
  employee_id: string;
  department_id?: number | null;
  designation_id?: number | null;
  reports_to_id?: number | null;
  joining_date?: string | null;
  employment_type: string;
  basic_salary: number;
  house_allowance: number;
  medical_allowance: number;
  transport_allowance: number;
  food_allowance: number;
  other_allowance: number;
  total_allowance: number;
  gross_salary: number;
  blood_group?: string | null;
  emergency_contact?: string | null;
  address?: string | null;
  bank_name?: string | null;
  bank_account_no?: string | null;
  bkash_or_nagad?: string | null;
  status: string;
  department?: Department | null;
  designation?: Designation | null;
  manager?: { id: number; full_name: string; email: string } | null;
}

export interface HrmEmployee {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  role?: { id: number; role_name: string };
  employee_detail?: EmployeeProfile | null;
}

export interface AttendanceRecord {
  id: number;
  user_id: number;
  date: string;
  check_in?: string | null;
  check_out?: string | null;
  working_hours: number;
  overtime_hours: number;
  late_minutes: number;
  early_leave_minutes: number;
  status: "Present" | "Absent" | "Late" | "Half Day" | "On Leave" | "Holiday";
  notes?: string | null;
  ip_address?: string | null;
  user?: HrmEmployee;
}

export interface SalaryIncentiveRule {
  id: number;
  rule_name: string;
  department_id?: number | null;
  user_id?: number | null;
  min_delivered_orders: number;
  order_delivered_bonus: number;
  min_delivered_value: number;
  delivered_value_commission_pct: number;
  collection_commission_pct: number;
  upsell_commission_pct: number;
  extra_hours_bonus_rate: number;
  extra_hours_min_threshold: number;
  extra_hours_salary_pct: number;
  status: "active" | "inactive";
  notes?: string | null;
  department?: Department | null;
  user?: HrmEmployee | null;
  created_at?: string;
  updated_at?: string;
}

export interface SalaryRecord {
  id: number;
  user_id: number;
  month: number;
  year: number;
  basic_salary: number;
  total_allowance: number;
  commission_amount?: number;
  incentive_rule_id?: number | null;
  incentive_details?: {
    delivered_orders_count?: number;
    delivered_orders_bonus?: number;
    delivered_order_value?: number;
    delivered_value_commission?: number;
    collection_value?: number;
    collection_commission?: number;
    upsell_count?: number;
    upsell_value?: number;
    upsell_commission?: number;
    overtime_hours?: number;
    overtime_amount?: number;
    extra_hours_bonus?: number;
  } | null;
  incentive_rule?: SalaryIncentiveRule | null;
  bonus: number;
  overtime_amount: number;
  gross_salary: number;
  loan_deduction: number;
  absent_deduction: number;
  other_deduction: number;
  total_deduction: number;
  net_salary: number;
  payment_status: "unpaid" | "paid" | "partial";
  payment_method?: string | null;
  payment_date?: string | null;
  transaction_ref?: string | null;
  notes?: string | null;
  user?: HrmEmployee;
}

export interface TaskRecord {
  id: number;
  assigned_to: number;
  assigned_by?: number | null;
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed";
  created_at: string;
  updated_at: string;
  assignee?: HrmEmployee | null;
  creator?: HrmEmployee | null;
}

export interface DepartmentPerformanceData {
  summary: {
    total_employees: number;
    total_orders: number;
    delivered_orders: number;
    cancelled_orders: number;
    returned_orders: number;
    total_revenue: number;
    total_upsell_value: number;
    total_tasks: number;
    completed_tasks: number;
    delivery_rate: number;
    cancellation_rate: number;
    return_rate: number;
    task_completion_rate: number;
  };
  departments: Array<{
    department_id: number;
    department_name: string;
    department_code?: string | null;
    employee_count: number;
    designations_count: number;
    orders: {
      total: number;
      delivered: number;
      cancelled: number;
      returned: number;
      pending: number;
      delivery_rate: number;
      cancellation_rate: number;
      return_rate: number;
    };
    financials: {
      total_revenue: number;
      total_upsell_value: number;
      avg_revenue_per_employee: number;
    };
    tasks: {
      total: number;
      completed: number;
      in_progress: number;
      pending: number;
      completion_rate: number;
    };
  }>;
}

export interface LoanRecord {
  id: number;
  user_id: number;
  loan_type: string;
  amount: number;
  approved_amount?: number | null;
  disbursement_date: string;
  total_installments: number;
  monthly_deduction: number;
  paid_amount: number;
  remaining_amount: number;
  status: "pending" | "approved" | "active" | "repaid" | "rejected";
  purpose?: string | null;
  user?: HrmEmployee;
  repayments?: LoanRepayment[];
}

export interface LoanRepayment {
  id: number;
  loan_id: number;
  salary_id?: number | null;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes?: string | null;
}

export interface DocumentRecord {
  id: number;
  user_id: number;
  document_type: string;
  title: string;
  file_path: string;
  file_type?: string | null;
  file_size?: number | null;
  expiry_date?: string | null;
  verified: boolean;
  notes?: string | null;
  created_at: string;
  user?: HrmEmployee;
}

export interface ExitRecord {
  id: number;
  user_id: number;
  type: "resignation" | "termination" | "contract_end" | "retirement";
  notice_date?: string | null;
  exit_date?: string | null;
  notice_period_days: number;
  reason?: string | null;
  feedback?: string | null;
  asset_return_status: "pending" | "partial" | "returned";
  asset_details?: string | null;
  pending_salary: number;
  advance_adjustment: number;
  gratuity_or_bonus: number;
  final_settlement_amount: number;
  settlement_status: "unpaid" | "settled";
  settled_at?: string | null;
  status: "pending" | "approved" | "rejected" | "completed";
  created_at: string;
  user?: HrmEmployee;
}

export interface LeaveRecord {
  id: number;
  user_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  reason?: string | null;
  status: "pending" | "approved" | "rejected";
  user?: HrmEmployee;
  approver?: { id: number; full_name: string } | null;
}

export interface NoticeRecord {
  id: number;
  title: string;
  content: string;
  priority: "low" | "medium" | "high" | "urgent";
  target_department_id?: number | null;
  created_at: string;
}

export interface WarningRecord {
  id: number;
  user_id: number;
  subject: string;
  description: string;
  warning_date: string;
  severity: "verbal" | "written" | "final";
  user?: HrmEmployee;
  issuer?: { id: number; full_name: string } | null;
}


// ==========================================
// HOOKS
// ==========================================

export function useHrmOverview() {
  const { data, error, isLoading, mutate } = useSWR(`${HRM_BASE}/overview`, fetcher, {
    revalidateOnFocus: true,
  });
  return { overview: data, loading: isLoading, error, refetch: mutate };
}

export function useHrmOrgTree() {
  const { data, error, isLoading, mutate } = useSWR(`${HRM_BASE}/org-tree`, fetcher, {
    revalidateOnFocus: false,
  });
  return { orgData: data, loading: isLoading, error, refetch: mutate };
}

export function useHrmDepartments() {
  const { data, error, isLoading, mutate } = useSWR(`${HRM_BASE}/departments`, fetcher);
  return { departments: (data as Department[]) || [], loading: isLoading, error, refetch: mutate };
}

export function useHrmDesignations() {
  const { data, error, isLoading, mutate } = useSWR(`${HRM_BASE}/designations`, fetcher);
  return { designations: (data as Designation[]) || [], loading: isLoading, error, refetch: mutate };
}

export function useHrmEmployees(query = "") {
  const url = `${HRM_BASE}/employees${query ? `?${query}` : ""}`;
  const { data, error, isLoading, mutate } = useSWR(url, fetcher);
  return { employees: (data as HrmEmployee[]) || [], loading: isLoading, error, refetch: mutate };
}

export function useHrmAttendances(params?: { date?: string; month?: number; year?: number; user_id?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.date) searchParams.set("date", params.date);
  if (params?.month) searchParams.set("month", String(params.month));
  if (params?.year) searchParams.set("year", String(params.year));
  if (params?.user_id) searchParams.set("user_id", String(params.user_id));

  const url = `${HRM_BASE}/attendances?${searchParams.toString()}`;
  const { data, error, isLoading, mutate } = useSWR(url, fetcher);
  return {
    attendances: (data?.attendances as AttendanceRecord[]) || [],
    summary: data?.summary,
    loading: isLoading,
    error,
    refetch: mutate,
  };
}

export function useHrmSalaries(params?: { month?: number; year?: number; payment_status?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.month) searchParams.set("month", String(params.month));
  if (params?.year) searchParams.set("year", String(params.year));
  if (params?.payment_status) searchParams.set("payment_status", params.payment_status);

  const url = `${HRM_BASE}/salaries?${searchParams.toString()}`;
  const { data, error, isLoading, mutate } = useSWR(url, fetcher);
  return {
    salaries: (data?.salaries as SalaryRecord[]) || [],
    summary: data?.summary,
    loading: isLoading,
    error,
    refetch: mutate,
  };
}

export function useHrmLoans(params?: { user_id?: number; status?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.user_id) searchParams.set("user_id", String(params.user_id));
  if (params?.status) searchParams.set("status", params.status);

  const url = `${HRM_BASE}/loans?${searchParams.toString()}`;
  const { data, error, isLoading, mutate } = useSWR(url, fetcher);
  return {
    loans: (data?.loans as LoanRecord[]) || [],
    summary: data?.summary,
    loading: isLoading,
    error,
    refetch: mutate,
  };
}

export function useHrmDocuments(params?: { user_id?: number; document_type?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.user_id) searchParams.set("user_id", String(params.user_id));
  if (params?.document_type) searchParams.set("document_type", params.document_type);

  const url = `${HRM_BASE}/documents?${searchParams.toString()}`;
  const { data, error, isLoading, mutate } = useSWR(url, fetcher);
  return { documents: (data as DocumentRecord[]) || [], loading: isLoading, error, refetch: mutate };
}

export function useHrmExits() {
  const { data, error, isLoading, mutate } = useSWR(`${HRM_BASE}/exits`, fetcher);
  return { exits: (data as ExitRecord[]) || [], loading: isLoading, error, refetch: mutate };
}

export function useHrmSelfService() {
  const { data, error, isLoading, mutate } = useSWR(`${HRM_BASE}/self-service`, fetcher);
  return { portalData: data, loading: isLoading, error, refetch: mutate };
}

// ==========================================
// ACTION MUTATIONS
// ==========================================

export async function hrmApiRequest(endpoint: string, options: RequestInit = {}) {
  const res = await fetchClient(`${HRM_BASE}/${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || "Request failed");
  }
  return json;
}

export async function saveDepartment(data: any, id?: number) {
  return hrmApiRequest(id ? `departments/${id}` : "departments", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteDepartment(id: number) {
  return hrmApiRequest(`departments/${id}`, { method: "DELETE" });
}

export async function saveDesignation(data: any, id?: number) {
  return hrmApiRequest(id ? `designations/${id}` : "designations", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteDesignation(id: number) {
  return hrmApiRequest(`designations/${id}`, { method: "DELETE" });
}

export async function updateEmployeeProfile(userId: number, data: any) {
  return hrmApiRequest(`employees/${userId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function recordAttendance(data: any) {
  return hrmApiRequest("attendances", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function generatePayroll(month: number, year: number, bonusRate = 0) {
  return hrmApiRequest("salaries/generate", {
    method: "POST",
    body: JSON.stringify({ month, year, bonus_rate: bonusRate }),
  });
}

export async function updateSalaryPayment(id: number, data: any) {
  return hrmApiRequest(`salaries/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function createLoan(data: any) {
  return hrmApiRequest("loans", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateLoanStatus(id: number, status: string) {
  return hrmApiRequest(`loans/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function recordLoanRepayment(id: number, data: any) {
  return hrmApiRequest(`loans/${id}/repay`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function uploadHrmDocument(formData: FormData) {
  const token = typeof window !== "undefined" ? require("js-cookie").get("auth_token") : null;
  const res = await fetch(`${HRM_BASE}/documents`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || "Failed to upload document");
  }
  return json;
}

export async function deleteHrmDocument(id: number) {
  return hrmApiRequest(`documents/${id}`, { method: "DELETE" });
}

export async function createExitRecord(data: any) {
  return hrmApiRequest("exits", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateExitRecord(id: number, data: any) {
  return hrmApiRequest(`exits/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function essCheckIn() {
  return hrmApiRequest("self-service/check-in", { method: "POST" });
}

export async function essCheckOut() {
  return hrmApiRequest("self-service/check-out", { method: "POST" });
}

export async function essApplyLeave(data: { leave_type: string; start_date: string; end_date: string; reason: string }) {
  return hrmApiRequest("self-service/leave", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function essRequestAdvance(data: { amount: number; total_installments: number; purpose: string }) {
  return hrmApiRequest("self-service/advance", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateLeaveStatus(id: number, status: string) {
  return hrmApiRequest(`leaves/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function createNotice(data: { title: string; content: string; priority?: string; target_department_id?: number | null }) {
  return hrmApiRequest("notices", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteNotice(id: number) {
  return hrmApiRequest(`notices/${id}`, { method: "DELETE" });
}

export async function issueWarning(data: { user_id: number; subject: string; description: string; warning_date: string; severity?: string }) {
  return hrmApiRequest("warnings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function assignTask(data: { assigned_to: number; title: string; description?: string; due_date?: string; priority?: string }) {
  return hrmApiRequest("tasks", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTaskStatus(id: number, status: string) {
  return hrmApiRequest(`tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function deleteTask(id: number) {
  return hrmApiRequest(`tasks/${id}`, {
    method: "DELETE",
  });
}

// ------------------------------------------
// Dynamic Incentive Rules Engine (Phase 4)
// ------------------------------------------

export function useHrmIncentiveRules() {
  const { data, error, isLoading, mutate } = useSWR<SalaryIncentiveRule[]>(
    `${HRM_BASE}/incentive-rules`,
    fetcher
  );

  return {
    rules: data || [],
    loading: isLoading,
    error,
    refetch: mutate,
  };
}

export async function createIncentiveRule(data: Partial<SalaryIncentiveRule>) {
  return hrmApiRequest("incentive-rules", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateIncentiveRule(id: number, data: Partial<SalaryIncentiveRule>) {
  return hrmApiRequest(`incentive-rules/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteIncentiveRule(id: number) {
  return hrmApiRequest(`incentive-rules/${id}`, {
    method: "DELETE",
  });
}

export async function previewIncentiveCalculation(userId: number, month: number, year: number) {
  return hrmApiRequest("incentive-rules/preview", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, month, year }),
  });
}

// ------------------------------------------
// Peer Task Management (Phase 5)
// ------------------------------------------

export function useHrmTasks(params?: {
  scope?: "all" | "assigned_to_me" | "assigned_by_me";
  assigned_to?: number | string;
  status?: string;
  priority?: string;
  department_id?: number | string;
  search?: string;
}) {
  const query = new URLSearchParams();
  if (params?.scope) query.append("scope", params.scope);
  if (params?.assigned_to && params.assigned_to !== "all") query.append("assigned_to", String(params.assigned_to));
  if (params?.status && params.status !== "all") query.append("status", params.status);
  if (params?.priority && params.priority !== "all") query.append("priority", params.priority);
  if (params?.department_id && params.department_id !== "all") query.append("department_id", String(params.department_id));
  if (params?.search) query.append("search", params.search);

  const { data, error, isLoading, mutate } = useSWR<{
    tasks: TaskRecord[];
    summary: { total: number; pending: number; in_progress: number; completed: number };
  }>(`${HRM_BASE}/tasks?${query.toString()}`, fetcher);

  return {
    tasks: data?.tasks || [],
    summary: data?.summary || { total: 0, pending: 0, in_progress: 0, completed: 0 },
    loading: isLoading,
    error,
    refetch: mutate,
  };
}

// ------------------------------------------
// Department Performance Report (Phase 5)
// ------------------------------------------

export function useDepartmentPerformance(params?: {
  start_date?: string;
  end_date?: string;
}) {
  const query = new URLSearchParams();
  if (params?.start_date) query.append("start_date", params.start_date);
  if (params?.end_date) query.append("end_date", params.end_date);

  const { data, error, isLoading, mutate } = useSWR<DepartmentPerformanceData>(
    `${HRM_BASE}/department-performance?${query.toString()}`,
    fetcher
  );

  return {
    data,
    loading: isLoading,
    error,
    refetch: mutate,
  };
}

