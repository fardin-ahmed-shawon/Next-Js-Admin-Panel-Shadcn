"use client";

import * as React from "react";

import { Image as ImageIcon, Plus, Save, SlidersHorizontal, Trash2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

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
              Remove Image
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

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

interface SliderItem {
  id: string;
  file: File | null;
  preview: string;
  defaultImage: string;
}

export default function SliderPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Dynamic Sliders State
  const [sliders, setSliders] = React.useState<SliderItem[]>([
    {
      id: uid(),
      file: null,
      preview: "",
      defaultImage: "https://placehold.co/1200x400/0ea5e9/ffffff?text=Slider+1",
    },
    {
      id: uid(),
      file: null,
      preview: "",
      defaultImage: "https://placehold.co/1200x400/8b5cf6/ffffff?text=Slider+2",
    },
  ]);

  const handleAddSlider = () => {
    setSliders((prev) => [
      ...prev,
      {
        id: uid(),
        file: null,
        preview: "",
        defaultImage: "",
      },
    ]);
  };

  const handleRemoveSlider = (id: string) => {
    setSliders((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSlider = (id: string, file: File | null, preview: string) => {
    setSliders((prev) => prev.map((s) => (s.id === id ? { ...s, file, preview } : s)));
  };

  const removeDefaultImage = (id: string) => {
    setSliders((prev) => prev.map((s) => (s.id === id ? { ...s, defaultImage: "" } : s)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Sliders updated successfully");
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Slider Management</h1>
          <p className="text-muted-foreground text-sm">Upload and manage unlimited sliders for your storefront.</p>
        </div>

        <Button onClick={handleSubmit} disabled={isSubmitting}>
          <Save className="mr-2 size-4" />
          {isSubmitting ? "Saving..." : "Save Sliders"}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {sliders.map((slider, index) => (
          <Card key={slider.id} className="ring-2 ring-transparent transition-all hover:ring-primary/20">
            <CardHeader className="pb-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <CardTitle className="text-lg">Slider Image {index + 1}</CardTitle>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSlider(slider.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete Slider
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <SplitImageUpload
                id={`slider-${slider.id}`}
                file={slider.file}
                preview={slider.preview}
                defaultImage={slider.defaultImage}
                onChange={(f, p) => updateSlider(slider.id, f, p)}
                onRemoveDefault={() => removeDefaultImage(slider.id)}
              />
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed py-8 hover:bg-muted/50"
          onClick={handleAddSlider}
        >
          <Plus className="mr-2 size-5" />
          Add New Slider
        </Button>
      </form>
    </div>
  );
}
