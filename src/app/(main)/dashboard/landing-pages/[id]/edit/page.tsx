import { CreateLandingPageForm } from "../../create/_components/create-landing-page-form";

export default async function EditLandingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CreateLandingPageForm pageId={id} />;
}
