import { fetchClient } from "@/lib/fetch-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";

const cleanUrl = (path: string) => {
  const base = API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${base}${cleanPath}`;
};

export const pathaoService = {
  // 1. Credentials Configuration
  getSetup: async () => {
    const res = await fetchClient(cleanUrl("pathao-setup"));
    if (!res.ok) throw new Error("Failed to get Pathao configuration");
    return res.json();
  },

  saveSetup: async (payload: any) => {
    const res = await fetchClient(cleanUrl("pathao-setup"), {
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

  // 2. Location & Store Data
  getCities: async () => {
    const res = await fetchClient(cleanUrl("pathao-cities"));
    if (!res.ok) throw new Error("Failed to fetch Pathao cities");
    return res.json();
  },

  getZones: async (cityId: number) => {
    const res = await fetchClient(cleanUrl(`pathao-zones/${cityId}`));
    if (!res.ok) throw new Error(`Failed to fetch Pathao zones for city ${cityId}`);
    return res.json();
  },

  getAreas: async (zoneId: number) => {
    const res = await fetchClient(cleanUrl(`pathao-areas/${zoneId}`));
    if (!res.ok) throw new Error(`Failed to fetch Pathao areas for zone ${zoneId}`);
    return res.json();
  },

  getStores: async () => {
    const res = await fetchClient(cleanUrl("pathao-stores"));
    if (!res.ok) throw new Error("Failed to fetch Pathao stores");
    return res.json();
  },

  // 3. Consignments / Parcels
  listParcels: async (page = 1, search = "", limit = 15) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      params.append("search", search);
    }
    const res = await fetchClient(cleanUrl(`pathao-parcels?${params.toString()}`));
    if (!res.ok) throw new Error("Failed to fetch Pathao parcels");
    return res.json();
  },

  createParcel: async (orderNo: string, payload?: any) => {
    const res = await fetchClient(cleanUrl(`pathao-parcels/${orderNo}`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload || {}),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to create consignment");
    }
    return res.json();
  },

  checkStatus: async (orderNo: string) => {
    const res = await fetchClient(cleanUrl(`pathao-parcels/${orderNo}/status`));
    if (!res.ok) throw new Error("Failed to check status");
    return res.json();
  },

  markReturned: async (orderNo: string) => {
    const res = await fetchClient(cleanUrl(`pathao-parcels/${orderNo}/mark-returned`), {
      method: "POST",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to mark as returned");
    }
    return res.json();
  },
};
