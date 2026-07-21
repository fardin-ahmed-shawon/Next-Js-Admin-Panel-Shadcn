import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Unique Life Admin Panel",
  version: packageJson.version,
  copyright: `© ${currentYear}, Unique Life Admin.`,
  meta: {
    title: "Unique Life Admin Panel",
    description:
      "Unique Life Admin Panel",
  },
};
