"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  GalleryHorizontal,
  Image as ImageIcon,
  Info,
  Package,
  Plus,
  Quote,
  Search,
  Send,
  Sparkles,
  Trash2,
  UploadCloud,
  Video,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

/* ---- Catalogue ---- */

const productCatalogue = [
  { id: "PRD-001", name: "Premium Cotton T-Shirt",       sku: "SKU-001", price: 850,  stock: 124, image: "https://placehold.co/80x80/6366f1/ffffff?text=TS", category: "Clothing"     },
  { id: "PRD-002", name: "Slim Fit Denim Jeans",         sku: "SKU-002", price: 1450, stock: 67,  image: "https://placehold.co/80x80/f59e0b/ffffff?text=DJ", category: "Clothing"     },
  { id: "PRD-003", name: "Wireless Bluetooth Earbuds",   sku: "SKU-003", price: 2200, stock: 42,  image: "https://placehold.co/80x80/06b6d4/ffffff?text=BE", category: "Electronics"  },
  { id: "PRD-004", name: "Leather Crossbody Bag",        sku: "SKU-004", price: 3100, stock: 18,  image: "https://placehold.co/80x80/10b981/ffffff?text=CB", category: "Accessories"  },
  { id: "PRD-005", name: "Running Sneakers Pro",         sku: "SKU-005", price: 2800, stock: 55,  image: "https://placehold.co/80x80/f43f5e/ffffff?text=RS", category: "Footwear"     },
  { id: "PRD-006", name: "Organic Face Moisturizer",     sku: "SKU-006", price: 650,  stock: 200, image: "https://placehold.co/80x80/d946ef/ffffff?text=FM", category: "Beauty"       },
  { id: "PRD-007", name: "Stainless Steel Water Bottle", sku: "SKU-007", price: 480,  stock: 310, image: "https://placehold.co/80x80/14b8a6/ffffff?text=WB", category: "Home"         },
  { id: "PRD-008", name: "Smart Fitness Watch",          sku: "SKU-008", price: 4500, stock: 29,  image: "https://placehold.co/80x80/8b5cf6/ffffff?text=FW", category: "Electronics"  },
  { id: "PRD-009", name: "Classic Polo Shirt",           sku: "SKU-009", price: 950,  stock: 88,  image: "https://placehold.co/80x80/f97316/ffffff?text=PS", category: "Clothing"     },
  { id: "PRD-010", name: "Minimalist Desk Lamp",         sku: "SKU-010", price: 1200, stock: 45,  image: "https://placehold.co/80x80/0ea5e9/ffffff?text=DL", category: "Home"         },
];

type Product = (typeof productCatalogue)[0];

/* ---- Repeatable item types ---- */
interface FeatureItem   { id: string; title: string; description: string; }
interface WhyChooseItem { id: string; text: string; }
interface ReviewItem    { id: string; file: File | null; preview: string; }
interface GalleryItem   { id: string; file: File | null; preview: string; }

function uid() { return Math.random().toString(36).slice(2, 9); }

/* ---- Sub-components ---- */

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  accent = false,
  className = "",
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <Card className={[accent ? "ring-2 ring-primary/20" : "", className].filter(Boolean).join(" ")}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="overflow-visible">{children}</CardContent>
    </Card>
  );
}

/* ---- Image Upload Box (single) ---- */

function ImageUploadBox({
  id,
  label,
  file,
  preview,
  onChange,
  required,
  aspectRatio = "aspect-square",
}: {
  id: string;
  label: string;
  file: File | null;
  preview: string;
  onChange: (file: File | null, preview: string) => void;
  required?: boolean;
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
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>

      <div
        className={[
          "group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors",
          aspectRatio,
          dragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30 hover:border-primary/60 hover:bg-muted/50",
        ].join(" ")}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="preview"
              className="absolute inset-0 size-full rounded-[10px] object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-[10px] bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex flex-col items-center gap-1 text-white">
                <UploadCloud className="size-4" />
                <span className="text-[11px] font-medium">Change</span>
              </div>
            </div>
            <button
              type="button"
              aria-label="Remove image"
              className="absolute right-1.5 top-1.5 z-10 flex size-5 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-destructive"
              onClick={(e) => { e.stopPropagation(); onChange(null, ""); if (inputRef.current) inputRef.current.value = ""; }}
            >
              <X className="size-3" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 p-3 text-center pointer-events-none">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
              <UploadCloud className="size-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Click or drag & drop</p>
          </div>
        )}
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

/* ---- Repeatable image upload (compact card) ---- */

function RepeatableImageUpload({
  index,
  file,
  preview,
  onUpdate,
  onRemove,
}: {
  index: number;
  file: File | null;
  preview: string;
  onUpdate: (file: File | null, preview: string) => void;
  onRemove: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  function handleFile(f: File) {
    const url = URL.createObjectURL(f);
    onUpdate(f, url);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  }

  return (
    <div className="flex flex-col gap-1.5">
      {/* Upload zone — square */}
      <div
        className={[
          "group relative w-full cursor-pointer rounded-xl border-2 border-dashed transition-colors aspect-square",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30 hover:border-primary/60 hover:bg-muted/50",
        ].join(" ")}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="preview"
              className="absolute inset-0 size-full rounded-[10px] object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-[10px] bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <UploadCloud className="size-4 text-white" />
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pointer-events-none">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary text-[11px] font-bold">
              {index + 1}
            </span>
            <UploadCloud className="size-4 text-muted-foreground mt-1" />
            <p className="text-[11px] text-muted-foreground">Upload</p>
          </div>
        )}
        {preview && (
          <span className="absolute left-1.5 top-1.5 flex size-5 items-center justify-center rounded-md bg-black/50 text-white text-[10px] font-bold">
            {index + 1}
          </span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      {/* Remove button below */}
      <Button
        size="sm"
        variant="ghost"
        onClick={onRemove}
        aria-label="Remove"
        className="h-6 w-full text-[11px] text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="mr-1 size-3" /> Remove
      </Button>
    </div>
  );
}

function AddRowButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="mt-1 self-start gap-1.5 border-dashed text-muted-foreground hover:text-foreground"
    >
      <Plus className="size-3.5" />
      {label}
    </Button>
  );
}

/* ================================================================
   MAIN FORM
   ================================================================ */

export function CreateLandingPageForm() {
  const router = useRouter();

  /* ---- Product search ---- */
  const [query, setQuery]                 = React.useState("");
  const [focused, setFocused]             = React.useState(false);
  const [product, setProduct]             = React.useState<Product | null>(null);
  const searchRef                         = React.useRef<HTMLDivElement>(null);

  /* ---- Page Info fields ---- */
  const [homeTitle, setHomeTitle]                     = React.useState("");
  const [homeDescription, setHomeDescription]         = React.useState("");
  const [homeImageFile, setHomeImageFile]             = React.useState<File | null>(null);
  const [homeImagePreview, setHomeImagePreview]       = React.useState("");
  const [featureImageFile, setFeatureImageFile]       = React.useState<File | null>(null);
  const [featureImagePreview, setFeatureImagePreview] = React.useState("");
  const [featuresMainTitle, setFeaturesMainTitle]     = React.useState("");
  const [whyChooseTopTitle, setWhyChooseTopTitle]     = React.useState("");
  const [whyChooseBottomTitle, setWhyChooseBottomTitle] = React.useState("");
  const [reviewMainTitle, setReviewMainTitle]         = React.useState("");
  const [checkoutMainTitle, setCheckoutMainTitle]     = React.useState("");
  const [youtubeVideoUrl, setYoutubeVideoUrl]         = React.useState("");

  /* ---- Repeatable lists ---- */
  const [features,   setFeatures]   = React.useState<FeatureItem[]>([{ id: uid(), title: "", description: "" }]);
  const [whyChoose,  setWhyChoose]  = React.useState<WhyChooseItem[]>([{ id: uid(), text: "" }]);
  const [reviews,    setReviews]    = React.useState<ReviewItem[]>([{ id: uid(), file: null, preview: "" }]);
  const [gallery,    setGallery]    = React.useState<GalleryItem[]>([{ id: uid(), file: null, preview: "" }]);

  /* ---- Filtered products ---- */
  const filtered = React.useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return productCatalogue.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [query]);

  /* ---- Click outside ---- */
  React.useEffect(() => {
    function outside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setFocused(false);
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  function pickProduct(p: Product) {
    setProduct(p);
    setQuery("");
    setFocused(false);
    toast.success(`"${p.name}" selected.`);
  }

  /* Features */
  const addFeature    = () => setFeatures((p) => [...p, { id: uid(), title: "", description: "" }]);
  const removeFeature = (id: string) => setFeatures((p) => p.filter((f) => f.id !== id));
  const updateFeature = (id: string, field: "title" | "description", v: string) =>
    setFeatures((p) => p.map((f) => (f.id === id ? { ...f, [field]: v } : f)));

  /* WhyChoose */
  const addWhy    = () => setWhyChoose((p) => [...p, { id: uid(), text: "" }]);
  const removeWhy = (id: string) => setWhyChoose((p) => p.filter((w) => w.id !== id));
  const updateWhy = (id: string, v: string) =>
    setWhyChoose((p) => p.map((w) => (w.id === id ? { ...w, text: v } : w)));

  /* Reviews */
  const addReview    = () => setReviews((p) => [...p, { id: uid(), file: null, preview: "" }]);
  const removeReview = (id: string) => setReviews((p) => p.filter((r) => r.id !== id));
  const updateReview = (id: string, file: File | null, preview: string) =>
    setReviews((p) => p.map((r) => (r.id === id ? { ...r, file, preview } : r)));

  /* Gallery */
  const addGallery    = () => setGallery((p) => [...p, { id: uid(), file: null, preview: "" }]);
  const removeGallery = (id: string) => setGallery((p) => p.filter((g) => g.id !== id));
  const updateGallery = (id: string, file: File | null, preview: string) =>
    setGallery((p) => p.map((g) => (g.id === id ? { ...g, file, preview } : g)));

  /* Publish */
  function handlePublish() {
    if (!product) { toast.error("Please select a product first."); return; }
    if (!homeTitle.trim()) { toast.error("Home title is required."); return; }
    toast.success(`Landing page for "${product.name}" published!`);
    router.push("/dashboard/landing-pages");
  }


  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <div className="flex flex-col gap-6 pb-28">

      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl tracking-tight">Create Landing Page</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Search and select a product, then fill in the landing page details.
          </p>
        </div>
        <Button size="sm" onClick={handlePublish} className="shrink-0">
          <Send className="mr-2 size-4" />
          Publish Landing Page
        </Button>
      </div>

      {/* ── STEP 1 · Product search ── */}
      <SectionCard
        icon={Package}
        title="Select Product"
        description="Search for the product this landing page is for."
        accent={!!product}
        className="overflow-visible"
      >
        {product ? (
          /* Selected state */
          <div className="flex items-center gap-4 rounded-xl border bg-muted/30 px-4 py-3">
            <div className="size-12 shrink-0 overflow-hidden rounded-xl border bg-muted">
              <img src={product.image} alt={product.name} className="size-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold leading-none truncate">{product.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {product.sku} · {product.category} · ৳{product.price.toLocaleString()}
              </p>
            </div>
            <Badge variant="default" className="gap-1 shrink-0">
              <Check className="size-3" /> Selected
            </Badge>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => setProduct(null)}
              aria-label="Change product"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          /* Search state */
          <div ref={searchRef} className="relative overflow-visible">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-11 pl-10 text-sm"
              placeholder="Type product name, SKU, or category…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
            />

            {/* Dropdown results */}
            {focused && filtered.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-[100] mt-2 max-h-72 overflow-y-auto rounded-xl border bg-popover shadow-2xl">
                {filtered.map((p, i) => (
                  <React.Fragment key={p.id}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/60"
                      onClick={() => pickProduct(p)}
                    >
                      <div className="size-10 shrink-0 overflow-hidden rounded-lg border bg-muted">
                        <img src={p.image} alt={p.name} className="size-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.sku} · {p.category}</p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums shrink-0">
                        ৳{p.price.toLocaleString()}
                      </span>
                      <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                    </button>
                    {i < filtered.length - 1 && <Separator />}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* No results */}
            {focused && query.trim() && filtered.length === 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border bg-popover p-8 text-center shadow-2xl">
                <Package className="mx-auto mb-2 size-8 text-muted-foreground" />
                <p className="text-sm font-medium">No products found</p>
                <p className="text-xs text-muted-foreground">Try a different search term.</p>
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {/* ── Landing Page Info ── */}
      <SectionCard
        icon={Info}
        title="Landing Page Info"
        description="Core content sections of the landing page."
      >
        <div className="grid gap-3 sm:grid-cols-2 content-start">

            {/* Home Title */}
            <div className="space-y-1.5">
              <Label htmlFor="home-title" className="text-xs">
                Home Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="home-title"
                placeholder="e.g. Discover Our Best Product"
                value={homeTitle}
                onChange={(e) => setHomeTitle(e.target.value)}
              />
            </div>

            {/* Features Main Title */}
            <div className="space-y-1.5">
              <Label htmlFor="feat-main-title" className="text-xs">Features Main Title</Label>
              <Input
                id="feat-main-title"
                placeholder="e.g. Why You'll Love This"
                value={featuresMainTitle}
                onChange={(e) => setFeaturesMainTitle(e.target.value)}
              />
            </div>

            {/* Home Description — full row */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="home-desc" className="text-xs">Home Description</Label>
              <Textarea
                id="home-desc"
                placeholder="A short intro text shown in the hero section…"
                className="min-h-[68px] resize-y"
                value={homeDescription}
                onChange={(e) => setHomeDescription(e.target.value)}
              />
            </div>

            {/* Why Choose Top */}
            <div className="space-y-1.5">
              <Label htmlFor="why-top" className="text-xs">Why Choose — Top Title</Label>
              <Input
                id="why-top"
                placeholder="e.g. The Smarter Choice"
                value={whyChooseTopTitle}
                onChange={(e) => setWhyChooseTopTitle(e.target.value)}
              />
            </div>

            {/* Why Choose Bottom */}
            <div className="space-y-1.5">
              <Label htmlFor="why-bottom" className="text-xs">Why Choose — Bottom Title</Label>
              <Input
                id="why-bottom"
                placeholder="e.g. Trusted by thousands"
                value={whyChooseBottomTitle}
                onChange={(e) => setWhyChooseBottomTitle(e.target.value)}
              />
            </div>

            {/* Review Main Title */}
            <div className="space-y-1.5">
              <Label htmlFor="review-main" className="text-xs">Review Main Title</Label>
              <Input
                id="review-main"
                placeholder="e.g. What Our Customers Say"
                value={reviewMainTitle}
                onChange={(e) => setReviewMainTitle(e.target.value)}
              />
            </div>

            {/* Checkout Main Title */}
            <div className="space-y-1.5">
              <Label htmlFor="checkout-main" className="text-xs">Checkout Main Title</Label>
              <Input
                id="checkout-main"
                placeholder="e.g. Order Now & Get it Fast"
                value={checkoutMainTitle}
                onChange={(e) => setCheckoutMainTitle(e.target.value)}
              />
            </div>

            {/* YouTube Video URL */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="yt-url" className="text-xs flex items-center gap-1">
                <Video className="size-3" /> YouTube Video URL
              </Label>
              <Input
                id="yt-url"
                placeholder="https://youtube.com/watch?v=…"
                value={youtubeVideoUrl}
                onChange={(e) => setYoutubeVideoUrl(e.target.value)}
              />
            </div>
        </div>
      </SectionCard>

      {/* ── Home & Feature Images ── */}
      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard title="" icon={ImageIcon} description="Home Image">
          <ImageUploadBox
            id="home-image"
            label=""
            file={homeImageFile}
            preview={homeImagePreview}
            onChange={(f, p) => { setHomeImageFile(f); setHomeImagePreview(p); }}
          />
        </SectionCard>
        <SectionCard title="" icon={ImageIcon} description="Feature Image">
          <ImageUploadBox
            id="feature-image"
            label=""
            file={featureImageFile}
            preview={featureImagePreview}
            onChange={(f, p) => { setFeatureImageFile(f); setFeatureImagePreview(p); }}
          />
        </SectionCard>
      </div>

      {/* ── Features + Why Choose (side by side) ── */}
      <div className="grid gap-4 md:grid-cols-2">

        {/* Features */}
        <SectionCard
          icon={Sparkles}
          title="Features"
          description="Highlight the key features of this product."
        >
          <div className="flex flex-col gap-2.5">
            {features.map((feat, i) => (
              <div
                key={feat.id}
                className="group flex items-center gap-3 rounded-xl border bg-muted/20 p-3 transition-colors hover:bg-muted/40"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary text-[11px] font-bold">
                  {i + 1}
                </span>
                <div className="flex flex-1 flex-col gap-2">
                  <Input
                    placeholder="Feature Title"
                    value={feat.title}
                    onChange={(e) => updateFeature(feat.id, "title", e.target.value)}
                  />
                  <Input
                    placeholder="Feature Description"
                    value={feat.description}
                    onChange={(e) => updateFeature(feat.id, "description", e.target.value)}
                  />
                </div>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => removeFeature(feat.id)}
                  aria-label="Remove feature"
                  className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
            <AddRowButton label="Add Feature" onClick={addFeature} />
          </div>
        </SectionCard>

        {/* Why Choose This Product */}
        <SectionCard
          icon={Zap}
          title="Why Choose This Product"
          description="List the compelling reasons to buy."
        >
          <div className="flex flex-col gap-2.5">
            {whyChoose.map((item, i) => (
              <div
                key={item.id}
                className="group flex items-center gap-3 rounded-xl border bg-muted/20 p-3 transition-colors hover:bg-muted/40"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary text-[11px] font-bold">
                  {i + 1}
                </span>
                <Input
                  className="flex-1"
                  placeholder="e.g. Free shipping on all orders"
                  value={item.text}
                  onChange={(e) => updateWhy(item.id, e.target.value)}
                />
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => removeWhy(item.id)}
                  aria-label="Remove item"
                  className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
            <AddRowButton label="Add Reason" onClick={addWhy} />
          </div>
        </SectionCard>

      </div>

      {/* ── Reviews + Gallery (side by side) ── */}
      <div className="grid gap-4 md:grid-cols-2">

        {/* Reviews */}
        <SectionCard
        icon={Quote}
        title="Reviews"
        description="Add customer review screenshot images."
      >
        <div className="flex flex-col gap-2.5">
          <div className="grid gap-2.5 grid-cols-3 sm:grid-cols-4 md:grid-cols-5">
            {reviews.map((rev, i) => (
              <RepeatableImageUpload
                key={rev.id}
                index={i}
                file={rev.file}
                preview={rev.preview}
                onUpdate={(f, p) => updateReview(rev.id, f, p)}
                onRemove={() => removeReview(rev.id)}
              />
            ))}
          </div>
          <AddRowButton label="Add Review Image" onClick={addReview} />
        </div>
      </SectionCard>

      {/* ── Gallery ── */}
      <SectionCard
        icon={GalleryHorizontal}
        title="Gallery"
        description="Upload product gallery / lifestyle images."
      >
        <div className="flex flex-col gap-2.5">
          <div className="grid gap-2.5 grid-cols-3 sm:grid-cols-4 md:grid-cols-5">
            {gallery.map((img, i) => (
              <RepeatableImageUpload
                key={img.id}
                index={i}
                file={img.file}
                preview={img.preview}
                onUpdate={(f, p) => updateGallery(img.id, f, p)}
                onRemove={() => removeGallery(img.id)}
              />
            ))}
          </div>
          <AddRowButton label="Add Gallery Image" onClick={addGallery} />
        </div>
      </SectionCard>

      </div>

      {/* ── Fixed bottom publish bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3 min-w-0">
            {product ? (
              <>
                <div className="size-9 shrink-0 overflow-hidden rounded-lg border bg-muted">
                  <img src={product.image} alt={product.name} className="size-full object-cover" />
                </div>
                <div className="min-w-0 hidden sm:block">
                  <p className="text-sm font-medium leading-none truncate">{product.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">{product.sku}</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No product selected</p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button size="sm" onClick={handlePublish}>
              <Send className="mr-2 size-4" />
              Publish Landing Page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
