"use client";
import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { fetchClient } from "@/lib/fetch-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ReturnProductThumbnail } from "@/components/return-product-thumbnail";
import { toast } from "sonner";
export default function ReturnReports() {
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    search: "",
    actor_id: "",
    product_id: "",
    disposition: "",
  });
  const [page, setPage] = useState(1);
  const params = new URLSearchParams({ ...filters, page: String(page) });
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}reports/returns?${params}`;
  const { data, error, isLoading, mutate } = useSWR(url, async (url: string) => {
    const r = await fetchClient(url);
    if (!r.ok) throw new Error("Unable to load report. Check the date range.");
    return r.json();
  });
  const change = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };
  async function download() {
    try {
      const r = await fetchClient(url + "&export=1");
      if (!r.ok) throw new Error();
      const link = document.createElement("a");
      const blob = URL.createObjectURL(await r.blob());
      link.href = blob;
      link.download = "return-report.csv";
      link.click();
      URL.revokeObjectURL(blob);
    } catch {
      toast.error("Could not export report");
    }
  }
  return (
    <div className="space-y-5">
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">Return Reports</h1>
        <Button onClick={download}>Export CSV</Button>
      </div>
      <p className="text-muted-foreground">
        Confirmed physical returns, stock disposition and staff activity. Sale value is the returned merchandise value;
        refunds are handled separately.
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        <label>
          From
          <Input type="date" value={filters.from} onChange={(e) => change("from", e.target.value)} />
        </label>
        <label>
          To
          <Input type="date" value={filters.to} onChange={(e) => change("to", e.target.value)} />
        </label>
        <label>
          Search
          <Input
            placeholder="Product, SKU, order or staff name"
            value={filters.search}
            onChange={(e) => change("search", e.target.value)}
          />
        </label>
        <label>
          Staff ID
          <Input type="number" min={1} value={filters.actor_id} onChange={(e) => change("actor_id", e.target.value)} />
        </label>
        <label>
          Product ID
          <Input
            type="number"
            min={1}
            value={filters.product_id}
            onChange={(e) => change("product_id", e.target.value)}
          />
        </label>
        <label>
          Condition
          <select
            className="border rounded p-2 w-full"
            value={filters.disposition}
            onChange={(e) => change("disposition", e.target.value)}
          >
            <option value="">All</option>
            <option value="restock">Restocked</option>
            <option value="discard">Discarded</option>
          </select>
        </label>
      </div>
      {error && (
        <p role="alert">
          {error.message} <Button onClick={() => mutate()}>Retry</Button>
        </p>
      )}
      {isLoading && <p>Loading…</p>}
      {data && (
        <>
          <div className="grid gap-3 md:grid-cols-4">
            {[
              ["Receipts", data.summary.receipts],
              ["Orders", data.summary.orders],
              ["Returned sale value", `৳${Number(data.summary.sale_value).toLocaleString()}`],
              ["Inventory cost", `৳${Number(data.summary.cost_value).toLocaleString()}`],
            ].map(([title, value]) => (
              <div key={title} className="border rounded p-4">
                <p className="text-muted-foreground">{title}</p>
                <strong className="text-xl">{value}</strong>
              </div>
            ))}
          </div>
          <div className="flex gap-3 flex-wrap">
            {data.summary.units.map((u: any) => (
              <span key={u.unit_code + u.disposition} className="rounded bg-muted px-3 py-2">
                {u.disposition}: {Number(u.quantity).toLocaleString()} {u.unit_code}
              </span>
            ))}
          </div>
          <div className="overflow-x-auto border rounded">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {[
                    "Date / Order",
                    "Product / Option",
                    "Qty / Physical",
                    "Condition",
                    "Reason / Note",
                    "Received by",
                    "Sale value / Cost",
                  ].map((h) => (
                    <th key={h} className="p-3 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.data.data.map((r: any) => (
                  <tr className="border-t" key={r.id}>
                    <td className="p-3">
                      {new Date(r.created_at).toLocaleString()}
                      <br />
                      <Link className="underline" href={`/dashboard/orders/${r.order_no}`}>
                        {r.order_no}
                      </Link>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <ReturnProductThumbnail src={r.product_thumbnail_img} title={r.product_title || "Product"} />
                        <div>
                          {r.product_title}
                          <p className="text-muted-foreground">
                            {r.sku} · {r.option_label}
                          </p>
                          {r.bundle_snapshot && <p>Combo: {r.bundle_snapshot.title}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      {r.qty} units
                      <br />
                      {r.quantity_base} {r.unit_code}
                    </td>
                    <td className="p-3">{r.disposition}</td>
                    <td className="p-3 min-w-48">
                      <strong>{r.reason}</strong>
                      <p className="whitespace-pre-wrap">{r.note}</p>
                    </td>
                    <td className="p-3">
                      {r.actor_name}
                      <p>#{r.actor_id}</p>
                    </td>
                    <td className="p-3">
                      ৳{Number(r.sale_value).toLocaleString()}
                      <br />৳{Number(r.cost_value).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data.data.data.length && <p className="p-5">No matching return receipts.</p>}
          </div>
          <div className="flex gap-3 items-center">
            <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <span>
              Page {page} of {data.data.last_page}
            </span>
            <Button disabled={page >= data.data.last_page} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <section className="border rounded p-4">
              <h2 className="font-semibold mb-3">Returned products</h2>
              {data.products.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-3 border-t py-2 text-sm">
                  <ReturnProductThumbnail src={p.product_thumbnail_img} title={p.product_title || "Product"} />
                  <div>
                    <strong>
                      {p.product_title} · {p.option_label}
                    </strong>
                    <p>
                      {p.qty} units / {p.quantity} {p.unit_code} · ৳{Number(p.sale_value).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </section>
            <section className="border rounded p-4">
              <h2 className="font-semibold mb-3">Staff activity</h2>
              {data.staff.map((u: any) => (
                <div key={u.actor_id} className="border-t py-2 text-sm">
                  <strong>
                    {u.actor_name} (#{u.actor_id})
                  </strong>
                  <p>
                    {u.receipts} receipts · ৳{Number(u.sale_value).toLocaleString()}
                  </p>
                </div>
              ))}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
