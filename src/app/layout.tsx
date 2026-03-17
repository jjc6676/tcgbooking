import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import OfflineBanner from "@/components/OfflineBanner";
import PWARegister from "@/components/PWARegister";

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
  themeColor: "#513b3c",
};

export const metadata: Metadata = {
  title: {
    default: "Book with Keri Choplin · Lafayette, LA",
    template: "%s · Keri Choplin",
  },
  description:
    "Book your salon appointment with Keri Choplin — luxury hair color, cuts, and treatments in Lafayette, Louisiana.",
  applicationName: "Keri Choplin Studio",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Keri Choplin Studio",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/icon-192.png",
  },
  openGraph: {
    title: "Book with Keri Choplin · Lafayette, LA",
    description: "Luxury hair · 20+ years experience · Color specialist · Lafayette, Louisiana",
    type: "website",
    url: "https://tcgbooking.vercel.app",
    siteName: "Keri Choplin Studio",
  },
  twitter: {
    card: "summary",
    title: "Book with Keri Choplin · Lafayette, LA",
    description: "Luxury hair · Color specialist · Lafayette, Louisiana",
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
