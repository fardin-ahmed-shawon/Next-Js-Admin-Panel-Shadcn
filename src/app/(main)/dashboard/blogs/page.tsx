import { AddBlogDialog } from "./_components/add-blog-dialog";
import { BlogsStats } from "./_components/blogs-stats";
import { BlogsTable } from "./_components/blogs-table";

export default function BlogsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Blogs</h1>
          <p className="text-muted-foreground text-sm">Manage your blog articles, marketing posts, and news.</p>
        </div>

        <div className="flex items-center gap-3">
          <AddBlogDialog />
        </div>
      </div>

      <BlogsStats />
      <BlogsTable />
    </div>
  );
}
