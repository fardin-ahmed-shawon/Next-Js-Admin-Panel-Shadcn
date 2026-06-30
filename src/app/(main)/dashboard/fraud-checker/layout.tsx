import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fraud Checker | Dashboard",
  description: "Verify customer delivery history across multiple courier services",
};

export default function FraudCheckerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
