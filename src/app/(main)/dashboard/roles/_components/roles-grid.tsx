"use client";

import * as React from "react";
import Link from "next/link";
import { Edit, Trash, Users, Key, ChevronDown, LayoutDashboard, Settings, Package, List, Tag, Archive, FileText, Image as ImageIcon, Layout, MessageSquare, Star, ShoppingCart, CreditCard, Percent, Ticket, Truck, PieChart, Briefcase, BarChart, History, ShieldAlert, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";

// Re-using the same icons mapping for the badges to make it realistic
const ALL_PERMISSIONS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "products", label: "Products", icon: Package },
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
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "discounts", label: "Discounts", icon: Percent },
  { id: "coupons", label: "Coupons", icon: Ticket },
  { id: "courier", label: "Courier", icon: Truck },
  { id: "invoice", label: "Invoice", icon: FileText },
  { id: "accounts", label: "Accounts", icon: Briefcase },
  { id: "sales_report", label: "Sales Report", icon: BarChart },
  { id: "purchase_history", label: "Purchase History", icon: History },
  { id: "customers", label: "Customers", icon: Users },
  { id: "customer_messages", label: "Customer Messages", icon: MessageCircle },
  { id: "fraud_checker", label: "Fraud Checker", icon: ShieldAlert },
];

const TOTAL_PERMISSIONS = ALL_PERMISSIONS.length;

type RoleData = {
  id: string;
  name: string;
  users: number;
  grantedPermissions: string[]; // array of IDs
};

const initialRoles: RoleData[] = [
  {
    id: "1",
    name: "Admin",
    users: 1,
    grantedPermissions: ALL_PERMISSIONS.map(p => p.id), // 24 granted
  },
  {
    id: "2",
    name: "Accountant",
    users: 1,
    grantedPermissions: ["dashboard", "settings", "accounts", "sales_report", "purchase_history", "payments"], // 6 granted
  },
  {
    id: "3",
    name: "Product Manager",
    users: 1,
    grantedPermissions: ["dashboard", "settings", "products", "categories", "brands", "inventory"], // 6 granted
  },
  {
    id: "4",
    name: "Operator",
    users: 0,
    grantedPermissions: [], // 0 granted
  }
];

export function RolesGrid() {
  const [roles, setRoles] = React.useState<RoleData[]>(initialRoles);

  const handleDelete = (id: string) => {
    setRoles(prev => prev.filter(r => r.id !== id));
    toast.success("Role deleted successfully.");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {roles.map((role) => {
        const grantedCount = role.grantedPermissions.length;
        const deniedCount = TOTAL_PERMISSIONS - grantedCount;
        const firstLetter = role.name.charAt(0).toUpperCase();

        return (
          <Card key={role.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-foreground text-background text-xl font-bold">
                  {firstLetter}
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold leading-none">{role.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {role.users} users
                    </span>
                    <span className="flex items-center gap-1">
                      <Key className="h-3 w-3" />
                      {grantedCount}/{TOTAL_PERMISSIONS} permissions
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/roles/${role.id}`}>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 px-2.5">
                    <Edit className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:inline-block">Edit</span>
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 px-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive" disabled={role.name === "Admin"}>
                      <Trash className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:inline-block">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Role</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete the <strong>{role.name}</strong> role? This action cannot be undone.
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
                {ALL_PERMISSIONS.map(perm => {
                  const isGranted = role.grantedPermissions.includes(perm.id);
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
              <Button variant="ghost" className="w-full rounded-t-none rounded-b-xl text-muted-foreground hover:text-foreground">
                Show Details <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
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
