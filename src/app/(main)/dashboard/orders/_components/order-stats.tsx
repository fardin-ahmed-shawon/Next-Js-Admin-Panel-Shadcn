import { Package, ShoppingCart, DollarSign, UserPlus, UserCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderRow {
  id: string; customer: string; phone: string; items: number; total: number;
  orderStatus: string; paymentStatus: string; date: string; avatar: string;
  category: string; subCategory: string;
}

export function OrderStats({ data }: { data: OrderRow[] }) {
  const totalOrders = data.length;
  const totalValue = data.reduce((s, o) => s + o.total, 0);
  const totalProducts = new Set(data.map((o) => o.category + o.subCategory)).size;
  const totalUnits = data.reduce((s, o) => s + o.items, 0);

  const customerCounts = new Map<string, number>();
  data.forEach((o) => customerCounts.set(o.phone, (customerCounts.get(o.phone) || 0) + 1));
  const newCustomers = [...customerCounts.values()].filter((c) => c === 1).length;
  const repeatedCustomers = [...customerCounts.values()].filter((c) => c > 1).length;

  const stats = [
    { title: "Total Orders",       value: totalOrders.toLocaleString(),        icon: Package,      subtitle: "All orders in range"          },
    { title: "Order Value",         value: `৳${totalValue.toLocaleString()}`,   icon: DollarSign,   subtitle: "Total revenue generated"      },
    { title: "Product Types",       value: totalProducts.toLocaleString(),      icon: ShoppingCart, subtitle: "Unique product categories"    },
    { title: "Purchased Units",     value: totalUnits.toLocaleString(),         icon: Package,      subtitle: "Total items ordered"          },
    { title: "New Customers",       value: newCustomers.toLocaleString(),       icon: UserPlus,     subtitle: "First-time buyers"            },
    { title: "Repeat Customers",    value: repeatedCustomers.toLocaleString(),  icon: UserCheck,    subtitle: "Customers with 2+ orders"     },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs md:grid-cols-3 xl:grid-cols-6 dark:*:data-[slot=card]:bg-card">
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
            <div className="font-medium text-2xl tabular-nums leading-none tracking-tight">{stat.value}</div>
            <p className="text-muted-foreground text-xs">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
