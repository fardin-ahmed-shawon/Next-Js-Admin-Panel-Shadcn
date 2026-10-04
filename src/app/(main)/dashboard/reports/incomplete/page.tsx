"use client";

import * as React from "react";
import { IncompleteReportView } from "./_components/incomplete-report-view";
import { useModularFeatures } from "@/hooks/useModularFeatures";

export default function IncompleteOrdersReportPage() {
  const { features } = useModularFeatures();

  if (features?.orders_incomplete === false || String(features?.orders_incomplete) === "0") {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <h2 className="text-2xl font-bold">Feature Disabled</h2>
        <p className="text-muted-foreground mt-2">The Incomplete Orders feature is currently disabled.</p>
      </div>
    );
  }

  return <IncompleteReportView />;
}
