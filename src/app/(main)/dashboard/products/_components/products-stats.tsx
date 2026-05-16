import { Box, PackageCheck, PackageMinus, ShoppingBag } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    title: "Total Products",
    value: "148",
    icon: ShoppingBag,
    subtitle: "All products in catalog",
  },
  {
    title: "Active Products",
    value: "124",
    icon: PackageCheck,
    subtitle: "Visible on storefront",
  },
  {
    title: "Inactive Products",
    value: "12",
    icon: PackageMinus,
    subtitle: "Hidden from storefront",
  },
  {
    title: "Draft Products",
    value: "12",
    icon: Box,
    subtitle: "Awaiting review",
  },
];

export function ProductsStats() {
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {stats.map((stat, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle>
              <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <stat.icon className="size-4" />
              </div>
            </CardTitle>
            <CardDescription>{stat.title}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">{stat.value}</div>
            <p className="text-muted-foreground text-sm">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
