import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Success Stories",
};

export default function SuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
