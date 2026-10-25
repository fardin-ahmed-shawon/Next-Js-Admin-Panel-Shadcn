"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { notificationModules, NotificationItem, useNotificationActions } from "@/hooks/useNotifications";

export function NotificationList({ items, compact = false, onNavigate }: { items: NotificationItem[]; compact?: boolean; onNavigate?: () => void }) {
  const act = useNotificationActions();
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);
  async function change(item: NotificationItem, navigate = false) {
    setBusy(item.id);
    try {
      await act(item.id, navigate || !item.read_at ? "read" : "unread");
      if (navigate) { onNavigate?.(); router.push(item.url); }
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to update notification."); }
    finally { setBusy(null); }
  }
  if (!items.length) return <div className="px-4 py-10 text-center text-sm text-muted-foreground"><Bell className="mx-auto mb-3 size-7" />No notifications here.</div>;
  return <div className="divide-y">{items.map(item => <article key={item.id} className={"flex gap-3 p-4 " + (!item.read_at ? "bg-primary/5" : "")}>
    <span className={"mt-2 size-2 shrink-0 rounded-full " + (!item.read_at ? "bg-primary" : "bg-transparent")} />
    <div className="min-w-0 flex-1">
      <button type="button" disabled={busy === item.id} onClick={() => change(item, true)} className="w-full text-left disabled:opacity-60">
        <p className="text-sm font-semibold break-words">{item.title}</p>
        <p className={"mt-1 text-sm text-muted-foreground whitespace-pre-wrap break-words " + (compact ? "line-clamp-2" : "")}>{item.body}</p>
      </button>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full border px-2 py-0.5">{notificationModules[item.module] || item.module}</span>
        {item.actor_name && <span>By {item.actor_name}</span>}
        <time dateTime={item.created_at}>{new Date(item.created_at.replace(" ", "T")).toLocaleString("en-GB", { timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short" })}</time>
        <Button type="button" variant="ghost" size="sm" disabled={busy === item.id} className="ml-auto h-7 px-2 text-xs" onClick={() => change(item)}>
          {item.read_at ? <Mail className="size-3" /> : <Check className="size-3" />}{item.read_at ? "Mark unread" : "Mark read"}
        </Button>
      </div>
    </div>
  </article>)}</div>;
}
