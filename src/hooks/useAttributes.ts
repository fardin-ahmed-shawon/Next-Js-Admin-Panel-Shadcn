import { fetchClient } from "@/lib/fetch-client";
import useSWR from "swr";

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

  const { data: colors, error: colorsError, isLoading: colorsLoading } = useSWR(colorsUrl, fetcher);
  const { data: sizes, error: sizesError, isLoading: sizesLoading } = useSWR(sizesUrl, fetcher);

  return {
    colors: colors || [],
    sizes: sizes || [],
    loading: colorsLoading || sizesLoading,
    error: colorsError || sizesError,
  };
}
