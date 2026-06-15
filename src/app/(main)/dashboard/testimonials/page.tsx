import { AddTestimonialDialog } from "./_components/add-testimonial-dialog";
import { TestimonialsStats } from "./_components/testimonials-stats";
import { TestimonialsTable } from "./_components/testimonials-table";

export const metadata = {
  title: "Testimonials | Dashboard",
  description: "Manage your customer reviews and feedback.",
};

async function getTestimonials() {
  let apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api/v1/admin';
  const testimonialEndpoint = process.env.NEXT_PUBLIC_API_TESTIMONIAL_URL || 'testimonials';
  
  // Also get the base app URL for images
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:8000';
  
  const baseUrl = apiUrl.replace(/\/$/, '');
  const url = `${baseUrl}/${testimonialEndpoint}`;
  
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch testimonials`);
    }
    
    const result = await response.json();
    
    let testimonialsData = [];
    if (result.success && result.data) {
      testimonialsData = Array.isArray(result.data) ? result.data : [];
    }
    
    // Transform to match frontend format with full image URL
    return testimonialsData.map((testimonial: any) => ({
      id: testimonial.id?.toString(),
      name: testimonial.user_name,
      position: testimonial.user_position || '',
      // Fix image URL - prepend app URL if it's a relative path
      photo: testimonial.user_photo 
        ? testimonial.user_photo.startsWith('http') 
          ? testimonial.user_photo 
          : `${appUrl}/${testimonial.user_photo.replace(/^\//, '')}`
        : 'https://i.pravatar.cc/150',
      rating: testimonial.ratings || 5,
      text: testimonial.testimonial_text,
    }));
    
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
}

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

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

      <TestimonialsStats testimonials={testimonials} />
      <TestimonialsTable initialTestimonials={testimonials} />
    </div>
  );
}