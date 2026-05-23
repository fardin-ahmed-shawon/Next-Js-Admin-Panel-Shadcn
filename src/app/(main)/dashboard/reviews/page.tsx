import { AddReviewDialog } from "./_components/add-review-dialog";
import { ReviewsStats } from "./_components/reviews-stats";
import { ReviewsTable } from "./_components/reviews-table";

export const metadata = {
  title: "Reviews | Dashboard",
  description: "Manage customer reviews and product ratings.",
};

export default function ReviewsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Reviews</h1>
          <p className="text-muted-foreground text-sm">
            Manage product reviews, ratings, and customer feedback.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AddReviewDialog />
        </div>
      </div>

      <ReviewsStats />
      <ReviewsTable />
    </div>
  );
}
