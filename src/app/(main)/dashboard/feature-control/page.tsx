"use client";

import React from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { useModularFeatures } from "@/hooks/useModularFeatures";
import { fetchClient } from "@/lib/fetch-client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const featureGroups = [
  {
    title: "Accounts",
    keys: ["accounts_dashboard", "accounts_revenue", "accounts_expenses", "accounts_profit_n_loss", "accounts_statement", "accounts_due", "accounts_refund_history", "accounts_channel"]
  },
  {
    title: "Products & Inventory",
    keys: ["variant_management", "variant_wise_pricing", "variant_wise_image", "inventory_multiple_lot", "inventory_bulk_upload", "product_yt_reels", "product_pre_order", "product_seo_settings", "product_ai_recommendation", "brands"]
  },
  {
    title: "Orders & Invoices",
    keys: ["orders_manual_create", "orders_wholesale_create", "orders_incomplete", "orders_invoice_manage", "orders_invoice_manage_detailed", "orders_invoice_a4", "orders_invoice_pos", "orders_invoice_label"]
  },
  {
    title: "Employees & Roles",
    keys: ["employee_management", "employee_auto_order_distribution", "role_based_access_control", "role_based_access_max_users"]
  },
  {
    title: "Courier",
    keys: ["courier_basic", "courier_order_automation", "courier_accounts_automation", "courier_bulk_entry"]
  },
  {
    title: "Marketing & Content",
    keys: ["discounts", "discounts_gift_product", "regular_coupons", "product_wise_coupon", "testimonials", "blogs"]
  },
  {
    title: "Reports",
    keys: ["reports_product", "reports_product_percent", "reports_customer", "reports_employee", "reports_payment", "reports_parcel", "reports_courier", "reports_inventory"]
  },
  {
    title: "System & Security",
    keys: ["fraud_checker", "user_behaviour_logs", "blocklist", "sslcommerze", "meta_pixel_n_gtm", "other_ai_features"]
  }
];

const formatLabel = (key: string) => {
  return key.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
};

export default function FeatureControlPage() {
  const { features, isLoading, mutate } = useModularFeatures();
  const [localFeatures, setLocalFeatures] = React.useState<any>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (features) {
      setLocalFeatures(features);
    }
  }, [features]);

  const handleToggle = (key: string, value: boolean) => {
    setLocalFeatures((prev: any) => ({ ...prev, [key]: value ? 1 : 0 }));
  };

  const handleInputChange = (key: string, value: string) => {
    setLocalFeatures((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!localFeatures) return;
    setIsSaving(true);
    const toastId = toast.loading("Saving features...");

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
      const response = await fetchClient(`${baseUrl}modular-features`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(localFeatures),
      });

      if (!response.ok) {
        throw new Error("Failed to save features");
      }

      toast.success("Modular features updated successfully!", { id: toastId });
      mutate(localFeatures);
    } catch (error) {
      toast.error("An error occurred while saving.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !localFeatures) {
    return (
      <div className="flex flex-col gap-4 p-8 items-center justify-center min-h-[500px]">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading modular features...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Feature Control</h2>
          <p className="text-muted-foreground mt-1">
            Toggle application features dynamically. Changes apply instantly across the panel.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          {isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featureGroups.map((group) => (
          <Card key={group.title} className="flex flex-col">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg">{group.title}</CardTitle>
              <CardDescription>Manage {group.title.toLowerCase()} related modules</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex-1 space-y-4">
              {group.keys.map((key) => {
                const value = localFeatures[key];
                
                // Special case for role_based_access_max_users (numeric input)
                if (key === "role_based_access_max_users") {
                  return (
                    <div key={key} className="flex flex-col space-y-2">
                      <Label htmlFor={key} className="font-semibold text-sm">
                        Max Users (Role Based Access)
                      </Label>
                      <Input 
                        id={key}
                        type="number" 
                        value={value === null ? "" : value}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        placeholder="Leave empty for unlimited"
                      />
                    </div>
                  );
                }

                return (
                  <div key={key} className="flex items-center justify-between space-x-2">
                    <Label htmlFor={key} className="flex-1 cursor-pointer font-medium text-sm leading-snug">
                      {formatLabel(key)}
                    </Label>
                    <Switch
                      id={key}
                      checked={value === 1 || value === true || String(value) === "1"}
                      onCheckedChange={(checked) => handleToggle(key, checked)}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
