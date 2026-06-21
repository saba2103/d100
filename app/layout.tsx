import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Barlow_Condensed } from "next/font/google";
import "./globals.css";

// ── Fonts ──────────────────────────────────────────────────────────
const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// ── Metadata ───────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "D100 — Your 100-Day Transformation",
    template: "%s | D100",
  },
  description:
    "Track your 100-day fitness journey: workouts, nutrition, body stats, hydration, and more.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "D100",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    title: "D100",
    description: "Your 100-day fitness transformation tracker",
    siteName: "D100",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

// ── Root Layout ────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${barlowCondensed.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/icons/icon-192.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>{children}</body>
    </html>
  );
}
