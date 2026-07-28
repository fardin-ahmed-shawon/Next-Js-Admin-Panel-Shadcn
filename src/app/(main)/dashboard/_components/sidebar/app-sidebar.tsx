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

export function AppSidebar({
  brandName,
  ...props
}: React.ComponentProps<typeof Sidebar> & { brandName?: string }) {
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
      .map((item) => {
        // Filter subItems first if they exist
        let filteredSubItems = item.subItems;
        if (item.subItems) {
          filteredSubItems = item.subItems.filter((subItem) => {
            const requiredModule = subItem.module || item.module;
            if (!requiredModule) return true;
            return hasModuleAccess(user, requiredModule);
          });
        }

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
          if (item.module === "fraud_checker" && features && (features.fraud_checker === false || String(features.fraud_checker) === "0")) {
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
