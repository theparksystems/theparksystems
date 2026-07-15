import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://theparksystems-production.up.railway.app"),
  title: "The Park Systems | ARIA Analyst Picks",
  description: "Mobile analyst picks for crude oil, silver, and real estate.",
  applicationName: "The Park Systems",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ARIA Picks",
  },
  openGraph: {
    title: "The Park Systems | ARIA Analyst Picks",
    description:
      "ARIA analyst slate with deployment-local PARKS SQLite memory.",
    url: "https://theparksystems-production.up.railway.app",
    siteName: "The Park Systems",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "ARIA analyst picks by The Park Systems",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Park Systems | ARIA Analyst Picks",
    description:
      "ARIA analyst slate with deployment-local PARKS SQLite memory.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#07110f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8Z2K5Z78LW"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8Z2K5Z78LW');
          `}
        </Script>
      </body>
    </html>
  );
}
