import Link from "next/link";

import { Construction, MoveLeft, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ComingSoonPage() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center p-4">
      <div className="relative mb-8 flex size-32 items-center justify-center">
        {/* Animated background rings */}
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 duration-1000" />
        <div className="absolute inset-2 animate-pulse rounded-full bg-primary/30 duration-700" />
        <div className="absolute inset-4 rounded-full bg-primary/40" />
        
        {/* Center Icon */}
        <div className="relative z-10 flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl ring-8 ring-background">
          <Construction className="size-10" />
        </div>
      </div>

      <div className="max-w-md space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="space-y-3">
          <h1 className="flex items-center justify-center gap-3 font-bold text-4xl tracking-tight text-foreground">
            Coming Soon 
            <Sparkles className="size-7 text-amber-500 animate-pulse" />
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Oops! Page not found. But don't worry, we're building something awesome here. This section will be added in future updates.
          </p>
        </div>
        
        <div className="flex items-center justify-center pt-6">
          <Button asChild size="lg" className="rounded-full shadow-lg transition-transform hover:scale-105">
            <Link href="/dashboard/default" prefetch={false}>
              <MoveLeft className="mr-2 size-4" />
              Return to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
