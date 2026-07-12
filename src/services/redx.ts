import { fetchClient } from "@/lib/fetch-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";

const cleanUrl = (path: string) => {
  const base = API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${base}${cleanPath}`;
};

export const redxService = {
  // 1. Credentials Configuration
  getSetup: async () => {
    const res = await fetchClient(cleanUrl("redx-setup"));
    if (!res.ok) throw new Error("Failed to get RedX configuration");
    return res.json();
  },

  saveSetup: async (payload: any) => {
    const res = await fetchClient(cleanUrl("redx-setup"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to save configuration");
    }
    return res.json();
  },

  // 2. Location Data
  getAreas: async (params?: { post_code?: number; district_name?: string }) => {
    let query = "";
    if (params?.post_code) {
      query = `?post_code=${params.post_code}`;
    } else if (params?.district_name) {
      query = `?district_name=${params.district_name}`;
    }
    const res = await fetchClient(cleanUrl(`redx-areas${query}`));
    if (!res.ok) throw new Error("Failed to fetch RedX areas");
    return res.json();
  },

  // 3. Parcels
  listParcels: async (page = 1, search = "", limit = 15) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      params.append("search", search);
    }
    const res = await fetchClient(cleanUrl(`redx-parcels?${params.toString()}`));
    if (!res.ok) throw new Error("Failed to fetch RedX parcels");
    return res.json();
  },

  createParcel: async (orderNo: string, payload?: any) => {
    const res = await fetchClient(cleanUrl(`redx-parcels/${orderNo}`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload || {}),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to create parcel");
    }
    return res.json();
  },

  checkStatus: async (orderNo: string) => {
    const res = await fetchClient(cleanUrl(`redx-parcels/${orderNo}/status`));
    if (!res.ok) throw new Error("Failed to check status");
    return res.json();
  },
};
