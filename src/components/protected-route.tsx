"use client";

import * as React from "react";
import { useAuth } from "@/hooks/useAuth";
import { PageAccess, hasModuleAccess } from "@/hooks/useRoles";

interface ProtectedRouteProps {
  module: keyof PageAccess;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ module, children, fallback }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or return a skeleton loader if preferred
  }

  // Admin bypass or proper access check
  const hasAccess = hasModuleAccess(user, module);

  if (!hasAccess) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center border rounded-lg bg-muted/20">
        <h2 className="text-2xl font-bold tracking-tight">Access Denied</h2>
        <p className="text-muted-foreground mt-2">You do not have permission to view the {module} module.</p>
      </div>
    );
  }

  return <>{children}</>;
}
