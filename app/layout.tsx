import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Last Light — A Kingdom at the Edge of Night",
  description: "Build a tiny radiant kingdom and push back the enchanted dark.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
