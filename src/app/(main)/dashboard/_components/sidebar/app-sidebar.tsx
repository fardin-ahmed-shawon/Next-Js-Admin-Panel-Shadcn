"use client";

import Link from "next/link";

import { CircleHelp, ClipboardList, Database, File, Monitor, Search, Settings } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { APP_CONFIG } from "@/config/app-config";
import { rootUser } from "@/data/users";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";
import { useAuth } from "@/hooks/useAuth";
import { hasModuleAccess } from "@/hooks/useRoles";
import { useModularFeatures } from "@/hooks/useModularFeatures";

import { featurePathEnabled } from "@/lib/feature-routes";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { SidebarSupportCard } from "./sidebar-support-card";

const _data = {
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: CircleHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: Database,
    },
    {
      name: "Reports",
      url: "#",
      icon: ClipboardList,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: File,
    },
  ],
};

export function AppSidebar({ brandName, ...props }: React.ComponentProps<typeof Sidebar> & { brandName?: string }) {
  const { user } = useAuth();
  const { features } = useModularFeatures();
  const { sidebarVariant, sidebarCollapsible, isSynced } = usePreferencesStore(
    useShallow((s) => ({
      sidebarVariant: s.sidebarVariant,
      sidebarCollapsible: s.sidebarCollapsible,
      isSynced: s.isSynced,
    })),
  );

  const variant = isSynced ? sidebarVariant : props.variant;
  const collapsible = isSynced ? sidebarCollapsible : props.collapsible;

  const filteredItems = sidebarItems.map((group) => {
    const filteredGroupItems = group.items
      .filter(
        (item) =>
          (item.url !== "/dashboard/feature-control" || user?.role?.role_name === "Admin") &&
          (item.subItems?.length || featurePathEnabled(item.url, features)),
      )
      .map((item) => {
        // Filter subItems first if they exist
        let filteredSubItems = item.subItems;
        if (filteredSubItems) {
          filteredSubItems = filteredSubItems.filter((subItem) => {
            if (!featurePathEnabled(subItem.url, features)) return false;
            if (
              subItem.url === "/dashboard/products/attributes" &&
              features &&
              (features.variant_management === false || String(features.variant_management) === "0")
            ) {
              return false;
            }
            if (
              subItem.url === "/dashboard/orders/wholesale-create" &&
              features &&
              (features.orders_wholesale_create === false || String(features.orders_wholesale_create) === "0")
            ) {
              return false;
            }
            if (
              subItem.url === "/dashboard/orders/create" &&
              features &&
              (features.orders_manual_create === false || String(features.orders_manual_create) === "0")
            ) {
              return false;
            }
            if (
              subItem.url === "/dashboard/orders/incomplete" &&
              features &&
              (features.orders_incomplete === false || String(features.orders_incomplete) === "0")
            ) {
              return false;
            }
            if (
              subItem.url === "/dashboard/auto-order" &&
              features &&
              (features.employee_management === false ||
                String(features.employee_management) === "0" ||
                features.employee_auto_order_distribution === false ||
                String(features.employee_auto_order_distribution) === "0")
            ) {
              return false;
            }
            if (
              subItem.url === "/dashboard/orders/assign-orders" &&
              features &&
              (features.employee_management === false || String(features.employee_management) === "0")
            ) {
              return false;
            }
            if (
              subItem.url === "/dashboard/reports/product" &&
              features &&
              (features.reports_product === false || String(features.reports_product) === "0")
            )
              return false;
            if (
              subItem.url === "/dashboard/reports/product-percent" &&
              features &&
              (features.reports_product_percent === false || String(features.reports_product_percent) === "0")
            )
              return false;
            if (
              subItem.url === "/dashboard/reports/customer" &&
              features &&
              (features.reports_customer === false || String(features.reports_customer) === "0")
            )
              return false;
            if (
              subItem.url === "/dashboard/reports/employee" &&
              features &&
              (features.reports_employee === false || String(features.reports_employee) === "0")
            )
              return false;
            if (
              subItem.url === "/dashboard/reports/payment" &&
              features &&
              (features.reports_payment === false || String(features.reports_payment) === "0")
            )
              return false;
            if (
              subItem.url === "/dashboard/reports/parcel" &&
              features &&
              (features.reports_parcel === false || String(features.reports_parcel) === "0")
            )
              return false;
            if (
              subItem.url === "/dashboard/reports/courier" &&
              features &&
              (features.reports_courier === false || String(features.reports_courier) === "0")
            )
              return false;
            if (
              subItem.url === "/dashboard/reports/inventory" &&
              features &&
              (features.reports_inventory === false || String(features.reports_inventory) === "0")
            )
              return false;

            const requiredModule = subItem.module || item.module;
            if (!requiredModule) return true;
            return hasModuleAccess(user, requiredModule);
          });
        }

        if (
          item.subItems?.length &&
          !filteredSubItems?.length &&
          (item.url === "#" || !featurePathEnabled(item.url, features))
        )
          return null;

        // Check if the parent menu item is allowed
        let isParentAllowed = false;
        if (!item.module) {
          isParentAllowed = true;
        } else if (hasModuleAccess(user, item.module)) {
          isParentAllowed = true;
        } else if (filteredSubItems && filteredSubItems.length > 0) {
          isParentAllowed = true;
        }

        if (isParentAllowed) {
          if (
            item.module === "fraud_checker" &&
            features &&
            (features.fraud_checker === false || String(features.fraud_checker) === "0")
          ) {
            return null;
          }
          return { ...item, subItems: filteredSubItems };
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return { ...group, items: filteredGroupItems };
  });

  return (
    <Sidebar {...props} variant={variant} collapsible={collapsible}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link prefetch={false} href="/dashboard/">
                <Monitor className="size-5" />
                <span className="font-semibold text-base">{brandName || APP_CONFIG.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredItems} />
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <SidebarSupportCard />
        <NavUser
          user={{
            name: user?.full_name || "Guest",
            email: user?.email || "",
            avatar: "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
