"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Printer, Loader2 } from "lucide-react";
import useSWR from "swr";

import { useOrderDetail } from "@/hooks/useOrderDetail";
import { Button } from "@/components/ui/button";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CourierLabelPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading: orderLoading } = useOrderDetail(id ?? null);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const settingsEndpoint = process.env.NEXT_PUBLIC_API_WEB_SETTINGS || "web-settings";
  const { data: settingsRes, isLoading: settingsLoading } = useSWR(`${baseUrl}${settingsEndpoint}`, fetcher);
  
  const settings = settingsRes?.data;
  const isLoading = orderLoading || settingsLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading label...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-muted-foreground">
        Invoice not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 py-8 print:py-0 print:bg-white text-black flex flex-col items-center font-sans">
      {/* Print Button (hidden when printing) */}
      <div className="w-[4in] mb-4 flex justify-end print:hidden">
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 size-4" />
          Print Label
        </Button>
      </div>

      {/* Courier Label Container - standard 4x6 inches */}
      <div className="w-[4in] h-[6in] bg-white p-4 shadow-sm print:shadow-none print:m-0 print:p-0 flex flex-col border-2 border-black">
        
        {/* Top Header - Store / Courier Info */}
        <div className="flex border-b-2 border-black pb-3 items-center justify-between">
          <h1 className="text-3xl font-extrabold uppercase tracking-widest leading-none">
            {order.shipping_area === "Inside Dhaka" ? "STD" : "EXP"}
          </h1>
          <div className="text-right">
            <h2 className="text-sm font-bold">{settings?.brand_name || "DokanX"}</h2>
            <p className="text-[10px] uppercase">{order.shipping_area || "Delivery"}</p>
          </div>
        </div>

        {/* Return Address */}
        <div className="py-3 border-b-2 border-black">
          <p className="text-[10px] font-bold uppercase mb-1">Return To:</p>
          <p className="text-xs font-semibold">{settings?.brand_name || "DokanX"}</p>
          <p className="text-[10px] whitespace-pre-line leading-tight">
            {settings?.address || "123 E-commerce Street\nDhaka, Bangladesh"}
          </p>
          {settings?.phone && <p className="text-[10px]">{settings.phone}</p>}
        </div>

        {/* Ship To Address */}
        <div className="py-4 flex-1">
          <p className="text-sm font-bold uppercase mb-2">Ship To:</p>
          <p className="text-lg font-bold">{order.customer_full_name}</p>
          <p className="text-sm font-semibold mt-1">Phone: {order.customer_phone}</p>
          <p className="text-sm mt-2 font-medium max-w-[85%] leading-snug">
            {order.customer_shipping_address}
          </p>
          {order.shipping_area && (
            <p className="text-sm font-bold mt-2 uppercase">{order.shipping_area}</p>
          )}
        </div>

        {/* Order Info & Barcode Area */}
        <div className="border-t-2 border-black pt-3 pb-1 text-center">
          <div className="flex justify-between items-end mb-2 px-2 text-xs font-bold uppercase">
            <span>Order No:</span>
            <span className="text-sm">{order.order_no}</span>
          </div>
          
          {/* Fake Barcode visualization using simple css borders */}
          <div className="flex justify-center items-end h-16 mb-1 overflow-hidden opacity-90 mx-auto w-full px-2">
            {[...Array(50)].map((_, i) => (
              <div 
                key={i} 
                className="bg-black h-full" 
                style={{ 
                  width: `${Math.random() * 3 + 1}px`, 
                  marginRight: `${Math.random() * 2 + 1}px` 
                }}
              />
            ))}
          </div>
          <p className="text-sm tracking-widest font-bold font-mono">{order.order_no}</p>
        </div>
        
        {/* Bottom Status Row */}
        <div className="border-t-2 border-black pt-2 flex justify-between text-xs font-bold">
          <span>{order.payment_method}</span>
          <span>{order.payment_status}</span>
        </div>

      </div>
    </div>
  );
}
