"use client";

import * as React from "react";
import Link from "next/link";
import { 
  ArrowLeft, LayoutDashboard, Settings, 
  Box, Package, List, Tag, Archive, 
  FileText, Image as ImageIcon, Layout, MessageSquare, Star,
  ShoppingCart, CreditCard, Percent, Ticket, Truck,
  PieChart, Briefcase, BarChart, History,
  Shield, Users, MessageCircle, ShieldAlert,
  Save, Check, X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, alwaysOn: true },
      { id: "settings", label: "Settings", icon: Settings, alwaysOn: true },
    ]
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
    ]
  },
  {
    id: "content_marketing",
    title: "Content & Marketing",
    icon: FileText,
    items: [
      { id: "blogs", label: "Blogs", icon: FileText },
      { id: "slider", label: "Slider", icon: ImageIcon },
      { id: "banner", label: "Banner", icon: ImageIcon },
      { id: "landing_pages", label: "Landing Pages", icon: Layout },
      { id: "testimonials", label: "Testimonials", icon: MessageSquare },
      { id: "reviews", label: "Reviews", icon: Star },
    ]
  },
  {
    id: "sales_orders",
    title: "Sales & Orders",
    icon: ShoppingCart,
    items: [
      { id: "orders", label: "Orders", icon: ShoppingCart },
      { id: "payments", label: "Payments", icon: CreditCard },
      { id: "discounts", label: "Discounts", icon: Percent },
      { id: "coupons", label: "Coupons", icon: Ticket },
      { id: "courier", label: "Courier", icon: Truck },
      { id: "invoice", label: "Invoice", icon: FileText },
    ]
  },
  {
    id: "finance_reports",
    title: "Finance & Reports",
    icon: PieChart,
    items: [
      { id: "accounts", label: "Accounts", icon: Briefcase },
      { id: "sales_report", label: "Sales Report", icon: BarChart },
      { id: "purchase_history", label: "Purchase History", icon: History },
    ]
  },
  {
    id: "communication_security",
    title: "Communication & Security",
    icon: ShieldAlert,
    items: [
      { id: "customers", label: "Customers", icon: Users },
      { id: "customer_messages", label: "Customer Messages", icon: MessageCircle },
      { id: "fraud_checker", label: "Fraud Checker", icon: ShieldAlert },
    ]
  }
];

export default function AddRolePage() {
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});

  let totalSelectable = 0;
  let totalSelected = 0;
  
  PERMISSION_GROUPS.forEach(group => {
    group.items.forEach(item => {
      if (!item.alwaysOn) {
        totalSelectable++;
        if (selected[item.id]) totalSelected++;
      }
    });
  });

  const handleToggle = (id: string, alwaysOn?: boolean) => {
    if (alwaysOn) return;
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleGroup = (group: PermissionGroupType) => {
    const allSelectableOn = group.items.filter(i => !i.alwaysOn).every(i => selected[i.id]);
    const nextSelected = { ...selected };
    
    group.items.forEach(item => {
      if (!item.alwaysOn) {
        nextSelected[item.id] = !allSelectableOn;
      }
    });
    
    setSelected(nextSelected);
  };

  const selectAll = () => {
    const nextSelected = { ...selected };
    PERMISSION_GROUPS.forEach(group => {
      group.items.forEach(item => {
        if (!item.alwaysOn) nextSelected[item.id] = true;
      });
    });
    setSelected(nextSelected);
  };

  const deselectAll = () => {
    setSelected({});
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Standard Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Add Role</h1>
          <p className="text-muted-foreground text-sm">
            Create a new system role and assign specific module permissions.
          </p>
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
            <CardDescription>Enter a name for the new role you are creating.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-xl space-y-2">
              <label htmlFor="roleName" className="text-sm font-medium text-foreground">
                Role Name
              </label>
              <Input 
                id="roleName" 
                className="mt-3 mb-1"
                placeholder="e.g. Manager, Editor, Operator..." 
              />
            </div>
          </CardContent>
        </Card>

        {/* Permissions Block */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl tracking-tight font-semibold">Permissions</h2>
              <p className="text-muted-foreground text-sm">Configure access control for this role.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
              <span className="text-sm font-medium text-muted-foreground">
                <span className="text-foreground font-bold">{totalSelected}</span> / {totalSelectable} selected
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={selectAll}>
                  <Check className="h-4 w-4" />
                  Select All
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={deselectAll}>
                  <X className="h-4 w-4" />
                  Deselect All
                </Button>
              </div>
            </div>
          </div>

          {/* Grid Layout matches the prototype but stripped of loud colors */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {PERMISSION_GROUPS.map((group) => (
              <Card key={group.id} className="flex flex-col overflow-hidden shadow-none gap-0 py-0">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3 border-b bg-muted/20 p-3 overflow-hidden">
                  <div className="flex items-center gap-2 min-w-0">
                    <group.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <CardTitle className="text-sm font-semibold truncate">{group.title}</CardTitle>
                  </div>
                  <button 
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    onClick={() => handleToggleGroup(group)}
                  >
                    Toggle All
                  </button>
                </CardHeader>
                
                <CardContent className="flex flex-col p-2 space-y-1 flex-1">
                  {group.items.map((item) => {
                    const isOn = item.alwaysOn || !!selected[item.id];
                    return (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 overflow-hidden pr-2">
                          <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm font-medium truncate">
                            {item.label}
                          </span>
                          {item.alwaysOn && (
                            <Badge variant="secondary" className="text-[10px] uppercase font-bold py-0 h-5 shrink-0">
                              Always On
                            </Badge>
                          )}
                        </div>
                        <Switch 
                          className="shrink-0"
                          checked={isOn}
                          onCheckedChange={() => handleToggle(item.id, item.alwaysOn)}
                          disabled={item.alwaysOn}
                        />
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
          <Button className="px-8 gap-2">
            <Save className="h-4 w-4" />
            Save Role & Permissions
          </Button>
          <Button variant="outline" className="px-8">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
