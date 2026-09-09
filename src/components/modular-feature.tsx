"use client";

import { useModularFeatures } from "@/hooks/useModularFeatures";

export function ModularFeature({ name, children }: { name: string; children: React.ReactNode }) {
  const { features } = useModularFeatures();
  return features?.[name] === true || String(features?.[name]) === "1" ? children : null;
}
