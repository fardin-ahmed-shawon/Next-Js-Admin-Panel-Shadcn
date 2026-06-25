"use client";

import * as React from "react";

import { Calendar, Loader2, PlaySquare, Plus, Trash2, Video } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useHomePageVideos } from "@/hooks/useHomePageVideos";

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

    try {
      setIsSubmitting(true);
      await addVideo(videoUrl.trim());
      toast.success("Home page video added successfully!");
      setVideoUrl("");
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
