"use client";

import * as React from "react";
import { Image as ImageIcon, Loader2, Plus, Save, SlidersHorizontal, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "";
const SLIDER_API_URL = process.env.NEXT_PUBLIC_API_SLIDER_URL || "sliders";

const getSliderUrl = (path: string = "") => {
  let baseUrl = API_BASE_URL;
  if (!baseUrl.endsWith("/")) baseUrl += "/";
  const sliderPath = SLIDER_API_URL.replace(/^\/|\/$/g, "");
  const cleanPath = path.replace(/^\/|\/$/g, "");
  const fullPath = cleanPath ? `${sliderPath}/${cleanPath}` : sliderPath;
  return `${baseUrl}${fullPath}`.replace(/([^:]\/)\/+/g, "$1");
};

// Helper function to get full image URL based on your storage structure
const getFullImageUrl = (imagePath: string) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;

  // Remove any leading slashes
  const cleanPath = imagePath.replace(/^\/+/, "");

  // Construct full URL using APP_URL
  let appUrl = APP_URL;
  if (!appUrl.endsWith("/")) appUrl += "/";

  // Your images are in public/img/ directory
  return `${appUrl}${cleanPath}`;
};

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

  // Get the image source (preview or full URL)
  const imageSrc = preview || (defaultImage ? getFullImageUrl(defaultImage) : "");

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
              <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (max. 2MB)</p>
            </div>
          </div>
          <input ref={inputRef} id={id} type="file" accept="image/*" className="sr-only" onChange={handleChange} />
        </div>
      </div>

      {/* Preview Box */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Image Preview</Label>
          {imageSrc && (
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
        <div
          className={`relative flex w-full flex-col items-center justify-center rounded-xl border bg-muted/30 overflow-hidden ${aspectRatio}`}
        >
          {imageSrc ? (
            <img src={imageSrc} alt="preview" className="size-full object-cover" />
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
  existingId?: number;
}

export default function SliderPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sliders, setSliders] = React.useState<SliderItem[]>([]);

  // Fetch sliders from API
  const fetchSliders = async () => {
    setIsLoading(true);
    try {
      const url = getSliderUrl();
      console.log("Fetching sliders from:", url);

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch sliders: ${response.status}`);

      const result = await response.json();
      console.log("API Response:", result);

      let slidersData = [];

      if (result.data && Array.isArray(result.data)) {
        slidersData = result.data;
      } else if (Array.isArray(result)) {
        slidersData = result;
      } else if (result.sliders && Array.isArray(result.sliders)) {
        slidersData = result.sliders;
      }

      console.log(`Found ${slidersData.length} sliders`);

      // Transform API data to component format
      const transformedData: SliderItem[] = slidersData.map((slider: any) => ({
        id: uid(),
        file: null,
        preview: "",
        defaultImage: slider.slider_img || "",
        existingId: slider.id,
      }));

      console.log("Transformed data:", transformedData);
      setSliders(transformedData);
    } catch (error) {
      console.error("Error fetching sliders:", error);
      toast.error("Failed to load sliders");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSliders();
  }, []);

  const handleAddSlider = () => {
    setSliders((prev) => [
      ...prev,
      {
        id: uid(),
        file: null,
        preview: "",
        defaultImage: "",
        existingId: undefined,
      },
    ]);
  };

  const handleRemoveSlider = async (id: string) => {
    const slider = sliders.find((s) => s.id === id);

    // If slider has an existing ID, delete it from the server
    if (slider?.existingId) {
      try {
        const url = getSliderUrl(slider.existingId.toString());
        const response = await fetch(url, {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to delete slider");

        toast.success("Slider deleted successfully");
        await fetchSliders(); // Refresh the list
      } catch (error) {
        console.error("Error deleting slider:", error);
        toast.error("Failed to delete slider");
        return;
      }
    }

    setSliders((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSlider = (id: string, file: File | null, preview: string) => {
    setSliders((prev) => prev.map((s) => (s.id === id ? { ...s, file, preview } : s)));
  };

  const removeDefaultImage = (id: string) => {
    setSliders((prev) => prev.map((s) => (s.id === id ? { ...s, defaultImage: "" } : s)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Process each slider
      for (const slider of sliders) {
        if (slider.file) {
          // Create form data for image upload
          const formData = new FormData();
          formData.append("slider_img", slider.file);

          if (slider.existingId) {
            // Update existing slider - use POST with _method PUT for file upload
            formData.append("_method", "PUT");
            const url = getSliderUrl(slider.existingId.toString());
            const response = await fetch(url, {
              method: "POST",
              body: formData,
            });

            if (!response.ok) throw new Error("Failed to update slider");
          } else {
            // Create new slider
            const url = getSliderUrl();
            const response = await fetch(url, {
              method: "POST",
              body: formData,
            });

            if (!response.ok) throw new Error("Failed to create slider");
          }
        }
      }

      toast.success("Sliders saved successfully");
      await fetchSliders(); // Refresh the list

      // Clear file inputs after successful save
      setSliders((prev) =>
        prev.map((slider) => ({
          ...slider,
          file: null,
          preview: "",
        })),
      );
    } catch (error) {
      console.error("Error saving sliders:", error);
      toast.error("Failed to save sliders");
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
          <h1 className="text-3xl tracking-tight">Slider Management</h1>
          <p className="text-muted-foreground text-sm">Upload and manage unlimited sliders for your storefront.</p>
        </div>

        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 size-4" />
              Save Sliders
            </>
          )}
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
                    {slider.existingId && (
                      <p className="text-xs text-muted-foreground mt-0.5">ID: {slider.existingId}</p>
                    )}
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

        {sliders.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <SlidersHorizontal className="size-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-center">No sliders found. Click the button below to add one.</p>
            </CardContent>
          </Card>
        )}

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
