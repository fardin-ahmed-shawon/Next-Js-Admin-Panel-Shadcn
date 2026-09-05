import { fetchClient } from "@/lib/fetch-client";

export type PageImage = { img: string };
export interface LandingPage {
  id: number;
  product_id: number;
  product?: { id: number; title: string };
  slug: string;
  status: "draft" | "published";
  home_title: string;
  home_description: string;
  home_img: string;
  feature_img: string;
  features_main_title: string;
  why_choose_main_title: string;
  why_choose_bottom_title: string;
  review_main_title: string;
  checkout_main_title: string;
  yt_link: string;
  features: { title: string; description: string }[];
  why_choose_products: { why_choose_text: string }[];
  gallery: PageImage[];
  reviews: PageImage[];
}

export async function landingRequest(path = "", options: RequestInit = {}) {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
  const response = await fetchClient(`${base}/landing-pages${path}`, options);
  const result = await response.json().catch(() => {
    if (response.status === 413) {
      throw new Error("The images exceed the server upload limit. Upload fewer or smaller images and try again.");
    }
    const saving = options.method && !["GET", "HEAD"].includes(options.method.toUpperCase());
    throw new Error(
      saving
        ? "The server returned an invalid response. Check All Landing Pages before retrying; your changes may already have been saved."
        : "The server returned an invalid response. Please try again or contact your administrator.",
    );
  });
  if (!response.ok) {
    const details = Object.values(result.errors || {})
      .flat()
      .join(" ");
    throw new Error(details || result.message || "Unable to save landing page.");
  }
  return result;
}

export function landingImage(path: string) {
  if (!path || /^(https?:|blob:)/.test(path)) return path;
  return `${(process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export function landingPublicUrl(slug: string) {
  const base = (process.env.NEXT_PUBLIC_STOREFRONT_URL || "").replace(/\/$/, "");
  return base ? `${base}/landing/${encodeURIComponent(slug)}` : "";
}
