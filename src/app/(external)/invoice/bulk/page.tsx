"use client";

import * as React from "react";

import { useSearchParams } from "next/navigation";

import { Loader2, Printer } from "lucide-react";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import { fetchClient } from "@/lib/fetch-client";

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
    1, 2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 1, 2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3,
  ];
  const alignClass = align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center";
  return (
    <div className={`flex items-end ${alignClass} h-6 gap-[1.5px] my-1 overflow-hidden select-none`} aria-hidden="true">
      {bars.map((w, idx) => (
        <div key={idx} className="h-full shrink-0" style={{ width: "0px", borderLeft: `${w}px solid black` }} />
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
      <div className="flex h-screen w-full items-center justify-center text-muted-foreground">No invoices found.</div>
    );
  }

  const brandName = settings?.brand_name || "ARHAM Mart";
  const hostUrl = baseUrl.replace(/\/api\/v1\/admin\/?$/, "");
  const brandLogo = settings?.brand_logo ? `${hostUrl}/${settings.brand_logo}` : null;

  const chunks = React.useMemo(() => {
    const res = [];
    for (let i = 0; i < orders.length; i += 3) {
      res.push(orders.slice(i, i + 3));
    }
    return res;
  }, [orders]);

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 py-8 print:py-0 print:bg-white text-black">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `,
        }}
      />
      {/* Print Button (hidden when printing) */}
      <div className="max-w-[210mm] mx-auto mb-4 flex justify-end print:hidden">
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 size-4" />
          Print All Invoices
        </Button>
      </div>

      {chunks.map((chunk, chunkIdx) => (
        <div
          key={chunkIdx}
          className="w-[210mm] h-[297mm] mx-auto bg-white p-[8mm] shadow-sm print:shadow-none mb-8 last:mb-0 print:mb-0 relative flex flex-col gap-[2%] justify-start box-border overflow-hidden print:w-[210mm] print:h-[297mm] print:p-[8mm]"
          style={{ pageBreakAfter: "always", breakAfter: "page" }}
        >
          {chunk.map((order, orderIdx) => {
            const grandTotal = Number(order?.grand_total_amount ?? 0);

            // Build the courier routing line dynamically
            const courier = order.courier_name || "Courier";
            const city = order.shipping_city || order.city?.name || "";
            const zone = order.shipping_zone || order.zone?.name || order.shipping_area || "";
            const courierPath = [courier, city, zone].filter(Boolean).join(" >> ");

            return (
              <div key={order.id ?? orderIdx} className="h-[32%] flex flex-col justify-between relative box-border">
                <div>
                  {/* Custom Screenshot-styled Box Grid Header */}
                  <div className="w-full border-2 border-black grid grid-cols-12 mb-3">
                    {/* Logo Box */}
                    <div className="col-span-3 border-r-2 border-black p-3 print:p-2 flex flex-col items-center justify-center bg-white min-h-[90px] print:min-h-[75px]">
                      {brandLogo ? (
                        <img
                          src={brandLogo}
                          alt={brandName}
                          className="max-h-[40px] print:max-h-[35px] max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-base font-black uppercase text-neutral-900 tracking-wider text-center">
                          {brandName}
                        </span>
                      )}
                      <p className="text-[7px] font-bold text-neutral-500 uppercase tracking-widest mt-0.5 text-center leading-none">
                        Trusted E-Commerce Platform
                      </p>
                    </div>

                    {/* Customer Info Box */}
                    <div className="col-span-5 border-r-2 border-black p-3 print:p-2 flex flex-col justify-between min-h-[90px] print:min-h-[75px] items-start">
                      <div className="space-y-0.5 text-left w-full">
                        <p className="font-bold text-xs uppercase text-neutral-900">{order.customer_full_name}</p>
                        <p className="font-semibold text-xs tabular-nums text-neutral-800">{order.customer_phone}</p>
                      </div>

                      {/* Barcode left-aligned */}
                      <div className="w-full">
                        <Barcode align="left" />
                      </div>

                      <p className="text-[9px] uppercase font-semibold text-neutral-700 leading-tight mt-0.5 line-clamp-1 text-left w-full">
                        {order.customer_shipping_address}
                      </p>
                    </div>

                    {/* Order Meta Box */}
                    <div className="col-span-4 p-3 print:p-2 flex flex-col justify-between min-h-[90px] print:min-h-[75px] text-right items-end">
                      <div className="w-full space-y-0.5">
                        <p className="font-bold text-xs text-neutral-900">Invoice #{order.order_no}</p>

                        {/* Barcode right-aligned */}
                        <div className="w-full">
                          <Barcode align="right" />
                        </div>

                        <p className="text-[9px] font-bold text-neutral-700">
                          Order Date : {formatDate(order.created_at)}
                        </p>
                      </div>

                      {/* Courier Routing Info */}
                      {courierPath && (
                        <div className="mt-0.5 text-[9px] font-bold text-neutral-900 uppercase tracking-tight leading-snug">
                          {courierPath}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Custom Screenshot-styled Table Headers */}
                  <div className="w-full border-2 border-black border-b-0 grid grid-cols-12 text-xs font-bold uppercase tracking-wider text-neutral-900 bg-neutral-50">
                    <div className="col-span-7 border-r-2 border-black p-2 print:p-1.5">Product</div>
                    <div className="col-span-3 border-r-2 border-black p-2 print:p-1.5">Quantity</div>
                    <div className="col-span-2 p-2 print:p-1.5">Price</div>
                  </div>

                  {/* Product Items Rows */}
                  {(order.ordered_products ?? []).map((item: any, i: number) => {
                    return (
                      <div
                        key={item.id ?? i}
                        className="w-full border-2 border-black border-t-0 border-b-0 grid grid-cols-12 text-xs text-neutral-800 bg-white"
                      >
                        {/* Product Title */}
                        <div className="col-span-7 border-r-2 border-black p-2 print:p-1.5 flex items-center">
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
                        <div className="col-span-3 border-r-2 border-black p-2 print:p-1.5 flex items-center font-bold tabular-nums">
                          {item.qty} x {Number(item.unit_price ?? 0).toFixed(2)} TK
                        </div>

                        {/* Total Line Amount */}
                        <div className="col-span-2 p-2 print:p-1.5 flex items-center font-bold tabular-nums text-neutral-900">
                          {Number(item.unit_price ?? 0) * item.qty} Tk
                        </div>
                      </div>
                    );
                  })}

                  {/* Bottom Note & Summary Block */}
                  <div className="w-full border-2 border-black grid grid-cols-12 text-xs text-neutral-800 bg-white">
                    {/* Customer Note */}
                    <div className="col-span-7 border-r-2 border-black p-2 print:p-1.5 min-h-[70px] print:min-h-[55px]">
                      <span className="font-bold text-neutral-950">Customer Note:</span>
                      <p className="text-neutral-700 mt-0.5 font-medium leading-relaxed line-clamp-2">
                        {order.customer_note || order.note || ""}
                      </p>
                    </div>

                    {/* Totals Breakdown Column */}
                    <div className="col-span-5 flex flex-col font-bold">
                      {/* Delivery Charge */}
                      <div className="flex justify-between border-b border-neutral-300 p-2 print:p-1.5">
                        <span className="text-neutral-700">Delivery Charge</span>
                        <span className="tabular-nums">{Number(order.shipping_charge ?? 0)} Tk</span>
                      </div>

                      {/* Discount */}
                      <div className="flex justify-between border-b border-neutral-300 p-2 print:p-1.5">
                        <span className="text-neutral-700">Discount</span>
                        <span className="tabular-nums">{Number(order.discount_amount ?? 0)} Tk</span>
                      </div>

                      {/* Grand Total payable */}
                      <div className="flex justify-between p-2 print:p-1.5 bg-neutral-50/50">
                        <span className="text-neutral-950 font-extrabold text-xs">Total</span>
                        <span className="font-extrabold text-xs tabular-nums text-neutral-950">{grandTotal} Tk</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Screenshot Specific Note & Red Dashed Line */}
                <div className="mt-2 text-center">
                  <p className="text-[9px] font-extrabold text-red-600 leading-tight">
                    বিশেষ দ্রষ্টব্য: ডেলিভারি ম্যান সামনে থাকা অবস্থায় প্রোডাক্ট চেক করে নিবেন। ডেলিভারি ম্যান চলে আসার পর কোন অভিযোগ
                    গ্রহণযোগ্য নয়।
                  </p>
                  <div className="w-full border-t border-dashed border-red-500 mt-2" />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function BulkInvoicePage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center text-muted-foreground">Loading...</div>
      }
    >
      <BulkInvoiceContent />
    </React.Suspense>
  );
}
