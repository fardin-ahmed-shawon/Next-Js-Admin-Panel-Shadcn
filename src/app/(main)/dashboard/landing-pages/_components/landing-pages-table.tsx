"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type LandingPage, landingPublicUrl, landingRequest } from "@/lib/landing-pages";

export function LandingPagesTable() {
  const [rows, setRows] = useState<LandingPage[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LandingPage | null>(null);
  useEffect(() => {
    // Retry and deletion explicitly invalidate this request.
    void refresh;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const timer = setTimeout(() => {
      landingRequest(`?page=${page}&search=${encodeURIComponent(search)}&status=${status}`, {
        signal: controller.signal,
      })
        .then(({ data }) => {
          setRows(data.data);
          setLastPage(data.last_page);
          setTotal(data.total);
          setLoading(false);
        })
        .catch((err) => {
          if (!controller.signal.aborted) {
            setError(err.message);
            setLoading(false);
          }
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [page, search, status, refresh]);
  async function remove(row: LandingPage) {
    setDeleting(row.id);
    try {
      await landingRequest(`/${row.id}`, { method: "DELETE" });
      toast.success("Landing page deleted.");
      setDeleteTarget(null);
      if (rows.length === 1 && page > 1) setPage(page - 1);
      else setRefresh((value) => value + 1);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setDeleting(null);
    }
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          aria-label="Search landing pages"
          placeholder="Search title or slug…"
          className="max-w-sm"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          aria-label="Filter by visibility"
          className="h-9 rounded-md border bg-background px-3 text-sm"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All pages</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
        <span className="text-muted-foreground text-sm">
          {total} {total === 1 ? "page" : "pages"}
        </span>
      </div>
      {error ? (
        <div role="alert" className="rounded-lg border p-6 text-destructive">
          {error}{" "}
          <Button variant="outline" onClick={() => setRefresh((n) => n + 1)}>
            Retry
          </Button>
        </div>
      ) : loading ? (
        <p role="status" className="p-8">
          Loading landing pages…
        </p>
      ) : !rows.length ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <h2 className="font-medium">No landing pages found</h2>
          <p className="mt-2 text-muted-foreground text-sm">Create your first page or adjust your search.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4">Landing page</th>
                <th className="p-4">Product</th>
                <th className="p-4">Visibility</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="p-4">
                    <div className="font-medium">{row.home_title}</div>
                    <div className="mt-1 text-muted-foreground text-xs">/landing/{row.slug}</div>
                  </td>
                  <td className="p-4">{row.product?.title || `#${row.product_id}`}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs ${row.status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      {row.status === "published" && landingPublicUrl(row.slug) && (
                        <Button asChild variant="outline" size="sm">
                          <a href={landingPublicUrl(row.slug)} target="_blank" rel="noopener noreferrer">
                            View page
                          </a>
                        </Button>
                      )}
                      {row.status === "published" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(landingPublicUrl(row.slug) || `/landing/${row.slug}`);
                              toast.success("Page link copied.");
                            } catch {
                              toast.error("Could not copy the link.");
                            }
                          }}
                        >
                          Copy link
                        </Button>
                      )}
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/landing-pages/${row.id}/edit`}>Edit</Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deleting !== null}
                        onClick={() => setDeleteTarget(row)}
                      >
                        {deleting === row.id ? "Deleting…" : "Delete"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" disabled={loading || page <= 1} onClick={() => setPage(page - 1)}>
          Previous
        </Button>
        <span className="text-sm">
          Page {page} of {lastPage}
        </span>
        <Button variant="outline" disabled={loading || page >= lastPage} onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && deleting === null) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete landing page?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete “{deleteTarget?.home_title}” and its landing-page content? The product will remain available.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting !== null}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deleting !== null}
              onClick={() => deleteTarget && remove(deleteTarget)}
            >
              {deleting !== null ? "Deleting…" : "Delete page"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
