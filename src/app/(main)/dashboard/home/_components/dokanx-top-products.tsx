import { Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const topSellingProducts = [
  { name: "iPhone 14 Pro Max", sold: "18 units", revenue: "৳2,850,984" },
  { name: "MacBook Air M2", sold: "8 units", revenue: "৳1,120,000" },
  { name: "TECNO CAMON 20 Pro", sold: "14 units", revenue: "৳264,000" },
  { name: "GREE Inverter AC", sold: "7 units", revenue: "৳320,100" },
  { name: "Matur TWS Earbuds", sold: "17 units", revenue: "৳42,483" },
];

export function DokanxTopProducts() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <CardTitle className="leading-none">Top Selling Products</CardTitle>
            <CardDescription>Top 5 products</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="h-auto px-2 py-1">Full Details</Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pb-6">
        <div className="flex-1 flex flex-col justify-between">
          {topSellingProducts.map((product, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted border">
                  <Box className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none">{product.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{product.sold}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{product.revenue}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
