import { AddTestimonialDialog } from "./_components/add-testimonial-dialog";
import { TestimonialsStats } from "./_components/testimonials-stats";
import { TestimonialsTable } from "./_components/testimonials-table";

export const metadata = {
  title: "Testimonials | Dashboard",
  description: "Manage your customer reviews and feedback.",
};

export default function TestimonialsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Testimonials</h1>
          <p className="text-muted-foreground text-sm">
            Manage customer reviews and feedback displayed on your landing page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AddTestimonialDialog />
        </div>
      </div>

      <TestimonialsStats />
      <TestimonialsTable />
    </div>
  );
}
