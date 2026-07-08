"use client";

import * as React from "react";

import { Calendar, Loader2, PlaySquare, Plus, Trash2, Video, Search, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useHomePageVideos } from "@/hooks/useHomePageVideos";
import { useProductSearch } from "@/hooks/useProductSearch";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:8000";

const getFullImageUrl = (imagePath: string) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  const cleanPath = imagePath.replace(/^\/+/, "");
  let appUrl = APP_URL;
  if (!appUrl.endsWith("/")) appUrl += "/";
  return `${appUrl}${cleanPath}`;
};

// Helper to extract YouTube video ID from various YouTube URL formats
function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// Helper to format date strings
function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function HomePageVideosPage() {
  const { videos, isLoading, error, addVideo, deleteVideo } = useHomePageVideos();
  const [videoUrl, setVideoUrl] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);

  // Product search and selection states
  const [selectedProductId, setSelectedProductId] = React.useState<number | null>(null);
  const [selectedProductTitle, setSelectedProductTitle] = React.useState<string>("");
  const [selectedProductImage, setSelectedProductImage] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const { products: searchedProducts, isLoading: isSearching } = useProductSearch(searchQuery);

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await deleteVideo(id);
      toast.success("Home page video deleted successfully!");
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to delete video";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoUrl.trim()) {
      toast.error("Video URL is required");
      return;
    }

    // Basic URL validation
    if (!videoUrl.startsWith("http://") && !videoUrl.startsWith("https://")) {
      toast.error("Please enter a valid URL starting with http:// or https://");
      return;
    }

    if (!selectedProductId) {
      toast.error("Please select a product for the video");
      return;
    }

    try {
      setIsSubmitting(true);
      await addVideo(videoUrl.trim(), selectedProductId);
      toast.success("Home page video added successfully!");
      setVideoUrl("");
      setSelectedProductId(null);
      setSelectedProductTitle("");
      setSelectedProductImage("");
      setSearchQuery("");
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to add video";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header section */}
      <div className="space-y-1">
        <h1 className="font-medium text-3xl tracking-tight">Home Page Videos</h1>
        <p className="text-muted-foreground text-sm">
          Add and manage YouTube and streaming video URLs featured on your public home page.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* Add video form card */}
        <Card className="border border-border shadow-xs lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Plus className="size-5 text-primary" />
              Add New Video
            </CardTitle>
            <CardDescription>Input the video link to add it to the home page carousel or player.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="video-url">YouTube/Video URL</Label>
                <Input
                  id="video-url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  disabled={isSubmitting}
                />
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Supports YouTube watch links (e.g. youtube.com/watch?v=...) and short links (youtu.be/...).
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="product">Connect Product</Label>
                {selectedProductId ? (
                  <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3 animate-in fade-in duration-200">
                    {selectedProductImage ? (
                      <img
                        src={getFullImageUrl(selectedProductImage)}
                        alt={selectedProductTitle}
                        className="size-14 rounded-md object-cover border shrink-0 bg-background"
                      />
                    ) : (
                      <div className="flex size-14 items-center justify-center rounded-md border bg-muted text-muted-foreground shrink-0">
                        <MessageSquare className="size-6" />
                      </div>
                    )}
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="text-sm font-semibold leading-tight truncate" title={selectedProductTitle}>
                        {selectedProductTitle}
                      </span>
                      <span className="text-xs text-muted-foreground">ID: PRD-{selectedProductId}</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 text-xs"
                      onClick={() => {
                        setSelectedProductId(null);
                        setSelectedProductTitle("");
                        setSelectedProductImage("");
                        setSearchQuery("");
                      }}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="relative flex flex-col gap-1.5">
                    <div className="relative">
                      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="product"
                        className="pl-8"
                        placeholder="Search product by title or SKU..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>

                    {searchQuery.trim().length > 0 && (
                      <div className="z-10 mt-1 max-h-56 overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md">
                        {isSearching ? (
                          <div className="px-3 py-2 text-sm text-muted-foreground text-center">Searching products...</div>
                        ) : searchedProducts.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-muted-foreground text-center">No products found</div>
                        ) : (
                          <div className="p-1">
                            {searchedProducts.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                className="flex w-full min-w-0 items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent transition-colors"
                                onClick={() => {
                                  setSelectedProductId(p.id);
                                  setSelectedProductTitle(p.title || `Product #${p.id}`);
                                  setSelectedProductImage(p.product_thumbnail_img || "");
                                  setSearchQuery("");
                                }}
                              >
                                {p.product_thumbnail_img ? (
                                  <img
                                    src={getFullImageUrl(p.product_thumbnail_img)}
                                    alt={p.title}
                                    className="size-8 rounded object-cover border shrink-0 bg-background"
                                  />
                                ) : (
                                  <div className="flex size-8 items-center justify-center rounded border bg-muted text-muted-foreground shrink-0">
                                    <MessageSquare className="size-4" />
                                  </div>
                                )}
                                <div className="flex flex-col flex-1 min-w-0">
                                  <span className="block truncate font-medium text-sm" title={p.title}>
                                    {p.title}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">ID: {p.id}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Adding Video...
                  </>
                ) : (
                  <>
                    <Video className="size-4" />
                    Add Video
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing videos display list card */}
        <Card className="border border-border shadow-xs lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <PlaySquare className="size-5 text-primary" />
                Active Videos
              </CardTitle>
              <CardDescription>List of all videos currently configured for the home page.</CardDescription>
            </div>
            <div className="rounded-full bg-secondary px-2.5 py-1 font-semibold text-secondary-foreground text-xs">
              {videos.length} Total
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[550px] pr-4">
              {isLoading ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-3 rounded-lg border p-4">
                      <Skeleton className="aspect-video w-full rounded-md" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="py-16 text-center font-medium text-destructive text-sm">
                  Failed to load home page videos.
                </div>
              ) : videos.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed bg-muted/10 p-6 py-20 text-muted-foreground">
                  <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                    <Video className="size-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="font-semibold text-sm">No home page videos configured</p>
                    <p className="text-xs">Provide a streaming URL on the left panel to upload.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {videos.map((video) => {
                    const youtubeId = getYouTubeId(video.vdo_url);
                    return (
                      <Card key={video.id} className="overflow-hidden border bg-card transition-shadow hover:shadow-md">
                        <div className="relative flex aspect-video items-center justify-center bg-black">
                          {youtubeId ? (
                            <iframe
                              src={`https://www.youtube.com/embed/${youtubeId}`}
                              className="absolute inset-0 size-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title={`YouTube Video player ${video.id}`}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground">
                              <PlaySquare className="size-10 text-muted-foreground" />
                              <span className="line-clamp-2 break-all px-3 text-xs leading-tight">{video.vdo_url}</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2 p-3.5">
                          <div className="min-w-0">
                            <Label className="font-semibold text-muted-foreground text-xs">Video URL</Label>
                            <a
                              href={video.vdo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-0.5 block break-all text-primary text-xs leading-tight hover:underline"
                            >
                              {video.vdo_url}
                            </a>
                          </div>
                          {video.product && (
                            <div className="flex items-center gap-2.5 rounded-md border bg-muted/25 p-2">
                              {video.product.product_thumbnail_img ? (
                                <img
                                  src={getFullImageUrl(video.product.product_thumbnail_img)}
                                  alt={video.product.title}
                                  className="size-10 rounded object-cover border shrink-0 bg-background"
                                />
                              ) : (
                                <div className="flex size-10 items-center justify-center rounded border bg-muted text-muted-foreground shrink-0">
                                  <MessageSquare className="size-4" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold truncate leading-tight" title={video.product.title}>
                                  {video.product.title}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] text-muted-foreground font-mono">ID: {video.product.id}</span>
                                  <span className="text-[10px] font-semibold text-primary">৳{video.product.selling_price}</span>
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center justify-between border-t pt-1.5">
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                              <Calendar className="size-3" />
                              <span>Added: {formatDate(video.created_at)}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleDelete(video.id)}
                              disabled={deletingId === video.id}
                            >
                              {deletingId === video.id ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                <Trash2 className="size-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
