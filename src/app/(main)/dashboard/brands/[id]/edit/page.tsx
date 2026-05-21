"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Save, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Mock data to pre-fill the form
const mockBrands = {
  "BRD-001": { name: "Nike", description: "World's leading sportswear brand.", status: "Active", logo: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=NK" },
  "BRD-002": { name: "Adidas", description: "Impossible is nothing.", status: "Active", logo: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=AD" },
  "BRD-003": { name: "Puma", description: "Forever Faster.", status: "Inactive", logo: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=PM" },
};

export default function EditBrandPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Find brand or use a generic fallback
  const brand = (mockBrands as any)[id] || { name: "Sample Brand", description: "A cool brand.", status: "Active" };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Brand updated successfully");
      router.push("/dashboard/brands");
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Edit Brand</h1>
          <p className="text-muted-foreground text-sm">
            Modify details for {brand.name}.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/dashboard/brands">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="size-4" />
              Back
            </Button>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Update the basic details for this brand.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Brand Name <span className="text-destructive">*</span></Label>
                <Input id="name" defaultValue={brand.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  defaultValue={brand.description}
                  className="min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status & Visibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Active Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Brand visible to customers
                  </p>
                </div>
                <Switch defaultChecked={brand.status === "Active"} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Brand Logo</CardTitle>
              <CardDescription>Upload a square logo (recommended 256x256px).</CardDescription>
            </CardHeader>
            <CardContent>
              {brand.logo ? (
                <div className="flex flex-col items-center gap-4 mb-4">
                  <div className="size-32 rounded-lg border overflow-hidden bg-muted p-2">
                    <img src={brand.logo} alt={brand.name} className="size-full object-cover rounded-sm" />
                  </div>
                  <Button variant="outline" size="sm" type="button">Change Logo</Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <UploadCloud className="size-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Click to upload</p>
                    <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (max. 2MB)</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end pt-2">
            <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
              <Save className="mr-2 size-4" />
              {isSubmitting ? "Saving..." : "Update Brand"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
