"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CustomerSegmentRule } from "@/hooks/useCustomers";
import { cn } from "@/lib/utils";

interface CustomerSegmentTabsProps {
  rules: CustomerSegmentRule[];
  counts: Record<string, number>;
  total: number;
  activeKey: string;
  onChange: (key: string) => void;
}

export function CustomerSegmentTabs({ rules, counts, total, activeKey, onChange }: CustomerSegmentTabsProps) {
  const root = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [navigation, setNavigation] = useState({ overflow: false, left: false, right: false });

  const updateNavigation = useCallback(() => {
    if (!root.current || !viewport.current || !content.current) return;
    const track = viewport.current;
    const next = {
      overflow: content.current.scrollWidth > root.current.clientWidth + 1,
      left: track.scrollLeft > 1,
      right: track.scrollWidth - track.clientWidth - track.scrollLeft > 1,
    };
    setNavigation((previous) =>
      previous.overflow === next.overflow && previous.left === next.left && previous.right === next.right
        ? previous
        : next,
    );
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver(updateNavigation);
    [root.current, viewport.current, content.current].forEach((element) => {
      if (element) observer.observe(element);
    });
    updateNavigation();
    return () => observer.disconnect();
  }, [updateNavigation]);

  const scroll = (direction: -1 | 1) => {
    const track = viewport.current;
    if (!track) return;
    track.scrollBy({
      left: direction * Math.max(160, track.clientWidth * 0.75),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  };

  useEffect(() => {
    const track = viewport.current;
    const selected = content.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    if (!track || !selected) return;
    const visible = track.getBoundingClientRect();
    const tab = selected.getBoundingClientRect();
    const offset =
      tab.left < visible.left
        ? tab.left - visible.left - 4
        : tab.right > visible.right
          ? tab.right - visible.right + 4
          : 0;
    if (offset) track.scrollBy({ left: offset, behavior: "instant" });
    updateNavigation();
  }, [activeKey, rules, updateNavigation]);

  return (
    <div className="border-b bg-muted/20 px-3 py-2 sm:px-4">
      <div ref={root} className="flex min-w-0 items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <div
            ref={viewport}
            onScroll={updateNavigation}
            className="overflow-x-auto overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Customer segments"
          >
            <div ref={content} className="flex w-max items-center gap-2 py-1">
              <button
                type="button"
                aria-pressed={activeKey === "all"}
                onClick={() => onChange("all")}
                className={cn(
                  "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                  activeKey === "all"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-transparent text-muted-foreground hover:bg-muted/50",
                )}
              >
                <Users className="size-3.5" />
                <span>All Customers</span>
                <span className="rounded-full bg-muted/20 px-2 py-0.5 text-[10px]">{total}</span>
              </button>
              {rules.map((rule) => (
                <button
                  key={rule.key}
                  type="button"
                  aria-pressed={activeKey === rule.key}
                  onClick={() => onChange(rule.key)}
                  className="relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                  style={{
                    color: rule.color,
                    borderColor: activeKey === rule.key ? rule.color : "transparent",
                    backgroundColor:
                      activeKey === rule.key ? "color-mix(in srgb, " + rule.color + " 10%, transparent)" : undefined,
                  }}
                >
                  <span className="size-2 rounded-full" style={{ backgroundColor: rule.color }} />
                  <span>{rule.name}</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] tabular-nums"
                    style={{ backgroundColor: "color-mix(in srgb, " + rule.color + " 15%, transparent)" }}
                  >
                    {counts[rule.key] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
          {navigation.left && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-5 bg-gradient-to-r from-card to-transparent"
            />
          )}
          {navigation.right && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 w-5 bg-gradient-to-l from-card to-transparent"
            />
          )}
        </div>
        {navigation.overflow && (
          <div className="flex shrink-0 items-center gap-1 border-l pl-2" aria-label="Segment navigation">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8 rounded-full bg-card shadow-none disabled:opacity-30"
              disabled={!navigation.left}
              onClick={() => scroll(-1)}
              aria-label="Scroll customer segments left"
              title="Previous segments"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8 rounded-full bg-card shadow-none disabled:opacity-30"
              disabled={!navigation.right}
              onClick={() => scroll(1)}
              aria-label="Scroll customer segments right"
              title="More segments"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
