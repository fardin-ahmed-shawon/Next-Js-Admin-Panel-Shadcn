"use client";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { workflowVisibilityLabel } from "@/hooks/useRoles";
import { WorkflowAssignment } from "../_components/workflow-assignment";
import useSWR from "swr";
import Link from "next/link";
import { fetchClient } from "@/lib/fetch-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BulkReturnReceipts } from "../_components/bulk-return-receipts";
export default function PendingReturns() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
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
      <p className="text-xs text-muted-foreground">{workflowVisibilityLabel(user, "returns")}</p>
      {selected.length > 0 && (
        <WorkflowAssignment
          workflow="returns"
          orderNos={selected}
          onSaved={() => {
            setSelected([]);
            mutate();
          }}
        />
      )}
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
          setSelected([]);
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
            <Checkbox
              aria-label={`Select ${order.order_no}`}
              checked={selected.includes(order.order_no)}
              onCheckedChange={(checked) =>
                setSelected((current) =>
                  checked ? [...current, order.order_no] : current.filter((id) => id !== order.order_no),
                )
              }
            />
            <Link className="font-semibold underline" href={`/dashboard/orders/${order.order_no}`}>
              {order.order_no}
            </Link>
            <span>{order.order_status}</span>
          </div>
          <p>
            {order.customer_full_name} · {order.customer_phone}
          </p>
          <div className="grid gap-3 sm:grid-cols-3 text-xs">
            <div>
              <p className="text-muted-foreground">Order Agent</p>
              {order.employee_orders?.[0]?.user?.full_name || "Unassigned"}
            </div>
            <div>
              <p className="text-muted-foreground">Packing By</p>
              {order.packing_user?.full_name || "Unassigned"}
            </div>
            <div>
              <p className="text-muted-foreground">Return Confirmed By</p>
              <WorkflowAssignment
                workflow="returns"
                orderNos={[order.order_no]}
                name={order.return_user?.full_name}
                currentUserId={order.return_confirmed_by}
                onSaved={() => mutate()}
              />
            </div>
          </div>
          <BulkReturnReceipts order={order} onSuccess={() => mutate()} />
        </section>
      ))}
      {!isLoading && data?.data?.data?.length === 0 && <p>No pending returns.</p>}
      <div className="flex gap-3 items-center">
        <Button
          disabled={page <= 1}
          onClick={() => {
            setPage(page - 1);
            setSelected([]);
          }}
        >
          Previous
        </Button>
        <span>
          Page {page} of {data?.data?.last_page || 1}
        </span>
        <Button
          disabled={page >= (data?.data?.last_page || 1)}
          onClick={() => {
            setPage(page + 1);
            setSelected([]);
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
