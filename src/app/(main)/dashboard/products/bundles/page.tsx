"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchClient } from "@/lib/fetch-client";
export default function BundleList() {
  const [rows, setRows] = useState<any[]>([]),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(1),
    [last, setLast] = useState(1);
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0),
    [deleting, setDeleting] = useState<number | null>(null);
  const api = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    setError("");
    fetchClient(api + "product-bundles?page=" + page + "&search=" + encodeURIComponent(search), {
      signal: abort.signal,
    })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.message || "Unable to load bundles");
        setRows(j.data.data);
        setLast(j.data.last_page);
      })
      .catch((e) => {
        if (!abort.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, [api, page, search, revision]);
  async function remove(row: any) {
    if (!window.confirm("Delete " + row.title + "? Component products and stock will be preserved.")) return;
    setDeleting(row.id);
    try {
      const r = await fetchClient(api + "product-bundles/" + row.id, { method: "DELETE" });
      if (!r.ok) throw new Error((await r.json()).message || "Delete failed");
      toast.success("Bundle deleted.");
      setPage(1);
      setRevision((v) => v + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(null);
    }
  }
  const image = (p: string) =>
    p?.startsWith("http")
      ? p
      : (process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:8000").replace(/\/$/, "") +
        "/" +
        (p || "").replace(/^\//, "");
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">Bundle List</h1>
        <Button asChild>
          <Link href="/dashboard/products/bundles/create">Create Bundle</Link>
        </Button>
      </div>
      <Input
        placeholder="Search bundles..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />
      <div className="rounded-xl border p-4 overflow-x-auto">
        {error ? (
          <p role="alert">{error}</p>
        ) : loading ? (
          <p>Loading bundles...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                {["Bundle", "Selected products", "Selling price", "Estimated Stock", "Status", "Actions"].map((h) => (
                  <th key={h} className="p-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b align-top">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={image(r.product_thumbnail_img)} alt="" className="size-14 rounded object-cover" />
                      {r.title}
                    </div>
                  </td>
                  <td className="p-3">
                    <ul className="space-y-2">
                      {r.bundle_items.map((i: any) => (
                        <li key={i.id}>
                          {i.product?.title || "Unavailable product"}
                          {i.option_label_snapshot ? " · " + i.option_label_snapshot : ""} × {i.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-3">৳{Number(r.selling_price).toLocaleString()}</td>
                  <td className="p-3">{r.available_stock}</td>
                  <td className="p-3">{r.status}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={"/dashboard/products/bundles/" + r.id + "/edit"}>Edit</Link>
                      </Button>
                      <Button size="sm" variant="destructive" disabled={deleting === r.id} onClick={() => remove(r)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    No bundles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <div className="flex justify-end gap-3 items-center">
        <Button disabled={loading || page <= 1} variant="outline" onClick={() => setPage(page - 1)}>
          Previous
        </Button>
        <span>
          Page {page} of {last}
        </span>
        <Button disabled={loading || page >= last} variant="outline" onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
