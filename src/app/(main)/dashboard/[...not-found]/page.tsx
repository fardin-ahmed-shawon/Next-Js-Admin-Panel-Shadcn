"use client";

import Link from "next/link";
import { BotOff, MoveLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-4">
      {/* Illustration Area */}
      <div className="relative mb-6 flex items-center justify-center">
        {/* Massive 404 Text Background */}
        <div className="text-[10rem] sm:text-[14rem] font-black leading-none text-muted/50 select-none tracking-tighter">
          404
        </div>
        
        {/* Foreground Icon mimicking the illustration */}
        <div className="absolute flex flex-col items-center justify-center translate-y-4">
          <div className="rounded-full bg-background/50 p-6 backdrop-blur-sm shadow-xl ring-1 ring-border">
            <BotOff className="size-20 sm:size-28 text-primary animate-pulse" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      <div className="max-w-md space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 z-10 mt-8">
        <div className="space-y-2">
          <h2 className="font-bold text-2xl sm:text-3xl tracking-tight text-foreground uppercase">
            uh-oh! Nothing here...
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Oops! Page not found. This section will be added in future updates.
          </p>
        </div>
        
        <div className="flex items-center justify-center pt-4">
          <Button asChild size="lg" className="rounded-full px-8 shadow-md transition-transform hover:scale-105 font-bold tracking-wide">
            <Link href="/dashboard/default" prefetch={false}>
              <MoveLeft className="mr-2 size-5" />
              GO BACK HOME
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
