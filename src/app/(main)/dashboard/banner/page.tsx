"use client";

import * as React from "react";

import { Flag, Image as ImageIcon, Link as LinkIcon, Save, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

/* ---- Split Image Upload Component ---- */
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
      {/* Upload Box */}
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
              <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (max. 5MB)</p>
            </div>
          </div>
          <input ref={inputRef} id={id} type="file" accept="image/*" className="sr-only" onChange={handleChange} />
        </div>
      </div>

      {/* Preview Box */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Image Preview</Label>
          {(preview || defaultImage) && (
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
        <div className={`relative flex w-full flex-col items-center justify-center rounded-xl border bg-muted/30 overflow-hidden ${aspectRatio}`}>
          {(preview || defaultImage) ? (
            <img src={preview || defaultImage} alt="preview" className="size-full object-cover" />
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

  // Banner 1 State
  const [banner1File, setBanner1File] = React.useState<File | null>(null);
  const [banner1Preview, setBanner1Preview] = React.useState("");
  const [banner1Default, setBanner1Default] = React.useState("https://placehold.co/1200x400/1a1a2e/e0e0e0?text=Summer+Sale+Banner");

  // Banner 2 State
  const [banner2File, setBanner2File] = React.useState<File | null>(null);
  const [banner2Preview, setBanner2Preview] = React.useState("");
  const [banner2Default, setBanner2Default] = React.useState("https://placehold.co/1200x400/4f46e5/ffffff?text=New+Arrivals+Banner");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Banners updated successfully");
    }, 1000);
  };

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

      <form onSubmit={handleSubmit} className="grid gap-6">
        {/* Banner 1 */}
        <Card className="ring-2 ring-transparent transition-all hover:ring-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Flag className="size-4.5" />
                </span>
                <div>
                  <CardTitle className="text-lg">Banner 1</CardTitle>
                  <CardDescription>Main promotional banner shown at the top.</CardDescription>
                </div>
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
              }}
              onRemoveDefault={() => setBanner1Default("")}
            />
          </CardContent>
        </Card>

        {/* Banner 2 */}
        <Card className="ring-2 ring-transparent transition-all hover:ring-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <ImageIcon className="size-4.5" />
                </span>
                <div>
                  <CardTitle className="text-lg">Banner 2</CardTitle>
                  <CardDescription>Additional banner for secondary promotions.</CardDescription>
                </div>
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
              }}
              onRemoveDefault={() => setBanner2Default("")}
            />
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
