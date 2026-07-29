"use client";

import * as React from "react";

import { AddBlogDialog } from "./_components/add-blog-dialog";

import { BlogsTable } from "./_components/blogs-table";

import { useModularFeatures } from "@/hooks/useModularFeatures";

export default function BlogsPage() {
  const [refreshKey, setRefreshKey] = React.useState(0);
  const { features, isLoading } = useModularFeatures();

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (features?.blogs === false || features?.blogs === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4">
        <h2 className="text-2xl font-semibold tracking-tight text-red-500">Feature Locked</h2>
        <p className="text-muted-foreground text-center">The blogs feature is currently disabled for this account.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Blogs</h1>
          <p className="text-muted-foreground text-sm">Manage your blog articles, marketing posts, and news.</p>
        </div>
        <div className="flex items-center gap-3">
          <AddBlogDialog onCreated={handleRefresh} />
        </div>
      </div>

      <BlogsTable key={`table-${refreshKey}`} onDeleted={handleRefresh} />
    </div>
  );
}
