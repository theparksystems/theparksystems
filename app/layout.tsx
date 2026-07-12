import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://theparksystems-production.up.railway.app"),
  title: "The Park Systems | Bounty Cell Operations",
  description:
    "Military-grade bug bounty automation. Autonomous teams that hunt 24/7.",
  openGraph: {
    title: "The Park Systems | Bounty Cell Operations",
    description:
      "Military-grade bug bounty automation. Autonomous teams that hunt 24/7.",
    url: "https://theparksystems-production.up.railway.app",
    siteName: "The Park Systems",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Bounty Cell Operations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Park Systems | Bounty Cell Operations",
    description:
      "Military-grade bug bounty automation. Autonomous teams that hunt 24/7.",
    images: ["/opengraph-image"],
  },
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
