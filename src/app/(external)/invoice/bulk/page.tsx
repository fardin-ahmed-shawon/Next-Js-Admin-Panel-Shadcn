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
    });
  } catch {
    return dateStr;
  }
}

function Barcode({ align = "center" }: { align?: "left" | "center" | "right" }) {
  // A clean series of vertical bars using solid borders to guarantee visibility in all browser print configurations
  const bars = [
    1, 2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 1, 2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3
  ];
  const alignClass = align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center";
  return (
    <div className={`flex items-end ${alignClass} h-6 gap-[1.5px] my-1 overflow-hidden select-none`} aria-hidden="true">
      {bars.map((w, idx) => (
        <div
          key={idx}
          className="h-full shrink-0"
          style={{ width: "0px", borderLeft: `${w}px solid black` }}
        />
      ))}
    </div>
  );
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const fetchOrderDetails = async (baseUrl: string, orderId: string) => {
  const res = await fetchClient(`${baseUrl}orders/${orderId}`);
  if (!res.ok) throw new Error("Failed to fetch order detail.");
  const json = await res.json();
  return json?.data ?? null;
};

function BulkInvoiceContent() {
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
      <div className="flex h-screen w-full items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin text-primary" />
        Loading bulk invoices...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-muted-foreground">
        No invoices found.
      </div>
    );
  }

  const brandName = settings?.brand_name || "ARHAM Mart";
  const hostUrl = baseUrl.replace(/\/api\/v1\/admin\/?$/, "");
  const brandLogo = settings?.brand_logo ? `${hostUrl}/${settings.brand_logo}` : null;

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 py-8 print:py-0 print:bg-white text-black">
      {/* Print Button (hidden when printing) */}
      <div className="max-w-[210mm] mx-auto mb-4 flex justify-end print:hidden">
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 size-4" />
          Print All Invoices
        </Button>
      </div>

      {orders.map((order, idx) => {
        const grandTotal = Number(order?.grand_total_amount ?? 0);
        
        // Build the courier routing line dynamically
        const courier = order.courier_name || "Courier";
        const city = order.shipping_city || order.city?.name || "";
        const zone = order.shipping_zone || order.zone?.name || order.shipping_area || "";
        const courierPath = [courier, city, zone].filter(Boolean).join(" >> ");

        return (
          <div
            key={order.id ?? idx}
            className="max-w-[210mm] mx-auto bg-white p-[15mm] shadow-sm print:shadow-none print:m-0 print:p-0 mb-8 last:mb-0 print:mb-0 print:min-h-0 relative"
            style={{ pageBreakAfter: "always", breakAfter: "page" }}
          >
            {/* Custom Screenshot-styled Box Grid Header */}
            <div className="w-full border-2 border-black grid grid-cols-12 mb-6">
              {/* Logo Box */}
              <div className="col-span-3 border-r-2 border-black p-4 flex flex-col items-center justify-center bg-white min-h-[100px]">
                {brandLogo ? (
                  <img src={brandLogo} alt={brandName} className="max-h-[50px] max-w-full object-contain" />
                ) : (
                  <span className="text-lg font-black uppercase text-neutral-900 tracking-wider text-center">{brandName}</span>
                )}
                <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest mt-1 text-center leading-none">
                  Trusted E-Commerce Platform
                </p>
              </div>

              {/* Customer Info Box */}
              <div className="col-span-5 border-r-2 border-black p-3.5 flex flex-col justify-between min-h-[100px] items-start">
                <div className="space-y-0.5 text-left w-full">
                  <p className="font-bold text-xs uppercase text-neutral-900">{order.customer_full_name}</p>
                  <p className="font-semibold text-xs tabular-nums text-neutral-800">{order.customer_phone}</p>
                </div>
                
                {/* Barcode left-aligned */}
                <div className="w-full">
                  <Barcode align="left" />
                </div>
                
                <p className="text-[10px] uppercase font-semibold text-neutral-700 leading-tight mt-1 line-clamp-2 text-left w-full">
                  {order.customer_shipping_address}
                </p>
              </div>

              {/* Order Meta Box */}
              <div className="col-span-4 p-3.5 flex flex-col justify-between min-h-[100px] text-right items-end">
                <div className="w-full space-y-0.5">
                  <p className="font-bold text-xs text-neutral-900">Invoice #{order.order_no}</p>
                  
                  {/* Barcode right-aligned */}
                  <div className="w-full">
                    <Barcode align="right" />
                  </div>
                  
                  <p className="text-[10px] font-bold text-neutral-700">Order Date : {formatDate(order.created_at)}</p>
                </div>
                
                {/* Courier Routing Info */}
                {courierPath && (
                  <div className="mt-1 text-[10px] font-bold text-neutral-900 uppercase tracking-tight leading-snug">
                    {courierPath}
                  </div>
                )}
              </div>
            </div>

            {/* Custom Screenshot-styled Table Headers */}
            <div className="w-full border-2 border-black border-b-0 grid grid-cols-12 text-xs font-bold uppercase tracking-wider text-neutral-900 bg-neutral-50">
              <div className="col-span-7 border-r-2 border-black p-2.5">Product</div>
              <div className="col-span-3 border-r-2 border-black p-2.5">Quantity</div>
              <div className="col-span-2 p-2.5">Price</div>
            </div>

            {/* Product Items Rows */}
            {(order.ordered_products ?? []).map((item: any, i: number) => {
              const prodImg = item.product?.image || item.image || (item.product?.images?.[0]?.url) || "/media/placeholder.png";
              return (
                <div key={item.id ?? i} className="w-full border-2 border-black border-t-0 border-b-0 grid grid-cols-12 text-xs text-neutral-800 bg-white">
                  {/* Product Title */}
                  <div className="col-span-7 border-r-2 border-black p-2.5 flex items-center">
                    <div className="min-w-0">
                      <p className="font-bold text-neutral-900 truncate" title={item.product?.title}>
                        {item.product?.title || "Unknown Product"}
                      </p>
                      {(item.size_label || item.color_label) && (
                        <p className="text-[9px] text-neutral-500 mt-0.5 font-medium">
                          {item.size_label ? `Size: ${item.size_label}` : ""}
                          {item.size_label && item.color_label ? " | " : ""}
                          {item.color_label ? `Color: ${item.color_label}` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Qty x Price Rate */}
                  <div className="col-span-3 border-r-2 border-black p-2.5 flex items-center font-bold tabular-nums">
                    {item.qty} x {Number(item.unit_price ?? 0).toFixed(2)} TK
                  </div>
                  
                  {/* Total Line Amount */}
                  <div className="col-span-2 p-2.5 flex items-center font-bold tabular-nums text-neutral-900">
                    {(Number(item.unit_price ?? 0) * item.qty)} Tk
                  </div>
                </div>
              );
            })}

            {/* Bottom Note & Summary Block */}
            <div className="w-full border-2 border-black grid grid-cols-12 text-xs text-neutral-800 bg-white">
              {/* Customer Note */}
              <div className="col-span-7 border-r-2 border-black p-3 min-h-[90px]">
                <span className="font-bold text-neutral-950">Customer Note:</span>
                <p className="text-neutral-700 mt-1 font-medium leading-relaxed">
                  {order.customer_note || order.note || ""}
                </p>
              </div>
              
              {/* Totals Breakdown Column */}
              <div className="col-span-5 flex flex-col font-bold">
                {/* Delivery Charge */}
                <div className="flex justify-between border-b border-neutral-300 p-2.5">
                  <span className="text-neutral-700">Delivery Charge</span>
                  <span className="tabular-nums">{Number(order.shipping_charge ?? 0)} Tk</span>
                </div>
                
                {/* Discount */}
                <div className="flex justify-between border-b border-neutral-300 p-2.5">
                  <span className="text-neutral-700">Discount</span>
                  <span className="tabular-nums">{Number(order.discount_amount ?? 0)} Tk</span>
                </div>
                
                {/* Grand Total payable */}
                <div className="flex justify-between p-2.5 bg-neutral-50/50">
                  <span className="text-neutral-950 font-extrabold text-sm">Total</span>
                  <span className="font-extrabold text-sm tabular-nums text-neutral-950">{grandTotal} Tk</span>
                </div>
              </div>
            </div>

            {/* Screenshot Specific Note & Red Dashed Line */}
            <div className="mt-4 text-center">
              <p className="text-[10px] font-extrabold text-red-600 leading-tight">
                বিশেষ দ্রষ্টব্য: ডেলিভারি ম্যান সামনে থাকা অবস্থায় প্রোডাক্ট চেক করে নিবেন। ডেলিভারি ম্যান চলে আসার পর কোন অভিযোগ গ্রহণযোগ্য নয়।
              </p>
              <div className="w-full border-t border-dashed border-red-500 mt-3" />
            </div>

          </div>
        );
      })}
    </div>
  );
}

export default function BulkInvoicePage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center text-muted-foreground">
          Loading...
        </div>
      }
    >
      <BulkInvoiceContent />
    </React.Suspense>
  );
}
