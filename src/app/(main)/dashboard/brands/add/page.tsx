"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, UploadCloud, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchClient } from "@/lib/fetch-client";
import { getBrandsApiUrl } from "@/hooks/useBrands";

export default function AddBrandPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    if (selectedFile) {
      formData.set("logo", selectedFile);
    } else {
      formData.delete("logo");
    }

    try {
      const url = getBrandsApiUrl();
      const response = await fetchClient(url, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message || "Brand created successfully");
        router.push("/dashboard/brands");
      } else {
        if (result.errors) {
          const errors = Object.values(result.errors).flat();
          toast.error(errors.join(", "));
        } else {
          toast.error(result.message || "Failed to create brand");
        }
      }
    } catch (error) {
      console.error("Create brand error:", error);
      toast.error("Failed to create brand");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-4xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight font-semibold">Add Brand</h1>
          <p className="text-muted-foreground text-sm">Create a new brand to associate with catalog products.</p>
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
              <CardDescription>Enter the primary details for this brand.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brand-name">
                  Brand Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="brand-name"
                  name="name"
                  placeholder="e.g. Nike, Apple, Sony"
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
              <CardDescription>Upload a square brand icon or logo.</CardDescription>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                id="page-brand-logo"
                name="logo"
                accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
                disabled={isSubmitting}
              />
              {previewUrl ? (
                <div className="relative border rounded-lg p-4 flex flex-col items-center justify-center bg-muted/20 gap-3">
                  <img
                    src={previewUrl}
                    alt="Logo Preview"
                    className="max-h-36 max-w-full object-contain rounded"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearFile}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="size-3.5 mr-1" />
                    Remove Logo
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="page-brand-logo"
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
                  Saving Brand...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save Brand
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
