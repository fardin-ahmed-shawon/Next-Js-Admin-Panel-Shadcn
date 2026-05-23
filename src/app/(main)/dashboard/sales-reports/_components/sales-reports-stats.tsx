import { DollarSign, ShoppingCart, Percent, TrendingDown, Users, Package, Boxes, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { allOrders } from "../../orders/page";

type OrderRow = typeof allOrders[0];

export function SalesReportsStats({ data }: { data: OrderRow[] }) {
  const totalOrders = data.length;
  const totalOrderValue = data.reduce((sum, order) => sum + order.total, 0);
  const totalPaid = data.reduce((sum, order) => sum + order.paid, 0);
  const totalDue = data.reduce((sum, order) => sum + order.due, 0);
  const totalSoldUnits = data.reduce((sum, order) => sum + order.items, 0);
  
  const uniqueCustomers = new Set(data.map(order => order.phone)).size;
  const uniqueProducts = new Set(data.map(order => order.subCategory)).size;

  const averageOrderValue = totalOrders > 0 ? (totalOrderValue / totalOrders).toFixed(0) : "0";

  const stats = [
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString(),
      icon: ShoppingCart,
      subtitle: "All orders placed",
    },
    {
      title: "Total Order Value",
      value: `৳ ${totalOrderValue.toLocaleString()}`,
      icon: DollarSign,
      subtitle: "Gross sales",
    },
    {
      title: "Average Order Value",
      value: `৳ ${Number(averageOrderValue).toLocaleString()}`,
      icon: Percent,
      subtitle: "Revenue per order",
    },
    {
      title: "Total Unique Customer",
      value: uniqueCustomers.toLocaleString(),
      icon: Users,
      subtitle: "Distinct buyers",
    },
    {
      title: "Total Paid Amount",
      value: `৳ ${totalPaid.toLocaleString()}`,
      icon: Receipt,
      subtitle: "Collected revenue",
    },
    {
      title: "Total Due Amount",
      value: `৳ ${totalDue.toLocaleString()}`,
      icon: TrendingDown,
      subtitle: "Unpaid balances",
    },
    {
      title: "Total Sold Products",
      value: uniqueProducts.toLocaleString(),
      icon: Boxes,
      subtitle: "Product categories",
    },
    {
      title: "Total Sold Unit",
      value: totalSoldUnits.toLocaleString(),
      icon: Package,
      subtitle: "Individual items",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {stats.map((stat, i) => (
        <Card key={i} data-slot="card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">{stat.title}</CardTitle>
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
              <stat.icon className="size-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-muted-foreground text-xs">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
