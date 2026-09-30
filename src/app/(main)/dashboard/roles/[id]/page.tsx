"use client";

import type * as React from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  AlertCircle,
  Archive,
  ArrowLeft,
  BarChart,
  BarChart3,
  Box,
  Briefcase,
  CheckSquare,
  Clock,
  CreditCard,
  DollarSign,
  Edit,
  FileText,
  FolderGit2,
  History,
  Image as ImageIcon,
  Landmark,
  Layers,
  Layout,
  LayoutDashboard,
  List,
  MessageCircle,
  MessageSquare,
  Network,
  Package,
  Percent,
  PhoneCall,
  PieChart,
  Receipt,
  RefreshCw,
  RotateCcw,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Tag,
  Ticket,
  TrendingUp,
  Trophy,
  Truck,
  UserCheck,
  UserMinus,
  UserX,
  Users,
  Video,
  Zap,
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
  isSubToggle?: boolean;
  dependsOn?: string;
  badge?: string;
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
    title: "Core & Security",
    icon: Shield,
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "roles_and_permission", label: "Roles & Permission", icon: Shield },
      { id: "auto_order", label: "Auto Order Distribution", icon: RefreshCw },
      { id: "users", label: "Users", icon: Users },
      { id: "user_behaviour_logs", label: "User Behaviour Logs", icon: History },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
  {
    id: "products_inventory",
    title: "Products & Procurement",
    icon: Box,
    items: [
      { id: "products", label: "Products (All & Add)", icon: Package },
      { id: "procurement", label: "Purchase & Procurement", icon: ShoppingBag },
      { id: "suppliers", label: "Suppliers Management", icon: Truck },
      { id: "product_bundles", label: "Product Bundles", icon: Layers },
      { id: "product_attributes", label: "Variant Attributes", icon: Tag },
      { id: "product_recommendations", label: "AI Recommendations", icon: Sparkles },
      { id: "homepage_videos", label: "Home Page Videos", icon: Video },
      { id: "categories", label: "Categories", icon: List },
      { id: "brands", label: "Brands", icon: Tag },
      { id: "inventory", label: "Inventory Stock", icon: Archive },
    ],
  },
  {
    id: "sales_orders",
    title: "Sales & Orders",
    icon: ShoppingCart,
    items: [
      { id: "orders", label: "Order Management", icon: ShoppingCart },
      { id: "all_orders", label: "Show All Orders", icon: ShoppingCart },
      { id: "create_orders", label: "Create Order", icon: ShoppingCart },
      { id: "assign_orders", label: "Assign Orders", icon: ShoppingCart },
      { id: "wholesale_orders", label: "Wholesale Orders", icon: Store },
      { id: "order_returns", label: "Returns & Pending Returns", icon: RotateCcw },
      { id: "invoices", label: "Invoices", icon: Receipt },
      { id: "incomplete_orders", label: "Incomplete Orders", icon: AlertCircle },
      { id: "ai_calling_logs", label: "AI Calling Logs", icon: PhoneCall },
      { id: "discounts", label: "Discounts", icon: Percent },
      { id: "coupons", label: "Coupons", icon: Ticket },
      { id: "courier", label: "Courier", icon: Truck },
      { id: "history", label: "Purchase History", icon: History },
    ],
  },
  {
    id: "crm_customers",
    title: "CRM & Customers",
    icon: Users,
    items: [
      { id: "customers", label: "Customers Directory", icon: Users },
      { id: "customer_followups", label: "Customer Follow-Ups", icon: PhoneCall },
      { id: "customer_segmentation", label: "Customer Segmentation", icon: PieChart },
      { id: "messages", label: "Messages", icon: MessageCircle },
      { id: "fraud_checker", label: "Fraud Checker", icon: ShieldAlert },
      { id: "blocklist", label: "Blocklist", icon: UserX },
    ],
  },
  {
    id: "accounts",
    title: "Accounts & Finance",
    icon: Briefcase,
    items: [
      { id: "accounts", label: "Accounts Dashboard", icon: LayoutDashboard },
      { id: "capital", label: "Cash In / Cash Out (Capital)", icon: DollarSign },
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
    id: "content_marketing",
    title: "Content & Marketing",
    icon: FileText,
    items: [
      { id: "flash_sales", label: "Flash Sales", icon: Zap },
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
    id: "hrm",
    title: "HRM & People",
    icon: Briefcase,
    items: [
      { id: "hrm_overview", label: "Overview", icon: LayoutDashboard, badge: "Access Based" },
      { id: "hrm_leaderboard", label: "Leaderboard", icon: Trophy, badge: "Access Based" },
      { id: "hrm_department_performance", label: "Dept Performance", icon: BarChart3, badge: "Access Based" },
      { id: "hrm_org_tree", label: "Organization Tree", icon: Network, badge: "Access Based" },
      { id: "hrm_employees", label: "Employees Directory", icon: Users, badge: "Access Based" },
      { id: "hrm_salaries", label: "Salary & Payroll", icon: DollarSign, badge: "Access Based" },

      { id: "hrm_upsells", label: "Upsell Tracking", icon: TrendingUp, badge: "Access Based" },
      { id: "hrm_all_upsells", label: "All User Upsell Access", icon: ShieldCheck, isSubToggle: true, dependsOn: "hrm_upsells" },

      { id: "hrm_tasks", label: "Peer Tasks", icon: CheckSquare, badge: "Access Based" },
      { id: "hrm_all_tasks", label: "All User Tasks Access", icon: ShieldCheck, isSubToggle: true, dependsOn: "hrm_tasks" },

      { id: "hrm_attendance", label: "Attendance", icon: Clock, badge: "Access Based" },
      { id: "hrm_all_attendance", label: "All User Attendance Access", icon: ShieldCheck, isSubToggle: true, dependsOn: "hrm_attendance" },

      { id: "hrm_cash_flow", label: "Employee Cash Flow", icon: Receipt, badge: "Access Based" },
      { id: "hrm_all_cash_flow", label: "All User Cash Flow Access", icon: ShieldCheck, isSubToggle: true, dependsOn: "hrm_cash_flow" },

      { id: "hrm_loans", label: "Loans & Advance", icon: Landmark, badge: "Access Based" },
      { id: "hrm_all_loans", label: "All User Loans Access", icon: ShieldCheck, isSubToggle: true, dependsOn: "hrm_loans" },

      { id: "hrm_documents", label: "Documents", icon: FolderGit2, badge: "Access Based" },
      { id: "hrm_all_documents", label: "All User Documents Access", icon: ShieldCheck, isSubToggle: true, dependsOn: "hrm_documents" },

      { id: "hrm_exits", label: "Resignations & Exit", icon: UserMinus, badge: "Access Based" },
      { id: "hrm_all_exits", label: "All User Exits Access", icon: ShieldCheck, isSubToggle: true, dependsOn: "hrm_exits" },

      { id: "hrm_self_service", label: "Self-Service Portal", icon: UserCheck, badge: "Attribute Based" },
    ],
  },
  {
    id: "reports",
    title: "Reports & Analytics",
    icon: PieChart,
    items: [
      { id: "reports", label: "Reports Module", icon: Shield },
      { id: "reports_dashboard", label: "Dashboard Report", icon: LayoutDashboard },
      { id: "reports_inventory", label: "Inventory Report", icon: Archive },
      { id: "supplier_report", label: "Supplier Report", icon: Truck },
      { id: "product_report", label: "Product Report", icon: Package },
      { id: "product_percent", label: "Product Percent", icon: Percent },
      { id: "customer_report", label: "Customer Report", icon: Users },
      { id: "employee_report", label: "Employee Report", icon: Users },
      { id: "payment_report", label: "Payment Report", icon: CreditCard },
      { id: "parcel_report", label: "Parcel Report", icon: Box },
      { id: "courier_report", label: "Courier Report", icon: Truck },
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
          <Button variant="outline" className="mt-4">
            Back to Roles
          </Button>
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
                    const isParentActive = item.dependsOn ? !!selected[item.dependsOn] : true;

                    if (item.isSubToggle) {
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-2 pl-4 rounded-md transition-colors border-l-2 ml-4 my-0.5 ${
                            isParentActive
                              ? "bg-primary/5 border-primary/40"
                              : "opacity-40 bg-muted/20 border-muted"
                          }`}
                        >
                          <div className="flex flex-col min-w-0 overflow-hidden pr-2">
                            <div className="flex items-center gap-2">
                              <item.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span className="text-xs font-semibold truncate">{item.label}</span>
                              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-primary/40 text-primary">
                                All User Access
                              </Badge>
                            </div>
                            <span className="text-[10px] text-muted-foreground ml-5">
                              {selected[item.id]
                                ? "Full Access: Can see all employees' data"
                                : "Attribute-Based: Strictly sees own data"}
                            </span>
                          </div>
                          <Switch className="shrink-0 scale-90" checked={!!selected[item.id]} disabled={true} />
                        </div>
                      );
                    }

                    return (
                      <div key={item.id} className="flex items-center justify-between p-2 rounded-md">
                        <div className="flex items-center gap-2.5 min-w-0 overflow-hidden pr-2">
                          <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span
                            className={`text-sm font-medium truncate ${isOn ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            {item.label}
                          </span>
                          {item.badge && (
                            <Badge
                              variant="secondary"
                              className={`text-[9px] px-1.5 py-0 h-4.5 shrink-0 ${
                                item.badge === "Attribute Based"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {item.badge}
                            </Badge>
                          )}
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
