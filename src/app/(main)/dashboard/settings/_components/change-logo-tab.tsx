"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { fetchClient } from "@/lib/fetch-client";

export function ChangeLogoTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentLogo, setCurrentLogo] = useState("");
  const [currentFavicon, setCurrentFavicon] = useState("");
  const [logoSize, setLogoSize] = useState("70");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  // Get backend host URL (remove api/v1/admin/ etc)
  const hostUrl = apiBaseUrl.replace(/\/api\/v1\/admin\/?$/, "") || "http://localhost:8000";

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetchClient(`${apiBaseUrl}web-settings`);
        if (response.ok) {
          const res = await response.json();
          if (res.success && res.data) {
            setCurrentLogo(res.data.brand_logo || "");
            setCurrentFavicon(res.data.brand_favicon || "");
            setLogoSize(res.data.brand_logo_size || "70");
          }
        }
      } catch (error) {
        console.error("Error loading logo settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [apiBaseUrl]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      if (logoFile) {
        formData.append("brand_logo", logoFile);
      }
      if (faviconFile) {
        formData.append("brand_favicon", faviconFile);
      }
      formData.append("brand_logo_size", logoSize);

      const response = await fetchClient(`${apiBaseUrl}web-settings`, {
        method: "POST",
        body: formData,
      });

      const res = await response.json();
      if (response.ok && res.success) {
        toast.success("Logo and favicon settings updated successfully");
        if (res.data) {
          setCurrentLogo(res.data.brand_logo || "");
          setCurrentFavicon(res.data.brand_favicon || "");
          setLogoSize(res.data.brand_logo_size || "70");
          // Clear file selections
          setLogoFile(null);
          setFaviconFile(null);
        }
      } else {
        if (res.errors) {
          const firstError = Object.values(res.errors)[0];
          if (Array.isArray(firstError)) {
            toast.error(firstError[0] || "Failed to update logo settings");
          } else {
            toast.error("Failed to update logo settings");
          }
        } else {
          toast.error(res.message || "Failed to update logo settings");
        }
      }
    } catch (error) {
      console.error("Error saving logo settings:", error);
      toast.error("An error occurred while saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground animate-pulse">Loading settings...</div>;
  }

  const logoPreviewUrl = logoFile ? URL.createObjectURL(logoFile) : currentLogo ? `${hostUrl}/${currentLogo}` : "";
  const faviconPreviewUrl = faviconFile ? URL.createObjectURL(faviconFile) : currentFavicon ? `${hostUrl}/${currentFavicon}` : "";

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300 w-full max-w-3xl">
      <div>
        <h3 className="text-xl font-semibold text-foreground">Change Website Logo & Favicon</h3>
        <p className="text-sm text-muted-foreground mt-1">Update your brand assets displayed across the site.</p>
      </div>
      <Separator />

      {/* Website Logo Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
        <div className="flex flex-col gap-3 shrink-0">
          <p className="text-sm font-medium text-foreground">Logo Preview</p>
          <div className="flex h-40 w-40 items-center justify-center rounded-xl border bg-muted/20 overflow-hidden relative">
            {logoPreviewUrl ? (
              <img src={logoPreviewUrl} alt="Logo" className="max-h-full max-w-full object-contain p-2" style={{ width: `${logoSize}px` }} />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground text-xs p-4 text-center">
                <span>No Logo Uploaded</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Upload New Logo</p>
            <p className="text-sm text-muted-foreground">Recommend format: PNG or WebP. Max size: 3MB.</p>
          </div>
          <Input 
            type="file" 
            className="cursor-pointer file:cursor-pointer" 
            accept="image/*" 
            onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
          />

          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium text-foreground">Brand Logo Display Width (px)</label>
            <Input 
              type="number" 
              value={logoSize} 
              onChange={(e) => setLogoSize(e.target.value)} 
              placeholder="e.g., 70"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Website Favicon Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
        <div className="flex flex-col gap-3 shrink-0">
          <p className="text-sm font-medium text-foreground">Favicon Preview</p>
          <div className="flex h-20 w-20 items-center justify-center rounded-xl border bg-muted/20 overflow-hidden relative">
            {faviconPreviewUrl ? (
              <img src={faviconPreviewUrl} alt="Favicon" className="h-10 w-10 object-contain" />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground text-xs p-2 text-center">
                <span>No Favicon</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Upload New Favicon</p>
            <p className="text-sm text-muted-foreground">Recommend size: 32x32px or 64x64px. Format: ICO, PNG, WebP. Max size: 1MB.</p>
          </div>
          <Input 
            type="file" 
            className="cursor-pointer file:cursor-pointer" 
            accept="image/x-icon,image/png,image/jpeg,image/webp" 
            onChange={(e) => setFaviconFile(e.target.files?.[0] || null)}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 pb-8">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving Assets..." : "Save Assets"}
        </Button>
      </div>
    </div>
  );
}
