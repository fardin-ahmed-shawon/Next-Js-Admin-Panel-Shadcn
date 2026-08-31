import { fetchClient } from "@/lib/fetch-client";
import { useAuth } from "@/hooks/useAuth";
import useSWR from "swr";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/"}reports/suppliers`;

export interface SupplierReportItem {
  supplier_id: number;
  supplier_name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  purchase_count: number;
  total_purchase_amount: number;
  total_paid_amount: number;
  total_due_amount: number;
  payment_status?: "paid" | "partial" | "due" | string;
  last_purchase_date?: string | null;
}

export interface SupplierReportSummary {
  total_suppliers: number;
  total_purchase_count: number;
  total_purchase_amount: number;
  total_paid_amount: number;
  total_due_amount: number;
}

export interface SupplierReportPagination {
  current_page: number;
  data: SupplierReportItem[];
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export interface SupplierReportResponse {
  success: boolean;
  message?: string;
  summary: SupplierReportSummary;
  data: SupplierReportPagination;
}

const filterLotsByDate = (lots: any[], period?: string, startDate?: string, endDate?: string) => {
  if (!period && !startDate && !endDate) return lots;
  const now = new Date();
  
  return lots.filter((lot) => {
    if (!lot.created_at) return true;
    const lotDate = new Date(lot.created_at);

    if (period === "daily") {
      return (
        lotDate.getFullYear() === now.getFullYear() &&
        lotDate.getMonth() === now.getMonth() &&
        lotDate.getDate() === now.getDate()
      );
    } else if (period === "weekly") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return lotDate >= oneWeekAgo && lotDate <= now;
    } else if (period === "monthly") {
      return (
        lotDate.getFullYear() === now.getFullYear() &&
        lotDate.getMonth() === now.getMonth()
      );
    } else if (period === "yearly") {
      return lotDate.getFullYear() === now.getFullYear();
    } else if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate + "T23:59:59") : new Date();
      return lotDate >= start && lotDate <= end;
    }
    return true;
  });
};

const fetcher = async (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const res = await fetchClient(url, {
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        return data as SupplierReportResponse;
      }
    }
  } catch (err) {
    // Fall through to fallback aggregation
  }

  // Fallback: Fetch suppliers and inventory lots to compute supplier report
  const urlObj = new URL(url, "http://localhost");
  const period = urlObj.searchParams.get("period") || "";
  const startDate = urlObj.searchParams.get("start_date") || "";
  const endDate = urlObj.searchParams.get("end_date") || "";
  const search = (urlObj.searchParams.get("search") || "").toLowerCase();
  const page = Number(urlObj.searchParams.get("page")) || 1;
  const limit = Number(urlObj.searchParams.get("limit")) || 15;
  const sortBy = urlObj.searchParams.get("sort_by") || "total_purchase_amount";
  const sortDir = urlObj.searchParams.get("sort_dir") || "desc";

  const [suppliersRes, lotsRes] = await Promise.all([
    fetchClient(`${process.env.NEXT_PUBLIC_API_BASE_URL}suppliers?all=true`, { headers: authHeader }),
    fetchClient(`${process.env.NEXT_PUBLIC_API_BASE_URL}inventory/lots?per_page=1000`, { headers: authHeader }),
  ]);

  const suppliersData = await suppliersRes.json();
  const lotsData = await lotsRes.json();

  const suppliersList: any[] = suppliersData.success && Array.isArray(suppliersData.data) ? suppliersData.data : [];
  const rawLots: any[] = lotsData.success && lotsData.data?.data ? lotsData.data.data : Array.isArray(lotsData.data) ? lotsData.data : [];
  const lotsList = filterLotsByDate(rawLots, period, startDate, endDate);

  // Group lots by supplier
  const supplierStatsMap: Record<number, {
    purchase_count: number;
    total_purchase_amount: number;
    total_paid_amount: number;
    total_due_amount: number;
    last_purchase_date: string | null;
  }> = {};

  lotsList.forEach((lot) => {
    const sId = lot.supplier_id || (lot.supplier ? lot.supplier.id : 0);
    if (!supplierStatsMap[sId]) {
      supplierStatsMap[sId] = {
        purchase_count: 0,
        total_purchase_amount: 0,
        total_paid_amount: 0,
        total_due_amount: 0,
        last_purchase_date: null,
      };
    }

    const lotTotal = lot.total_amount !== undefined && lot.total_amount !== null
      ? Number(lot.total_amount)
      : (Number(lot.purchase_price) || 0) * (Number(lot.initial_qty) || 0);
    const lotPaid = Number(lot.paid_amount) || 0;
    const lotDue = lot.due_amount !== undefined && lot.due_amount !== null
      ? Number(lot.due_amount)
      : Math.max(0, lotTotal - lotPaid);

    supplierStatsMap[sId].purchase_count += 1;
    supplierStatsMap[sId].total_purchase_amount += lotTotal;
    supplierStatsMap[sId].total_paid_amount += lotPaid;
    supplierStatsMap[sId].total_due_amount += lotDue;

    if (lot.created_at) {
      if (!supplierStatsMap[sId].last_purchase_date || new Date(lot.created_at) > new Date(supplierStatsMap[sId].last_purchase_date!)) {
        supplierStatsMap[sId].last_purchase_date = lot.created_at;
      }
    }
  });

  // Construct items
  let reportItems: SupplierReportItem[] = suppliersList.map((s) => {
    const stats = supplierStatsMap[s.id] || {
      purchase_count: 0,
      total_purchase_amount: 0,
      total_paid_amount: 0,
      total_due_amount: 0,
      last_purchase_date: null,
    };

    const status = stats.total_due_amount === 0 && stats.total_purchase_amount > 0
      ? "paid"
      : stats.total_paid_amount > 0
      ? "partial"
      : "due";

    return {
      supplier_id: s.id,
      supplier_name: s.name,
      phone: s.phone || null,
      email: s.email || null,
      address: s.address || null,
      purchase_count: stats.purchase_count,
      total_purchase_amount: stats.total_purchase_amount,
      total_paid_amount: stats.total_paid_amount,
      total_due_amount: stats.total_due_amount,
      payment_status: status,
      last_purchase_date: stats.last_purchase_date,
    };
  });

  // Also include general/unassigned supplier lots if any
  if (supplierStatsMap[0] && supplierStatsMap[0].purchase_count > 0) {
    reportItems.push({
      supplier_id: 0,
      supplier_name: "General / Direct Purchase",
      phone: null,
      email: null,
      address: null,
      purchase_count: supplierStatsMap[0].purchase_count,
      total_purchase_amount: supplierStatsMap[0].total_purchase_amount,
      total_paid_amount: supplierStatsMap[0].total_paid_amount,
      total_due_amount: supplierStatsMap[0].total_due_amount,
      payment_status: supplierStatsMap[0].total_due_amount === 0 ? "paid" : "due",
      last_purchase_date: supplierStatsMap[0].last_purchase_date,
    });
  }

  // Filter by search
  if (search) {
    reportItems = reportItems.filter(
      (item) =>
        item.supplier_name.toLowerCase().includes(search) ||
        (item.phone && item.phone.toLowerCase().includes(search)) ||
        (item.email && item.email.toLowerCase().includes(search))
    );
  }

  // Sort
  reportItems.sort((a, b) => {
    let aVal = (a as any)[sortBy] ?? 0;
    let bVal = (b as any)[sortBy] ?? 0;
    if (typeof aVal === "string") aVal = aVal.toLowerCase();
    if (typeof bVal === "string") bVal = bVal.toLowerCase();

    if (sortDir === "asc") {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });

  // Calculate overall summary
  const summary: SupplierReportSummary = {
    total_suppliers: reportItems.length,
    total_purchase_count: reportItems.reduce((acc, i) => acc + i.purchase_count, 0),
    total_purchase_amount: reportItems.reduce((acc, i) => acc + i.total_purchase_amount, 0),
    total_paid_amount: reportItems.reduce((acc, i) => acc + i.total_paid_amount, 0),
    total_due_amount: reportItems.reduce((acc, i) => acc + i.total_due_amount, 0),
  };

  // Paginate
  const total = reportItems.length;
  const lastPage = Math.max(1, Math.ceil(total / limit));
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const pagedData = reportItems.slice((page - 1) * limit, page * limit);

  return {
    success: true,
    summary,
    data: {
      current_page: page,
      data: pagedData,
      from,
      last_page: lastPage,
      per_page: limit,
      to,
      total,
    },
  };
};

export function useSupplierReports(params?: Record<string, any>) {
  const { user } = useAuth();
  let url = API_URL;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const { data, error, isLoading, isValidating, mutate } = useSWR<SupplierReportResponse>(
    user ? url : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: true,
      dedupingInterval: 3000,
    }
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}
