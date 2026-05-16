"use client";

import * as React from "react";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const notifications = [
  {
    id: 1,
    title: "Order shipped",
    description: "ORD-52108 left the Chicago sort hub.",
    time: "2m ago",
    read: false,
  },
  {
    id: 2,
    title: "Low stock alert",
    description: "Radiance Ritual Set is below the reorder point.",
    time: "1h ago",
    read: false,
  },
  {
    id: 3,
    title: "Customer message",
    description: "North Clark Wholesale replied to your invoice thread.",
    time: "3h ago",
    read: false,
  },
  {
    id: 4,
    title: "Payout deposited",
    description: "Last week's Stripe payout hit your account.",
    time: "Yesterday",
    read: true,
  },
];

export function NotificationButton() {
  const [open, setOpen] = React.useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-medium text-white" style={{ backgroundColor: "#E7000B" }}>
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Mark all as read
          </button>
        </div>
        <Separator />
        <ScrollArea className="max-h-[360px]">
          {notifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <button className="flex w-full items-start justify-between gap-4 px-3 py-1.5 text-left transition-colors hover:bg-muted/50">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-sm font-semibold leading-snug">{notification.title}</p>
                  <p className="text-sm text-muted-foreground leading-snug">{notification.description}</p>
                </div>
                <span className="shrink-0 pt-0.5 text-xs text-muted-foreground">{notification.time}</span>
              </button>
              {index < notifications.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </ScrollArea>
        <Separator />
        <div className="p-2">
          <Button variant="ghost" size="sm" className="w-full text-xs">
            Show All Notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
