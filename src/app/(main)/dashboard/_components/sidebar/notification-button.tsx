"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Bell, Megaphone, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotificationList } from "@/components/notifications/notification-list";
import { useNotifications, useNotificationActions } from "@/hooks/useNotifications";

export function NotificationButton() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [busy, setBusy] = useState<number | "all" | null>(null);
  const { data, error, isLoading, mutate } = useNotifications();
  const act = useNotificationActions();
  useEffect(() => setMounted(true), []);
  const count = data?.unread_count || 0;
  async function update(id: number | "all") {
    setBusy(id);
    try { await act(id === "all" ? "read-all" : id, id === "all" ? "read" : "dismiss", data?.latest_id); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Unable to save notification state."); }
    finally { setBusy(null); }
  }
  return <>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild><Button variant="outline" size="icon" className="relative" aria-label={"Notifications, " + count + " unread"}>
        <Bell className="size-4" />{count > 0 && <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">{count > 99 ? "99+" : count}</span>}
      </Button></PopoverTrigger>
      <PopoverContent align="end" className="w-[min(420px,calc(100vw-24px))] overflow-hidden p-0">
        <div className="flex items-center justify-between border-b px-4 py-3"><h2 className="font-semibold">Notifications <span className="text-muted-foreground">({count})</span></h2>
          <Button variant="ghost" size="sm" disabled={!count || busy !== null} onClick={() => update("all")}>Read all</Button></div>
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? <div className="space-y-4 p-4" aria-label="Loading notifications">{[1,2,3].map(n => <div key={n} className="h-16 animate-pulse rounded-lg bg-muted" />)}</div>
            : error ? <div className="p-4 text-sm">Unable to load notifications. <Button variant="link" onClick={() => mutate()}>Retry</Button></div>
            : <NotificationList items={data?.notifications.data || []} compact onNavigate={() => setOpen(false)} />}
        </div>
        <Link href="/dashboard/notifications" onClick={() => setOpen(false)} className="block border-t p-3 text-center text-sm font-medium hover:bg-muted">See all notifications</Link>
      </PopoverContent>
    </Popover>
    {mounted && !!data?.banners.length && createPortal(<aside aria-label="Announcements" className="pointer-events-none fixed bottom-4 right-4 z-50 w-[min(420px,calc(100vw-32px))] space-y-3">
      {data.banners.slice(0, 1).map(item => <section key={item.id} className="pointer-events-auto rounded-xl border bg-background p-5 shadow-xl" role="status">
        <div className="flex items-start gap-3"><Megaphone className="mt-1 size-5 shrink-0 text-primary" /><h2 className="flex-1 font-semibold break-words">{item.title}</h2>
          <Button variant="ghost" size="icon" className="-mr-2 -mt-2 size-8 shrink-0" disabled={busy === item.id} aria-label="Dismiss announcement permanently" onClick={() => update(item.id)}><X className="size-4" /></Button></div>
        <p className="mt-3 max-h-48 overflow-y-auto whitespace-pre-wrap break-words text-sm text-muted-foreground">{item.body}</p>
        <p className="mt-3 text-xs text-muted-foreground">Closing this announcement hides it permanently for your account.</p>
      </section>)}
    </aside>, document.body)}
  </>;
}
