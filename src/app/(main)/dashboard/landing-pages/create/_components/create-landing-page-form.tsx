"use client";

import { useEffect, useId, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchClient } from "@/lib/fetch-client";
import { type LandingPage, landingImage, landingPublicUrl, landingRequest } from "@/lib/landing-pages";

type ImageValue = { path: string; file?: File };
type ImageRow = ImageValue & { key: string };
type Feature = { key: string; title: string; description: string };
type Benefit = { key: string; why_choose_text: string };
const uid = () => crypto.randomUUID();
const empty = {
  product_id: 0,
  slug: "",
  status: "draft" as "draft" | "published",
  home_title: "",
  home_description: "",
  features_main_title: "",
  why_choose_main_title: "",
  why_choose_bottom_title: "",
  review_main_title: "",
  checkout_main_title: "",
  yt_link: "",
};

function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ImageValue;
  onChange: (value: ImageValue) => void;
}) {
  const inputId = useId();
  const [preview, setPreview] = useState("");
  useEffect(() => {
    if (!value.file) {
      setPreview(landingImage(value.path));
      return;
    }
    const url = URL.createObjectURL(value.file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value.file, value.path]);
  return (
    <label htmlFor={inputId} className="flex flex-col gap-2 font-medium text-sm">
      {label}
      <div className="flex min-h-36 items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/30">
        {preview ? (
          <img src={preview} alt={label} className="h-40 w-full object-contain" />
        ) : (
          <ImagePlus className="size-8 text-muted-foreground" />
        )}
      </div>
      <Input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          if (file.size > 5 * 1024 * 1024) {
            toast.error("Images must be 5 MB or smaller.");
            event.target.value = "";
            return;
          }
          onChange({ path: "", file });
        }}
      />
      <span className="font-normal text-muted-foreground text-xs">JPG, PNG, WebP or GIF · up to 5 MB</span>
    </label>
  );
}

function RowActions({
  index,
  count,
  move,
  remove,
}: {
  index: number;
  count: number;
  move: (direction: number) => void;
  remove: () => void;
}) {
  return (
    <div className="flex justify-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Move up"
        disabled={index === 0}
        onClick={() => move(-1)}
      >
        <ArrowUp className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Move down"
        disabled={index === count - 1}
        onClick={() => move(1)}
      >
        <ArrowDown className="size-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" aria-label="Remove item" onClick={remove}>
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </div>
  );
}
function moved<T>(rows: T[], index: number, direction: number) {
  const next = [...rows];
  [next[index], next[index + direction]] = [next[index + direction], next[index]];
  return next;
}

export function CreateLandingPageForm({ pageId }: { pageId?: string }) {
  const router = useRouter();
  const [fields, setFields] = useState(empty);
  const [homeImage, setHomeImage] = useState<ImageValue>({ path: "" });
  const [featureImage, setFeatureImage] = useState<ImageValue>({ path: "" });
  const [features, setFeatures] = useState<Feature[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [gallery, setGallery] = useState<ImageRow[]>([]);
  const [reviews, setReviews] = useState<ImageRow[]>([]);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<{ id: number; title: string; sku: string }[]>([]);
  const [productName, setProductName] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [loading, setLoading] = useState(!!pageId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!pageId) return;
    const controller = new AbortController();
    landingRequest(`/${pageId}`, { signal: controller.signal })
      .then(({ data }: { data: LandingPage }) => {
        setFields(
          Object.fromEntries(
            Object.keys(empty).map((key) => [key, data[key as keyof typeof empty] ?? empty[key as keyof typeof empty]]),
          ) as typeof empty,
        );
        setProductName(data.product?.title || `Product #${data.product_id}`);
        setHomeImage({ path: data.home_img });
        setFeatureImage({ path: data.feature_img });
        setFeatures(data.features.map((row) => ({ ...row, key: uid() })));
        setBenefits(data.why_choose_products.map((row) => ({ ...row, key: uid() })));
        setGallery(data.gallery.map((row) => ({ path: row.img, key: uid() })));
        setReviews(data.reviews.map((row) => ({ path: row.img, key: uid() })));
        setLoading(false);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setLoadError(err.message);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [pageId]);

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    setSearching(true);
    setSearchError("");
    const timer = setTimeout(async () => {
      try {
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
        const res = await fetchClient(`${base}/products?per_page=20&search=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Product search failed. Please try again.");
        const result = await res.json();
        setProducts(result.data.data);
      } catch (err) {
        if (!controller.signal.aborted) setSearchError((err as Error).message);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function field(key: keyof typeof empty, value: string | number) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    setError("");
    if (!fields.product_id) {
      setError("Select a product first.");
      return;
    }
    if ((!homeImage.path && !homeImage.file) || (!featureImage.path && !featureImage.file)) {
      setError("Upload both the hero and feature images.");
      return;
    }
    const newFiles = [homeImage, featureImage, ...gallery, ...reviews].flatMap((image) =>
      image.file ? [image.file] : [],
    );
    if (newFiles.length > 20 || newFiles.reduce((size, file) => size + file.size, 0) > 35 * 1024 * 1024) {
      setError(
        "Upload up to 20 new images (35 MB total) per save. Save this batch first, then add more images by editing the page.",
      );
      return;
    }
    const body = new FormData();
    let fileIndex = 0;
    const serializeImage = (image: ImageValue) => {
      if (!image.file) return image.path;
      const key = `image_${fileIndex++}`;
      body.append(`uploads[${key}]`, image.file);
      return `upload:${key}`;
    };
    body.append(
      "payload",
      JSON.stringify({
        ...fields,
        home_img: serializeImage(homeImage),
        feature_img: serializeImage(featureImage),
        features: features.map(({ title, description }) => ({ title, description })),
        why_choose_products: benefits.map(({ why_choose_text }) => ({ why_choose_text })),
        gallery: gallery.map((row) => ({ img: serializeImage(row) })),
        reviews: reviews.map((row) => ({ img: serializeImage(row) })),
      }),
    );
    if (pageId) body.append("_method", "PUT");
    setSaving(true);
    try {
      await landingRequest(pageId ? `/${pageId}` : "", { method: "POST", body });
      toast.success(fields.status === "published" ? "Landing page published." : "Draft saved.");
      router.push("/dashboard/landing-pages");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <p role="status" className="p-8">
        Loading landing page…
      </p>
    );
  if (loadError)
    return (
      <div role="alert" className="p-8 text-destructive">
        {loadError} <Link href="/dashboard/landing-pages">Back to landing pages</Link>
      </div>
    );
  const textFields = [
    ["features_main_title", "Features heading"],
    ["why_choose_main_title", "Why choose this product heading"],
    ["why_choose_bottom_title", "Why choose closing title"],
    ["review_main_title", "Reviews heading"],
    ["checkout_main_title", "Order section heading"],
  ] as const;
  return (
    <form onSubmit={save} className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl tracking-tight">{pageId ? "Edit Landing Page" : "Create Landing Page"}</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Tell your product’s story and turn visitors into customers.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/landing-pages">All landing pages</Link>
        </Button>
      </div>
      <fieldset disabled={saving} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Choose one product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {productName && (
              <div className="rounded-lg border bg-muted/40 p-3 font-medium">
                {productName} <span className="text-muted-foreground text-sm">(#{fields.product_id})</span>
              </div>
            )}
            <label htmlFor="search-products-by-title-or-sku" className="block space-y-2 font-medium text-sm">
              <span>Search products by title or SKU</span>
              <Input
                id="search-products-by-title-or-sku"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Start typing a product name…"
              />
            </label>
            {searching && (
              <p role="status" className="text-sm">
                Searching…
              </p>
            )}
            {searchError && (
              <p role="alert" className="text-destructive text-sm">
                {searchError}
              </p>
            )}
            {!searching && query.trim() && !products.length && !searchError && (
              <p className="text-sm">No products found.</p>
            )}
            {!!products.length && (
              <div className="max-h-64 overflow-auto rounded-lg border">
                {products.map((product) => (
                  <button
                    type="button"
                    key={product.id}
                    className="block w-full border-b p-3 text-left hover:bg-muted"
                    onClick={() => {
                      field("product_id", product.id);
                      setProductName(product.title);
                      setQuery("");
                    }}
                  >
                    {product.title} <span className="text-muted-foreground">{product.sku}</span>
                  </button>
                ))}
              </div>
            )}
            <p className="text-muted-foreground text-sm">
              Prices, color/size options, variant images and available stock stay linked to this product automatically.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>2. Hero & publishing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label htmlFor="hero-title" className="block space-y-2 font-medium text-sm">
              <span>Hero title *</span>
              <Input
                id="hero-title"
                required
                maxLength={255}
                value={fields.home_title}
                onChange={(e) => field("home_title", e.target.value)}
              />
            </label>
            <label htmlFor="hero-description" className="block space-y-2 font-medium text-sm">
              <span>Hero description *</span>
              <Textarea
                id="hero-description"
                required
                rows={4}
                maxLength={20000}
                value={fields.home_description}
                onChange={(e) => field("home_description", e.target.value)}
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label htmlFor="page-url-slug" className="space-y-2 font-medium text-sm">
                <span>Page URL slug *</span>
                <Input
                  id="page-url-slug"
                  required
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  maxLength={200}
                  placeholder="your-product-offer"
                  value={fields.slug}
                  onChange={(e) => field("slug", e.target.value)}
                />
                <span className="block break-all text-muted-foreground text-xs">
                  {landingPublicUrl(fields.slug) || `/landing/${fields.slug || "your-product-offer"}`}
                </span>
              </label>
              <label htmlFor="visibility" className="space-y-2 font-medium text-sm">
                <span>Visibility</span>
                <select
                  id="visibility"
                  className="h-9 w-full rounded-md border bg-background px-3"
                  value={fields.status}
                  onChange={(e) => field("status", e.target.value)}
                >
                  <option value="draft">Draft — hidden from visitors</option>
                  <option value="published">Published — public</option>
                </select>
              </label>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <ImageField label="Hero image *" value={homeImage} onChange={setHomeImage} />
              <ImageField label="Feature image *" value={featureImage} onChange={setFeatureImage} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>3. Section headings & video</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {textFields.map(([key, label]) => (
              <label htmlFor={key} key={key} className="space-y-2 font-medium text-sm">
                <span>{label}</span>
                <Input id={key} maxLength={255} value={fields[key]} onChange={(e) => field(key, e.target.value)} />
              </label>
            ))}
            <label htmlFor="youtube-video-url" className="space-y-2 font-medium text-sm">
              <span>YouTube video URL</span>
              <Input
                id="youtube-video-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=…"
                value={fields.yt_link}
                onChange={(e) => field("yt_link", e.target.value)}
              />
            </label>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>4. Product features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {features.map((row, index) => (
              <div key={row.key} className="space-y-3 rounded-lg border p-4">
                <RowActions
                  index={index}
                  count={features.length}
                  move={(d) => setFeatures(moved(features, index, d))}
                  remove={() => setFeatures(features.filter((r) => r.key !== row.key))}
                />
                <label htmlFor={`feature-title-${row.key}`} className="block space-y-2 text-sm">
                  <span>Feature title *</span>
                  <Input
                    id={`feature-title-${row.key}`}
                    required
                    maxLength={255}
                    value={row.title}
                    onChange={(e) =>
                      setFeatures(features.map((r) => (r.key === row.key ? { ...r, title: e.target.value } : r)))
                    }
                  />
                </label>
                <label htmlFor={`feature-description-${row.key}`} className="block space-y-2 text-sm">
                  <span>Description *</span>
                  <Textarea
                    id={`feature-description-${row.key}`}
                    required
                    maxLength={5000}
                    value={row.description}
                    onChange={(e) =>
                      setFeatures(features.map((r) => (r.key === row.key ? { ...r, description: e.target.value } : r)))
                    }
                  />
                </label>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              disabled={features.length >= 50}
              onClick={() => setFeatures([...features, { key: uid(), title: "", description: "" }])}
            >
              <Plus className="mr-2 size-4" />
              Add feature
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>5. Why choose this product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {benefits.map((row, index) => (
              <div key={row.key} className="rounded-lg border p-4">
                <RowActions
                  index={index}
                  count={benefits.length}
                  move={(d) => setBenefits(moved(benefits, index, d))}
                  remove={() => setBenefits(benefits.filter((r) => r.key !== row.key))}
                />
                <label htmlFor={`benefit-${row.key}`} className="block space-y-2 text-sm">
                  <span>Benefit *</span>
                  <Textarea
                    id={`benefit-${row.key}`}
                    required
                    maxLength={5000}
                    value={row.why_choose_text}
                    onChange={(e) =>
                      setBenefits(
                        benefits.map((r) => (r.key === row.key ? { ...r, why_choose_text: e.target.value } : r)),
                      )
                    }
                  />
                </label>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              disabled={benefits.length >= 50}
              onClick={() => setBenefits([...benefits, { key: uid(), why_choose_text: "" }])}
            >
              <Plus className="mr-2 size-4" />
              Add benefit
            </Button>
          </CardContent>
        </Card>
        {[
          { title: "6. Gallery", rows: gallery, setter: setGallery },
          { title: "7. Customer review screenshots", rows: reviews, setter: setReviews },
        ].map(({ title, rows, setter }) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rows.map((row, index) => (
                  <div key={row.key} className="rounded-lg border p-3">
                    <RowActions
                      index={index}
                      count={rows.length}
                      move={(d) => setter(moved(rows, index, d))}
                      remove={() => setter(rows.filter((r) => r.key !== row.key))}
                    />
                    <ImageField
                      label={`Image ${index + 1}`}
                      value={row}
                      onChange={(image) => setter(rows.map((r) => (r.key === row.key ? { ...image, key: r.key } : r)))}
                    />
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={rows.length >= 30}
                onClick={() => setter([...rows, { key: uid(), path: "" }])}
              >
                <Plus className="mr-2 size-4" />
                Add image
              </Button>
            </CardContent>
          </Card>
        ))}
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-destructive bg-destructive/5 p-4 text-destructive text-sm"
          >
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
            {saving ? "Saving…" : fields.status === "published" ? "Save & publish" : "Save draft"}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
