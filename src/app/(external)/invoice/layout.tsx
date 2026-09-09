import { FeatureGuard } from "@/components/feature-guard";

export default function InvoiceFeatureLayout({ children }: { children: React.ReactNode }) {
  return <FeatureGuard>{children}</FeatureGuard>;
}
