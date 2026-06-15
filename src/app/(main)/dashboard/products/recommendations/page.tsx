import { AddRecommendationDialog } from "./_components/add-recommendation-dialog";
import { RecommendationsStats } from "./_components/recommendations-stats";
import { RecommendationsTable } from "./_components/recommendations-table";

export const metadata = {
  title: "Product Recommendations | Admin Panel",
  description: "Manage custom product recommendations for cross-selling and up-selling.",
};

export default function ProductRecommendationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Product Recommendations</h1>
          <p className="text-muted-foreground text-sm">
            Define which products are recommended alongside a given product for cross-selling and up-selling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AddRecommendationDialog />
        </div>
      </div>

      <RecommendationsStats />
      <RecommendationsTable />
    </div>
  );
}
