"use client";
import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { fetchClient } from "@/lib/fetch-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BulkReturnReceipts } from "../_components/bulk-return-receipts";
export default function PendingReturns() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, error, isLoading, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}return-queue?page=${page}&search=${encodeURIComponent(search)}`,
    async (url: string) => {
      const r = await fetchClient(url);
      if (!r.ok) throw new Error("Unable to load returns");
      return r.json();
    },
  );
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Pending Returns</h1>
      <p className="text-muted-foreground">
        Inspect products and confirm physically received returns. Partial orders remain here until all returns are
        received.
      </p>
      <Input
        placeholder="Search order, customer or phone"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />
      {error && (
        <p role="alert">
          Could not load orders. <Button onClick={() => mutate()}>Retry</Button>
        </p>
      )}
      {isLoading && <p>Loading…</p>}
      {data?.data?.data?.map((order: any) => (
        <section key={order.id} className="rounded border p-4 space-y-3">
          <div className="flex justify-between gap-3">
            <Link className="font-semibold underline" href={`/dashboard/orders/${order.order_no}`}>
              {order.order_no}
            </Link>
            <span>{order.order_status}</span>
          </div>
          <p>
            {order.customer_full_name} · {order.customer_phone}
          </p>
          <BulkReturnReceipts order={order} onSuccess={() => mutate()} />
        </section>
      ))}
      {!isLoading && data?.data?.data?.length === 0 && <p>No pending returns.</p>}
      <div className="flex gap-3 items-center">
        <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Previous
        </Button>
        <span>
          Page {page} of {data?.data?.last_page || 1}
        </span>
        <Button disabled={page >= (data?.data?.last_page || 1)} onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
