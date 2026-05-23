"use client";

import { useState } from "react";

import Link from "next/link";

import { CreditCard, MessageSquare } from "lucide-react";

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
import { Separator } from "@/components/ui/separator";
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
  { id: "terms-of-use", label: "Terms of Use" },
  { id: "privacy-policy", label: "Privacy Policy" },
  { id: "shipping-delivery", label: "Shipping & Delivery" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("website-info");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm">Update account preferences and manage integrations.</p>
        </div>
      </div>

      {/* Remove Account Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between rounded-lg border p-5 bg-card">
        <div className="space-y-1 mb-4 md:mb-0">
          <p className="text-base font-semibold text-foreground">Remove Account</p>
          <p className="text-sm text-muted-foreground">You can do 'Disable account' to take a break from panel.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="text-red-500 border-red-200 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            Deactivate Account
          </Button>

          <AlertDialog
            onOpenChange={(open) => {
              if (!open) setDeleteConfirmation("");
            }}
          >
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-4">
                  <p>
                    This action cannot be undone. This will permanently delete your account and remove your data from
                    our servers. All your active services will be canceled immediately.
                  </p>
                  <p className="text-foreground font-medium">
                    Please type <strong>Delete</strong> to confirm.
                  </p>
                  <Input
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="Type Delete"
                  />
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={deleteConfirmation !== "Delete"}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Yes, delete account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0 mt-4">
        {/* Navigation Sidebar */}
        <aside className="lg:w-1/5 shrink-0">
          <nav className="flex space-x-2 overflow-x-auto lg:flex-col lg:space-x-0 lg:space-y-1 pb-4 lg:pb-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap",
                  activeTab === tab.id
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
          {activeTab === "website-info" && <WebsiteInfoTab />}
          {activeTab === "change-logo" && <ChangeLogoTab />}
          {activeTab === "change-password" && <ChangePasswordTab />}
          {activeTab === "about-us" && (
            <GenericContentTab title="About Us" description="Update the About Us page content." />
          )}
          {activeTab === "contact-us" && (
            <GenericContentTab title="Contact Us" description="Update your contact information." />
          )}
          {activeTab === "faq" && <GenericContentTab title="FAQ" description="Manage frequently asked questions." />}
          {activeTab === "terms-of-use" && (
            <GenericContentTab title="Terms of Use" description="Update the terms of service." />
          )}
          {activeTab === "privacy-policy" && (
            <GenericContentTab title="Privacy Policy" description="Update the privacy policy." />
          )}
          {activeTab === "shipping-delivery" && (
            <GenericContentTab title="Shipping & Delivery" description="Manage shipping options and info." />
          )}
        </div>
      </div>
    </div>
  );
}
