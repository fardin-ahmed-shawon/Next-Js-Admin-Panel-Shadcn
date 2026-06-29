"use client";

import * as React from "react";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

export function NotificationButton() {
  const [open, setOpen] = React.useState(false);
  const unreadCount = 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-medium text-white"
              style={{ backgroundColor: "#E7000B" }}
            >
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/20">
          <p className="text-sm font-semibold">Notifications</p>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full font-medium">0</span>
        </div>
        <Separator />
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
            <Bell className="size-5" />
          </div>
          <p className="text-sm font-semibold text-foreground">Notification Features</p>
          <p className="text-xs text-muted-foreground mt-1">Coming Soon</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
