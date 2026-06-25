"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Printer, Loader2 } from "lucide-react";
import useSWR from "swr";

import { useOrderDetail } from "@/hooks/useOrderDetail";
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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading: orderLoading } = useOrderDetail(id ?? null);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const settingsEndpoint = process.env.NEXT_PUBLIC_API_WEB_SETTINGS || "web-settings";
  const { data: settingsRes, isLoading: settingsLoading } = useSWR(`${baseUrl}${settingsEndpoint}`, fetcher);

  const settings = settingsRes?.data;
  const isLoading = orderLoading || settingsLoading;

  React.useEffect(() => {
    // Optionally trigger print automatically after loading
    // if (order && !isLoading) {
    //   window.print();
    // }
  }, [order, isLoading]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading invoice...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-muted-foreground">Invoice not found.</div>
    );
  }

  const paidAmount = order?.payments?.reduce((sum: number, p: any) => sum + Number(p.paid_amount ?? 0), 0) ?? 0;
  const grandTotal = Number(order?.grand_total_amount ?? 0);
  const dueAmount = Math.max(0, grandTotal - paidAmount);

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 py-8 print:py-0 print:bg-white text-black">
      {/* Print Button (hidden when printing) */}
      <div className="max-w-[210mm] mx-auto mb-4 flex justify-end print:hidden">
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 size-4" />
          Print Invoice
        </Button>
      </div>

      {/* A4 Container */}
      <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white p-[20mm] shadow-sm print:shadow-none print:m-0 print:p-0">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900">INVOICE</h1>
            <p className="text-sm text-neutral-500 mt-1">#{order.order_no}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-neutral-900">{settings?.brand_name || "DokanX"}</h2>
            <p className="text-sm text-neutral-500 mt-1 whitespace-pre-line">
              {settings?.address || "123 E-commerce Street\nDhaka, Bangladesh"}
            </p>
            {settings?.phone && <p className="text-sm text-neutral-500">{settings.phone}</p>}
            <p className="text-sm text-neutral-500">{settings?.email || "support@dokanx.com"}</p>
          </div>
        </div>

        {/* Info Section */}
        <div className="flex justify-between mb-12">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-2 uppercase tracking-wider">Bill To</h3>
            <p className="text-base font-medium text-neutral-800">{order.customer_full_name}</p>
            <p className="text-sm text-neutral-600 mt-1">{order.customer_phone}</p>
            <p className="text-sm text-neutral-600 mt-1 max-w-[250px]">{order.customer_shipping_address}</p>
            {order.shipping_area && <p className="text-sm text-neutral-600">{order.shipping_area}</p>}
          </div>
          <div className="text-right">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-neutral-900 mb-1 uppercase tracking-wider">Date</h3>
              <p className="text-sm text-neutral-600">{formatDate(order.created_at)}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-1 uppercase tracking-wider">Status</h3>
              <p className="text-sm font-medium text-neutral-800">{order.payment_status}</p>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="mb-12">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b-2 border-neutral-200 text-neutral-900">
                <th className="py-3 font-semibold w-1/2">Item Description</th>
                <th className="py-3 font-semibold text-right w-1/6">Qty</th>
                <th className="py-3 font-semibold text-right w-1/6">Rate</th>
                <th className="py-3 font-semibold text-right w-1/6">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(order.ordered_products ?? []).map((item: any, i: number) => (
                <tr key={item.id ?? i} className="border-b border-neutral-100">
                  <td className="py-4 align-top">
                    <p className="font-medium text-neutral-800">{item.product?.title ?? "Unknown Product"}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {item.product?.sku ? `SKU: ${item.product.sku}` : ""}
                      {item.size_label ? ` | Size: ${item.size_label}` : ""}
                      {item.color_label ? ` | Color: ${item.color_label}` : ""}
                    </p>
                  </td>
                  <td className="py-4 align-top text-right text-neutral-600">{item.qty}</td>
                  <td className="py-4 align-top text-right text-neutral-600">
                    ৳{Number(item.unit_price).toLocaleString()}
                  </td>
                  <td className="py-4 align-top text-right font-medium text-neutral-800">
                    ৳{(Number(item.unit_price) * item.qty).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-16">
          <div className="w-1/2 space-y-3">
            <div className="flex justify-between text-sm text-neutral-600">
              <span>Subtotal</span>
              <span>৳{Number(order.subtotal_amount).toLocaleString()}</span>
            </div>
            {Number(order.discount_amount) > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>− ৳{Number(order.discount_amount).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-neutral-600">
              <span>Shipping</span>
              <span>৳{Number(order.shipping_charge).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t-2 border-neutral-200 pt-3 text-lg font-bold text-neutral-900">
              <span>Grand Total</span>
              <span>৳{grandTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-neutral-600 pt-2">
              <span>Paid</span>
              <span>৳{paidAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-neutral-800 pt-1">
              <span>Due Balance</span>
              <span>৳{dueAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="border-t border-neutral-200 pt-8 mt-auto text-sm text-neutral-500 text-center">
          <p>Thank you for your business!</p>
          <p className="mt-1">If you have any questions concerning this invoice, contact our support.</p>
        </div>
      </div>
    </div>
  );
}
