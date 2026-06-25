"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";
import { PageAccess } from "@/hooks/useRoles";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RoleGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (isLoading) {
    return null; // Or return a loading spinner
  }

  // Find the required module based on the current pathname
  let requiredModule: string | undefined;

  for (const group of sidebarItems) {
    for (const item of group.items) {
      // 1. Check exact match on parent first
      if (item.url === pathname) {
        requiredModule = item.module;
        break;
      }

      // 2. Check exact match on sub-items
      let foundExactSub = false;
      if (item.subItems) {
        for (const subItem of item.subItems) {
          if (subItem.url === pathname) {
            requiredModule = subItem.module || item.module;
            foundExactSub = true;
            break;
          }
        }
      }
      if (foundExactSub) break;

      // 3. Check prefix match on sub-items (excluding dashboard sub-items equal to parent URL)
      let foundPrefixSub = false;
      if (item.subItems) {
        for (const subItem of item.subItems) {
          const isNotParentUrl = subItem.url !== item.url;
          if (isNotParentUrl && pathname.startsWith(subItem.url)) {
            requiredModule = subItem.module || item.module;
            foundPrefixSub = true;
            break;
          }
        }
      }
      if (foundPrefixSub) break;

      // 4. Finally, check prefix match on parent
      if (item.url !== "/dashboard/home" && pathname.startsWith(item.url)) {
        requiredModule = item.module;
        break;
      }
    }
    if (requiredModule) break;
  }

  // If no module is required (e.g. login/logout or home), allow access
  if (!requiredModule) {
    return <>{children}</>;
  }

  // Admin bypass
  if (user?.role?.role_name === "Admin") {
    return <>{children}</>;
  }

  // Check specific page access
  const hasAccess = user?.role?.page_access && user.role.page_access[requiredModule as keyof PageAccess] === 1;

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] p-8">
        <div className="relative group max-w-md w-full">
          {/* Animated glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>

          <div className="relative flex flex-col items-center text-center p-10 bg-background/80 backdrop-blur-xl border border-red-500/20 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-center w-20 h-20 bg-red-500/10 rounded-full mb-6 ring-4 ring-red-500/20">
              <ShieldAlert className="w-10 h-10 text-red-500" />
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight mb-2 text-foreground">Access Denied</h2>

            <p className="text-muted-foreground mt-2 leading-relaxed mb-8">
              You do not have permission to view the{" "}
              <span className="font-semibold px-2 py-0.5 rounded-md bg-secondary text-foreground capitalize">
                {requiredModule.replace("_", " ")}
              </span>{" "}
              module. Please contact an administrator if you believe this is a mistake.
            </p>

            <Button
              onClick={() => router.push("/dashboard/home")}
              className="gap-2 w-full sm:w-auto px-8"
              variant="default"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
