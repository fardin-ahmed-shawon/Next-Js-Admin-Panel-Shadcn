"use client";

import { fetchClient } from "@/lib/fetch-client";
import useSWR from "swr";

export interface ModularFeaturesData {
  role_based_access_max_users: number | null;
  [key: string]: boolean | number | null;
}
export interface FeatureDefinition {
  label: string;
  group: string;
  dependencies: string[];
  paths: string[];
}
export interface ModularFeaturesApiResponse {
  success: boolean;
  data: ModularFeaturesData;
  effective: ModularFeaturesData;
  catalog: Record<string, FeatureDefinition>;
}
const fetcher = async (url: string): Promise<ModularFeaturesApiResponse> => {
  const response = await fetchClient(url, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load feature controls.");
  return response.json();
};

export function useModularFeatures() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const { data, error, isLoading, mutate } = useSWR<ModularFeaturesApiResponse>(baseUrl + "modular-features", fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 15000,
  });
  return {
    features: data?.effective ?? data?.data,
    configuredFeatures: data?.data,
    catalog: data?.catalog,
    isLoading,
    isError: error,
    mutate,
  };
}
