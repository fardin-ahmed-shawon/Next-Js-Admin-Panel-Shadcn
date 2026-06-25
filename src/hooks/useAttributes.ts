import useSWR from "swr";

import { fetchClient } from "@/lib/fetch-client";

export interface ColorAttribute {
  id?: number | string;
  label: string;
  hex_value?: string;
}

export interface SizeAttribute {
  id?: number | string;
  label: string;
}

const fetcher = async (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetchClient(url, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  const json = await res.json();
  return json.data || [];
};

export default function useAttributes() {
  const colorsUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${process.env.NEXT_PUBLIC_API_WEB_COLORS || "colors"}`;
  const sizesUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${process.env.NEXT_PUBLIC_API_WEB_SIZES || "sizes"}`;

  const {
    data: colors,
    error: colorsError,
    isLoading: colorsLoading,
    mutate: mutateColors,
  } = useSWR<ColorAttribute[]>(colorsUrl, fetcher);
  const {
    data: sizes,
    error: sizesError,
    isLoading: sizesLoading,
    mutate: mutateSizes,
  } = useSWR<SizeAttribute[]>(sizesUrl, fetcher);

  const createColor = async (payload: { label: string; hex_value?: string }) => {
    const res = await fetchClient(colorsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Failed to create color");
    }
    await mutateColors();
    return json;
  };

  const createSize = async (payload: { label: string }) => {
    const res = await fetchClient(sizesUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Failed to create size");
    }
    await mutateSizes();
    return json;
  };

  return {
    colors: colors || [],
    sizes: sizes || [],
    loading: colorsLoading || sizesLoading,
    error: colorsError || sizesError,
    mutateColors,
    mutateSizes,
    createColor,
    createSize,
  };
}
