"use client";

import type * as React from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  Archive,
  ArrowLeft,
  BarChart,
  Box,
  Briefcase,
  CreditCard,
  Edit,
  FileText,
  History,
  Image as ImageIcon,
  Layout,
  LayoutDashboard,
  List,
  MessageCircle,
  MessageSquare,
  Package,
  Percent,
  PieChart,
  Settings,
  Shield,
  ShieldAlert,
  ShoppingCart,
  Star,
  Tag,
  Ticket,
  Truck,
  UserX,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoles, PageAccess } from "@/hooks/useRoles";

type PermissionItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  alwaysOn?: boolean;
};

type PermissionGroupType = {
  id: string;
  title: string;
  icon: React.ElementType;
  items: PermissionItem[];
};

const PERMISSION_GROUPS: PermissionGroupType[] = [
  {
    id: "core",
    title: "Core",
    icon: Shield,
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "roles_and_permission", label: "Roles & Permission", icon: Shield },
      { id: "users", label: "Users", icon: Users },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
  {
    id: "products_inventory",
    title: "Products & Inventory",
    icon: Box,
    items: [
      { id: "products", label: "Products", icon: Package },
      { id: "categories", label: "Categories", icon: List },
      { id: "brands", label: "Brands", icon: Tag },
      { id: "inventory", label: "Inventory", icon: Archive },
    ],
  },
  {
    id: "content_marketing",
    title: "Content & Marketing",
    icon: FileText,
    items: [
      { id: "blogs", label: "Blogs", icon: FileText },
      { id: "slider", label: "Slider", icon: ImageIcon },
      { id: "banner", label: "Banner", icon: ImageIcon },
      { id: "landing_pages", label: "All Landing Pages", icon: Layout },
      { id: "landing_pages_create", label: "Create Landing Page", icon: Layout },
      { id: "testimonials", label: "Testimonials", icon: MessageSquare },
      { id: "reviews", label: "Reviews", icon: Star },
    ],
  },
  {
    id: "sales_orders",
    title: "Sales & Orders",
    icon: ShoppingCart,
    items: [
      { id: "orders", label: "Order Management", icon: ShoppingCart },
      { id: "create_orders", label: "Create Order", icon: ShoppingCart },
      { id: "assign_orders", label: "Assign Orders", icon: ShoppingCart },
      { id: "discounts", label: "Discounts", icon: Percent },
      { id: "coupons", label: "Coupons", icon: Ticket },
      { id: "courier", label: "Courier", icon: Truck },
      { id: "history", label: "Purchase History", icon: History },
    ],
  },
  {
    id: "accounts",
    title: "Accounts",
    icon: Briefcase,
    items: [
      { id: "accounts", label: "Accounts Dashboard", icon: LayoutDashboard },
      { id: "revenue", label: "Revenue", icon: BarChart },
      { id: "expense_category", label: "Expense Categories", icon: List },
      { id: "expenses", label: "Expenses", icon: CreditCard },
      { id: "profit_loss", label: "Profit & Loss", icon: PieChart },
      { id: "statements", label: "Statements", icon: FileText },
      { id: "due", label: "Due Collection", icon: ShieldAlert },
      { id: "refund_history", label: "Refund History", icon: History },
    ],
  },
  {
    id: "reports",
    title: "Reports",
    icon: PieChart,
    items: [
      { id: "reports", label: "Reports Module", icon: Shield },
      { id: "reports_dashboard", label: "Dashboard Report", icon: LayoutDashboard },
      { id: "product_report", label: "Product Report", icon: Package },
      { id: "product_percent", label: "Product Percent", icon: Percent },
      { id: "customer_report", label: "Customer Report", icon: Users },
      { id: "employee_report", label: "Employee Report", icon: Users },
      { id: "payment_report", label: "Payment Report", icon: CreditCard },
      { id: "parcel_report", label: "Parcel Report", icon: Box },
      { id: "courier_report", label: "Courier Report", icon: Truck },
    ],
  },
  {
    id: "communication_security",
    title: "Communication & Security",
    icon: ShieldAlert,
    items: [
      { id: "customers", label: "Customers", icon: Users },
      { id: "messages", label: "Messages", icon: MessageCircle },
      { id: "fraud_checker", label: "Fraud Checker", icon: ShieldAlert },
      { id: "blocklist", label: "Blocklist", icon: UserX },
    ],
  },
];

export default function ViewRolePage() {
  const params = useParams();
  const roleId = params?.id ? params.id.toString() : "";

  const { roles, loading, error } = useRoles();
  const role = roles.find((r) => r.id.toString() === roleId);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 pb-10">
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="p-6 border border-destructive/20 bg-destructive/10 text-destructive rounded-lg">
        <p className="font-medium">Error loading role</p>
        <p className="text-sm">{error || "Role not found."}</p>
        <Link href="/dashboard/roles">
          <Button variant="outline" className="mt-4">Back to Roles</Button>
        </Link>
      </div>
    );
  }

  const selected: Record<string, boolean> = {};
  PERMISSION_GROUPS.forEach((group) => {
    group.items.forEach((item) => {
      if (role.page_access && role.page_access[item.id as keyof PageAccess] === 1) {
        selected[item.id] = true;
      }
    });
  });

  let totalSelectable = 0;
  let totalSelected = 0;

  PERMISSION_GROUPS.forEach((group) => {
    group.items.forEach((item) => {
      if (!item.alwaysOn) {
        totalSelectable++;
        if (selected[item.id]) totalSelected++;
      }
    });
  });

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Standard Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">View Role</h1>
          <p className="text-muted-foreground text-sm">View details and permissions for this role.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/roles">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Roles
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Role Name */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Role Information</CardTitle>
            <CardDescription>The name of this system role.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-xl space-y-2">
              <label htmlFor="roleName" className="text-sm font-medium text-foreground">
                Role Name
              </label>
              <Input id="roleName" className="mt-3 mb-1 font-semibold" value={role.role_name} readOnly disabled />
            </div>
          </CardContent>
        </Card>

        {/* Permissions Block */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl tracking-tight font-semibold">Permissions</h2>
              <p className="text-muted-foreground text-sm">Configured access control for this role.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
              <Badge variant="secondary" className="text-sm px-3 py-1 font-medium text-muted-foreground">
                <span className="text-foreground font-bold mr-1">{totalSelected}</span> / {totalSelectable} selected
              </Badge>
            </div>
          </div>

          {/* Grid Layout matches the Add Role page */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {PERMISSION_GROUPS.map((group) => (
              <Card key={group.id} className="flex flex-col overflow-hidden shadow-none gap-0 py-0 opacity-90">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3 border-b bg-muted/20 p-3 overflow-hidden">
                  <div className="flex items-center gap-2 min-w-0">
                    <group.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <CardTitle className="text-sm font-semibold truncate">{group.title}</CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col p-2 space-y-1 flex-1">
                  {group.items.map((item) => {
                    const isOn = item.alwaysOn || !!selected[item.id];
                    return (
                      <div key={item.id} className="flex items-center justify-between p-2 rounded-md">
                        <div className="flex items-center gap-3 min-w-0 overflow-hidden pr-2">
                          <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span
                            className={`text-sm font-medium truncate ${isOn ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            {item.label}
                          </span>
                          {item.alwaysOn && (
                            <Badge variant="secondary" className="text-[10px] uppercase font-bold py-0 h-5 shrink-0">
                              Always On
                            </Badge>
                          )}
                        </div>
                        <Switch className="shrink-0" checked={isOn} disabled={true} />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
          <Link href={`/dashboard/roles/${roleId}/edit`}>
            <Button className="px-8 gap-2 w-full sm:w-auto">
              <Edit className="h-4 w-4" />
              Edit Role
            </Button>
          </Link>
          <Link href="/dashboard/roles">
            <Button variant="outline" className="px-8 w-full sm:w-auto">
              Return to Roles
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
