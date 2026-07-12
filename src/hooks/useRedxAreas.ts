import useSWR from "swr";
import { fetchClient } from "@/lib/fetch-client";

const fetcher = async (url: string) => {
  const res = await fetchClient(url, {
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const error = new Error("An error occurred while fetching RedX areas.");
    // @ts-ignore
    error.info = await res.json().catch(() => ({}));
    // @ts-ignore
    error.status = res.status;
    throw error;
  }

  return res.json();
};

export function useRedxAreas(postCode?: number, districtName?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  
  let query = "";
  if (postCode) {
    query = `?post_code=${postCode}`;
  } else if (districtName) {
    query = `?district_name=${districtName}`;
  }

  const url = `${baseUrl}redx-areas${query}`;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    areas: data?.areas || [],
    isLoading,
    isError: error,
    mutate,
  };
}
