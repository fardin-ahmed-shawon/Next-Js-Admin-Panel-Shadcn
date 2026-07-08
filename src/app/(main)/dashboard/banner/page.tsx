"use client";

import * as React from "react";
import { Flag, Image as ImageIcon, Loader2, Save, UploadCloud, Layers } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

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
        <Label className="text-xs text-muted-foreground">Upload Image</Label>
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
              <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF</p>
            </div>
          </div>
          <input ref={inputRef} id={id} type="file" accept="image/*" className="sr-only" onChange={handleChange} />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Image Preview</Label>
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

  // Group 1
  const [banner1File, setBanner1File] = React.useState<File | null>(null);
  const [banner1Preview, setBanner1Preview] = React.useState("");
  const [banner1Default, setBanner1Default] = React.useState("");
  const [banner1Removed, setBanner1Removed] = React.useState(false);
  const [banner1Url, setBanner1Url] = React.useState("");
  const [banner1InitialUrl, setBanner1InitialUrl] = React.useState("");

  const [banner2File, setBanner2File] = React.useState<File | null>(null);
  const [banner2Preview, setBanner2Preview] = React.useState("");
  const [banner2Default, setBanner2Default] = React.useState("");
  const [banner2Removed, setBanner2Removed] = React.useState(false);
  const [banner2Url, setBanner2Url] = React.useState("");
  const [banner2InitialUrl, setBanner2InitialUrl] = React.useState("");

  // Group 2
  const [banner3File, setBanner3File] = React.useState<File | null>(null);
  const [banner3Preview, setBanner3Preview] = React.useState("");
  const [banner3Default, setBanner3Default] = React.useState("");
  const [banner3Removed, setBanner3Removed] = React.useState(false);
  const [banner3Url, setBanner3Url] = React.useState("");
  const [banner3InitialUrl, setBanner3InitialUrl] = React.useState("");

  const [banner4File, setBanner4File] = React.useState<File | null>(null);
  const [banner4Preview, setBanner4Preview] = React.useState("");
  const [banner4Default, setBanner4Default] = React.useState("");
  const [banner4Removed, setBanner4Removed] = React.useState(false);
  const [banner4Url, setBanner4Url] = React.useState("");
  const [banner4InitialUrl, setBanner4InitialUrl] = React.useState("");

  // Group 3
  const [banner5File, setBanner5File] = React.useState<File | null>(null);
  const [banner5Preview, setBanner5Preview] = React.useState("");
  const [banner5Default, setBanner5Default] = React.useState("");
  const [banner5Removed, setBanner5Removed] = React.useState(false);
  const [banner5Url, setBanner5Url] = React.useState("");
  const [banner5InitialUrl, setBanner5InitialUrl] = React.useState("");

  const [banner6File, setBanner6File] = React.useState<File | null>(null);
  const [banner6Preview, setBanner6Preview] = React.useState("");
  const [banner6Default, setBanner6Default] = React.useState("");
  const [banner6Removed, setBanner6Removed] = React.useState(false);
  const [banner6Url, setBanner6Url] = React.useState("");
  const [banner6InitialUrl, setBanner6InitialUrl] = React.useState("");

  const [banner7File, setBanner7File] = React.useState<File | null>(null);
  const [banner7Preview, setBanner7Preview] = React.useState("");
  const [banner7Default, setBanner7Default] = React.useState("");
  const [banner7Removed, setBanner7Removed] = React.useState(false);
  const [banner7Url, setBanner7Url] = React.useState("");
  const [banner7InitialUrl, setBanner7InitialUrl] = React.useState("");

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
        if (data.banner_url_1) {
          setBanner1Url(data.banner_url_1);
          setBanner1InitialUrl(data.banner_url_1);
        }
        if (data.banner_img_2) setBanner2Default(data.banner_img_2);
        if (data.banner_url_2) {
          setBanner2Url(data.banner_url_2);
          setBanner2InitialUrl(data.banner_url_2);
        }
        if (data.banner_img_3) setBanner3Default(data.banner_img_3);
        if (data.banner_url_3) {
          setBanner3Url(data.banner_url_3);
          setBanner3InitialUrl(data.banner_url_3);
        }
        if (data.banner_img_4) setBanner4Default(data.banner_img_4);
        if (data.banner_url_4) {
          setBanner4Url(data.banner_url_4);
          setBanner4InitialUrl(data.banner_url_4);
        }
        if (data.banner_img_5) setBanner5Default(data.banner_img_5);
        if (data.banner_url_5) {
          setBanner5Url(data.banner_url_5);
          setBanner5InitialUrl(data.banner_url_5);
        }
        if (data.banner_img_6) setBanner6Default(data.banner_img_6);
        if (data.banner_url_6) {
          setBanner6Url(data.banner_url_6);
          setBanner6InitialUrl(data.banner_url_6);
        }
        if (data.banner_img_7) setBanner7Default(data.banner_img_7);
        if (data.banner_url_7) {
          setBanner7Url(data.banner_url_7);
          setBanner7InitialUrl(data.banner_url_7);
        }
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

  const handleRemoveBanner3 = () => {
    setBanner3Default("");
    setBanner3Removed(true);
    setBanner3File(null);
    setBanner3Preview("");
  };

  const handleRemoveBanner4 = () => {
    setBanner4Default("");
    setBanner4Removed(true);
    setBanner4File(null);
    setBanner4Preview("");
  };

  const handleRemoveBanner5 = () => {
    setBanner5Default("");
    setBanner5Removed(true);
    setBanner5File(null);
    setBanner5Preview("");
  };

  const handleRemoveBanner6 = () => {
    setBanner6Default("");
    setBanner6Removed(true);
    setBanner6File(null);
    setBanner6Preview("");
  };

  const handleRemoveBanner7 = () => {
    setBanner7Default("");
    setBanner7Removed(true);
    setBanner7File(null);
    setBanner7Preview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      let hasChanges = false;

      // Group 1
      if (banner1File) {
        formData.append("banner_img_1", banner1File);
        hasChanges = true;
      } else if (banner1Removed) {
        formData.append("remove_banner_img_1", "true");
        hasChanges = true;
      }
      if (banner1Url !== banner1InitialUrl) {
        formData.append("banner_url_1", banner1Url);
        hasChanges = true;
      }

      if (banner2File) {
        formData.append("banner_img_2", banner2File);
        hasChanges = true;
      } else if (banner2Removed) {
        formData.append("remove_banner_img_2", "true");
        hasChanges = true;
      }
      if (banner2Url !== banner2InitialUrl) {
        formData.append("banner_url_2", banner2Url);
        hasChanges = true;
      }

      // Group 2
      if (banner3File) {
        formData.append("banner_img_3", banner3File);
        hasChanges = true;
      } else if (banner3Removed) {
        formData.append("remove_banner_img_3", "true");
        hasChanges = true;
      }
      if (banner3Url !== banner3InitialUrl) {
        formData.append("banner_url_3", banner3Url);
        hasChanges = true;
      }

      if (banner4File) {
        formData.append("banner_img_4", banner4File);
        hasChanges = true;
      } else if (banner4Removed) {
        formData.append("remove_banner_img_4", "true");
        hasChanges = true;
      }
      if (banner4Url !== banner4InitialUrl) {
        formData.append("banner_url_4", banner4Url);
        hasChanges = true;
      }

      // Group 3
      if (banner5File) {
        formData.append("banner_img_5", banner5File);
        hasChanges = true;
      } else if (banner5Removed) {
        formData.append("remove_banner_img_5", "true");
        hasChanges = true;
      }
      if (banner5Url !== banner5InitialUrl) {
        formData.append("banner_url_5", banner5Url);
        hasChanges = true;
      }

      if (banner6File) {
        formData.append("banner_img_6", banner6File);
        hasChanges = true;
      } else if (banner6Removed) {
        formData.append("remove_banner_img_6", "true");
        hasChanges = true;
      }
      if (banner6Url !== banner6InitialUrl) {
        formData.append("banner_url_6", banner6Url);
        hasChanges = true;
      }

      if (banner7File) {
        formData.append("banner_img_7", banner7File);
        hasChanges = true;
      } else if (banner7Removed) {
        formData.append("remove_banner_img_7", "true");
        hasChanges = true;
      }
      if (banner7Url !== banner7InitialUrl) {
        formData.append("banner_url_7", banner7Url);
        hasChanges = true;
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
      setBanner3File(null);
      setBanner3Preview("");
      setBanner3Removed(false);
      setBanner4File(null);
      setBanner4Preview("");
      setBanner4Removed(false);
      setBanner5File(null);
      setBanner5Preview("");
      setBanner5Removed(false);
      setBanner6File(null);
      setBanner6Preview("");
      setBanner6Removed(false);
      setBanner7File(null);
      setBanner7Preview("");
      setBanner7Removed(false);
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
        {/* Banner Group 1 */}
        <Card className="ring-2 ring-transparent transition-all hover:ring-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Flag className="size-4.5" />
              </span>
              <div>
                <CardTitle className="text-lg">Banner Group 1</CardTitle>
                <CardDescription>Primary promotional banners (Recommended size: 1200px x 1000px)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <Label className="text-sm font-semibold">Banner Image 1</Label>
              <SplitImageUpload
                id="banner1-image"
                file={banner1File}
                preview={banner1Preview}
                defaultImage={banner1Default}
                aspectRatio="aspect-[6/5]"
                onChange={(f, p) => {
                  setBanner1File(f);
                  setBanner1Preview(p);
                  if (f) setBanner1Removed(false);
                }}
                onRemoveDefault={handleRemoveBanner1}
              />
              <div className="mt-2 space-y-1.5 max-w-xl">
                <Label htmlFor="banner1-url" className="text-xs text-muted-foreground">Banner 1 Target URL</Label>
                <Input
                  id="banner1-url"
                  placeholder="e.g. /shop or https://..."
                  value={banner1Url}
                  onChange={(e) => setBanner1Url(e.target.value)}
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <Label className="text-sm font-semibold">Banner Image 2</Label>
              <SplitImageUpload
                id="banner2-image"
                file={banner2File}
                preview={banner2Preview}
                defaultImage={banner2Default}
                aspectRatio="aspect-[6/5]"
                onChange={(f, p) => {
                  setBanner2File(f);
                  setBanner2Preview(p);
                  if (f) setBanner2Removed(false);
                }}
                onRemoveDefault={handleRemoveBanner2}
              />
              <div className="mt-2 space-y-1.5 max-w-xl">
                <Label htmlFor="banner2-url" className="text-xs text-muted-foreground">Banner 2 Target URL</Label>
                <Input
                  id="banner2-url"
                  placeholder="e.g. /shop or https://..."
                  value={banner2Url}
                  onChange={(e) => setBanner2Url(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banner Group 2 */}
        <Card className="ring-2 ring-transparent transition-all hover:ring-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ImageIcon className="size-4.5" />
              </span>
              <div>
                <CardTitle className="text-lg">Banner Group 2</CardTitle>
                <CardDescription>Secondary promotional banners (Recommended size: 1200px x 800px)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <Label className="text-sm font-semibold">Banner Image 3</Label>
              <SplitImageUpload
                id="banner3-image"
                file={banner3File}
                preview={banner3Preview}
                defaultImage={banner3Default}
                aspectRatio="aspect-[3/2]"
                onChange={(f, p) => {
                  setBanner3File(f);
                  setBanner3Preview(p);
                  if (f) setBanner3Removed(false);
                }}
                onRemoveDefault={handleRemoveBanner3}
              />
              <div className="mt-2 space-y-1.5 max-w-xl">
                <Label htmlFor="banner3-url" className="text-xs text-muted-foreground">Banner 3 Target URL</Label>
                <Input
                  id="banner3-url"
                  placeholder="e.g. /shop or https://..."
                  value={banner3Url}
                  onChange={(e) => setBanner3Url(e.target.value)}
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <Label className="text-sm font-semibold">Banner Image 4</Label>
              <SplitImageUpload
                id="banner4-image"
                file={banner4File}
                preview={banner4Preview}
                defaultImage={banner4Default}
                aspectRatio="aspect-[3/2]"
                onChange={(f, p) => {
                  setBanner4File(f);
                  setBanner4Preview(p);
                  if (f) setBanner4Removed(false);
                }}
                onRemoveDefault={handleRemoveBanner4}
              />
              <div className="mt-2 space-y-1.5 max-w-xl">
                <Label htmlFor="banner4-url" className="text-xs text-muted-foreground">Banner 4 Target URL</Label>
                <Input
                  id="banner4-url"
                  placeholder="e.g. /shop or https://..."
                  value={banner4Url}
                  onChange={(e) => setBanner4Url(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banner Group 3 */}
        <Card className="ring-2 ring-transparent transition-all hover:ring-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Layers className="size-4.5" />
              </span>
              <div>
                <CardTitle className="text-lg">Banner Group 3</CardTitle>
                <CardDescription>Tertiary promotional banners (Recommended size: 1200px x 400px)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <Label className="text-sm font-semibold">Banner Image 5</Label>
              <SplitImageUpload
                id="banner5-image"
                file={banner5File}
                preview={banner5Preview}
                defaultImage={banner5Default}
                aspectRatio="aspect-[3/1]"
                onChange={(f, p) => {
                  setBanner5File(f);
                  setBanner5Preview(p);
                  if (f) setBanner5Removed(false);
                }}
                onRemoveDefault={handleRemoveBanner5}
              />
              <div className="mt-2 space-y-1.5 max-w-xl">
                <Label htmlFor="banner5-url" className="text-xs text-muted-foreground">Banner 5 Target URL</Label>
                <Input
                  id="banner5-url"
                  placeholder="e.g. /shop or https://..."
                  value={banner5Url}
                  onChange={(e) => setBanner5Url(e.target.value)}
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <Label className="text-sm font-semibold">Banner Image 6</Label>
              <SplitImageUpload
                id="banner6-image"
                file={banner6File}
                preview={banner6Preview}
                defaultImage={banner6Default}
                aspectRatio="aspect-[3/1]"
                onChange={(f, p) => {
                  setBanner6File(f);
                  setBanner6Preview(p);
                  if (f) setBanner6Removed(false);
                }}
                onRemoveDefault={handleRemoveBanner6}
              />
              <div className="mt-2 space-y-1.5 max-w-xl">
                <Label htmlFor="banner6-url" className="text-xs text-muted-foreground">Banner 6 Target URL</Label>
                <Input
                  id="banner6-url"
                  placeholder="e.g. /shop or https://..."
                  value={banner6Url}
                  onChange={(e) => setBanner6Url(e.target.value)}
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <Label className="text-sm font-semibold">Banner Image 7</Label>
              <SplitImageUpload
                id="banner7-image"
                file={banner7File}
                preview={banner7Preview}
                defaultImage={banner7Default}
                aspectRatio="aspect-[3/1]"
                onChange={(f, p) => {
                  setBanner7File(f);
                  setBanner7Preview(p);
                  if (f) setBanner7Removed(false);
                }}
                onRemoveDefault={handleRemoveBanner7}
              />
              <div className="mt-2 space-y-1.5 max-w-xl">
                <Label htmlFor="banner7-url" className="text-xs text-muted-foreground">Banner 7 Target URL</Label>
                <Input
                  id="banner7-url"
                  placeholder="e.g. /shop or https://..."
                  value={banner7Url}
                  onChange={(e) => setBanner7Url(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
