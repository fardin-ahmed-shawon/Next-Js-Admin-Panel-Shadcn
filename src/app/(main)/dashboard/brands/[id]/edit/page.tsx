"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, UploadCloud, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchClient } from "@/lib/fetch-client";
import { getBrandsApiUrl } from "@/hooks/useBrands";

export default function EditBrandPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const brandId = params?.id || "";
  const numericId = brandId.replace("BRD-", "");

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [name, setName] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    async function loadBrand() {
      if (!numericId) return;
      try {
        setIsLoading(true);
        const url = getBrandsApiUrl(numericId);
        const response = await fetchClient(url);

        if (!response.ok) {
          throw new Error("Brand not found");
        }

        const result = await response.json();
        if (result.success && result.data) {
          setName(result.data.name || "");
          setPreviewUrl(result.data.logo || null);
        } else {
          toast.error("Brand not found");
          router.push("/dashboard/brands");
        }
      } catch (error) {
        console.error("Fetch brand error:", error);
        toast.error("Failed to load brand data");
        router.push("/dashboard/brands");
      } finally {
        setIsLoading(false);
      }
    }

    loadBrand();
  }, [numericId, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast.error("File size must be less than 3MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Brand name is required");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("name", name.trim());

    if (selectedFile) {
      formData.append("logo", selectedFile);
    }

    try {
      const url = getBrandsApiUrl(numericId);
      const response = await fetchClient(url, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message || "Brand updated successfully");
        router.push("/dashboard/brands");
      } else {
        if (result.errors) {
          const errors = Object.values(result.errors).flat();
          toast.error(errors.join(", "));
        } else {
          toast.error(result.message || "Failed to update brand");
        }
      }
    } catch (error) {
      console.error("Update brand error:", error);
      toast.error("Failed to update brand");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading brand details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-4xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight font-semibold">Edit Brand</h1>
          <p className="text-muted-foreground text-sm">Modify details for {name || `Brand #${numericId}`}.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/brands">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="size-4" />
              Back to Brands
            </Button>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Update the basic information for this brand.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brand-name">
                  Brand Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="brand-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Nike"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Logo</CardTitle>
              <CardDescription>Upload a new square logo to replace the current one.</CardDescription>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                id="edit-page-brand-logo"
                accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
                disabled={isSubmitting}
              />
              {previewUrl ? (
                <div className="relative border rounded-lg p-4 flex flex-col items-center justify-center bg-muted/20 gap-3">
                  <img
                    src={previewUrl}
                    alt={name}
                    className="max-h-36 max-w-full object-contain rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://placehold.co/80x80/1a1a2e/e0e0e0?text=${name.substring(0, 2).toUpperCase()}`;
                    }}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting}
                    >
                      Change Logo
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearImage}
                      disabled={isSubmitting}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="edit-page-brand-logo"
                  className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center gap-2 hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <UploadCloud className="size-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Click to upload</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, WebP (Max 3MB)</p>
                  </div>
                </label>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end pt-2">
            <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Update Brand
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
