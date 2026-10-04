"use client";

import * as React from "react";

import Link from "next/link";

import {
  AlertCircle,
  AlertTriangle,
  Archive,
  BarChart,
  BarChart3,
  Briefcase,
  CheckSquare,
  ChevronDown,
  Clock,
  CreditCard,
  DollarSign,
  Edit,
  FileText,
  FolderGit2,
  History,
  Image as ImageIcon,
  Key,
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
  Trash,
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
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { PageAccess, useRoles } from "@/hooks/useRoles";

const ALL_PERMISSIONS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "procurement", label: "Purchase & Procurement", icon: ShoppingBag },
  { id: "suppliers", label: "Suppliers", icon: Truck },
  { id: "product_bundles", label: "Product Bundles", icon: Layers },
  { id: "product_attributes", label: "Variant Attributes", icon: Tag },
  { id: "product_recommendations", label: "AI Recommendations", icon: Sparkles },
  { id: "homepage_videos", label: "Home Page Videos", icon: Video },
  { id: "categories", label: "Categories", icon: List },
  { id: "brands", label: "Brands", icon: Tag },
  { id: "inventory", label: "Inventory", icon: Archive },
  { id: "blogs", label: "Blogs", icon: FileText },
  { id: "slider", label: "Slider", icon: ImageIcon },
  { id: "banner", label: "Banner", icon: ImageIcon },
  { id: "landing_pages", label: "Landing Pages", icon: Layout },
  { id: "testimonials", label: "Testimonials", icon: MessageSquare },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "all_orders", label: "Show All Orders", icon: ShoppingCart },
  { id: "wholesale_orders", label: "Wholesale Orders", icon: Store },
  { id: "order_returns", label: "Returns", icon: RotateCcw },
  { id: "invoices", label: "Invoices", icon: Receipt },
  { id: "incomplete_orders", label: "Incomplete Orders", icon: AlertCircle },
  { id: "ai_calling_logs", label: "AI Calling Logs", icon: PhoneCall },
  { id: "discounts", label: "Discounts", icon: Percent },
  { id: "coupons", label: "Coupons", icon: Ticket },
  { id: "courier", label: "Courier", icon: Truck },
  { id: "accounts", label: "Accounts", icon: Briefcase },
  { id: "capital", label: "Capital Cash Flow", icon: DollarSign },
  { id: "history", label: "Purchase History", icon: History },
  { id: "customers", label: "Customers", icon: Users },
  { id: "customer_followups", label: "Follow-Ups", icon: PhoneCall },
  { id: "customer_segmentation", label: "Segmentation", icon: PieChart },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "fraud_checker", label: "Fraud Checker", icon: ShieldAlert },
  { id: "blocklist", label: "Blocklist", icon: UserX },
  { id: "roles_and_permission", label: "Roles & Permission", icon: Shield },
  { id: "auto_order", label: "Auto Order", icon: RefreshCw },
  { id: "users", label: "Users", icon: Users },
  { id: "user_behaviour_logs", label: "User Behaviour Logs", icon: History },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "flash_sales", label: "Flash Sales", icon: Zap },
  { id: "reports_inventory", label: "Inventory Report", icon: Archive },
  { id: "supplier_report", label: "Supplier Report", icon: Truck },
  { id: "hrm_overview", label: "HRM Overview", icon: LayoutDashboard },
  { id: "hrm_leaderboard", label: "HRM Leaderboard", icon: Trophy },
  { id: "hrm_department_performance", label: "HRM Dept Performance", icon: BarChart3 },
  { id: "hrm_org_tree", label: "Organization Tree", icon: Network },
  { id: "hrm_employees", label: "Employees Directory", icon: Users },
  { id: "hrm_salaries", label: "Salary & Payroll", icon: DollarSign },
  { id: "hrm_upsells", label: "Upsell Tracking", icon: TrendingUp },
  { id: "hrm_all_upsells", label: "All User Upsell Access", icon: ShieldCheck },
  { id: "hrm_tasks", label: "Peer Tasks", icon: CheckSquare },
  { id: "hrm_all_tasks", label: "All User Tasks Access", icon: ShieldCheck },
  { id: "hrm_attendance", label: "Attendance", icon: Clock },
  { id: "hrm_all_attendance", label: "All User Attendance Access", icon: ShieldCheck },
  { id: "hrm_manage_attendance", label: "Manage Attendance (Manual Entry & Import)", icon: ShieldAlert },
  { id: "hrm_cash_flow", label: "Employee Cash Flow", icon: Receipt },
  { id: "hrm_all_cash_flow", label: "All User Cash Flow Access", icon: ShieldCheck },
  { id: "hrm_loans", label: "Loans & Advance", icon: Landmark },
  { id: "hrm_all_loans", label: "All User Loans Access", icon: ShieldCheck },
  { id: "hrm_documents", label: "Documents", icon: FolderGit2 },
  { id: "hrm_all_documents", label: "All User Documents Access", icon: ShieldCheck },
  { id: "hrm_exits", label: "Resignations & Exit", icon: UserMinus },
  { id: "hrm_all_exits", label: "All User Exits Access", icon: ShieldCheck },
  { id: "hrm_self_service", label: "Self-Service Portal", icon: UserCheck },
  { id: "hrm_self_attendance", label: "Self Check-In / Check-Out (Punch In/Out)", icon: Clock },
  { id: "employee_fines", label: "Employee Fines", icon: AlertTriangle },
] as const;

const TOTAL_PERMISSIONS = ALL_PERMISSIONS.length;

export function RolesGrid() {
  const { roles, loading, error, setRoles } = useRoles();

  const handleDelete = async (id: number) => {
    try {
      const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${process.env.NEXT_PUBLIC_API_ROLES || ""}/${id}`;
      const response = await fetch(API_URL, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete role.");
      }

      setRoles((prev) => prev.filter((r) => r.id !== id));
      toast.success("Role deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete role.");
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-96 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-destructive/20 bg-destructive/10 text-destructive rounded-lg">
        <p className="font-medium">Error loading roles</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!roles || roles.length === 0) {
    return (
      <div className="p-8 text-center border rounded-lg bg-card text-muted-foreground">
        <p>No roles found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {roles.map((role) => {
        // Compute granted permissions from page_access object (1 = granted, 0 = denied)
        const grantedPermissionsIds = ALL_PERMISSIONS.filter(
          (p) => role.page_access && role.page_access[p.id as keyof PageAccess] === 1,
        ).map((p) => p.id);

        const grantedCount = grantedPermissionsIds.length;
        const deniedCount = TOTAL_PERMISSIONS - grantedCount;
        const firstLetter = role.role_name ? role.role_name.charAt(0).toUpperCase() : "?";

        // Hardcoding users count for visual purposes as API doesn't provide it in the example,
        // or one could compute it if the API returned it.
        const usersCount = role.role_name === "Admin" ? 1 : 0;

        return (
          <Card key={role.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-foreground text-background text-xl font-bold">
                  {firstLetter}
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold leading-none">{role.role_name}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {usersCount} users
                    </span>
                    <span className="flex items-center gap-1">
                      <Key className="h-3 w-3" />
                      {grantedCount}/{TOTAL_PERMISSIONS} permissions
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/dashboard/roles/${role.id}/edit`}>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 px-2.5">
                    <Edit className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:inline-block">Edit</span>
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 px-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={role.role_name === "Admin"}
                    >
                      <Trash className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:inline-block">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Role</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete the <strong>{role.role_name}</strong> role? This action cannot
                        be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => handleDelete(role.id)}
                      >
                        Yes, delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="pt-4 flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-2 font-medium">
                  <Check className="mr-1 h-3 w-3" /> {grantedCount} Granted
                </Badge>
                <Badge variant="outline" className="px-2 text-muted-foreground font-medium">
                  <X className="mr-1 h-3 w-3" /> {deniedCount} Denied
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                {ALL_PERMISSIONS.map((perm) => {
                  const isGranted = grantedPermissionsIds.includes(perm.id);
                  const Icon = perm.icon;

                  return (
                    <Badge
                      key={perm.id}
                      variant={isGranted ? "secondary" : "outline"}
                      className={`gap-1 px-2 py-1 flex items-center ${!isGranted ? "text-muted-foreground/60 border-muted-foreground/20" : ""}`}
                    >
                      <Icon className="h-3 w-3" />
                      {perm.label}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>

            <Separator />

            <CardFooter className="p-0">
              <Link href={`/dashboard/roles/${role.id}`} className="w-full">
                <Button
                  variant="ghost"
                  className="w-full rounded-t-none rounded-b-xl text-muted-foreground hover:text-foreground"
                >
                  Show Details <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

// Temporary internal icons for the granted/denied badges
function Check(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function X(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
