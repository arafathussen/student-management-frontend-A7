import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Universities",
};

export default function UniversitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
