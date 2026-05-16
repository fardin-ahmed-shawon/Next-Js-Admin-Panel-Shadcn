import { use } from "react";

import { ProductDetails } from "./_components/product-details";

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ProductDetails productId={id} />;
}
