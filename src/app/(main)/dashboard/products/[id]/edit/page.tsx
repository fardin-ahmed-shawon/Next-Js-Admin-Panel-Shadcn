import { use } from "react";

import { EditProductForm } from "./_components/edit-product-form";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="flex flex-col gap-6">
      <EditProductForm productId={id} />
    </div>
  );
}
