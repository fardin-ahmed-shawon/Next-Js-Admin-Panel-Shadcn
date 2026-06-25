"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RevenueStats } from "./revenue-stats";
import { RevenueTable } from "./revenue-table";
import { Loader2 } from "lucide-react";
import { fetchClient } from "@/lib/fetch-client";
import { useAuth } from "@/hooks/useAuth";

export function RevenueDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<{
    total_revenue: number;
    this_month: number;
    today: number;
    pending: number;
  } | null>(null);

  const [data, setData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Table state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState("All");

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
      const REVENUE_URL = process.env.NEXT_PUBLIC_API_ACCOUNTS_REVENUE_URL || "revenue";
      const cleanBase = API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;
      const cleanPath = REVENUE_URL.startsWith("/") ? REVENUE_URL.slice(1) : REVENUE_URL;

      let url = `${cleanBase}${cleanPath}?page=${pageIndex + 1}&per_page=${pageSize}`;
      if (filter !== "All") {
        url += `&status=${filter}`;
      }

      const response = await fetchClient(url);
      const result = await response.json();

      if (result.success) {
        setSummary(result.summary);

        // Map backend data to frontend format
        const mappedData = result.data.data.map((item: any) => ({
          id: item.id.toString(),
          transactionId: item.transaction_id || "N/A",
          orderId: item.order_no,
          accountNo: item.acc_number || "N/A",
          customer: item.customer,
          method: "N/A", // Backend doesn't provide method in this payload
          amount: item.amount,
          date: item.created_at,
          paymentStatus: item.payment_status,
        }));

        setData(mappedData);
        setTotalCount(result.data.total);
      } else {
        toast.error(result.message || "Failed to load revenue data");
      }
    } catch (error) {
      console.error("Revenue fetch error:", error);
      toast.error("Failed to connect to API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, [pageIndex, pageSize, filter, user?.id]);

  if (loading && !summary) {
    return (
      <div className="flex h-[400px] items-center justify-center w-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <RevenueStats summary={summary} />
      <RevenueTable
        data={data}
        totalCount={totalCount}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageIndex={setPageIndex}
        setPageSize={setPageSize}
        filter={filter}
        setFilter={setFilter}
        loading={loading}
      />
    </div>
  );
}
