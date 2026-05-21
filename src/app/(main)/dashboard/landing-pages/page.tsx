import Link from "next/link";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { LandingPagesTable } from "./_components/landing-pages-table";

export default function LandingPagesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Landing Pages</h1>
          <p className="text-muted-foreground text-sm">
            Manage your marketing and promotional landing pages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link href="/dashboard/landing-pages/create">
              <Plus className="mr-2 size-4" />
              Create Page
            </Link>
          </Button>
        </div>
      </div>

      <LandingPagesTable />
    </div>
  );
}
