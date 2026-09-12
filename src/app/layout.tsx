import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FCAI Courses",
  description: "Course information and exploration platform",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
