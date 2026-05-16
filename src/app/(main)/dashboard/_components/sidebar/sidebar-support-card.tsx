import Link from "next/link";

import { ExternalLink } from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SidebarSupportCard() {
  return (
    <Card size="sm" className="shadow-none group-data-[collapsible=icon]:hidden">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">Visit Storefront</CardTitle>
        <CardDescription>
          See how your store appears to customers.&nbsp;
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            aria-label="Visit Storefront"
            className="inline-flex items-center text-foreground font-medium hover:underline mt-1"
          >
            Go to Store
            <ExternalLink aria-hidden className="ml-1 size-3" />
          </Link>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
