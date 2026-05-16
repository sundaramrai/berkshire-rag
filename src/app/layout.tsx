import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Berkshire Hathaway Intelligence",
  description:
    "A Mastra-powered RAG application for exploring Warren Buffett's shareholder letters from 1977 to 2024.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
