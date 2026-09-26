import BundleForm from "../../_components/bundle-form";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BundleForm bundleId={id} />;
}
