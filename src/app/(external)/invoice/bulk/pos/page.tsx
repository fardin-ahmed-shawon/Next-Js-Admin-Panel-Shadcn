"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Printer, Loader2 } from "lucide-react";
import useSWR from "swr";

import { fetchClient } from "@/lib/fetch-client";
import { Button } from "@/components/ui/button";

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const fetchOrderDetails = async (baseUrl: string, orderId: string) => {
  const res = await fetchClient(`${baseUrl}orders/${orderId}`);
  if (!res.ok) throw new Error("Failed to fetch order detail.");
  const json = await res.json();
  return json?.data ?? null;
};

function BulkPOSContent() {
  const searchParams = useSearchParams();
  const idsString = searchParams.get("ids") || "";
  const ids = React.useMemo(() => idsString.split(",").filter(Boolean), [idsString]);

  const [orders, setOrders] = React.useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = React.useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const settingsEndpoint = process.env.NEXT_PUBLIC_API_WEB_SETTINGS || "web-settings";
  const { data: settingsRes, isLoading: settingsLoading } = useSWR(`${baseUrl}${settingsEndpoint}`, fetcher);
  const settings = settingsRes?.data;

  React.useEffect(() => {
    if (ids.length === 0) {
      setLoadingOrders(false);
      return;
    }

    setLoadingOrders(true);
    Promise.all(ids.map((id) => fetchOrderDetails(baseUrl, id).catch(() => null)))
      .then((results) => {
        setOrders(results.filter(Boolean));
      })
      .finally(() => {
        setLoadingOrders(false);
      });
  }, [ids, baseUrl]);

  const isLoading = loadingOrders || settingsLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-muted-foreground font-mono">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading POS invoices...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-muted-foreground font-mono">
        No POS invoices found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 py-8 print:py-0 print:bg-white text-black font-mono text-sm flex flex-col items-center">
      {/* Print Button (hidden when printing) */}
      <div className="w-[80mm] mb-4 flex justify-end print:hidden">
        <Button onClick={() => window.print()} size="sm">
          <Printer className="mr-2 size-4" />
          Print All POS
        </Button>
      </div>

      {orders.map((order, idx) => {
        const paidAmount = order?.payments?.reduce((sum: number, p: any) => sum + Number(p.paid_amount ?? 0), 0) ?? 0;
        const grandTotal = Number(order?.grand_total_amount ?? 0);
        const dueAmount = Math.max(0, grandTotal - paidAmount);

        return (
          <div
            key={order.id ?? idx}
            className="w-[80mm] bg-white p-4 shadow-sm print:shadow-none print:m-0 print:p-0 leading-tight mb-8 last:mb-0 print:mb-0"
            style={{ pageBreakAfter: "always", breakAfter: "page" }}
          >
            {/* Header Section */}
            <div className="text-center mb-4">
              <h1 className="text-xl font-bold uppercase">{settings?.brand_name || "DokanX"}</h1>
              <p className="text-xs mt-1 whitespace-pre-line">
                {settings?.address || "123 E-commerce Street\nDhaka, Bangladesh"}
              </p>
              {settings?.phone && <p className="text-xs">{settings.phone}</p>}
              <p className="text-xs">{settings?.email || "support@dokanx.com"}</p>
            </div>

            <div className="text-center mb-4 pb-2 border-b border-dashed border-neutral-400">
              <h2 className="text-lg font-bold">RECEIPT</h2>
            </div>

            {/* Order Info */}
            <div className="mb-4 text-xs space-y-1 pb-2 border-b border-dashed border-neutral-400">
              <div className="flex justify-between">
                <span>Order No:</span>
                <span className="font-semibold">{order.order_no}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{formatDate(order.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{order.customer_full_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Phone:</span>
                <span>{order.customer_phone}</span>
              </div>
            </div>

            {/* Table Section */}
            <div className="mb-4 pb-2 border-b border-dashed border-neutral-400">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-dashed border-neutral-400">
                    <th className="py-1 text-left">Item</th>
                    <th className="py-1 text-right">Qty</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.ordered_products ?? []).map((item: any, i: number) => (
                    <tr key={item.id ?? i}>
                      <td className="py-1 align-top pr-1">
                        <div>{item.product?.title ?? "Unknown Product"}</div>
                        {(item.size_label || item.color_label) && (
                          <div className="text-[10px] text-neutral-500">
                            {item.size_label} {item.color_label}
                          </div>
                        )}
                        <div className="text-[10px] text-neutral-500">৳{Number(item.unit_price).toLocaleString()}</div>
                      </td>
                      <td className="py-1 align-top text-right pr-1">x{item.qty}</td>
                      <td className="py-1 align-top text-right">
                        ৳{(Number(item.unit_price) * item.qty).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="mb-4 pb-2 border-b border-dashed border-neutral-400 text-xs space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>৳{Number(order.subtotal_amount).toLocaleString()}</span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>- ৳{Number(order.discount_amount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>৳{Number(order.shipping_charge).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold mt-2 pt-1 border-t border-dashed border-neutral-400">
                <span>Total:</span>
                <span>৳{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="mb-4 pb-2 border-b border-dashed border-neutral-400 text-xs space-y-1">
              <div className="flex justify-between">
                <span>Paid:</span>
                <span>৳{paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Due:</span>
                <span>৳{dueAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Footer Section */}
            <div className="text-center text-xs space-y-1 mt-4">
              <p className="font-bold">Thank You!</p>
              <p>Please come again.</p>
              <p className="text-[10px] mt-2">Powered by DokanX</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function BulkPOSInvoicePage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center text-muted-foreground font-mono">
          Loading...
        </div>
      }
    >
      <BulkPOSContent />
    </React.Suspense>
  );
}
