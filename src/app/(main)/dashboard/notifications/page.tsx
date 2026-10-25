"use client";

import { useEffect, useState } from "react";
import { CheckCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { NotificationList } from "@/components/notifications/notification-list";
import { notificationModules, useNotifications, useNotificationActions } from "@/hooks/useNotifications";

export default function NotificationsPage() {
  const [status, setStatus] = useState("all");
  const [module, setModule] = useState("");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const query = new URLSearchParams({ status, page: String(page), per_page: "20", ...(module ? { module } : {}) });
  const { data, isLoading, error, mutate } = useNotifications(query.toString());
  const act = useNotificationActions();
  useEffect(() => { if (data && page > data.notifications.last_page) setPage(Math.max(1, data.notifications.last_page)); }, [data, page]);
  async function readAll() {
    setBusy(true);
    try { await act("read-all", "read", data?.latest_id); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Unable to mark notifications read."); }
    finally { setBusy(false); }
  }
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold">Notifications</h1><p className="mt-1 text-sm text-muted-foreground">Updates from your orders, operations and HRM within your access.</p></div>
      <div className="flex gap-2"><Button variant="outline" disabled={busy || !data?.unread_count} onClick={readAll}><CheckCheck className="size-4" />Mark all read</Button><Button variant="outline" size="icon" aria-label="Refresh notifications" onClick={() => mutate()}><RefreshCw className="size-4" /></Button></div></div>
    <div className="grid grid-cols-3 divide-x rounded-xl border">{[["Total", data?.total_count], ["Unread", data?.unread_count], ["Read", data ? data.total_count - data.unread_count : undefined]].map(([label, value]) => <div className="p-4" key={label}><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">{value ?? "—"}</p></div>)}</div>
    <section className="overflow-hidden rounded-xl border">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <div className="flex rounded-lg bg-muted p-1" aria-label="Read status">{["all", "unread", "read"].map(value => <Button key={value} variant={status === value ? "secondary" : "ghost"} size="sm" aria-pressed={status === value} onClick={() => { setStatus(value); setPage(1); }}>{value[0].toUpperCase() + value.slice(1)}</Button>)}</div>
        <select aria-label="Notification module" className="h-9 rounded-md border bg-background px-3 text-sm" value={module} onChange={event => { setModule(event.target.value); setPage(1); }}><option value="">All modules</option>{Object.entries(notificationModules).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      </div>
      {isLoading ? <div className="space-y-4 p-4">{[1,2,3,4].map(n => <div key={n} className="h-20 animate-pulse rounded bg-muted" />)}</div> : error ? <div className="p-6">Unable to load notifications. <Button variant="link" onClick={() => mutate()}>Retry</Button></div> : <NotificationList items={data?.notifications.data || []} />}
      <div className="flex items-center justify-between gap-3 border-t p-4 text-sm"><span>{data?.notifications.total ?? 0} notifications · Page {page} of {data?.notifications.last_page || 1}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1 || isLoading} onClick={() => setPage(page - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={isLoading || page >= (data?.notifications.last_page || 1)} onClick={() => setPage(page + 1)}>Next</Button></div></div>
    </section>
  </div>;
}
