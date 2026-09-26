"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";

export function ReturnProductThumbnail({ src, title }: { src?: string | null; title: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";
  const url = src ? (/^https?:\/\//i.test(src) ? src : base + "/" + src.replace(/^\//, "")) : null;
  return (
    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
      {url && failedSrc !== url ? (
        <img
          src={url}
          alt={title}
          loading="lazy"
          className="size-full object-cover"
          onError={() => setFailedSrc(url)}
        />
      ) : (
        <ImageIcon className="size-5 text-muted-foreground" aria-label="No product image" />
      )}
    </div>
  );
}
