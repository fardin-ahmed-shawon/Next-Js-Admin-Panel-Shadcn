"use client";

import { usePathname } from "next/navigation";
import { useModularFeatures } from "@/hooks/useModularFeatures";
import { useAuth } from "@/hooks/useAuth";
import { featurePathEnabled, requiredFeatures } from "@/lib/feature-routes";

export function FeatureGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { features, isLoading, isError, mutate } = useModularFeatures();
  if (pathname === "/dashboard/feature-control" && user?.role?.role_name !== "Admin") {
    return <p className="p-8">Feature Control is available to administrators only.</p>;
  }
  if (!requiredFeatures(pathname).length) return children;
  if (isLoading) return <p className="p-8 text-muted-foreground">Loading feature availability...</p>;
  if (isError)
    return (
      <div className="space-y-3 p-8">
        <p>Unable to check feature availability.</p>
        <button type="button" className="underline" onClick={() => mutate()}>
          Try again
        </button>
      </div>
    );
  if (!featurePathEnabled(pathname, features))
    return (
      <div className="space-y-2 rounded-lg border p-8">
        <h2 className="text-xl font-semibold">Feature disabled</h2>
        <p className="text-muted-foreground">An administrator can enable this module in Feature Control.</p>
      </div>
    );
  return children;
}
