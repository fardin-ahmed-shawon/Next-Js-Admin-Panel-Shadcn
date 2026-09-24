import type { ReactNode } from "react";
import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getAppConfig } from "@/config/app-config";
import { fontVars } from "@/lib/fonts/registry";
import { parseGtmBody, parseGtmHead } from "@/lib/gtm";
import { PREFERENCE_DEFAULTS } from "@/lib/preferences/preferences-config";
import { ThemeBootScript } from "@/scripts/theme-boot";
import { PreferencesStoreProvider } from "@/stores/preferences/preferences-provider";
import { PrintInvoiceGlobalModal } from "@/components/modals/print-invoice-global-modal";

import "./globals.css";

async function fetchWebSettings() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) return null;
  try {
    const response = await fetch(`${baseUrl}web-settings`, { cache: "no-store", signal: AbortSignal.timeout(4000) });
    if (!response.ok) return null;
    const result = await response.json();
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const config = await getAppConfig();
  return { title: config.meta.title, description: config.meta.description, icons: { icon: "/fav.png" } };
}

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const { theme_mode, theme_preset, content_layout, navbar_style, sidebar_variant, sidebar_collapsible, font } = PREFERENCE_DEFAULTS;
  const settings = await fetchWebSettings();
  const gtmHeadScripts = parseGtmHead(settings?.gtm_head);
  const gtmBodyNoscripts = parseGtmBody(settings?.gtm_body);

  return (
    <html lang="en" className={fontVars} data-theme-mode={theme_mode} data-theme-preset={theme_preset} data-content-layout={content_layout} data-navbar-style={navbar_style} data-sidebar-variant={sidebar_variant} data-sidebar-collapsible={sidebar_collapsible} data-font={font} suppressHydrationWarning>
      <head>
        <ThemeBootScript />
        {gtmHeadScripts.map((script, index) => script.src ? (
          <script key={`gtm-head-${index}`} src={script.src} async={script.isAsync} defer={script.isDefer} />
        ) : (
          <script key={`gtm-head-${index}`} dangerouslySetInnerHTML={{ __html: script.content }} />
        ))}
      </head>
      <body className="min-h-screen antialiased">
        {gtmBodyNoscripts.map((content, index) => <noscript key={`gtm-body-${index}`} dangerouslySetInnerHTML={{ __html: content }} />)}
        <TooltipProvider>
          <PreferencesStoreProvider themeMode={theme_mode} themePreset={theme_preset} contentLayout={content_layout} navbarStyle={navbar_style} font={font}>
            {children}<Toaster /><PrintInvoiceGlobalModal />
          </PreferencesStoreProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}