"use client";

import * as React from "react";
import { Flag, Image as ImageIcon, Loader2, Save, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:8000";
const BANNER_API_URL = process.env.NEXT_PUBLIC_API_BANNER_URL || "banners";

const getBannerUrl = (path: string = "") => {
  let baseUrl = API_BASE_URL;
  if (!baseUrl.endsWith("/")) baseUrl += "/";
  const bannerPath = BANNER_API_URL.replace(/^\/|\/$/g, "");
  const cleanPath = path.replace(/^\/|\/$/g, "");
  const fullPath = cleanPath ? `${bannerPath}/${cleanPath}` : bannerPath;
  return `${baseUrl}${fullPath}`.replace(/([^:]\/)\/+/g, "$1");
};

const getFullImageUrl = (imagePath: string) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("data:")) return imagePath;

  const cleanPath = imagePath.replace(/^\/+/, "");
  let appUrl = APP_URL;
  if (!appUrl.endsWith("/")) appUrl += "/";

  return `${appUrl}${cleanPath}`;
};

function SplitImageUpload({
  id,
  file,
  preview,
  defaultImage,
  onChange,
  onRemoveDefault,
  aspectRatio = "aspect-[3/1]",
}: {
  id: string;
  file: File | null;
  preview: string;
  defaultImage?: string;
  onChange: (file: File | null, preview: string) => void;
  onRemoveDefault?: () => void;
  aspectRatio?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const displayImage = preview || (defaultImage ? getFullImageUrl(defaultImage) : "");

  function handleFile(f: File) {
    const url = URL.createObjectURL(f);
    onChange(f, url);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-1.5">
        <Label className="text-xs">Upload Image</Label>
        <div
          className={[
            "group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors",
            aspectRatio,
            dragging
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/30 hover:border-primary/60 hover:bg-muted/50",
          ].join(" ")}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-2 p-6 text-center pointer-events-none">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <UploadCloud className="size-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Click or drag & drop</p>
              <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (max. 2MB)</p>
            </div>
          </div>
          <input ref={inputRef} id={id} type="file" accept="image/*" className="sr-only" onChange={handleChange} />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Image Preview</Label>
          {displayImage && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-5 px-2 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                if (preview) {
                  onChange(null, "");
                  if (inputRef.current) inputRef.current.value = "";
                } else if (onRemoveDefault) {
                  onRemoveDefault();
                }
              }}
            >
              Remove
            </Button>
          )}
        </div>
        <div
          className={`relative flex w-full flex-col items-center justify-center rounded-xl border bg-muted/30 overflow-hidden ${aspectRatio}`}
        >
          {displayImage ? (
            <img src={displayImage} alt="preview" className="size-full object-cover" />
          ) : (
            <div className="flex flex-col items-center text-muted-foreground">
              <ImageIcon className="size-6 mb-2 opacity-20" />
              <p className="text-xs font-medium">No image</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BannerPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [bannerId, setBannerId] = React.useState<number | null>(null);

  // Banner 1 State
  const [banner1File, setBanner1File] = React.useState<File | null>(null);
  const [banner1Preview, setBanner1Preview] = React.useState("");
  const [banner1Default, setBanner1Default] = React.useState("");
  const [banner1Removed, setBanner1Removed] = React.useState(false);

  // Banner 2 State
  const [banner2File, setBanner2File] = React.useState<File | null>(null);
  const [banner2Preview, setBanner2Preview] = React.useState("");
  const [banner2Default, setBanner2Default] = React.useState("");
  const [banner2Removed, setBanner2Removed] = React.useState(false);

  // Fetch banners from API
  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const url = getBannerUrl();
      console.log("Fetching banners from:", url);

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch banners: ${response.status}`);

      const result = await response.json();
      console.log("API Response:", result);

      if (result.success && result.data) {
        const data = result.data;
        setBannerId(data.id);
        if (data.banner_img_1) setBanner1Default(data.banner_img_1);
        if (data.banner_img_2) setBanner2Default(data.banner_img_2);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      toast.error("Failed to load banners");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchBanners();
  }, []);

  const handleRemoveBanner1 = () => {
    setBanner1Default("");
    setBanner1Removed(true);
    setBanner1File(null);
    setBanner1Preview("");
  };

  const handleRemoveBanner2 = () => {
    setBanner2Default("");
    setBanner2Removed(true);
    setBanner2File(null);
    setBanner2Preview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      let hasChanges = false;

      // Handle Banner 1
      if (banner1File) {
        formData.append("banner_img_1", banner1File);
        hasChanges = true;
        console.log("Uploading new banner 1 file:", banner1File.name);
      } else if (banner1Removed) {
        formData.append("remove_banner_img_1", "true");
        hasChanges = true;
        console.log("Removing banner 1");
      }

      // Handle Banner 2
      if (banner2File) {
        formData.append("banner_img_2", banner2File);
        hasChanges = true;
        console.log("Uploading new banner 2 file:", banner2File.name);
      } else if (banner2Removed) {
        formData.append("remove_banner_img_2", "true");
        hasChanges = true;
        console.log("Removing banner 2");
      }

      if (!hasChanges) {
        toast.info("No changes to save");
        setIsSubmitting(false);
        return;
      }

      const url = getBannerUrl();
      console.log("Submitting to:", url);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Server response:", result);

      if (!response.ok) {
        throw new Error(result.message || "Failed to save banners");
      }

      toast.success(result.message || "Banners updated successfully");

      // Refresh banner data
      await fetchBanners();

      // Reset states
      setBanner1File(null);
      setBanner1Preview("");
      setBanner1Removed(false);
      setBanner2File(null);
      setBanner2Preview("");
      setBanner2Removed(false);
    } catch (error) {
      console.error("Error saving banners:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save banners");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Banner Management</h1>
          <p className="text-muted-foreground text-sm">Upload and manage promotional banners for your storefront.</p>
        </div>

        <Button onClick={handleSubmit} disabled={isSubmitting}>
          <Save className="mr-2 size-4" />
          {isSubmitting ? "Saving..." : "Save Banners"}
        </Button>
      </div>

      <form className="grid gap-6">
        {/* Banner 1 */}
        <Card className="ring-2 ring-transparent transition-all hover:ring-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Flag className="size-4.5" />
              </span>
              <div>
                <CardTitle className="text-lg">Banner 1</CardTitle>
                <CardDescription>Main promotional banner shown at the top.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <SplitImageUpload
              id="banner1-image"
              file={banner1File}
              preview={banner1Preview}
              defaultImage={banner1Default}
              onChange={(f, p) => {
                setBanner1File(f);
                setBanner1Preview(p);
                if (f) setBanner1Removed(false);
              }}
              onRemoveDefault={handleRemoveBanner1}
            />
          </CardContent>
        </Card>

        {/* Banner 2 */}
        <Card className="ring-2 ring-transparent transition-all hover:ring-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <ImageIcon className="size-4.5" />
              </span>
              <div>
                <CardTitle className="text-lg">Banner 2</CardTitle>
                <CardDescription>Additional banner for secondary promotions.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <SplitImageUpload
              id="banner2-image"
              file={banner2File}
              preview={banner2Preview}
              defaultImage={banner2Default}
              onChange={(f, p) => {
                setBanner2File(f);
                setBanner2Preview(p);
                if (f) setBanner2Removed(false);
              }}
              onRemoveDefault={handleRemoveBanner2}
            />
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
