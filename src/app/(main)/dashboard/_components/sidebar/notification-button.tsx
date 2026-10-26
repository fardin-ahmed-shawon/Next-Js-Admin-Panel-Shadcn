"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Link from "next/link";
import { Bell, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotificationList } from "@/components/notifications/notification-list";
import { useNotifications, useNotificationActions } from "@/hooks/useNotifications";

export function NotificationButton() {
  const router = useRouter();
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
    <Dialog open={mounted && !!data?.banners.length}>
      <DialogContent overlayClassName="backdrop-blur-md bg-black/30" showCloseButton={false} className="sm:max-w-2xl p-8 sm:p-10" onEscapeKeyDown={event => event.preventDefault()} onPointerDownOutside={event => event.preventDefault()} onInteractOutside={event => event.preventDefault()}>
        {data?.banners.slice(0, 1).map(item => <div key={item.id} className="space-y-6">
          <Megaphone className="size-10 text-primary" />
          <DialogTitle className="text-2xl sm:text-3xl font-bold break-words">{item.title}</DialogTitle>
          <DialogDescription className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap break-words text-base leading-relaxed">{item.body}</DialogDescription>
          <Button className="w-full h-12 text-base" disabled={busy !== null} onClick={async () => {
            setBusy(item.id);
            try { await act(item.id, "dismiss"); router.push("/dashboard/hrm/self-service?tab=" + (item.module === "warnings" ? "warnings" : "notices")); }
            catch (error) { toast.error(error instanceof Error ? error.message : "Unable to open notice. Please retry."); }
            finally { setBusy(null); }
          }}>{busy === item.id ? "Opening…" : "See notice"}</Button>
        </div>)}
      </DialogContent>
    </Dialog>
  </>;
}
