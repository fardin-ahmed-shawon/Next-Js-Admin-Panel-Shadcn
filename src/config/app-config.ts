import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "",
  version: packageJson.version,
  copyright: `© ${currentYear}`,
  meta: {
    title: "",
    description: "",
  },
};

export async function getAppConfig() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}web-settings`, {
      cache: "no-store",
    });
    if (!res.ok) return APP_CONFIG;
    
    const json = await res.json();
    if (json?.data?.brand_name) {
      const brandName = json.data.brand_name;
      return {
        ...APP_CONFIG,
        name: brandName,
        copyright: `© ${currentYear}, ${brandName}.`,
        meta: {
          title: brandName,
          description: brandName,
        }
      };
    }
  } catch (error) {
    // Silently fallback to default config
  }
  return APP_CONFIG;
}
