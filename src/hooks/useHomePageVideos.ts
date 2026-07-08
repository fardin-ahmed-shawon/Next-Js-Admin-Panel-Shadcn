import useSWR from "swr";

import { fetchClient } from "@/lib/fetch-client";

export interface HomePageVideo {
  id: number;
  vdo_url: string;
  product_id?: number;
  product?: {
    id: number;
    title: string;
    selling_price: number;
    product_thumbnail_img: string | null;
  };
  created_at: string;
  updated_at: string;
}

const fetcher = async (url: string) => {
  const res = await fetchClient(url);
  if (!res.ok) {
    throw new Error("Failed to fetch home page videos");
  }
  const json = await res.json();
  return (json.data || []) as HomePageVideo[];
};

export function useHomePageVideos() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
  const url = `${baseUrl}home-page-videos`;

  const {
    data: videos,
    error,
    isLoading,
    mutate,
  } = useSWR<HomePageVideo[]>(url, fetcher, {
    revalidateOnFocus: false,
  });

  const addVideo = async (vdoUrl: string, productId: number) => {
    const res = await fetchClient(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ vdo_url: vdoUrl, product_id: productId }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Failed to add video");
    }

    await mutate();
    return json;
  };

  const deleteVideo = async (id: number) => {
    const res = await fetchClient(`${url}/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Failed to delete video");
    }

    await mutate();
    return json;
  };

  return {
    videos: videos || [],
    error,
    isLoading,
    addVideo,
    deleteVideo,
    mutate,
  };
}
