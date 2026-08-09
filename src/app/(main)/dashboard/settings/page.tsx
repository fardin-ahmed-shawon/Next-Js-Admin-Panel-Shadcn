"use client";

import * as React from "react";
import { useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Copy } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { ChangeLogoTab } from "./_components/change-logo-tab";
import { ChangePasswordTab } from "./_components/change-password-tab";
import { GenericContentTab } from "./_components/generic-content-tab";
import { WebsiteInfoTab } from "./_components/website-info-tab";

const TABS = [
  { id: "website-info", label: "Website Information" },
  { id: "change-logo", label: "Change Website Logo" },
  { id: "change-password", label: "Change Password" },
  { id: "about-us", label: "About Us" },
  { id: "contact-us", label: "Contact Us" },
  { id: "faq", label: "FAQ" },
  { id: "terms-of-use", label: "Terms & Condition" },
  { id: "privacy-policy", label: "Privacy Policy" },
  { id: "shipping-delivery", label: "Shipping & Delivery" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("website-info");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const isAdmin = user?.role?.role_name === "Admin";

  React.useEffect(() => {
    if (user && !isAdmin) {
      setActiveTab("change-password");
    }
  }, [user, isAdmin]);

  if (isLoading) {
    return null;
  }

  const allowedTabs = isAdmin ? TABS : TABS.filter((tab) => tab.id === "change-password");

  const displayTab = allowedTabs.some((tab) => tab.id === activeTab)
    ? activeTab
    : allowedTabs[0]?.id || "change-password";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm">Update account preferences and manage integrations.</p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Input
              value="https://main-api.uniquelifebd.com/productfeed.xml"
              readOnly
              className="w-64 bg-muted text-muted-foreground h-9"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText("https://main-api.uniquelifebd.com/productfeed.xml");
                toast.success("Link copied to clipboard!");
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </div>
        )}
      </div>



      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0 mt-4">
        {/* Navigation Sidebar */}
        <aside className="lg:w-1/5 shrink-0">
          <nav className="flex space-x-2 overflow-x-auto lg:flex-col lg:space-x-0 lg:space-y-1 pb-4 lg:pb-0">
            {allowedTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap",
                  displayTab === tab.id
                    ? "bg-muted/60 text-foreground"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Dynamic Content Area */}
        <div className="flex-1 lg:max-w-4xl">
          {displayTab === "website-info" && <WebsiteInfoTab />}
          {displayTab === "change-logo" && <ChangeLogoTab />}
          {displayTab === "change-password" && <ChangePasswordTab />}
          {displayTab === "about-us" && (
            <GenericContentTab title="About Us" description="Update the About Us page content." fieldKey="about_us" />
          )}
          {displayTab === "contact-us" && (
            <GenericContentTab title="Contact Us" description="Update your contact information." fieldKey="contact_us" />
          )}
          {displayTab === "faq" && (
            <GenericContentTab title="FAQ" description="Manage frequently asked questions." fieldKey="faq" />
          )}
          {displayTab === "terms-of-use" && (
            <GenericContentTab title="Terms of Use" description="Update the terms of service." fieldKey="terms_of_use" />
          )}
          {displayTab === "privacy-policy" && (
            <GenericContentTab title="Privacy Policy" description="Update the privacy policy." fieldKey="privacy_policy" />
          )}
          {displayTab === "shipping-delivery" && (
            <GenericContentTab
              title="Shipping & Delivery"
              description="Manage shipping options and info."
              fieldKey="shipping_delivery"
            />
          )}
        </div>
      </div>
    </div>
  );
}