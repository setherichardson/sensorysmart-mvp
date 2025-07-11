import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PWAServiceWorker from "./components/PWAServiceWorker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Add Mona Sans font
const monaSans = {
  variable: "--font-mona-sans",
  style: "normal",
  weight: "400",
  src: "url('https://fonts.cdnfonts.com/css/mona-sans')",
};

export const metadata: Metadata = {
  title: "SensorySmart - Sensory Support for Children",
  description: "Discover your child's unique sensory needs and get personalized activities to help them thrive. Science-based assessments and expert guidance.",
  keywords: ["sensory processing", "child development", "parenting", "occupational therapy", "sensory activities"],
  authors: [{ name: "SensorySmart Team" }],
  creator: "SensorySmart",
  publisher: "SensorySmart",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "SensorySmart - Sensory Support for Children",
    description: "Discover your child's unique sensory needs and get personalized activities to help them thrive.",
    url: '/',
    siteName: 'SensorySmart',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SensorySmart - Sensory Support for Children',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "SensorySmart - Sensory Support for Children",
    description: "Discover your child's unique sensory needs and get personalized activities to help them thrive.",
    images: ['/og-image.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SensorySmart',
  },
  applicationName: 'SensorySmart',
  manifest: '/manifest.json',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'SensorySmart',
    'application-name': 'SensorySmart',
    'msapplication-TileColor': '#2563eb',
    'msapplication-tap-highlight': 'no',
    'theme-color': '#2563eb',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SensorySmart" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        {/* <PWAServiceWorker /> */}
      </body>
    </html>
  );
}
