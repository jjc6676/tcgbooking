import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import OfflineBanner from "@/components/OfflineBanner";
import PWARegister from "@/components/PWARegister";
import { STUDIO } from "@/config/studio";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#9b6f6f",
};

export const metadata: Metadata = {
  title: {
    default: `Book with ${STUDIO.ownerName} · Lafayette, LA`,
    template: `%s · ${STUDIO.ownerName}`,
  },
  description:
    `Book your salon appointment with ${STUDIO.ownerName} — luxury hair color, cuts, and treatments in ${STUDIO.location}.`,
  applicationName: STUDIO.name,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: STUDIO.name,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/icon-192.png",
  },
  openGraph: {
    title: `Book with ${STUDIO.ownerName} · Lafayette, LA`,
    description: `Luxury hair · 20+ years experience · Color specialist · ${STUDIO.location}`,
    type: "website",
    url: STUDIO.appUrl,
    siteName: STUDIO.name,
  },
  twitter: {
    card: "summary",
    title: `Book with ${STUDIO.ownerName} · Lafayette, LA`,
    description: `Luxury hair · Color specialist · ${STUDIO.location}`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="KCS" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="antialiased">
        <OfflineBanner />
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
